# HK Gemini Fortune Service Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有排盘项目中新增“香港后端 + Vertex AI Gemini + 微信 H5 支付 + 追问次数 + 咨询/商品推荐位”的最小可用商业化链路。

**Architecture:** 现有 `React + Vite` 前端继续本地生成排盘，并通过统一的 `fortunePayload` 调用新建的 Node API。API 部署到香港，负责支付、权益、Gemini 调用、推荐位分发与日志审计。前端只负责呈现和交互，所有可信状态以后端为准。

**Tech Stack:** React 19、Vite 7、Ant Design 6、Node.js 20+、Express、PostgreSQL、Vertex AI Node SDK、微信支付 API v3、Vitest、Supertest

---

### Task 1: 搭建 API 基础运行时

**Files:**
- Modify: `package.json`
- Create: `server/app.js`
- Create: `server/server.js`
- Create: `server/routes/healthRoutes.js`
- Test: `test/server/health.test.js`

**Step 1: 安装 API 和测试依赖**

Run:

```bash
npm install express cors dotenv zod pino pino-http pg @google-cloud/vertexai
npm install -D vitest supertest jsdom @testing-library/react @testing-library/jest-dom
```

Expected: `package.json` 和 `package-lock.json` 更新，命令成功退出。

**Step 2: 写失败的健康检查测试**

```js
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';

describe('GET /api/health', () => {
  it('returns ok status', async () => {
    const app = createApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
```

**Step 3: 写最小运行时实现**

```js
// server/app.js
import cors from 'cors';
import express from 'express';
import { registerHealthRoutes } from './routes/healthRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  registerHealthRoutes(app);

  return app;
}
```

```json
// package.json
{
  "scripts": {
    "dev:api": "node --watch server/server.js",
    "test": "vitest run"
  }
}
```

```js
// server/routes/healthRoutes.js
export function registerHealthRoutes(app) {
  app.get('/api/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
  });
}
```

```js
// server/server.js
import { createApp } from './app.js';

const port = Number(process.env.PORT || 8787);
const app = createApp();

app.listen(port, () => {
  console.log(`[Api] listening on port ${port}`);
});
```

**Step 4: 运行测试确认通过**

Run:

```bash
npx vitest run test/server/health.test.js
```

Expected: `1 passed`

**Step 5: Commit**

```bash
git add package.json package-lock.json server/app.js server/server.js server/routes/healthRoutes.js test/server/health.test.js
git commit -m "feat(api): bootstrap hk backend runtime"
```

### Task 2: 增加环境配置、请求日志和统一错误响应

**Files:**
- Create: `server/config/env.js`
- Create: `server/config/logger.js`
- Create: `server/middleware/errorHandler.js`
- Create: `server/middleware/requestContext.js`
- Modify: `server/app.js`
- Test: `test/server/errorHandler.test.js`

**Step 1: 写失败的错误响应测试**

```js
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import express from 'express';
import { registerErrorHandler } from '../middleware/errorHandler.js';

describe('error handler', () => {
  it('returns structured json body', async () => {
    const app = express();

    app.get('/boom', () => {
      throw new Error('boom');
    });
    registerErrorHandler(app);

    const response = await request(app).get('/boom');

    expect(response.status).toBe(500);
    expect(response.body.code).toBe('INTERNAL_ERROR');
    expect(response.body.message).toBe('服务暂时不可用，请稍后重试');
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/errorHandler.test.js
```

Expected: FAIL，提示模块缺失或 `registerErrorHandler` 未定义。

**Step 3: 写最小实现**

```js
// server/config/env.js
export function readEnv() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 8787),
    vertexProjectId: process.env.VERTEX_PROJECT_ID || '',
    vertexLocation: process.env.VERTEX_LOCATION || 'asia-east2'
  };
}
```

```js
// server/middleware/errorHandler.js
export function registerErrorHandler(app) {
  app.use((error, _request, response, _next) => {
    console.error('[Api] unhandled error', error);
    response.status(500).json({
      code: 'INTERNAL_ERROR',
      message: '服务暂时不可用，请稍后重试'
    });
  });
}
```

**Step 4: 接入到 `server/app.js` 并复跑测试**

Run:

```bash
npx vitest run test/server/errorHandler.test.js test/server/health.test.js
```

Expected: 全部通过。

**Step 5: Commit**

```bash
git add server/config/env.js server/config/logger.js server/middleware/errorHandler.js server/middleware/requestContext.js server/app.js test/server/errorHandler.test.js
git commit -m "feat(api): add config logging and error middleware"
```

### Task 3: 抽取前端排盘载荷序列化层

**Files:**
- Create: `src/utils/fortunePayload.js`
- Modify: `src/App.jsx`
- Test: `test/src/utils/fortunePayload.test.js`

**Step 1: 写失败的序列化测试**

```js
import { describe, expect, it } from 'vitest';
import { buildFortunePayload } from './fortunePayload.js';

describe('buildFortunePayload', () => {
  it('builds bazi payload with stable shape', () => {
    const payload = buildFortunePayload('bazi', {
      八字: '甲子 乙丑 丙寅 丁卯',
      日主: '丙',
      性别: '男'
    });

    expect(payload.mode).toBe('bazi');
    expect(payload.summary.core).toContain('甲子');
    expect(payload.meta.gender).toBe('男');
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/src/utils/fortunePayload.test.js
```

Expected: FAIL，提示 `buildFortunePayload` 不存在。

**Step 3: 写最小实现**

```js
export function buildFortunePayload(mode, panData) {
  if (!panData || panData.error) {
    throw new Error('排盘结果不可用于 AI 解读');
  }

  if (mode === 'bazi') {
    return {
      mode,
      summary: {
        core: `${panData.八字}，日主 ${panData.日主}`
      },
      meta: {
        gender: panData.性别,
        solarDate: panData.阳历,
        lunarDate: panData.农历
      },
      raw: panData
    };
  }

  throw new Error(`暂不支持的排盘模式: ${mode}`);
}
```

**Step 4: 在 `src/App.jsx` 中接入序列化调用**

Run:

```bash
npx vitest run test/src/utils/fortunePayload.test.js
npm run build
```

Expected: 测试通过，前端构建成功。

**Step 5: Commit**

```bash
git add src/utils/fortunePayload.js test/src/utils/fortunePayload.test.js src/App.jsx
git commit -m "feat(web): add fortune payload serializer"
```

### Task 4: 封装 Vertex AI 客户端和 Prompt 组装器

**Files:**
- Create: `server/services/vertexAiClient.js`
- Create: `server/services/promptComposer.js`
- Create: `server/services/reportTemplateCatalog.js`
- Test: `test/server/vertexAiClient.test.js`

**Step 1: 写失败的模型客户端测试**

```js
import { describe, expect, it, vi } from 'vitest';
import { createVertexAiClient } from '../services/vertexAiClient.js';

describe('vertex ai client', () => {
  it('normalizes model output', async () => {
    const fakeGenerateContent = vi.fn().mockResolvedValue({
      response: {
        candidates: [
          {
            content: {
              parts: [{ text: '报告正文' }]
            }
          }
        ]
      }
    });

    const client = createVertexAiClient({
      getGenerativeModel: () => ({ generateContent: fakeGenerateContent })
    });

    const result = await client.generateText({
      model: 'gemini-2.5-pro',
      prompt: 'test'
    });

    expect(result.text).toBe('报告正文');
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/vertexAiClient.test.js
```

Expected: FAIL，提示模块缺失。

**Step 3: 写最小实现**

```js
export function createVertexAiClient(vertexAi) {
  return {
    async generateText({ model, prompt }) {
      const modelInstance = vertexAi.getGenerativeModel({ model });
      const result = await modelInstance.generateContent(prompt);
      const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!text) {
        throw new Error('Gemini 返回空内容');
      }

      return { text };
    }
  };
}
```

```js
export function composeReportPrompt({ mode, question, payload }) {
  return [
    `你是一名传统命理解读助手。`,
    `术数类型: ${mode}`,
    `用户问题: ${question || '未提供具体问题'}`,
    `排盘摘要: ${payload.summary.core}`,
    `请输出结构化解读，避免迷信功效承诺。`
  ].join('\n');
}
```

**Step 4: 运行测试确认通过**

Run:

```bash
npx vitest run test/server/vertexAiClient.test.js
```

Expected: 通过。

**Step 5: Commit**

```bash
git add server/services/vertexAiClient.js server/services/promptComposer.js server/services/reportTemplateCatalog.js test/server/vertexAiClient.test.js
git commit -m "feat(api): add vertex ai client and prompt composer"
```

### Task 5: 实现付费报告创建接口

**Files:**
- Create: `server/validators/reportSchemas.js`
- Create: `server/services/reportService.js`
- Create: `server/routes/reportRoutes.js`
- Modify: `server/app.js`
- Test: `test/server/reportRoutes.test.js`

**Step 1: 写失败的报告接口测试**

```js
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';

describe('POST /api/report/create', () => {
  it('returns report summary', async () => {
    const app = createApp({
      reportService: {
        createReport: vi.fn().mockResolvedValue({
          reportId: 'rpt_001',
          summary: '事业阶段进入调整期',
          remainingCredits: 2
        })
      }
    });

    const response = await request(app)
      .post('/api/report/create')
      .send({
        mode: 'bazi',
        question: '想看事业方向',
        payload: {
          mode: 'bazi',
          summary: { core: '甲子 乙丑 丙寅 丁卯，日主丙' },
          meta: { gender: '男' }
        }
      });

    expect(response.status).toBe(200);
    expect(response.body.reportId).toBe('rpt_001');
    expect(response.body.remainingCredits).toBe(2);
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/reportRoutes.test.js
```

Expected: FAIL。

**Step 3: 写最小实现**

```js
// server/services/reportService.js
export function createReportService({ vertexAiClient, composePrompt }) {
  return {
    async createReport({ mode, question, payload }) {
      const prompt = composePrompt({ mode, question, payload });
      const result = await vertexAiClient.generateText({
        model: 'gemini-2.5-pro',
        prompt
      });

      return {
        reportId: `rpt_${Date.now()}`,
        summary: result.text,
        remainingCredits: 2
      };
    }
  };
}
```

**Step 4: 接路由并复跑测试**

Run:

```bash
npx vitest run test/server/reportRoutes.test.js test/server/vertexAiClient.test.js
```

Expected: 通过。

**Step 5: Commit**

```bash
git add server/validators/reportSchemas.js server/services/reportService.js server/routes/reportRoutes.js server/app.js test/server/reportRoutes.test.js
git commit -m "feat(api): add paid report creation route"
```

### Task 6: 引入 PostgreSQL 持久化订单、报告和追问权益

**Files:**
- Create: `server/db/client.js`
- Create: `server/db/migrations/001_initial_schema.sql`
- Create: `server/scripts/migrate.js`
- Create: `server/repositories/reportRepository.js`
- Create: `server/repositories/orderRepository.js`
- Create: `server/repositories/followUpRepository.js`
- Test: `test/server/reportRepository.test.js`

**Step 1: 写失败的仓储测试**

```js
import { describe, expect, it, vi } from 'vitest';
import { createReportRepository } from '../repositories/reportRepository.js';

describe('report repository', () => {
  it('persists report summary', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{ id: 'rpt_001', summary: '报告摘要' }]
    });

    const repository = createReportRepository({ query });
    const result = await repository.insertReport({
      id: 'rpt_001',
      mode: 'bazi',
      summary: '报告摘要'
    });

    expect(result.id).toBe('rpt_001');
    expect(query).toHaveBeenCalled();
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/reportRepository.test.js
```

Expected: FAIL。

**Step 3: 写最小实现和初始化 SQL**

```sql
create table if not exists reports (
  id text primary key,
  user_id text,
  mode text not null,
  question text,
  summary text not null,
  full_report_markdown text,
  model_name text,
  remaining_credits integer not null default 0,
  created_at timestamptz not null default now()
);
```

```js
export function createReportRepository(db) {
  return {
    async insertReport(report) {
      const result = await db.query(
        `insert into reports (id, mode, summary) values ($1, $2, $3) returning id, summary`,
        [report.id, report.mode, report.summary]
      );

      return result.rows[0];
    }
  };
}
```

**Step 4: 运行测试并验证迁移脚本**

Run:

```bash
npx vitest run test/server/reportRepository.test.js
node server/scripts/migrate.js
```

Expected: 测试通过，迁移脚本输出成功日志。

**Step 5: Commit**

```bash
git add server/db/client.js server/db/migrations/001_initial_schema.sql server/scripts/migrate.js server/repositories/reportRepository.js server/repositories/orderRepository.js server/repositories/followUpRepository.js test/server/reportRepository.test.js
git commit -m "feat(api): add postgres persistence layer"
```

### Task 7: 接入微信支付下单与回调

**Files:**
- Create: `server/services/wechatPayClient.js`
- Create: `server/validators/orderSchemas.js`
- Create: `server/routes/orderRoutes.js`
- Modify: `server/app.js`
- Test: `test/server/orderRoutes.test.js`

**Step 1: 写失败的下单接口测试**

```js
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';

describe('POST /api/orders', () => {
  it('returns jsapi payment payload', async () => {
    const app = createApp({
      orderService: {
        createOrder: vi.fn().mockResolvedValue({
          orderId: 'ord_001',
          paymentParams: { timeStamp: '1' }
        })
      }
    });

    const response = await request(app)
      .post('/api/orders')
      .send({
        productType: 'report_unlock',
        amountFen: 490
      });

    expect(response.status).toBe(200);
    expect(response.body.orderId).toBe('ord_001');
    expect(response.body.paymentParams.timeStamp).toBe('1');
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/orderRoutes.test.js
```

Expected: FAIL。

**Step 3: 写最小实现**

```js
export function createOrderService({ wechatPayClient }) {
  return {
    async createOrder({ productType, amountFen }) {
      const paymentParams = await wechatPayClient.createJsapiOrder({
        description: productType,
        amountFen
      });

      return {
        orderId: `ord_${Date.now()}`,
        paymentParams
      };
    }
  };
}
```

**Step 4: 补回调接口并复跑测试**

Run:

```bash
npx vitest run test/server/orderRoutes.test.js
```

Expected: 通过。

**Step 5: Commit**

```bash
git add server/services/wechatPayClient.js server/validators/orderSchemas.js server/routes/orderRoutes.js server/app.js test/server/orderRoutes.test.js
git commit -m "feat(api): add wechat pay order flow"
```

### Task 8: 实现追问接口和次数扣减

**Files:**
- Create: `server/services/followUpService.js`
- Create: `server/routes/followUpRoutes.js`
- Create: `server/validators/followUpSchemas.js`
- Test: `test/server/followUpRoutes.test.js`

**Step 1: 写失败的追问测试**

```js
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app.js';

describe('POST /api/reports/:reportId/follow-up', () => {
  it('returns answer and decremented credits', async () => {
    const app = createApp({
      followUpService: {
        answerQuestion: vi.fn().mockResolvedValue({
          answer: '建议先稳后动',
          remainingCredits: 1
        })
      }
    });

    const response = await request(app)
      .post('/api/reports/rpt_001/follow-up')
      .send({ message: '今年适合换工作吗？' });

    expect(response.status).toBe(200);
    expect(response.body.remainingCredits).toBe(1);
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/followUpRoutes.test.js
```

Expected: FAIL。

**Step 3: 写最小实现**

```js
export function createFollowUpService({ vertexAiClient }) {
  return {
    async answerQuestion({ reportId, message }) {
      const result = await vertexAiClient.generateText({
        model: 'gemini-2.5-flash',
        prompt: `报告 ${reportId} 的追问: ${message}`
      });

      return {
        answer: result.text,
        remainingCredits: 1
      };
    }
  };
}
```

**Step 4: 接入路由并复跑测试**

Run:

```bash
npx vitest run test/server/followUpRoutes.test.js
```

Expected: 通过。

**Step 5: Commit**

```bash
git add server/services/followUpService.js server/routes/followUpRoutes.js server/validators/followUpSchemas.js test/server/followUpRoutes.test.js
git commit -m "feat(api): add paid follow-up route"
```

### Task 9: 实现咨询位与商品位规则引擎

**Files:**
- Create: `server/config/recommendationCatalog.json`
- Create: `server/services/recommendationService.js`
- Create: `server/routes/recommendationRoutes.js`
- Test: `test/server/recommendationService.test.js`

**Step 1: 写失败的推荐服务测试**

```js
import { describe, expect, it } from 'vitest';
import { createRecommendationService } from '../services/recommendationService.js';

describe('recommendation service', () => {
  it('maps tag to advisor and product slots', () => {
    const service = createRecommendationService({
      catalog: {
        career_anxiety: {
          advisors: [{ id: 'advisor_1' }],
          products: [{ id: 'product_1' }]
        }
      }
    });

    const result = service.resolveSlots(['career_anxiety']);

    expect(result.advisors[0].id).toBe('advisor_1');
    expect(result.products[0].id).toBe('product_1');
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/recommendationService.test.js
```

Expected: FAIL。

**Step 3: 写最小实现**

```js
export function createRecommendationService({ catalog }) {
  return {
    resolveSlots(tags = []) {
      return tags.reduce(
        (result, tag) => {
          const matched = catalog[tag];
          if (!matched) {
            return result;
          }

          result.advisors.push(...(matched.advisors || []));
          result.products.push(...(matched.products || []));
          return result;
        },
        { advisors: [], products: [] }
      );
    }
  };
}
```

**Step 4: 接入读取 JSON 配置与 API 输出**

Run:

```bash
npx vitest run test/server/recommendationService.test.js
```

Expected: 通过。

**Step 5: Commit**

```bash
git add server/config/recommendationCatalog.json server/services/recommendationService.js server/routes/recommendationRoutes.js test/server/recommendationService.test.js
git commit -m "feat(api): add recommendation rule engine"
```

### Task 10: 在前端加入解锁、结果、追问和推荐面板

**Files:**
- Create: `src/services/apiClient.js`
- Create: `src/hooks/useAiReportFlow.js`
- Create: `src/components/AiReportPanel.jsx`
- Create: `src/components/AiFollowUpPanel.jsx`
- Create: `src/components/RecommendationPanel.jsx`
- Create: `src/components/ComplianceNotice.jsx`
- Modify: `src/App.jsx`
- Test: `test/src/components/AiReportPanel.test.jsx`

**Step 1: 写失败的组件交互测试**

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AiReportPanel from './AiReportPanel.jsx';

describe('AiReportPanel', () => {
  it('submits unlock request', async () => {
    const onUnlock = vi.fn();

    render(<AiReportPanel loading={false} onUnlock={onUnlock} />);

    fireEvent.change(screen.getByPlaceholderText('请输入你最关心的问题'), {
      target: { value: '我适合换工作吗？' }
    });
    fireEvent.click(screen.getByRole('button', { name: '解锁完整报告' }));

    expect(onUnlock).toHaveBeenCalled();
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/src/components/AiReportPanel.test.jsx
```

Expected: FAIL。

**Step 3: 写最小前端实现**

```jsx
export default function AiReportPanel({ loading, onUnlock }) {
  return (
    <div>
      <textarea placeholder="请输入你最关心的问题" />
      <button disabled={loading} onClick={() => onUnlock()}>
        解锁完整报告
      </button>
    </div>
  );
}
```

**Step 4: 把新面板接到 `src/App.jsx`**

Run:

```bash
npx vitest run test/src/components/AiReportPanel.test.jsx
npm run build
```

Expected: 通过，构建成功。

**Step 5: Commit**

```bash
git add src/services/apiClient.js src/hooks/useAiReportFlow.js src/components/AiReportPanel.jsx src/components/AiFollowUpPanel.jsx src/components/RecommendationPanel.jsx src/components/ComplianceNotice.jsx test/src/components/AiReportPanel.test.jsx src/App.jsx
git commit -m "feat(web): add ai report unlock and follow-up panels"
```

### Task 11: 完成部署清单、环境模板和回归检查

**Files:**
- Create: `.env.example`
- Create: `server/Dockerfile`
- Create: `deploy/cloudrun-api.yaml`
- Create: `deploy/README.md`
- Modify: `package.json`

**Step 1: 补部署环境模板**

```env
PORT=8787
VERTEX_PROJECT_ID=your-project-id
VERTEX_LOCATION=asia-east2
DATABASE_URL=postgres://user:pass@host:5432/db
WECHAT_APP_ID=your-wechat-app-id
WECHAT_MCH_ID=your-mch-id
WECHAT_API_V3_KEY=your-api-v3-key
WECHAT_NOTIFY_URL=https://api.example.com/api/payments/wechat/notify
```

**Step 2: 写 Cloud Run 启动清单**

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: paipan-ai-api
spec:
  template:
    spec:
      containers:
        - image: REGION-docker.pkg.dev/PROJECT/REPO/paipan-ai-api:latest
          env:
            - name: VERTEX_LOCATION
              value: asia-east2
```

**Step 3: 增加最终验证命令**

Run:

```bash
npx vitest run
npm run lint
npm run build
```

Expected: 全部通过。

**Step 4: 编写部署说明**

在 `deploy/README.md` 中明确：

- 本地如何起 API
- 香港环境如何配置
- 如何运行迁移
- 如何验证支付回调
- 如何切换 `gemini-2.5-pro` / `gemini-3.1-pro-preview`

**Step 5: Commit**

```bash
git add .env.example server/Dockerfile deploy/cloudrun-api.yaml deploy/README.md package.json
git commit -m "docs(deploy): add hk deployment and verification checklist"
```

### Task 12: 上线前手动验收

**Files:**
- Modify: `docs/worklog/progress.md`

**Step 1: 本地验证免费排盘仍可用**

Run:

```bash
npm run dev
```

Expected: 五类排盘模式正常渲染，未接入 AI 的路径不报错。

**Step 2: 验证首单报告链路**

Run:

```bash
curl -X POST http://localhost:8787/api/report/create \
  -H 'Content-Type: application/json' \
  -d '{"mode":"bazi","question":"事业方向","payload":{"mode":"bazi","summary":{"core":"甲子 乙丑 丙寅 丁卯，日主丙"},"meta":{"gender":"男"}}}'
```

Expected: 返回 `reportId`、`summary`、`remainingCredits`。

**Step 3: 验证追问次数扣减**

Run:

```bash
curl -X POST http://localhost:8787/api/reports/rpt_demo/follow-up \
  -H 'Content-Type: application/json' \
  -d '{"message":"今年适合跳槽吗？"}'
```

Expected: 返回 `answer` 和新的 `remainingCredits`。

**Step 4: 验证推荐位输出**

Run:

```bash
curl "http://localhost:8787/api/recommendations?tags=career_anxiety"
```

Expected: 返回咨询位和商品位数组。

**Step 5: Commit**

```bash
git add docs/worklog/progress.md
git commit -m "chore: record prelaunch acceptance results"
```

## 后续 Roadmap

以下事项不属于当前最小闭环，但属于真正上线、收款和持续运营前必须补齐的后续工作。建议按优先级推进。

### P0：上线前必须完成

- 真实微信 `openid` 登录链路
  - 完成 `code -> openid -> user_id`
  - 打通微信内 H5 的真实身份绑定
  - 支持已登录用户查询自己的订单、报告和追问记录

- 真实微信支付 `API v3`
  - 完成 JSAPI 下单
  - 完成支付回调验签与解密
  - 完成订单幂等、补单、对账和异常补偿
  - 替换当前 `mock` 支付链路

- 持久化数据库切换
  - 用 PostgreSQL 替换当前内存仓储
  - 跑通所有迁移脚本
  - 确认用户、订单、报告、追问和权益消费都能持久化

- 生产模型与部署
  - 生产环境按配置切换到 Gemini Developer API 或 Vertex AI
  - 完成香港环境部署、域名、HTTPS 和回调地址配置
  - 加入基础监控、错误告警和调用日志

- 基础风控与稳定性
  - 限流、防刷、防重复支付
  - 模型超时重试和失败兜底
  - 敏感词和违规问题拦截

### P1：商业化与运营必需

- 管理后台
  - 用户列表和详情
  - 订单列表和支付状态
  - 报告列表和追问记录
  - 手动补单和权益修正
  - 咨询师配置和商品配置
  - 推荐位标签映射配置

- Prompt 与内容后台化
  - 每个盘型的 Prompt 模板版本管理
  - 支持灰度切换和回滚
  - 记录 Prompt 版本与报告结果的对应关系

- 推荐位后台化
  - 咨询位、商品位和 CTA 配置改为后台管理
  - 支持按盘型、标签、优先级控制推荐内容
  - 支持上下线和生效时间管理

- 基础数据埋点
  - 首单支付率
  - 报告生成成功率
  - 追问率和追问包购买率
  - 咨询点击率和商品点击率
  - 按盘型分渠道转化

### P2：体验与长期优化

- 历史报告与会话中心
  - 用户可回看历史报告
  - 用户可查看历史追问
  - 支持从旧报告继续追问

- 客服与承接链路
  - 企业微信或客服系统接入
  - 咨询线索分配和跟进状态管理
  - 支付后自动分流到人工承接

- 构建与性能优化
  - 继续拆分大包
  - 优化 `ziwei` 相关资源加载
  - 减少首页首屏体积

- 内容和策略优化
  - 报告缓存和重复请求去重
  - 按盘型优化推荐策略
  - A/B 测试不同 Prompt、价格和推荐位文案

# User Identity Binding Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在现有 AI 报告支付链路中接入“开发态 guest 用户 + 生产态微信 openid”的统一身份模型，并把订单、报告、追问全部绑定到内部 `user_id`。

**Architecture:** 后端新增 `users` 与轻量 session 层，通过 cookie 恢复当前用户，并在订单、报告、追问服务中统一使用 `request.user.id` 做归属校验。前端应用启动时先初始化 session，之后所有业务请求都不再显式传 `userId`。

**Tech Stack:** React 19、Vite 7、Express、Zod、PostgreSQL、Vitest、Supertest、Cookie

---

### Task 1: 新增用户表与用户仓储

**Files:**
- Create: `server/db/migrations/003_user_identity.sql`
- Create: `server/repositories/userRepository.js`
- Modify: `server/repositories/memoryRepositories.js`
- Modify: `server/bootstrap/createRuntimeServices.js`
- Test: `test/server/userRepository.test.js`

**Step 1: 写失败的仓储测试**

```js
import { describe, expect, it } from 'vitest';
import { createMemoryRepositories } from '../../server/repositories/memoryRepositories.js';

describe('userRepository', () => {
  it('creates and finds guest users', async () => {
    const repositories = createMemoryRepositories();
    const user = await repositories.userRepository.insertUser({
      id: 'usr_guest_001',
      identityProvider: 'guest',
      providerSubject: null,
      displayName: '访客用户'
    });

    const found = await repositories.userRepository.findUserById(user.id);
    expect(found.id).toBe('usr_guest_001');
    expect(found.identity_provider).toBe('guest');
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/userRepository.test.js
```

Expected: FAIL，提示 `userRepository` 不存在或方法未定义。

**Step 3: 写最小实现**

- 在 `003_user_identity.sql` 中新增 `users` 表和必要索引
- 在 `userRepository.js` 中实现：
  - `insertUser`
  - `findUserById`
  - `findUserByProvider`
  - `touchUserLastSeen`
- 在 `memoryRepositories.js` 中补内存版 `userRepository`
- 在 `createRuntimeServices.js` 中注入 `userRepository`

**Step 4: 复跑测试**

Run:

```bash
npx vitest run test/server/userRepository.test.js test/server/reportRepository.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/db/migrations/003_user_identity.sql server/repositories/userRepository.js server/repositories/memoryRepositories.js server/bootstrap/createRuntimeServices.js test/server/userRepository.test.js
git commit -m "feat(auth): add user repository and schema"
```

### Task 2: 新增会话服务与开发态访客登录

**Files:**
- Create: `server/services/sessionService.js`
- Create: `server/services/userService.js`
- Create: `server/services/authService.js`
- Create: `server/routes/authRoutes.js`
- Modify: `server/config/env.js`
- Modify: `server/app.js`
- Test: `test/server/authRoutes.test.js`
- Test: `test/server/sessionService.test.js`

**Step 1: 写失败的认证路由测试**

```js
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../server/app.js';

describe('auth routes', () => {
  it('creates a dev session in development mode', async () => {
    const app = createApp({
      env: {
        nodeEnv: 'development',
        sessionCookieName: 'pai_pan_sid',
        sessionCookieSecret: 'test-secret'
      },
      services: {
        authService: {
          createDevSession: async () => ({
            user: { id: 'usr_guest_001', identityProvider: 'guest', displayName: '访客用户' },
            cookieValue: 'session_001'
          }),
          getSessionUser: async () => null
        }
      }
    });

    const response = await request(app).post('/api/auth/dev-session');

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe('usr_guest_001');
    expect(response.headers['set-cookie']).toBeTruthy();
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/authRoutes.test.js
```

Expected: FAIL，提示 `registerAuthRoutes` 不存在或路由未注册。

**Step 3: 写最小实现**

- 在 `env.js` 中增加：
  - `sessionCookieName`
  - `sessionCookieSecret`
  - `sessionCookieSecure`
- `sessionService.js` 实现 session 编码、解码、cookie 配置
- `userService.js` 实现 `createGuestUserIfNeeded`
- `authService.js` 实现：
  - `getSessionUser`
  - `createDevSession`
- `authRoutes.js` 注册：
  - `GET /api/auth/session`
  - `POST /api/auth/dev-session`
- 在 `app.js` 中注册认证路由

**Step 4: 复跑测试**

Run:

```bash
npx vitest run test/server/authRoutes.test.js test/server/sessionService.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/services/sessionService.js server/services/userService.js server/services/authService.js server/routes/authRoutes.js server/config/env.js server/app.js test/server/authRoutes.test.js test/server/sessionService.test.js
git commit -m "feat(auth): add dev session bootstrap"
```

### Task 3: 接入当前用户解析中间件和登录守卫

**Files:**
- Create: `server/middleware/currentUser.js`
- Create: `server/middleware/requireAuth.js`
- Modify: `server/app.js`
- Modify: `server/middleware/requestContext.js`
- Test: `test/server/currentUser.test.js`

**Step 1: 写失败的当前用户解析测试**

```js
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createCurrentUserMiddleware } from '../../server/middleware/currentUser.js';

describe('current user middleware', () => {
  it('attaches request.user when session is valid', async () => {
    const app = express();
    app.use(createCurrentUserMiddleware({
      authService: {
        getSessionUser: async () => ({ id: 'usr_guest_001', identityProvider: 'guest' })
      }
    }));
    app.get('/whoami', (req, res) => {
      res.json({ userId: req.user?.id || null });
    });

    const response = await request(app).get('/whoami');
    expect(response.body.userId).toBe('usr_guest_001');
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/currentUser.test.js
```

Expected: FAIL

**Step 3: 写最小实现**

- `currentUser.js`：
  - 从 cookie 中恢复当前用户
  - 将用户挂到 `request.user`
  - 异常时记录 `[Auth]` 日志，不要静默失败
- `requireAuth.js`：
  - 未登录返回结构化 `401`
- `requestContext.js`：
  - 支持把 `userId` 注入日志上下文
- `app.js`：
  - 在业务路由前挂载当前用户解析中间件

**Step 4: 复跑测试**

Run:

```bash
npx vitest run test/server/currentUser.test.js test/server/errorHandler.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/middleware/currentUser.js server/middleware/requireAuth.js server/app.js server/middleware/requestContext.js test/server/currentUser.test.js
git commit -m "feat(auth): resolve current user from session"
```

### Task 4: 收紧订单归属并移除前端透传 userId

**Files:**
- Modify: `server/routes/orderRoutes.js`
- Modify: `server/services/orderService.js`
- Modify: `server/validators/orderSchemas.js`
- Modify: `server/repositories/orderRepository.js`
- Modify: `server/repositories/memoryRepositories.js`
- Modify: `src/services/apiClient.js`
- Test: `test/server/orderRoutes.test.js`
- Test: `test/server/orderService.test.js`

**Step 1: 写失败的归属测试**

```js
import { describe, expect, it, vi } from 'vitest';
import { createOrderService } from '../../server/services/orderService.js';

describe('order ownership', () => {
  it('rejects follow-up pack orders for reports owned by another user', async () => {
    const orderService = createOrderService({
      orderRepository: { insertOrder: vi.fn(), findOrderById: vi.fn() },
      paymentClient: { paymentBackend: 'mock', createJsapiOrder: vi.fn() },
      reportRepository: {
        findReportById: vi.fn().mockResolvedValue({
          id: 'rpt_001',
          user_id: 'usr_other_001'
        })
      }
    });

    await expect(orderService.createOrder({
      currentUserId: 'usr_guest_001',
      productType: 'follow_up_pack',
      reportId: 'rpt_001'
    })).rejects.toThrow();
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/orderService.test.js test/server/orderRoutes.test.js
```

Expected: FAIL

**Step 3: 写最小实现**

- `orderSchemas.js` 中移除 `userId`
- `orderRoutes.js` 从 `request.user.id` 传递 `currentUserId`
- `orderService.js`：
  - 所有读写统一使用 `currentUserId`
  - 读取订单时校验 `order.user_id`
  - 创建追问包订单时校验 `report.user_id`
- `apiClient.js` 不再发送 `userId`

**Step 4: 复跑测试**

Run:

```bash
npx vitest run test/server/orderService.test.js test/server/orderRoutes.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/routes/orderRoutes.js server/services/orderService.js server/validators/orderSchemas.js server/repositories/orderRepository.js server/repositories/memoryRepositories.js src/services/apiClient.js test/server/orderRoutes.test.js test/server/orderService.test.js
git commit -m "feat(order): enforce user ownership"
```

### Task 5: 收紧报告与追问归属

**Files:**
- Modify: `server/routes/reportRoutes.js`
- Modify: `server/routes/followUpRoutes.js`
- Modify: `server/services/reportService.js`
- Modify: `server/services/followUpService.js`
- Modify: `server/validators/followUpSchemas.js`
- Modify: `server/repositories/reportRepository.js`
- Modify: `server/repositories/followUpRepository.js`
- Test: `test/server/reportService.test.js`
- Test: `test/server/followUpService.test.js`
- Test: `test/server/reportRoutes.test.js`
- Test: `test/server/followUpRoutes.test.js`

**Step 1: 写失败的归属测试**

```js
import { describe, expect, it, vi } from 'vitest';
import { createFollowUpService } from '../../server/services/followUpService.js';

describe('follow-up ownership', () => {
  it('rejects questions for reports owned by another user', async () => {
    const followUpService = createFollowUpService({
      env: {},
      genAiClient: { generateText: vi.fn() },
      deriveRecommendationTags: vi.fn(),
      followUpRepository: { insertFollowUp: vi.fn() },
      reportRepository: {
        findReportById: vi.fn().mockResolvedValue({
          id: 'rpt_001',
          user_id: 'usr_other_001',
          remaining_credits: 1
        }),
        updateRemainingCredits: vi.fn()
      }
    });

    await expect(followUpService.answerQuestion({
      currentUserId: 'usr_guest_001',
      reportId: 'rpt_001',
      message: '继续追问'
    })).rejects.toThrow();
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/reportService.test.js test/server/followUpService.test.js test/server/reportRoutes.test.js test/server/followUpRoutes.test.js
```

Expected: FAIL

**Step 3: 写最小实现**

- `reportRoutes.js` 从 `request.user.id` 传给 `reportService`
- `followUpRoutes.js` 从 `request.user.id` 传给 `followUpService`
- `followUpSchemas.js` 移除 `userId`
- `reportService.js`：
  - 写报告时持久化 `currentUserId`
  - 消费解锁资格前校验订单归属
- `followUpService.js`：
  - 读取报告后校验 `report.user_id`
  - 写追问记录时带上 `currentUserId`

**Step 4: 复跑测试**

Run:

```bash
npx vitest run test/server/reportService.test.js test/server/followUpService.test.js test/server/reportRoutes.test.js test/server/followUpRoutes.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/routes/reportRoutes.js server/routes/followUpRoutes.js server/services/reportService.js server/services/followUpService.js server/validators/followUpSchemas.js server/repositories/reportRepository.js server/repositories/followUpRepository.js test/server/reportService.test.js test/server/followUpService.test.js test/server/reportRoutes.test.js test/server/followUpRoutes.test.js
git commit -m "feat(report): bind reports and follow-ups to current user"
```

### Task 6: 接入前端 session 初始化与开发态自动登录

**Files:**
- Create: `src/hooks/useSessionBootstrap.js`
- Modify: `src/services/apiClient.js`
- Modify: `src/App.jsx`
- Modify: `src/hooks/useAiReportFlow.js`
- Test: `test/src/hooks/useSessionBootstrap.test.jsx`

**Step 1: 写失败的前端会话测试**

```jsx
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSessionBootstrap } from '../../../src/hooks/useSessionBootstrap.js';

describe('useSessionBootstrap', () => {
  it('creates dev session when current session is anonymous in development', async () => {
    const getSession = vi.fn()
      .mockResolvedValueOnce({ authenticated: false, user: null })
      .mockResolvedValueOnce({ authenticated: true, user: { id: 'usr_guest_001' } });
    const createDevSession = vi.fn().mockResolvedValue({ authenticated: true });

    const { result } = renderHook(() => useSessionBootstrap({
      envMode: 'development',
      api: { getSession, createDevSession }
    }));

    await waitFor(() => {
      expect(result.current.session?.user?.id).toBe('usr_guest_001');
    });
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/src/hooks/useSessionBootstrap.test.jsx
```

Expected: FAIL

**Step 3: 写最小实现**

- `apiClient.js` 增加：
  - `getAuthSession`
  - `createDevSession`
- `useSessionBootstrap.js`：
  - 启动时拉取 session
  - 开发态未登录时自动创建访客会话
  - 提供 `loading`、`session`、`error`
- `App.jsx`：
  - 在主应用启动时接入该 hook
  - 未完成 session 初始化时禁用需要登录的 AI 交互
- `useAiReportFlow.js`：
  - 删除残留的 `userId` 透传依赖

**Step 4: 复跑测试**

Run:

```bash
npx vitest run test/src/hooks/useSessionBootstrap.test.jsx test/src/components/RecommendationPanel.test.jsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useSessionBootstrap.js src/services/apiClient.js src/App.jsx src/hooks/useAiReportFlow.js test/src/hooks/useSessionBootstrap.test.jsx
git commit -m "feat(frontend): bootstrap session before ai flow"
```

### Task 7: 预留微信身份交换接口并补生产文档

**Files:**
- Modify: `server/services/authService.js`
- Modify: `server/routes/authRoutes.js`
- Modify: `server/config/env.js`
- Modify: `docs/ops/2026-03-20-production-config.md`
- Test: `test/server/authRoutes.test.js`

**Step 1: 写失败的接口测试**

```js
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../server/app.js';

describe('POST /api/auth/wechat/exchange', () => {
  it('returns 409 when wechat auth is not configured', async () => {
    const app = createApp({
      env: { nodeEnv: 'production' },
      services: {
        authService: {
          exchangeWechatCode: async () => {
            throw new Error('not-configured');
          },
          getSessionUser: async () => null
        }
      }
    });

    const response = await request(app)
      .post('/api/auth/wechat/exchange')
      .send({ code: 'test-code' });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
```

**Step 2: 运行测试确认失败**

Run:

```bash
npx vitest run test/server/authRoutes.test.js
```

Expected: FAIL

**Step 3: 写最小实现**

- `authService.js` 新增 `exchangeWechatCode` 接口位
- 未配置微信身份参数时返回结构化 `409`
- `authRoutes.js` 注册 `/api/auth/wechat/exchange`
- `env.js` 增加微信身份相关环境变量读取
- 更新生产配置文档，把 `openid` 交换所需配置写全

**Step 4: 复跑测试**

Run:

```bash
npx vitest run test/server/authRoutes.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add server/services/authService.js server/routes/authRoutes.js server/config/env.js docs/ops/2026-03-20-production-config.md test/server/authRoutes.test.js
git commit -m "feat(auth): add wechat exchange integration seam"
```

### Task 8: 全量回归与文档收口

**Files:**
- Modify: `docs/plans/2026-03-20-user-identity-binding-design.md`
- Modify: `docs/plans/2026-03-20-user-identity-binding.md`

**Step 1: 运行后端测试**

Run:

```bash
npx vitest run test/server
```

Expected: PASS

**Step 2: 运行前端测试**

Run:

```bash
npx vitest run test/src
```

Expected: PASS

**Step 3: 运行 lint 与构建**

Run:

```bash
npm run lint
npm run build
```

Expected: PASS

**Step 4: 人工联调开发态主链路**

Run:

```bash
PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH" npm run dev:api
PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH" npm run dev
```

Expected:

- 首次进入应用自动拿到 `guest session`
- 报告解锁订单属于当前用户
- 生成报告成功
- 追问成功
- 追问包购买成功
- 无法越权访问其他用户订单或报告

**Step 5: Commit**

```bash
git add docs/plans/2026-03-20-user-identity-binding-design.md docs/plans/2026-03-20-user-identity-binding.md
git commit -m "docs(plans): finalize user identity binding rollout"
```

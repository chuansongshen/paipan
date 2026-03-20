# Multi-Mode AI Interpretation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将奇门遁甲、大六壬、六爻、紫微斗数接入与八字一致的 AI 报告、追问、支付与推荐位体验，并通过公共载荷与公共 UI 保持高复用。

**Architecture:** 前端继续使用统一的 `useAiReportFlow` 作为 AI 业务状态机，将盘型差异收敛到 `src/utils/fortunePayload.js` 的多盘型 builder 与 `server/services/reportTemplateCatalog.js` 的多模板定义。`src/App.jsx` 不再在八字分支里单独渲染 AI 区，而是通过公共组件为五种支持盘型统一挂载 AI 报告、追问和推荐位。

**Tech Stack:** React 19、Vite、Ant Design、Vitest、Node.js、Express、Zod

---

### Task 1: 扩展前端 AI 载荷构建器

**Files:**
- Modify: `src/utils/fortunePayload.js`
- Test: `test/src/utils/fortunePayload.test.js`

**Step 1: 写失败测试，覆盖五种盘型的载荷输出**

在 `test/src/utils/fortunePayload.test.js` 新增以下用例：

```js
it('识别五种支持的 AI 解读模式', () => {
  expect(isAiInterpretationSupportedMode('qimen')).toBe(true);
  expect(isAiInterpretationSupportedMode('daliuren')).toBe(true);
  expect(isAiInterpretationSupportedMode('liuyao')).toBe(true);
  expect(isAiInterpretationSupportedMode('bazi')).toBe(true);
  expect(isAiInterpretationSupportedMode('ziwei')).toBe(true);
});

it('构建稳定的奇门 AI 载荷', () => {
  const payload = buildFortunePayload('qimen', sampleQimenData);
  expect(payload.mode).toBe('qimen');
  expect(payload.summary.core).toContain('值符');
  expect(payload.promptText).toContain('奇门遁甲排盘');
});

it('构建稳定的大六壬 AI 载荷', () => {
  const payload = buildFortunePayload('daliuren', sampleDaLiuRenData);
  expect(payload.mode).toBe('daliuren');
  expect(payload.summary.core).toContain('三传');
  expect(payload.promptText).toContain('大六壬排盘');
});

it('构建稳定的六爻 AI 载荷', () => {
  const payload = buildFortunePayload('liuyao', sampleLiuYaoData);
  expect(payload.mode).toBe('liuyao');
  expect(payload.summary.core).toContain('本卦');
  expect(payload.promptText).toContain('六爻排盘');
});

it('构建稳定的紫微 AI 载荷', () => {
  const payload = buildFortunePayload('ziwei', sampleZiWeiData);
  expect(payload.mode).toBe('ziwei');
  expect(payload.summary.core).toContain('命宫');
  expect(payload.promptText).toContain('紫微斗数');
});
```

同时新增关键字段缺失测试：

```js
it('在奇门关键字段缺失时抛明确错误', () => {
  expect(() => buildFortunePayload('qimen', { jieQi: '春分' }))
    .toThrow('奇门排盘缺少值符信息');
});
```

**Step 2: 运行定向测试，确认当前失败**

Run:

```bash
npx vitest run test/src/utils/fortunePayload.test.js
```

Expected: FAIL，提示新增模式尚未支持或字段校验未实现。

**Step 3: 写最小实现**

在 `src/utils/fortunePayload.js` 中：

- 将 `SUPPORTED_AI_INTERPRETATION_MODES` 扩展为五种模式
- 为每种盘型新增独立 builder
- 提炼公共校验函数，例如：

```js
function assertField(modeLabel, value, message) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${modeLabel}${message}`);
  }
}
```

- `buildFortunePayload` 仅负责分发：

```js
if (mode === 'qimen') {
  return buildQimenPayload(panData);
}
```

要求：

- 日志统一保留 `[FortunePayload]`
- 各 builder 内部要有明确的缺字段错误
- 不复制 `App.jsx` 里的旧拼接逻辑，尽量抽公共字符串拼接片段

**Step 4: 再跑测试，确认通过**

Run:

```bash
npx vitest run test/src/utils/fortunePayload.test.js
```

Expected: PASS

**Step 5: 提交**

```bash
git add test/src/utils/fortunePayload.test.js src/utils/fortunePayload.js
git commit -m "feat(ai): support multi-mode fortune payloads"
```

### Task 2: 扩展后端报告模板目录

**Files:**
- Modify: `server/services/reportTemplateCatalog.js`
- Test: `test/server/reportTemplateCatalog.test.js`

**Step 1: 写失败测试，覆盖五种盘型模板**

创建 `test/server/reportTemplateCatalog.test.js`：

```js
import { describe, expect, it } from 'vitest';
import { getReportTemplate } from '../../server/services/reportTemplateCatalog.js';

describe('reportTemplateCatalog', () => {
  ['qimen', 'daliuren', 'liuyao', 'bazi', 'ziwei'].forEach((mode) => {
    it(`为 ${mode} 提供报告模板`, () => {
      const template = getReportTemplate(mode, {});
      expect(template.model).toBeTruthy();
      expect(template.systemInstruction).toBeTruthy();
      expect(template.generationConfig).toBeTruthy();
    });
  });
});
```

**Step 2: 运行定向测试，确认当前失败**

Run:

```bash
npx vitest run test/server/reportTemplateCatalog.test.js
```

Expected: FAIL，提示未找到非八字模板。

**Step 3: 写最小实现**

在 `server/services/reportTemplateCatalog.js` 中：

- 保留通用底层约束
- 为 `qimen`、`daliuren`、`liuyao`、`ziwei` 增加模板
- 不同盘型使用不同重点系统提示词，例如：

```js
qimen: {
  model: modelSelection.model,
  fallbackModels: modelSelection.fallbackModels,
  systemInstruction: `${BASE_SYSTEM_INSTRUCTION}\n请重点分析局势、门星神组合、可行窗口与行动顺序。`,
  generationConfig: {
    temperature: 0.5,
    maxOutputTokens: 4096
  }
}
```

要求：

- 模板命名与前端 `payload.mode` 严格一致
- 保持输出骨架约束一致
- 不修改 `composeReportPrompt` 的输入协议

**Step 4: 再跑测试，确认通过**

Run:

```bash
npx vitest run test/server/reportTemplateCatalog.test.js
```

Expected: PASS

**Step 5: 提交**

```bash
git add test/server/reportTemplateCatalog.test.js server/services/reportTemplateCatalog.js
git commit -m "feat(ai): add report templates for all supported modes"
```

### Task 3: 抽出公共 AI 解读区域

**Files:**
- Create: `src/components/AiInterpretationSection.jsx`
- Modify: `src/App.jsx`
- Test: `test/src/components/AiInterpretationSection.test.jsx`

**Step 1: 写失败测试，验证公共 AI 区的渲染**

创建 `test/src/components/AiInterpretationSection.test.jsx`：

```jsx
import { render, screen } from '@testing-library/react';
import AiInterpretationSection from '../../../src/components/AiInterpretationSection.jsx';

describe('AiInterpretationSection', () => {
  it('在启用时渲染报告、追问和推荐位三个区块', () => {
    render(
      <AiInterpretationSection
        disabledReason=""
        flow={mockFlow}
      />
    );

    expect(screen.getByText('AI 解读')).toBeInTheDocument();
    expect(screen.getByText('继续追问')).toBeInTheDocument();
    expect(screen.getByText('相关推荐')).toBeInTheDocument();
  });
});
```

**Step 2: 运行定向测试，确认当前失败**

Run:

```bash
npx vitest run test/src/components/AiInterpretationSection.test.jsx
```

Expected: FAIL，提示组件不存在。

**Step 3: 写最小实现**

创建 `src/components/AiInterpretationSection.jsx`，封装：

- `ComplianceNotice`
- `AiReportPanel`
- `AiFollowUpPanel`
- `RecommendationPanel`

组件形态建议：

```jsx
export default function AiInterpretationSection({ disabledReason, flow }) {
  const enabled = !disabledReason;

  return (
    <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
      <ComplianceNotice />
      <AiReportPanel ... />
      <AiFollowUpPanel ... />
      <RecommendationPanel ... />
    </div>
  );
}
```

然后修改 `src/App.jsx`：

- 移除八字分支中硬编码的 AI 面板 JSX
- 在五种支持模式的公共位置调用 `AiInterpretationSection`
- 保留八字、奇门、大六壬、六爻、紫微各自的盘面渲染和使用说明

要求：

- 不影响现有盘面展示
- 不在 `App.jsx` 中再复制三块 AI 面板 JSX
- 紫微和八字的特殊说明继续保留在各自说明卡片中

**Step 4: 再跑测试，确认通过**

Run:

```bash
npx vitest run test/src/components/AiInterpretationSection.test.jsx
```

Expected: PASS

**Step 5: 提交**

```bash
git add src/components/AiInterpretationSection.jsx src/App.jsx test/src/components/AiInterpretationSection.test.jsx
git commit -m "refactor(ui): share ai interpretation section across modes"
```

### Task 4: 收紧启用条件与紫微特殊边界

**Files:**
- Modify: `src/App.jsx`
- Test: `test/src/components/App.aiAvailability.test.jsx`

**Step 1: 写失败测试，覆盖启用和禁用条件**

创建 `test/src/components/App.aiAvailability.test.jsx`，至少覆盖：

```jsx
it('五种盘型被识别为支持 AI 解读', () => {
  ['qimen', 'daliuren', 'liuyao', 'bazi', 'ziwei'].forEach((mode) => {
    expect(isAiInterpretationSupportedMode(mode)).toBe(true);
  });
});

it('紫微加载中时返回正确禁用原因', () => {
  const reason = buildAiDisabledReason({
    appMode: 'ziwei',
    ziweiLoading: true,
    panData: null,
    sessionBootstrap: authenticatedSession,
    aiPayload: null
  });

  expect(reason).toContain('紫微斗数排盘加载中');
});
```

如果 `App.jsx` 难以直接测，先抽一个纯函数，例如：

```js
export function buildAiDisabledReason(input) {
  // ...
}
```

**Step 2: 运行定向测试，确认当前失败**

Run:

```bash
npx vitest run test/src/components/App.aiAvailability.test.jsx
```

Expected: FAIL，提示公共启用判断尚未抽出或紫微禁用逻辑不完整。

**Step 3: 写最小实现**

在 `src/App.jsx` 中：

- 将 `aiDisabledReason` 判断提炼为可测试的纯函数或局部辅助函数
- 支持五种盘型
- 对紫微新增明确禁用原因：

```js
if (appMode === 'ziwei' && ziweiLoading) {
  return '紫微斗数排盘加载中，请稍后再试。';
}
```

要求：

- 切换模式后仍由 `payloadKey` 正确重置 AI 状态
- 不破坏现有 session 初始化逻辑

**Step 4: 再跑测试，确认通过**

Run:

```bash
npx vitest run test/src/components/App.aiAvailability.test.jsx
```

Expected: PASS

**Step 5: 提交**

```bash
git add src/App.jsx test/src/components/App.aiAvailability.test.jsx
git commit -m "feat(ai): align availability rules across fortune modes"
```

### Task 5: 做整体验证与回归

**Files:**
- Review: `src/App.jsx`
- Review: `src/utils/fortunePayload.js`
- Review: `server/services/reportTemplateCatalog.js`
- Review: `src/components/AiInterpretationSection.jsx`

**Step 1: 跑前端与后端单测**

Run:

```bash
npx vitest run test/src/utils/fortunePayload.test.js test/src/components/AiInterpretationSection.test.jsx test/src/components/App.aiAvailability.test.jsx test/server/reportTemplateCatalog.test.js
```

Expected: PASS

**Step 2: 跑全量测试**

Run:

```bash
npm test
```

Expected: PASS

**Step 3: 跑 lint**

Run:

```bash
npm run lint
```

Expected: PASS

**Step 4: 跑构建**

Run:

```bash
npm run build
```

Expected: PASS，允许保留体积 warning，但不能有构建失败。

**Step 5: 手工联调五种盘型**

检查点：

- 奇门页面出现 AI 解读区
- 大六壬页面出现 AI 解读区
- 六爻页面出现 AI 解读区
- 八字页面现有 AI 解读区不回退
- 紫微页面在加载完成后出现 AI 解读区，加载中禁用

**Step 6: 提交**

```bash
git add src/App.jsx src/utils/fortunePayload.js server/services/reportTemplateCatalog.js src/components/AiInterpretationSection.jsx test/src test/server
git commit -m "feat(ai): enable ai interpretation for all fortune modes"
```

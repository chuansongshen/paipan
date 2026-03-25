# 大六壬九宗门三传重构 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按九宗门条文重写大六壬三传判课逻辑，并在完成后与目标站点做批量对比，记录差异时间。

**Architecture:** 保持现有排盘入口、返回结构和 UI 不变，只在 `src/utils/daliuren.js` 内重构三传判课引擎。通过拆分“课局识别 / 候选筛选 / 专门取传 / 常规递传”，将现有补丁式分支整理为可测试的九宗门分派器。

**Tech Stack:** JavaScript ESM、React 项目内脚本测试、Chrome DevTools / Playwright 页面比对

---

### Task 1: 固化当前基线与补足用例

**Files:**
- Modify: `test_daliuren_reference_cases.js`
- Modify: `test_daliuren_fuyin.js`
- Test: `test_daliuren_bieze_bazhuan.js`
- Create: `test_daliuren_jiuzongmen.js`

**Step 1: 写九宗门最小失败用例**

- 为每个关键宗门补一个固定时间断言：
  - 贼克
  - 比用
  - 涉害
  - 蒿矢
  - 弹射
  - 返吟无依
  - 返吟无亲

**Step 2: 运行测试确认当前实现无法全部通过**

Run: `node test_daliuren_jiuzongmen.js`

Expected: 至少在比用 / 涉害 / 返吟上失败。

**Step 3: 记录需要保留的旧回归**

Run:

```bash
node test_daliuren_reference_cases.js
node test_daliuren_fuyin.js
node test_daliuren_bieze_bazhuan.js
```

Expected: 记录当前基线，后续重构后再统一复跑。

### Task 2: 拆出九宗门识别与专门取传函数

**Files:**
- Modify: `src/utils/daliuren.js`

**Step 1: 增加课局识别函数**

- 增加：
  - `isFanYinJu`
  - `isSiKeQuan`
  - `isSiKeSanBei`
  - `isSiKeLiangBei`

**Step 2: 增加候选筛选函数**

- 提取：
  - 贼克候选收集
  - 遥克候选收集
  - 比用筛选

**Step 3: 增加返吟专门取传函数**

- 新增：
  - `getFanYinSanChuan`
  - `getWuQinFanYinSanChuan`

**Step 4: 整理现有专门取传函数**

- 保留并调整：
  - `getMaoXingSanChuan`
  - `getBieZeSanChuan`
  - `getBaZhuanSanChuan`
  - `getFuYinSanChuan`

### Task 3: 按九宗门顺序重写 `getSanChuan`

**Files:**
- Modify: `src/utils/daliuren.js`

**Step 1: 清除条文外补丁**

- 删除或停用：
  - `tryReferenceInspiredBiYong`
  - 当前简化 `calculateSheHaiDepth`

**Step 2: 重写高层分派顺序**

- 顺序改为：
  - 伏吟
  - 返吟
  - 贼克
  - 比用
  - 涉害
  - 遥克
  - 昴星 / 别责 / 八专

**Step 3: 保持常规递传只做“初传已定”后的通用计算**

- `buildSanChuanFromInitial` 仅用于适用通用递传的宗门。
- 伏吟、返吟、昴星、别责、八专走各自专门函数。

### Task 4: 实现涉害与返吟条文细则

**Files:**
- Modify: `src/utils/daliuren.js`

**Step 1: 实现涉害深浅计算**

- 不再使用五行循环近似。
- 按候选课对应的临地盘路径计算涉害。

**Step 2: 实现涉害平局裁决**

- 依次处理：
  - 孟
  - 仲
  - 季
  - 干上 / 支上收束

**Step 3: 实现返吟无依 / 无亲**

- 有贼克：无依
- 无贼克：无亲，取驿马发用

### Task 5: 运行项目回归并修正基线

**Files:**
- Modify: `test_daliuren_reference_cases.js`
- Modify: `test_daliuren_fuyin.js`
- Modify: `test_daliuren_bieze_bazhuan.js`
- Modify: `test_daliuren_jiuzongmen.js`

**Step 1: 跑单项测试**

Run:

```bash
node test_daliuren_jiuzongmen.js
node test_daliuren_reference_cases.js
node test_daliuren_fuyin.js
node test_daliuren_bieze_bazhuan.js
```

**Step 2: 跑代码检查**

Run: `npm run lint`

**Step 3: 必要时更新旧基线**

- 若旧测试与九宗门条文冲突，以条文和目标站点交叉验证结果为准更新断言。

### Task 6: 与目标站点对比并输出差异时间

**Files:**
- Create: `scripts/compare_daliuren_with_yypan.js` 或 `test_daliuren_yypan_compare.js`

**Step 1: 生成固定采样时间**

- 范围：`2026-02-01 00:00` 至 `2026-03-31 23:00`
- 粒度：每 2 小时一个样本

**Step 2: 调目标站点取盘**

- 自动化访问 `https://www.yypan.cn/liuren/`
- 读取三传结果

**Step 3: 与本地结果逐条比较**

- 记录：
  - 时间
  - 日柱 / 时柱
  - 本地三传
  - 站点三传

**Step 4: 输出差异清单**

- 若无差异，输出“采样范围内未发现差异”。
- 若有差异，列出全部时间点。

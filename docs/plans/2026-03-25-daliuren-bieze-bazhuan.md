# 大六壬三传补齐别责与八专 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为大六壬三传判课补齐别责课与八专课，修正当前误判到昴星法的问题。

**Architecture:** 保持现有贼克、比用、涉害、遥克与伏吟逻辑不动，只在“无克类”路径中插入别责与八专两个专门分支。通过新增小型纯函数处理干合、支前三合、顺逆数位与四课完整度，避免把 `getSanChuan` 继续写成难维护的大分支。

**Tech Stack:** Node.js、ESM、lunar-javascript、自定义大六壬算法、原生 `assert`

---

### Task 1: 补齐设计与测试样例

**Files:**
- Modify: `src/utils/daliuren.js`
- Test: `test_daliuren_bieze_bazhuan.js`

**Step 1: 选定确定性回归样例**

- 使用仓库内置古课文本中的已知样例。
- 至少覆盖：
  - `2026-02-13T21:30:00+08:00` -> `戊午日干上午` -> `寅午午`
  - 1 个阴日别责样例
  - 1 个八专样例

**Step 2: 写失败测试**

- 新建 `test_daliuren_bieze_bazhuan.js`
- 断言课体对应的三传地支与预期一致

**Step 3: 先运行失败测试**

Run: `node test_daliuren_bieze_bazhuan.js`
Expected: 至少 `2026-02-13 21:30` 用例失败，证明问题已复现。

### Task 2: 实现别责与八专分支

**Files:**
- Modify: `src/utils/daliuren.js`

**Step 1: 增加辅助函数**

- 增加五合映射函数
- 增加三合前神取值函数
- 增加八专顺逆数位函数
- 增加四课唯一上神数量判断函数

**Step 2: 增加别责取传函数**

- 刚日：取干合寄宫上神为初传
- 柔日：取支前三合为初传
- 中末取干上神

**Step 3: 增加八专取传函数**

- 刚日：取日阳顺数三位
- 柔日：取辰阴逆数三位
- 中末取干上神

**Step 4: 接入 `getSanChuan`**

- 在“无贼克、无比用、无遥克”路径中，按 `别责 -> 八专 -> 昴星` 顺序分派。

### Task 3: 执行验证

**Files:**
- Modify: `src/utils/daliuren.js`
- Test: `test_daliuren_bieze_bazhuan.js`
- Test: `test_daliuren_reference_cases.js`
- Test: `test_daliuren_fuyin.js`

**Step 1: 运行新增测试**

Run: `node test_daliuren_bieze_bazhuan.js`
Expected: PASS

**Step 2: 运行既有大六壬回归**

Run: `node test_daliuren_reference_cases.js`
Expected: PASS

Run: `node test_daliuren_fuyin.js`
Expected: PASS

**Step 3: 运行 lint**

Run: `npm run lint`
Expected: PASS

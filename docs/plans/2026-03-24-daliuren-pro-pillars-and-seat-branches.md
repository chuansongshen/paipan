# 大六壬专业计算页增加四柱与三传坐支 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为大六壬专业计算页和导出 XLSX 同步增加 `年柱 / 月柱 / 日柱` 以及三传对应 `坐支` 字段。

**Architecture:** 保持 `getDaLiuRenPaiPan` 作为唯一排盘入口，在专业计算页消费它返回的 `ganZhi`、`sanChuan` 与 `tianPan` 拼装结果行，避免引入第二套推导逻辑。三传坐支在页面本地通过 `tianPan` 反查，页面表格与 XLSX 共用同一批 `resultRows` 字段，确保展示与导出口径一致。

**Tech Stack:** React、Ant Design、dayjs、xlsx、Vite、Node.js

---

### Task 1: 扩展专业计算页结果行

**Files:**
- Modify: `src/components/DaLiuRenProPage.jsx`

**Step 1: 新增坐支反查辅助函数**

- 定义地支顺序常量。
- 增加按天盘地支反查地盘坐支的小函数。
- 反查失败时打印警告并返回 `-`。

**Step 2: 在 `buildRows` 中补齐新字段**

- 从 `pan.ganZhi` 读取 `year/month/day`。
- 从 `pan.sanChuan` 读取 `chu/zhong/mo`。
- 基于 `pan.tianPan` 计算 `chuSeat/zhongSeat/moSeat`。
- 失败记录统一回填 `-`。

### Task 2: 更新页面表格与 XLSX 导出

**Files:**
- Modify: `src/components/DaLiuRenProPage.jsx`

**Step 1: 扩展表格列**

- 追加 `年柱 / 月柱 / 日柱`。
- 为 `初传 / 中传 / 末传` 各追加一个 `坐支` 列。
- 调整横向滚动宽度，避免窄屏截断。

**Step 2: 扩展导出字段**

- 导出列顺序与页面表格保持一致。
- 无结果时继续禁止导出。

### Task 3: 增加回归验证

**Files:**
- Create: `test_daliuren_pro_rows.js`
- Modify: `src/components/DaLiuRenProPage.jsx`

**Step 1: 暴露可测试的纯函数**

- 按需要导出 `buildRows` 或等价纯函数，避免测试依赖 React 渲染。

**Step 2: 编写确定性回归测试**

- 使用固定日期范围与固定时点。
- 断言结果行包含 `year/month/day` 和三传 `坐支` 字段。
- 断言坐支反查结果与对应天盘位置一致。

**Step 3: 执行验证**

Run: `node test_daliuren_pro_rows.js`
Expected: 新增回归测试通过。

Run: `node test_daliuren_reference_cases.js`
Expected: 大六壬参考课例回归继续通过。

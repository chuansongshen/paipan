# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 开发命令

```bash
npm run dev              # 启动 Vite Web 开发服务（http://localhost:5173）
npm run electron:dev     # 同时启动 Web + Electron 桌面壳
npm run build            # 构建 Web 生产包到 dist/
npm run lint             # ESLint 检查
npm run preview          # 本地预览构建结果
```

**运行回归测试**（各领域独立脚本，无测试框架）：
```bash
node test_qimen.js
node test_daliuren_logic.js
node test_liuyao.js
node test_shensha.js
# 其他 test_*.js / test_*.cjs 同理
```

## 架构概览

### 技术栈
- **Electron + React + Vite**：桌面与 Web 双端。Electron 入口为 `electron/main.cjs`。
- **Tailwind CSS v4 + Ant Design**：UI 层。
- **lunar-javascript**：核心农历/干支计算库。
- **iztro**：紫微斗数辅助库。

### 目录职责

| 路径 | 说明 |
|------|------|
| `src/utils/` | 纯算法模块，不依赖 React |
| `src/components/` | React UI 组件，每个术数系统一个文件 |
| `electron/` | 桌面壳（`main.cjs` + `preload.cjs`） |
| `test_*.js` | 根目录回归测试脚本 |

### 五大术数模块

1. **奇门遁甲** — `src/utils/qimen.js` + `src/components/QimenDisk.jsx`
   支持拆补法与置润法定局；涵盖地盘天盘、九星、八门、八神、旬首/值符/值使、神煞。

2. **大六壬** — `src/utils/daliuren.js` + `src/components/DaLiuRenDisk.jsx`
   `src/utils/daliuren_pro.js` + `src/components/DaLiuRenProPage.jsx`（专业版，含四柱）
   核心：天地盘 → 四课 → 三传（含涉害深度算法）；十二天将；神煞。

3. **六爻** — `src/utils/liuyao.js` + `src/components/LiuYaoDisk.jsx`
   支持正时起卦与手动起卦；本卦/变卦/动爻；六兽/纳甲/神煞；卦辞爻辞来自 `src/utils/hexagram_yaoci_data.js`。

4. **八字** — `src/utils/bazi.js` + `src/components/BaZiDisk.jsx`
   四柱干支；十神/纳音/藏干；神煞；刑冲合会；大运；命宫/胎元/身宫。

5. **紫微斗数** — `src/utils/ziwei*.js`（多文件拆分）+ `src/components/ZiWeiDisk.jsx`
   算法拆分为：`ziwei.js`（主排盘）、`ziwei_calendar.js`（历法）、`ziwei_brightness.js`（亮度）、`ziwei_display.js`（显示）、`ziwei_naming.js`（命名）、`ziwei_copy.js`（复制文本）、`ziwei_app.js`（应用层封装）。

### 关键约定

- 算法模块（`src/utils/`）为纯 JS ESM，不引入 React。UI 组件只调用工具函数，不内嵌算法逻辑。
- 常量集中于 `src/utils/constants.js`，干支数据在 `src/utils/zhizhi_data.js`。
- 代码风格：2 空格缩进、分号结尾、优先单引号；组件 `PascalCase`，工具模块小写，常量 `UPPER_SNAKE_CASE`。
- 日志使用作用域前缀，如 `[Qimen]`、`[DaLiuRen]`；算法边界须有 `try/catch`，禁止静默失败。
- 每次修复缺陷须补充或更新对应领域的回归测试脚本。
- 提交信息遵循 `feat(scope):` / `fix(scope):` 格式，每次提交只含一类逻辑变更。

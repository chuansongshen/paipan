# Repository Guidelines（仓库指南）

## 项目结构与模块组织
- `src/` 是 React 应用主目录，入口为 `App.jsx` 与 `main.jsx`。
- `src/components/` 存放各排盘模块 UI 组件，文件名使用 `PascalCase`（如 `QimenDisk.jsx`）。
- `src/utils/` 存放核心算法与数据，包括 `qimen.js`、`daliuren.js`、`liuyao.js`、`bazi.js` 等。
- `electron/` 包含桌面端启动与桥接代码（`main.cjs`、`preload.cjs`）。
- `public/` 放静态资源，`dist/` 为构建产物目录。
- 根目录 `test_*.js` / `test_*.cjs` 为脚本化回归测试。

## 构建、测试与开发命令
- `npm run dev`：启动 Vite Web 开发服务。
- `npm run electron:dev`：同时启动 Web 与 Electron 桌面壳。
- `npm run build`：构建 Web 生产包，输出到 `dist/`。
- `npm run preview`：本地预览构建结果。
- `npm run lint`：执行 ESLint 代码检查。
- `node test_qimen.js`（或其他 `test_*.js`）：运行指定领域的回归测试脚本。
- `docker-compose up -d --build`：构建并启动 Web 部署容器。

## 代码风格与命名规范
- 使用 ESM 与 React 函数组件；UI 逻辑放 `src/components`，算法逻辑放 `src/utils`。
- 保持现有格式：2 空格缩进、分号结尾、字符串优先单引号。
- 命名约定：组件 `PascalCase`，工具模块小写，常量 `UPPER_SNAKE_CASE`。
- 遵循整洁代码原则：函数短小、命名清晰、避免重复逻辑。
- 必须有错误处理：在模块边界使用 `try/catch`，返回明确错误信息，禁止静默失败。
- 必须有必要日志：关键分支与异常路径打印日志，建议使用作用域前缀（如 `[Qimen]`）。
- 注释应简洁，仅用于解释不直观的业务规则或历法算法细节。

## 测试规范
- 优先使用固定时间等确定性输入，避免测试结果波动。
- 测试脚本命名保持 `test_<domain>.js` 或 `.cjs`。
- 每次修复缺陷需补充或更新至少一个回归测试，并在 PR 中写明执行命令。

## 提交与 PR 规范
- 提交信息遵循现有风格：`feat`、`fix`，可带作用域（如 `fix(pai-pan): ...`）。
- 每次提交只做一类逻辑变更，摘要要明确具体。
- PR 至少包含：变更说明、影响模块、已执行的 lint/测试命令、UI 变更截图（如适用）。

# Pai Pan (排盘) - 中国传统术数排盘工具

这是一个基于 **Electron**、**React** 和 **Tailwind CSS** 构建的综合性中国传统术数排盘桌面应用。

## 功能特性

本应用集成了四大核心术数系统：

### 1. 奇门遁甲

* **定局方式**：支持 **拆补法** 和 **置润法**。
* **完整排盘**：
  * 地盘与天盘干支排布。
  * 九星、八门、八神。
  * 宫位生克关系展示。
* **详细信息**：
  * 旬首、值符、值使。
  * 神煞标注（包括马星、空亡等）。

### 2. 大六壬

* **核心系统**：
  * **天地盘**：天盘与地盘的完整展示。
  * **四课**：干支四课排布。
  * **三传**：包含完整的 **涉害** 深度计算算法。
* **神将**：十二天将分布。
* **神煞**：基于年/月/日的详细神煞列表。

### 3. 六爻

* **起卦模式**：
  * **正时起卦**：根据当前时间自动起卦。
  * **手动起卦**：支持手动指定六爻（老阳/少阳/老阴/少阴）。
* **卦象分析**：
  * 本卦与变卦展示。
  * **动爻** 清晰标记。
  * 六兽、纳甲、神煞信息。
  * 完整的卦辞与爻辞解释。

### 4. 八字

* **四柱排盘**：年、月、日、时四柱干支。
* **详细分析**：
  * **十神**：天干与藏干的十神关系。
  * **纳音**：四柱纳音五行。
  * **藏干**：地支藏干及对应的十神。
* **高级特性**：
  * **神煞**：包含天乙贵人、驿马、桃花、禄神、羊刃、文昌等。
  * **刑冲合会**：自动检测三合、六合、六冲等地支关系。
  * **大运**：十年大运排布及起运年龄。
  * **命宫信息**：胎元、命宫、身宫计算。

### 通用功能

* **一键复制**：支持将排盘结果格式化为文本，方便分享和保存。
* **现代界面**：使用 Tailwind CSS 构建的整洁、响应式 UI。
* **跨平台**：支持 macOS、Windows 和 Linux（通过 Electron）。

## 技术栈

* **框架**：[Electron](https://www.electronjs.org/)
* **前端**：[React](https://reactjs.org/)
* **样式**：[Tailwind CSS](https://tailwindcss.com/)
* **核心算法**：[lunar-javascript](https://github.com/6tail/lunar-javascript)

## 快速开始

### 前置要求

* Node.js (推荐 v16+)
* npm 或 yarn

### 安装

```bash
# 克隆仓库
git clone [your-repo-url]

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发模式
npm run electron:dev
```

### 构建

#### 桌面端 (Electron)

```bash
# 构建生产版本
npm run electron:build
```

#### Web 端

```bash
# 构建静态资源 (输出到 dist 目录)
npm run build
```

### Docker 部署

本项目支持 Docker 部署 Web 版本。

```bash
# 构建并启动容器
docker-compose up -d --build

# 访问
http://localhost:8080
```

## GitHub Pages

GitHub Pages 不能直接发布仓库根目录下的开发入口 [index.html](/Users/zhaowentao/Documents/WorkSpace/NodeJS/PaiPan/index.html)，否则页面会去请求 `/src/main.jsx`，最终出现白屏或 `404`。

当前仓库已经补上两项适配：

- [vite.config.js](/Users/zhaowentao/Documents/WorkSpace/NodeJS/PaiPan/vite.config.js) 使用相对 `base`
- [deploy-pages.yml](/Users/zhaowentao/Documents/WorkSpace/NodeJS/PaiPan/.github/workflows/deploy-pages.yml) 自动构建并发布 `dist/`

请在 GitHub 仓库设置中将 Pages Source 设置为 `GitHub Actions`，不要继续使用 `Deploy from a branch`。

## 开源协议

MIT

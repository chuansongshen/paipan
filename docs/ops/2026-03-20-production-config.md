# 生产环境配置说明

## 1. 目标范围

本文档说明当前项目在生产环境上线时，`Gemini + 香港 Vertex AI + 微信支付` 这条链路所需的全部配置项。

当前代码状态：

- 开发环境已经支持 `mock` 支付联调。
- 生产环境的目标配置是 `Vertex AI + 微信支付 JSAPI`。
- 开发环境已经支持 `guest session` 自动创建。
- 服务端已预留 `POST /api/auth/wechat/exchange` 接口位，但尚未真正接入微信 `code -> openid` 网络交换。
- 微信支付真实签名、回调验签与解密还需要在拿到商户配置后继续接入。

## 2. 配置分层

生产环境配置分成 4 类：

1. 应用环境变量
2. Google Cloud / Vertex AI 平台配置
3. 微信支付与微信身份体系配置
4. 基础设施与业务后台配置

## 3. 应用环境变量

以下变量由服务端或前端运行环境直接读取。

### 3.1 服务端必填

这些变量在生产环境必须提供：

```bash
NODE_ENV=production
PORT=8787
LOG_LEVEL=info

GENAI_BACKEND=vertex
PAYMENT_BACKEND=wechat
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
SESSION_COOKIE_NAME=pai_pan_sid
SESSION_COOKIE_SECRET=<strong-random-secret>
SESSION_COOKIE_SECURE=true

GEMINI_REPORT_MODEL=gemini-3.1-flash-lite-preview
GEMINI_FOLLOW_UP_MODEL=gemini-3.1-flash-lite-preview

VERTEX_PROJECT_ID=<google-cloud-project-id>
VERTEX_LOCATION=asia-east2
VERTEX_API_VERSION=v1

WECHAT_APP_ID=<wechat-app-id>
WECHAT_APP_SECRET=<wechat-app-secret>
WECHAT_MCH_ID=<wechat-merchant-id>
WECHAT_NOTIFY_URL=https://<your-domain>/api/payments/wechat/notify
WECHAT_OAUTH_REDIRECT_URI=https://<your-domain>/auth/wechat/callback
WECHAT_OAUTH_SCOPE=snsapi_base
WECHAT_API_V3_KEY=<wechat-api-v3-key>
WECHAT_MCH_SERIAL_NO=<wechat-merchant-cert-serial-no>
WECHAT_PRIVATE_KEY=<wechat-merchant-private-key-pem>
```

### 3.2 服务端可选

当前代码里这些变量不是必须，但生产部署时通常也会配：

```bash
TZ=Asia/Hong_Kong
```

说明：

- `SESSION_COOKIE_SECRET` 必须是足够随机的长字符串，不能继续使用开发环境默认值
- `SESSION_COOKIE_SECURE=true` 仅在 HTTPS 场景下使用

如果后续要接更完整的日志或监控，也建议追加：

```bash
SENTRY_DSN=
OTEL_EXPORTER_OTLP_ENDPOINT=
```

### 3.3 前端必填

前端当前主要需要 API 地址：

```bash
VITE_API_BASE_URL=https://<your-domain>
```

## 4. Google Cloud / Vertex AI 配置

### 4.1 项目与计费

必须完成：

- 创建独立的 Google Cloud 项目
- 开启 Billing
- 开启 Vertex AI API
- 确认目标模型在 `asia-east2 (Hong Kong)` 可用

### 4.2 运行身份

服务端访问 Vertex AI 需要一套 Google 身份，常见做法有两种：

1. 部署在 GCP 上，直接使用服务账号
2. 部署在香港自有服务器，用服务账号密钥或 Workload Identity Federation

建议：

- 优先使用最小权限服务账号
- 不要把高权限 Owner 账号直接给应用使用

建议至少具备：

- `Vertex AI User`
- 读取项目配额与模型调用所需的最小权限

### 4.3 模型配置建议

当前项目约束的模型白名单是：

- `gemini-3.1-flash-lite-preview`
- `gemini-3.1-pro-preview`
- `gemini-3-flash-preview`

建议生产默认值：

- 报告模型：`gemini-3.1-flash-lite-preview`
- 追问模型：`gemini-3.1-flash-lite-preview`

如果后续要做 AB 实验，再通过环境变量切换。

### 4.4 配额与告警

上线前建议配置：

- Vertex AI 请求量告警
- 费用预算告警
- 5xx/4xx 失败率告警
- 单日 token 消耗看板

## 5. 微信支付与微信身份配置

### 5.1 微信支付商户侧必须提供

生产接真实微信支付前，必须拿到以下配置：

- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`
- `WECHAT_MCH_ID`
- `WECHAT_NOTIFY_URL`
- `WECHAT_OAUTH_REDIRECT_URI`
- `WECHAT_OAUTH_SCOPE`
- `WECHAT_API_V3_KEY`
- `WECHAT_MCH_SERIAL_NO`
- `WECHAT_PRIVATE_KEY`

说明：

- `WECHAT_PRIVATE_KEY` 是商户 API 证书对应私钥，通常为 PEM 文本
- `WECHAT_MCH_SERIAL_NO` 是商户 API 证书序列号
- `WECHAT_API_V3_KEY` 用于回调报文解密
- `WECHAT_APP_SECRET` 用于服务端 `code -> openid` 交换
- `WECHAT_OAUTH_REDIRECT_URI` 是微信网页授权回调地址
- `WECHAT_OAUTH_SCOPE` 当前建议先用 `snsapi_base`

### 5.2 JSAPI 的额外前提

当前项目未来生产要走的是 `JSAPI`，这意味着除了支付商户本身，还必须能拿到用户 `openid`。

因此还需要你确定这条身份链路：

1. 公众号 OAuth 获取 `openid`
2. 小程序登录获取 `openid`

如果没有 `openid`，就不能直接调起微信 JSAPI。

这意味着生产前还必须补一层：

- 微信授权登录流程
- `code -> openid` 服务端交换接口
- 用户会话持久化

当前项目已完成：

- 签名 cookie 的 session 基础能力
- `guest session` 开发态自动创建
- `/api/auth/session` 当前会话接口
- `/api/auth/wechat/exchange` 接口位与配置校验

当前项目仍未完成：

- 真实微信 `code -> openid` 远程交换
- 将 `openid` 绑定或创建为内部用户
- 生产环境下基于微信授权完成登录态建立

### 5.3 微信平台侧还需要确认

必须确认：

- 支付商户号与 `AppID` 已绑定
- 回调域名和业务域名均为 HTTPS
- 生产域名已备案并可稳定访问
- 微信侧已允许对应网页授权域名或小程序业务域名

### 5.4 回调接口要求

`WECHAT_NOTIFY_URL` 需要满足：

- 外网可访问
- HTTPS
- 能稳定返回 200
- 服务端时间同步正常

建议实际生产地址形态：

```text
https://api.example.com/api/payments/wechat/notify
```

## 6. 数据库与后端基础设施

### 6.1 PostgreSQL

生产必须提供 PostgreSQL，并在发布前执行迁移。

当前迁移目录：

- [001_initial_schema.sql](/Users/zhaowentao/Documents/WorkSpace/NodeJS/PaiPan/server/db/migrations/001_initial_schema.sql)
- [002_order_payment_flow.sql](/Users/zhaowentao/Documents/WorkSpace/NodeJS/PaiPan/server/db/migrations/002_order_payment_flow.sql)
- [003_user_identity.sql](/Users/zhaowentao/Documents/WorkSpace/NodeJS/PaiPan/server/db/migrations/003_user_identity.sql)

执行命令：

```bash
PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH" npm run dev:api
PATH="$HOME/.nvm/versions/node/v22.16.0/bin:$PATH" node server/scripts/migrate.js
```

注意：

- 生产数据库不能继续使用内存仓储
- 发布前要确认 `DATABASE_URL` 已配置

### 6.2 服务部署

建议：

- API 服务部署在香港
- 保证到 Google Cloud Vertex AI 的外网连通性
- 使用反向代理统一暴露 HTTPS

建议具备：

- Nginx / Caddy / Cloud Load Balancer
- TLS 证书自动续期
- 请求日志与错误日志落盘

## 7. 前端与域名

### 7.1 前端域名

建议准备两套域名：

- Web/H5 前端域名：`https://app.example.com`
- API 域名：`https://api.example.com`

前端配置：

- `VITE_API_BASE_URL=https://api.example.com`

### 7.2 微信内访问

如果未来支付主入口放在微信 H5：

- 页面需要能在微信内稳定打开
- 需要补公众号 OAuth 或其它 `openid` 获取链路
- 支付失败后的回退页、取消页、补单页都要准备

## 8. 业务后台配置

上线前还需要准备这些非代码配置：

- 咨询师卡片信息
- 商品推荐位链接
- 合规文案
- 客服承接方式

当前推荐位数据主要来自：

- [recommendationCatalog.json](/Users/zhaowentao/Documents/WorkSpace/NodeJS/PaiPan/server/config/recommendationCatalog.json)

上线前建议把以下信息后台化：

- 咨询师标题、价格、交付方式
- 商品标题、价格、跳转链接
- 合规提示语
- CTA 文案

## 9. 发布切换清单

生产切换前至少确认以下项全部完成：

1. `NODE_ENV=production`
2. `GENAI_BACKEND=vertex`
3. `PAYMENT_BACKEND=wechat`
4. `DATABASE_URL` 已配置并完成迁移
5. `VITE_API_BASE_URL` 已指向生产 API
6. Vertex AI 项目、计费、权限、配额全部就绪
7. 微信支付商户配置已就绪
8. `openid` 获取链路已实现
9. `WECHAT_NOTIFY_URL` 已可从公网访问
10. 咨询位和商品位链接已替换成真实承接链接

## 10. 当前仍待实现的生产项

虽然配置文档已就绪，但下面这些能力还需要后续代码接入才能真正上线：

- 微信支付 API v3 请求签名
- 微信支付回调验签与报文解密
- 微信 `code -> openid` 真实交换
- `openid` 与内部用户绑定
- 前端真实 JSAPI 调起
- 支付取消、超时、补单处理
- 订单对账与补偿任务

## 11. 建议的下一步

最合理的生产化顺序：

1. 先拿到微信支付商户配置
2. 再补 `openid` 获取链路
3. 然后接微信支付回调验签与解密
4. 最后联调整条 `支付 -> 报告解锁 -> 追问包 -> 对账` 链路

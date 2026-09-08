# apps/web/deploy — Web 配置与上线操作边界

> 更新：2026-09-08。完整方案见 [Production Launch & Operations](../../../docs/DEPLOYMENT.md)；
> 本页只维护 Web 构建配置、支付演示与账号删除入口的操作说明。

## 1. 当前实现与实际发布分开记录

- Web 使用 Vite SPA；现有 GitHub Actions 构建后 Direct Upload 到 Cloudflare Pages。
- 当前 deploy-web.yml 的 Preview 与 Production 都显式使用 mock-authenticated；将其构建成功不代表真实账号产品上线。
- 真实 Auth 页面已经接入 Supabase；支付仍为客户端 stub；account-delete 服务端函数当前未交付。
- deploy/security 是可复用安全库。静态 Pages 不会自动执行库中的 CSP / RUM 接收器；响应头由 public/_headers 提供。
- 2026-09-08 的 CI、历史部署及云端可见性边界见 [审计快照](../../../docs/reviews/production-launch-operations/20260908-current-state-audit.md)。

## 2. 构建变量、服务端 secret 与环境

| 配置 | 放置位置 | 使用要求 |
|---|---|---|
| VITE_WEB_AUTH_MODE | GitHub 对应环境的构建变量 | Demo 可用 mock；账号 Beta 的产物须验证真实模式 |
| VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY | GitHub 构建变量；本机使用 gitignored .env.local | 浏览器可见的项目 URL 与公开客户端 key；不能填 service_role / secret key |
| VITE_STRIPE_PAYMENT_LINK_URL | 仅测试构建变量 | 当前只用于 Payment Link 演示；不得接 live 收费 |
| Sentry DSN / release 等客户端标识 | 对应构建环境的公开配置 | 依代码读取名称配置，并验证事件送达与脱敏 |
| SENTRY_AUTH_TOKEN | CI secret | 只用于 sourcemap 上传，不进入浏览器产物 |
| CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID | GitHub secret / variable，按权限边界配置 | CLI 上传身份与账号定位；token 不写入仓库或浏览器 |
| Supabase 服务端 key、数据库密码、Stripe key / webhook secret、平台 LLM key | 选定后端的 secret store | 不能使用 VITE_ 前缀，不能出现在构建产物 |

Vite 的 VITE_ 值在构建时进入静态 JS。当前 CI 在 GitHub 生成 dist，再用 Wrangler 上传；
只修改 Cloudflare Pages Dashboard 的环境变量不会改写该 dist。改变公开配置后必须在正确环境重新构建并发布。
预览与生产各自产物按 hash 保存；不得把指向测试数据库的预览包直接晋升生产。
详见 [Cloudflare runbook](../../../docs/runbooks/cloudflare.md)。

本机示例模板只维护变量名称与无敏感意义的占位值。真实值通过密码管理器、GitHub Environments 和后端 secret store 恢复；
轮换时更新所有实际消费者并验证，再撤销旧值。不要在命令历史、日志或本页登记实际 secret。

## 3. Premium 当前只能演示

现有 CheckoutSuccessPage 只检查 URL 中存在 session_id，就写入本地 premium_stub；
30 天计时依赖客户端时钟。Cancel Subscription 只清除本地标记，没有请求 Stripe 取消订阅。

因此：

1. 当前构建只接 Stripe 测试环境或禁用 Upgrade CTA。
2. 回跳页面、localStorage、query string 都不是付款证明。
3. 客户端和 Desktop 都不能作为平台付费权益的权威执行端。
4. 不把演示取消按钮描述成真实订阅取消；真实收款前必须补齐后台与用户自助管理。

推荐正式接入路径：登录用户 → 服务端创建 Checkout Session → Stripe 签名验证 webhook →
持久化 inbox / billing state / entitlement → 产品 API 权限判断 → 客户端查询状态。
事件去重、乱序处理、退款、失败续费、宽限期、取消到期与周期对账见
[主文档 §6.5](../../../docs/DEPLOYMENT.md#65-支付订阅与-entitlement)。

Payment Link 的跳转域名 CSP 允许项并不能证明上述后台存在。
当前 public/_headers 的 Stripe connect-src 与相关 source guards 只是既有安全边界；
后续正式 Hosted Checkout 或 Portal 方案改变时，按实际网络需求修改并验证 CSP。

## 4. Account-delete 当前缺少服务端实现

当前客户端会调用 Supabase Edge Function account-delete，但此仓库没有该函数入口。
不能直接执行“部署已有函数”的命令并期望成功。

更严重的现有行为：客户端将 404 当作幂等成功。函数不存在、路由缺失与账号已删除可能无法区分；
关闭或删除函数不能作为安全回滚，因为这可能误触发本地清除并向用户显示成功。

accounts.id 没有声明到 auth.users.id 的外键。删除 Auth 用户不等于业务数据级联删除。
还需要处理设备、会话、同步数据、密文对象、审计保留、第三方连接与支付关系。

### 推荐契约（待实现）

- 从已验证的用户 JWT / 会话获取 account_id；不信任请求参数或 X-Account-Id。
- 删除请求先持久化 operation_id；要求必要的重新认证，停止该账号新增写入。
- 以可重试任务执行资源清理、订阅取消策略、设备与 refresh session 撤销及最终 Auth 删除。
- 返回结构化状态：accepted / running / completed / failed，并提供状态查询。
- completed 必须有可核验的服务端回执；普通 404 不代表成功。
- 对用户透明说明备份中的延迟淘汰、依法需要保留的最少交易记录与不可恢复的 E2EE 密钥边界。
- 对象存储与业务行须先按设计清理，再执行 Auth 管理 API；管理权限仅在后端使用。

这里是目标契约，当前客户端与函数都需要配套改造。测试必须包含缺失函数、超时重试、
重复请求、任务中途失败、残余有效 access token、跨账号删除与备份恢复后的删除抑制。

### 上线与故障处置

账号 Beta 之前完成 staging 实现及端到端删除证据，再发布匹配的客户端与后端。
故障时保留服务端任务与操作编号，显式返回暂不可用，提供可追踪的人工支持入口；
修复后重试并对账，不假报删除成功。

生产环境不能通过切换 mock-authenticated 来恢复真实账号服务，也不能把“清除本机数据”
显示成“删除云端账号”。紧急代码回滚必须选择与当前删除契约、数据库 schema 兼容的已验证版本。

## 5. 验收与维护入口

- [Cloudflare 部署与回滚](../../../docs/runbooks/cloudflare.md)
- [Supabase Auth / migration / backup](../../../docs/runbooks/supabase.md)
- [统一账号、支付、恢复与阶段门槛](../../../docs/DEPLOYMENT.md)
- [上线证据登记](../../../docs/workflow/project/dashboard-state.json)与[发布记录](../../../docs/workflow/project/release-log.md)

任何“上线成功”记录必须包含 commit、环境、构建配置类别、部署 ID、schema 版本、
冒烟结果及回滚目标；不能只记录工作流运行完成。

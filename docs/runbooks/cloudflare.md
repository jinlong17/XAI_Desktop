# Runbook — Cloudflare Pages (XAI Web Console)

> 更新：2026-09-08。统一入口：[Production Launch & Operations](../DEPLOYMENT.md)。
> 当前目标仍是 xai-web-console / Pages Direct Upload，生产源 main。
> 本手册描述可重复操作；本次文档更新没有执行部署或凭据变更。

## 0. 当前状态与开始条件

最新 GitHub 部署在凭据 preflight 失败（Cloudflare code 10000 / membership roles）。7 月有本地 Preview 和旧 Production 的历史记录；当前线上版本与访问策略未核验。详见[证据](../reviews/production-launch-operations/20260908-current-state-audit.md)。

先确认目标账号、项目、production branch、访问策略、候选 commit 与已批准发布范围。已有项目不要重新创建。main 由 web 经确认整合；不能把修复 token 等同于批准立即发布所有积累改动。

## 1. 工具与账号配置

仓库现有 workflow 固定 Wrangler 4.107.1；后续升级需同步锁文件/workflow/runbook。先查工具帮助：

~~~bash
pnpm dlx wrangler@4.107.1 --version
pnpm dlx wrangler@4.107.1 pages project list
pnpm dlx wrangler@4.107.1 pages deployment list --help
~~~

只在确认目标账号无该项目、且首次开通已授权时创建 Pages 项目。Direct Upload 使用预构建制品；不要同时配置 Cloudflare Git integration/Workers Builds 执行第二条发布链。[官方 Direct Upload CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)。

部署 token 的本项目已知要求：

- Account → Cloudflare Pages → Edit，限制到目标账号。
- Wrangler 当前诊断还使用 User → Memberships → Read、Account → Account Settings → Read。
- Zone → Custom Pages 是错误页权限，不是 Pages 托管权限。
- 诊断 code 10000 不能独自证明只缺某一项权限；同时检查有效性、账号匹配、过期、范围。

GitHub Actions 使用 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID。通过密码管理器或 CI secret 注入，不在命令行、日志、Git 或 issue 中粘贴真实值。环境就绪后执行：

~~~bash
pnpm cloudflare:verify-token
~~~

该命令必须通过并能定位 xai-web-console，才进入发布。preview/prod 的凭据与项目隔离、Environment gate 和 workflow 依赖属于主文档 OPS-01/OPS-02 的待实施项。

## 2. 构建变量与制品

**本项目在 GitHub Actions 构建，Cloudflare 只接收产物。** Pages 控制台的构建变量不会自动注入 GitHub runner。当前 workflow 的 Build 只明确设置 mock-authenticated；真实 Auth、release、Sentry、Payment Link 等需要按阶段在 GitHub Build step 映射。

| 类别 | 变量 | 规则 |
|---|---|---|
| 模式 | VITE_WEB_AUTH_MODE | Demo 明确 mock；live 需完整账号验收，不能故障时切 mock |
| 真实 Auth | VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY | 当前代码读取这两个名字；公开配置不等于免除 RLS |
| 监控 | VITE_SENTRY_DSN / VITE_RELEASE | 映射到实际 build；验证事件 release 与制品一致 |
| 付费演示 | VITE_STRIPE_PAYMENT_LINK_URL | 当前仅 test；服务端 billing 未完成不得挂 live 收费 |
| 上传 secret | SENTRY_AUTH_TOKEN 等脚本需要的 CI 变量 | 不进入 VITE_* 或客户端产物 |

在固定 commit 安装 frozen lockfile，运行适用的质量检查再构建。Demo 构建示例：

~~~bash
pnpm install --frozen-lockfile
pnpm --filter @repo/web test
VITE_WEB_AUTH_MODE=mock-authenticated pnpm --filter @repo/web build
~~~

这只包含 Web 默认测试，不替代相关 package、浏览器、SQL 和供应链检查。运行 build:secure 前配置其脚本要求，验证上传/清理；普通 build 的 hidden .map 仍可能被公开下载，发布前清除并断言无 .map。实际部署后单独运行 sourcemaps:deploy:mark。

保存 commit、auth mode、public config 摘要、制品 SHA256、预期 URL、上一生产 deployment ID。生产制品必须和批准的候选完全对应。

## 3. 部署与发布后验收

常规优先通过补齐质量门后的 GitHub workflow。人工发布仅用于已批准的恢复/发布动作，不作为跳过质量门的捷径。

已检查、已批准的 Demo 产物可以从 apps/web 目录上传：

~~~bash
cd apps/web
pnpm dlx wrangler@4.107.1 pages deploy dist --project-name=xai-web-console --branch=main
~~~

feature preview 使用唯一短分支名，不能误传 main。运行前查 Pages project 的 production branch 是否仍为 main。

部署后记录：deployment ID、URL、commit、制品摘要、环境和 release。检查首页/深链/静态资源、实际 CSP/HSTS、无公开 sourcemap、空白页/console error、目标 Auth 模式、宽窄屏关键操作、已有用户数据与 SW 升级。API 探测验证 Content-Type/业务字段，避免把 SPA fallback HTML 误当 API 成功。

当前无凭据 URL 403 需要先定位 Access/访问控制/网络原因，不能直接写“线上宕机”或“smoke 已通过”。外部配置修改后留截图/配置回执，不保存 secret。

## 4. 回滚

先暂停新的自动发布，保留故障 release 和日志，核对后端/schema 仍兼容上一 Web 制品。

1. Pages → xai-web-console → Deployments。
2. 选择**已成功的 Production deployment**，按 commit/ID 核对。
3. Rollback to this deployment。
4. 用真实用户路径验证 URL、缓存/SW、Auth 与 API；登记回滚 ID、原因、时间和恢复证据。
5. 修复源分支后再恢复自动发布，防止下一次 push 把故障版本重新上线。

[官方规则](https://developers.cloudflare.com/pages/configuration/rollbacks/)不允许直接回到 Preview deployment。原手册的“wrangler pages deployment activate”不是本次核验的可用子命令，已移除。

只读列出生产版本：

~~~bash
pnpm dlx wrangler@4.107.1 pages deployment list --project-name=xai-web-console --environment production --json
~~~

控制台不可用时，使用当前官方 API 的 rollback 操作，或重新上传留存且已验收的旧生产制品。先验证工具帮助、目标环境和审批范围，不临时猜命令。数据库回滚、Auth 降级、原生更新撤回分别按主文档 §9.5，不能以 Pages 回滚代替。

## 5. 域名、缓存、配额与监控

- 先核对自有域名和 DNS，配置 app 子域及自动证书；把域名续费和 TLS 到期纳入外部探测。
- 现有 _headers 带长期 HSTS/includeSubDomains/preload。确认覆盖范围；出现 preload 指令不代表域名已经加入浏览器 preload 列表，不能未经评估提交。
- 缓存规则与 SW 版本策略必须覆盖新旧资源兼容；新 HTML 不得引用已删除的旧 chunk。
- Direct Upload 的构建发生在 GitHub，重点观察 Actions 分钟/存储、上传限制、动态调用和日志计费，不把 Pages Git build 次数当作本项目唯一 CI 成本。
- 文件数/单文件限制按[当前 Pages 限制](https://developers.cloudflare.com/pages/platform/limits/)检查产物；不要长期写死“dist 只有 8 个文件”。
- Sentry 错误、Cloudflare 指标、独立 uptime 各有职责；必须验证告警到达。

## 6. 凭据轮换与灾难恢复

正常轮换：创建新 token → 在目标环境 preflight → 更新 secret → 验证指定运行 → 撤销旧 token。确认泄露则立即撤销受影响 token，按 incident 处置。

Cloudflare 账号不可用时，先通过独立恢复邮箱/MFA 恢复控制权。若需迁移账号，恢复项目、DNS、域名绑定、Access/Turnstile、secret、R2 和监控，而不是只更新 account ID。核对域名控制权和旧账号数据后执行切换；发布源与制品仍应来自 GitHub 已保存证据。

每次操作将实际结果写入部署 receipt，再更新 release-log 和 dashboard；未执行不标通过。

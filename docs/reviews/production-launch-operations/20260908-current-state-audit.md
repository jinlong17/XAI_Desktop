# Production Launch & Operations — 2026-09-08 现状证据

> 类型：只读审查记录；不代表部署、开通账号、数据库迁移或发布批准。
> 主文档：[产品上线运行闭环](../../DEPLOYMENT.md)。
> 查询日期：2026-09-08（UTC）；代码与外部状态分开记录。

## 1. 审查基线

本次开始时共享工作区为干净的 web 分支；另一任务随后切换了分支。本审查在独立 worktree、独占短分支 codex/web/production-launch-operations-20260908 完成，未覆盖另一任务的文件。

fetch 后固定以下远端对象，后续工作即使移动分支，也不改变本记录的结论范围：

| 分支 | 完整 commit | 用途 |
|---|---|---|
| origin/web | 9257be40c03216b1006691bfa289bd29d6dfe839 | 主审查基线 |
| origin/main | 9a61669b1f67197f6f75f341c79ef35be8a6d0e4 | 当前生产源分支 |
| origin/dev | 343cc5f1002559291b3f8fd1511b93c6e1196082 | Mac 当前实现 |
| origin/desktop-plugin-next | ae72888f4c50d8d678eef670c9bff4c27b3e373d | 插件平台基础 |
| origin/codex/mobile/native-thin-shell-mvp | 05f04b151998fa5bc2e8f01f7e3300aed9582e5b | 移动端试验资产 |

git rev-list --left-right --count origin/main...origin/web = **0 / 72**。这一刻 web 可向 main 快进；这是拓扑事实，不是发布批准，也不能假定未来仍可快进。web 与 dev 的独立演进继续遵守 ADR-0013。

## 2. 当前 GitHub 证据

| 查询对象 | 结果 | 含义 |
|---|---|---|
| [Deploy Web run 34214653502](https://github.com/jinlong17/XAI_Desktop/actions/runs/34214653502) | 2026-09-08，PR，head 9257be4；安装、Build 通过；Verify Cloudflare credentials 失败；Deploy skipped | 最新代码能完成此 mock 构建，但本次没有部署 |
| 同一 run 的失败日志 | Cloudflare Authentication error code 10000；Unable to get membership roles；提示 User→Memberships→Read | 凭据认证/权限需实际修复；不能只凭日志断言唯一缺的权限 |
| [Supply-chain run 34214653513](https://github.com/jinlong17/XAI_Desktop/actions/runs/34214653513) | Rust exact pins、RFC vectors/CBOR 通过；OSV 和 cargo-deny 失败 | 7 月历史“供应链全绿”已不能用作当前发布证据 |
| 同一 supply-chain 失败日志 | OSV 报告包括 Next、PostCSS、React Router、Undici 等；cargo-deny 报告 h2 advisory | 需逐项评估发布路径可达性、补丁与例外到期；不是所有扫描命中都等于当前 SPA 可被利用 |
| [main 最近部署 run 27061053762](https://github.com/jinlong17/XAI_Desktop/actions/runs/27061053762) | 2026-06-06，9a61669，failure | GitHub 的 main 最近部署运行不证明当前线上版本 |

工作流源：[deploy-web.yml](../../../.github/workflows/deploy-web.yml)、[supply-chain-security.yml](../../../.github/workflows/supply-chain-security.yml)。

- 部署工作流是 PR preview / main production，构建固定 VITE_WEB_AUTH_MODE=mock-authenticated。
- 未串接 lint、typecheck、业务单测、浏览器 E2E、SQL 集成测试、build:secure 或部署后 smoke。
- 两份 workflow 无 needs 依赖；供应链失败不会天然阻止部署 job。分支保护是否生效需单独验证。
- 未见 production concurrency、GitHub Environment 发布门、迁移、备份、桌面/商店发布 workflow。
- 本次没有重跑全部产品测试；引用的是以上真实 CI 结果与仓库测试代码，不能标成全量验收通过。

## 3. Cloudflare / Supabase 外部状态边界

[dashboard-state.json](../../workflow/project/dashboard-state.json) 和 [release-log.md](../../workflow/project/release-log.md) 的 2026-07-09 记录载明：

- 本地 Wrangler Preview：280a3451-3912-4e4e-8dd0-46baa3e217d2，source 2966bba，有当时桌面/390px smoke。
- 当时查询到 Production：1cc04a60-02b8-4579-97f1-52f84de3d3d6，source 9a61669。
- 这两项是**已存在的历史部署证据**，不能再写“从未部署”，也不能写成“最新代码在线”。

本次本机 Wrangler 4.107.1 的只读 deployment list 因无可用 CLOUDFLARE_API_TOKEN 失败；未登录、未修改凭据。对 production 与 web preview 域名的无凭据 HTTP 请求均返回 403。未确认是否来自访问控制、网络出口或其他配置，**不能据此判定服务宕机，也未完成用户浏览器 smoke**。

Supabase connector 的 list_projects 返回 UNAUTHORIZED / reauthentication required。故当前项目是否存在、地区、套餐、migration、函数部署、SMTP、备份均为**外部未验证**。本机存在变量模板不等于远端已 provision；旧 runbook 的“NOT YET PROVISIONED”也不能继续当作当前事实。未读取或打印真实 .env 值。

## 4. 产品能力证据

| 能力 | 当前代码证据 | 上线差距 |
|---|---|---|
| Web Auth | [AuthPage](../../../apps/web/src/pages/AuthPage.tsx) 实际使用 WebAuthPage；[auth-actions](../../../packages/web-auth-device-session/src/auth-actions.ts) 有注册、密码登录、重置、Google/Apple OAuth；[client](../../../packages/web-auth-device-session/src/client.ts) 配 PKCE | 构建仍 mock，真实提供商和邮件未验证 |
| Session | [storage](../../../packages/web-auth-device-session/src/storage.ts) 用 IndexedDB 保存 session、sessionStorage 保存 PKCE transient；client 启用 refresh | Web 并非 HttpOnly cookie 会话；XSS 风险与原生 Keychain 接入需验证 |
| 设备登录 | [device-transport](../../../packages/web-auth-device-session/src/device-transport.ts) 调 device_register / device_heartbeat RPC | migration 目录未见这两个 RPC 定义；device_register 在 audit 枚举中出现不能视为函数实现 |
| 账号删除 | 客户端调用 account-delete、成功后本地擦除 | functions 目录不存在 account-delete；当前 404 当成功可能掩盖函数未部署，需修订协议 |
| 数据隔离 | 11 个 [migrations](../../../apps/release-site/supabase/migrations) 包括 RLS、nonce、rekey、审计、commit_seq | accounts.id 只有“=auth.users.id”注释，没有 auth.users 外键；删除 Auth 不保证删除业务表 |
| 同步处理器 | sync-push/pull 有 Deno.serve 和 Postgres adapter | 未见浏览器 CORS/OPTIONS 完整封装及可复现 Supabase config.toml；不能直接照旧 runbook 发生产 |
| 请求身份 | [request-context](../../../apps/release-site/supabase/functions/_shared/request-context.ts) 只 decode JWT payload，并有 X-Account-Id fallback | 签名与设备校验依赖未证明的上游边界；必须在真实部署配置下做伪造/跨账号负例 |
| 恢复 | [recovery-proof/index.ts](../../../apps/release-site/supabase/functions/recovery-proof/index.ts) 的 Deno.serve 固定返回 501 database_adapter_not_bound | handler 存在不等于可部署恢复服务 |
| onboarding | onboarding-backfill 只有 handler.ts | 没有默认 index.ts/生产入口绑定 |
| 端到端加密 | crypto/outbox/密文表与测试存在；[AppProviders](../../../apps/web/src/providers/AppProviders.tsx) 从 user/app metadata 读原始 todo DEK | 禁止以 metadata 存原始 DEK 的方式上线 E2EE；未证明生产会设置这些字段，属于必须排除的接线路径 |
| 支付 | [CheckoutSuccessPage](../../../packages/plugin-web-settings-rest/src/CheckoutSuccessPage.tsx) 仅检查 session_id 存在后写 premium_stub；取消只清本地 | 无可信 subscription、webhook、entitlement、退款与对账服务；禁止承载真实收费 |
| AI | [claudeStreamAdapter](../../../packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts) 从客户端 key store 取 key 并直接 fetch provider | 是 BYOK/客户端调用基础；没有平台托管 AI 的服务端额度账本和全局成本硬限制 |
| 日志监控 | Web Sentry、RUM 脱敏、安全库及 sourcemap 脚本已在树中 | 普通 CI build 未上传/清除 maps；/__rum、CSP ingest 库未绑定线上 Worker；未验证告警到达 |
| 离线更新 | [sw.js](../../../apps/web/public/sw.js) 固定 cache 名，只预缓存 / 与 /index.html | 未证明完整 JS/CSS 离线、跨版本缓存兼容、回滚后旧浏览器可恢复 |
| SQL 测试 | [archive package](../../../apps/release-site/package.json) 有 test:rls:integration 等 | README 的“G9 nightly 已运行”无当前两份 workflow 支持；这些是 Vitest/Docker 测试，不能直接等同 supabase test db |

## 5. Mac、插件与移动端

Mac 以 [dev 基线配置](https://github.com/jinlong17/XAI_Desktop/blob/343cc5f1002559291b3f8fd1511b93c6e1196082/apps/desktop/src-tauri/tauri.conf.json) 为准：主窗口承载 apps/web/dist，版本 1.0.0-rc.1；构建仍 mock，updater URL/pubkey、Sentry DSN 是占位。commands/updater.rs 已有真实检查适配和内部通道，但发现更新时标记 InstallUnavailable，不能宣称安装更新闭环已完成。签名、公证、更新安装与回退未在本次验证。

desktop-plugin-next 已有平台基础，不应把“插件包暂停”写成“所有平台代码均未开工”。是否通过 G1 产品 gate 必须回到对应 dev_log/roadmap，不能由分支存在推导。

移动端是远端独立试验分支，未进入本次 web/main 基线：

- [Mobile README](https://github.com/jinlong17/XAI_Desktop/blob/05f04b151998fa5bc2e8f01f7e3300aed9582e5b/apps/mobile/README.md)：Capacitor 封装 Web 产物，有 iOS 和 Android 原生工程。
- [iOS 历史 smoke](https://github.com/jinlong17/XAI_Desktop/blob/05f04b151998fa5bc2e8f01f7e3300aed9582e5b/docs/reviews/mobile-native-thin-shell/20260611-ios-simulator-smoke.md)：2026-06-11 模拟器安装/启动通过；未做真机签名。
- [Android 历史 smoke](https://github.com/jinlong17/XAI_Desktop/blob/05f04b151998fa5bc2e8f01f7e3300aed9582e5b/docs/reviews/mobile-native-thin-shell/20260611-android-debug-smoke.md)：环境阻塞，无成功 APK 验收证据。
- 未发现本次可用的商店支付、商店发布及统一云同步验收证据。不能把该试验资产直接升级为 active 产品线。

## 6. 维护方式

本记录保留固定基线；未来审查新建同目录日期记录，由主文档更新“最近核验”链接。关闭缺口须附新 commit、CI/部署 receipt 和实际运行证据；文档、单测、模拟器、生产各自的证据不能互相替代。

## 7. 本次文档交付验证

- 相对文件链接与标题锚点检查：68 项通过；引用的 package script：37 处通过。
- dashboard-state.json 解析、git diff --check、生成器 Node 语法检查通过。
- pnpm dashboard、dashboard:verify-static、dashboard:verify-modules 通过：六个既有模块，66 个 Skill/Agent，registry resolved。
- 看板只同步已有数据域的摘要/实查结果，没有更改页面渲染、模块授权或 roadmap 状态；机器契约、模板与卡片边界保持匹配。
- 生成快照仅留本机，源码文档与人工登记入 Git。未执行生产部署、数据库迁移、真实支付或全量产品回归。

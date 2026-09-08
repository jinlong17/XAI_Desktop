# XAI 产品上线运行闭环 / Production Launch & Operations

> **最近核验：2026-09-08 · Owner：project-system · 主归属：web**
>
> 本文在原有 Deployment Architecture & Launch Plan 上持续维护，保留 docs/DEPLOYMENT.md 作为统一入口，覆盖 Web、Mac、移动端、账号云、支付和运维。
> **现状由代码与运行证据证明；推荐架构和待办不代表已经实现，也不构成本次生产发布授权。**
> 固定基线、CI 结果、外部访问限制见[本次现状证据](reviews/production-launch-operations/20260908-current-state-audit.md)。
> 继续服从 [ADR-0008](adr/0008-cloudflare-deploy-target-and-csp.md)、[ADR-0013](adr/0013-branch-sync-governance.md)、[ADR-0010](adr/0010-p1-desktop-resume-plan.md) 和[产品模块导航](PRODUCT_MODULE_MAP.md)。推荐新增服务不自动修改这些 ADR 或解冻产品线。

## 0. 阅读与维护入口

| 问题 | 入口 |
|---|---|
| 当前能上线什么、还差什么 | §1 现状、§4 发布层级、§7 上线验收 |
| 最终架构、Cloudflare 如何选 | §2 架构、§3 Cloudflare 能力 |
| 从开发到持续运行的完整流程 | §5 开发/测试/部署/发布、§9 运维/恢复 |
| 多端登录、用户隔离、删除、同步 | §6.1–§6.4 |
| Web / Apple / Google 支付与权限 | §6.5 |
| 需要多少外部服务账号 | §8 服务台账与成本 |
| 接下来按什么顺序做 | §10 执行阶段、§12 决策边界 |
| 具体操作手册 | [Cloudflare](runbooks/cloudflare.md)、[Supabase](runbooks/supabase.md)、[Web 环境与接口](../apps/web/deploy/README.md)、[Mac 发布](release/dmg-build.md)、[支持 SOP](release/support-sop.md) |

文档职责：本文维护长期流程、门槛、依赖与当前摘要；runbook 维护操作步骤；日期审查记录保留证据；[release-log](workflow/project/release-log.md) 记录变更；[dashboard-state](workflow/project/dashboard-state.json) 镜像摘要。工作流 SHIPPED、部署成功、生产验收通过分别记录。

## 1. 当前现状与缺口

### 1.1 总体判断

**项目已有可部署的 Web 演示产品、较完整的账号/同步基础代码、Mac 宿主及移动端试验资产；尚未形成可证明、可重复的真实账号付费生产闭环。**

最短路径是先修复已有部署与质量门，再上线可运行的账号 Beta，随后增加服务端收费权限。云同步、Mac 商业发布和移动端商店发布分别验收。真实账号可以先于业务数据云同步，但必须完成账号隔离、删除、邮件、会话和备份，且把现有登录流程中对同步设备/密钥的依赖解耦或补齐。

不继续使用旧版的 95%/45%/30% 成熟度估算，以下按“实现 / 验证 / 运行”判断。

### 1.2 能力矩阵（固定代码基线 web 9257be4）

| 能力 | 已有实现或资产 | 验证/运行证据 | 待补齐 |
|---|---|---|---|
| Web 产品与构建 | Vite SPA、模块、路由、浏览器持久化、CSP/HSTS、基础 Service Worker | 9 月 8 日 GitHub mock build 通过；7 月有真实 preview 部署和 smoke 记录 | 最新版本生产部署、关键路径验收、离线/更新/导入导出完整性 |
| CI/CD | main→production、PR→preview；Wrangler 4.107.1；供应链 workflow | 最新 deploy 在 Cloudflare 凭据 preflight 失败；OSV/cargo-deny 当前失败 | 质量检查与部署依赖、环境保护、制品、并发控制、部署后验收 |
| 注册/登录 | WebAuthPage、邮箱注册/登录、重置密码、Google/Apple OAuth、PKCE | 有单测；生产 CI 仍固定 mock；真实提供商配置未核验 | 真实邮件、回调、账号建立、设备 RPC、真账号端到端验证 |
| Session/设备 | IndexedDB session、PKCE sessionStorage、自动刷新、设备 bridge | device_register/device_heartbeat RPC 在当前 migrations 未见定义 | 设备生命周期、登出/吊销、多账号本地隔离、原生安全存储 |
| 账号删除 | 客户端编排、调用 account-delete 后本地擦除 | 无服务端 account-delete；404 被当成功 | 可信删除回执、业务/对象/订阅清理、残余 token 阻断、删除后恢复策略 |
| 数据库与同步 | 11 个 SQL migration；RLS、outbox、nonce、commit_seq、rekey、审计、push/pull adapter | 外部 Supabase 未验证；recovery-proof 入口返回 501；onboarding 缺默认入口 | 可复现部署配置、身份/CORS/连接边界、恢复绑定、hardening、真实双设备验收 |
| 支付 | Stripe Payment Link CTA、success/cancel 页面、premium_stub | 仅检查 URL 参数和本地 30 天计时；无可信支付后端 | webhook、账户绑定、subscription/entitlement、退款、恢复购买、对账 |
| Agent / AI | 多 provider 客户端适配、流式输出、工具调用、BYOK 路径 | 没有已验收的平台托管额度/成本控制服务 | 服务端密钥、配额账本、限流、超时/重试、审计与滥用控制 |
| 监控/日志 | Web Sentry/RUM 脱敏代码、sourcemap 上传脚本、CSP/RUM 安全库 | 普通部署 build 未接 secure 链；线上 DSN/告警未验证；库未成为线上 endpoint | 错误到达验证、release 关联、可用性监控、后端指标、日志保留 |
| 备份/故障恢复 | 导出/加密恢复相关基础与草案 | 无本次可核验的自动备份成功/恢复演练 receipt | 数据+对象+配置备份、异地副本、恢复演练、RPO/RTO |
| Mac | dev 343cc5f 的 Web 容器、原生命令、Keychain/updater 适配 | 配置仍 mock；updater URL/pubkey/DSN 占位；更新安装未闭环 | 签名、公证、正式 updater、迁移/升级/故障回退、真实设备验收 |
| iOS / Android | 远端移动薄壳分支有 Capacitor 和双原生工程 | 历史 iOS 模拟器 PASS；Android 当时环境阻塞；未合入 web/main | 产品线批准、真机、Auth 安全存储、支付、商店发布/升级验收 |
| Admin / 插件 | Admin 原型+roadmap；插件平台已有基础代码 | 无生产控制面或商业插件发版验收 | RBAC/审计/secret 边界；按 G1 与现有 roadmap 推进 |

逐项代码路径与 CI 链接见[证据记录](reviews/production-launch-operations/20260908-current-state-audit.md)。本次没有重跑全量产品测试，没有进行真实收费、迁移或发布演练。

### 1.3 线上事实与未验证范围

- GitHub 仓库当前为 private；main 9a61669 是发布源，web 比 main 多 72 个提交、main 无独有提交。发布时必须重新 fetch 核对，不能把这个数字变成长期规则。
- 7 月记录已有 Preview 与旧 Production deployment ID，不能再写“从未部署”。但这些记录不能证明最新 web 已上线。
- 当前无凭据 HTTP 探测 production/preview 返回 403，本机 Wrangler 缺可用 token；未确认访问控制或网络原因，因此线上健康和实际服务 commit 为**未验证**。
- Supabase connector 需要重新认证。是否已有项目、SMTP、备份或函数部署均为**未验证**，不能继续依据 6 月文档宣称“尚未开通”。
- 域名所有权、Sentry 项目、Stripe live 资格、Apple/Google 发布账号也未核实；§8 是需维护的台账，不是已注册账号清单。

## 2. 推荐最终架构与服务依赖

### 2.1 适合一人维护的主栈

**Cloudflare 承担交付与边缘能力，Supabase 承担统一身份和 Postgres 数据，GitHub 承担代码与发布，Sentry 承担错误监控，Stripe 承担 Web 收费。**

继续复用现有 Pages；新增动态边缘需求优先用 Workers。登录、删除、支付和同步业务后端先放在同一个 Supabase Edge Functions 工程，减少两套后端部署、两份权限实现。需要平台托管 AI、长连接协调或队列时才增加 Worker；Worker 不能重新实现另一套用户/订阅事实源。

~~~mermaid
flowchart TB
  GH["GitHub：源码、CI、制品与发布凭据"]
  CF["Cloudflare：DNS / TLS / Pages / CDN"]
  WEB["Web：SPA + IndexedDB"]
  MAC["Mac：Tauri + 本地数据库 + Keychain"]
  MOB["iOS / Android：后续原生分发"]
  AUTH["Supabase Auth：统一 user_id"]
  API["Supabase Edge Functions：账号 / 删除 / Billing / Sync"]
  DB["Postgres：RLS / 订阅权限 / 密文同步 / 审计"]
  OBJ["Supabase Storage：需要时的用户附件"]
  EDGE["按需 Worker：AI 代理 / Queues / 边缘防护"]
  PAY["Stripe / Apple / Google：各自交易事实源"]
  MAIL["单一事务邮件服务：SMTP"]
  OBS["Sentry + 平台指标 + 独立可用性探测"]
  BACKUP["私有 R2 备份 + 离线配置/恢复材料"]
  GH --> CF --> WEB
  GH --> API
  WEB --> AUTH
  MAC --> AUTH
  MOB --> AUTH
  WEB --> API
  MAC --> API
  MOB --> API
  API --> DB
  API --> OBJ
  AUTH --> MAIL
  PAY --> API
  API --> EDGE
  DB -. "加密导出" .-> BACKUP
  OBJ -. "对象另备份" .-> BACKUP
  CF -.-> OBS
  API -.-> OBS
  EDGE -.-> OBS
~~~

图中除现状矩阵标明的实现外，均是目标组件。移动端不因出现在图中而成为 active 产品模块。

### 2.2 唯一事实源与边界

| 数据/状态 | 唯一事实源 | 客户端/缓存职责 |
|---|---|---|
| 用户身份、登录 session | Supabase Auth；内部统一 user_id | 各端独立登录与刷新，不跨设备传递 refresh token |
| 角色和授权 | 服务端角色/成员关系；RLS + API | UI 只展示；不能以 localStorage 或可编辑 user_metadata 判权 |
| 交易、退款 | Stripe / Apple / Google 各自后台 | 回调页只展示处理进度 |
| 产品 entitlement | Postgres 中由已验证交易投影得到的统一权限状态 | 带版本和有效期缓存；服务端重新判权 |
| 本地业务数据 | 当前设备 repository | 本地优先；明确哪些只在本机 |
| account-sync 业务数据 | 加密账号云及协议版本/commit_seq | 多端经云协调；按 ADR-0013 D4 |
| 发布版本 | 指定 commit + 制品摘要 + deployment receipt | 看板只镜像已核验事实 |
| 运维配置/secret | Git 中无值配置 + 密码管理器/云 secret store | 构建仅获得需要的变量，secret 不进入制品 |

“服务器只存密文”仅适用于**符合协议的业务同步内容**。账号邮箱、设备标识、交易、权限和必要审计元数据仍由服务端处理。AI 请求中用户主动发送给 provider 的内容也不享有该同步加密边界。当前从 Auth metadata 读取原始 DEK 的接线必须在 E2EE 上线前移除。

### 2.3 当前需要与增长后再加的组件

近期：Pages + Supabase Auth/Postgres/Edge Functions + SMTP + 监控。付费时加 Stripe。R2 在云数据备份或安装包分发需要时启用；同一个用户附件不要同时以 R2 和 Supabase Storage 双主写入。

暂不额外接 Firebase、独立 Auth SaaS、第二个 SQL 数据库、自管 Redis、Kubernetes、常驻容器或另一家前端托管平台。只有现有运行时经过实际负载验证不满足要求，才增加替代设施。平台托管 AI 可先用同一后端的有界流式请求，运行限制或边缘需求明确后再加 Worker。

## 3. Cloudflare 能力复审（2026-09-08 官方资料）

| 能力 | 当前适配判断 | 采用阶段与约束 |
|---|---|---|
| Pages | **继续使用现有项目**，Direct Upload 与 Vite SPA 匹配 | 修复 CI 和回滚证据即可继续；不要把迁移 Workers 作为首发前置 |
| Workers + Static Assets | 新动态边缘服务及将来统一静态/动态入口的优先候选 | 官方已有 Pages 迁移指引、SPA/headers 支持。先验证预览、域名、CSP、缓存、回滚，再以独立变更更新 ADR-0008 |
| D1 | 不替换本项目账号/同步主库 | SQLite 不能直接承接现有 Postgres RLS、RPC、锁与迁移。官方当前单库上限 10 GB（Paid），Time Travel 按计划有保留期限；更适合未来隔离的小型边缘索引 |
| R2 | 私有异地备份、DMG/updater 制品、大对象适用 | 与 Cloudflare 同账号；独立 bucket/权限、不可变对象名、校验、生命周期。Bucket Lock 可作为保留保护；同账号仍有共同故障风险 |
| KV | 低频配置、公开缓存、可容忍短暂旧值的 feature flag | 最终一致，不能作为订阅权限、立即吊销、支付幂等或硬额度的唯一依据 |
| Queues | 支付/删除/AI 后台任务增长时适用 | 至少一次投递且不保证顺序；消费者幂等、重试、DLQ、积压告警。小规模先用 Postgres inbox/outbox + 单一调度器 |
| Durable Objects | 后续每账号并发协调、实时房间、集中限流 | 单对象强一致存储适合协调；不用于重写已存在的加密同步协议；跨对象仍需设计一致性 |
| Turnstile | 开放注册、找回密码、公开表单时接入 | 服务端校验 token/hostname/action；不能只渲染组件。与 Auth 限流组合，不能替代登录授权 |
| Zero Trust / Access | 保护 staging、运维入口和未来 Admin | 使用现有管理身份；源站验证 Access token、阻止绕过。产品终端用户仍使用 Supabase Auth；支付 webhook 不应被交互式登录挡住 |
| Analytics | Web Analytics 用于访问/性能，平台指标用于服务健康 | 不等同错误追踪或付费漏斗；需要产品事件时再补最小事件集，不预装多套 Analytics |
| Workers Logs / Traces | 启用 Worker 后采用 | 有配置、采样和保留限制；不能代替长周期审计账本。日志脱敏，告警验证实际到达 |
| Email Service | **新增的账号精简机会** | Email Sending 仍为 Beta，Workers Paid 可用且已有 SMTP；可验证后接 Supabase custom SMTP。未获启用资格或投递验证未过时，用一个成熟 SMTP 服务 |
| AI Gateway / Workers AI | 后续集中 AI 用量与路由的候选 | Unified Billing 可减少单独 provider 账号，但只覆盖支持的模型/地区；不自动提供产品用户配额。禁存敏感 prompt 日志，明确 BYOK 与平台付费边界 |
| Cron / Workflows | 有界定时核对、持久任务编排可按需采用 | 定时任务要有最后成功时间、重入锁、重试上限；不用多个调度平台重复消费同一工作 |

依据：[Pages→Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)、[D1 限制](https://developers.cloudflare.com/d1/platform/limits/)、[R2 Bucket Lock](https://developers.cloudflare.com/r2/buckets/bucket-locks/)、[KV 一致性](https://developers.cloudflare.com/kv/concepts/how-kv-works/)、[Queues 投递](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)、[DO 存储](https://developers.cloudflare.com/durable-objects/best-practices/access-durable-objects-storage/)。

安全与运营依据：[Turnstile 服务端验证](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)、[Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/)、[Web Analytics](https://developers.cloudflare.com/web-analytics/about/)、[Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)、[Email Service](https://developers.cloudflare.com/email-service/)、[SMTP](https://developers.cloudflare.com/email-service/api/send-emails/smtp/)、[AI Gateway Unified Billing](https://developers.cloudflare.com/ai-gateway/features/unified-billing/)。

以上是结合代码的架构判断，不是已经完成的资源配置。不会因为 Cloudflare 功能齐全就一次性启用全部组件。

## 4. 发布层级与多端矩阵

### 4.1 发布产品能力按层验收

| 层级 | 对用户承诺 | 进入条件 |
|---|---|---|
| Public Demo | 明确演示/本地保存，不承诺云同步或真实订阅 | 无真实收费、无平台密钥、导出/导入覆盖说明、反馈/错误入口、已验收部署和回滚 |
| Account Private Beta | 真实账号、会话和账号管理；业务数据仍可只本地 | Auth/邮件/隔离/删除/备份通过；明确“登录不会自动备份本地数据” |
| Paid Web Beta | 真实收费对应可用能力 | 账号 Beta + billing 全生命周期、entitlement、退款/取消、成本硬限制、付费支持 |
| Account-sync Beta | 明确列出的实体跨设备同步 | 解冻授权 + #37 hardening + D4 九项 + 双设备与恢复演练 |
| Web / Mac GA | 稳定性、支持和维护承诺 | 对应平台全部 gate、版本/数据兼容与可用性指标有连续证据 |
| iOS / Android 商店发布 | 原生发行、平台购买与恢复 | 正式产品线批准、真机与商店审核、账号/支付/隐私/升级闭环 |

账号、支付状态跨端一致可以早于业务数据云同步；二者分别使用服务端权限接口与 D4 同步协议。

### 4.2 产品模块与分发

| 模块 | 当前路线 | 发布边界 |
|---|---|---|
| web | codex/web/* → web → 经确认的 main 发布 | main 仍是生产源；不得悄悄改成 web 自动发生产 |
| app | D3 后进入 desktop-next → dev → release/desktop/* | 不直接 web→dev；新长期/发布分支、dev promotion 仍按既有 operator gate |
| plugin | desktop-plugin-next 的平台基础 + 分期插件包 | 平台/G1 与暂停插件包分开；包版本与宿主/API 兼容矩阵一起记录 |
| sync | codex/sync/*，按 sync-v1 与 account-cloud-sync-foundation | 当前暂停策略不因本文变更；只同步 account-sync 实体 |
| site | 仍需确认独立官网工作 | 下载/隐私/删除说明可先复用已授权 Web 路由；不必为每类页面再开一套平台 |
| admin | 已 operator 激活但 roadmap-gated | 先复用云平台管理后台；生产自建控制面需 RBAC、MFA、审计和 secret gate |
| 移动试验资产 | codex/mobile/native-thin-shell-mvp | 作为已有资产参考；不添加第七个 active 模块，也不自动合入或上架 |

## 5. 产品上线完整流程与自动化

### 5.1 一次发布的闭环

~~~mermaid
flowchart LR
  DEV["需求/风险/兼容设计"] --> PR["短分支开发与 PR"]
  PR --> CI["静态检查 + 单测 + 集成 + 构建"]
  CI --> STG["隔离 staging + migration + E2E"]
  STG --> RC["冻结 commit 与制品/回滚方案"]
  RC --> APPROVE["批准本次发布范围"]
  APPROVE --> MIG["兼容 schema / 后端"]
  MIG --> DEPLOY["部署已验收制品"]
  DEPLOY --> SMOKE["线上 smoke + 指标观察"]
  SMOKE --> OK["登记版本与用户发布说明"]
  SMOKE --> FAIL["停推广/降级/回滚"]
  OK --> OPS["监控/备份/支持/成本"]
  FAIL --> FIX["修复与复盘"]
  OPS --> FIX --> DEV
~~~

“部署成功”仅是资源切换完成；只有 URL、release、功能、监控、回滚证据齐全后才把版本标记为生产可用。人工动作集中在商业/资源开通和已准备好的发布决策，重复技术步骤应自动执行。

### 5.2 CI/CD 的目标合同（待实现）

| 触发点 | 自动动作 | 不通过的结果 |
|---|---|---|
| 每个 PR | frozen install；锁文件/secret 扫描；受影响依赖闭包 lint/typecheck/unit；契约与构建 | 阻止进入发布源 |
| 可信 PR preview | 无生产凭据构建；部署隔离 preview；路由/CSP/响应式 smoke | 记录失败，不授予 production token 给 PR 代码 |
| 合并 Web 主线 | 受信 staging 构建；SQL/函数部署；真实 Auth 与关键用户旅程 | 不提升为 release candidate |
| 发布指定 commit | 汇总所有检查、制品摘要、环境契约、migration/rollback/预算；一次批准 | 不切换生产 |
| 批准后 | 单一 writer 部署后端及前端；线上 smoke；记录 deployment ID 和 release | 停后续步骤，按已审定策略回退 |
| 每夜/定期 | 依赖审查、SQL 集成、备份及恢复抽检、支付对账、synthetic auth | 有负责人和去重告警；不能静默“失败但已完成” |

当前两份 workflow 只有基础构建/部署和供应链检查，以上合同需分阶段实现：

1. 把部署 job 明确串在 quality 与 supply-chain 成功之后，不能依赖“另一个 workflow 也会运行”的假设。
2. main production 使用独立 Environment、最小权限 secret 与 concurrency；生产发布/迁移不可被新 push 随意取消。preview 可取消旧任务。
3. PR 不拿 production secret；fork PR 只跑无凭据检查。若自动 preview 需要 token，采用隔离 preview 项目和已信任制品，避免以 pull_request_target 执行未信任代码。
4. 固定 Actions commit SHA、Node/.nvmrc、pnpm、Wrangler、Supabase CLI；定期升级，有失败归因与审查。
5. GitHub 私有仓库的保护/审批功能按实际计划核验。若不可用，明确记录为人工 gate；不得宣称已强制阻止越权发布。
6. GitHub Actions 与 Cloudflare Git/Workers Builds 只选一个发布控制器。清理重复触发前先确认外部配置，不能把旧 Workers 检查当成当前 Pages 部署证据。

### 5.3 构建、环境与制品

- 每个发布固定 source SHA、lockfile hash、Node/pnpm/tool 版本、release、auth mode、环境名、migration 范围、制品 SHA256。
- Vite 配置在构建期注入。Direct Upload 上传的是 GitHub/本机已构建产物；**只修改 Pages 控制台变量不会改变该产物**。GitHub build step 必须显式映射相应 vars/secrets。
- staging 与 production 若使用不同的 VITE 配置，会产生不同字节的制品。应在同一个源 commit 上各构建一次，生产候选制品验收后原样部署；不能声称两个不同 env build 是同一个制品。
- build:secure 已有上传、校验、finalize、清理 maps 脚本，接入前验证。hidden sourcemap 只是不写引用，不意味着 .map 无法被下载。
- sourcemaps:deploy:mark 放到实际部署成功后；build:secure:with-deploy 不能作为未部署时的“上线证明”。
- 保留上一已验收生产制品、部署 ID、manifest、符号文件和兼容说明。私有 GitHub release 资产不自动成为终端用户可下载的更新源。
- demo→live 不是简单环境变量切换；需切换 origin/存储命名空间或完成本地账户迁移，防止共享 mock 数据进入真实账号。

### 5.4 数据库 migration 发布

1. 在 Git 中创建顺序 migration，记录 schema 与 API/客户端兼容范围；不手改生产 schema。
2. 空库重建和上一版本升级都运行。用真实 Postgres/RLS 测试，不以 SQL 文本匹配代替执行。
3. staging 验证功能、索引/查询计划、锁持有时间、回填耗时、权限回归。长回填单独批处理，可续跑。
4. production 显式确认目标 project/ref、待执行列表、备份 checkpoint 和回滚兼容；专用迁移身份，单进程执行。
5. 使用 expand → 后端兼容 → 客户端发布 → 观察 → contract。删列/改语义/协议淘汰要晚于旧 Web 缓存和旧原生客户端兼容窗口。
6. 失败停止前端 promotion。部分完成按 migration ledger 检查后 roll-forward；不盲目重跑非幂等脚本。
7. 数据恢复独立于代码回滚。涉及破坏性恢复时先冻结写入并评估数据损失；不在一次发布里自动执行 down migration。

现有实际脚本名在 [archive package.json](../apps/release-site/package.json)。supabase test db 与其中的 Vitest/Docker SQL 测试不是同一套测试。CLI 具体指令以锁定版本 --help 和[后端 runbook](runbooks/supabase.md)为准。

### 5.5 发布回执（每次必填）

| 字段 | 内容 |
|---|---|
| 范围 | 模块、环境、用户承诺、负责人、时间 |
| 来源 | source SHA、PR、检查链接；Web→App 则加 D3 receipt |
| 制品 | version、摘要、构建配置摘要、下载或部署 ID |
| 数据 | migration IDs、备份 checkpoint、旧客户端兼容窗口 |
| 验收 | URL、Auth/支付/sync 等适用 smoke、测试账号类型、脱敏截图/报告 |
| 观察 | 错误率、关键延迟、告警发送与恢复确认 |
| 回滚 | known-good ID、触发阈值、执行者、结果；演练是否完成 |
| 结果 | deployed / verified / failed / rolled-back；不省略未执行项 |

敏感业务数据、token、完整支付 payload 不进入 receipt。主文档和看板只引用回执。

## 6. 统一账号、数据与支付闭环

### 6.1 账号体系

**目标是各端使用同一 Supabase user_id、独立 session、统一授权 API。** 不以邮箱字符串、设备 ID、Apple transaction ID 或 Stripe customer ID 作为通用账号主键。

| 项目 | 实施与验收要求 |
|---|---|
| 邮箱账号 | 注册→验证→登录→刷新→登出→找回/改密→重新认证；单次链接过期/重放、邮件扫描器、重复注册与滥用测试 |
| OAuth 登录 | 现有身份 provider 是 Google/Apple；精确配置生产和 staging 回调、PKCE、state/nonce（按 provider 流程）、安全 next 路径 |
| 第三方集成 | Notion/Linear 集成授权独立于产品登录；CSP 放行某域不意味着 provider 已启用或 token exchange 已实现 |
| 身份关联 | 以已认证用户发起的显式绑定；验证邮箱归属、Apple 隐藏邮箱、相同邮箱不同 provider、解绑后保留可用登录方式 |
| Web session | 保留当前 PKCE+SDK refresh；IndexedDB token 仍受页面 JS/XSS 影响；CSP、依赖、登出清理与账号切换隔离必须测试 |
| 原生 session | 系统浏览器/原生 OAuth SDK；安全 universal/app links 或受控深链；refresh token 在 Keychain/Android Keystore-backed 存储，不沿用 WebView localStorage |
| 设备管理 | 登录 session 与加密设备身份分离；注册、心跳、设备列表、吊销、重登录均有服务端证据；吊销 session 不等于删除已下载数据 |
| 授权 | user/admin/support 角色与 entitlement 分离；管理员 MFA、最小权限、审计；前端隐藏按钮不是 API 授权 |
| 吊销 | logout、密码重置、账号删除后的已有 JWT 有残余有效期；敏感 API 校验 session/账号状态；不只等待客户端刷新 |
| MFA/Passkey | 管理账号优先 MFA；终端用户按风险推进；现有 Passkey stub 不能标成可用功能 |

JWT 必须验证签名、issuer、audience、exp；不能用 decode 代替验证。当前 sync request-context 的 X-Account-Id fallback 只能在受控测试/已验证上下文中使用，生产必须去掉或以可信身份覆盖。Postgres 直连/特权客户端可能绕过 RLS，必须确认角色和每个敏感请求的授权边界。

Supabase 新式 publishable/secret keys 与 legacy anon/service_role 的迁移须按实际 SDK/Edge gateway 验证，不能机械替换名称或为了兼容而关闭用户鉴权。依据：[JWT](https://supabase.com/docs/guides/auth/jwts)、[Session](https://supabase.com/docs/guides/auth/sessions)、[API keys](https://supabase.com/docs/guides/getting-started/api-keys)。

### 6.2 数据隔离、账号删除与隐私

**两种隔离都要做：数据库账户隔离，以及同一台浏览器/电脑上 A 退出后 B 看不到 A 的本地数据。**

RLS/隔离验收至少包括：匿名、A、B、已吊销设备、过期 token、被删除账号；覆盖表、RPC、对象下载 URL、Realtime、导出、AI 调用、billing 读取和 Admin 写入。公开 schema 的 view/function/GRANT 也检查。付费角色不可来自可编辑 user_metadata。

删除应是可重试的服务端流程：

1. 用户近期重新认证，展示真实影响、导出入口、各支付渠道取消入口；不能把取消订阅与删除数据混为同一步。
2. 服务端从已验证身份建立 deletion job，立即阻止新的敏感写入并撤销可撤销 session；返回 job ID，记录最小审计。
3. 按渠道处理订阅。Stripe 可受控调用取消；Apple/Google 引导官方订阅管理并同步交易状态。不能只清前端标记，也不能让“仍有订阅”成为无限期拒绝删除的理由。
4. 清理业务账户数据、密文/密钥包、设备、outbox、对象/附件、集成 OAuth token；按依赖先后删除 Auth。现有 accounts 没有 auth.users 外键，必须显式处理，不能假设级联。
5. 对支付/税务/反欺诈所需记录执行最小化和限定保留，具体范围在目标市场政策中确认；其余进入确定的删除期限。
6. 返回可核验的完成回执后，清除本机 session/缓存/数据；其他设备在下次联网时执行删除通知。离线设备已持有的明文不能被服务端保证瞬间擦除。
7. 备份按保留期限到期；恢复演练和灾后恢复必须重放删除台账，避免已删除用户“复活”。

修复当前“任何 404 都当已删除”的协议：只有已认证、可确认身份的幂等业务回执才能判成功；函数未部署/路由 404 必须失败。现有删除入口尚不满足此要求。

删除 Auth 用户不能使已发出的 JWT 立即失效；Storage 对象也有独立清理限制。依据：[Supabase 用户删除](https://supabase.com/docs/guides/auth/managing-user-data)。App Store 要求支持创建账号的 App 提供应用内删除；Google Play 还要求适用应用提供应用外网页删除入口。依据：[Apple 规则](https://developer.apple.com/app-store/review/guidelines/)、[Google 删除要求](https://support.google.com/googleplay/android-developer/answer/13327111)。

### 6.3 云同步的真实上线前置

继续使用 Web IndexedDB ⇄ 账号云 ⇄ Mac 本地数据库；后续原生端经同一协议接入。**仅 account-sync 实体上云，device-local 永不上云。**

- accounts/crypto onboarding、device 注册/心跳 RPC、JWT/设备/RLS 身份来源必须对齐。
- sync-push/pull 生产入口需验证 CORS/OPTIONS、大小限制、数据库连接池/超时、错误脱敏、幂等和事务。
- recovery-proof 要绑定真实 DB 与 verifier；onboarding-backfill 要有入口；不能把函数目录存在写成“部署即可运行”。
- DEK 只通过规定的客户端生成/包裹/恢复路径流转。禁止把原始 DEK 放进 Auth metadata、日志、监控或 server env；密码重置不等于找回加密密钥。
- commit_seq、nonce lease、rekey、被吊销设备拒绝访问、全量回填和冲突恢复必须经真实协议测试。不能简单定时覆盖数据库或以静默 LWW 处理复杂冲突。
- 先通过 sync-v1 #37，再逐实体推进和 #56 多设备验收；#52–#55 等恢复/吊销演练仍单独保留。

### 6.4 每个上云实体的九项合同

entityType、schemaVersion/迁移、本地映射、push 信封、pull apply、冲突策略、Web IndexedDB 测试、App SQLite/outbox 测试、真实双设备 smoke。参考 [ADR-0013 D4](adr/0013-branch-sync-governance.md)、[repository 合同](contracts/data-repository-v0.md)、[sync-v1](workflow/roadmap/sync-v1.md)。

账户云暂停时，Web 可改本地产品能力，但不能把“实体声明可同步”当作用户数据已备份。对外逐实体列出云同步覆盖范围。

### 6.5 支付、订阅与 entitlement

#### 6.5.1 当前收口与最小设计

当前 premium_stub 只用于演示。真实收费前默认关闭 live Payment Link；success URL、浏览器时钟和客户端 tier 永远不能授予真实服务权限。

第一版只做 Free / Pro 两档、一个付费周期或少量 SKU；Web 用 Stripe Checkout + Customer Portal，复用 Supabase 后端。年度/月度、多币种、用量计费和优惠券按真实需求逐步增加。用户通过任一渠道购买，产品 API 返回统一 entitlement；渠道商品与价格独立映射，不要求各商店价格或结算方式相同。

| 服务端概念（建议新增，尚未实现） | 职责 |
|---|---|
| product_catalog / channel_prices | 稳定内部 plan_id、feature_key；映射 Stripe price、Apple product、Google product/base plan |
| billing_accounts | user_id 与渠道 customer/应用账号标识绑定 |
| subscriptions | 渠道、环境、外部订阅 ID、状态、有效期、自动续费/取消时间 |
| billing_events / inbox | 验签事件持久化；渠道+环境+event_id 唯一；处理状态/重试 |
| entitlements | capability、quota、valid_until、来源、revision；服务端投影 |
| usage_ledger / outbox | 配额预占/实际结算、待执行外部操作、可重试通知 |
| reconciliation / audit | 定时拉取渠道真值、差异修复、退款/人工变更原因 |

交易载荷保存在受限 schema，按业务需要脱敏/保留；客户端只能读自己的权限摘要。Stripe Entitlements 可作为 Stripe 渠道输入，不代替跨 Apple/Google 的统一权限层。

#### 6.5.2 Web 支付闭环

~~~mermaid
sequenceDiagram
  participant U as 已登录用户
  participant A as XAI Billing API
  participant P as Stripe
  participant D as Postgres
  U->>A: 选择 plan_id
  A->>A: 验身份、商品白名单、重复订阅
  A->>P: 幂等创建 Checkout Session，绑定 user_id
  P-->>U: 托管支付页面
  P->>A: 签名 webhook
  A->>A: 原始请求体验签
  A->>D: 持久化 inbox
  A-->>P: 成功确认接收
  A->>P: 查询最新订阅/发票状态
  A->>D: 事务更新订阅与 entitlement
  U->>A: 查询权限，回调页仅显示进度
  A-->>U: 已生效或仍处理中
~~~

不能相信前端传入金额、customer ID 或任意 price ID。校验登录用户与购买归属、test/live 环境及商品白名单。支付成功后用户不返回网站也必须到账；返回网站但 webhook 未到时应显示“确认中”，允许查询/对账恢复。

事件处理须支持重复、乱序、延迟、暂时不可达、处理中崩溃。先验签并持久化再回 2xx；DB 不可用不谎报成功。消费者用事件 ID 去重、按订阅串行或事务锁处理、必要时查询渠道最新状态；**不能只比较事件 created 时间**。设置重试/DLQ、重放工具和日常对账。依据：[Stripe webhook](https://docs.stripe.com/webhooks)、[订阅事件](https://docs.stripe.com/billing/subscriptions/webhooks)。

#### 6.5.3 权限状态机

| 渠道事实 | 产品权限策略（需写入测试） |
|---|---|
| 首付未完成 / pending | 不授予付费权限 |
| 付费有效 / 经批准的 trial | 授予对应 capability 和期限；trial 额度独立 |
| 已取消自动续费，但有效期未到 | 保留已付周期权限，展示到期日 |
| 支付失败 / grace period | 按渠道状态和产品宽限策略处理；不能所有失败都立即降级 |
| 过期 / account hold / revoked | 停止新增付费消耗；保留读取/导出用户已有数据 |
| 退款 / 争议 | 区分全额/部分、退款是否完成、渠道撤销语义；不能简单“任意退款=删除全部数据” |
| 多渠道重复订阅 | 提示用户已有订阅并阻止可避免的重复购买；保留独立交易，不按 webhook 到达顺序覆盖 |
| webhook 丢失或恢复购买 | 服务器查询渠道并修复投影；权限 revision 单调更新 |

取消、退款、删除账号分别建模。退款成功不自动代表订阅已取消，取消也不一定产生退款。退款金额、税务、部分退款和拒付由对应渠道处理并留审计。依据：[Stripe 取消](https://docs.stripe.com/billing/subscriptions/cancel)。

所有收费 API（托管 AI、云存储写入等）在服务端验证 entitlement 和额度。纯本地功能的客户端限制不能提供同等级防篡改。可允许有期限的离线权限缓存，但断网不能无限消耗由开发者付费的云资源。

#### 6.5.4 Apple / Google / Mac 渠道

| 分发渠道 | 推荐实现 | 不能遗漏 |
|---|---|---|
| Web、站外分发 Mac DMG | Stripe Checkout/Portal + 统一 entitlement | 商户注册地区、收款银行、税务、退款/发票、回调归属 |
| iOS / Mac App Store | StoreKit 2 + 服务端签名交易校验 + App Store Server Notifications V2 | appAccountToken 绑定用户、bundle/product/environment 校验、续订/宽限/退款/撤销、Restore Purchases、通知历史补偿 |
| Google Play | Play Billing + 安全后端查询 purchases.subscriptionsv2.get | RTDN 经 Pub/Sub、验证来源、purchase token/包名/商品/用户绑定、确认购买、pending、暂停/hold、退款/voided、恢复购买 |
| 其他 Android 渠道 | 届时按渠道和地区单独设计 | 不能直接复制 Play 或 Web 收费规则 |

Apple 的 appAccountToken 用内部稳定 UUID 关联，不泄漏邮箱；Google 使用适当的混淆账号标识并处理替换订阅 token。所有渠道区分 sandbox/test/live，不能跨环境授予正式权益。依据：[Apple appAccountToken](https://developer.apple.com/documentation/AppStoreServerNotifications/appAccountToken)、[Apple 服务端通知](https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-v2)、[Google 后端](https://developer.android.com/google/play/billing/backend)、[Google 订阅生命周期](https://developer.android.com/google/play/billing/lifecycle/subscriptions)。

数字功能的移动端销售默认按 StoreKit / Play Billing 设计。外部购买链接、替代支付、多平台访问规则随 storefront、地区和计划变化，发布前根据目标市场重新核对 [Apple 支付规则](https://developer.apple.com/app-store/review/guidelines/) 和 [Google Payments](https://support.google.com/googleplay/android-developer/answer/9858738)。共享 entitlement 不等于可以在所有商店内任意引导 Stripe 付款。

RevenueCat 等聚合层作为移动端进入商业化后的备选：能减少跨商店状态维护，但增加平台、费用和迁移依赖；先比较维护成本，再决定，当前不增加账号。Stripe 商户资格不适用时再评估一个合适的 Merchant of Record，避免同时维护多套 Web 支付。

## 7. 上线验收门

所有门槛都是目标；目前未完成项不能因本文更新变成通过。

| 发布范围 | 必须通过的验收 |
|---|---|
| 每次 Web 发布 | 固定 commit 的质量/安全检查；关键模块浏览器 smoke；真实 URL/release；CSP；构建无 secret/公开 maps；known-good 回滚 |
| Demo | 清晰的演示/本地数据说明；按模块验证导出再导入；禁真实收费与平台共享 key；反馈入口 |
| Account Beta | 真实注册、邮件验证、OAuth、密码重置、session refresh/revoke；跨账号本地/服务端隔离；删除/导出；可恢复备份 |
| Paid Beta | 沙盒全生命周期、重复/乱序 webhook、续订失败、到期/取消/退款、恢复购买、定时对账、权限 API、费用硬限制 |
| Cloud-sync Beta | #37/D4 gate；nonce/rekey/冲突/断网/重启/设备吊销；多设备收敛；恢复后可解密和防重放 |
| Mac | Web→App D3；正确宿主边界；签名、公证、Gatekeeper、下载校验；真实安装/升级；本地数据库迁移；updater 可用且可暂停 |
| iOS / Android | 原生 Auth/深链与安全存储、商店支付/恢复、真机/弱网/后台恢复、隐私披露/删除入口、签名包和商店审核 |
| 生产运维 | 错误/可用性/成本告警实际到达；支持联系人；备份成功+恢复演练；值守时段与故障处理步骤 |

验收记录必须说明产品范围：单个 Board JSON 导出通过，不代表全产品所有模块可导出；模拟器通过，不代表真机签名或商店审核通过；HTTP 200 不代表 SPA 路由/API 返回正确内容。

## 8. 外部服务账号与成本

### 8.1 服务台账：必须维护什么

“阶段必须”指提供相应承诺前必需；当前是否已注册以台账实查为准。除 GitHub 和历史 Cloudflare 部署证据外，本次不证明账号已经开通。

| 类别 | 推荐服务/复用方式 | 何时必须 | 维护事项 |
|---|---|---|---|
| 代码/CI/制品 | 现有 GitHub | 现在 | MFA、私有仓库 Actions 额度、token、分支权限、制品保留、账单 |
| 域名/DNS | 复用已有域名；新域名可选 Cloudflare Registrar，先确认 TLD/资格 | 自有域名、真实邮件/品牌发布前；Demo 可 pages.dev | 续费、付款方式、注册邮箱、DNS 导出、恢复代码 |
| CDN/SSL/边缘托管 | 同一个 Cloudflare 账号 | 现在 | Pages/DNS/TLS、限额、部署 token、访问规则；无需独立 CDN/证书平台 |
| 数据库/Auth/API | 一个 Supabase 组织，local + staging + production 隔离 | 真实账号前 | 区域、计划、数据库/RLS、函数、Auth、连接/存储/流量、备份 |
| 邮件 | 优先验证 Cloudflare Email Sending SMTP；否则一个 Resend 等 SMTP 服务 | 真实注册/密码恢复前 | 发信域、SPF/DKIM/DMARC、退信投诉、抑制列表、到达率 |
| 客服邮箱 | support@ 转发到现有可维护邮箱；回复身份需验证 | 对外 Beta 前 | 工单收件与回复、滥用/删除请求；无需先接工单 SaaS |
| Web 支付 | 一个合格的 Stripe 商户账号 | 收费前 | 业务/身份审核、银行、币种/税务、退款/争议、webhook secret、Portal |
| Apple | 一个 Apple Developer 团队 + App Store Connect | 公证 Mac 分发、Apple 登录配置或 iOS/MAS 发布时 | 续费、证书/API key、协议/税务/银行、App ID、APNs/StoreKit |
| Google | 现有 Google 身份 + OAuth Cloud project；后续 Play Console | Google 登录时需 OAuth；Android 商店收费/分发时需 Play | OAuth consent、回调、发布身份、签名 key、RTDN/Pub/Sub/服务账号 |
| 错误监控 | 一个 Sentry 组织，多项目/环境 | 对外 Beta 前推荐固定 | DSN、上传 token、版本/符号、采样/隐私、告警/额度 |
| Analytics | Cloudflare Web Analytics/平台指标 | 需要访问和性能指标时 | CSP、采样、事件定义；暂不叠加 GA/PostHog/Amplitude |
| 可用性探测 | 优先复用已有监控的外部探测；不足再加一个轻量服务 | 正式生产前 | 不与被监控服务同故障域；HTTPS/路由/最小登录探测、通知到达 |
| LLM / AI | BYOK 阶段用户自带；托管时先一个 provider 或 CF 支持的统一计费 | 托管 AI 收费前 | 模型/API 变更、地区、用量/账单、密钥、内容日志与数据条款 |
| 对象存储 | 用户附件先 Supabase Storage；备份/公开安装包 R2 | 有对应数据时 | 私有 bucket、签名 URL、生命周期、配额、删除/恢复；无独立厂商账号 |
| secret/账号恢复 | 复用已有密码管理器/加密恢复渠道 | 现在 | MFA 恢复码、secret 轮换、签名私钥、跨机器恢复与离线副本 |
| 推送 | APNs / FCM，复用 Apple/Google | 产品需要后台通知时 | token 失效、发送权限、投递，不把推送作为同步事实源 |
| 移动订阅聚合/高级分析/状态页 SaaS | 暂缓 | 运营负担证明有价值后 | 引入前明确取代什么手工工作及退出方案 |

推荐账号数量按阶段控制：

- Demo：主要是 **GitHub + Cloudflare**，可复用监控、邮箱和密码管理器。
- 真实账号 Beta：增加 **Supabase + 错误监控**；邮件若 CF Beta 适用可同账号，否则增加 **一个 SMTP 服务**。
- 付费 Web：再增加 **Stripe**；托管 AI 只选一个主要来源。
- Mac/iOS/Android：按实际发布阶段增加 Apple / Play 所需组织与项目。Google Cloud 的 OAuth/Pub/Sub 项目属于同一 Google 账号体系，但仍有独立 IAM/账单维护。
- 不把域名、SSL、CDN、KV、R2、Queues 分别算成必须注册的新平台。

每个服务实际登记：owner、恢复邮箱、组织/项目/环境、区域、账单上限、MFA/恢复路径、权限、轮换/到期日、数据类型、备份负责人、最后验证日期。Git 只存标识和 secret 名称，不存 secret 值。购买或首次生产开通前验证所在地/商户/区域支持，本文不假定某个国家/地区必然可用。

### 8.2 成本模型

废止旧版“每月固定 $26–60 / 到 10 万 MAU 才遇到成本拐点”的笼统结论。先监控真正成本驱动：

~~~text
月成本 =
域名与开发者计划摊销
+ GitHub 私有仓库 CI（尤其 macOS runner）/制品
+ Supabase 组织计划 + 各项目 compute + DB/Storage/egress + 备份/PITR
+ Cloudflare 动态请求/CPU/存储/操作/队列/日志
+ 邮件与监控
+ LLM 输入/输出/工具任务
+ 支付、订阅平台与税务相关费用
~~~

staging/prod 属于同一账号不代表没有第二份 compute；静态资源免费也不等于动态服务、日志、邮件和 AI 免费。Supabase 超配应先优化/扩资源，不因 MAU 跨某阈值直接迁移数据库或升级到不匹配的高阶计划。

**建议运营阈值，非平台价格**：预算用到 50% 提示、80% 预警、100% 停止非必要消耗；每账号/每日/每任务设置 AI 上限。账单告警不是硬限额，服务端准入与配额预占才是。

额度与价格采购前重查：[Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/)、[Supabase](https://supabase.com/pricing)、[GitHub](https://github.com/pricing)、[Sentry](https://sentry.io/pricing/)。记录具体计划和计费项，不把官网免费档宣传直接写成产品 SLA。

## 9. 上线后的运维、更新和恢复

### 9.1 维护矩阵

| 对象 | 持续观察 | 自动化动作 | 人工介入 |
|---|---|---|---|
| 服务/API | 成功率、p95/p99、5xx、超时、地域、依赖状态 | 外部探测、限流、超时、熔断/降级 | 按故障手册恢复，不反复重启掩盖原因 |
| Postgres | 连接、慢查询、锁、磁盘、索引、增长 | 备份、容量预警、受控归档 | migration、扩容、查询优化 |
| 域名/TLS/CDN | DNS、证书有效期、到期日、缓存版本 | 自动续费/证书续期监控、外部探测 | DNS/域名锁定恢复、错误缓存策略 |
| 对象存储 | 容量、下载错误、权限、孤儿对象 | 生命周期、校验、独立对象备份 | 误删恢复与异常分享调查 |
| Auth/邮件 | 注册/登录成功率、刷新错误、送达/退信、异常尝试 | Turnstile、限流、告警、抑制列表 | provider 配置、密钥轮换、投递修复 |
| 支付 | 签名失败、未处理事件最老年龄、权限滞后、对账差异 | inbox 重试、日常对账、续订/失败通知 | 退款、争议、财务例外 |
| Agent/LLM | 首 token 延迟、token/成本、429、重试、工具失败 | 任务预算、并发上限、取消、幂等、受控模型降级 | provider 变更、滥用/质量分析 |
| 终端错误 | JS/native 崩溃、路由、版本、浏览器、更新失败 | Sentry 分组、符号/source map、release 对比 | 最小复现、兼容修复 |
| 云同步 | outbox 年龄、冲突、401/403、nonce/rekey、收敛 | backoff、去重、暂停故障写入 | 密钥/设备恢复与用户支持 |
| 发布/依赖 | CI 红灯、过期 runtime、advisory、更新覆盖 | 定期扫描与升级 PR、版本清单 | 风险判断、发布批准 |
| Admin | 特权登录/读写、权限变更、导出 | MFA、Access、追加审计 | 高风险操作复核 |

控制面用云平台现有后台起步；自建 Admin 不是一人上线的前置工程。developer dashboard 只在本机运行，不作为生产管理员后台开放。

### 9.2 监控、日志与告警

三层分工：Sentry 看终端/服务异常；Cloudflare/Supabase 看资源与 API；业务指标看注册、付费权限、同步成功。可用性探测必须在独立执行域，不能只靠同一个 Worker 检查自己。

建议上线前约定的目标（待实测校准，**不是已达成 SLA**）：

| 指标 | 初始目标/告警示例 |
|---|---|
| Beta 核心 API 月可用性 | 99.5%；低流量时使用合成探测补充 |
| Web/API 故障 | 连续 3 次 1 分钟探测失败，或 5 分钟 5xx > 2% 且有足够请求量 |
| Auth | 成功率明显偏离 7 日基线；单独监测邮件失败和刷新失败 |
| 支付权限 | 正常投递后 2 分钟内收敛；inbox 最老未处理 > 5 分钟告警 |
| 备份 | 每日任务超过 26 小时未成功告警；失败任务本身也报警 |
| 恢复目标 | 早期云业务 RPO ≤24 小时、RTO ≤4 小时；付费关键账本按需要启用更细 PITR/对账恢复 |
| 成本 | 日消耗异常增幅及预算阈值；逐 provider/模型/账号维度 |

日志包含环境、release、服务、请求 ID、错误类别、耗时、重试次数；账户关联只在权限控制下使用最少必要字段。禁止记录密码、JWT、完整邮箱、支付卡信息、原始 DEK、助记词、用户文档或完整 prompt。

当前 Web Sentry 脱敏很严格，可能移除用于诊断的上下文/异常信息；必须验证实际事件仍可定位到 release 与代码栈，不能只验证“没有 PII”。新增安全 trace 字段需先扩展隐私合同和测试。

初始日志策略：普通运行日志短保留并采样；错误适度延长；审计和财务按确认后的保留表单独保存。Workers Logs 有计划/保留限制，不承担永久审计。告警统一投递到一个主要渠道，按 incident key 去重、恢复自动关闭；上线前注入受控测试故障验证送达。

### 9.3 Secret 与环境管理

| 变量类别 | 位置 | 原则 |
|---|---|---|
| 公开构建配置 | names-only 模板 + GitHub environment vars | VITE_WEB_AUTH_MODE、VITE_SUPABASE_URL、当前兼容的 VITE_SUPABASE_ANON_KEY、VITE_SENTRY_DSN、VITE_RELEASE 等 |
| CI 部署 token | GitHub environment secrets | Cloudflare、Sentry 上传、Supabase 发布；分环境、最小权限 |
| 服务端运行 secret | Supabase secrets / 必要 Worker secrets | DB、支付验签/后台 API、邮件、托管 AI；不进入 VITE_* |
| 原生签名材料 | 受保护 CI + 密码管理器 | Apple Developer ID、notary/API key、Tauri signing、Android upload key 分开 |
| 开发密钥 | gitignored 本地安全渠道 | VITE_*_API_KEY 当前仅用于 DEV seed；生产构建显式禁止注入并检查产物 |
| 加密用户恢复材料 | 用户端规定的密钥恢复机制 | 不是运营 secret，禁止为了运维方便汇总到服务端 |

当前 apps/web/.env.example 主要保存迁移机器时的变量名，混有旧 NEXT_PUBLIC_* 与服务端名称，且缺真实 Web Auth/Sentry 配置。需要按构建/后端/本地开发分组建立完整 names-only 合同；不能将整个 .env.local 无选择地导入构建或 CI。

轮换流程：正常轮换先创建新凭据→测试→切换→验证→撤旧；确认泄露时立即撤销受影响凭据并进入 incident。账号恢复必须能在新机器完成；不用 Git stash/聊天记录保存 secret。参考[多电脑开发规则](workflow/project/multi-machine-development.md)。

### 9.4 备份与恢复

| 资产 | 备份方案 | 恢复验证 |
|---|---|---|
| Git/配置/工作流 | GitHub 已 push 的 refs；无值资源清单 | 新机器 clone/fetch + 构建；不能依赖本地 stash |
| Postgres | 适用计划的托管备份；需要更小 RPO 时启用 PITR；定期加密导出到私有 R2 | scratch 环境恢复 schema、数据、角色/RLS、应用查询 |
| 用户对象 | Storage 对象单独复制，含对象清单/校验/版本与删除策略 | 下载与授权一致；不只还原 metadata |
| 加密同步 | 备份密文、key wraps、协议状态；用户保管恢复材料 | 测试账户由配对设备解密，验证删除/吊销/防回滚 |
| release 制品 | 不可变包、摘要、签名、manifest、符号/source map | 旧包可下载/校验/安装，发布源可追溯 |
| secret/签名/账号恢复 | 加密密码管理器 + 离线恢复副本 | 新机器可恢复控制权，权限符合最小范围 |

Supabase 数据库备份**不包含 Storage 对象内容**，也不等于备份所有平台配置或密钥；须分别导出 Auth provider/redirect、SMTP、函数 secret 名称、DNS 和监控配置。依据：[Supabase 备份](https://supabase.com/docs/guides/platform/backups)。

执行 pg_dump 需要能够运行该程序的受控 runner；pg_cron 是 SQL 调度器，不能把“安装 pg_cron”写成“已经每天执行 pg_dump 到 R2”。备份任务须固定工具版本、加密、校验、记录最后成功时间，并对未运行/失败告警。

建议先采用每日托管备份 + 每日加密异地导出，保留窗口由数据删除/成本政策确认；采用不可变日期路径和适当 Bucket Lock/独立凭据。R2 与 Pages 共用账号减少管理平台，但并不提供账号失陷隔离，所以保留离线配置/恢复副本。

恢复演练：停止真实通知/计费→隔离目标→验证备份校验和→恢复 DB/对象/配置→重放删除台账→支付重新对账→测试登录/授权/解密→记录数据缺口与实际 RPO/RTO。首个真实用户前完成基础演练；每季度和破坏性迁移前再演练。

**加密同步恢复还有协议门**：旧备份可能回退 commit_seq、nonce 计数与设备撤销状态。必须按恢复协议处理高水位/换钥/设备授权，通过安全验收才重新开放写入；不能直接还原数据库后让旧客户端继续写。

### 9.5 更新、回滚与事故处理

| 故障面 | 首选动作 | 独立风险 |
|---|---|---|
| Web 静态发布 | 暂停后续 deploy，切到上一成功 Production deployment | Preview 不能直接作为 Pages rollback 目标；检查 SW/缓存和后端兼容 |
| Workers | 降低/停止新版本流量，回退已知版本 | 渐进发布能力不能直接套到 Pages；bindings/schema 需兼容 |
| Edge Functions | 从已验收 commit/制品重新部署旧函数，或兼容修复前推 | 不同时回退数据库 |
| DB migration | expand 兼容下回退应用；schema 以修复迁移前进 | 破坏性 restore 单独批准数据损失窗口 |
| Auth/OAuth | 关闭故障 provider 或进入维护/降级，保留账号归属 | **真实生产不能切 mock-auth 伪装恢复登录/删除成功** |
| 支付 | 暂停新 checkout、保留 webhook inbox、重试与对账 | 退款不是代码回滚；不删除已有交易证据 |
| LLM | 暂停托管请求或降级到已批准模型，守住预算 | 不默认转发到用户未同意的第三方 |
| Mac updater | 停止新更新推广，发布修复包 | 已装新 schema 的客户端通常不能安全强制降级；保留数据快照和兼容路线 |
| iOS/Android | 暂停商店分阶段发布，使用受控功能开关，提交修复版本 | 无法像 Web 秒级替换所有已安装包；审核与用户升级有延迟 |

Pages 官方仅支持回到成功的生产部署：[回滚规则](https://developers.cloudflare.com/pages/configuration/rollbacks/)；Workers 的比例灰度另见[渐进发布](https://developers.cloudflare.com/workers/versions-and-deployments/gradual-deployments/)。

事故闭环：发现→确认影响/严重级别→冻结发布或危险写入→保留日志→执行预定缓解→验证恢复→用户沟通→复盘/测试/修复→恢复自动发布。数据丢失、安全和重复收费优先处理。用户沟通使用已确认的支持渠道，不能把日志中推测当作已确认根因。

一人维护不承诺虚构的 24×7 人工响应。Beta 公布实际支持时段、自动降级能力和紧急联系方式；沿用 [support-sop](release/support-sop.md) 的分级，在 GA 前评估是否需要外部值守/支持。自动化可减少人工次数，不能消除故障负责人。

### 9.6 日常节奏

- 每日：只处理有意义的告警、备份失败、支付差异、超预算和用户阻塞；正常运行用汇总查看。
- 每周：依赖/安全更新、错误热点、邮件投递、费用/存储增长、待处理退款和失败任务。
- 每月：账单/配额、域名/证书/开发者计划到期、token 权限、数据保留与删除任务、SLO 复盘。
- 每季度或重大变更前：恢复演练、账号控制权恢复、旧版本升级/回退、provider/商店规则和本文核验。

## 10. 分阶段执行顺序

以下是实施 backlog，全部以证据关闭，不自动标记现有 roadmap SHIPPED，也不一次性启动所有平台。

| 阶段 | 顺序与动作 | 退出条件 | 责任/依赖 |
|---|---|---|---|
| P0：恢复可证明的 Demo 发布 | 修 Cloudflare CI 凭据→处理当前供应链失败→串联测试/build/deploy→隔离 preview/prod→制品/source map→线上 smoke/回滚记录 | 指定最新 Web commit 的生产 receipt、错误到达与回滚演练齐全 | web；凭据/发布范围由 operator 管理 |
| P1：账号 Private Beta | 实查/建立 staging→补无值 env 合同→真实邮件与 OAuth→账号/设备最小服务→删除与隔离→备份演练→生产配置 | 真实用户完整账号旅程与跨账号负例通过；云同步未启用时明确告知本地数据边界 | web + 按影响联动 admin；不要求全部同步实体完成 |
| P2：Web 付费与托管 AI | 商户资格/套餐→Checkout/Portal→inbox/webhook/entitlement→退款/对账→AI key/配额/预算→故障演练 | 沙盒全生命周期和生产发布前验收通过；任何真实收费前可验证退款/支持路径 | web / billing；已有账号 Beta |
| P3：账号云同步 | 正式解冻→补生产入口/鉴权/crypto onboarding→#37→单实体 D4→双设备/恢复→逐实体扩展 | 被声明支持的实体全部有同步与恢复 receipt | sync；服从 G1/roadmap gate，不以本文越过暂停 |
| P4：Mac 分发闭环 | 沿 App lane 完成基础→D3 集成→签名/公证→updater 安装→本地迁移/弱网/回退→RC→GA | 真机干净安装与旧版升级、制品/公证/监控/更新完整 | app + plugin/site 联动；dev/release 动作按既有确认 |
| P5：移动端商业发布 | 复核已有薄壳与产品线授权→iOS 真机→Android 构建→原生 Auth/支付/恢复→商店内测→灰度发布 | 每个平台分别满足商店/隐私/升级/监控门槛 | 规划后激活；不得拿旧模拟器 PASS 替代 |
| P6：减少重复运维 | 实际瓶颈出现后才接 Queues/DO/Workflows、Workers 静态迁移、订阅聚合或自建 Admin | 可量化减少人工/成本，且迁移与回滚可验 | 对应模块独立变更与 ADR |

P1 与 App 本地基础可独立推进；P3 若仍暂停，不阻塞“无业务云同步承诺”的账号/付费版本。付费套餐不得售卖未验收的云同步。P5 可以复用成熟账户/权限服务，但不得跳过平台专属流程。

最近应先关闭的具体缺口：

| ID | 优先级 | 缺口 | 关闭证据 |
|---|---|---|---|
| OPS-01 | P0 | Cloudflare 凭据 preflight 当前失败 | 同一候选 commit 的绿色 deploy + ID/URL |
| OPS-02 | P0 | OSV/cargo-deny 当前失败，部署未依赖质量门 | 风险逐项处置、全检查结果、故意失败时不部署 |
| OPS-03 | P0 | 构建 env/source map/正式 release 关联不完整 | 制品扫描 + Sentry 定位 + 发布回执 |
| AUTH-01 | P1 | 真实 Auth 配置/SMTP/设备 RPC 未闭环 | staging 真实注册至吊销测试 |
| AUTH-02 | P1 | 删除函数缺失、404 误判、业务数据不会自动 cascade | 删除/重试/旧 token/恢复后不复活测试 |
| AUTH-03 | P1 | 多账号本地数据隔离未作为上线门 | A→logout→B、离线/刷新/导出负例 |
| SYNC-01 | P3 前置 | JWT decode/fallback、DEK metadata、501/缺入口 | 生产部署模式的鉴权和加密负例、完整恢复 |
| BILL-01 | P2 | 仅 premium_stub | 全生命周期、验签/乱序/退款/权限对账 |
| OPS-04 | P1 起 | 备份/恢复、指标/告警无运行证据 | restore drill + 告警送达 + 最后成功时间 |
| APP-01 | P4 | 签名/updater 配置与安装闭环 | 公证、安装/升级、可暂停更新 receipt |
| MOBILE-01 | P5 | 仅试验壳/历史环境证据 | 真机与商店内测、跨端账号/权益验收 |

## 11. 复用现有工具与文档

| 入口 | 当前职责 |
|---|---|
| xai-web-deploy-preflight | **已存在**；输出 preflight/receipt，不自动部署 |
| xai-desktop-release-gate | **已存在**；Mac W4 发布检查，不自动签名/创建 release |
| xai-account-sync-scope-check | **已存在**；D4 作用域与验收合同 |
| xai-web-to-desktop-sync | D3 分类与 parity receipt |
| xai-admin-control-plane-sync | 账号/支付/AI 变化后的控制面边界检查 |
| xai-release-log | 记录事实；文档变更不写成生产发布 |
| xai-dev-dashboard-sync | 刷新人工摘要与本机生成快照，不能决定发布就绪 |
| Workflow V2 / roadmap | 将 §10 动作转成已有流程的可验收切片，不创建第二套状态机 |
| git:sync-check | 多电脑交接的 commit/push 与恢复完整性，不是上线验收 |

原部署文档把若干现有技能写成 planned，现已修正。仅当多次实际执行证明需要脚本，才把重复步骤固化；不为了“全自动”先创建大量框架和平台。

## 12. 已有决策与后续决策点

### 12-A. Web 生产来源

沿用 operator 已确认的 **main**。发布前 fetch 并核对 web→main 是否仍能 fast-forward；不能快进则停下设计明确整合，不 force-push，不合并无关 dev 历史。本次文档短分支的 commit/push 只是保存成果，不触发 production promotion。

### 12-B. 首发层级

现有构建事实是 Public Demo。推荐顺序见 §10；账号/收费/sync 能力只能在各自 gate 通过后开放。是否对外发布某个候选版本属于实际发布操作时的范围确认，不阻塞本次方案编写。

### 12-C. 外部资源

先查现有 Supabase/域名/监控资源，复用合适组织；staging 和 production 隔离。邮件选择 CF Beta 必须通过启用、SMTP 和投递验证，否则接一个成熟 SMTP 服务。购买付费资源、商户身份和银行/税务资料仍由账号所有者完成。

### 12-D. 文档与跨分支治理

部署文档已经在 web 基线中，不再重复执行旧版三笔 dev→web cherry-pick 指令。后续文档更新通过当前短分支审查合入 web；向 App 的代码/契约变化继续走 D3。主文档不擅自修改 dev 或把移动试验分支升级为正式产品线。

### 12-E. 商业与运行承诺

开放收费前明确：目标市场、商户主体/可用渠道、套餐承诺、支持时段、退款与数据保留、AI 数据用途、预算。本文提供技术闭环和决策顺序，具体商店/税务/隐私义务按目标市场核验；不以一份通用文档宣称全球合规。

## 13. 长期维护规则与变更记录

每次真实发布更新 §1 当前版本摘要和 §5.5 receipt；每次关闭缺口填写 §10 证据。外部账号/资源状态至少月度复核，Cloudflare/Supabase/商店能力在重大上线前复核。检查方法不再依赖某一电脑的登录态。

一次更新同时检查：本文→对应 runbook→release-log→dashboard deployment 摘要。历史记录保留原日期，不把旧 smoke 重标成今天的 PASS。新证据记录写入 docs/reviews/production-launch-operations/，使用日期、完整 commit 和外部链接。

验证文档时检查链接、命令与 package script、JSON/看板生成、跨分支来源和 secret 边界。实现发生变化后追加适用产品测试；纯文档修改不伪造产品测试或真实云端操作。

| 日期 | 变更 |
|---|---|
| 2026-09-08 | 基于 web/dev/plugin/mobile 固定远端基线与 GitHub CI 重新审查；扩展完整上线、账号/支付/服务账号/运营恢复闭环；修正 Web Auth、同步完成度、移动资产、Cloudflare 能力、Direct Upload env 和回滚口径 |
| 2026-06-06 | 原 Deployment Architecture & Launch Plan：六模块部署矩阵、Cloudflare/Supabase 路线及首发决策 |

官方资料均按文中链接于本次核验；计费页面与区域规则后续可变。当前推荐由本项目实现与维护成本推导，采用前仍需对应环境的真实验收。

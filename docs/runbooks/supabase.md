# Runbook — Supabase Account Backend

> 更新：2026-09-08。统一入口：[Production Launch & Operations](../DEPLOYMENT.md) §6 / §9。
> 源码仍位于 apps/release-site/supabase；该目录的宿主包名是 @repo/release-site-archive，不是当前 Web SPA。
> **远端状态未验证**：本次 connector 需重新认证，不能沿用旧版 NOT YET PROVISIONED。先盘点现有项目，避免重复开通或误连生产。

## 0. 环境与开始条件

local、staging、production 隔离；先 local/staging，再处理真实生产。项目 ID、环境、地区、计划、负责人、备份位置、最后验证日期写入无值资源台账。secret 通过安全渠道恢复，不输出值。

账号 Beta 与业务云同步分阶段发布。Auth-only 也必须有会话、隔离、删除、邮件和备份；sync 功能继续服从现有暂停策略及 hardening gate。

在操作远端前确认 Supabase CLI 的安装来源与锁定版本，并读取 --help。仓库目前缺可复现的 Supabase config.toml，不应直接复制旧版 npx supabase@latest db push 后认定生产已就绪。补配置和工具 pin 是独立实施工作。

## 1. 先修复可部署合同

| 项目 | 当前发现 | 执行前必须具备 |
|---|---|---|
| 项目配置 | 未跟踪 Supabase config.toml | 本地可启动的配置、函数入口、JWT 验证模式、各环境映射 |
| Auth 账户建立 | accounts.id 只有等于 auth.users.id 的注释，且包含同步密钥必填字段 | Auth-only profile 与 crypto onboarding 明确分层；不伪造密钥满足字段 |
| 设备 | Web 调 device_register / device_heartbeat，当前 migrations 未见 RPC | 正式实现/适配，绑定可信用户身份，登出/吊销测试 |
| sync-push/pull | 已有 Postgres adapter 和入口 | JWT 真验签、用户/设备授权、CORS/OPTIONS、请求上限、池化/超时/事务 |
| recovery-proof | Deno.serve 固定返回 501 | 真实 DB/verifier 绑定、已签名恢复请求和重放负例 |
| onboarding-backfill | 只有 handler.ts | 默认 index.ts 或明确配置的可部署入口、身份与状态校验 |
| account-delete | 无服务端实现 | 删除 job、可信幂等回执、业务/对象/订阅处理；不能任意 404 当已删除 |
| E2EE | Web bridge 可从 Auth metadata 读原始 DEK | 改为协议规定的客户端密钥/包裹机制；不得将 DEK 上送 metadata |
| 备份 | 仅有旧草案 | 自动备份、告警、对象独立备份、真实 restore receipt |

这些是代码接线和验收缺口，不是“只差开通 Supabase”。

## 2. Schema、RLS 与函数发布

1. 固定源 commit、CLI/数据库版本、目标 project 和 migration 清单。
2. 本地空库重建，再做上一版本升级；应用 11 个现有 migration 时检查扩展/角色/权限前置。
3. 跑真实 SQL/RLS 测试和匿名/A/B/吊销设备负例；检查公开 schema 的 GRANT、views、RPC，特权 DB 连接不能绕开 API 授权。
4. staging 验证真实 Auth、设备 RPC、函数网络入口和 CORS，再运行 API/浏览器集成。
5. production 前先检查备份 checkpoint、兼容版本、待执行 migration；用一个专用 writer 发布。
6. schema expand → 兼容函数 → 新客户端 → 观察 → 延后 contract；失败停止后续 promotion。
7. 保存每次 migration/function 版本和运行结果；不从控制台手改 schema 后遗漏 Git。

部署 CLI 指令应在已配置、已确认环境中通过锁定版本的 migration list / db push / functions deploy 帮助逐项确认。默认入口仍不完整的函数不可直接部署到生产。

当前仓库实际测试入口（需要已安装依赖，integration 还需要 Docker）：

~~~bash
pnpm --filter @repo/release-site-archive test:push
pnpm --filter @repo/release-site-archive test:pull
pnpm --filter @repo/release-site-archive test:recovery
pnpm --filter @repo/release-site-archive test:protocol
pnpm --filter @repo/release-site-archive test:rls:integration
pnpm --filter @repo/release-site-archive test:rls-fuzz:integration
pnpm --filter @repo/release-site-archive test:nonce:integration
pnpm --filter @repo/release-site-archive test:rekey:integration
pnpm --filter @repo/release-site-archive test:audit:integration
~~~

这些是 Vitest/Docker 测试，不等于 supabase test db 的 SQL 测试格式。旧 README 声称 G9 nightly 会执行，但本次基线仅有两份 GitHub workflow，没有这条 nightly；CI 接入必须实际实现并附 run 证据。

## 3. 真实账号与邮件

现有 Web 登录入口是 WebAuthPage，有邮箱注册/登录/重置和 Google/Apple OAuth；不要修改旧 plugin-account LoginPage 后就认为 Web 登录已替换。

- 生产构建映射 VITE_SUPABASE_URL、VITE_SUPABASE_ANON_KEY 与 live 模式。当前代码仍使用 anonKey 字段，publishable/secret key 升级要整条链验证。
- 邮件确认 /auth/verify、OAuth /auth/callback、密码重置 /auth/reset-password；仅 allow-list 真实 staging/prod origin。精确路径以 auth-actions/callback 代码为准。
- Notion/Linear 是第三方集成，不是因为 CSP 放行就能当作 Supabase 登录 provider。
- 选择单一 custom SMTP，配置发信域、SPF/DKIM/DMARC、退信投诉、禁止修改一次性链接的 tracking。
- 可验证 Cloudflare Email Sending Beta 的 SMTP 接入；不满足资格/投递要求时用一个成熟 SMTP 服务。
- 登出、refresh、密码重置、OAuth 关联、同设备切账号、旧 token、账号删除都用受控测试账号验证。

Supabase 默认邮件服务面向试用且限制收件对象，不用于正式注册邮件。依据：[custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp)、[Cloudflare SMTP](https://developers.cloudflare.com/email-service/api/send-emails/smtp/)、[Resend 集成](https://resend.com/docs/send-with-supabase-smtp)。

用户请求依赖真实 JWT 与当前账号状态；签名校验配置不可因 API key 迁移被整体关闭。第三方支付 webhook 使用自身验签，与终端用户 JWT 模式分开配置。

## 4. 同步放量

只有在正式解冻及 sync-v1 #37 通过后，先启用一个实体。按主文档 §6.4 九项合同验证 Web 本地驱动、Mac 驱动、push/pull、冲突、断网和多设备收敛，再按实体扩展。

恢复、nonce/rekey、设备吊销是独立 hard gate。不能用“登录成功”或“数据库有行”替代端到端解密和一致性验收。只储存 account-sync 内容，不自动上传 device-local 数据。

## 5. 备份与恢复

生产前确认托管备份/PITR 的实际计划与保留期，再配置受控 runner 的加密导出和对象备份。pg_cron 不能直接替代运行 pg_dump 的机器。

数据库备份不含 Storage 对象；Auth/SMTP/provider 配置、secret、签名及 DNS 也独立维护。恢复先进入隔离项目，禁止误触真实支付/邮件；验证 schema、RLS、对象、账号、删除台账、支付对账和密文解密。

同步数据库恢复还必须检查 commit_seq/nonce/撤销状态回退，执行协议规定的恢复/换钥流程后才允许写入。主文档 §9.4 定义 RPO/RTO 和演练回执。

## 6. 生产推广与回滚

- 推广前核对目标环境；不靠本机曾经 link 到哪个项目来判断。
- Edge Functions 回滚为重发已验收版本；数据库优先兼容前推，破坏性 restore 另行评估。
- Auth 故障进入维护/关闭故障 provider；**不得把真实产品切 mock-authenticated 伪装登录或删除成功**。
- 暂停新收费时继续可靠接收支付事件；修复后重放/对账。
- 记录 production function/migration/release、smoke、备份与恢复结果，再同步主文档和看板。

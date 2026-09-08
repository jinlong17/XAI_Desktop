# Feature Brief — web-auth-device-session

| 字段 | 值 |
|---|---|
| Feature Slug | `web-auth-device-session` |
| 创建日期 | 2026-05-21 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-auth-device-session/20260521-roadmap-seed.md` |
| 关联文档 | `docs/workflow/roadmap/web-ticktick-parity.md`、`docs/adr/0006-web-face-hybrid-reuse-boundary.md`、`docs/PLUGIN_MAP.md`、`docs/planning/sub-prds/web/PRD.md`、`docs/planning/sub-prds/web/dev-plan.md`、`packages/web-sync-crypto-contract-preflight/docs/{design.md,api.md}` |

---

## Structured Brief

### Problem / Motivation

`apps/web` 已经有了薄宿主壳，但目前 `/auth/*` 与 `/app/*` 仍只是占位页面，没有真正的浏览器会话基础设施。W3 需要把下面几件事先收敛成一个可实现边界，而不是把它们散落到 host、后续 sync driver，或 `@repo/plugin-account` 的非稳定桌面实现里：

1. **浏览器 Auth 会话链路未落地**：email signup/login/verify/reset、Apple/Google OAuth、PKCE callback、session restore 都还没有 Web 真正的运行边界。
2. **设备会话语义必须先于业务数据层落地**：`web-sync-crypto-contract-preflight` 已冻结 `X-Device-Id` 语义，但还没有浏览器侧 `device_id` 持久化、`device_register`、heartbeat、`device_revoked` 拦截与后续请求注入入口。
3. **安全边界不能留给后续行随意实现**：custom IndexedDB token storage、`sessionStorage` 中的 PKCE `state/code_verifier`、以及同源 `next` allowlist 都需要在本 row 明确，否则后续 Web rows 容易各自补一套不兼容的会话逻辑。

### Desired Outcome

产出一个可实现的 W3 规划包，冻结：

- `packages/web-auth-device-session` 作为浏览器 auth/device-session 业务边界。
- `apps/web` 只保留 route mapping、provider mount、薄页面壳，不承载 auth/session 业务逻辑。
- Supabase browser auth 方案、PKCE/OAuth callback 方案、以及自定义 IndexedDB session storage 方案。
- `device_id` 的本地持久化、`device_register` / `device_heartbeat` 的调用时机、以及未来 `/sync/*` / RPC header 注入入口。
- `/auth/*` 与 `/app/*` 的最小 route-guard 语义，以及 `next` redirect allowlist 规则。

### Scope

- 规划 email signup/login/verify/reset 的 Web 会话流。
- 规划 Apple/Google OAuth PKCE flow 与 callback 处理。
- 规划 Supabase custom `SupportedStorage` 的 IndexedDB backing store。
- 规划本地 `device.id` 存储、`device_register`、heartbeat、forced logout / revoke interception。
- 规划 `apps/web` 中 `AuthPage`、`AppShellPage`、`AppProviders`、`HostRouter` 的薄壳接入点。
- 输出后续 `feature-build` 的 phase 切分、文件边界、验证门。

### Non-goals

- 不实现 `driver-sync-blob`、`entity_blobs`、`entity_index`、`pending_mutations` 等后续缓存/同步层。
- 不在本 row 内决定 `web-console-host-router` 的最终 router library 选型；当前只要求给现有 host 壳补最小 guard seam。
- 不复用或修改 `@repo/plugin-account` 为浏览器 runtime 直接依赖；它在本 row 仅作为上游 contract/reference。
- 不触碰 desktop host、Tauri backend、Sync Edge 实现或远程 Supabase/Vercel provisioning。
- 不实现设备管理 UI、跨标签 leader election、Realtime 设备广播或账号删除/导出。

### Constraints

- 遵守 `ADR-0006`：Web 可以独立实现浏览器 view/session 层，但共享契约不能漂移。
- 遵守 `docs/PLUGIN_MAP.md`：`@repo/plugin-account` 当前是 In-Dev，只能作为 contract owner 参考，不能把本 row 建成“直接浏览器复用 desktop plugin”的计划。
- `web-sync-crypto-contract-preflight` 已冻结：业务 API 鉴权不能退化为“Supabase token 即可”，后续请求必须有 `X-Device-Id`。
- Token at-rest 保护目标仅限磁盘/跨用户访问，不宣称抵抗同源 XSS。
- OAuth `state` 与 `code_verifier` 必须放在 `sessionStorage`，open redirect 必须被同源 `next` allowlist 拒绝。

### Acceptance Criteria

1. 存在 `docs/reviews/web-auth-device-session/20260521-feature-brief.md` 与 `20260521-discovery-review.md`。
2. 存在 `packages/web-auth-device-session/docs/{design,api,test,dev_log}.md` 四件套。
3. 规划文档明确浏览器 auth stack、IndexedDB storage adapter 选择、以及 `packages/web-auth-device-session` 的边界理由。
4. `api.md` 明确冻结：
   - email/OAuth flow 边界
   - `next` allowlist 规则
   - `device_register` / `device_heartbeat`
   - `device_id` 持久化与 `X-Device-Id` header 注入入口
   - revoked/unknown device 的错误语义
5. `dev_log.md` 结束时为 `Status = NEEDS_REVIEW` 且 `Suggested Next = feature-review`。

### Open Questions

1. `device_revoked` / `unknown_device` 后是否立即轮换本地 `device_id`，还是保留原 id 等待重新注册。
2. `next` allowlist v1 是否只允许 `/app` 前缀，还是同时保留少量 `/auth/*` 完成页。
3. `packages/web-auth-device-session` 在 build 阶段是否直接成为 workspace package，还是先以 docs anchor + `apps/web` 私有模块落地一轮，再回收成独立包。

### Planner Handoff

- 推荐方向：**直接使用 Supabase browser client + PKCE + custom IndexedDB storage**，而不是 SSR/cookie session 或二次包装的双 auth 层。
- 建议边界：`packages/web-auth-device-session` 负责浏览器 auth/session/device 生命周期；`apps/web` 只 mount provider 与 route guards。
- 审查重点：与 `web-browser-e2e-crypto-runtime` 的职责切分、`@repo/plugin-account` 的非稳定依赖风险、`next` allowlist 是否足够严格、以及 `device_id` / revoke 语义是否自洽。

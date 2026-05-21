# Feature Brief — web-sync-crypto-contract-preflight

| 字段 | 值 |
|---|---|
| Feature Slug | `web-sync-crypto-contract-preflight` |
| 创建日期 | 2026-05-21 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-sync-crypto-contract-preflight/20260521-roadmap-seed.md` |
| 关联文档 | `docs/workflow/roadmap/web-ticktick-parity.md`、`docs/planning/sub-prds/web/PRD.md`、`docs/planning/sub-prds/sync/PRD.md`、`packages/web-architecture-adr-lite/docs/design.md` |

---

## Structured Brief

### Problem / Motivation

Web 路线在实现 `driver-sync-blob`、浏览器本地缓存、设备会话之前，仍有两类未冻结的高风险前置:

1. **浏览器加密实现边界未定**: 还没有拍板 Web 是复用 Rust primitive 的 WASM 产物，还是走浏览器独立实现并靠 RFC/vector gate 保证一致性。
2. **Web 文档与已发货 Sync W0-W3 产物存在协议漂移**: Web PRD 仍残留 `since_seq`、`encrypted_blob/blob_nonce/blob_aad`、`sync_events.seq` 等表达，而 shipped Sync row 已把权威契约收敛到 `commit_seq`、binary envelope、deterministic CBOR AAD、`X-Device-Id` 业务层强校验。

如果不在这里冻结，后续 Web Auth / Crypto Runtime / Sync Driver / IndexedDB Cache rows 会各自实现一套“差不多”的协议，风险集中在 AAD 漂移、nonce/sequence 误解、设备撤销语义变形，以及 reviewer 无法判断 Web 是否真正复用了 shipped Sync truth。

### Desired Outcome

产出一份 docs-only 的 **contract preflight**，明确:

- Web 浏览器端采用哪条加密实现路线。
- `/sync/pull`、`/sync/push`、Realtime/`sync_events.seq`、`blob_aad`、`X-Device-Id` 的最终 Web-facing 语义。
- Browser runtime 后续必须通过哪些 RFC / fixture / negative gates。
- 在缺少 live Supabase 资源时，后续 rows 的本地 mock 边界和 deferred live gates。

### Scope

- 评估并拍板浏览器 crypto 方案:
  - Rust primitives shared via WASM
  - Browser-native hybrid (`WebCrypto` + JS/WASM libs) with shared vectors
- 对齐 Web PRD 与 shipped Sync W0-W3 artifact 的协议命名与字段语义。
- 冻结 Web 侧对以下能力的前置契约:
  - Argon2id
  - AES-GCM envelope/AAD
  - deterministic CBOR
  - X25519/HPKE
  - recovery-related primitives where applicable
- 明确本地 mock-only 策略，不做任何远程资源申请或部署。

### Non-goals

- 不实现 `@repo/core-data` Web driver。
- 不实现浏览器 Key/DEK 生命周期、IndexedDB schema、Auth UI、Realtime 订阅、PWA 或部署流水线。
- 不修改 shipped Sync Rust / SQL / Edge implementation。
- 不远程 provision Supabase / Vercel / DNS / OAuth secrets。

### Constraints

- 所有业务实体字段继续保持 zero-knowledge，**整行进入 `encrypted_blob`/envelope**；服务端不增加 todo/list/label 明文字段。
- Browser 端必须以 **RFC/vector compatibility** 验证为准入门，而不是“看起来能加解密”。
- `X-Device-Id` 是业务层强约束，不允许退化成“有 Supabase token 就算授权”。
- 文档必须以 shipped Sync W0-W3 artifacts 为优先 authority；Web PRD 中与其不一致的表达要在此 feature 中显式纠偏。

### Acceptance Criteria

1. 存在 `docs/reviews/web-sync-crypto-contract-preflight/20260521-discovery-review.md`，明确浏览器 crypto 选择、候选权衡、风险和外部证据。
2. 存在 `packages/web-sync-crypto-contract-preflight/docs/{design,api,test,dev_log}.md` 四件套。
3. `api.md` 明确冻结:
   - `/sync/pull`
   - `/sync/push`
   - `commit_seq` / `sync_events.seq`
   - `blob_aad`
   - `X-Device-Id`
4. `test.md` 明确 required RFC/vector gates、negative cases、local mock strategy、deferred live gates。
5. 本轮结束时 `dev_log.md` 为 `Status = NEEDS_REVIEW` 且 `Suggested Next = feature-review`。

### Open Questions

1. Browser 端最终是直接调用 Supabase Edge `/sync/*`，还是在 Web host 层再包一层 BFF/route proxy。
2. Browser recovery signing 是否在 v1 Web auth/account 流程中立即启用，还是先只冻结 vector gate，待后续 row 再接线。
3. Browser runtime row 是否需要把 deterministic CBOR AAD writer 做成 schema-specific tiny encoder，而不是直接依赖通用 CBOR 编码器。

### Planner Handoff

- 优先级: W1 contract freeze，先于 `web-auth-device-session`、`web-browser-e2e-crypto-runtime`、`web-sync-blob-driver`。
- 推荐方向: **独立 browser crypto runtime + shared RFC/vector gates**，不要把 Web v1 绑定到 Rust→WASM 全栈复用。
- 预期输出: feature brief + discovery review + package docs + `NEEDS_REVIEW` dev log。

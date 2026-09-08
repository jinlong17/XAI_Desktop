# Feature Brief — web-browser-e2e-crypto-runtime

| 字段 | 值 |
|---|---|
| Feature Slug | `web-browser-e2e-crypto-runtime` |
| 创建日期 | 2026-05-21 |
| 作者 | Codex (`feature-plan` inline) |
| Step 0 QA Gate | PASS |
| 输出状态 | `READY_FOR_DISCOVERY` |
| Source | `docs/reviews/web-browser-e2e-crypto-runtime/20260521-roadmap-seed.md` |
| 关联文档 | `docs/workflow/roadmap/web-ticktick-parity.md`、`packages/web-sync-crypto-contract-preflight/docs/{design.md,api.md,test.md,dev_log.md}`、`packages/web-release-site-archive-vite-shell/docs/design.md`、`docs/planning/sub-prds/web/PRD.md` |

---

## Structured Brief

### Problem / Motivation

`web-sync-crypto-contract-preflight` 已经冻结了 Web v1 的方向: 不走 Rust 运行时 WASM 复用，而是走 browser-native hybrid，并用 shipped Sync W0-W3 契约 + RFC/vector gates 保证一致性。现在缺的不是“再讨论一次方向”，而是把这条方向收敛成一个可被后续 rows 直接调用的浏览器运行时包。

如果这个 row 不先收口，后续 `web-auth-device-session`、`web-sync-blob-driver`、`web-encrypted-indexeddb-cache` 会各自实现:

1. 主密码 -> KEK 派生
2. `/auth/me` keyring/current-key metadata 校验
3. 本地 KEK-wrapped device-private-key seam unwrap + active `device_dek_wraps` HPKE open
4. non-extractable `CryptoKey` 内存生命周期
5. AES-GCM blob helper
6. observable lock transition seam / best-effort zeroization

结果会导致参数漂移、错误语义不一致、锁屏策略分叉，以及 reviewer 无法判断 Web 是否仍然遵守已发货的 Sync contract。

### Desired Outcome

创建并规划一个浏览器专用运行时包 `packages/web-browser-e2e-crypto-runtime/`，明确:

- 主密码 challenge、`secret_key` 参与的 Argon2id KEK 派生、以及 local wrapped device-private-key seam 的默认策略
- `/auth/me` keyring/current-key metadata 的消费方式
- active `device_dek_wraps` 的 browser-side HPKE open 与 non-extractable `CryptoKey` 生命周期
- 浏览器侧 AES-GCM / envelope helper API
- best-effort 敏感 buffer 处理、idle lock 语义、以及可观察的 lock transition seam
- 本地 RFC/vector/negative gates（含 HPKE / AAD / envelope）
- 后续 Web rows 可以依赖的稳定公共接口

### Scope

- 选定 browser-native hybrid 内部的具体实现组合，尤其是 Argon2id/KDF 路径。
- 定义 package public surface、错误语义、锁/解锁状态机、active-wrap unlock boundary、以及 downstream 依赖方式。
- 冻结与 `web-sync-crypto-contract-preflight` 对齐的本地向量测试门。
- 给 `feature-build` 输出可执行的分 phase 计划和文件边界。
- 初始化本 feature 的 docs 四件套与 Step 0 / discovery 文档。

### Non-goals

- 本轮不实现生产运行时代码。
- 不在 `apps/web` 中落业务逻辑或长期 runtime 状态。
- 不实现 `web-auth-device-session` 的路由/UI 流程。
- 不实现 `/auth/me` 拉取、device register、pending-device poll、或 donor `grant_dek_wrap` orchestration。
- 不实现 `web-sync-blob-driver`、IndexedDB schema、Realtime、PWA、部署或远程 Supabase 资源。
- 不重开 `web-sync-crypto-contract-preflight` 已冻结的 wire contract 讨论。

### Constraints

- 必须匹配 `packages/web-sync-crypto-contract-preflight/docs/{design.md,api.md,test.md,dev_log.md}` 已冻结的 contract truth。
- 必须遵循 Sync v0.6 authority：`encrypted_dek` 已废弃，运行时输入来自 `secret_key`、`/auth/me` keyring/current-key metadata、local wrapped device-private-key seam、以及 active `device_dek_wraps`。
- `apps/web` 是 canonical browser host，但只允许做 thin host；crypto business logic 必须留在 `packages/web-browser-e2e-crypto-runtime/`。
- KEK / DEK 不能进入 localStorage、IndexedDB、cookie、日志、Sentry payload、序列化 React state。
- JavaScript zeroization 只能声明为 best effort；必须显式记录 `Uint8Array.fill(0)` 与 GC 的局限。
- 本 row 的 vector gates 必须可在本地跑通，不依赖 live Supabase，并覆盖 RFC 9106、RFC 9180、AAD/envelope drift 风险。

### Acceptance Criteria

1. `docs/reviews/web-browser-e2e-crypto-runtime/20260521-discovery-review.md` 明确比较候选浏览器 crypto 方案，并给出带外部证据的推荐。
2. `packages/web-browser-e2e-crypto-runtime/docs/{design,api,test,dev_log}.md` 存在且相互一致。
3. `api.md` 明确 package public surface、`secret_key` + `/auth/me` keyring/current-key metadata + wrapped device-key seam + active-wrap HPKE open 的 unlock contract、`CryptoKey` 生命周期、lock state、observable transition seam、error semantics、permission/idempotency notes。
4. `test.md` 明确 RFC/vector/negative gates、本地 mock 策略、以及后续 build 需要跑的浏览器/单元测试，尤其覆盖 RFC 9180 active-wrap open 和 lock transition observers。
5. `dev_log.md` 结束时为 `Status = NEEDS_REVIEW`，`Suggested Next = feature-review`，并记录 `Automation Mode = A-Claude`、`Verify Cross-vendor = no`。

### Open Questions

1. Argon2id 是否直接采用 `hash-wasm`，还是保留 `openpgpjs/argon2id` 作为更小的可替换 fallback。
2. local wrapped device-private-key seam 的具体浏览器持久化格式是否需要额外 versioning 字段，还是单一 `wrapVersion` 即可。
3. idle lock timer 是由 package 自己持有，还是 package 只暴露 controller，让上层 host/provider 驱动。
4. 是否需要在本 row 预留 Worker 入口，供后续 IndexedDB cache / 搜索 row 在锁屏时统一清理内存镜像。

### Planner Handoff

- 推荐方向: 维持 preflight 的 browser-native hybrid，但在本 row 内进一步收敛为 `WebCrypto` + `hash-wasm` + narrow helper modules，而不是引入全量 `libsodium.js`。
- 关键评审点: `secret_key` + `/auth/me` keyring/current-key metadata + wrapped device-key seam 的 unlock contract、active `device_dek_wraps` HPKE open ownership、non-extractable `CryptoKey` 生命周期边界、observable lock seam、以及 vector gate 是否足以拦住 HPKE/AAD/envelope drift。
- 预期交付: Step 0 brief + discovery review + package docs + `NEEDS_REVIEW` dev log，为后续 `feature-build` 提供三阶段实现计划。

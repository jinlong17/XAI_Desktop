# Discovery Review — web-browser-e2e-crypto-runtime

| 字段 | 值 |
|---|---|
| Feature | `web-browser-e2e-crypto-runtime` |
| 日期 | 2026-05-21 |
| 执行者 | Codex (`feature-plan` inline, revise pass) |
| 外部调研 | Required — browser crypto dependency selection within the shipped hybrid boundary |

## Problem Framing

这次 revise 的核心不是“再选一次库”，而是把运行时契约改回 **Sync v0.6 的真实输入和职责边界**。

上一版计划的问题有三处：

1. 把浏览器解锁入口冻结成了过时的 `encrypted_dek` + `dekWrapNonce` 模型。
2. 没说清楚当前 row 是否负责 **browser-side open active `device_dek_wraps`**，导致 DEK acquisition ownership 模糊。
3. lock 只停留在本包内部状态，没有给后续缓存/worker row 一个稳定的 wipe 观察面。

本次修订后的目标是：

- 接受真实浏览器输入：
  - `master_password`
  - `secret_key`
  - `/auth/me` 返回的 keyring/current-key metadata
  - active device 的 wrap material
  - 本地 current device private key mirror（KEK-wrapped at rest）
- 明确本 row **负责本地 HPKE unwrap active device wrap**，但 **不负责** `/auth/me` 拉取、device register、grant orchestration、wrap 轮询。
- 冻结可观察的 lock transition seam，供 `web-encrypted-indexeddb-cache` / future worker rows 在 `manual` / `idle` / `unload` / `error` 时清内存。

## Dependency And Contract Baseline

### Current source of truth

- `packages/web-sync-crypto-contract-preflight/docs/design.md`
  - browser crypto 边界已经冻结为 `WebCrypto` + targeted JS/WASM libs。
- `packages/web-sync-crypto-contract-preflight/docs/api.md`
  - browser runtime 必须覆盖 HPKE(X25519/HKDF-SHA256) 与 frozen AAD/envelope semantics。
- `packages/web-sync-crypto-contract-preflight/docs/test.md`
  - 后续实现 row 必须带 RFC 9106 / RFC 8949 / RFC 9180 admission gates。
- `docs/TECHNICAL_REQUIREMENTS.md` §2.4
  - Sync PRD v0.6-DRAFT 是 E2E sync 协议唯一权威 source of truth。
- `docs/planning/sub-prds/sync/dev-plan.md`
  - `encrypted_dek` 已明确废弃；DEK acquisition 改为 `device_dek_wraps` per-device wrap。
- `docs/planning/sub-prds/sync/PRD.md`
  - 登录后 `GET /auth/me` 返回 `kek_salt`, `current_key_id`, `keyring`, `dek_check`, `secret_key_check` 等 metadata。
  - active device 通过 `device_dek_wraps[device_id, current_key_id]` 获取当前 wrap。
  - KEK 派生必须是 `Argon2id(master_password, salt=kek_salt, secret=secret_key, ...)`。
- `packages/hpke-per-device-wrap/docs/{design,api,test}.md`
  - 已冻结桌面侧 HPKE Base-mode seal/open primitive 与 info-vs-aad invariants；RFC 9180 coverage 在浏览器实现 row 不能缺席。
- `packages/web-auth-device-session/docs/{design,api}.md`
  - 已冻结该 row 负责 browser auth/session、device identity、request/device orchestration，以及 local device-key persistence policy；不负责 DEK runtime 生命周期。

### Revision delta from the rejected plan

- **Rejected**: public unlock API 以 `encrypted_dek` 作为 source of truth。
- **Accepted**: public unlock API 以 `/auth/me` keyring metadata + active `device_dek_wraps` material + local wrapped device-private-key mirror 为 source of truth。
- **Rejected**: HPKE unwrap ownership 未定义。
- **Accepted**: 本 row owns browser-local `openActiveDeviceWrap(...)`; donor grant/write path stays elsewhere.
- **Rejected**: `getState()` / `configureIdleLock()` only。
- **Accepted**: add `subscribe(listener)` transition seam for downstream wipe observers.

## External Research

### Search queries

- `site:github.com Daninet/hash-wasm argon2 browser readme`
- `site:npmjs.com/package hash-wasm argon2id npm`
- `site:github.com openpgpjs/argon2id official readme browser wasm`
- `site:npmjs.com/package argon2id npm`
- `site:github.com antelle/argon2-browser browser argon2 readme`
- `site:github.com jedisct1/libsodium.js browser argon2 readme`
- `site:npmjs.com/package libsodium-wrappers-sumo argon2`

### Evidence table

| Source | URL | What it was used for | Observation |
|---|---|---|---|
| hash-wasm GitHub | https://github.com/Daninet/hash-wasm | primary Argon2id candidate | Browser-focused WASM library, zero dependencies, worker-friendly, and documents direct `argon2id` usage. |
| hash-wasm npm | https://www.npmjs.com/package/hash-wasm | package maintenance/license snapshot | MIT licensed, typed, browser-focused hashing/KDF package. |
| openpgpjs/argon2id GitHub | https://github.com/openpgpjs/argon2id | alternate Argon2id candidate | Small browser-first Argon2id implementation with SIMD/non-SIMD fallback. |
| openpgpjs/argon2id npm | https://www.npmjs.com/package/argon2id | package maintenance snapshot | Smaller footprint, but lighter ecosystem/maintenance signal than `hash-wasm`. |
| argon2-browser GitHub | https://github.com/antelle/argon2-browser | legacy fallback candidate | Mature browser Argon2 port, but older bundler/runtime expectations. |
| libsodium.js GitHub | https://github.com/jedisct1/libsodium.js | broader suite option | Browser-capable, but much wider primitive surface than this row needs. |
| libsodium-wrappers-sumo npm | https://www.npmjs.com/package/libsodium-wrappers-sumo/v/0.7.10 | suite maintenance snapshot | General-purpose suite, not a narrow KDF/runtime helper. |

### Inference note

依赖推荐仍然是从官方文档和本 repo 已冻结约束推导出的 inference：外部资料只告诉我们库能力和维护状态，真正的边界判断来自 Sync v0.6 与 preflight contract。

## Options

### Option A — `WebCrypto` + `hash-wasm` + repo-owned contract helpers, with real Sync v0.6 unlock inputs

Use:

- native `WebCrypto` for AES-GCM key usage and non-extractable key handles
- `hash-wasm` for Argon2id KEK derivation
- modular browser HPKE implementation already frozen upstream by preflight
- repo-owned session / AAD / envelope / lock helpers

Public unlock contract accepts:

- `masterPassword`
- `secretKey`
- keyring/current-key metadata from `/auth/me`
- active `device_dek_wraps` material
- local wrapped current-device private-key material

This row owns:

- KEK derivation with `secret_key`
- KEK unwrap of the local current-device private-key mirror
- local validation against keyring metadata
- HPKE open of the active device wrap
- DEK session lifecycle
- observable lock transitions

This row does not own:

- `/auth/me` fetch
- `device_register`
- pending-device polling
- donor grant orchestration
- `grant_dek_wrap` remote writes

Pros:

- Matches Sync v0.6 instead of inventing a compatibility layer around deprecated `encrypted_dek`.
- Keeps the browser runtime narrow but still complete at the cryptographic boundary.
- Gives downstream cache/driver rows one stable unlock and lock-observation seam.
- Preserves `web-auth-device-session` as the owner of remote device/session orchestration.

Cons:

- Phase 2 must now cover both Argon2id and HPKE open logic, which is more than a password-only unlock plan.
- Requires local RFC 9180 vector gates in this row rather than leaving them to a later consumer.

Assessment:

- Best fit. This is the recommended revision.

### Option B — keep an `encrypted_dek`-style local mirror as the public unlock contract

Structure:

- host or auth row normalizes live Sync state into a synthetic `encrypted_dek` payload
- runtime stays ignorant of `device_dek_wraps` and current key metadata

Pros:

- Smaller API surface for the runtime package itself.
- Could simplify local-only fixture setup.

Cons:

- Freezes a compatibility fiction instead of the real Sync contract.
- Hides the active `key_id` / keyring status / wrap ownership boundary from the row that actually unlocks the DEK.
- Makes HPKE/device-wrap ownership ambiguous again.
- Leaves the password gate detached from the device-key open path unless another row adds a second undocumented wrapper.
- Risks drift against v0.6 because later rows would debug the adapter, not the real protocol input.

Assessment:

- Reject as the public source of truth.
- If a later offline-resume optimization ever introduces a wrapped local mirror, it must remain **internal-only** to this package and still derive from current keyring + active wrap truth.

### Option C — move active wrap open out of this row and leave it to `web-auth-device-session`

Pros:

- Would let this row focus only on AES helpers and lock state.

Cons:

- Violates the existing auth row boundary, which explicitly does not own DEK/runtime crypto lifecycle.
- Splits unlock semantics across two rows, forcing downstream consumers to learn two APIs.
- Makes RFC 9180 browser coverage somebody else’s problem even though this row is the runtime boundary.

Assessment:

- Reject. Wrong ownership split.

## Recommendation

Choose **Option A**.

## Frozen Runtime Shape

### Ownership split

`web-browser-e2e-crypto-runtime` owns:

- `master_password + secret_key -> KEK` derivation
- unwrap of the local current-device private-key mirror
- keyring metadata validation (`secret_key_check`, current `key_id`, key presence)
- local HPKE open of the active device wrap into an in-memory DEK session
- non-extractable KEK/DEK handle lifecycle
- AES-GCM helper APIs around the unlocked DEK
- lock transition observation and idle-lock control
- RFC 9106 / RFC 9180 / AAD/envelope local gates

`web-auth-device-session` owns:

- `/auth/me` fetching and refresh
- current device identity persistence
- local device-private-key persistence/import policy
- active-wrap fetch/poll/retry orchestration
- pending-device grant UX and remote `grant_dek_wrap` flow

`web-encrypted-indexeddb-cache` and future worker rows own:

- decrypted entity cache/index state
- worker mirrors
- subscription to runtime lock transitions so they wipe their own memory

### Why KEK still belongs in this row

虽然 DEK transport 已改为 per-device HPKE wrap，浏览器 runtime 仍然要显式持有 KEK derivation 责任，因为：

- Sync v0.6 规定 `secret_key` 必须参与 KEK 派生，不能把这条规则藏到别的 row。
- 本地 current-device private key mirror 需要经由 KEK unwrap 后才能进入 HPKE open 路径，否则“主密码解锁”会变成可绕过。
- later browser rows still need one canonical in-memory unlock state, not “DEK-only but KEK somewhere else”.
- local unlock failure semantics need to distinguish:
  - obvious `secret_key_check` mismatch
  - malformed / missing current wrap metadata
  - HPKE open failure on the active wrap

## Build-Time Phase Recommendation

### Phase 1 — Package scaffold, lock-state primitives, and observable transition seam

Deliver:

- browser-safe package scaffold
- typed runtime state
- idle-lock controller
- `subscribe(listener)` / unsubscribe contract
- best-effort buffer cleanup helpers

Gate:

- downstream cache/worker rows can plan against one explicit lock transition surface before crypto implementation starts

### Phase 2 — Real Sync unlock path: KEK derivation + active wrap open + session lifecycle

Deliver:

- Argon2id KEK derivation using `secret_key`
- KEK unwrap of the local current-device private-key mirror
- keyring/current-key metadata validation from `/auth/me`
- local HPKE open of the active `device_dek_wraps` row using the unwrapped current device private key
- unlocked session state with typed lock/error semantics

Gate:

- valid `master_password + secret_key + keyring + wrappedDevicePrivateKey + active wrap` unlocks a local DEK session
- invalid `secret_key_check`, wrong password path, key-id mismatch, missing wrap, and HPKE AAD/info mismatch all fail with typed errors
- local RFC 9106 and RFC 9180 vectors pass

### Phase 3 — AES-GCM helper APIs and frozen contract vectors

Deliver:

- encrypt/decrypt helpers around the unlocked DEK
- deterministic AAD assembly
- envelope/header compatibility gates
- negative cases for wrong AAD/tag/blob swap

Gate:

- downstream `web-sync-blob-driver` and `web-encrypted-indexeddb-cache` can depend on one stable helper surface without re-encoding protocol details

## Risks

- Browser X25519/HPKE implementation details can drift from the desktop primitive if RFC 9180 fixtures are treated as optional.
- If the runtime API hides keyring/current-key metadata too aggressively, later re-key/current-key transitions will reintroduce adapter seams.
- Lock subscription ordering must be deterministic enough that downstream wipe consumers do not miss `unload` / `error` paths.

## Open Questions

1. Whether the browser HPKE implementation should accept only non-extractable `CryptoKey` device-private handles or also a fixture-only import seam for test vectors.
2. Whether the runtime should expose a narrow “unlock context snapshot” for downstream diagnostics without leaking secret material.
3. Whether future offline-resume work needs an internal wrapped-session mirror, while keeping current Sync metadata as the only public unlock source.

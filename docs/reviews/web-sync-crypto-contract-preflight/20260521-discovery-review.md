# Discovery Review — web-sync-crypto-contract-preflight

| 字段 | 值 |
|---|---|
| Feature | `web-sync-crypto-contract-preflight` |
| 日期 | 2026-05-21 |
| 执行者 | Codex (`feature-plan` inline) |
| 外部调研 | Required — browser crypto/runtime option scan |

## Problem Framing

这个 row 不是“开始写 Web crypto”，而是先冻结 **Web 是否与 shipped Sync W0-W3 讲同一种协议**。当前存在两类 drift:

- **实现 drift**: Web 端还没拍板是 Rust→WASM 共享实现，还是 browser-native hybrid。
- **契约 drift**: Web PRD 仍写有 `since_seq`、`encrypted_blob/blob_nonce/blob_aad` 和 `sync_events.seq`，但 shipped Sync rows 已收敛到:
  - `commit_seq` 是唯一全局顺序源
  - `/sync/pull` 用 `since_commit_seq`
  - `/sync/push` / `/sync/pull` 传输 binary envelope `blob`
  - nonce 由 `encryption_device_id || counter` 重建
  - AAD 不存 envelope 内，按 deterministic CBOR 即时重算
  - `X-Device-Id` 对所有业务 API 是强制业务层鉴权

因此本 row 的核心不是“选一个库”，而是**冻结 Web 后续 rows 必须遵守的 browser crypto boundary + wire contract truth**。

## Existing Repo Evidence

### Shipped Sync truth already frozen in W0-W3

- `packages/commit-seq-authority/docs/design.md`
  - `account_commit_seq_global` is the only global ordering source.
- `packages/sync-engine-pull/docs/design.md`
  - client pull cursor is one global `sinceCommitSeq`; transport maps to `GET /sync/pull?since_commit_seq=&limit=`.
- `docs/planning/sub-prds/sync/PRD.md` §7.4 / §7.5
  - wire contract uses `commit_seq`, `next_commit_seq`, `current_account_commit_seq`, and Realtime `commit_seq`.
- `packages/cipher-envelope-codec/docs/design.md`
  - envelope serializes `v`, `kdf_v`, `key_id`, `encryption_device_id`, `counter`, ciphertext, tag; **no standalone nonce or AAD field**.
- `packages/deterministic-cbor-aad/docs/api.md` and `apps/desktop/src-tauri/src/crypto/aad.rs`
  - `BlobAad` / `WrapAad` / `RecoveryMessageAad` are fixed-schema deterministic CBOR contracts.
- `packages/crypto-tauri-commands/docs/design.md`
  - AAD ownership stays inside crypto boundary; caller supplies entity identifiers and revision, not raw AAD bytes.

### Web PRD still has pre-alignment language

- `docs/planning/sub-prds/web/PRD.md`
  - still mentions `since_seq`, `sync_events.seq`, and older examples with `encrypted_blob`, `blob_nonce`, `blob_aad`.

### Downstream dependency pressure

- Roadmap manifest row #7 is already named `web-browser-e2e-crypto-runtime` and calls out `WebCrypto/hash-wasm runtime`.
- Row #8 `web-sync-blob-driver` depends on this row and should consume a frozen contract rather than reinterpret Sync PRD.

## External Research

### Search queries

- `site:github.com Daninet/hash-wasm argon2 browser readme`
- `site:github.com openpgpjs/argon2id official readme browser wasm`
- `site:npmjs.com/package @hpke/core published npm`
- `site:npmjs.com/package @hpke/dhkem-x25519 npm`
- `site:npmjs.com/package cbor-x latest npm`
- `site:npmjs.com/package @noble/ed25519 npm`
- `Web Crypto API MDN`
- `wasm-pack build --target web official docs`

### Evidence table

| Source | What it was used for | Key observation |
|---|---|---|
| MDN Web Crypto API — https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API | browser-native crypto baseline | WebCrypto is broadly available in secure contexts and usable in Web Workers. |
| wasm-pack docs — https://rustwasm.github.io/docs/wasm-pack/print.html | Rust→WASM feasibility | Rust browser reuse is feasible, but it introduces a dedicated wasm packaging/init layer (`wasm-pack build --target web`, init/fetch/target concerns). |
| hash-wasm GitHub — https://github.com/Daninet/hash-wasm | Argon2id candidate | Browser-focused, zero-dependency, tree-shakeable WASM library with Argon2id support and base64-bundled modules. |
| hash-wasm npm — https://www.npmjs.com/package/hash-wasm | maintenance snapshot | Current npm metadata shows `4.12.0`, MIT, published 9 months ago. |
| openpgpjs/argon2id GitHub — https://github.com/openpgpjs/argon2id | alternate Argon2id candidate | Browser-optimized Argon2id with SIMD/non-SIMD fallback, but bundler/WASM-loader assumptions are more explicit. |
| `@hpke/core` npm — https://www.npmjs.com/package/@hpke/core | HPKE core candidate | Current npm metadata shows `1.7.4`, MIT, published 24 days ago; explicitly recommends modular use with extension packages. |
| `@hpke/dhkem-x25519` npm — https://www.npmjs.com/package/@hpke/dhkem-x25519 | X25519 HPKE extension | Current npm metadata shows `1.6.4`, MIT, published a month ago; browser examples are first-class. |
| hpke-js GitHub — https://github.com/dajiaji/hpke-js | HPKE browser/runtime support | `@hpke/core` + `@hpke/dhkem-x25519` support browser usage; the modular package split matches the minimal ciphersuite we need. |
| cbor-x npm — https://www.npmjs.com/package/cbor-x | CBOR compatibility candidate | MIT, 0 runtime deps, published a year ago; standard CBOR support is fine, but canonical AAD bytes still need repo-owned fixture gates. |
| `@noble/ed25519` npm — https://www.npmjs.com/package/@noble/ed25519 | recovery-signing candidate | Current npm metadata shows `3.0.0`, MIT, published 13 days ago; RFC8032-compliant browser-safe ed25519 implementation. |

## Options

### Option A — Share Rust primitives through browser WASM

Compile the existing Rust crypto primitives to browser-consumable WASM and keep one implementation lineage across desktop and Web.

Pros:

- Highest code-path parity with shipped Rust rows.
- Rust already owns deterministic CBOR AAD, envelope packing, and recovery transcript semantics.
- Reduces the chance of TS implementation drift in low-level primitives.

Cons:

- Web still needs JS/browser glue for Auth storage, workers, transport, and header/session handling, so “one implementation” is not end-to-end true.
- Adds explicit WASM packaging/bootstrap complexity (`wasm-pack` target/init/loading/bundler handling) before any business row can ship.
- Replaces browser-native AES-GCM with a WASM path even though WebCrypto is already stable and worker-safe.
- Harder to keep bundle/perf/debug surface small for a browser-first v1.

Assessment:

- Technically viable, but too much runtime and packaging complexity for a preflight row whose job is to unblock Web implementation safely.

### Option B — Independent browser hybrid: WebCrypto + hash-wasm + modular HPKE + shared fixtures

Use browser-native `WebCrypto` for AES-GCM and key material operations, `hash-wasm` for Argon2id, `@hpke/core` + `@hpke/dhkem-x25519` for HPKE, and browser-owned deterministic CBOR/envelope code constrained by shared RFC/vector gates.

Pros:

- Aligns with the roadmap’s existing `WebCrypto/hash-wasm runtime` direction.
- Keeps AES-GCM on browser-native primitives already widely available in secure contexts.
- Uses actively maintained browser-safe packages where specialized primitives are missing from WebCrypto (Argon2id, HPKE/X25519, Ed25519 if needed).
- Lets Web-specific code stay Vite/browser friendly without forcing Rust-WASM as a build/runtime prerequisite.

Cons:

- Parity depends on fixtures and negative tests, not shared source code.
- Requires very strict byte-level contract gates for deterministic CBOR, envelope parsing, and RFC vectors.
- Recovery signing still needs a browser-safe Ed25519 implementation if/when that path is wired on Web.

Assessment:

- Best fit for Web v1 if we freeze the contract rigorously and make vectors a hard admission gate.

### Option C — Independent browser stack with `openpgpjs/argon2id` instead of `hash-wasm`

Keep the same browser-native strategy as Option B, but prefer `openpgpjs/argon2id` for Argon2id.

Pros:

- Explicitly optimized for browser bundle size.
- SIMD fallback story is documented.
- MIT licensed and browser-focused.

Cons:

- Readme assumes bundler/WASM-loader handling more directly.
- Smaller ecosystem footprint in this repo’s likely use case than `hash-wasm`.
- Would still leave HPKE, CBOR, envelope, and recovery as separate browser-specific decisions.

Assessment:

- Reasonable fallback, but not the strongest default for this repo’s “minimize glue surprises” goal.

## Recommendation

Choose **Option B**.

### Frozen browser crypto choice

Web does **not** share Rust primitives via a runtime WASM dependency for v1. Instead it uses an **independent browser hybrid implementation**:

- `WebCrypto` for AES-GCM and browser-native key operations
- `hash-wasm` for Argon2id
- `@hpke/core` + `@hpke/dhkem-x25519` for HPKE Base mode with X25519/HKDF-SHA256
- `@noble/ed25519` only if/when Web recovery signing is wired
- repo-owned deterministic CBOR / envelope compatibility gates anchored to existing Rust fixtures

The shared source of truth is **not** a shared binary. It is:

1. shipped Sync W0-W3 wire/schema semantics
2. RFC vectors
3. repo-owned byte fixtures
4. negative interoperability tests

## Contract Freeze

### 1. `/sync/pull`

Freeze Web to the shipped Sync contract:

- Method: `GET /sync/pull`
- Query: `since_commit_seq=<string>&limit=<number>`
- Headers:
  - `Authorization: Bearer <jwt>`
  - `Accept-Version: sync.protocol=1`
  - `X-Device-Id: <uuid>`
- Response uses:
  - `records[]`
  - `commit_seq` as **string**
  - `next_commit_seq`
  - `current_account_commit_seq`
  - `has_more`

Not accepted:

- `since_seq`
- time-based cursors
- `POST /sync/pull`
- treating `entity_type` as a required server-side query parameter in the baseline contract

### 2. `/sync/push`

Freeze Web to the shipped batch-record contract:

- Method: `POST /sync/push`
- Headers:
  - `Authorization: Bearer <jwt>`
  - `Accept-Version: sync.protocol=1`
  - `X-Device-Id: <uuid>`
- Request body carries `records[]`, each record containing:
  - `entity_type`
  - `entity_id`
  - `mutation_id`
  - `base_revision`
  - `proposed_revision`
  - `blob` = full binary envelope, base64-encoded on the wire
  - `client_updated_at`
  - `soft_delete`
  - `hard_delete`
  - optional `causal_deps`

Not accepted:

- splitting the wire contract into separate `encrypted_blob`, `blob_nonce`, `blob_aad` fields
- server-generated `proposed_revision`
- “Supabase token only” auth without `X-Device-Id`

### 3. `sync_events.seq` semantics

Freeze `sync_events.seq` as a **conceptual alias**, not a second authority:

- the shipped ordering source is `commit_seq`
- if a later Web/server row materializes `sync_events.seq`, it must equal the same monotone value as `commit_seq`
- Realtime payloads and client cursors remain `commit_seq`-based

Result:

- `seq` may exist as a UI/event alias
- `since_commit_seq` / `commit_seq` remain the wire and storage contract

### 4. `blob_aad` semantics

Freeze `blob_aad` as **derived authenticated context**, not a wire field and not business metadata:

- AAD is deterministic CBOR computed from fixed schema inputs.
- AAD is **not** serialized inside the envelope.
- AAD is **not** a standalone required `/sync/push` or `/sync/pull` payload field.
- If a browser cache/test seam persists AAD bytes locally for debugging or regression tests, it is a derived verification artifact only.

`BlobAad` must byte-match the shipped Rust schema:

1. AAD version
2. account id
3. entity type
4. entity id
5. proposed revision
6. key id
7. deleted flag
8. schema version
9. encryption device id

### 5. `X-Device-Id`

Freeze `X-Device-Id` as a non-optional business header:

- required on all `/sync/*` requests
- required on device/session-related RPCs except the initial register/bootstrap path that creates the device identity
- server missing/unknown device => `401`
- revoked device => `403 device_revoked`
- browser client must treat `device_revoked` as forced local logout / cache clear flow, even if Supabase can still refresh an access token

## Required Browser Vector Gates

Before any Web runtime row can claim protocol compatibility, it must pass:

1. RFC 9106 Argon2id vector parity.
2. AES-GCM interoperability vectors plus wrong-AAD/wrong-tag failure cases.
3. RFC 8949 deterministic CBOR byte equality against `cbor_aad_vectors.json`.
4. RFC 9180 HPKE Base mode vector parity for X25519/HKDF-SHA256.
5. RFC 8032 Ed25519 vector parity if recovery signing/verification is surfaced on Web.
6. Envelope header byte-stability:
   - `v`
   - `kdf_v`
   - `key_id`
   - `encryption_device_id`
   - `counter`
   - nonce reconstruction
7. Negative protocol gates:
   - blob swap => auth failure
   - revision rollback => `E3015`
   - account rollback => `E3024`
   - duplicate mutation id => idempotent replay result
   - revoked device => forced logout path

## Local Mock Strategy

No remote provisioning is allowed in this row. Later Web rows should use a **local-only seam strategy**:

- `/sync/push` and `/sync/pull`
  - in-memory fixture-backed transport using shipped contract shapes
- Realtime
  - local emitter that publishes `blob_changed` / `device_revoked` with `commit_seq` strings
- device RPCs
  - local mock for register/list/revoke/heartbeat/revoke-others
- nonce lease
  - deterministic local lease allocator for browser runtime tests
- crypto fixtures
  - reuse shipped Rust vectors/fixtures as browser admission gates

Mock boundaries:

- OK to mock Edge Function transport, Realtime delivery, and nonce lease server
- Not OK to invent alternate payload shapes or alternate sequence semantics

## Risks

- If later Web rows continue using `since_seq` or split `blob_aad` onto the wire, protocol drift will re-enter despite this preflight.
- Browser CBOR drift is the highest hidden risk if a generic encoder is used without schema-locked byte fixtures.
- Recovery signing may need one more focused dependency decision when the Web account-management row actually wires the flow.

## Open Questions

1. Whether Web runtime should implement a tiny schema-specific CBOR AAD writer and use `cbor-x` only as a cross-check tool.
2. Whether `entity_type` filtering on pull is worth keeping as a later optimization or should be removed from Web docs entirely to mirror shipped W2 transport.
3. Whether browser-side recovery proof generation belongs in `web-auth-device-session` or a later account/privacy row.

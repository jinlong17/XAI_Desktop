# keychain-bridge-macos — API Contract

> Interface contracts + error semantics. Assumptions until feature-build freezes signatures.

## 1. Tauri Commands (Rust → JS)

All return the unified `AppResult<T>` (= `Result<T, AppError>`), serde-serialized
as the existing externally-tagged enum (see `apps/desktop/src-tauri/src/error.rs`).
Registered in `commands/keychain.rs`, declared in `commands/mod.rs`
(`pub mod keychain;`), added to the `lib.rs` `invoke_handler!` list.

| Command | Signature (Rust) | Returns | Notes |
|---|---|---|---|
| `secret_set` | `secret_set(key: String, value: Vec<u8>) -> AppResult<()>` | `()` on success | Idempotent upsert. If key exists: find-then-update in place (preserves ACL, OQ-2); else add with accessibility + ACL attributes. |
| `secret_get` | `secret_get(key: String) -> AppResult<Vec<u8>>` | stored bytes | Device-unlocked checked first; missing key → `KeychainItemNotFound`; locked → `KeychainLocked`. |
| `secret_del` | `secret_del(key: String) -> AppResult<()>` | `()` on success | No-op success if key absent (delete is idempotent). |

### Key namespace convention

`key` is an opaque caller-supplied string; callers use the PRD naming scheme:

- `xai.refresh_token.<account_id>`
- `xai.kek.<account_id>`
- `xai.devicekey.<account_id>.<device_id>` (PRD §234)
- `xai.nonce_high_water.<account_id>.<key_id>` (PRD §1292)

The bridge does not interpret the key beyond using it as the keychain item
account/service attribute pair.

### Attribute contract (asserted in tests)

- `kSecAttrAccessible` = `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
- synchronizable attribute = never set true (T13)
- `SecAccess` trusted-application list = exactly one app: bundle id `com.jinlong.desktop`
- service attribute namespaced (e.g. `com.jinlong.desktop.secret`) to avoid collision with OS items

## 2. TS Wrapper (`@repo/core-data`)

New module `packages/core-data/src/keychain.ts`, barrel-exported from
`packages/core-data/src/index.ts`. Consumers (plugin-account) import from
`@repo/core-data` only — never `@tauri-apps/api` directly (red line #4). The
wrapper invokes through the `@repo/core/hooks` `useTauriInvoke` chokepoint
(or a non-hook `invokeTauri` helper if called outside React).

```ts
// shape (final names frozen in feature-build)
export function secretSet(key: string, value: Uint8Array): Promise<void>;
export function secretGet(key: string): Promise<Uint8Array>;
export function secretDel(key: string): Promise<void>;
// errors surface as a typed KeychainError carrying the E1xxx code parsed
// from the AppError Display prefix.
```

Test seam: consumers test against the mocked `useTauriInvoke` (per
PLUGIN_SDK §7.2); core-data ships no real Keychain in unit tests.

## 3. Error Semantics

New **E1xxx system-family** `AppError` variants (additive — must not change
existing E1000 / E3xxx serde shape or `Display` prefixes). Final codes frozen
in feature-build; proposed:

| Code | Variant (proposed) | Meaning | Caller guidance |
|---|---|---|---|
| `E1100` | `KeychainLocked` | Device locked / item not accessible (FR-AC-08 unlock pre-check) | Prompt unlock / retry; do not treat as data loss |
| `E1101` | `KeychainItemNotFound` | `secret_get` on absent key | First-run / post-logout expected; caller decides |
| `E1102` | `KeychainAclDenied` | ACL rejected (non-bundle / signature mismatch) | Security-relevant; surface, do not silently retry |
| `E1103` | `KeychainBackend(String)` | Underlying Security.framework OSStatus / unexpected error | Log OSStatus; generic failure |
| `E1104` | `KeychainUnsupportedPlatform` | Non-macOS target (compile-stub path) | Web/other path uses server nonce lease instead |

- Every variant `Display` begins with its `E11xx:` prefix (JS-parseable),
  matching the existing contract; a `#[test]` asserts each prefix.
- FR-SY-09: a single `secret_get` failure returns a typed error; **never
  panics**, never aborts unrelated work.

## 4. Capability Allowlist

Add a scoped Tauri capability entry permitting `secret_set` / `secret_get` /
`secret_del` only for the window(s) hosting plugin-account (parallels the
FR-SY-75 `crypto_*` allowlist intent). The current `capabilities/default.json`
has only `core:*` / `opener:*` perms. Exact capability identifier + window
scope frozen in feature-build; documented here once chosen.

## 5. Idempotency & Concurrency

- `secret_set`: idempotent upsert (find-then-update, fallback add) — repeated
  sets with the same value are safe; ACL preserved across updates (OQ-2).
- `secret_del`: idempotent (absent key → success).
- `secret_get`: pure read.
- Keychain access is process/device-scoped; no cross-window coordination
  needed (multi-window safe by construction). Concurrent set/get on the same
  key relies on Keychain Services' own item-level atomicity.

## 6. Open Contract Questions

- OQ-1: exact `security-framework` API path for attaching `SecAccess` +
  accessibility to a generic-password item — resolved in Phase 1 spike, then
  this doc's command attribute section is finalized.
- OQ-2: in-place update vs delete+re-add for `secret_set` — prefer in-place;
  confirm `security-framework` exposes item update preserving `SecAccess`.

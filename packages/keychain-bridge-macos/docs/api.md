# keychain-bridge-macos — API Contract

> Interface contracts + error semantics. Assumptions until feature-build freezes signatures.

## 1. Tauri Commands (Rust → JS)

All return the unified `AppResult<T>` (= `Result<T, AppError>`), serde-serialized
as the existing externally-tagged enum (see `apps/desktop/src-tauri/src/error.rs`).
Registered in `commands/keychain.rs`, declared in `commands/mod.rs`
(`pub mod keychain;`), added to the `lib.rs` `invoke_handler!` list.

| Command | Signature (Rust) | Returns | Notes |
|---|---|---|---|
| `secret_set` | `secret_set(key: String, value: Vec<u8>) -> AppResult<()>` | `()` on success | Idempotent upsert. If key exists: find-then-update in place; else add a generic-password item in the local non-synchronizable store. |
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

- synchronizable attribute = explicitly false on set/get/delete (T13)
- service attribute namespaced (e.g. `com.jinlong.desktop.secret`) to avoid collision with OS items
- signed Data Protection ACL / bundle-identity rejection is a production signing gate for bundle id `com.jinlong.desktop`, not an unsigned dev/debug runtime requirement

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

A dedicated capability file `capabilities/plugin-account-keychain.json`
(identifier: `plugin-account-keychain`) scopes secret_* access to the
`account` and `control` windows only. `capabilities/default.json` is NOT
widened (Rec-1 from feature-review). The file was created in Phase 3.

## 5. Idempotency & Concurrency

- `secret_set`: idempotent upsert (find-then-update, fallback add) — repeated
  sets with the same value are safe.
- `secret_del`: idempotent (absent key → success).
- `secret_get`: pure read.
- Keychain access is process/device-scoped; no cross-window coordination
  needed (multi-window safe by construction). Concurrent set/get on the same
  key relies on Keychain Services' own item-level atomicity.

## 6. Open Contract Questions (CLOSED)

- **OQ-1** (REVISED — 2026-05-29): unsigned dev/debug builds use generic-password items with `set_access_synchronized(Some(false))`; `SecAccessControl`/Data Protection ACL failed with OSStatus -34018 and is tracked as a production signing/notarization gate. See `design.md §OQ-1 Resolution`.
- **OQ-2** (RESOLVED — Phase 1): `set_generic_password_options` in `security-framework` implements find-then-update internally. No delete+re-add required.

# keychain-bridge-macos — Design Snapshot

> Decision snapshot only (discovery detail lives in the review doc).
> Cross-cutting infra feature — Rust platform adapter + Tauri command + `@repo/core-data` TS wrapper.

## Identity

- **Feature**: `keychain-bridge-macos`
- **Type**: Cross-cutting infra (NOT a plugin slice) — ADR-0003 / codebase-orientation §6
- **Roadmap**: sync-v1 · feature #8 · wave W0 · Phase 0.3 · dev-plan T-10
- **PRD**: `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT (FR-AC-08, FR-SY-09; T3/T13; R-10.18)
- **Docs Home**: `packages/keychain-bridge-macos/docs/` (docs-only anchor; precedent: `packages/roadmap-kickoff/docs/`). No buildable `package.json`. The orchestrator reads `dev_log.md` from this path.

## Selected Option

| Field | Value |
|---|---|
| Selected Option | A — `security-framework` crate (direct Security.framework bindings), macOS-only, `#[cfg]`-gated |
| Review Doc Path | `docs/reviews/keychain-bridge-macos/20260519-discovery-review.md` |
| Review Date | 2026-05-19 |
| Brief | `docs/reviews/keychain-bridge-macos/20260519-feature-brief.md` |

## Frozen Assumptions

1. Crate: `security-framework` added under existing `[target.'cfg(target_os = "macos")'.dependencies]`; all keychain code behind `#[cfg(target_os = "macos")]` with a typed unsupported-platform stub for non-macOS targets.
2. Storage primitive: generic-password keychain items keyed by namespaced string `xai.<purpose>.<account_id>[.<sub>]` (PRD §234 / §1292 naming).
3. Runtime storage: generic-password items in service namespace `com.jinlong.desktop.secret`; synchronizable attribute is explicitly `false` on set/get/delete (T13 regression).
4. Signed-release gate: Data Protection Keychain / bundle-identity ACL verification remains required for production signing, but is not attached in unsigned dev/debug builds after the 2026-05-29 release-readiness repair found OSStatus -34018 without the entitlement.
5. Error family: **E1xxx system** (Keychain is infra, not sync); JS-parseable `E1xxx:` Display prefix per the existing `AppError` contract (`apps/desktop/src-tauri/src/error.rs`).
6. Surface: exactly three commands — `secret_set` / `secret_get` / `secret_del`. No enumerate/list.
7. Bridge stores opaque `Vec<u8>` bytes; zero crypto/derivation here (separated from `aes-gcm-aead-core` / KeyVault rows).
8. Real signed-build Data Protection ACL + MAS-sandbox verification is a documented follow-up gated by `apple-developer-account` (#10) — NOT a repo-side ship blocker for this feature.

## Architecture

```
@repo/plugin-account  (consumer, mocks until core-data Stable)
   │  (red line #4 — no direct @tauri-apps/api)
   ▼
@repo/core-data
   └─ src/keychain.ts        TS wrapper: secretSet/secretGet/secretDel
        │  via @repo/core/hooks  useTauriInvoke chokepoint
        ▼
apps/desktop/src-tauri/
   ├─ src/commands/keychain.rs   #[tauri::command] secret_set/get/del → AppResult<T>
   │     (registered in commands/mod.rs + lib.rs invoke_handler!)
   ├─ src/platform/macos/keychain.rs   security-framework impl
   │     #[cfg(target_os = "macos")] — generic-password items
   │     + kSecAttrSynchronizable=false on set/get/delete
   │     (declared via platform/macos/mod.rs `pub mod keychain;`)
   ├─ src/error.rs               + E1xxx Keychain variants (additive)
   └─ capabilities/              scoped allowlist for secret_* commands
```

Dependency direction (red line #1/#8): Host → core-data → @repo/core. core-data
depends only on `@repo/core`. Keychain native code stays in `platform/macos/`
(SYSTEM_ARCHITECTURE §9).

## Dependency Overview

- **Depends on**: `roadmap-kickoff` (SHIPPED) — `AppError`/`error.rs`, `commands/mod.rs`, `platform/macos/mod.rs`, `@repo/core-data` skeleton, `useTauriInvoke` hook all present on branch HEAD.
- **Consumed by (downstream, mock until Stable)**: `account-signup-login`, `aes-gcm-aead-core` (KEK cache slot), `hpke-per-device-wrap` (device_priv slot), `nonce-lease-server` (high-water anchor slot).
- **New crate**: `security-framework` (MIT/Apache-2.0; `core-foundation` already vendored).
- **PLUGIN_MAP**: extends `@repo/core-data` surface (currently `Planned`); no separate plugin row — tracked via this docs anchor + a core-data row note.

## Threat Model Binding

- **T3** (stolen-but-locked Mac) / STRIDE Information Disclosure across **TB-4** (macOS Keychain): runtime secrets stay in macOS Keychain instead of app JSON/SQLite plaintext. Signed Data Protection ACL enforcement is a production-signing gate.
- **T13** (backup leak): `kSecAttrSynchronizable=false` is applied on set/get/delete so the bridge only touches the local non-iCloud Keychain store.
- **FR-SY-09**: single secret read failure → typed E1xxx error, never panic; caller decides degradation.

## Cross-Window / Native-API Gate

No new typed events. New Tauri command signatures → capability allowlist change.
macOS native Keychain API + Tauri command surface → **real-hardware smoke is
required for repo-side release candidates**. Signed Data Protection ACL
verification remains a production-signing/notarization gate.

## OQ-1 Resolution (2026-05-19 — Phase 1 spike)

**Question**: What is the exact `security-framework` API path for attaching
`SecAccess` + `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` to a generic-password item?

**Initial resolution**: The crate exposes `SecAccessControl` (via
`security_framework::access_control::SecAccessControl::create_with_protection`)
using `ProtectionMode::AccessibleWhenUnlockedThisDeviceOnly` and flags `0`, and
the value can be attached to `PasswordOptions` via
`PasswordOptions::set_access_control()`.

**2026-05-29 release-readiness repair**: the `SecAccessControl` path failed the
manual release smoke from an unsigned dev/debug process with OSStatus -34018
(missing entitlement). The runtime bridge now uses generic-password items and
always calls `set_access_synchronized(Some(false))` on set/get/delete. This
keeps local-first startup functional and still prevents iCloud Keychain
propagation. Signed Data Protection ACL / bundle-identity rejection is now
tracked as a production signing/notarization gate instead of a repo-side
runtime requirement.

**OQ-2 Resolution**: `PasswordOptions::set_generic_password_options` in
`security-framework` already implements the find-then-update pattern internally
(tries `SecItemAdd`; on `errSecDuplicateItem` falls back to `SecItemUpdate`),
so no delete+re-add is required.

## Deferred

- Real signed-build Data Protection ACL cross-process rejection + MAS-sandbox keychain-access-group (gated by `apple-developer-account` #10).
- KEK/DEK derivation, AES-GCM, HPKE, Ed25519, SQLCipher open (separate rows).
- Server nonce lease + ledger protocol (`nonce-lease-server`); this row only provides the local Keychain anchor slot.

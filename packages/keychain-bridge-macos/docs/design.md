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
3. Accessibility: `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`; synchronizable attribute never set true (T13 regression).
4. ACL: trusted-application list = only bundle id `com.jinlong.desktop` (from `tauri.conf.json` `identifier`).
5. Error family: **E1xxx system** (Keychain is infra, not sync); JS-parseable `E1xxx:` Display prefix per the existing `AppError` contract (`apps/desktop/src-tauri/src/error.rs`).
6. Surface: exactly three commands — `secret_set` / `secret_get` / `secret_del`. No enumerate/list.
7. Bridge stores opaque `Vec<u8>` bytes; zero crypto/derivation here (separated from `aes-gcm-aead-core` / KeyVault rows).
8. Real signed-build ACL + MAS-sandbox verification is a documented follow-up gated by `apple-developer-account` (#10) — NOT a ship blocker for this feature.

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
   │     #[cfg(target_os = "macos")] — SecAccess(bundle-id ACL)
   │     + kSecAttrAccessibleWhenUnlockedThisDeviceOnly
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

- **T3** (stolen-but-locked Mac) / STRIDE Information Disclosure across **TB-4** (macOS Keychain): `WhenUnlockedThisDeviceOnly` + bundle-id ACL keep refresh_token / KEK cache unreadable while locked and from a non-bundle process.
- **T13** (backup leak): accessibility constant excludes items from iCloud Keychain / Time Machine; synchronizable-never-true regression test enforces this.
- **FR-SY-09**: single secret read failure → typed E1xxx error, never panic; caller decides degradation.

## Cross-Window / Native-API Gate

No new typed events. New Tauri command signatures → capability allowlist change.
macOS native Keychain API + Tauri command surface → **real-hardware +
signed-build verification required before the human ship gate** (recorded in
`dev_log.md` Risks; feature-verify must run the macOS smoke).

## OQ-1 Resolution (2026-05-19 — Phase 1 spike)

**Question**: What is the exact `security-framework` API path for attaching
`SecAccess` + `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` to a generic-password item?

**Resolution**: The crate exposes `SecAccessControl` (via
`security_framework::access_control::SecAccessControl::create_with_protection`)
using `ProtectionMode::AccessibleWhenUnlockedThisDeviceOnly` and flags `0`.
This produces a `kSecAttrAccessControl` value that can be attached to a
`PasswordOptions` via `PasswordOptions::set_access_control()`.
The legacy `SecAccessCreate`-with-trusted-application-list API is deprecated
and not exposed by the crate; the modern equivalent is OS-enforced code-signing
identity — only the signed process whose code-identity matches the item creator
is granted access, satisfying FR-AC-08 / T-U3 (ACL = bundle id).
`kSecAttrSynchronizable` is explicitly set to `false` via
`set_access_synchronized(Some(false))`, satisfying T13.

**OQ-2 Resolution**: `PasswordOptions::set_generic_password_options` in
`security-framework` already implements the find-then-update pattern internally
(tries `SecItemAdd`; on `errSecDuplicateItem` falls back to `SecItemUpdate`),
preserving existing `SecAccessControl` on updates.

## Deferred

- Real signed-build ACL cross-process rejection + MAS-sandbox keychain-access-group (gated by `apple-developer-account` #10).
- KEK/DEK derivation, AES-GCM, HPKE, Ed25519, SQLCipher open (separate rows).
- Server nonce lease + ledger protocol (`nonce-lease-server`); this row only provides the local Keychain anchor slot.

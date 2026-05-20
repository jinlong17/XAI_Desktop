# Feature Brief — keychain-bridge-macos

> Step 0 (requirement normalization) · Workflow V2 feature-plan
> Derived from: `docs/reviews/keychain-bridge-macos/20260514-roadmap-seed.md`
> sync-v1 roadmap · feature #8 · wave W0 · Phase 0.3 · dev-plan task T-10
> Source PRD: `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT
> Date: 2026-05-19

## 1. Feature Identity

| Field | Value |
|---|---|
| Feature Title | macOS Keychain Bridge (secret_set / secret_get / secret_del) |
| Canonical name | `keychain-bridge-macos` |
| Naming rationale | Roadmap seed slug is already canonical and matches `docs/reviews/keychain-bridge-macos/`. "bridge" = thin Rust↔TS shim over the macOS Keychain Services API; "macos" disambiguates it as a platform adapter (Web has no Keychain → falls back to the server nonce lease per PRD §1290-1293). |
| Three-faces decision | **Cross-cutting infra**, NOT a plugin slice. Rust platform adapter (`apps/desktop/src-tauri/src/platform/macos/`) + Tauri command (`commands/`) + TS wrapper exported from `@repo/core-data` (consumed by `@repo/plugin-account`). Per ADR-0003 / codebase-orientation §6 this lands in the Rust backend + core-data, never in `apps/desktop/src/` or a plugin's business layer. |
| Docs home | `packages/keychain-bridge-macos/docs/` — dedicated cross-cutting roadmap-feature docs anchor (same precedent as `packages/roadmap-kickoff/docs/`). It is a docs-only package directory; no buildable package.json. The orchestrator reads `dev_log.md` from this path. |

## 2. Motivation

Sync v1's zero-knowledge key hierarchy (PRD §3) requires several long-lived
secrets to survive app restart **without ever being readable while the Mac is
locked or from a backup image**:

- `refresh_token` (FR-AC-08) — Supabase session continuity
- `KEK` cache (FR-AC-08, PRD §126-128) — unlocks SQLCipher db_key + DEK wraps
- `device_priv` (X25519, PRD §115-116, §234-236) — per-device key, **never derived from KEK**
- `nonce high-water` anchor (FR-SY rollback defense, R-10.18, PRD §1292) — Time-Machine rollback detector

These currently have no persistence seam. Every downstream Phase 0.3 row
(`oauth-passkey`, `aes-gcm-aead-core`, `hpke-per-device-wrap`,
`nonce-lease-server`, SQLCipher init) is blocked until a Keychain bridge with
the correct accessibility + ACL attributes exists.

## 3. Target Outcome

A signed-build-ready macOS Keychain bridge:

- Three Tauri commands: `secret_set(key, value)`, `secret_get(key) → value`,
  `secret_del(key)` returning typed `Result<T, AppError>` (E-codes).
- macOS implementation under `platform/macos/` with `#[cfg(target_os = "macos")]`,
  using the `security-framework` crate (generic password items).
- Every stored item: `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`
  (FR-AC-08 / FR-SY-09) — guarantees inaccessible while locked **and**
  excluded from iCloud Keychain / Time Machine propagation (T13).
- ACL / trusted-application list restricted to the XAI_Desktop bundle id
  (`com.jinlong.desktop`) so a non-bundle process is rejected.
- Query path checks device-unlocked first (fail fast with a typed error
  rather than an opaque OSStatus).
- TS wrapper exported from `@repo/core-data` via the `useTauriInvoke` core
  hook chokepoint (red line #4 — no direct `@tauri-apps/api` in consumers).
- Unit + integration tests with the attributes asserted in code.

## 4. Scope

**In scope:**

- `apps/desktop/src-tauri/src/platform/macos/keychain.rs` (new) — `security-framework`-backed get/set/del with accessibility + ACL.
- `apps/desktop/src-tauri/src/commands/keychain.rs` (new) — 3 `#[tauri::command]` wrappers returning `AppResult<T>`.
- `commands/mod.rs` + `lib.rs` `invoke_handler!` registration.
- `platform/macos/mod.rs` `pub mod keychain;` (gated by existing `#[cfg(target_os = "macos")]` boundary).
- Non-macOS fallback stub returning a typed "unsupported platform" error (keeps the tree compiling on CI / web targets).
- New `AppError` variants for Keychain failures (E1xxx system family — locked / not-found / ACL-denied / backend).
- Scoped Tauri capability allowlist entry for `secret_*` commands (consistent with FR-SY-75 `crypto_*` allowlist pattern; restrict to the windows that host plugin-account).
- TS wrapper in `@repo/core-data` (e.g. `src/keychain.ts`) + barrel export, typed key-namespace helper.
- `Cargo.toml`: add `security-framework` (+ transitively `core-foundation`, already present) under the existing `[target.'cfg(target_os = "macos")'.dependencies]`.
- Rust unit/integration tests (attribute assertions; round-trip behind a real-Keychain-gated `#[ignore]` or feature flag where the test runner cannot reach the login keychain).
- TS contract tests against the mocked `useTauriInvoke` seam.
- Four-piece docs at `packages/keychain-bridge-macos/docs/`.

**Non-goals / out of scope:**

- KEK / DEK derivation, AES-GCM, HPKE, Ed25519 (separate rows: `aes-gcm-aead-core`, `hpke-per-device-wrap`, `ed25519-recovery-signing`).
- SQLCipher open / db_key derivation (`core-data-sqlite-driver`).
- The server-side nonce lease + ledger (`nonce-lease-server`); this row only provides the *local Keychain anchor* slot, not the lease protocol.
- Real signed-build ACL verification + MAS-sandbox keychain-access-group behavior — **explicitly gated by `apple-developer-account` (#10)** and recorded as a documented follow-up; NOT required for this feature to reach READY_TO_SHIP.
- KeyVault (opaque `key_handle`) — the Keychain bridge stores ciphertext/bytes; resident-key management is `aes-gcm-aead-core` / KeyVault rows.
- plugin-account login/signup flow that *consumes* these secrets (`account-signup-login`).

## 5. Constraints & Hard Requirements

| ID | Constraint |
|---|---|
| FR-AC-08 | `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`; ACL = trusted application list = only XAI_Desktop bundle id; query checks device-unlocked first. |
| FR-SY-09 | A single secret read failure (e.g. locked / corrupt item) must surface a typed error, not panic — caller decides degradation. |
| T13 | `WhenUnlockedThisDeviceOnly` items must NOT propagate to iCloud Keychain / Time Machine. (Property of the accessibility constant; assert it is set and add a regression test that the synchronizable attribute is never set true.) |
| T3 (threat) | Stolen-but-locked Mac: Keychain accessibility + ACL protects refresh_token / KEK cache. STRIDE Information Disclosure across TB-4 (macOS Keychain). |
| SYSTEM_ARCHITECTURE §9 | macOS platform code under `platform/macos/` with `#[cfg(target_os = "macos")]`; `lib.rs` = config/registration only; commands split by domain in `commands/<domain>.rs`. |
| Red line #4 | Consumers (plugin-account) must not import `@tauri-apps/api` directly — go through the `@repo/core/hooks` `useTauriInvoke` chokepoint; the TS wrapper lives in `@repo/core-data`. |
| Red line #1 / #8 | Zero business logic in host; dependency direction Host → Plugin → Core/UI, never reverse. core-data depends only on `@repo/core`. |
| Error family | Keychain failures are **E1xxx system** family (not E3xxx sync). Display prefix must be JS-parseable (`E1xxx:` …) per existing `AppError` contract (`error.rs`). |
| Native-API gate | Tauri command signature + macOS Keychain native API → real-hardware + signed-build verification required before the human ship gate (multi-window / macOS native-API gate, recorded in dev_log Risks). |

## 6. Dependency & Status Hints

- **Depends on:** `roadmap-kickoff` (SHIPPED — scaffolding merged on current branch HEAD `refactor/microkernel-plugin-architecture`). `@repo/core-data` and `@repo/plugin-account` package skeletons exist on disk; `AppError` enum + `error.rs` + `commands/mod.rs` + `platform/macos/mod.rs` present.
- **Consumed by (downstream, will mock until this is Stable):** `account-signup-login`, `aes-gcm-aead-core` (KEK cache slot), `hpke-per-device-wrap` (device_priv slot), `nonce-lease-server` (high-water anchor slot).
- **PLUGIN_MAP:** `@repo/core-data` is currently `Planned`. This row extends core-data's surface; the Keychain bridge itself is a cross-cutting infra feature (no separate PLUGIN_MAP row required — track via `@repo/core-data` row note and the docs anchor).
- **Cross-window contract impact:** No new typed events. New Tauri command signatures (`secret_set/secret_get/secret_del`) → capability allowlist change. Local-only (no network); same-account multi-window coordination unaffected (Keychain is process/device-scoped).

## 7. Automation Context

| Field | Value |
|---|---|
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Source PRD | `docs/planning/sub-prds/sync/PRD.md` v0.6-DRAFT · dev-plan task T-10 |
| Preferred build executor | gpt-5.3-codex / cursor |
| Preferred plan/verify | claude-opus-4-7 |

## 8. Acceptance Signal (feature-level)

- `secret_set` → `secret_get` → `secret_del` round-trip succeeds on a dev build (real-login-Keychain integration test, `#[ignore]`-gated where the harness cannot reach the keychain).
- Stored item attributes asserted in code = `kSecAttrAccessibleWhenUnlockedThisDeviceOnly`, synchronizable never true, ACL bound to the bundle id.
- `secret_get` while screen locked → typed "locked / not accessible" error (E1xxx), no panic.
- Non-bundle-id process is rejected by the ACL (design-level guarantee; real cross-process rejection is part of the signed-build follow-up).
- All three commands return typed `AppResult<T>` with JS-parseable `E1xxx:` prefixes.
- Rust `cargo test` green (attribute + error-prefix assertions); core-data TS contract tests green against mocked `useTauriInvoke`.
- **Documented follow-up (NOT a ship blocker):** real signed-build ACL + MAS-sandbox keychain-access-group verification gated by `apple-developer-account` (#10), recorded in dev_log Risks + test.md §deferred.

## 9. Planner Handoff

Proceed to Phase 1.5 (solution scan — `security-framework` vs alternatives) and
the full four-piece planning artifact set. Single-vendor automation
(D-Codex+Cursor), no cross-vendor verify.

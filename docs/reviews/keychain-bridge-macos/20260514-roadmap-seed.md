# Roadmap Seed — keychain-bridge-macos

> sync-v1 roadmap · feature #8 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-10
> Status hint: PENDING

## Requirement
Implement a macOS Keychain bridge via `security-framework` exposing `secret_set`/`secret_get`/`secret_del` Rust commands (+ TS wrapper) with `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` and an ACL restricted to the XAI_Desktop bundle id. Used to persist refresh_token, KEK cache, device_priv, and nonce high-water.

## Hard constraints
- FR-AC-08 / FR-SY-09: `WhenUnlockedThisDeviceOnly`; ACL limited to the trusted application list (only XAI_Desktop bundle id); query checks device-unlocked first.
- macOS platform code MUST live under `platform/macos/` with `#[cfg]` (SYSTEM_ARCHITECTURE §9 / codebase-orientation §4).
- WhenUnlockedThisDeviceOnly items must not propagate to iCloud Keychain (T13 / PRD §2 T13).
- Code boundary: `apps/desktop/src-tauri/src/platform/macos/` + command in `commands/` + TS wrapper in `core-data`/`plugin-account` per codebase-orientation §6.

## Threat model binding
- T3 (stolen-but-locked Mac): Keychain `WhenUnlockedThisDeviceOnly` + ACL protects refresh_token / KEK cache (PRD §2 T3, FR-AC-08).
- STRIDE Information Disclosure across TB-4 (macOS Keychain).

## Acceptance signal
set/get/del round-trip on a signed build; item inaccessible while screen locked; ACL rejects access from a non-bundle-id process; real signed-build ACL + MAS-sandbox verification gated by apple-developer-account (#10).

## Dependencies (advisory — manifest is authoritative)
Depends On: roadmap-kickoff (shipped)

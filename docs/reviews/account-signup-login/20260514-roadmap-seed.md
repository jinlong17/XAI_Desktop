# Roadmap Seed — account-signup-login

> sync-v1 roadmap · feature #17 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-09
> Status hint: PENDING

## Requirement
Implement `src/account.ts` signup (C-01 flow per PRD §3.3: generate device_id/kek_salt/secret_key/DEK_v1, derive KEK + auth_password, CSPRNG device key, per-device wrap, dek_check/secret_key_check, recovery_signing_pub, POST /auth/signup) and login (PRD §3.4: dual-factor with Secret-Key verification) + refresh-token persistence to Keychain.

## Hard constraints
- PRD §3.1 invariant #1 / FR-SY-73: master_password + secret_key never leave the device; auth_password derivation MUST include secret_key — wrong secret_key ⇒ login fails (not after login); account_id = Supabase auth.users.id, client does not self-assign (H-7).
- FR-AC-07/08: refresh_token auto-renew (60s before expiry, 3-fail → re-login UI); refresh_token persisted to Keychain WhenUnlockedThisDeviceOnly.
- Business logic in `packages/plugin-account/src/` only; Tauri crypto via opaque handles (FR-SY-75); no direct `@tauri-apps/api` import (red line #4).
- Code boundary: `packages/plugin-account/src/account.ts` per codebase-orientation §6.

## Threat model binding
- T1 / T4 (server dump / forgot password): dual-factor auth_password (secret_key as Argon2id pepper) defeats offline dictionary; signup provisions the recovery path (PRD §2 T1/T4, FR-SY-73, R-10.7/10.2).
- STRIDE Spoofing / Information Disclosure across TB-1 (credential input).

## Acceptance signal
Email signup + login + Keychain refresh-token persistence run end-to-end (PRD §10.1); wrong secret_key → login fails at auth step; FR-AC-01/02/07/08 + FR-SY-73 acceptance pass.

## Dependencies (advisory — manifest is authoritative)
Depends On: kdf-primitives, keychain-bridge-macos, rust-keyvault-opaque-handle (shipped)

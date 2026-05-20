# Roadmap Seed — oauth-passkey

> sync-v1 roadmap · feature #45 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): (Phase 5, FR-AC-06)
> Status hint: PENDING

## Requirement
Add OAuth via Sign in with Apple / Google through Supabase OAuth providers, plus an optional Passkey path. After OAuth completes Supabase auth, the user picks a KEK source: (a) master_password + Secret Key (default); (b) Passkey + Secure Enclave-derived KEK (macOS 14+).

## Hard constraints
- KEK source is a deliberate 3-way choice; (c) OIDC `sub` client-side PRF derivation is v2 — do NOT implement. Weak passwords rejected (zxcvbn ≥ 3) (FR-AC-06 / H-12).
- KEK derivation invariants from PRD §3.2 unchanged (Argon2id strong params, secret_key as `secret=`); Passkey/Secure-Enclave path must not weaken zero-knowledge.
- Code boundary: OAuth/Passkey UI + flow in `packages/plugin-account/`; KEK derivation/Secure-Enclave access via Rust KeyVault commands (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T1 (server dump, passive offline dictionary) — KEK source must keep dictionary cost infeasible; Secret Key / Secure Enclave preserve the FR-SY-73 threat-raising property.
- PRD §11 R-10.7 (Supabase dump) — zero-knowledge commitment must hold regardless of chosen KEK source.

## Acceptance signal
A user can complete Sign in with Apple/Google, then select either master_password+Secret Key or Passkey+Secure Enclave KEK; weak passwords (zxcvbn < 3) are rejected; the chosen path still yields an account whose blobs are undecryptable from a server dump.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, account-signup-login. Blocked by #37 Phase 4.8 → Phase 5 gate.

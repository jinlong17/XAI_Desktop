# Roadmap Seed — kdf-primitives

> sync-v1 roadmap · feature #3 · wave W0 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-06 (argon2.rs, kdf.rs)
> Status hint: PENDING

## Requirement
Implement the Argon2id KEK derivation (`master_password`, salt=kek_salt, **secret=secret_key**, t=3, m=64MiB, p=4 → 32B), the `auth_password` two-step derivation (HKDF-SHA256 of `master_password ‖ secret_key` salt=email‖"xai.auth.v1" → 16B, then Argon2id t=1/m=16MiB/p=1 → 32B), and the HKDF helper for `db_key` and `recovery_seed`. Rust impl under `src-tauri/src/crypto/`.

## Hard constraints
- PRD §3.2 invariant: KEK params are exactly t=3/m=64MiB/p=4 with `secret=secret_key`; `auth_password` derivation MUST include `secret_key` (H-L) — no master-only derivation in any flow (FR-SY-73 / C-F / PRD §3.2).
- Design doc MUST explicitly justify the weak `auth_password` params (t=1/m=16MiB/p=1) as compensated by 128-bit secret_key entropy (stride-cve §3 #1 footgun) or auditors flag it as a weak KDF.
- `account` row carries `kek_kdf_version SMALLINT` (init=1) for v2 upgrade path (PRD §3.2).
- Code boundary: `apps/desktop/src-tauri/src/crypto/{argon2.rs,kdf.rs}` per codebase-orientation §5/§6.

## Threat model binding
- T1 (server dump / offline dictionary): Secret-Key pepper raises Argon2id offline attack cost to infeasible (PRD §2 T1, FR-SY-73, R-10.7).
- STRIDE Information Disclosure across TB-1 (master_password / secret_key input boundary).

## Acceptance signal
Argon2id KEK and auth_password derivations pass RFC 9106 official test vectors; dual-factor property holds (wrong secret_key → wrong auth_password); unit + benchmark pass per PRD §10.1.

## Dependencies (advisory — manifest is authoritative)
Depends On: crypto-deps-lockdown (shipped)

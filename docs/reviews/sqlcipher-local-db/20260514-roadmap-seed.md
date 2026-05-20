# Roadmap Seed — sqlcipher-local-db

> sync-v1 roadmap · feature #16 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-11
> Status hint: PENDING

## Requirement
Integrate `rusqlite` + `sqlcipher` feature for the local encrypted DB: `db_key = HKDF(KEK, "xai.sqlite.v1") → 32B`, opened via `PRAGMA key = "x'<32-byte hex>'"` (raw key mode), `PRAGMA cipher_compatibility = 4`; db_key never written to disk; key applied on open, cleared on close.

## Hard constraints
- FR-SY-74 (H-K): SQLCipher 4 default = **AES-256-CBC + HMAC-SHA512** (NOT GCM — the v0.2 wording was wrong); raw key mode (skip PBKDF2 re-derivation since db_key is already HKDF high-entropy); `cipher_compatibility = 4` mandatory.
- Raw-key PRAGMA uses string interpolation — implementation MUST guard against hex injection (parameterized or strict 32B hex validation) — stride-cve §3 #6 keying footgun.
- SQLCipher community edition license compliance into NOTICE; `cargo deny` license whitelist must accept it (stride-cve §3 #6 / #2 of crypto-deps-lockdown).
- Code boundary: `apps/desktop/src-tauri/` (rusqlite) consumed by `packages/core-data/` per codebase-orientation §4/§6.

## Threat model binding
- T3 / T3.5 / T13 (stolen Mac / disk image / backup leak): SQLCipher encryption with KEK-derived db_key keeps the SQLite file unreadable without master_password (PRD §2 T3/T3.5/T13, FR-SY-74, R-10.10).
- STRIDE Information Disclosure across TB-5 (local SQLCipher DB file at rest).

## Acceptance signal
DB opens with correct db_key, fails with wrong key; SQLite-dump PoC: copying the file to another account → cannot open (PRD §10.2); hex-injection guard rejects malformed key input.

## Dependencies (advisory — manifest is authoritative)
Depends On: kdf-primitives, keychain-bridge-macos, rust-keyvault-opaque-handle (shipped)

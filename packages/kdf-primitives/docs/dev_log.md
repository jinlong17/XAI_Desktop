# kdf-primitives — Dev Log (Workflow State Machine)

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | kdf-primitives |
| Title | Argon2id KEK/auth_password + HKDF helpers |
| Roadmap | sync-v1 · feature #3 · wave W0 · Phase 0.3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | aes-gcm-aead-core (#4) |
| Automation Mode | A-Claude |
| Verify Cross-vendor | yes — deferred by autorun |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 02:17 PDT |

## Phase Plan

### Phase 1 — Rust KDF primitives [DONE]

- Added `crypto::argon2` with PRD-exact KEK and `auth_password` derivations.
- Added `crypto::kdf` HKDF-SHA256 helpers for auth intermediate, SQLCipher db key, and recovery seed.
- Added exact-pinned optional direct deps `hkdf`, `sha2`, and `zeroize` under the existing `crypto` feature.

### Phase 2 — Tests and docs [DONE]

- Added RFC 9106 Argon2id v=19 KAT.
- Added dual-factor tests for KEK and `auth_password`.
- Added RFC 5869 HKDF vector prefix and domain-separation tests.
- Added design/api/test/dev_log docs.

## Deferred Gates

- Cross-vendor review/verify required by manifest was skipped under the 24h autorun rule. See `docs/workflow/roadmap/sync-v1.deferred-gates.md`.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 02:17 PDT | Codex serial autorun | Reconciled manifest/task state, created autorun/deferred/incidents logs, implemented #3 primitives and tests, ran minimal Rust checks. | pending | commit |

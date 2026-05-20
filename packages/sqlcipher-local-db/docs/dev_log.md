# sqlcipher-local-db — Dev Log (Workflow State Machine)

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | sqlcipher-local-db |
| Title | SQLCipher local encrypted DB open path |
| Roadmap | sync-v1 · feature #16 · wave W1 · Phase 0.3 |
| Status | SHIPPED |
| Current Phase | SHIP |
| Suggested Next | account-signup-login (#17) or crypto-tauri-commands (#19) |
| Automation Mode | D-Codex+Cursor |
| Verify Cross-vendor | no |
| Executor | Codex serial autorun |
| Updated | 2026-05-19 03:05 PDT |

## Phase Plan

### Phase 1 — KeyVault KEK support [DONE]

- Added `ResidentKeyKind::Kek`.
- Added `insert_kek` and `with_kek` helpers for downstream SQLCipher open.

### Phase 2 — SQLCipher open/key path [DONE]

- Added db-key derivation from KEK handle.
- Added strict raw-key PRAGMA generator.
- Added SQLCipher compatibility 4 and connection validation.

### Phase 3 — Tests and docs [DONE]

- Added raw-key guard and correct/wrong KEK file tests.
- Added design/api/test/dev_log docs.

## Deferred Gates

- SQLite dump PoC and SQLCipher CLI compatibility are deferred. See `docs/workflow/roadmap/sync-v1.deferred-gates.md`.
- Core-data repository/schema migration is deferred to #20.

## Work Log

| Timestamp | Executor | Action | Commits | Next |
|---|---|---|---|---|
| 2026-05-19 03:05 PDT | Codex serial autorun | Implemented #16 SQLCipher local DB open/key path, KeyVault KEK support, docs, and tests. | local commit `feat(sqlcipher-local-db): add SQLCipher open path` | account-signup-login (#17) |


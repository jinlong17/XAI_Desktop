# XAI G2 Data Security Foundation Roadmap

| Field | Value |
|---|---|
| Roadmap | xai-g2-data-security-foundation |
| Source | docs/planning/execution/G2-data-security-foundation.md |
| Gate | G2 — data and security foundation |
| Default Automation Mode | D-Codex |
| Default Verify Cross-vendor | yes |
| Manifest Review | DEFERRED in unattended mode; see docs/workflow/roadmap/xai-v1.deferred-gates.md |
| Updated | 2026-05-19 23:40 PDT |

## Gate Status

- Gate Status: ACTIVE_UNDER_G1_DATA_INTERFACE_FREEZE
- Rationale: G0 is Conditional Go for the DMG/private path. G1.1, G1.2, and G1.4 have completed local Workflow V2 verification; G1.3 remains external-blocked by MAS/security-scope evidence; G1.5 is blocked by G2 Repository v0. Proceeding to G2.1 is the next eligible risk-closing step and does not bypass a production dependency.
- Ship policy: no automatic ship and no push.

## Manifest

| # | Feature | Source | Dependencies | Package Docs | Status | Executor | Verify | Updated | Notes |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | repository-v0-contract | docs/planning/execution/G2-data-security-foundation.md §G2.1 | G1 data interface freeze | packages/repository-v0-contract/docs | READY_TO_SHIP | D-Codex | yes | 2026-05-20 | Repository v0 contract + entity surface (Grid, GridItem, Label, Todo, Habit, ClipboardEntry, Project, Card) implemented in `packages/core-data`; contract doc + tests updated; 45 tests passing. Manual ship deferred. |
| 2 | core-data-sqlite-driver | docs/planning/execution/G2-data-security-foundation.md §G2.2 SQLite driver PoC | repository-v0-contract | packages/core-data-sqlite-driver/docs | RECONCILE_AFTER_G2.1 | D-Codex | yes | 2026-05-19 | Existing sync-v1 local SQLite-shaped driver docs/code must be reconciled to the frozen Repository v0 contract before this row can be claimed for G2. |
| 3 | sqlcipher-local-db | docs/planning/execution/G2-data-security-foundation.md §G2.2 SQLCipher encrypted DB PoC | repository-v0-contract, core-data-sqlite-driver, keychain-opaque-handle | packages/sqlcipher-local-db/docs | RECONCILE_AFTER_G2.1 | D-Codex | yes | 2026-05-19 | Existing SQLCipher open/key path is present, but G2 still needs Repository integration and dump/wrong-key evidence review. |
| 4 | localstorage-migration | docs/planning/execution/G2-data-security-foundation.md §G2.3 | repository-v0-contract, core-data-sqlite-driver | packages/localstorage-migration/docs | WAITING | D-Codex | yes | 2026-05-19 | Must inventory current localStorage keys and prove idempotent migration without deleting originals. |
| 5 | keychain-opaque-handle | docs/planning/execution/G2-data-security-foundation.md §G2.4 | repository-v0-contract | packages/keychain-opaque-handle/docs | WAITING | D-Codex | yes | 2026-05-19 | Prior keychain bridge work must be reconciled against G2's stricter opaque-handle rule: raw DEK must not cross the JS boundary. |
| 6 | tauri-capability-allowlist | docs/planning/execution/G2-data-security-foundation.md §G2.5 | keychain-opaque-handle, crypto-tauri-commands | packages/tauri-capability-allowlist/docs | WAITING | D-Codex | yes | 2026-05-19 | Split/justify command capabilities and sync `docs/contracts/tauri-commands-v0.md`. |
| 7 | single-table-sync-baseline | docs/planning/execution/G2-data-security-foundation.md §G2.6 | repository-v0-contract, keychain-opaque-handle, tauri-capability-allowlist | packages/single-table-todos-e2e/docs | RECONCILE_AFTER_G2.1 | D-Codex | yes | 2026-05-19 | Existing local two-device sync harness exists; live Supabase/SQLCipher gates remain deferred until external prerequisites are available. |
| 8 | dmg-mas-security-dry-run | docs/planning/execution/G2-data-security-foundation.md §G2.7 | tauri-capability-allowlist, G0.6 MAS sandbox environment | packages/release-sandbox-dry-run/docs | BLOCKED_EXTERNAL | D-Codex | yes | 2026-05-19 | Apple Developer signing/MAS sandbox runtime evidence is unavailable; keep as deferred release/security gate. |

## Decomposition Rationale

- G2.1 is the first eligible feature because downstream SQLite, SQLCipher, migration, Grid persistence, and sync work all depend on a frozen Repository v0 contract.
- G2.2 is split into SQLite driver and SQLCipher encrypted DB because the execution-pack task contains two separable evidence tracks; each feature must claim only one clear task slice.
- Existing sync-v1 artifacts are treated as evidence to reconcile, not as automatic G2 completion, because this roadmap uses the G0-G10 execution packs as the authoritative entry.
- G2.7 is explicitly external-blocked and does not block G2.1 contract work.

## Verification Policy

- Each feature must run its minimal relevant checks.
- Contract changes must update `docs/contracts/*`.
- Cross-vendor review/verify is deferred in this serial Codex run and must be recorded per feature.
- Real MAS, Apple Developer, live Supabase, multi-device, long-run, or signed-runtime gates must be recorded in `xai-v1.deferred-gates.md` instead of being simulated.

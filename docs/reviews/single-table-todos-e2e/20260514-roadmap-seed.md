# Roadmap Seed — single-table-todos-e2e

> sync-v1 roadmap · feature #30 · wave W2 · Phase 0.3 (EXIT)
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-15/T-17/T-18/T-19
> Status hint: PENDING

## Requirement
The Phase 0.3 EXIT integration: wire todos as the single end-to-end synced entity — same-transaction entity + outbox write, 2-Mac todos sync E2E (including conditional-write conflict path), plus the zero-knowledge PoC and the SQLite-dump PoC (PRD §10.1).

## Hard constraints
- Mutations atomic: entity table write + `sync_outbox` write in the SAME SQLite transaction (`BEGIN IMMEDIATE; ... COMMIT;`); crash mid-state (data without outbox row) must never occur (FR-SY-32 M-12).
- Single-table todos incremental sync end-to-end with commit_seq / mutation_id / base_revision, including the conditional-write conflict path → loser in conflict shadow (FR-SY-15~22, §10.1).
- Zero-knowledge PoC: external party can reproduce "Postgres dump without master_password / secret_key → cannot decrypt any blob" (PRD §10.1 / §10.2). SQLite-dump PoC: SQLCipher file without master_password → unreadable (FR-SY-74).
- Code boundary: integration tests in `packages/plugin-account/tests/integration/`; engine/repo logic in `plugin-account`/`core-data`, zero sync logic in Host (codebase-orientation §4/§6, CLAUDE.md §Code Boundaries).

## Threat model binding
- T1 (zero-knowledge PoC, FR-SY-56~58/73); T3/T3.5/T13 (SQLite-dump PoC, FR-SY-74, R-10.10); R-10.13 (gate that protocol elements are in schema before Phase 5).
- STRIDE Information Disclosure — zero-knowledge blob confidentiality (stride-cve.md §2.1 T1, §2.3 T3.5).

## Acceptance signal
PRD §10.1 checklist passes: todos sync between 2 Macs end-to-end with conflict path, menu-bar 4-state icon, RLS auto-test green, schema deployed to staging; zero-knowledge PoC + SQLite-dump PoC reproducible (PRD §10.1, dev-plan T-15/17/18/19).

## Dependencies (advisory — manifest is authoritative)
Depends On: sync-engine-pull, push-edge-function, nonce-lease-server, commit-seq-authority, menubar-sync-status-icon (all shipped). Live 2-Mac + staging Supabase verify blocked-by supabase-project-provisioning (#9) per R8.

# Roadmap Seed — core-data-sqlite-driver

> sync-v1 roadmap · feature #20 · wave W1 · Phase 0.3
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): dev-plan §2, T-11/T-15 companion
> Status hint: PENDING

## Requirement
Build `packages/core-data`: a SQLite repository abstraction over the SQLCipher DB, a `localStorage → SQLite` migration path, a mutation hook, and a `@repo/core-data/testing` in-memory repo mock so plugins are testable with no Tauri / no other plugin.

## Hard constraints
- dev-plan §2: `core-data` is the net-new SQLite (SQLCipher) layer + sync-coordination hooks; Phase 0 = local SQLite driver + sync adapter only (no REST driver — that is Phase 4.5).
- PLUGIN_SDK §7.2: must ship `@repo/core-data/testing` in-memory repo so plugin-account is independently testable (zero direct `@tauri-apps/api`).
- New package; deps strictly `Plugin → Core` direction; `index.ts` is the only public surface (red lines #8/#9).
- Code boundary: `packages/core-data/` per codebase-orientation §6.

## Threat model binding
- T3 / T6: the repo abstraction confines all DB access behind the SQLCipher-encrypted layer (consumes #16), keeping data-at-rest and plugin-boundary protections intact (PRD §2 T3, FR-SY-74, R-10.10).
- STRIDE Information Disclosure across TB-5 (local DB file) — driver enforces the encrypted boundary.

## Acceptance signal
`localStorage → SQLite` migration runs idempotently; plugin-account unit tests pass against `@repo/core-data/testing` with no Tauri; SQLite repo CRUD works on the encrypted DB.

## Dependencies (advisory — manifest is authoritative)
Depends On: sqlcipher-local-db (shipped)

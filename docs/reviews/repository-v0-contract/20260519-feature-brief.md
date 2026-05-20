# repository-v0-contract — Feature Brief

| Field | Value |
|---|---|
| Feature | repository-v0-contract |
| Gate | G2 |
| Source | docs/planning/execution/G2-data-security-foundation.md §G2.1 |
| Owner package | `@repo/core-data` |
| Roadmap manifest | docs/workflow/roadmap/xai-g2-data-security-foundation.md |
| Date | 2026-05-19 |

## Problem

G1.5 Grid persistence and the G2 data/security stack need a stable Repository v0 contract before SQLite, SQLCipher, localStorage migration, and sync baseline work can be honestly claimed. The current `@repo/core-data` contract is a minimal CRUD seam and does not encode metadata, transaction, index query, or migration-version semantics required by the G2 execution pack.

## Scope

- Upgrade `packages/core-data/src/types.ts` to Repository v0.
- Update in-memory and SQLite-shaped test drivers to satisfy the new contract.
- Add reusable contract tests that can be run against both in-memory and SQLite-shaped implementations.
- Sync `docs/contracts/data-repository-v0.md`.
- Maintain the Host/Core/Plugin boundary: `@repo/core-data` imports no plugin package and no direct Tauri API.

## Non-goals

- No production SQLCipher binding.
- No live Supabase, remote sync, or multi-device run.
- No migration of existing Organizer state into SQLite.
- No Host shell or `plugin-organizer` runtime changes.
- No change to MAS/security-scoped bookmark policy.

## Acceptance

- `RepoRecord` includes `id`, `entityType`, `schemaVersion`, `createdAt`, `updatedAt`, and explicit `syncScope`.
- `Repo<T>` exposes `get`, `put`, `delete`, `list(query?)`, `listByIndex`, `transaction`, `migrate`, and `metadata`.
- In-memory and SQLite-shaped repo implementations both pass the same contract test suite.
- `@repo/core-data` still imports no plugin package and no `@tauri-apps/api`.
- `docs/contracts/data-repository-v0.md` matches the implemented API.

## Tests

- `pnpm --filter @repo/core-data test`
- `pnpm --filter @repo/core-data check-types`
- Boundary scan: no `@repo/plugin-*` or `@tauri-apps/api` import in `packages/core-data/src`.

## Deferred Gates

- Cross-vendor feature-review and feature-verify are deferred by serial Codex runtime.
- Real SQLCipher wrong-key/dump evidence belongs to later G2.2 rows.
- Live Supabase and multi-device sync evidence belongs to later G2.6/G9 rows.

## Planner Handoff

- Feature slug: `repository-v0-contract`
- Suggested next: inline `feature-plan` then `feature-review`.
- Implementation should be restricted to `packages/core-data`, `docs/contracts/data-repository-v0.md`, and the feature/log docs.

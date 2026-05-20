# repository-v0-contract — Design

## Selected Option

Upgrade the existing `@repo/core-data` seam in place and keep the feature docs under the roadmap anchor `packages/repository-v0-contract/docs/`.

## Scope

The feature owns the Repository v0 TypeScript contract, in-memory implementation, SQLite-shaped implementation compatibility, and reusable driver contract tests.

## Contract Shape

Repository v0 records carry audit and sync metadata:

- `id`
- `entityType` using `plugin.entity`
- `schemaVersion`
- `createdAt`
- `updatedAt`
- `syncScope`: `device-local` or `account-sync`

Repository v0 operations:

- CRUD: `get`, `put`, `delete`
- Query: `list(query?)`, `listByIndex(field, value, query?)`
- Atomic work: `transaction(fn)`
- Migration: `migrate(plan)`
- Metadata: `metadata()`

## Boundaries

- `@repo/core-data` cannot import any plugin package.
- `@repo/core-data` cannot import `@tauri-apps/api`; real Tauri drivers must be injected later.
- SQLite/SQLCipher runtime binding is downstream work and must adapt to this contract.

## Frozen Assumptions

- `list()` default order remains implementation-defined unless `query.orderBy` is supplied.
- `listByIndex` is a contract-level indexed lookup; the current SQLite-shaped implementation may filter generic JSON in memory until a production driver adds real indexes.
- Migration version is tracked by repository metadata. Durable driver persistence beyond this in-memory SQLite-shaped test seam is owned by later G2.2/G2.3 work.

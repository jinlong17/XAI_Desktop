# G8-E2 Web Data Driver Feature Brief

## Scope

Add browser-safe data driver scaffolds:
- `IndexedDBAdapter<T>`
- `RemoteEncryptedBlobAdapter<T>` mock
- `OfflineFirstStrategy<T>`

## Behavior

Writes go to IndexedDB first. When online, pending IDs sync to the mock remote encrypted blob adapter.

## 2026-05-20 — Repository v0 alignment

Added `createIndexedDbRepo<T extends RepoRecord>()` for the browser host so Track C can satisfy the `@repo/core-data` `Repo<T>` contract without modifying Track A-owned packages. The adapter uses an IndexedDB object store keyed by `id`, creates `entityType` and `syncScope` indexes, applies list/index filters in memory, exposes metadata, and keeps `migrate()` as a documented placeholder until browser migration semantics are finalized.

The legacy `IndexedDBAdapter<T>` remains only for the temporary `OfflineFirstStrategy` demo. Consumers should migrate to `createIndexedDbRepo` before repository-backed browser data flows are promoted.

## Cross-review fixes 2026-05-20

- Added Repository v0 IndexedDB adapter under `apps/web/app/lib/indexedDbRepo.ts`.
- Offline deletes now queue while offline and sync before pending puts.
- Remote reads hydrate local IndexedDB when a local cache miss succeeds remotely.
- `listByIndex` now consults the IDB index for `entityType` / `syncScope` (the only indexed fields); other fields still fall back to in-memory filter, preserving correctness.

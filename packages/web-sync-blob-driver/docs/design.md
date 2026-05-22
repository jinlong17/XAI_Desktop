# web-sync-blob-driver — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — docs anchor under `packages/web-sync-blob-driver/`, runtime Web Sync blob driver implemented conservatively inside `@repo/core-data` with injected auth/crypto seams |
| Review Doc Path | `docs/reviews/web-sync-blob-driver/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-22 rev2 |
| Feature Type | W4 Web data-driver planning |
| Roadmap | `web-ticktick-parity` · feature #8 · W4 |

## Frozen Assumptions

- This row does not create a second repository abstraction outside `@repo/core-data`.
- `packages/web-sync-blob-driver/docs/` is the workflow anchor package only; the planned runtime code lands in `packages/core-data/`.
- All business entities move only as encrypted blob envelopes over `/sync/pull` and `/sync/push`.
- `/sync/pull` and `/sync/push` require:
  - authenticated/device-bound request context `Authorization` and `X-Device-Id`
  - driver-owned protocol header `Accept-Version: sync.protocol=1`
- `@repo/core-data` must consume injected Web seams, not React context or app-shell code:
  - device-bound fetch from `web-auth-device-session`
  - encrypt/decrypt/key-id seam from `web-browser-e2e-crypto-runtime`
- A process-local mirror is allowed in this row so `list`, `listByIndex`, `transaction`, and migration semantics can stay aligned with the current `Repository<T>` contract before the later IndexedDB cache row lands.
- `Repo.delete(id)` maps to hard delete at the repository layer; future soft-delete UX remains a business-record concern.
- `401/403/409/426/429` handling is part of the driver contract, not an app-layer afterthought.

## Scope Boundary

This feature owns planning for:

- `docs/reviews/web-sync-blob-driver/`
- `packages/web-sync-blob-driver/docs/`
- later `packages/core-data/` additions for the Web Sync blob driver
- the injected transport/crypto seam design
- local mirror, retry, idempotency, and conflict-handling policy

This feature does not own:

- browser auth/session providers or route guards
- browser crypto runtime implementation details beyond consumed contracts
- IndexedDB persistence
- business feature UIs
- remote Supabase schema changes

## Dependency Overview

- Upstream source: `docs/reviews/web-sync-blob-driver/20260521-roadmap-seed.md`
- Governing contracts:
  - `packages/core-data/src/types.ts`
  - `packages/core-data/tests/repository-contract.ts`
  - `packages/web-sync-crypto-contract-preflight/docs/api.md`
  - `packages/web-browser-e2e-crypto-runtime/docs/api.md`
  - `packages/web-auth-device-session/docs/api.md`
  - `docs/planning/sub-prds/sync/{PRD.md,dev-plan.md}`
- Contract precedence for versioning:
  - `packages/web-sync-crypto-contract-preflight/docs/api.md` and `docs/planning/sub-prds/sync/PRD.md` define the required Sync protocol header `Accept-Version: sync.protocol=1`
  - `packages/web-auth-device-session/docs/api.md` remains the owner of authenticated/device-bound request context; any conflicting upstream helper wording is treated as integration drift outside this driver contract
- Stable/shared runtime inputs:
  - `createDeviceBoundFetch(...)` or equivalent injected fetch seam
  - browser crypto runtime `encryptBlob` / `decryptBlob` / current key state
- Downstream rows unlocked:
  - `web-encrypted-indexeddb-cache`
  - `web-console-host-router`
  - `web-todo-first-slice`
  - `web-realtime-metadata-sync`

## Proposed Runtime Shape

Planned build-time touch points:

- `packages/core-data/src/sync-blob.ts`
- `packages/core-data/src/index.ts`
- `packages/core-data/tests/sync-blob*.test.ts`
- optional test fixtures under `packages/core-data/tests/fixtures/`

Planned public export:

- `createSyncBlobRepo<T extends RepoRecord>(options)`
- `SYNC_PROTOCOL_HEADER` / `SYNC_BLOB_ACCEPT_VERSION`
- `SyncBlobRepo<T>` with `pull()`, `pushPending()`, `syncState()`
- `SyncBlobError` / `SyncBlobErrorCode`

Planned internal responsibilities:

- pull encrypted records into a local mirror
- decrypt/encrypt record JSON via injected crypto
- push staged mutations with stable mutation ids
- append `Accept-Version: sync.protocol=1` on `/sync/pull` and `/sync/push` while consuming a seam that already enforces `Authorization` and `X-Device-Id`
- preserve repository query behavior locally
- keep per-repo metadata such as namespace, schemaVersion, migrationVersion, recordCount, and last sync cursor

## Phase 3 Snapshot

Implemented in `@repo/core-data`:

- `packages/core-data/src/sync-blob.ts`
- `packages/core-data/tests/sync-blob.test.ts`
- `packages/core-data/src/index.ts` exports the public driver surface

Hardening outcomes:

- conflict refresh preserves logical `mutation_id` and local mutation intent
- retries are explicit for `409` and `429` only; `401/403/426/version_required` fail fast
- migration failure during push preserves `migrationVersion` and mirror rollback invariants
- downstream seam for `web-encrypted-indexeddb-cache` is explicit through `syncState()` (`lastCommitSeq`, pending count, mirror count) without changing the `Repo<T>` contract

## Build Phase Freeze

### Phase 1 — Core driver scaffold and local mirror contract

- add the new `sync-blob` driver module in `packages/core-data/`
- freeze factory options, metadata shape, local mirror behavior, and the split `/sync/*` header rule
- wire contract tests against the mirror-backed implementation using mock transport + mock crypto
- do not add IndexedDB persistence yet

### Phase 2 — Pull/push transport, conflict paths, and retry/idempotency

- implement `/sync/pull` and `/sync/push` transport mapping
- implement `401/403/409/426/429` handling plus `version_required` mapping for missing protocol version
- implement retry/backoff without regenerating mutation ids
- cover no-business-table-CRUD assertions

### Phase 3 — Contract hardening and downstream adoption seam

- tighten metadata/migration semantics
- prove parity against the repository contract suite
- document the handoff seam for `web-encrypted-indexeddb-cache`

## Reviewer Focus

- Confirm the docs-anchor plus `@repo/core-data` runtime split is the least risky boundary.
- Confirm the injected auth/crypto seam avoids app-shell leakage into `@repo/core-data`.
- Confirm the header ownership split is explicit enough that build adds `Accept-Version` in the driver while the injected fetch seam keeps `Authorization` and `X-Device-Id`.
- Confirm the local mirror approach is acceptable until the IndexedDB row lands.

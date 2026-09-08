# web-sync-blob-driver — Design

## Decision Snapshot

| Field | Value |
|---|---|
| Selected Option | Option A — docs anchor under `packages/web-sync-blob-driver/`, runtime Web Sync blob driver implemented inside `@repo/core-data` with injected auth/crypto seams |
| Review Doc Path | `docs/reviews/web-sync-blob-driver/20260521-discovery-review.md` |
| Review Date/Version | 2026-05-22 rev2 |
| Feature Type | W4 Web data-driver planning |
| Roadmap | `web-ticktick-parity` · feature #8 · W4 |

## Frozen Assumptions

- This row does not create a second repository abstraction outside `@repo/core-data`.
- `packages/web-sync-blob-driver/docs/` is the workflow anchor package only; the runtime code lives in `packages/core-data/`.
- All business entities move only as encrypted blob envelopes over `/sync/pull` and `/sync/push`.
- `/sync/pull` and `/sync/push` require:
  - injected request seam `Authorization` and `X-Device-Id`
  - driver-owned protocol header `Accept-Version: sync.protocol=1`
- `@repo/core-data` consumes injected Web seams only; no React context or app-shell code enters the package.
- A process-local mirror is acceptable in this row; later `web-encrypted-indexeddb-cache` work may replace the backing store without changing the repository contract.
- `Repo.delete(id)` maps to hard delete on the wire.
- `401/403/409/426/429` handling is part of the driver contract.

## Scope Boundary

This feature owns:

- `docs/reviews/web-sync-blob-driver/`
- `packages/web-sync-blob-driver/docs/`
- `packages/core-data/src/sync-blob.ts`
- `packages/core-data/tests/sync-blob.test.ts`
- the injected transport/crypto seam contract
- mirror, retry, idempotency, conflict, and handoff semantics

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
- Stable/shared runtime inputs:
  - device-bound fetch seam supplying `Authorization` and `X-Device-Id`
  - browser crypto seam supplying `encryptRecord` / `decryptRecord` / `getCurrentKeyId`

## Implemented Runtime Shape

Current touch points on `main`:

- `packages/core-data/src/sync-blob.ts`
- `packages/core-data/src/index.ts`
- `packages/core-data/tests/sync-blob.test.ts`

Current public surface:

- `createSyncBlobRepo<T extends RepoRecord>(options)`
- `SyncBlobRepo<T>` with explicit `pull()`, `pushPending()`, and `syncState()`

Current internal responsibilities:

- keep a process-local mirror and revision metadata map inside `@repo/core-data`
- decrypt/encrypt record JSON via injected crypto seams
- push staged mutations with stable mutation ids
- append `Accept-Version: sync.protocol=1` on `/sync/pull` and `/sync/push`
- preserve repository query behavior locally
- expose `syncState()` as the downstream cache-handoff seam

## Implementation Notes

- The runtime takes `deviceId` as the required browser/device seam and allows optional `encryptionDeviceId` override when the server nonce identity differs.
- Reads operate on the current mirror; `pull()` is explicit rather than implicit on every read path.
- `409` handling is optimistic and mutation-stable: pull latest remote state, rebuild the push payload against refreshed revision, reuse the same `mutation_id`, and keep the optimistic local record on success.
- Local mock crypto in `packages/core-data/tests/sync-blob.test.ts` may emit plain base64 JSON rather than the real Rust envelope header; the runtime tolerates that in tests while still honoring the real header when present.

## Phase Mapping

### Phase 1 — Core driver scaffold and local mirror contract

Status: DONE (`7a26f5d`).

- added the `sync-blob` driver module in `packages/core-data/`
- froze the factory options, mirror behavior, and split `/sync/*` header rule
- wired repository contract tests plus sync-driver-specific tests against mock transport + mock crypto

### Phase 2 — Pull/push transport, conflict paths, and retry/idempotency

Status: DONE (`d653181`).

- implemented `/sync/pull` and `/sync/push` transport mapping
- implemented `401/403/409/426/429` handling plus `version_required` mapping
- implemented retry/backoff without regenerating mutation ids
- covered no-business-table-CRUD assertions

### Phase 3 — Contract hardening and downstream adoption seam

Status: DONE (`b72b234`; split repair chain: `5638003`, `4a554e1`, `321f469`, `530d239`, `d74aa2e`; superseded history: `4ac3e24`).

- tightened metadata/migration semantics and rollback behavior
- proved parity against the repository contract suite and sync-specific conflict/retry tests
- exposed `syncState()` as the handoff seam for later cache work

## Reviewer Focus

- Confirm the docs-anchor plus `@repo/core-data` runtime split remains the least risky boundary.
- Confirm the injected auth/crypto seam avoids app-shell leakage into `@repo/core-data`.
- Confirm the driver still owns only `Accept-Version: sync.protocol=1` while the injected seam keeps `Authorization` and `X-Device-Id`.
- Confirm the local mirror plus `syncState()` seam is acceptable until the IndexedDB row lands.

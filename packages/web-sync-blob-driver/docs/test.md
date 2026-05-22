# web-sync-blob-driver — Test Plan

## Validation Strategy

Validation focuses on repository-contract parity, no-business-table-CRUD enforcement, explicit transport/status handling, and a mock-first path that does not depend on live Supabase.

## Required Automated Coverage Once Built

### Unit coverage

- local mirror CRUD behavior
- revision derivation from current mirror state
- mutation-id generation and reuse across retries
- retry/backoff policy helpers
- error mapping for `401/403/409/426/429`, upstream `version_required`, and upgrade-required version failures
- transaction staging + rollback helpers
- migration metadata helpers

### Contract coverage

- run the existing `packages/core-data/tests/repository-contract.ts` suite against:
  - in-memory repo
  - SQLite repo
  - Sync blob repo
- explicit assertions that:
  - malformed records still fail with the same `E3005` style runtime validation
  - migration version mismatches still fail consistently
  - `list` ordering and `listByIndex` behavior match the current drivers
  - thrown transaction callbacks roll back staged mirror writes and staged push batches

### Transport / protocol coverage

- `/sync/pull` mock returns only encrypted envelopes, never business-table JSON
- `/sync/pull` and `/sync/push` mocks assert the ownership split:
  - injected seam provides `Authorization` and `X-Device-Id`
  - driver adds `Accept-Version: sync.protocol=1`
- duplicate retry preserves one `mutation_id`
- `401 unknown_device` raises typed auth failure
- `403 device_revoked` raises typed revoked-device failure
- `409` triggers pull-refresh-before-fail behavior
- missing or malformed `Accept-Version` surfaces the existing version-failure lane with raw upstream `version_required` evidence
- `426` surfaces the same upgrade-required lane without retry
- `429` respects retry/backoff policy without changing mutation ids
- no request path targets `/rest/v1/todos` or other business tables

### Regression / downstream coverage

- driver can consume a `createDeviceBoundFetch(...)`-style seam without importing browser provider code
- driver can consume a crypto adapter backed by `web-browser-e2e-crypto-runtime` semantics
- local mirror contract is explicit enough that `web-encrypted-indexeddb-cache` can replace backing storage later without API drift

## Local Mock Strategy

Allowed seams:

- mock `fetchSync` implementation for `/sync/pull` and `/sync/push`
- mock crypto adapter that still enforces AAD/envelope semantics at the contract level
- deterministic `nowIso`, `nowMs`, and `newMutationId` hooks
- fixture pull/push payloads representing encrypted blob envelopes only

Rules:

- no business-table REST mocks
- do not bypass the driver by injecting pre-decoded business rows directly into public pull/push tests
- auth/device failures must come through the same injected fetch seam that production code uses
- mock request seams must provide `Authorization` and `X-Device-Id`
- `/sync/*` coverage must assert that the driver itself adds `Accept-Version: sync.protocol=1`
- keep at least one test layer where the mirror and push batch are both validated together

## Per-Phase Verification Gates

### Phase 1 — Driver scaffold and local mirror

- `test -f packages/core-data/src/sync-blob.ts`
- `pnpm --filter @repo/core-data test -- --runInBand`
- contract suite runs the new driver with deterministic mock transport and crypto
- request construction tests freeze the split header rule:
  - injected seam: `Authorization`, `X-Device-Id`
  - driver: `Accept-Version: sync.protocol=1`

### Phase 2 — Pull/push, retries, and status paths

- targeted tests for `401/403/409/426/429` plus upstream `version_required`
- targeted tests that one logical mutation keeps one `mutation_id` across retries
- targeted tests that no business-table URL is requested

### Phase 3 — Hardening and downstream seam

- metadata cursor behavior verified
- mirror replacement assumptions documented for row #9
- contract suite still passes after retry/conflict handling is added

Implemented evidence (this build run):

- `packages/core-data/tests/sync-blob.test.ts` now covers:
  - `401` -> `E_SYNC_BLOB_AUTH`
  - `403` -> `E_SYNC_BLOB_DEVICE_REVOKED`
  - `409` conflict pull-refresh retry with stable `mutation_id`
  - `400 version_required` and `426` -> `E_SYNC_BLOB_UPGRADE_REQUIRED`
  - `429` retry with `Retry-After` and stable `mutation_id`
  - downstream cursor seam via `syncState()`
  - migration rollback semantics when push fails during `migrate()`
- command evidence:
  - `pnpm --filter @repo/core-data test`
  - `pnpm --filter @repo/core-data check-types`

## Suggested Commands

```bash
test -f docs/reviews/web-sync-blob-driver/20260521-feature-brief.md
test -f docs/reviews/web-sync-blob-driver/20260521-discovery-review.md
test -f packages/web-sync-blob-driver/docs/design.md
test -f packages/web-sync-blob-driver/docs/api.md
test -f packages/web-sync-blob-driver/docs/test.md
test -f packages/web-sync-blob-driver/docs/dev_log.md
rg -n "createSyncBlobRepo|X-Device-Id|Accept-Version|sync.protocol=1|version_required|mutation_id|409|426|429|business-table CRUD|local mirror" \
  docs/reviews/web-sync-blob-driver/20260521-discovery-review.md \
  packages/web-sync-blob-driver/docs/{design.md,api.md,test.md,dev_log.md}
```

## Acceptance Focus

- Reviewers can see one clear path from the existing `Repository<T>` contract to a Web Sync blob driver.
- Mock coverage proves the feature does not regress into business-table CRUD.
- Acceptance gates prove the canonical `/sync/*` header rule before build starts: `Authorization`, `X-Device-Id`, and driver-owned `Accept-Version: sync.protocol=1`.
- Retry/idempotency/conflict handling is explicit before implementation starts.

# web-sync-blob-driver — Test Plan

## Validation Strategy

Validation focuses on repository-contract parity, no-business-table-CRUD enforcement, explicit transport/status handling, idempotent retries, and a mock-first path that does not depend on live Supabase.

## Current Local Verification

- `pnpm --filter @repo/core-data check-types`
- `pnpm --filter @repo/core-data test` → 93 passed
- sync-driver-specific coverage lives in `packages/core-data/tests/sync-blob.test.ts`

## Required Automated Coverage

### Unit coverage

- local mirror CRUD behavior
- revision derivation from current mirror state
- mutation-id generation and reuse across retries
- retry/backoff helpers
- error mapping for `401/403/409/426/429`, upstream `version_required`, and upgrade-required failures
- transaction staging + rollback helpers
- migration metadata helpers
- `syncState()` cursor/pending/mirror-count exposure

### Contract coverage

- run `packages/core-data/tests/repository-contract.ts` against the sync driver
- explicit assertions that:
  - malformed records still fail with `E3005`
  - migration version mismatches still fail consistently
  - `list` ordering and `listByIndex` behavior match the other drivers
  - thrown transaction callbacks roll back local mirror writes and staged push mutations

### Transport / protocol coverage

- `/sync/pull` mock returns encrypted envelopes only; no business-table JSON routes exist
- `/sync/pull` and `/sync/push` mocks assert the ownership split:
  - injected seam provides `Authorization` and `X-Device-Id`
  - driver adds `Accept-Version: sync.protocol=1`
- duplicate retry preserves one `mutation_id`
- `401 unknown_device` raises typed auth failure
- `403 device_revoked` raises typed revoked-device failure
- `409` pulls latest remote revision, retries with the same `mutation_id`, and refreshes `base_revision` / `proposed_revision`
- `400 version_required` and `426` surface the same upgrade-required lane without retry
- `429` respects `Retry-After` or backoff without changing mutation ids
- no request path targets `/rest/v1/todos` or other business tables

### Regression / downstream coverage

- driver can consume a device-bound fetch seam without importing browser provider code
- driver can consume a crypto adapter backed by `web-browser-e2e-crypto-runtime` semantics
- `syncState()` gives `web-encrypted-indexeddb-cache` one explicit seam before persistence is added

## Local Mock Strategy

Allowed seams:

- mock `fetchSync` implementation for `/sync/pull` and `/sync/push`
- mock crypto adapter that still enforces the call contract; local tests may use plain base64 JSON while the runtime still honors the real envelope header when present
- deterministic `nowIso`, `nowMs`, `newMutationId`, and `sleepMs` hooks
- fixture pull/push payloads representing encrypted blob envelopes only

Rules:

- no business-table REST mocks
- do not bypass the driver by injecting pre-decoded business rows directly into public pull/push tests
- auth/device failures must come through the same injected fetch seam that production code uses
- mock request seams must provide `Authorization` and `X-Device-Id`
- `/sync/*` coverage must assert that the driver itself adds `Accept-Version: sync.protocol=1`

## Per-Phase Verification Gates

### Phase 1 — Driver scaffold and local mirror

- `test -f packages/core-data/src/sync-blob.ts`
- `pnpm --filter @repo/core-data test`
- repository contract suite passes against the sync driver
- header ownership is frozen:
  - injected seam: `Authorization`, `X-Device-Id`
  - driver: `Accept-Version: sync.protocol=1`

### Phase 2 — Pull/push, retries, and status paths

- targeted tests for `401/403/409/426/429` plus upstream `version_required`
- targeted tests that one logical mutation keeps one `mutation_id` across retries
- targeted tests that no business-table URL is requested

### Phase 3 — Hardening and downstream seam

- `syncState()` cursor/pending/mirror-count behavior verified
- mirror replacement assumptions documented for row #9
- contract suite still passes after retry/conflict handling is added

## Suggested Commands

```bash
test -f docs/reviews/web-sync-blob-driver/20260521-feature-brief.md
test -f docs/reviews/web-sync-blob-driver/20260521-discovery-review.md
test -f packages/web-sync-blob-driver/docs/design.md
test -f packages/web-sync-blob-driver/docs/api.md
test -f packages/web-sync-blob-driver/docs/test.md
test -f packages/web-sync-blob-driver/docs/dev_log.md
pnpm --filter @repo/core-data check-types
pnpm --filter @repo/core-data test
```

## Acceptance Focus

- Reviewers can see one clear path from the existing `Repository<T>` contract to a Web Sync blob driver.
- Mock coverage proves the feature does not regress into business-table CRUD.
- Acceptance gates prove the canonical `/sync/*` header rule: `Authorization`, `X-Device-Id`, and driver-owned `Accept-Version: sync.protocol=1`.
- Retry/idempotency/conflict handling is explicit and verified.
- Downstream cache work has one explicit handoff seam via `syncState()`.

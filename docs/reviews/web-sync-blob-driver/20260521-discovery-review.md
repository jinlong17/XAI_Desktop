# Discovery Review — web-sync-blob-driver

| 字段 | 值 |
|---|---|
| Feature | `web-sync-blob-driver` |
| 日期 | 2026-05-22 (revised) |
| 执行者 | Codex (`feature-plan` inline) |
| 外部调研 | No external research required — this is an internal contract/boundary planning row constrained by shipped repo docs and Sync authority docs |

## Problem Framing

The hard planning problem is not whether Web should have a Sync-backed repository. That is already fixed by roadmap row #8 and the shipped upstream rows. The real decision is how to add a Web Sync blob driver to `@repo/core-data` without breaking three boundaries:

1. `@repo/core-data` must keep the public `Repository<T>` contract.
2. Browser auth/session logic must stay in `web-auth-device-session`, not leak into `@repo/core-data`.
3. Browser crypto/runtime logic must stay in `web-browser-e2e-crypto-runtime`, while all business entities still travel only as encrypted blob envelopes.

The row therefore needs a conservative adapter design:

- docs/workflow anchor under `packages/web-sync-blob-driver/docs/`
- actual runtime implementation planned inside `packages/core-data/`
- injected transport and crypto seams from the shipped Web rows
- no direct app-shell imports and no table-specific REST CRUD

## Current Contract Baseline

### Existing repository surface

From `packages/core-data/src/types.ts` and `packages/core-data/tests/repository-contract.ts`, every driver is expected to provide:

- `get`, `put`, `delete`, `list`, `listByIndex`, `metadata`
- `transaction`
- `migrate`
- runtime validation of malformed records and migration mismatches

The existing contract tests also assume stable ordering, index-style filtering, rollback on thrown transaction callbacks, and idempotent migrations.

### Shipped Web dependencies

- `web-auth-device-session`
  - already exports `createDeviceBoundFetch(...)`
  - owns authenticated/device-bound request injection, including `Authorization` and `X-Device-Id`
  - already centralizes `401 unknown_device` and `403 device_revoked` handling
  - still documents `X-Sync-Version` upstream, but that is app-version drift / integration cleanup rather than part of this feature's required `/sync/*` transport contract
- `web-browser-e2e-crypto-runtime`
  - already freezes browser unlock lifecycle and `encryptBlob` / `decryptBlob`
  - already accepts structured AAD inputs and tracks `currentKeyId`
- `web-sync-crypto-contract-preflight`
  - already freezes `/sync/pull`, `/sync/push`, envelope, AAD, and header semantics

### Sync authority constraints

From the seed and Sync PRD/dev-plan:

- no business-table CRUD such as `/rest/v1/todos`
- business rows move only as encrypted envelopes
- `/sync/pull` and `/sync/push` require:
  - authenticated/device-bound request context `Authorization` and `X-Device-Id`
  - protocol header `Accept-Version: sync.protocol=1`
- mutation ids must be idempotent
- `commit_seq` remains the ordering authority
- explicit handling is required for `401/403/409/426/429`

### Header contract reconciliation

The canonical rule for this feature is now aligned to the shipped Sync authority docs: `Accept-Version: sync.protocol=1` is the sole protocol-version header for `/sync/*`, and this row must not treat `X-Sync-Version` as a required or additive Sync transport header.

Decision:

- `/sync/pull` and `/sync/push` require `Authorization`, `X-Device-Id`, and `Accept-Version: sync.protocol=1`
- the injected device-bound fetch seam owns authenticated/device-bound request context: `Authorization` and `X-Device-Id`
- the `@repo/core-data` Sync blob driver owns adding `Accept-Version: sync.protocol=1` on `/sync/pull` and `/sync/push`
- build/test work for this row must assert that ownership split directly
- `X-Sync-Version` may still exist as upstream app-version drift in `web-auth-device-session`, but it is outside this driver's required `/sync/*` transport contract

Version-error interpretation:

- missing or malformed `Accept-Version` stays aligned with upstream `version_required`
- `426` remains the stale-client / upgrade-required path after a canonically versioned request
- both paths are treated as explicit version-lane failures, not recoverable transport noise

## Options

### Option A — docs anchor package plus runtime implementation inside `packages/core-data/` using injected Web seams

Shape:

- keep the feature docs under `packages/web-sync-blob-driver/docs/`
- implement a new `@repo/core-data` driver factory later, likely exported as `createSyncBlobRepo(...)`
- require callers to inject:
  - a device-bound fetch function or transport adapter
  - a browser crypto runtime adapter
  - optional deterministic `now` / retry / uuid hooks for tests
- keep a process-local mirror of decrypted records so the existing `Repository<T>` query methods can operate without table CRUD

Pros:

- preserves `@repo/core-data` as the contract owner
- respects upstream Web package ownership
- matches the existing `core-data-sqlite-driver` pattern where the docs anchor is narrower than the runtime contract package
- keeps future IndexedDB caching as an additive row rather than a prerequisite for this one

Cons:

- `transaction` and `migrate` need explicit adaptation because the remote protocol is not a real multi-statement database transaction
- the driver will need a local mirror before row #9 adds persistent cache
- build will touch `packages/core-data/`, which is broader than the docs package anchor

Assessment:

- Recommended.

### Option B — create a separate runtime package `packages/web-sync-blob-driver/` and let apps/Web rows bypass `@repo/core-data`

Pros:

- smaller blast radius inside `packages/core-data`
- easier to prototype browser-only data flows

Cons:

- violates the seed’s requirement that this is an `@repo/core-data` driver
- forks the repository abstraction at the exact point where the roadmap wants unification
- later rows would need adapters back into `@repo/core-data` anyway
- raises contract drift risk against existing repository tests

Assessment:

- Reject.

### Option C — put device/session and crypto wiring directly inside the driver implementation

Pros:

- simpler consumer API in the short term

Cons:

- leaks browser app-shell concerns into `@repo/core-data`
- duplicates upstream error handling and session ownership
- makes contract tests harder because auth/session state becomes implicit global state

Assessment:

- Reject.

## Recommendation

Choose **Option A**.

Plan this feature as a docs anchor package plus a future `@repo/core-data` Web driver implementation with strict dependency injection.

The review-driven version-header resolution is part of the recommendation:

- injected browser request seam: `Authorization`, `X-Device-Id`
- driver-owned sync protocol header: `Accept-Version: sync.protocol=1`
- version failures map into the existing `version_required` / upgrade-required handling path

## Selected Runtime Shape

### Public ownership split

`packages/web-sync-blob-driver/docs/` owns:

- workflow state and planning contract for this roadmap row
- the conservative package-boundary decision

`packages/core-data/` will own in build:

- the Sync blob repository factory
- local mirror + repository query behavior
- mutation-id generation seam
- Sync pull/push orchestration over injected transport/crypto adapters
- adding `Accept-Version: sync.protocol=1` on `/sync/pull` and `/sync/push`
- typed driver error surface

`web-auth-device-session` remains the owner of:

- authenticated, device-bound request context
- enforcing `Authorization` and `X-Device-Id`
- centralized `401 unknown_device` and `403 device_revoked` reactions
- follow-up cleanup for any upstream `X-Sync-Version` app-version drift outside this driver contract

`web-browser-e2e-crypto-runtime` remains the owner of:

- unlock lifecycle
- envelope encryption/decryption
- AAD and key-id correctness at the crypto boundary

### Proposed adapter seam

Recommended future factory shape inside `@repo/core-data`:

```ts
type SyncBlobFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type SyncBlobCryptoAdapter<T extends RepoRecord> = {
  encryptRecord(input: {
    record: T;
    accountId: string;
    keyId: number;
    proposedRevision: string;
    encryptionDeviceId: string;
    deletedFlag: boolean;
  }): Promise<{ blobBase64: string }>;
  decryptRecord(input: {
    blobBase64: string;
    entityType: string;
    entityId: string;
    revision: string;
    keyId: number;
    encryptionDeviceId: string;
    deletedFlag: boolean;
  }): Promise<T>;
  getCurrentKeyId(): number;
};

type CreateSyncBlobRepoOptions<T extends RepoRecord> = {
  namespace: string;
  accountId: string;
  fetchSync: SyncBlobFetch;
  crypto: SyncBlobCryptoAdapter<T>;
  nowIso?: () => string;
  newMutationId?: () => string;
  retry?: RetryPolicy;
};
```

Important rule:

- `@repo/core-data` should accept a generic `fetchSync` seam, not import React context, providers, or `useWebAuthSession`.
- If consumers want to pass `createDeviceBoundFetch(...)`, they do so outside `@repo/core-data`.
- The resulting seam must already satisfy `Authorization` and `X-Device-Id`.
- `@repo/core-data` still owns the protocol header and must append `Accept-Version: sync.protocol=1` when it calls `/sync/pull` and `/sync/push`.

### Local mirror decision

The driver should plan for an in-memory decrypted mirror in row #8:

- `pull` hydrates the mirror
- `put` and `delete` update the mirror optimistically
- `list` and `listByIndex` operate locally to preserve repository contract semantics
- row #9 can later swap the backing mirror from memory to encrypted IndexedDB without changing the repository API

This is the only practical way to satisfy:

- local filtering/order/index behavior
- transaction callback staging
- mock-first tests without business-table CRUD

### `transaction` and `migrate` interpretation

The existing contract is database-shaped, but the remote protocol is Sync-shaped. The conservative interpretation for this row is:

- `transaction(fn)` stages local mirror mutations and a push batch in memory
- if `fn` throws, local staged changes are discarded
- if commit push fails, local staged changes roll back and the error is surfaced
- `migrate(plan)` remains driver-local over the mirror and metadata versioning, not a server-side schema migration primitive

This keeps parity with the current tests without pretending that `/sync/push` is a SQL transaction.

### Delete semantics

Because `Repo.delete(id)` has no soft/hard mode parameter:

- repository-level `delete(id)` should map to hard delete on the Sync wire
- future business-level soft delete remains a record-content concern, not a repository API concern

This avoids inventing new `Repo<T>` methods in row #8.

## Status Handling Contract

### `401`

- meaning: auth invalid or unknown device path
- owner reaction:
  - surface a typed driver auth error
  - do not blind-retry writes
  - let upstream auth/device layer clear state

### `403`

- meaning: `device_revoked`
- owner reaction:
  - surface a typed driver revoked-device error
  - stop retries immediately
  - let upstream auth/device layer run forced logout/cleanup

### `409`

- meaning: revision conflict or conflict-style push rejection
- owner reaction:
  - force targeted pull refresh before another write attempt
  - preserve mutation idempotency on retry
  - surface a typed conflict error if the refreshed mirror still diverges

### `426`

- meaning: stale protocol or envelope version after a canonically versioned request
- owner reaction:
  - no automatic retry
  - surface a typed upgrade-required error
  - mark the driver unusable until host/runtime version changes

### `version_required`

- meaning: missing or malformed `Accept-Version`
- owner reaction:
  - fail fast as a protocol-contract error
  - do not retry
  - treat this as a driver/request construction bug, not as recoverable backpressure
  - route it through the same version-failure lane used by upgrade-required handling while preserving raw `version_required` evidence for tests/logs

### `429`

- meaning: rate limit / server backpressure
- owner reaction:
  - respect `Retry-After` if present
  - exponential backoff with jitter
  - never regenerate mutation ids during retry

## Risks

- `Repository<T>` parity will look credible only if the local mirror rules are explicit; without that, later build work may quietly reduce `list` or `transaction` semantics.
- `@repo/core-data` is still `In-Dev`, so downstream Web rows must keep mocking until the driver and core-data package are verified and promoted.
- The current `Repo.delete(id)` contract has no soft-delete mode, so reviewers should confirm that hard-delete-at-driver-layer is acceptable before build.
- A stale local mirror could make `409` recovery ambiguous if pull/merge rules are underspecified.
- upstream `X-Sync-Version` drift could confuse integrators again unless build tests and docs keep `Accept-Version: sync.protocol=1` as the only canonical `/sync/*` version header for this driver.

## Open Questions

1. Whether build phase 1 should expose `createSyncBlobRepo()` publicly immediately, or keep it internal until the repository contract suite passes.
2. Whether push handling should accept mixed multi-record results such as `207` from the shipped Sync push shape in the first build phase, or defer partial-success handling to phase 2 once the basic single-batch path is stable.
3. Whether the mirror metadata should record last pulled `commit_seq` inside driver metadata only, or in a companion repo namespace that later IndexedDB cache code can reuse.

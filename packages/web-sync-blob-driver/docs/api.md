# web-sync-blob-driver — API / Contract Notes

## Runtime API

This row plans one new `@repo/core-data` public surface. Exact symbol names may tighten during build, but the ownership split is frozen.

Recommended shape:

```ts
type SyncBlobFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

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

type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio?: number;
};

type CreateSyncBlobRepoOptions<T extends RepoRecord> = {
  namespace: string;
  accountId: string;
  deviceId: string;
  fetchSync: SyncBlobFetch;
  crypto: SyncBlobCryptoAdapter<T>;
  syncBaseUrl?: string;
  driverName?: string;
  schemaVersion?: number;
  migrationVersion?: number;
  nowIso?: () => string;
  nowMs?: () => number;
  newMutationId?: () => string;
  retry?: RetryPolicy;
  sleepMs?: (ms: number) => Promise<void>;
};

type SyncBlobDriverState = {
  lastCommitSeq: string;
  pendingMutationCount: number;
  mirroredRecordCount: number;
};

type SyncBlobRepo<T extends RepoRecord> = Repo<T> & {
  pull(options?: { limit?: number }): Promise<void>;
  pushPending(): Promise<void>;
  syncState(): SyncBlobDriverState;
};

declare function createSyncBlobRepo<T extends RepoRecord>(
  options: CreateSyncBlobRepoOptions<T>,
): SyncBlobRepo<T>;
```

Implemented exports in `packages/core-data/src/index.ts`:

- `createSyncBlobRepo`
- `SYNC_PROTOCOL_HEADER`
- `SYNC_BLOB_ACCEPT_VERSION`
- `SyncBlobError` / `SyncBlobErrorCode`
- sync-blob type exports above

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `packages/core-data/src/types.ts` | `Repo<T>` shape remains the public contract; this row must not fork it |
| `packages/core-data/tests/repository-contract.ts` | existing CRUD/list/index/transaction/migration behavior is the parity target where applicable |
| `packages/web-auth-device-session/docs/api.md` | request authentication, `X-Device-Id`, and device-auth failures stay upstream; this row consumes an injected fetch seam only, while any conflicting helper wording is treated as separate app-version drift cleanup |
| `packages/web-browser-e2e-crypto-runtime/docs/api.md` | envelope encryption/decryption, AAD, key-id, and unlocked runtime state stay upstream; this row consumes an injected crypto seam only |
| `packages/web-sync-crypto-contract-preflight/docs/api.md` | `/sync/pull`, `/sync/push`, `commit_seq`, AAD, and envelope shapes are already frozen |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| later Web feature rows using `@repo/core-data` | one repository contract across in-memory, SQLite, Tauri-SQLite, and Sync blob drivers |
| `web-encrypted-indexeddb-cache` | can replace or extend the local mirror backing without changing the repository API |
| `web-todo-first-slice` and later product rows | no direct `/rest/v1/<business-table>` access is needed for business entities |

## Pull / Push Contract

### Header Ownership

- Injected device-bound fetch seam responsibilities:
  - `Authorization`
  - `X-Device-Id`
- Driver responsibilities on `/sync/pull` and `/sync/push`:
  - add `Accept-Version: sync.protocol=1`
- Version-failure mapping:
  - upstream `400 version_required` remains the missing-protocol-version signal
  - `426` remains the stale-client / upgrade-required signal
  - both must surface through the existing upgrade-required/version-failure path without silent retry
  - the driver never asserts or requires `X-Sync-Version` in this contract

### `/sync/pull`

- Method: `GET`
- Path: `/sync/pull`
- Headers:
  - `Authorization`
  - `X-Device-Id`
  - `Accept-Version: sync.protocol=1`
- Query:
  - `since_commit_seq`
  - `limit`

Planned client behavior:

- request new encrypted records since the last known cursor
- ignore self-echo metadata only when the upstream contract says it is safe
- rely on the injected fetch seam for `Authorization` and `X-Device-Id`
- add `Accept-Version: sync.protocol=1` in the driver before dispatch
- decrypt each blob into a `RepoRecord` JSON payload
- update the local mirror and cursor metadata

### `/sync/push`

- Method: `POST`
- Path: `/sync/push`
- Headers:
  - `Authorization`
  - `X-Device-Id`
  - `Accept-Version: sync.protocol=1`
- Body records include:
  - `entity_type`
  - `entity_id`
  - `mutation_id`
  - `base_revision`
  - `proposed_revision`
  - `blob`
  - `client_updated_at`
  - `soft_delete`
  - `hard_delete`

Planned client behavior:

- serialize full business record JSON into the encrypted blob payload
- preserve one stable `mutation_id` across retries
- compute `proposed_revision` from current mirror state
- rely on the injected fetch seam for `Authorization` and `X-Device-Id`
- add `Accept-Version: sync.protocol=1` in the driver before dispatch
- treat `Repo.delete(id)` as `hard_delete = true`

## Local Mirror Contract

The row intentionally plans a local in-memory mirror because the current repository API requires local query behavior:

- `get` reads from mirror, refreshing from pull when needed by driver policy
- `put` stages a local update plus one push record
- `delete` stages local removal plus one hard-delete push record
- `list` and `listByIndex` operate on decrypted mirror records using the same query semantics as other drivers
- `transaction(fn)` buffers mirror writes and push records until commit
- `migrate(plan)` runs against mirror state and metadata versioning only
- `syncState()` surfaces cursor/pending counters for downstream cache backends without exposing business-table APIs

## Error Semantics

| Error | Meaning | Required driver reaction |
|---|---|---|
| `E_SYNC_BLOB_AUTH` | unauthenticated or `401 unknown_device` path | stop automatic retry; surface auth/device error upstream |
| `E_SYNC_BLOB_DEVICE_REVOKED` | `403 device_revoked` | stop retries immediately; surface revoked-device failure |
| `E_SYNC_BLOB_CONFLICT` | `409` conflict / revision mismatch after refresh | trigger pull refresh; preserve mutation ids; fail typed if still divergent |
| `E_SYNC_BLOB_UPGRADE_REQUIRED` | `400 version_required` or `426` stale protocol/envelope version after the driver attempts a canonically headered request | no retry; mark driver unusable until the version contract is fixed or the client/runtime is upgraded |
| `E_SYNC_BLOB_RATE_LIMITED` | `429` backpressure | respect `Retry-After` if present; exponential backoff with jitter |
| `E_SYNC_BLOB_PROTOCOL` | malformed pull/push body, missing required fields, or unexpected response code outside the explicit version/auth/conflict lanes | fail fast; do not silently coerce |
| `E_SYNC_BLOB_CRYPTO` | encrypt/decrypt/AAD/envelope failure from injected runtime | fail fast and preserve local rollback |
| `E_SYNC_BLOB_UNSUPPORTED` | driver operation not yet compatible with the remote contract | throw explicit unsupported error rather than partial behavior |

## Permission / Idempotency Notes

- This driver requires network access through an injected fetch seam.
- The injected fetch seam must enforce `Authorization` and `X-Device-Id`.
- The driver must add `Accept-Version: sync.protocol=1` on `/sync/pull` and `/sync/push`.
- Duplicate retries must reuse the same `mutation_id`.
- The driver must never fall back to business-table CRUD, even in tests.
- The driver must keep browser-only provider logic out of `@repo/core-data`.

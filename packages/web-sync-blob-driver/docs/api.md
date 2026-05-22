# web-sync-blob-driver — API / Contract Notes

## Runtime API

This row now maps to the existing `@repo/core-data` runtime surface already present on `main`.

```ts
type SyncBlobFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

type SyncBlobCryptoEncryptInput<T extends RepoRecord> = {
  record: T;
  accountId: string;
  keyId: number;
  proposedRevision: string;
  encryptionDeviceId: string;
  deletedFlag: boolean;
};

type SyncBlobCryptoDecryptInput = {
  blobBase64: string;
  entityType: string;
  entityId: string;
  revision: string;
  keyId: number;
  encryptionDeviceId: string;
  deletedFlag: boolean;
};

type SyncBlobCryptoAdapter<T extends RepoRecord> = {
  encryptRecord(
    input: SyncBlobCryptoEncryptInput<T>,
  ): Promise<{ blobBase64: string }>;
  decryptRecord(input: SyncBlobCryptoDecryptInput): Promise<T>;
  getCurrentKeyId(): number;
};

type RetryPolicy = {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio?: number;
};

type PullOptions = {
  limit?: number;
};

type SyncBlobDriverState = {
  lastCommitSeq: string;
  pendingMutationCount: number;
  mirroredRecordCount: number;
};

type CreateSyncBlobRepoOptions<T extends RepoRecord> = {
  namespace: string;
  accountId: string;
  deviceId: string;
  fetchSync: SyncBlobFetch;
  crypto: SyncBlobCryptoAdapter<T>;
  syncBaseUrl?: string;
  encryptionDeviceId?: string;
  driverName?: string;
  schemaVersion?: number;
  migrationVersion?: number;
  nowIso?: () => string;
  nowMs?: () => number;
  newMutationId?: () => string;
  retry?: RetryPolicy;
  sleepMs?: (ms: number) => Promise<void>;
};

type SyncBlobRepo<T extends RepoRecord> = Repo<T> & {
  pull(options?: PullOptions): Promise<void>;
  pushPending(): Promise<void>;
  syncState(): SyncBlobDriverState;
};

declare const SYNC_BLOB_ACCEPT_VERSION = "sync.protocol=1";
declare class SyncBlobError extends Error {
  code:
    | "E_SYNC_BLOB_AUTH"
    | "E_SYNC_BLOB_DEVICE_REVOKED"
    | "E_SYNC_BLOB_CONFLICT"
    | "E_SYNC_BLOB_UPGRADE_REQUIRED"
    | "E_SYNC_BLOB_RATE_LIMITED"
    | "E_SYNC_BLOB_PROTOCOL"
    | "E_SYNC_BLOB_CRYPTO"
    | "E_SYNC_BLOB_UNSUPPORTED";
}

declare function createSyncBlobRepo<T extends RepoRecord>(
  options: CreateSyncBlobRepoOptions<T>,
): SyncBlobRepo<T>;
```

## Runtime Interpretation

- The injected fetch seam still owns `Authorization` and `X-Device-Id`.
- The driver still owns `Accept-Version: sync.protocol=1` on `/sync/pull` and `/sync/push`.
- The implemented repo uses a process-local decrypted mirror plus local revision metadata.
- `pull()` is explicit. Ordinary `get`, `list`, and `listByIndex` operate against the current mirror state.
- `pushPending()` remains available for later callers that may intentionally batch writes.
- `syncState()` is the current downstream handoff seam for `web-encrypted-indexeddb-cache`.
- The required browser/device seam is `deviceId`; when the runtime knows a distinct server nonce identity, it may override `encryptionDeviceId`.

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `packages/core-data/src/types.ts` | `Repo<T>` remains the shared repository contract |
| `packages/core-data/tests/repository-contract.ts` | CRUD/list/index/transaction/migrate parity is enforced against the sync driver |
| `packages/web-auth-device-session/docs/api.md` | auth/session and `X-Device-Id` ownership stay upstream; this driver consumes a device-bound fetch seam only |
| `packages/web-browser-e2e-crypto-runtime/docs/api.md` | encrypt/decrypt semantics, key-id ownership, and AAD correctness stay upstream |
| `packages/web-sync-crypto-contract-preflight/docs/api.md` | `/sync/pull`, `/sync/push`, envelope semantics, and `Accept-Version` remain authoritative |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| later Web feature rows using `@repo/core-data` | one repository contract across in-memory, SQLite, Tauri-SQLite, and Sync blob drivers |
| `web-encrypted-indexeddb-cache` | can replace the current mirror without changing `Repo<T>` or sync-state semantics |
| `web-todo-first-slice` and later product rows | no direct business-table CRUD path is needed for syncable entities |

## Pull / Push Contract

### Header Ownership

- Injected device-bound fetch seam responsibilities:
  - `Authorization`
  - `X-Device-Id`
- Driver responsibilities on `/sync/pull` and `/sync/push`:
  - add `Accept-Version: sync.protocol=1`
- Version-failure mapping:
  - `400 version_required` stays on the upgrade-required lane
  - `426` stays on the upgrade-required lane
  - neither is retried automatically

### `/sync/pull`

- Method: `GET`
- Path: `/sync/pull`
- Query:
  - `since_commit_seq`
  - `limit`
- Behavior:
  - updates the local mirror and revision/commit-seq state
  - removes mirror entries on `hard_deleted`
  - tolerates plain base64 JSON in local mock crypto tests when the Rust envelope header is not present, while still using the real header when available

### `/sync/push`

- Method: `POST`
- Path: `/sync/push`
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
- Behavior:
  - preserves one stable `mutation_id` across retries
  - retries `429` using `Retry-After` or exponential backoff
  - on `409`, performs `pull()`, rebuilds the batch against refreshed revision state, reuses the same `mutation_id`, and keeps the optimistic local record when retry succeeds

## Local Mirror Contract

- `get` reads current mirror state only
- `put` updates the mirror optimistically, pushes immediately, and rolls back on terminal failure
- `delete` removes from the mirror optimistically, pushes a hard-delete tombstone, and rolls back on terminal failure
- `list` and `listByIndex` operate locally to preserve repository semantics
- `transaction(fn)` stages mirror writes and push mutations together; callback or push failure restores the previous local state
- `migrate(plan)` runs through the same transaction semantics and only bumps `migrationVersion` after the staged work is durably accepted

## Error Semantics

| Error | Meaning | Required driver reaction |
|---|---|---|
| `E_SYNC_BLOB_AUTH` | unauthenticated or `401 unknown_device` path | stop automatic retry; surface auth/device error upstream |
| `E_SYNC_BLOB_DEVICE_REVOKED` | `403 device_revoked` | stop retries immediately; surface revoked-device failure |
| `E_SYNC_BLOB_CONFLICT` | `409` conflict / revision mismatch | back off once per retry cycle, `pull()`, reuse `mutation_id`, and fail only if retries exhaust |
| `E_SYNC_BLOB_UPGRADE_REQUIRED` | `400 version_required` or `426` | no retry; surface upgrade-required failure |
| `E_SYNC_BLOB_RATE_LIMITED` | `429` backpressure | respect `Retry-After` if present; exponential backoff with jitter |
| `E_SYNC_BLOB_PROTOCOL` | malformed pull/push body, unsupported push result status, or unexpected HTTP status | fail fast; do not silently coerce |
| `E_SYNC_BLOB_CRYPTO` | encrypt/decrypt failure from the injected crypto seam | fail fast and preserve local rollback |

## Commit Evidence

- Phase 1 scaffold: `7a26f5d`
- Phase 2 transport/status handling: `d653181`
- Phase 3 hardening/handoff seam: `b72b234`
- Post-phase drift reconciliation still present in current tree: `4ac3e24`

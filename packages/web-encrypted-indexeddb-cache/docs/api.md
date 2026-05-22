# web-encrypted-indexeddb-cache — API / Contract Notes

## Runtime API

This row now documents the implemented encrypted browser cache boundary in `packages/core-data/src/indexeddb-sync-blob.ts`. Symbol names below match the current reviewed runtime closely enough that later build work should refine, not redesign, this contract.

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `packages/core-data/src/types.ts` | `Repo<T>` remains the canonical repository contract; this row must not create a second domain data API |
| `packages/web-sync-blob-driver/docs/api.md` | current browser Sync driver exposes `syncState()` and may later hand off its mirror into a durable cache implementation without contract drift |
| `packages/web-browser-e2e-crypto-runtime/docs/api.md` | lock/unlock transition observation is the canonical wipe trigger source |
| `packages/web-auth-device-session/src/storage.ts` | `idb-keyval` remains sufficient for tiny auth storage only and is not the cache-layer contract |
| `docs/planning/sub-prds/web/PRD.md` | user-content-derived plaintext must not persist in IndexedDB |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| `web-console-host-router` | can read non-sensitive metadata and route-level cache state without owning IndexedDB schema |
| `web-todo-first-slice` and later product rows | can consume durable encrypted local data through shared data/cache seams rather than app-local tables |
| `web-offline-outbox-conflicts` | can reuse `pending_mutations` and `dead_letter_mutations` persistence stores without redefining them |
| `web-search-keyboard-theme` | can consume a memory-only search worker adapter without persisting plaintext FTS data |
| `web-browser-e2e-crypto-runtime` observers | can trigger one consistent wipe path for decrypted cache/search state |

## Planned Public Surface

Representative current surface inside `@repo/core-data`:

```ts
type CacheLockReason = "manual" | "idle" | "unload" | "error";

type EncryptedCacheStoreNames =
  | "entity_blobs"
  | "entity_index"
  | "entity_sort_keys"
  | "pending_mutations"
  | "dead_letter_mutations"
  | "sync_state";

type CacheQuotaSnapshot = {
  usageBytes: number | null;
  quotaBytes: number | null;
  persisted: boolean | null;
  capturedAt: number;
};

type CacheHealthState = {
  sentinelPresent: boolean;
  needsRehydrate: boolean;
  lastCursor: string | null;
  lastAccountCommitSeq: string | null;
  quota: CacheQuotaSnapshot | null;
};

type CacheWipeReport = {
  reason: CacheLockReason;
  wipedSearchMemory: boolean;
  wipedSortMemory: boolean;
  wipedPlaintextBlobMemory: boolean;
  at: number;
};

type EncryptedBlobRow = {
  key: string;
  entityType: string;
  entityId: string;
  revision: string;
  keyId: number;
  encryptionDeviceId: string;
  commitSeq: string;
  hardDeleted: boolean;
  blobBase64: string;
  blobSize: number;
  serverUpdatedAt?: string;
};

type EntityIndexRow = {
  key: string;
  entityType: string;
  entityId: string;
  revision: string;
  commitSeq: string;
  hardDeleted: boolean;
  serverUpdatedAt?: string;
  updatedAt: string;
};

type EntitySortKeyRow = {
  key: string;
  entityType: string;
  entityId: string;
  revision: string;
  encryptedSortPayload: string;
  keyId: number;
  encryptionDeviceId: string;
  updatedAt: string;
};

type PendingMutationRow = {
  mutationId: string;
  entityType: string;
  entityId: string;
  baseRevision: string | null;
  proposedRevision: string;
  encryptedPayload: string;
  queuedAt: string;
  softDelete: boolean;
  hardDelete: boolean;
};

type DeadLetterMutationRow = PendingMutationRow & {
  failureCode: string;
  failedAt: string;
};

type SyncStateRow = {
  key: "cursor" | "sentinel" | "quota" | "account_commit_seq";
  value: string;
  updatedAt: string;
};

type SearchWorkerAdapter = {
  rebuildFromEncryptedCache(): Promise<void>;
  clear(reason: CacheLockReason): Promise<void>;
  status(): Promise<"empty" | "building" | "ready">;
  search(query: string): Promise<string[]>;
};

type EncryptedIndexedDbCache = {
  get(id: string): Promise<T | undefined>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  list(query?: RepoListQuery<T>): Promise<T[]>;
  pull(options?: PullOptions): Promise<void>;
  pushPending(): Promise<void>;
  health(): Promise<CacheHealthState>;
  captureQuota(): Promise<CacheQuotaSnapshot | null>;
  wipeMemory(reason: CacheLockReason): Promise<CacheWipeReport>;
  searchWorker(): SearchWorkerAdapter;
};
```

Exact generics and helper names may still tighten, but the contract must preserve:

- durable encrypted cache stores
- explicit health/quota state
- explicit wipe reporting
- a memory-only worker-search adapter
- durable queue persistence before push attempts
- locked-mode no-decrypt semantics for bootstrap and pull

## Persistent Store Contract

### `entity_blobs`

- durable encrypted source of truth for browser-local entities
- must not contain plaintext user content
- may store non-sensitive routing metadata needed for later decrypt/reconcile

### `entity_index`

- durable non-sensitive metadata only
- supports locked-mode list placeholders and cache bookkeeping
- must not store:
  - plaintext title/body/notes/content
  - plaintext sensitive sort fields
  - FTS tokens

### `entity_sort_keys`

- durable encrypted payload for sensitive sort/filter material
- decrypted into memory only after unlock
- later UI rows may build in-memory sort indexes from it but may not persist the decrypted result

### `pending_mutations` / `dead_letter_mutations`

- durable encrypted payload stores only
- schema ownership belongs here
- `PendingMutationRow` must not persist optimistic plaintext records or derived plaintext fields
- mutation persistence must happen before any network push attempt
- retry/replay/diff policy belongs later

### `sync_state`

- stores cursor/sentinel/cache-health metadata only
- sentinel absence when other data exists is a cache-integrity failure that must trigger safe reset + rehydrate

## Lock / Wipe Contract

- This row must subscribe to the browser crypto runtime transition seam.
- `get`, `list`, and decrypted search rebuild are locked-gated operations.
- Required wipe triggers:
  - `lock("manual")`
  - `lock("idle")`
  - `lock("unload")`
  - `lock("error")`
- Wipe effects:
  - clear decrypted FTS index
  - clear decrypted sort mirrors
  - clear any in-memory plaintext blob cache
- Wipe effects do **not** require deleting durable ciphertext stores unless the higher-level recovery path decides the cache is untrustworthy.
- `unlock` is the only transition that may rebuild decrypted mirror/search state from durable ciphertext rows.

## Quota / Recovery Contract

- `navigator.storage.estimate()` is the canonical quota observation seam.
- `navigator.storage.persisted()` and `navigator.storage.persist()` may be used to observe/request persistence, but implementation must still assume eviction can happen.
- Missing sentinel is treated as a cache reset signal, not a warning-only event.
- Blocked/versionchange/unexpected-close events must surface typed recovery signals instead of silent failures.
- Locked bootstrap may load durable rows and sentinel state, but must not decrypt them until unlock.
- Locked remote pull may persist new encrypted blob/index rows, but must not decrypt remote payloads until unlock.

## Error Semantics

| Error | Meaning |
|---|---|
| `E_WEB_CACHE_UNSUPPORTED` | required IndexedDB or storage APIs unavailable in the current browser mode |
| `E_WEB_CACHE_BLOCKED` | database upgrade/open blocked by another tab or runtime |
| `E_WEB_CACHE_SENTINEL_MISSING` | sentinel row missing while durable cache rows still exist; treat cache as suspect |
| `E_WEB_CACHE_QUOTA_EXCEEDED` | browser storage quota prevented a durable write |
| `E_WEB_CACHE_LOCKED` | decrypted-only operation requested while runtime is locked |
| `E_WEB_CACHE_SCHEMA_DRIFT` | stored schema/version is incompatible with current runtime assumptions |
| `E_WEB_CACHE_WIPE_FAILED` | best-effort memory wipe failed partially; callers should still force locked UX |
| `E_WEB_CACHE_STORAGE_ERROR` | durable IndexedDB read/write operation failed for a non-quota storage reason |

## Permission / Idempotency Notes

- No Tauri permission or desktop capability is involved.
- Re-running wipe for an already-cleared worker or in-memory cache must be idempotent.
- Re-running sentinel-based reset should converge on one clean cache state.
- Persistent stores may keep ciphertext across lock/unlock cycles; only decrypted mirrors are guaranteed to clear on lock.
- Failed push attempts must converge on one durable encrypted pending queue after recovery; callers must not assume in-memory queue state is authoritative.

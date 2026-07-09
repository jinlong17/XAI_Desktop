import {
  applyRepoIndexQuery,
  applyRepoListQuery,
  assertMigrationPlan,
  assertRepoRecord,
  skippedMigrationResult,
} from "./repo-utils";
import type {
  MigrationPlan,
  MigrationResult,
  RepoListQuery,
  RepoMetadata,
  RepoRecord,
  RepoTransaction,
} from "./types";
import {
  type CreateSyncBlobRepoOptions,
  type SyncBlobCryptoEncryptInput,
  SyncBlobError,
  type SyncBlobRepo,
  type PullOptions,
  type SyncBlobDriverState,
} from "./sync-blob";

export const WEB_CACHE_DB_VERSION = 1;
export const WEB_CACHE_DB_PREFIX = "web-encrypted-cache";

export type WebCacheLockReason = "manual" | "idle" | "unload" | "error";
export type WebCacheTransitionReason = WebCacheLockReason | "unlock";

export interface WebCacheRuntimeTransition {
  readonly from: string;
  readonly to: string;
  readonly reason: WebCacheTransitionReason;
  readonly at: number;
  readonly currentKeyId?: number | null;
  readonly errorCode?: string;
}

export interface WebCacheRuntimeTransitionSource {
  subscribe(listener: (transition: WebCacheRuntimeTransition) => void): () => void;
}

export interface SearchTextExtractor<T extends RepoRecord> {
  (record: T): string | undefined;
}

export interface SortPayloadExtractor<T extends RepoRecord> {
  (record: T): string | undefined | Promise<string | undefined>;
}

export interface SortPayloadCryptoContext {
  readonly entityType: string;
  readonly entityId: string;
  readonly revision: string;
  readonly keyId: number;
  readonly encryptionDeviceId: string;
  readonly deletedFlag: boolean;
}

export interface SortPayloadCrypto {
  encrypt(input: {
    plaintext: string;
    context: SortPayloadCryptoContext;
  }): Promise<string> | string;
  decrypt(input: {
    ciphertext: string;
    context: SortPayloadCryptoContext;
  }): Promise<string> | string;
}

export type WebCacheSearchWorkerStatus = "empty" | "building" | "ready";

export interface WebCacheSearchWorker {
  rebuildFromEncryptedCache(): Promise<void>;
  clear(reason: WebCacheLockReason): Promise<void>;
  status(): Promise<WebCacheSearchWorkerStatus>;
  search(query: string): Promise<string[]>;
}

export type WebCacheStoreName =
  | "entity_blobs"
  | "entity_index"
  | "entity_sort_keys"
  | "pending_mutations"
  | "dead_letter_mutations"
  | "sync_state";

function isWebCacheLockReason(
  reason: WebCacheTransitionReason,
): reason is WebCacheLockReason {
  return reason !== "unlock";
}

export interface CacheQuotaSnapshot {
  readonly usageBytes: number | null;
  readonly quotaBytes: number | null;
  readonly persisted: boolean | null;
  readonly capturedAt: number;
}

export interface CacheHealthState {
  readonly sentinelPresent: boolean;
  readonly needsRehydrate: boolean;
  readonly lastCursor: string | null;
  readonly lastAccountCommitSeq: string | null;
  readonly quota: CacheQuotaSnapshot | null;
}

export interface CacheWipeReport {
  readonly reason: WebCacheLockReason;
  readonly wipedSearchMemory: boolean;
  readonly wipedSortMemory: boolean;
  readonly wipedPlaintextBlobMemory: boolean;
  readonly at: number;
}

export interface EncryptedBlobRow {
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
}

export interface EntityIndexRow {
  key: string;
  entityType: string;
  entityId: string;
  revision: string;
  commitSeq: string;
  hardDeleted: boolean;
  serverUpdatedAt?: string;
  updatedAt: string;
  schemaVersion: number;
  syncScope: RepoRecord["syncScope"];
}

export interface EntitySortKeyRow {
  key: string;
  entityType: string;
  entityId: string;
  revision: string;
  encryptedSortPayload: string;
  keyId: number;
  encryptionDeviceId: string;
  updatedAt: string;
}

export interface PendingMutationRow {
  mutationId: string;
  entityType: string;
  entityId: string;
  baseRevision: string | null;
  proposedRevision: string;
  encryptedPayload: string;
  queuedAt: string;
  softDelete: boolean;
  hardDelete: boolean;
}

export interface DeadLetterMutationRow {
  mutationId: string;
  entityType: string;
  entityId: string;
  baseRevision: string | null;
  proposedRevision: string;
  encryptedPayload: string;
  queuedAt: string;
  softDelete: boolean;
  hardDelete: boolean;
  failureCode: string;
  failedAt: string;
}

export interface SyncStateRow {
  key: "cursor" | "sentinel" | "quota" | "account_commit_seq";
  value: string;
  updatedAt: string;
}

export type WebCacheErrorCode =
  | "E_WEB_CACHE_UNSUPPORTED"
  | "E_WEB_CACHE_BLOCKED"
  | "E_WEB_CACHE_SENTINEL_MISSING"
  | "E_WEB_CACHE_QUOTA_EXCEEDED"
  | "E_WEB_CACHE_LOCKED"
  | "E_WEB_CACHE_SCHEMA_DRIFT"
  | "E_WEB_CACHE_WIPE_FAILED"
  | "E_WEB_CACHE_STORAGE_ERROR";

export class WebCacheError extends Error {
  constructor(
    readonly code: WebCacheErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(`${code}: ${message}`);
    this.name = "WebCacheError";
  }
}

export interface WebCacheRuntimeOptions<T extends RepoRecord> {
  transitionSource?: WebCacheRuntimeTransitionSource;
  searchTextExtractor?: SearchTextExtractor<T>;
  sortPayloadExtractor?: SortPayloadExtractor<T>;
  sortPayloadCrypto?: SortPayloadCrypto;
  syncStateDatabaseName?: string;
  syncStateVersion?: number;
  initiallyLocked?: boolean;
  onQuota?: (snapshot: CacheQuotaSnapshot) => void;
}

export interface CreateIndexedDbSyncBlobRepoOptions<T extends RepoRecord>
  extends CreateSyncBlobRepoOptions<T>,
    WebCacheRuntimeOptions<T> {}

export interface IndexedDbSyncBlobRepo<T extends RepoRecord>
  extends SyncBlobRepo<T> {
  health(): Promise<CacheHealthState>;
  captureQuota(): Promise<CacheQuotaSnapshot | null>;
  wipeMemory(reason: WebCacheLockReason): Promise<CacheWipeReport>;
  searchWorker(): WebCacheSearchWorker;
}

interface MirrorState {
  revision: string;
  commitSeq: string;
}

interface PendingMutation<T extends RepoRecord> {
  mutationId: string;
  entityType: string;
  entityId: string;
  baseRevision: string | null;
  proposedRevision: string;
  blobBase64: string;
  clientUpdatedAt: number;
  softDelete: boolean;
  hardDelete: boolean;
  optimisticRecord?: T;
}

interface RepoSnapshot<T extends RepoRecord> {
  mirror: Map<string, T>;
  mirrorState: Map<string, MirrorState>;
  pending: PendingMutation<T>[];
  deadLetters: DeadLetterMutationRow[];
  indexRows: Map<string, EntityIndexRow>;
  sortRows: Map<string, EntitySortKeyRow>;
  blobRows: Map<string, EncryptedBlobRow>;
  lastCommitSeq: string;
  lastAccountCommitSeq: string | null;
  needsRehydrate: boolean;
}

interface MutationRowContext {
  keyId: number;
  encryptionDeviceId: string;
  softDelete: boolean;
  proposedRevision: string;
}

const SYNC_STATE_SENTINEL = "sentinel";
const SYNC_STATE_CURSOR = "cursor";
const SYNC_STATE_ACCOUNT_COMMIT_SEQ = "account_commit_seq";
const SYNC_STATE_QUOTA = "quota";

function toRecordKey(entityType: string, entityId: string): string {
  return `${entityType}::${entityId}`;
}

function toCacheMutationInput<T extends RepoRecord>(
  record: T,
  accountId: string,
  keyId: number,
  proposedRevision: string,
  encryptionDeviceId: string,
  deletedFlag: boolean,
) {
  const input: SyncBlobCryptoEncryptInput<T> = {
    record,
    accountId,
    keyId,
    proposedRevision,
    encryptionDeviceId,
    deletedFlag,
  };
  return input;
}

function randomSentinel(): string {
  const cryptoObject = globalThis.crypto as
    | (Crypto & {
        randomUUID?: () => string;
      })
    | undefined;
  if (cryptoObject?.randomUUID) {
    return `sentinel:${cryptoObject.randomUUID()}`;
  }
  return `sentinel:${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function cloneSyncBlobError(error: Error): Error {
  if (error instanceof SyncBlobError) {
    return new SyncBlobError(error.code, error.message, error.cause);
  }
  return error;
}

function assertAccountSyncRecord(record: RepoRecord): void {
  if (record.syncScope === "account-sync") {
    return;
  }
  throw new SyncBlobError(
    "E_SYNC_BLOB_PROTOCOL",
    `sync-blob repo only accepts account-sync records; ${record.entityType}/${record.id} has syncScope ${record.syncScope}`,
  );
}

function mergeSortPayload(
  payload: string | undefined,
): string | undefined {
  return payload;
}

function isQuotaExceededError(error: unknown): boolean {
  const name = typeof error === "object" && error !== null && "name" in error
    ? String((error as { name?: unknown }).name)
    : undefined;

  if (
    name === "QuotaExceededError" ||
    name === "NS_ERROR_DOM_QUOTA_REACHED"
  ) {
    return true;
  }
  return false;
}

export function createIndexedDbSyncBlobRepo<T extends RepoRecord>(
  options: CreateIndexedDbSyncBlobRepoOptions<T>,
): IndexedDbSyncBlobRepo<T> {
  if (!options.namespace) {
    throw new Error("E3005: sync-blob repo requires a namespace");
  }
  if (!options.accountId) {
    throw new Error("E3005: sync-blob repo requires an accountId");
  }
  if (!options.deviceId) {
    throw new Error("E3005: sync-blob repo requires a deviceId");
  }
  if (typeof globalThis.indexedDB === "undefined") {
    throw new WebCacheError(
      "E_WEB_CACHE_UNSUPPORTED",
      "IndexedDB API is unavailable in this runtime",
    );
  }

  const dbName =
    options.syncStateDatabaseName ??
    `${WEB_CACHE_DB_PREFIX}-${options.namespace}-${options.accountId}`;
  const dbVersion = options.syncStateVersion ?? WEB_CACHE_DB_VERSION;
  const schemaVersion = options.schemaVersion ?? 1;
  const nowMs = options.nowMs ?? Date.now;
  const newMutationId = options.newMutationId ?? defaultMutationId;
  const retry = mergeRetryPolicy(options.retry);
  const driverName = options.driverName ?? "sync-blob-indexed-db";
  const searchTextExtractor =
    options.searchTextExtractor ??
    ((record: T) => {
      if (typeof (record as Record<string, unknown>).title === "string") {
        return (record as Record<string, unknown>).title as string;
      }
      return undefined;
    });
  const sortPayloadExtractor = options.sortPayloadExtractor;
  const sortPayloadCrypto = options.sortPayloadCrypto ?? defaultSortPayloadCrypto();
  const onQuota = options.onQuota;
  const encryptionDeviceId = options.encryptionDeviceId ?? options.deviceId;
  const initialLocked = options.initiallyLocked ?? false;
  const transitionSource = options.transitionSource;

  const mirror = new Map<string, T>();
  const mirrorState = new Map<string, MirrorState>();
  const indexRows = new Map<string, EntityIndexRow>();
  const sortRows = new Map<string, EntitySortKeyRow>();
  const blobRows = new Map<string, EncryptedBlobRow>();
  const syncState = new Map<string, SyncStateRow>();
  const pending: PendingMutation<T>[] = [];
  const deadLetters: DeadLetterMutationRow[] = [];
  let lastCommitSeq = "0";
  let lastAccountCommitSeq: string | null = null;
  let migrationVersion = options.migrationVersion ?? 0;
  let needsRehydrate = false;
  const migrations: MigrationResult[] = [];
  let isLocked = initialLocked;
  let initialized = false;
  let initializing: Promise<void> | null = null;
  const syncDbVersion = dbVersion;

  const searchWorker: WebCacheSearchWorker = createSearchWorker({
    getIndexKeys: () => [...mirror.keys()],
    getRecordForSearch: async (id: string) => {
      const result = await getRecordById(id);
      if (!result) {
        return undefined;
      }
      return searchTextExtractor(result);
    },
  });

  const repo: IndexedDbSyncBlobRepo<T> = {
    get,
    put,
    delete: remove,
    list,
    listByIndex,
    metadata,
    transaction,
    migrate,
    pull,
    pushPending,
    syncState: reportSyncState,
    health,
    captureQuota,
    wipeMemory,
    searchWorker: () => searchWorker,
  };

  if (transitionSource) {
    transitionSource.subscribe((transition) => {
      if (isWebCacheLockReason(transition.reason)) {
        isLocked = true;
        void wipeMemory(transition.reason);
      }
      if (transition.reason === "unlock") {
        void onUnlock();
      }
    });
  }

  return repo;

  async function ensureInitialized(): Promise<void> {
    if (initialized) {
      return;
    }
    if (!initializing) {
      initializing = initializeFromDisk();
    }
    await initializing;
    initialized = true;
  }

  async function initializeFromDisk(): Promise<void> {
    let db: IDBDatabase | null = null;
    try {
      db = await openDb();
      await loadStores(db);
      db.close();
    } catch (error) {
      if (db) {
        try {
          db.close();
        } catch {
          // Ignore best-effort close errors.
        }
      }
      if (error instanceof WebCacheError) {
        throw error;
      }
      throw mapWebError(error, "open");
    }
  }

  async function loadStores(db: IDBDatabase): Promise<void> {
    const allStores: WebCacheStoreName[] = [
      "entity_blobs",
      "entity_index",
      "entity_sort_keys",
      "pending_mutations",
      "dead_letter_mutations",
      "sync_state",
    ];

    const syncStateRecords = await readAll<SyncStateRow>(db, "sync_state");
    syncState.clear();
    for (const row of syncStateRecords) {
      syncState.set(row.key, row);
    }

    const existingBlobRows = await readAll<EncryptedBlobRow>(db, "entity_blobs");
    const existingIndexRows = await readAll<EntityIndexRow>(db, "entity_index");
    const existingSortRows = await readAll<EntitySortKeyRow>(db, "entity_sort_keys");
    const pendingRows = await readAll<PendingMutationRow>(db, "pending_mutations");
    const deadLetterRows = await readAll<DeadLetterMutationRow>(
      db,
      "dead_letter_mutations",
    );

    const hasDurableData =
      existingBlobRows.length +
      existingIndexRows.length +
      existingSortRows.length +
      pendingRows.length +
      deadLetterRows.length >
      0;

    const hasSentinel = syncState.has(SYNC_STATE_SENTINEL);
    if (!hasSentinel && hasDurableData) {
      needsRehydrate = true;
      await clearStores(db, allStores);
      syncState.clear();
      if (!syncState.has(SYNC_STATE_SENTINEL)) {
        syncState.set(SYNC_STATE_SENTINEL, {
          key: SYNC_STATE_SENTINEL,
          value: randomSentinel(),
          updatedAt: nowIso(),
        });
      }
    } else {
      needsRehydrate = false;
      if (!hasSentinel) {
        syncState.set(SYNC_STATE_SENTINEL, {
          key: SYNC_STATE_SENTINEL,
          value: randomSentinel(),
          updatedAt: nowIso(),
        });
      }
    }

    if (syncState.has(SYNC_STATE_CURSOR)) {
      lastCommitSeq = syncState.get(SYNC_STATE_CURSOR)!.value;
    }
    if (syncState.has(SYNC_STATE_ACCOUNT_COMMIT_SEQ)) {
      lastAccountCommitSeq = syncState.get(SYNC_STATE_ACCOUNT_COMMIT_SEQ)!.value;
    }

    mirror.clear();
    mirrorState.clear();
    indexRows.clear();
    sortRows.clear();
    blobRows.clear();
    deadLetters.length = 0;
    pending.length = 0;

    for (const row of existingIndexRows) {
      indexRows.set(row.key, sanitizeIndexRow(row));
      mirrorState.set(row.entityId, {
        revision: row.revision,
        commitSeq: row.commitSeq,
      });
    }
    for (const row of existingSortRows) {
      sortRows.set(row.key, sanitizeSortRow(row));
    }
    for (const row of existingBlobRows) {
      blobRows.set(row.key, sanitizeBlobRow(row));
      mirrorState.set(row.entityId, {
        revision: row.revision,
        commitSeq: row.commitSeq,
      });
    }
    for (const row of deadLetterRows) {
      deadLetters.push(sanitizeDeadLetterRow(row));
    }
    if (!isLocked) {
      await rebuildDecryptedMirrorFromMemory();
    }

    for (const row of pendingRows) {
      const restored = await restorePendingMutation(row);
      if (restored) {
        pending.push(restored);
      }
    }

    if (needsRehydrate) {
      const sentinel = syncState.get(SYNC_STATE_SENTINEL);
      if (sentinel) {
        await writeRows(db, "sync_state", [sentinel]);
      }
      throw new WebCacheError(
        "E_WEB_CACHE_SENTINEL_MISSING",
        "cache missing sentinel row; durable store reset is required",
      );
    }

    await persistSyncState(db, false);
    await persistStores(db);
  }

  async function onUnlock(): Promise<void> {
    isLocked = false;
    await ensureInitialized();
    await rebuildDecryptedMirrorFromMemory();
    await searchWorker.rebuildFromEncryptedCache();
  }

  async function get(id: string): Promise<T | undefined> {
    await ensureInitialized();
    assertUnlocked();
    return mirror.get(id);
  }

  async function put(record: T): Promise<void> {
    await ensureInitialized();
    assertRepoRecord(record);
    const snapshot = snapshotState();
    try {
      const mutation = await buildPutMutation(record);
      await mutateAndPersist(mutation);
    } catch (error) {
      restoreSnapshot(snapshot);
      throw error;
    }
  }

  async function remove(id: string): Promise<void> {
    await ensureInitialized();
    const current = mirror.get(id);
    if (!current) {
      return;
    }

    const snapshot = snapshotState();
    try {
      const mutation = await buildDeleteMutation(current);
      await mutateAndPersist(mutation);
    } catch (error) {
      restoreSnapshot(snapshot);
      throw error;
    }
  }

  async function mutateAndPersist(
    mutation: PendingMutation<T>,
  ): Promise<void> {
    const context = {
      keyId: options.crypto.getCurrentKeyId(),
      encryptionDeviceId,
      softDelete: mutation.softDelete,
      proposedRevision: mutation.proposedRevision,
    };

    const key = toRecordKey(mutation.entityType, mutation.entityId);

    if (!mutation.softDelete && mutation.optimisticRecord) {
      mirror.set(mutation.entityId, mutation.optimisticRecord);
    }
    if (!mutation.softDelete) {
      mirrorState.set(mutation.entityId, {
        revision: mutation.proposedRevision,
        commitSeq: lastCommitSeq,
      });
      const indexRow = toIndexRow({
        entityId: mutation.entityId,
        entityType: mutation.entityType,
        revision: mutation.proposedRevision,
        commitSeq: lastCommitSeq,
        hardDeleted: mutation.hardDelete,
        updatedAt: nowIso(),
        syncScope: mutation.optimisticRecord?.syncScope ?? "account-sync",
        schemaVersion: mutation.optimisticRecord?.schemaVersion ?? schemaVersion,
      });
      indexRows.set(key, indexRow);

      const blobRow = toBlobRow({
        key,
        mutation,
        entityType: mutation.entityType,
        entityId: mutation.entityId,
        keyId: context.keyId,
        encryptionDeviceId: context.encryptionDeviceId,
        commitSeq: lastCommitSeq,
        hardDeleted: mutation.hardDelete,
      });
      blobRows.set(key, blobRow);

      const sortPayload = mutation.optimisticRecord
        ? await pickSortPayload(
            mutation.optimisticRecord,
            mutation.proposedRevision,
            context,
          )
        : undefined;
      if (sortPayload) {
        sortRows.set(
          key,
          toSortRow({
            key,
            mutation,
            entityType: mutation.entityType,
            entityId: mutation.entityId,
            revision: mutation.proposedRevision,
            keyId: context.keyId,
            encryptionDeviceId: context.encryptionDeviceId,
            sortPayload,
          }),
        );
      }
    } else if (mutation.hardDelete) {
      mirror.delete(mutation.entityId);
      mirrorState.delete(mutation.entityId);
      indexRows.delete(key);
      blobRows.delete(key);
      sortRows.delete(key);
    }

    pending.push(mutation);
    await persistState();
    await pushPending();
  }

  async function list(query?: RepoListQuery<T>): Promise<T[]> {
    await ensureInitialized();
    assertUnlocked();
    return applyRepoListQuery(mirror.values(), query);
  }

  async function listByIndex<K extends Extract<keyof T, string>>(
    field: K,
    value: T[K],
    query?: RepoListQuery<T>,
  ): Promise<T[]> {
    await ensureInitialized();
    assertUnlocked();
    return applyRepoIndexQuery(mirror.values(), field, value as T[K & keyof T], query);
  }

  async function metadata(): Promise<RepoMetadata> {
    await ensureInitialized();
    return {
      driver: driverName,
      namespace: options.namespace,
      schemaVersion,
      migrationVersion,
      recordCount: mirror.size,
      migrations: [...migrations],
    };
  }

  async function transaction<R>(
    fn: (tx: RepoTransaction<T>) => Promise<R>,
  ): Promise<R> {
    await ensureInitialized();
    const snapshot = snapshotState();
    const stagedMirror = new Map(mirror);
    const stagedMirrorState = new Map(mirrorState);
    const stagedPending = [...pending];
    const stagedIndexRows = new Map(indexRows);
    const stagedSortRows = new Map(sortRows);
    const stagedBlobRows = new Map(blobRows);
    const stagedDeadLetters = [...deadLetters];
    let stagedCommitSeq = lastCommitSeq;
    let stagedLastAccountCommitSeq = lastAccountCommitSeq;
    let stagedNeedsRehydrate = needsRehydrate;

    const tx: RepoTransaction<T> = {
      async get(id: string): Promise<T | undefined> {
        return stagedMirror.get(id);
      },

      async put(record: T): Promise<void> {
        assertRepoRecord(record);
        const mutation = await buildPutMutation(record, stagedMirrorState);
        const key = toRecordKey(record.entityType, record.id);
        stagedMirror.set(record.id, record);
        stagedMirrorState.set(record.id, {
          revision: mutation.proposedRevision,
          commitSeq: stagedCommitSeq,
        });

        const mutationRow = {
          ...mutation,
          optimisticRecord: record,
        };

        stagedPending.push(mutationRow);
        stagedBlobRows.set(
          key,
          toBlobRow({
            key,
            mutation,
            entityType: record.entityType,
            entityId: record.id,
            keyId: options.crypto.getCurrentKeyId(),
            encryptionDeviceId,
            commitSeq: stagedCommitSeq,
            hardDeleted: mutation.hardDelete,
          }),
        );
        stagedIndexRows.set(
          key,
          toIndexRow({
            entityId: record.id,
            entityType: record.entityType,
            revision: mutation.proposedRevision,
            commitSeq: stagedCommitSeq,
            hardDeleted: mutation.hardDelete,
            updatedAt: nowIso(),
            syncScope: record.syncScope,
            schemaVersion: record.schemaVersion,
          }),
        );
        const sortPayload = sortPayloadExtractor
          ? await pickSortPayload(record, mutation.proposedRevision, {
              keyId: options.crypto.getCurrentKeyId(),
              encryptionDeviceId,
              softDelete: mutation.softDelete,
              proposedRevision: mutation.proposedRevision,
            })
          : undefined;
        if (sortPayload) {
          stagedSortRows.set(
            key,
            toSortRow({
              key,
              mutation,
              entityType: record.entityType,
              entityId: record.id,
              revision: mutation.proposedRevision,
              keyId: options.crypto.getCurrentKeyId(),
              encryptionDeviceId,
              sortPayload,
            }),
          );
        }
      },

      async delete(id: string): Promise<void> {
        const current = stagedMirror.get(id);
        if (!current) {
          return;
        }
        const mutation = await buildDeleteMutation(current, stagedMirrorState);
        const key = toRecordKey(current.entityType, current.id);
        stagedMirror.delete(id);
        stagedMirrorState.delete(id);
        stagedPending.push(mutation);
        stagedBlobRows.delete(key);
        stagedIndexRows.delete(key);
        stagedSortRows.delete(key);
      },

      async list(q?: RepoListQuery<T>): Promise<T[]> {
        return applyRepoListQuery(stagedMirror.values(), q);
      },

      async listByIndex<K extends Extract<keyof T, string>>(
        field: K,
        value: T[K],
        q?: RepoListQuery<T>,
      ): Promise<T[]> {
        return applyRepoIndexQuery(
          stagedMirror.values(),
          field,
          value as T[K & keyof T],
          q,
        );
      },

      async metadata(): Promise<RepoMetadata> {
        return {
          driver: driverName,
          namespace: options.namespace,
          schemaVersion,
          migrationVersion,
          recordCount: stagedMirror.size,
          migrations: [...migrations],
        };
      },
    };

    try {
      const result = await fn(tx);
      mirror.clear();
      for (const [id, record] of stagedMirror) {
        mirror.set(id, record);
      }
      mirrorState.clear();
      for (const [id, state] of stagedMirrorState) {
        mirrorState.set(id, state);
      }
      indexRows.clear();
      for (const [id, row] of stagedIndexRows) {
        indexRows.set(id, row);
      }
      sortRows.clear();
      for (const [id, row] of stagedSortRows) {
        sortRows.set(id, row);
      }
      blobRows.clear();
      for (const [id, row] of stagedBlobRows) {
        blobRows.set(id, row);
      }
      pending.length = 0;
      pending.push(...stagedPending);
      deadLetters.length = 0;
      deadLetters.push(...stagedDeadLetters);
      lastCommitSeq = stagedCommitSeq;
      lastAccountCommitSeq = stagedLastAccountCommitSeq;
      needsRehydrate = stagedNeedsRehydrate;
      await persistState();
      return result;
    } catch (error) {
      restoreSnapshot(snapshot);
      throw error;
    }
  }

  async function migrate(plan: MigrationPlan<T>): Promise<MigrationResult> {
    await ensureInitialized();
    if (migrationVersion >= plan.toVersion) {
      return skippedMigrationResult(plan, nowIso);
    }

    assertMigrationPlan(plan, migrationVersion);
    const startedAt = nowIso();

    await transaction(async (tx) => {
      for (const step of plan.steps) {
        await step(tx);
      }
    });

    migrationVersion = plan.toVersion;
    const result: MigrationResult = {
      id: plan.id,
      fromVersion: plan.fromVersion,
      toVersion: plan.toVersion,
      startedAt,
      completedAt: nowIso(),
      applied: true,
    };
    migrations.push(result);
    return result;
  }

  async function pull(optionsInput: PullOptions = {}): Promise<void> {
    await ensureInitialized();
    const limit = normalizePullLimit(optionsInput.limit);
    const query = new URLSearchParams({
      since_commit_seq: lastCommitSeq,
      limit: String(limit),
    });

    const response = await options.fetchSync(
      toSyncUrl(options.syncBaseUrl, `/sync/pull?${query.toString()}`),
      {
        method: "GET",
        headers: withSyncProtocolHeader(),
      },
    );

    if (!response.ok) {
      throw await toSyncError(response);
    }

    const payload = (await safeReadJson(response)) as
      | { records?: unknown[]; next_commit_seq?: string; current_account_commit_seq?: string; has_more?: boolean }
      | undefined;
    if (!payload || !Array.isArray(payload.records) || typeof payload.next_commit_seq !== "string") {
      throw new SyncBlobError(
        "E_SYNC_BLOB_PROTOCOL",
        "pull response is missing required fields",
      );
    }

    for (const rawRow of payload.records) {
      const row = normalizePullRecord(rawRow);
      if (!row) {
        throw new SyncBlobError(
          "E_SYNC_BLOB_PROTOCOL",
          "pull record is malformed",
        );
      }

      const recordKey = toRecordKey(row.entity_type, row.entity_id);
      if (row.originator_device_id === options.deviceId) {
        continue;
      }

      if (row.hard_deleted) {
        mirror.delete(row.entity_id);
        mirrorState.delete(row.entity_id);
        blobRows.delete(recordKey);
        indexRows.delete(recordKey);
        sortRows.delete(recordKey);
        continue;
      }

      const envelope = tryParseEnvelopeHeader(row.blob);
      const keyId = envelope?.keyId ?? row.key_id;
      const encryptionDeviceId = envelope?.encryptionDeviceId ?? row.originator_device_id;
      const syncScopeDefaults = "account-sync" as const;
      blobRows.set(
        recordKey,
        toBlobRow({
          key: recordKey,
          mutation: {
            mutationId: row.entity_id,
            entityType: row.entity_type,
            entityId: row.entity_id,
            baseRevision: row.revision,
            proposedRevision: row.revision,
            blobBase64: row.blob,
            clientUpdatedAt: nowMs(),
            softDelete: false,
            hardDelete: false,
          },
          entityType: row.entity_type,
          entityId: row.entity_id,
          keyId,
          encryptionDeviceId,
          commitSeq: row.commit_seq,
          hardDeleted: row.hard_deleted,
        }),
      );
      indexRows.set(
        recordKey,
        toIndexRow({
          entityId: row.entity_id,
          entityType: row.entity_type,
          revision: row.revision,
          commitSeq: row.commit_seq,
          hardDeleted: row.hard_deleted,
          updatedAt: nowIso(),
          syncScope: syncScopeDefaults,
          schemaVersion,
        }),
      );
      mirrorState.set(row.entity_id, {
        revision: row.revision,
        commitSeq: row.commit_seq,
      });

      if (!isLocked) {
        let decrypted: T;
        try {
          decrypted = await options.crypto.decryptRecord({
            blobBase64: row.blob,
            entityType: row.entity_type,
            entityId: row.entity_id,
            revision: row.revision,
            keyId,
            encryptionDeviceId,
            deletedFlag: row.soft_deleted || row.hard_deleted,
          });
        } catch (error) {
          throw cloneSyncBlobError(
            new SyncBlobError(
              "E_SYNC_BLOB_CRYPTO",
              "failed to decrypt /sync/pull record",
              error,
            ),
          );
        }
        assertRepoRecord(decrypted);
        assertAccountSyncRecord(decrypted);
        const existingIndex = indexRows.get(recordKey);
        if (existingIndex) {
          existingIndex.syncScope = decrypted.syncScope;
          existingIndex.schemaVersion = decrypted.schemaVersion;
          indexRows.set(recordKey, existingIndex);
        }
        mirror.set(decrypted.id, decrypted);
      }
    }

    lastCommitSeq = maxNumericString(lastCommitSeq, payload.next_commit_seq);
    if (payload.current_account_commit_seq) {
      lastAccountCommitSeq = maxNumericString(
        lastAccountCommitSeq ?? "0",
        payload.current_account_commit_seq,
      );
    }
    await persistState();
  }

  async function pushPending(): Promise<void> {
    if (pending.length === 0) {
      return;
    }

    const toPush = [...pending];
    pending.length = 0;

    try {
      await pushBatchWithRetry(toPush);
      commitMutationState(toPush);
      await persistState();
    } catch (error) {
      pending.unshift(...toPush);
      await persistState();
      throw error;
    }
  }

  async function buildPutMutation(
    record: T,
    stateView: Map<string, MirrorState> = mirrorState,
  ): Promise<PendingMutation<T>> {
    assertAccountSyncRecord(record);
    const current = stateView.get(record.id);
    const proposedRevision = nextRevision(current?.revision ?? null);
    const keyId = options.crypto.getCurrentKeyId();

    let blobBase64: string;
    try {
      blobBase64 = (
        await options.crypto.encryptRecord(
          toCacheMutationInput(
            record,
            options.accountId,
            keyId,
            proposedRevision,
            encryptionDeviceId,
            false,
          ),
        )
      ).blobBase64;
    } catch (error) {
      throw new SyncBlobError(
        "E_SYNC_BLOB_CRYPTO",
        "failed to encrypt /sync/push record",
        error,
      );
    }

    return {
      mutationId: newMutationId(),
      entityType: record.entityType,
      entityId: record.id,
      baseRevision: current?.revision ?? null,
      proposedRevision,
      blobBase64,
      clientUpdatedAt: nowMs(),
      softDelete: false,
      hardDelete: false,
      optimisticRecord: record,
    };
  }

  async function buildDeleteMutation(
    record: T,
    stateView: Map<string, MirrorState> = mirrorState,
  ): Promise<PendingMutation<T>> {
    assertAccountSyncRecord(record);
    const current = stateView.get(record.id);
    const proposedRevision = nextRevision(current?.revision ?? null);
    const keyId = options.crypto.getCurrentKeyId();

    let blobBase64: string;
    try {
      blobBase64 = (
        await options.crypto.encryptRecord(
          toCacheMutationInput(
            record,
            options.accountId,
            keyId,
            proposedRevision,
            encryptionDeviceId,
            true,
          ),
        )
      ).blobBase64;
    } catch (error) {
      throw new SyncBlobError(
        "E_SYNC_BLOB_CRYPTO",
        "failed to encrypt hard-delete tombstone",
        error,
      );
    }

    return {
      mutationId: newMutationId(),
      entityType: record.entityType,
      entityId: record.id,
      baseRevision: current?.revision ?? null,
      proposedRevision,
      blobBase64,
      clientUpdatedAt: nowMs(),
      softDelete: false,
      hardDelete: true,
      optimisticRecord: record,
    };
  }

  async function pushBatchWithRetry(batch: PendingMutation<T>[]): Promise<void> {
    let attempt = 1;
    while (true) {
      const response = await options.fetchSync(
        toSyncUrl(options.syncBaseUrl, "/sync/push"),
        {
          method: "POST",
          headers: withSyncProtocolHeader({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            accountId: options.accountId,
            records: batch.map((mutation) =>
              toPushRecord(mutation, options.deviceId),
            ),
          }),
        },
      );

      if (response.ok) {
        const payload = await safeReadJson(response);
        if (Array.isArray(payload?.results)) {
          for (const result of payload.results) {
            const status =
              typeof result?.status === "string" ? result.status : "ok";
            if (
              status === "ok" ||
              status === "duplicate" ||
              status === "duplicate_mutation_id"
            ) {
              continue;
            }
            if (status === "revision_mismatch") {
              throw new SyncBlobError(
                "E_SYNC_BLOB_CONFLICT",
                "push results returned revision_mismatch",
                result,
              );
            }
            throw new SyncBlobError(
              "E_SYNC_BLOB_PROTOCOL",
              `unsupported push result status ${status}`,
              result,
            );
          }
        }
        return;
      }

      const error = await toSyncError(response);
      const shouldRetry = await canRetry(
        attempt,
        error,
        response,
        retry,
        options.sleepMs ?? defaultSleep,
      );
      if (!shouldRetry) {
        throw error;
      }

      if (error.code === "E_SYNC_BLOB_CONFLICT") {
        await pull();
        batch = await refreshConflictBatch(batch);
      }

      attempt += 1;
    }
  }

  async function refreshConflictBatch(
    source: PendingMutation<T>[],
  ): Promise<PendingMutation<T>[]> {
    const refreshed: PendingMutation<T>[] = [];
    for (const mutation of source) {
      if (mutation.hardDelete) {
        const current = mirror.get(mutation.entityId);
        if (!current) {
          refreshed.push(mutation);
          continue;
        }
        const nextMutation = await buildDeleteMutation(current);
        nextMutation.mutationId = mutation.mutationId;
        nextMutation.optimisticRecord = mutation.optimisticRecord;
        refreshed.push(nextMutation);
        continue;
      }

      const record =
        mutation.optimisticRecord ?? mirror.get(mutation.entityId);
      if (!record) {
        throw new SyncBlobError(
          "E_SYNC_BLOB_CONFLICT",
          `conflict refresh missing local record ${mutation.entityId}`,
        );
      }
      const nextMutation = await buildPutMutation(record);
      nextMutation.mutationId = mutation.mutationId;
      nextMutation.optimisticRecord = record;
      refreshed.push(nextMutation);
    }
    return refreshed;
  }

  function commitMutationState(batch: PendingMutation<T>[]): void {
    for (const mutation of batch) {
      if (mutation.hardDelete) {
        mirror.delete(mutation.entityId);
        mirrorState.delete(mutation.entityId);
        indexRows.delete(toRecordKey(mutation.entityType, mutation.entityId));
        blobRows.delete(toRecordKey(mutation.entityType, mutation.entityId));
        sortRows.delete(toRecordKey(mutation.entityType, mutation.entityId));
        continue;
      }

      if (mutation.optimisticRecord) {
        mirror.set(mutation.entityId, mutation.optimisticRecord);
      }
      mirrorState.set(mutation.entityId, {
        revision: mutation.proposedRevision,
        commitSeq: lastCommitSeq,
      });
    }
  }

  function snapshotState(): RepoSnapshot<T> {
    return {
      mirror: new Map(mirror),
      mirrorState: new Map(mirrorState),
      pending: [...pending],
      deadLetters: [...deadLetters],
      indexRows: new Map(indexRows),
      sortRows: new Map(sortRows),
      blobRows: new Map(blobRows),
      lastCommitSeq,
      lastAccountCommitSeq,
      needsRehydrate,
    };
  }

  function restoreSnapshot(snapshot: RepoSnapshot<T>): void {
    mirror.clear();
    for (const [id, record] of snapshot.mirror) {
      mirror.set(id, record);
    }
    mirrorState.clear();
    for (const [id, state] of snapshot.mirrorState) {
      mirrorState.set(id, state);
    }
    pending.length = 0;
    pending.push(...snapshot.pending);
    deadLetters.length = 0;
    deadLetters.push(...snapshot.deadLetters);
    indexRows.clear();
    for (const [id, row] of snapshot.indexRows) {
      indexRows.set(id, row);
    }
    sortRows.clear();
    for (const [id, row] of snapshot.sortRows) {
      sortRows.set(id, row);
    }
    blobRows.clear();
    for (const [id, row] of snapshot.blobRows) {
      blobRows.set(id, row);
    }
    lastCommitSeq = snapshot.lastCommitSeq;
    lastAccountCommitSeq = snapshot.lastAccountCommitSeq;
    needsRehydrate = snapshot.needsRehydrate;
  }

  function reportSyncState(): SyncBlobDriverState {
    return {
      lastCommitSeq,
      pendingMutationCount: pending.length,
      mirroredRecordCount: mirror.size,
    };
  }

  async function health(): Promise<CacheHealthState> {
    await ensureInitialized();
    const quota = await captureQuota();
    return {
      sentinelPresent: syncState.has(SYNC_STATE_SENTINEL),
      needsRehydrate,
      lastCursor: lastCommitSeq ?? null,
      lastAccountCommitSeq: lastAccountCommitSeq ?? null,
      quota,
    };
  }

  async function captureQuota(): Promise<CacheQuotaSnapshot | null> {
    const storage = globalThis.navigator?.storage;
    if (!storage?.estimate) {
      return null;
    }

    try {
      const estimate = await storage.estimate();
      const persisted = storage.persisted
        ? await storage.persisted()
        : null;
      const snapshot: CacheQuotaSnapshot = {
        usageBytes:
          typeof estimate.usage === "number" ? estimate.usage : null,
        quotaBytes: typeof estimate.quota === "number" ? estimate.quota : null,
        persisted,
        capturedAt: nowMs(),
      };
      syncState.set(SYNC_STATE_QUOTA, {
        key: SYNC_STATE_QUOTA,
        value: JSON.stringify(snapshot),
        updatedAt: nowIso(),
      });
      onQuota?.(snapshot);
      const db = await openDb();
      try {
        await writeRows(db, "sync_state", [...syncState.values()]);
      } finally {
        db.close();
      }
      return snapshot;
    } catch (error) {
      if (isQuotaExceededError(error)) {
        throw new WebCacheError(
          "E_WEB_CACHE_QUOTA_EXCEEDED",
          "quota query threw quota-related error",
          error,
        );
      }
      throw new WebCacheError(
        "E_WEB_CACHE_STORAGE_ERROR",
        "failed to capture storage quota",
        error,
      );
    }
  }

  async function wipeMemory(reason: WebCacheLockReason): Promise<CacheWipeReport> {
    mirror.clear();
    mirrorState.clear();
    let report: Omit<CacheWipeReport, "wipedSearchMemory" | "wipedSortMemory"> & {
      wipedSearchMemory: boolean;
      wipedSortMemory: boolean;
    } = {
      reason,
      wipedSearchMemory: false,
      wipedSortMemory: false,
      wipedPlaintextBlobMemory: true,
      at: nowMs(),
    };

    try {
      await searchWorker.clear(reason);
      return {
        ...report,
        wipedSearchMemory: true,
        wipedSortMemory: true,
      };
    } catch {
      throw new WebCacheError("E_WEB_CACHE_WIPE_FAILED", "failed to wipe in-memory cache", reason);
    }
  }

  async function persistState(): Promise<void> {
    const db = await openDb();
    try {
      await persistSyncState(db, true);
      await persistStores(db);
    } catch (error) {
      if (error instanceof WebCacheError) {
        throw error;
      }
      if (isQuotaExceededError(error)) {
        throw new WebCacheError(
          "E_WEB_CACHE_QUOTA_EXCEEDED",
          "persist operation exceeded quota",
          error,
        );
      }
      throw new WebCacheError("E_WEB_CACHE_STORAGE_ERROR", "failed to persist state", error);
    } finally {
      db.close();
    }
  }

  async function persistSyncState(
    db: IDBDatabase,
    persistQuota: boolean,
  ): Promise<void> {
    if (persistQuota) {
      const quota = await captureQuota();
      if (quota) {
        syncState.set(SYNC_STATE_QUOTA, {
          key: SYNC_STATE_QUOTA,
          value: JSON.stringify(quota),
          updatedAt: nowIso(),
        });
      }
    } else if (!syncState.has(SYNC_STATE_SENTINEL)) {
      syncState.set(SYNC_STATE_SENTINEL, {
        key: SYNC_STATE_SENTINEL,
        value: randomSentinel(),
        updatedAt: nowIso(),
      });
    }

    syncState.set(SYNC_STATE_CURSOR, {
      key: SYNC_STATE_CURSOR,
      value: lastCommitSeq,
      updatedAt: nowIso(),
    });
    if (lastAccountCommitSeq) {
      syncState.set(SYNC_STATE_ACCOUNT_COMMIT_SEQ, {
        key: SYNC_STATE_ACCOUNT_COMMIT_SEQ,
        value: lastAccountCommitSeq,
        updatedAt: nowIso(),
      });
    }

    await writeRows(db, "sync_state", syncStateRowsFromMap());
  }

  async function persistStores(db: IDBDatabase): Promise<void> {
    await clearStore(await getObjectStore(db, "entity_blobs"));
    await clearStore(await getObjectStore(db, "entity_index"));
    await clearStore(await getObjectStore(db, "entity_sort_keys"));
    await clearStore(await getObjectStore(db, "pending_mutations"));
    await clearStore(await getObjectStore(db, "dead_letter_mutations"));

    await writeRows(db, "entity_blobs", [...blobRows.values()]);
    await writeRows(db, "entity_index", [...indexRows.values()]);
    await writeRows(db, "entity_sort_keys", [...sortRows.values()]);
    await writeRows(
      db,
      "pending_mutations",
      pending.map(toPendingRow),
    );
    await writeRows(db, "dead_letter_mutations", [...deadLetters]);

    syncState.set(SYNC_STATE_SENTINEL, syncState.get(SYNC_STATE_SENTINEL) ?? {
      key: SYNC_STATE_SENTINEL,
      value: randomSentinel(),
      updatedAt: nowIso(),
    });
    syncState.set(SYNC_STATE_CURSOR, {
      key: SYNC_STATE_CURSOR,
      value: lastCommitSeq,
      updatedAt: nowIso(),
    });
    await writeRows(db, "sync_state", syncStateRowsFromMap());
  }

  function syncStateRowsFromMap(): SyncStateRow[] {
    return [...syncState.values()];
  }

  async function rebuildDecryptedMirrorFromMemory(): Promise<void> {
    mirror.clear();
    mirrorState.clear();
    for (const row of blobRows.values()) {
      if (row.hardDeleted) {
        continue;
      }
      const indexRow = indexRows.get(row.key);
      if (!indexRow) {
        continue;
      }

      try {
        const record = await options.crypto.decryptRecord({
          blobBase64: row.blobBase64,
          entityType: row.entityType,
          entityId: row.entityId,
          revision: row.revision,
          keyId: row.keyId,
          encryptionDeviceId: row.encryptionDeviceId,
          deletedFlag: row.hardDeleted,
        });
        assertRepoRecord(record);
        mirror.set(record.id, record);
        mirrorState.set(record.id, {
          revision: row.revision,
          commitSeq: row.commitSeq,
        });
      } catch (error) {
        throw new WebCacheError(
          "E_WEB_CACHE_SCHEMA_DRIFT",
          "failed to decrypt durable blob during unlock/bootstrap",
          error,
        );
      }
    }
  }

  async function restorePendingMutation(
    row: PendingMutationRow,
  ): Promise<PendingMutation<T> | undefined> {
    return {
      mutationId: row.mutationId,
      entityType: row.entityType,
      entityId: row.entityId,
      baseRevision: row.baseRevision,
      proposedRevision: row.proposedRevision,
      blobBase64: row.encryptedPayload,
      clientUpdatedAt: Number(row.queuedAt),
      softDelete: row.softDelete,
      hardDelete: row.hardDelete,
      optimisticRecord: undefined,
    };
  }

  async function getRecordById(id: string): Promise<T | undefined> {
    await ensureInitialized();
    return mirror.get(id);
  }

  async function pickSortPayload(
    record: T,
    revision: string,
    context: MutationRowContext,
  ): Promise<string | undefined> {
    if (!sortPayloadExtractor) {
      return undefined;
    }

    const raw = await Promise.resolve(sortPayloadExtractor(record));
    if (!raw) {
      return undefined;
    }
    return await Promise.resolve(
      sortPayloadCrypto.encrypt({
        plaintext: mergeSortPayload(raw) as string,
        context: {
          entityType: record.entityType,
          entityId: record.id,
          revision,
          keyId: context.keyId,
          encryptionDeviceId: context.encryptionDeviceId,
          deletedFlag: context.softDelete,
        },
      }),
    );
  }

  function toPendingRow(mutation: PendingMutation<T>): PendingMutationRow {
    return {
      mutationId: mutation.mutationId,
      entityType: mutation.entityType,
      entityId: mutation.entityId,
      baseRevision: mutation.baseRevision,
      proposedRevision: mutation.proposedRevision,
      encryptedPayload: mutation.blobBase64,
      queuedAt: String(mutation.clientUpdatedAt),
      softDelete: mutation.softDelete,
      hardDelete: mutation.hardDelete,
    };
  }

  function toBlobRow(input: {
    key: string;
    mutation: PendingMutation<T>;
    entityType: string;
    entityId: string;
    keyId: number;
    encryptionDeviceId: string;
    commitSeq: string;
    hardDeleted: boolean;
  }): EncryptedBlobRow {
    return {
      key: input.key,
      entityType: input.entityType,
      entityId: input.entityId,
      revision: input.mutation.proposedRevision,
      keyId: input.keyId,
      encryptionDeviceId: input.encryptionDeviceId,
      commitSeq: input.commitSeq,
      hardDeleted: input.hardDeleted,
      blobBase64: input.mutation.blobBase64,
      blobSize: input.mutation.blobBase64.length,
    };
  }

  function toIndexRow(input: {
    entityId: string;
    entityType: string;
    revision: string;
    commitSeq: string;
    hardDeleted: boolean;
    updatedAt: string;
    syncScope: RepoRecord["syncScope"];
    schemaVersion: number;
  }): EntityIndexRow {
    return {
      key: toRecordKey(input.entityType, input.entityId),
      entityType: input.entityType,
      entityId: input.entityId,
      revision: input.revision,
      commitSeq: input.commitSeq,
      hardDeleted: input.hardDeleted,
      updatedAt: input.updatedAt,
      syncScope: input.syncScope,
      schemaVersion: input.schemaVersion,
    };
  }

  function toSortRow(input: {
    key: string;
    mutation: PendingMutation<T>;
    entityType: string;
    entityId: string;
    revision: string;
    keyId: number;
    encryptionDeviceId: string;
    sortPayload: string;
  }): EntitySortKeyRow {
    return {
      key: input.key,
      entityType: input.entityType,
      entityId: input.entityId,
      revision: input.revision,
      encryptedSortPayload: input.sortPayload,
      keyId: input.keyId,
      encryptionDeviceId: input.encryptionDeviceId,
      updatedAt: nowIso(),
    };
  }

  function assertUnlocked(): void {
    if (isLocked) {
      throw new WebCacheError(
        "E_WEB_CACHE_LOCKED",
        "decrypted cache is currently locked",
      );
    }
  }

  async function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, syncDbVersion);
      request.onupgradeneeded = (event) => {
        const db = request.result;
        const oldVersion = (event.oldVersion ?? 0) as number;
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains("entity_blobs")) {
            const store = db.createObjectStore("entity_blobs", {
              keyPath: "key",
            });
            store.createIndex("entityType", "entityType", { unique: false });
            store.createIndex("entityId", "entityId", { unique: false });
            store.createIndex("commitSeq", "commitSeq", { unique: false });
          }
          if (!db.objectStoreNames.contains("entity_index")) {
            const store = db.createObjectStore("entity_index", {
              keyPath: "key",
            });
            store.createIndex("entityType", "entityType", { unique: false });
            store.createIndex("entityId", "entityId", { unique: false });
            store.createIndex("hardDeleted", "hardDeleted", { unique: false });
          }
          if (!db.objectStoreNames.contains("entity_sort_keys")) {
            const store = db.createObjectStore("entity_sort_keys", {
              keyPath: "key",
            });
            store.createIndex("entityType", "entityType", { unique: false });
            store.createIndex("entityId", "entityId", { unique: false });
          }
          if (!db.objectStoreNames.contains("pending_mutations")) {
            const store = db.createObjectStore("pending_mutations", {
              keyPath: "mutationId",
            });
            store.createIndex("entityType", "entityType", { unique: false });
            store.createIndex("entityId", "entityId", { unique: false });
            store.createIndex("queuedAt", "queuedAt", { unique: false });
          }
          if (!db.objectStoreNames.contains("dead_letter_mutations")) {
            const store = db.createObjectStore("dead_letter_mutations", {
              keyPath: "mutationId",
            });
            store.createIndex("entityType", "entityType", { unique: false });
            store.createIndex("entityId", "entityId", { unique: false });
            store.createIndex("failedAt", "failedAt", { unique: false });
          }
          if (!db.objectStoreNames.contains("sync_state")) {
            db.createObjectStore("sync_state", {
              keyPath: "key",
            });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        reject(mapWebError(request.error, "open"));
      };
      request.onblocked = () => {
        reject(
          new WebCacheError(
            "E_WEB_CACHE_BLOCKED",
            "database is blocked by another open connection",
          ),
        );
      };
    });
  }

  function mapWebError(error: unknown, context: string): WebCacheError {
    if (error instanceof WebCacheError) {
      return error;
    }
    if (isQuotaExceededError(error)) {
      return new WebCacheError(
        "E_WEB_CACHE_QUOTA_EXCEEDED",
        `${context}: quota exceeded`,
        error,
      );
    }
    return new WebCacheError(
      "E_WEB_CACHE_STORAGE_ERROR",
      `${context}: indexeddb storage failed`,
      error,
    );
  }

  async function getObjectStore(
    db: IDBDatabase,
    storeName: WebCacheStoreName,
  ): Promise<IDBObjectStore> {
    const tx = db.transaction([storeName], "readwrite");
    return tx.objectStore(storeName);
  }

  async function readAll<T>(db: IDBDatabase, storeName: WebCacheStoreName): Promise<T[]> {
    return readWithRequest<T[]>(db, storeName, "readonly", (store) =>
      store.getAll(),
    );
  }

  async function readWithRequest<T>(
    db: IDBDatabase,
    storeName: WebCacheStoreName,
    mode: IDBTransactionMode,
    requestFactory: (store: IDBObjectStore) => IDBRequest,
  ): Promise<T> {
    const tx = db.transaction([storeName], mode);
    const request = requestFactory(tx.objectStore(storeName));
    const result = await requestAsPromise<T>(request);
    await transactionDone(tx);
    return result;
  }

  async function writeRows<T>(
    db: IDBDatabase,
    storeName: WebCacheStoreName,
    rows: T[],
  ): Promise<void> {
    const tx = db.transaction([storeName], "readwrite");
    const store = tx.objectStore(storeName);
    for (const row of rows) {
      await requestAsPromise<void>(store.put(row));
    }
    await transactionDone(tx);
  }

  async function clearStore(store: IDBObjectStore): Promise<void> {
    await requestAsPromise<void>(store.clear());
  }

  async function clearStores(db: IDBDatabase, stores: WebCacheStoreName[]): Promise<void> {
    for (const storeName of stores) {
      const tx = db.transaction([storeName], "readwrite");
      await requestAsPromise<void>(tx.objectStore(storeName).clear());
      await transactionDone(tx);
    }
  }

function requestAsPromise<T>(request: IDBRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  function transactionDone(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  }

function normalizePullRecord(raw: unknown): {
    entity_type: string;
    entity_id: string;
    revision: string;
    key_id: number;
    blob: string;
    commit_seq: string;
    soft_deleted: boolean;
    hard_deleted: boolean;
    originator_device_id: string;
  } | null {
    if (raw === null || raw === undefined || typeof raw !== "object") {
      return null;
    }
    const row = raw as Record<string, unknown>;
    if (
      typeof row.entity_type !== "string" ||
      typeof row.entity_id !== "string" ||
      typeof row.revision !== "string" ||
      typeof row.key_id !== "number" ||
      typeof row.blob !== "string" ||
      typeof row.commit_seq !== "string" ||
      typeof row.originator_device_id !== "string"
    ) {
      return null;
    }
    return {
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      revision: row.revision,
      key_id: row.key_id,
      blob: row.blob,
      commit_seq: row.commit_seq,
      soft_deleted: !!row.soft_deleted,
      hard_deleted: !!row.hard_deleted,
      originator_device_id: row.originator_device_id,
    };
  }

  function sanitizeBlobRow(row: Partial<EncryptedBlobRow>): EncryptedBlobRow {
    const key = row.key ?? "";
    if (!key) {
      throw new WebCacheError("E_WEB_CACHE_SCHEMA_DRIFT", "blob row missing key");
    }
    const [entityType, entityId] = key.split("::");
    const safeEntityType = row.entityType ?? entityType ?? "productivity.todo";
    const safeEntityId = row.entityId ?? entityId ?? "";
    if (!safeEntityId) {
      throw new WebCacheError("E_WEB_CACHE_SCHEMA_DRIFT", "blob row missing entityId");
    }
    return {
      key,
      entityType: safeEntityType,
      entityId: safeEntityId,
      revision: row.revision ?? "0",
      keyId: row.keyId ?? 0,
      encryptionDeviceId: row.encryptionDeviceId ?? "0",
      commitSeq: row.commitSeq ?? "0",
      hardDeleted: !!row.hardDeleted,
      blobBase64: row.blobBase64 ?? "",
      blobSize: row.blobBase64 ? row.blobBase64.length : 0,
    };
  }

  function sanitizeIndexRow(row: Partial<EntityIndexRow>): EntityIndexRow {
    return {
      key: row.key ?? "",
      entityType: row.entityType ?? "productivity.todo",
      entityId: row.entityId ?? "",
      revision: row.revision ?? "0",
      commitSeq: row.commitSeq ?? "0",
      hardDeleted: !!row.hardDeleted,
      updatedAt: row.updatedAt ?? nowIso(),
      schemaVersion: row.schemaVersion ?? schemaVersion,
      syncScope: row.syncScope ?? "account-sync",
    };
  }

  function sanitizeSortRow(row: Partial<EntitySortKeyRow>): EntitySortKeyRow {
    return {
      key: row.key ?? "",
      entityType: row.entityType ?? "productivity.todo",
      entityId: row.entityId ?? "",
      revision: row.revision ?? "0",
      encryptedSortPayload: row.encryptedSortPayload ?? "",
      keyId: row.keyId ?? 0,
      encryptionDeviceId: row.encryptionDeviceId ?? "0",
      updatedAt: row.updatedAt ?? nowIso(),
    };
  }

  function sanitizeDeadLetterRow(
    row: Partial<DeadLetterMutationRow>,
  ): DeadLetterMutationRow {
    return {
      mutationId: row.mutationId ?? "",
      entityType: row.entityType ?? "productivity.todo",
      entityId: row.entityId ?? "",
      baseRevision: row.baseRevision ?? null,
      proposedRevision: row.proposedRevision ?? "0",
      encryptedPayload: row.encryptedPayload ?? "",
      queuedAt: row.queuedAt ?? nowIso(),
      softDelete: !!row.softDelete,
      hardDelete: !!row.hardDelete,
      failureCode: row.failureCode ?? "unknown",
      failedAt: row.failedAt ?? nowIso(),
    };
  }

  function createSearchWorker(config: {
    getIndexKeys: () => string[];
    getRecordForSearch: (id: string) => Promise<string | undefined>;
  }): WebCacheSearchWorker {
    let status: WebCacheSearchWorkerStatus = "empty";
    const tokenMap = new Map<string, string[]>();

    return {
      async rebuildFromEncryptedCache() {
        if (isLocked) {
          throw new WebCacheError(
            "E_WEB_CACHE_LOCKED",
            "cache must be unlocked before rebuild",
          );
        }
        status = "building";
        tokenMap.clear();
        for (const id of config.getIndexKeys()) {
          const text = await config.getRecordForSearch(id);
          if (!text) {
            continue;
          }
          const tokens = String(text)
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);
          tokenMap.set(id, tokens);
        }
        status = tokenMap.size > 0 ? "ready" : "empty";
      },

      async clear() {
        tokenMap.clear();
        status = "empty";
      },

      async status() {
        return status;
      },

      async search(query: string) {
        const normalized = String(query ?? "")
          .trim()
          .toLowerCase();
        if (!normalized || status !== "ready") {
          return [];
        }
        const queryTokens = normalized.split(/\s+/).filter(Boolean);
        const results = new Set<string>();
        for (const [id, tokens] of tokenMap) {
          const match = queryTokens.every((q) =>
            tokens.some((token) => token.includes(q) || q.includes(token)),
          );
          if (match) {
            results.add(id);
          }
        }
        return [...results];
      },
    };
  }
}

function toPushRecord<T extends RepoRecord>(
  mutation: PendingMutation<T>,
  deviceId: string,
): {
  entity_type: string;
  entity_id: string;
  mutation_id: string;
  base_revision: string | null;
  proposed_revision: string;
  originator_device_id: string;
  blob: string;
  client_updated_at: number;
  soft_delete: boolean;
  hard_delete: boolean;
} {
  return {
    entity_type: mutation.entityType,
    entity_id: mutation.entityId,
    mutation_id: mutation.mutationId,
    base_revision: mutation.baseRevision,
    proposed_revision: mutation.proposedRevision,
    originator_device_id: deviceId,
    blob: mutation.blobBase64,
    client_updated_at: mutation.clientUpdatedAt,
    soft_delete: mutation.softDelete,
    hard_delete: mutation.hardDelete,
  };
}

function normalizePullLimit(limit?: number): number {
  if (limit === undefined) {
    return 200;
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new SyncBlobError(
      "E_SYNC_BLOB_PROTOCOL",
      "pull limit must be >= 1 integer",
    );
  }
  return limit;
}

function maxNumericString(left: string, right: string): string {
  try {
    return BigInt(left) >= BigInt(right) ? left : right;
  } catch {
    return left;
  }
}

async function canRetry(
  attempt: number,
  error: SyncBlobError,
  response: Response,
  retry: { maxAttempts: number; baseDelayMs: number; maxDelayMs: number; jitterRatio?: number },
  sleepMs: (ms: number) => Promise<void>,
): Promise<boolean> {
  if (attempt >= retry.maxAttempts) {
    return false;
  }

  if (
    error.code !== "E_SYNC_BLOB_RATE_LIMITED" &&
    error.code !== "E_SYNC_BLOB_CONFLICT"
  ) {
    return false;
  }

  const retryAfterMs = parseRetryAfterMs(response.headers.get("Retry-After"));
  const delayMs = retryAfterMs ?? computeBackoffDelay(attempt, retry);
  await sleepMs(delayMs);
  return true;
}

function mergeRetryPolicy(input?: {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio?: number;
}): {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio?: number;
} {
  if (!input) {
    return {
      maxAttempts: 3,
      baseDelayMs: 150,
      maxDelayMs: 1500,
      jitterRatio: 0.2,
    };
  }

  return {
    maxAttempts: input.maxAttempts,
    baseDelayMs: input.baseDelayMs,
    maxDelayMs: input.maxDelayMs,
    jitterRatio: input.jitterRatio ?? 0.2,
  };
}

function parseRetryAfterMs(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  const dateMs = Date.parse(raw);
  if (Number.isFinite(dateMs)) {
    const delta = dateMs - Date.now();
    return Math.max(0, delta);
  }
  return null;
}

function computeBackoffDelay(
  attempt: number,
  retry: { baseDelayMs: number; maxDelayMs: number; jitterRatio?: number },
): number {
  const unclamped = retry.baseDelayMs * 2 ** (attempt - 1);
  const clamped = Math.min(unclamped, retry.maxDelayMs);
  const jitterRatio = retry.jitterRatio ?? 0;
  if (jitterRatio <= 0) {
    return clamped;
  }
  const jitter = clamped * jitterRatio;
  const offset = Math.random() * jitter * 2 - jitter;
  return Math.max(0, Math.round(clamped + offset));
}

function nextRevision(baseRevision: string | null): string {
  if (baseRevision === null) {
    return "1";
  }
  let base: bigint;
  try {
    base = BigInt(baseRevision);
  } catch {
    throw new SyncBlobError(
      "E_SYNC_BLOB_PROTOCOL",
      `invalid base revision: ${baseRevision}`,
    );
  }
  return (base + 1n).toString();
}

async function toSyncError(response: Response): Promise<SyncBlobError> {
  const status = response.status;
  const body = await safeReadJson(response);

  const code = typeof body?.code === "string" ? body.code : undefined;
  const message =
    typeof body?.message === "string"
      ? body.message
      : `sync request failed with status ${status}`;

  if (status === 401) {
    return new SyncBlobError("E_SYNC_BLOB_AUTH", message, body);
  }

  if (status === 403) {
    return new SyncBlobError("E_SYNC_BLOB_DEVICE_REVOKED", message, body);
  }

  if (status === 409) {
    return new SyncBlobError("E_SYNC_BLOB_CONFLICT", message, body);
  }

  if (status === 429) {
    return new SyncBlobError("E_SYNC_BLOB_RATE_LIMITED", message, body);
  }

  if (status === 426 || (status === 400 && code === "version_required")) {
    return new SyncBlobError("E_SYNC_BLOB_UPGRADE_REQUIRED", message, body);
  }

  return new SyncBlobError(
    "E_SYNC_BLOB_PROTOCOL",
    `${message} (status ${status})`,
    body,
  );
}

function withSyncProtocolHeader(extraHeaders?: Record<string, string>): Headers {
  const headers = new Headers(extraHeaders);
  headers.set("Accept-Version", "sync.protocol=1");
  return headers;
}

async function safeReadJson(response: Response): Promise<
  Record<string, unknown> | undefined
> {
  const raw = await response.text();
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function toSyncUrl(baseUrl: string | undefined, path: string): string {
  if (!baseUrl) {
    return path;
  }
  return new URL(path, baseUrl).toString();
}

function encodeBase64(input: string): string {
  const bufferCtor = (globalThis as { Buffer?: { from: (...args: unknown[]) => unknown } })
    .Buffer;
  if (bufferCtor) {
    const encoded = bufferCtor.from(input, "utf8") as {
      toString: (encoding: "base64" | "utf8") => string;
    };
    return encoded.toString("base64");
  }
  if (typeof btoa === "undefined") {
    throw new Error("E3006: runtime lacks base64 encoder");
  }
  return btoa(input);
}

function parseBase64(input: string): string {
  const bufferCtor = (globalThis as { Buffer?: { from: (...args: unknown[]) => unknown } })
    .Buffer;
  if (bufferCtor) {
    const decoded = bufferCtor.from(input, "base64") as { toString: (encoding: string) => string };
    return decoded.toString("utf8");
  }
  if (typeof atob === "undefined") {
    throw new Error("E3006: runtime lacks base64 decoder");
  }
  return atob(input);
}

function defaultSortPayloadCrypto(): SortPayloadCrypto {
  return {
    encrypt: async ({ plaintext }) => encodeBase64(plaintext),
    decrypt: async ({ ciphertext }) => parseBase64(ciphertext),
  };
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function defaultMutationId(): string {
  const cryptoObject = globalThis.crypto as
    | (Crypto & { randomUUID?: () => string })
    | undefined;
  if (cryptoObject?.randomUUID) {
    return cryptoObject.randomUUID();
  }
  return `mutation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function tryParseEnvelopeHeader(blobBase64: string): {
  keyId: number;
  encryptionDeviceId: string;
} | undefined {
  try {
    const bytes = decodeBase64(blobBase64);
    if (bytes.length < 18 || bytes[0] !== 1 || bytes[1] !== 1) {
      return undefined;
    }
    const keyId =
      bytes[2]! |
      (bytes[3]! << 8) |
      (bytes[4]! << 16) |
      (bytes[5]! << 24);
    let encryptionDeviceId = 0n;
    for (let index = 0; index < 8; index += 1) {
      encryptionDeviceId |= BigInt(bytes[6 + index]!) << BigInt(index * 8);
    }
    return {
      keyId,
      encryptionDeviceId: encryptionDeviceId.toString(),
    };
  } catch {
    return undefined;
  }
}

function decodeBase64(input: string): Uint8Array {
  const bufferCtor = (
    globalThis as typeof globalThis & {
      Buffer?: { from(input: string, encoding: "base64"): Uint8Array };
    }
  ).Buffer;
  if (bufferCtor) {
    return Uint8Array.from(bufferCtor.from(input, "base64"));
  }
  if (typeof atob === "undefined") {
    throw new Error("E3006: runtime lacks base64 decoder");
  }
  const binary = atob(input);
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    out[index] = binary.charCodeAt(index);
  }
  return out;
}

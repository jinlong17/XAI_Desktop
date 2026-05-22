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
  Repo,
  RepoListQuery,
  RepoMetadata,
  RepoRecord,
  RepoTransaction,
} from "./types";

export const SYNC_BLOB_ACCEPT_VERSION = "sync.protocol=1";
export const SYNC_PROTOCOL_HEADER = SYNC_BLOB_ACCEPT_VERSION;

export type SyncBlobErrorCode =
  | "E_SYNC_BLOB_AUTH"
  | "E_SYNC_BLOB_DEVICE_REVOKED"
  | "E_SYNC_BLOB_CONFLICT"
  | "E_SYNC_BLOB_UPGRADE_REQUIRED"
  | "E_SYNC_BLOB_RATE_LIMITED"
  | "E_SYNC_BLOB_PROTOCOL"
  | "E_SYNC_BLOB_CRYPTO"
  | "E_SYNC_BLOB_UNSUPPORTED";

export class SyncBlobError extends Error {
  constructor(
    readonly code: SyncBlobErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(`${code}: ${message}`);
    this.name = "SyncBlobError";
  }
}

export interface SyncBlobFetch {
  (input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

export interface SyncBlobCryptoEncryptInput<T extends RepoRecord> {
  record: T;
  accountId: string;
  keyId: number;
  proposedRevision: string;
  encryptionDeviceId: string;
  deletedFlag: boolean;
}

export interface SyncBlobCryptoDecryptInput {
  blobBase64: string;
  entityType: string;
  entityId: string;
  revision: string;
  keyId: number;
  encryptionDeviceId: string;
  deletedFlag: boolean;
}

export interface SyncBlobCryptoAdapter<T extends RepoRecord> {
  encryptRecord(
    input: SyncBlobCryptoEncryptInput<T>,
  ): Promise<{ blobBase64: string }>;
  decryptRecord(input: SyncBlobCryptoDecryptInput): Promise<T>;
  getCurrentKeyId(): number;
}

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterRatio?: number;
}

export interface CreateSyncBlobRepoOptions<T extends RepoRecord> {
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
}

export type SyncBlobRepoOptions<T extends RepoRecord> =
  CreateSyncBlobRepoOptions<T>;

export interface PullOptions {
  limit?: number;
}

export interface SyncBlobDriverState {
  lastCommitSeq: string;
  pendingMutationCount: number;
  mirroredRecordCount: number;
}

export interface SyncBlobRepo<T extends RepoRecord> extends Repo<T> {
  pull(options?: PullOptions): Promise<void>;
  pushPending(): Promise<void>;
  syncState(): SyncBlobDriverState;
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

interface PullRecord {
  entity_type: string;
  entity_id: string;
  revision: string;
  key_id: number;
  blob: string;
  commit_seq: string;
  soft_deleted: boolean;
  hard_deleted: boolean;
  originator_device_id: string;
}

interface PullResponse {
  records: PullRecord[];
  next_commit_seq: string;
  current_account_commit_seq?: string;
  has_more?: boolean;
}

interface PushRecord {
  entity_type: string;
  entity_id: string;
  mutation_id: string;
  base_revision: string | null;
  proposed_revision: string;
  blob: string;
  client_updated_at: number;
  soft_delete: boolean;
  hard_delete: boolean;
}

const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 150,
  maxDelayMs: 1500,
  jitterRatio: 0.2,
};

export function createSyncBlobRepo<T extends RepoRecord>(
  options: CreateSyncBlobRepoOptions<T>,
): SyncBlobRepo<T> {
  if (!options.namespace) {
    throw new Error("E3005: sync-blob repo requires a namespace");
  }
  if (!options.accountId) {
    throw new Error("E3005: sync-blob repo requires an accountId");
  }
  if (!options.deviceId) {
    throw new Error("E3005: sync-blob repo requires a deviceId");
  }

  const mirror = new Map<string, T>();
  const mirrorState = new Map<string, MirrorState>();
  const driverName = options.driverName ?? "sync-blob";
  const schemaVersion = options.schemaVersion ?? 1;
  const nowIso = options.nowIso ?? (() => new Date().toISOString());
  const nowMs = options.nowMs ?? Date.now;
  const newMutationId = options.newMutationId ?? defaultMutationId;
  const retry = mergeRetryPolicy(options.retry);
  const sleepMs = options.sleepMs ?? defaultSleep;
  const encryptionDeviceId = options.encryptionDeviceId ?? options.deviceId;
  let migrationVersion = options.migrationVersion ?? 0;
  let lastCommitSeq = "0";
  const migrations: MigrationResult[] = [];
  let pending: PendingMutation<T>[] = [];

  async function metadata(): Promise<RepoMetadata> {
    return {
      driver: driverName,
      namespace: options.namespace,
      schemaVersion,
      migrationVersion,
      recordCount: mirror.size,
      migrations: [...migrations],
    };
  }

  async function get(id: string): Promise<T | undefined> {
    return mirror.get(id);
  }

  async function list(query?: RepoListQuery<T>): Promise<T[]> {
    return applyRepoListQuery(mirror.values(), query);
  }

  async function listByIndex<K extends Extract<keyof T, string>>(
    field: K,
    value: T[K],
    query?: RepoListQuery<T>,
  ): Promise<T[]> {
    return applyRepoIndexQuery(mirror.values(), field, value, query);
  }

  function syncState(): SyncBlobDriverState {
    return {
      lastCommitSeq,
      pendingMutationCount: pending.length,
      mirroredRecordCount: mirror.size,
    };
  }

  async function pushPending(): Promise<void> {
    if (pending.length === 0) {
      return;
    }

    const toPush = pending;
    pending = [];

    try {
      await pushBatchWithRetry(toPush);
      commitMutationState(toPush);
    } catch (error) {
      pending = [...toPush, ...pending];
      throw error;
    }
  }

  async function put(record: T): Promise<void> {
    assertRepoRecord(record);
    const snapshot = snapshotState();

    try {
      const mutation = await buildPutMutation(record);
      mirror.set(record.id, record);
      pending.push(mutation);
      await pushPending();
    } catch (error) {
      restoreSnapshot(snapshot);
      throw error;
    }
  }

  async function remove(id: string): Promise<void> {
    const current = mirror.get(id);
    if (!current) {
      return;
    }

    const snapshot = snapshotState();
    try {
      const mutation = await buildDeleteMutation(current);
      mirror.delete(id);
      pending.push(mutation);
      await pushPending();
    } catch (error) {
      restoreSnapshot(snapshot);
      throw error;
    }
  }

  async function transaction<R>(
    fn: (tx: RepoTransaction<T>) => Promise<R>,
  ): Promise<R> {
    const snapshot = snapshotState();
    const stagedMirror = new Map(mirror);
    const stagedMirrorState = new Map(mirrorState);
    const stagedPending = [...pending];

    const tx: RepoTransaction<T> = {
      async get(id: string): Promise<T | undefined> {
        return stagedMirror.get(id);
      },

      async put(record: T): Promise<void> {
        assertRepoRecord(record);
        stagedMirror.set(record.id, record);
        const mutation = await buildPutMutation(record, stagedMirrorState);
        stagedPending.push(mutation);
      },

      async delete(id: string): Promise<void> {
        const current = stagedMirror.get(id);
        if (!current) {
          return;
        }

        stagedMirror.delete(id);
        const mutation = await buildDeleteMutation(current, stagedMirrorState);
        stagedPending.push(mutation);
      },

      async list(query?: RepoListQuery<T>): Promise<T[]> {
        return applyRepoListQuery(stagedMirror.values(), query);
      },

      async listByIndex<K extends Extract<keyof T, string>>(
        field: K,
        value: T[K],
        query?: RepoListQuery<T>,
      ): Promise<T[]> {
        return applyRepoIndexQuery(stagedMirror.values(), field, value, query);
      },

      metadata,
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
      pending = stagedPending;

      await pushPending();
      return result;
    } catch (error) {
      restoreSnapshot(snapshot);
      throw error;
    }
  }

  async function migrate(plan: MigrationPlan<T>): Promise<MigrationResult> {
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

    const payload = (await response.json()) as PullResponse;
    if (
      !Array.isArray(payload.records) ||
      typeof payload.next_commit_seq !== "string"
    ) {
      throw new SyncBlobError(
        "E_SYNC_BLOB_PROTOCOL",
        "pull response is missing required fields",
      );
    }

    for (const row of payload.records) {
      if (row.originator_device_id === options.deviceId) {
        continue;
      }

      if (row.hard_deleted) {
        mirror.delete(row.entity_id);
        mirrorState.delete(row.entity_id);
      } else {
        const envelope = tryParseEnvelopeHeader(row.blob);
        let decrypted: T;
        try {
          decrypted = await options.crypto.decryptRecord({
            blobBase64: row.blob,
            entityType: row.entity_type,
            entityId: row.entity_id,
            revision: row.revision,
            keyId: envelope?.keyId ?? row.key_id,
            encryptionDeviceId:
              envelope?.encryptionDeviceId ?? row.originator_device_id,
            deletedFlag: row.soft_deleted || row.hard_deleted,
          });
        } catch (error) {
          throw new SyncBlobError(
            "E_SYNC_BLOB_CRYPTO",
            "failed to decrypt /sync/pull record",
            error,
          );
        }

        assertRepoRecord(decrypted);
        mirror.set(decrypted.id, decrypted);
        mirrorState.set(decrypted.id, {
          revision: row.revision,
          commitSeq: row.commit_seq,
        });
      }

      lastCommitSeq = maxNumericString(lastCommitSeq, row.commit_seq);
    }

    if (payload.current_account_commit_seq) {
      lastCommitSeq = maxNumericString(
        lastCommitSeq,
        payload.current_account_commit_seq,
      );
    }
    lastCommitSeq = maxNumericString(lastCommitSeq, payload.next_commit_seq);
  }

  async function buildPutMutation(
    record: T,
    stateView: Map<string, MirrorState> = mirrorState,
  ): Promise<PendingMutation<T>> {
    const current = stateView.get(record.id);
    const proposedRevision = nextRevision(current?.revision ?? null);
    const keyId = options.crypto.getCurrentKeyId();

    let blobBase64: string;
    try {
      blobBase64 = (
        await options.crypto.encryptRecord({
          record,
          accountId: options.accountId,
          keyId,
          proposedRevision,
          encryptionDeviceId,
          deletedFlag: false,
        })
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
    const current = stateView.get(record.id);
    const proposedRevision = nextRevision(current?.revision ?? null);
    const keyId = options.crypto.getCurrentKeyId();

    let blobBase64: string;
    try {
      blobBase64 = (
        await options.crypto.encryptRecord({
          record,
          accountId: options.accountId,
          keyId,
          proposedRevision,
          encryptionDeviceId,
          deletedFlag: true,
        })
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
            records: batch.map(toPushRecord),
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
        sleepMs,
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
        refreshed.push(nextMutation);
        continue;
      }

      const record = mutation.optimisticRecord ?? mirror.get(mutation.entityId);
      if (!record) {
        throw new SyncBlobError(
          "E_SYNC_BLOB_CONFLICT",
          `conflict refresh missing local record ${mutation.entityId}`,
        );
      }

      const nextMutation = await buildPutMutation(record);
      nextMutation.mutationId = mutation.mutationId;
      refreshed.push(nextMutation);
    }

    return refreshed;
  }

  function commitMutationState(batch: PendingMutation<T>[]): void {
    for (const mutation of batch) {
      if (mutation.hardDelete) {
        mirror.delete(mutation.entityId);
        mirrorState.delete(mutation.entityId);
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
      lastCommitSeq,
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

    pending = [...snapshot.pending];
    lastCommitSeq = snapshot.lastCommitSeq;
  }

  return {
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
    syncState,
  };
}

interface RepoSnapshot<T extends RepoRecord> {
  mirror: Map<string, T>;
  mirrorState: Map<string, MirrorState>;
  pending: PendingMutation<T>[];
  lastCommitSeq: string;
}

async function canRetry(
  attempt: number,
  error: SyncBlobError,
  response: Response,
  retry: RetryPolicy,
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

function computeBackoffDelay(attempt: number, retry: RetryPolicy): number {
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

function mergeRetryPolicy(input?: RetryPolicy): RetryPolicy {
  if (!input) {
    return DEFAULT_RETRY_POLICY;
  }

  return {
    maxAttempts: input.maxAttempts,
    baseDelayMs: input.baseDelayMs,
    maxDelayMs: input.maxDelayMs,
    jitterRatio: input.jitterRatio ?? DEFAULT_RETRY_POLICY.jitterRatio,
  };
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withSyncProtocolHeader(
  extraHeaders?: Record<string, string>,
): Headers {
  const headers = new Headers(extraHeaders);
  headers.set("Accept-Version", SYNC_PROTOCOL_HEADER);
  return headers;
}

function toSyncUrl(baseUrl: string | undefined, path: string): string {
  if (!baseUrl) {
    return path;
  }
  return new URL(path, baseUrl).toString();
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

async function safeReadJson(
  response: Response,
): Promise<Record<string, unknown> | undefined> {
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

function toPushRecord<T extends RepoRecord>(
  mutation: PendingMutation<T>,
): PushRecord {
  return {
    entity_type: mutation.entityType,
    entity_id: mutation.entityId,
    mutation_id: mutation.mutationId,
    base_revision: mutation.baseRevision,
    proposed_revision: mutation.proposedRevision,
    blob: mutation.blobBase64,
    client_updated_at: mutation.clientUpdatedAt,
    soft_delete: mutation.softDelete,
    hard_delete: mutation.hardDelete,
  };
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

function maxNumericString(left: string, right: string): string {
  try {
    return BigInt(left) >= BigInt(right) ? left : right;
  } catch {
    return left;
  }
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

  const binary = atob(input);
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    out[index] = binary.charCodeAt(index);
  }
  return out;
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

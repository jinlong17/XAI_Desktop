export type SyncPlaintext = Uint8Array;

export interface SyncEntityRef {
  entityType: string;
  entityId: string;
}

export interface QueueMutationInput extends SyncEntityRef {
  plaintext: SyncPlaintext;
  clientUpdatedAtMs?: number;
  mutationId?: string;
}

export interface OutboxEntry extends SyncEntityRef {
  plaintext: SyncPlaintext;
  mutationId: string;
  clientUpdatedAtMs: number;
}

export interface SyncOutbox {
  enqueue(input: QueueMutationInput): OutboxEntry;
  list(): OutboxEntry[];
  remove(mutationIds: readonly string[]): void;
  clear(): void;
}

export interface EntityRevisionReader {
  maxSeenRevision(entity: SyncEntityRef): Promise<bigint>;
}

export interface SyncEncryptInput extends SyncEntityRef {
  proposedRevision: bigint;
  plaintext: SyncPlaintext;
}

export interface SyncCryptoClient {
  encryptFor(input: SyncEncryptInput): Promise<Uint8Array>;
}

export interface PushRecordRequest extends SyncEntityRef {
  mutationId: string;
  baseRevision: string;
  proposedRevision: string;
  clientUpdatedAtMs: number;
  envelope: number[];
}

export interface PushBatchRequest {
  records: PushRecordRequest[];
}

export type PushRecordResult =
  | {
      mutationId: string;
      status: 'ok' | 'duplicate';
      appliedRevision?: string;
      commitSeq?: string;
    }
  | {
      mutationId: string;
      status: 'revision_mismatch';
      currentRevision: string;
    }
  | {
      mutationId: string;
      status: 'causal_dep_unsatisfied' | 'error';
      errorCode: string;
    };

export interface PushBatchResponse {
  status: 200 | 207 | 409;
  results: PushRecordResult[];
}

export interface SyncPushTransport {
  pushBatch(request: PushBatchRequest): Promise<PushBatchResponse>;
}

export interface PullRecord extends SyncEntityRef {
  revision: string;
  commitSeq: string;
  blobHash: string;
  keyId: number;
  envelope: number[];
}

export interface PullBatchRequest {
  sinceCommitSeq: string;
  limit: number;
}

export interface PullBatchResponse {
  currentAccountCommitSeq: string;
  records: PullRecord[];
}

export interface SyncPullTransport {
  pullBatch(request: PullBatchRequest): Promise<PullBatchResponse>;
}

export interface EntityState extends SyncEntityRef {
  maxSeenRevision: bigint;
  lastBlobHash: string;
  lastCommitSeq: bigint;
  lastKeyId: number;
}

export interface EntityStateStore {
  get(entity: SyncEntityRef): Promise<EntityState | undefined>;
  put(state: EntityState): Promise<void>;
}

export type PullApplyKind = 'applied' | 'reencrypt';

export interface PullRecordApplier {
  apply(record: PullRecord, kind: PullApplyKind): Promise<void>;
}

export type PullRecordDecision =
  | { kind: 'applied'; record: PullRecord }
  | { kind: 'idempotent'; record: PullRecord }
  | { kind: 'reencrypt'; record: PullRecord };

export interface ApplyServerRecordsDeps {
  entityStates: EntityStateStore;
  applier: PullRecordApplier;
}

export interface ApplyServerRecordsInput {
  records: readonly PullRecord[];
  currentAccountCommitSeq: string;
  lastSeenAccountCommitSeq: string;
}

export interface ApplyServerRecordsResult {
  currentAccountCommitSeq: bigint;
  decisions: PullRecordDecision[];
}

export interface PullBatchDeps extends ApplyServerRecordsDeps {
  transport: SyncPullTransport;
}

export interface PullBatchInput {
  sinceCommitSeq: bigint;
  limit?: number;
  lastSeenAccountCommitSeq: bigint;
}

export type SyncPushFetch = (
  input: string,
  init: {
    method: 'POST';
    headers: Record<string, string>;
    body: string;
  },
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<PushBatchResponse>;
}>;

export interface SyncPushHttpTransportOptions {
  accessToken: string;
  accountId?: string;
  deviceId?: string;
  endpoint?: string;
  fetch?: SyncPushFetch;
  syncVersion?: string;
}

export type SyncPullFetch = (
  input: string,
  init: {
    method: 'GET';
    headers: Record<string, string>;
  },
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export interface SyncPullHttpTransportOptions {
  accessToken: string;
  accountId?: string;
  deviceId?: string;
  endpoint?: string;
  fetch?: SyncPullFetch;
  syncVersion?: string;
}

export interface SyncNonceLease {
  accountId: string;
  deviceId: string;
  keyId: number;
  encryptionDeviceId: bigint;
  leaseStart: bigint;
  leaseEnd: bigint;
  expiresAtMs: number;
}

export interface SyncProgressCheckpoint {
  accountId: string;
  deviceId: string;
  lastAckCommitSeq: bigint;
  updatedAtMs: number;
}

export interface SyncNonceLeaseTransport {
  requestLease(input: {
    accountId: string;
    deviceId: string;
    keyId: number;
    count: number;
  }): Promise<SyncNonceLease>;
  renewLease(lease: SyncNonceLease): Promise<SyncNonceLease>;
  releaseLease(lease: SyncNonceLease): Promise<void>;
  persistProgress(progress: SyncProgressCheckpoint): Promise<void>;
}

export interface SyncNonceLeaseManager {
  request(input: {
    accountId: string;
    deviceId: string;
    keyId: number;
    count: number;
  }): Promise<SyncNonceLease>;
  renew(): Promise<SyncNonceLease>;
  release(): Promise<void>;
  persistProgress(lastAckCommitSeq: bigint): Promise<SyncProgressCheckpoint>;
  current(): SyncNonceLease | undefined;
}

export interface PushBatchDeps {
  crypto: SyncCryptoClient;
  revisions: EntityRevisionReader;
  transport: SyncPushTransport;
}

export interface PushBatchInput {
  entries: readonly OutboxEntry[];
}

export class SyncPushRevisionMismatchError extends Error {
  readonly code = 'E3015';

  constructor(readonly result: Extract<PushRecordResult, { status: 'revision_mismatch' }>) {
    super(
      `E3015: revision_mismatch for mutation ${result.mutationId}; server revision ${result.currentRevision}`,
    );
    this.name = 'SyncPushRevisionMismatchError';
  }
}

export class SyncRevisionRollbackError extends Error {
  readonly code = 'E3015';

  constructor(readonly record: PullRecord, readonly localState: EntityState) {
    super(
      `E3015: revision rollback rejected for ${record.entityType}/${record.entityId}`,
    );
    this.name = 'SyncRevisionRollbackError';
  }
}

export class SyncAccountRollbackError extends Error {
  readonly code = 'E3024';

  constructor(readonly currentAccountCommitSeq: bigint, readonly lastSeenAccountCommitSeq: bigint) {
    super(
      `E3024: account_commit_seq rollback; current=${currentAccountCommitSeq} last_seen=${lastSeenAccountCommitSeq}`,
    );
    this.name = 'SyncAccountRollbackError';
  }
}

export function createSyncOutbox(options: {
  nowMs?: () => number;
  generateMutationId?: () => string;
} = {}): SyncOutbox {
  const nowMs = options.nowMs ?? Date.now;
  const generateMutationId = options.generateMutationId ?? createUuidV7;
  const entries = new Map<string, OutboxEntry>();

  return {
    enqueue(input: QueueMutationInput): OutboxEntry {
      const entry: OutboxEntry = {
        entityType: input.entityType,
        entityId: input.entityId,
        plaintext: new Uint8Array(input.plaintext),
        mutationId: input.mutationId ?? generateMutationId(),
        clientUpdatedAtMs: input.clientUpdatedAtMs ?? nowMs(),
      };
      entries.set(entityKey(input), entry);
      return entry;
    },

    list(): OutboxEntry[] {
      return [...entries.values()].map((entry) => ({
        ...entry,
        plaintext: new Uint8Array(entry.plaintext),
      }));
    },

    remove(mutationIds: readonly string[]): void {
      const removeSet = new Set(mutationIds);
      for (const [key, entry] of entries) {
        if (removeSet.has(entry.mutationId)) {
          entries.delete(key);
        }
      }
    },

    clear(): void {
      entries.clear();
    },
  };
}

export async function pushBatch(
  deps: PushBatchDeps,
  input: PushBatchInput,
): Promise<PushBatchResponse> {
  const records: PushRecordRequest[] = [];

  for (const entry of input.entries) {
    const baseRevision = await deps.revisions.maxSeenRevision(entry);
    const proposedRevision = baseRevision + 1n;
    const envelope = await deps.crypto.encryptFor({
      entityType: entry.entityType,
      entityId: entry.entityId,
      proposedRevision,
      plaintext: entry.plaintext,
    });

    records.push({
      entityType: entry.entityType,
      entityId: entry.entityId,
      mutationId: entry.mutationId,
      baseRevision: baseRevision.toString(),
      proposedRevision: proposedRevision.toString(),
      clientUpdatedAtMs: entry.clientUpdatedAtMs,
      envelope: Array.from(envelope),
    });
  }

  const response = await deps.transport.pushBatch({ records });
  const mismatch = response.results.find(
    (result): result is Extract<PushRecordResult, { status: 'revision_mismatch' }> =>
      result.status === 'revision_mismatch',
  );
  if (mismatch) {
    throw new SyncPushRevisionMismatchError(mismatch);
  }
  return response;
}

export function createSyncPushHttpTransport(
  options: SyncPushHttpTransportOptions,
): SyncPushTransport {
  const endpoint = options.endpoint ?? '/sync/push';
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error('E3005: fetch is required for sync push transport');
  }
  if ((options.accountId && !options.deviceId) || (!options.accountId && options.deviceId)) {
    throw new Error('E3005: accountId and deviceId must be provided together');
  }

  return {
    async pushBatch(request: PushBatchRequest): Promise<PushBatchResponse> {
      const headers: Record<string, string> = {
        authorization: `Bearer ${options.accessToken}`,
        'content-type': 'application/json',
        'accept-version': options.syncVersion ?? 'sync.protocol=1',
      };
      if (options.deviceId) {
        headers['x-device-id'] = options.deviceId;
      }
      if (options.accountId) {
        headers['x-account-id'] = options.accountId;
      }

      const response = await fetchImpl(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(toHttpPushRequest(request, options)),
      });
      if (!response.ok && response.status !== 207 && response.status !== 409) {
        throw new Error(`E3005: sync push failed with HTTP ${response.status}`);
      }
      return response.json();
    },
  };
}

function toHttpPushRequest(
  request: PushBatchRequest,
  options: SyncPushHttpTransportOptions,
): PushBatchRequest | {
  accountId: string;
  records: Array<PushRecordRequest & { originatorDeviceId: string }>;
} {
  const { accountId, deviceId } = options;
  if (!accountId || !deviceId) {
    return request;
  }

  return {
    accountId,
    records: request.records.map((record) => ({
      ...record,
      originatorDeviceId: deviceId,
    })),
  };
}

export function createSyncPullHttpTransport(
  options: SyncPullHttpTransportOptions,
): SyncPullTransport {
  const endpoint = options.endpoint ?? '/sync/pull';
  const fetchImpl = options.fetch ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error('E3005: fetch is required for sync pull transport');
  }

  return {
    async pullBatch(request: PullBatchRequest): Promise<PullBatchResponse> {
      const url = new URL(endpoint, 'https://xai.local');
      url.searchParams.set('since_commit_seq', request.sinceCommitSeq);
      url.searchParams.set('limit', String(request.limit));
      const path = `${url.pathname}${url.search}`;
      const headers: Record<string, string> = {
        authorization: `Bearer ${options.accessToken}`,
        'accept-version': options.syncVersion ?? 'sync.protocol=1',
      };
      if (options.accountId) {
        headers['x-account-id'] = options.accountId;
      }
      if (options.deviceId) {
        headers['x-device-id'] = options.deviceId;
      }
      const response = await fetchImpl(path, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        throw new Error(`E3003: sync pull failed with HTTP ${response.status}`);
      }
      return normalizePullBatchResponse(await response.json());
    },
  };
}

async function normalizePullBatchResponse(payload: unknown): Promise<PullBatchResponse> {
  if (!isRecord(payload)) {
    throw new Error('E3005: sync pull response must be an object');
  }

  const records = Array.isArray(payload.records) ? payload.records : [];
  const currentAccountCommitSeq =
    optionalString(payload.currentAccountCommitSeq) ??
    optionalString(payload.current_account_commit_seq) ??
    optionalString(payload.next_commit_seq);
  if (!currentAccountCommitSeq) {
    throw new Error('E3005: sync pull response is missing currentAccountCommitSeq');
  }

  return {
    currentAccountCommitSeq,
    records: await Promise.all(records.map((record) => normalizePullRecord(record))),
  };
}

async function normalizePullRecord(input: unknown): Promise<PullRecord> {
  if (!isRecord(input)) {
    throw new Error('E3005: sync pull record must be an object');
  }

  if (Array.isArray(input.envelope)) {
    return {
      entityType: requiredString(input.entityType, 'entityType'),
      entityId: requiredString(input.entityId, 'entityId'),
      revision: requiredString(input.revision, 'revision'),
      commitSeq: requiredString(input.commitSeq, 'commitSeq'),
      blobHash: requiredString(input.blobHash, 'blobHash'),
      keyId: requiredNumber(input.keyId, 'keyId'),
      envelope: normalizeByteArray(input.envelope, 'envelope'),
    };
  }

  const blob = requiredString(input.blob, 'blob');
  const envelope = decodeBase64Bytes(blob);
  return {
    entityType: requiredString(input.entity_type, 'entity_type'),
    entityId: requiredString(input.entity_id, 'entity_id'),
    revision: requiredString(input.revision, 'revision'),
    commitSeq: requiredString(input.commit_seq, 'commit_seq'),
    blobHash: await sha256Hex(envelope),
    keyId: requiredNumber(input.key_id, 'key_id'),
    envelope: Array.from(envelope),
  };
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function optionalString(input: unknown): string | undefined {
  return typeof input === 'string' && input.length > 0 ? input : undefined;
}

function requiredString(input: unknown, field: string): string {
  const value = optionalString(input);
  if (!value) {
    throw new Error(`E3005: sync pull record missing ${field}`);
  }
  return value;
}

function requiredNumber(input: unknown, field: string): number {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new Error(`E3005: sync pull record ${field} must be a finite number`);
  }
  return input;
}

function normalizeByteArray(input: readonly unknown[], field: string): number[] {
  return input.map((value, index) => {
    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 255
    ) {
      throw new Error(`E3005: sync pull record ${field}[${index}] must be a byte`);
    }
    return value;
  });
}

function decodeBase64Bytes(input: string): Uint8Array {
  if (typeof globalThis.atob !== 'function') {
    throw new Error('E3005: atob is required to decode sync pull blobs');
  }
  const binary = globalThis.atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const buffer = new Uint8Array(bytes.byteLength);
  buffer.set(bytes);
  const digest = await globalThis.crypto?.subtle?.digest('SHA-256', buffer.buffer);
  if (!digest) {
    throw new Error('E3005: crypto.subtle is required to hash sync pull blobs');
  }
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export function createSyncNonceLeaseManager(
  transport: SyncNonceLeaseTransport,
  options: { nowMs?: () => number } = {},
): SyncNonceLeaseManager {
  const nowMs = options.nowMs ?? Date.now;
  let currentLease: SyncNonceLease | undefined;

  return {
    async request(input) {
      const lease = await transport.requestLease(input);
      currentLease = cloneLease(lease);
      return cloneLease(lease);
    },

    async renew() {
      if (!currentLease) {
        throw new Error('E3005: cannot renew nonce lease before request');
      }
      const lease = await transport.renewLease(currentLease);
      currentLease = cloneLease(lease);
      return cloneLease(lease);
    },

    async release() {
      if (!currentLease) {
        return;
      }
      const lease = currentLease;
      currentLease = undefined;
      await transport.releaseLease(lease);
    },

    async persistProgress(lastAckCommitSeq) {
      if (!currentLease) {
        throw new Error('E3005: cannot persist sync progress without a nonce lease');
      }
      const progress: SyncProgressCheckpoint = {
        accountId: currentLease.accountId,
        deviceId: currentLease.deviceId,
        lastAckCommitSeq,
        updatedAtMs: nowMs(),
      };
      await transport.persistProgress(progress);
      return progress;
    },

    current() {
      return currentLease ? cloneLease(currentLease) : undefined;
    },
  };
}

export async function pullBatch(
  deps: PullBatchDeps,
  input: PullBatchInput,
): Promise<ApplyServerRecordsResult> {
  const response = await deps.transport.pullBatch({
    sinceCommitSeq: input.sinceCommitSeq.toString(),
    limit: input.limit ?? 500,
  });
  return applyServerRecords(deps, {
    records: response.records,
    currentAccountCommitSeq: response.currentAccountCommitSeq,
    lastSeenAccountCommitSeq: input.lastSeenAccountCommitSeq.toString(),
  });
}

export async function applyServerRecords(
  deps: ApplyServerRecordsDeps,
  input: ApplyServerRecordsInput,
): Promise<ApplyServerRecordsResult> {
  const currentAccountCommitSeq = parseBigIntString(
    input.currentAccountCommitSeq,
    'currentAccountCommitSeq',
  );
  const lastSeenAccountCommitSeq = parseBigIntString(
    input.lastSeenAccountCommitSeq,
    'lastSeenAccountCommitSeq',
  );
  if (currentAccountCommitSeq < lastSeenAccountCommitSeq) {
    throw new SyncAccountRollbackError(currentAccountCommitSeq, lastSeenAccountCommitSeq);
  }

  const decisions: PullRecordDecision[] = [];
  for (const record of input.records) {
    const decision = await classifyAndApplyRecord(deps, record);
    decisions.push(decision);
  }

  return { currentAccountCommitSeq, decisions };
}

export function createUuidV7(
  nowMs = Date.now(),
  randomBytes: (length: number) => Uint8Array = defaultRandomBytes,
): string {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0) {
    throw new Error('E3005: uuidv7 timestamp must be a non-negative safe integer');
  }

  const bytes = new Uint8Array(16);
  let timestamp = BigInt(nowMs);
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Number(timestamp & 0xffn);
    timestamp >>= 8n;
  }

  const random = randomBytes(10);
  if (random.length !== 10) {
    throw new Error('E3005: uuidv7 random source must return 10 bytes');
  }

  bytes[6] = 0x70 | (random[0]! & 0x0f);
  bytes[7] = random[1]!;
  bytes[8] = 0x80 | (random[2]! & 0x3f);
  bytes.set(random.slice(3), 9);

  return formatUuid(bytes);
}

async function classifyAndApplyRecord(
  deps: ApplyServerRecordsDeps,
  record: PullRecord,
): Promise<PullRecordDecision> {
  const revision = parseBigIntString(record.revision, 'record.revision');
  const commitSeq = parseBigIntString(record.commitSeq, 'record.commitSeq');
  const local = await deps.entityStates.get(record);

  if (!local || revision > local.maxSeenRevision) {
    await deps.applier.apply(record, 'applied');
    await deps.entityStates.put(stateFromRecord(record, revision, commitSeq));
    return { kind: 'applied', record };
  }

  if (revision === local.maxSeenRevision && record.blobHash === local.lastBlobHash) {
    return { kind: 'idempotent', record };
  }

  if (
    revision === local.maxSeenRevision &&
    record.keyId !== local.lastKeyId &&
    commitSeq > local.lastCommitSeq
  ) {
    await deps.applier.apply(record, 'reencrypt');
    await deps.entityStates.put(stateFromRecord(record, revision, commitSeq));
    return { kind: 'reencrypt', record };
  }

  if (
    revision < local.maxSeenRevision ||
    (revision === local.maxSeenRevision &&
      record.blobHash !== local.lastBlobHash &&
      commitSeq < local.lastCommitSeq)
  ) {
    throw new SyncRevisionRollbackError(record, local);
  }

  throw new SyncRevisionRollbackError(record, local);
}

function stateFromRecord(record: PullRecord, revision: bigint, commitSeq: bigint): EntityState {
  return {
    entityType: record.entityType,
    entityId: record.entityId,
    maxSeenRevision: revision,
    lastBlobHash: record.blobHash,
    lastCommitSeq: commitSeq,
    lastKeyId: record.keyId,
  };
}

function parseBigIntString(value: string, field: string): bigint {
  if (!/^(0|[1-9]\d*)$/.test(value)) {
    throw new Error(`E3005: ${field} must be a non-negative BIGINT string`);
  }
  return BigInt(value);
}

function entityKey(entity: SyncEntityRef): string {
  return `${entity.entityType}\u0000${entity.entityId}`;
}

function cloneLease(lease: SyncNonceLease): SyncNonceLease {
  return { ...lease };
}

function defaultRandomBytes(length: number): Uint8Array {
  const crypto = globalThis.crypto;
  if (!crypto?.getRandomValues) {
    throw new Error('E3005: crypto.getRandomValues is required for UUIDv7 mutation ids');
  }
  return crypto.getRandomValues(new Uint8Array(length));
}

function formatUuid(bytes: Uint8Array): string {
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20,
  )}-${hex.slice(20)}`;
}

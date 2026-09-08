export type PushRecordStatus =
  | 'ok'
  | 'revision_mismatch'
  | 'duplicate_mutation_id'
  | 'causal_dep_unsatisfied'
  | 'error';

export interface PushRecordRequest {
  entityType: string;
  entityId: string;
  mutationId: string;
  baseRevision: string | null;
  proposedRevision: string;
  clientUpdatedAtMs: number;
  originatorDeviceId: string;
  softDelete?: boolean;
  hardDelete?: boolean;
  envelope: number[];
}

export interface PushBatchRequest {
  accountId: string;
  records: PushRecordRequest[];
}

export interface PushRequestContext {
  accountId?: string;
  deviceId?: string;
}

export interface PushRecordResult {
  entityId: string;
  mutationId: string;
  status: PushRecordStatus;
  appliedRevision?: string;
  currentRevision?: string;
  commitSeq?: string;
  errorCode?: string;
}

export interface PushBatchResponse {
  status: 207;
  results: PushRecordResult[];
}

export interface StoredBlob {
  accountId: string;
  entityType: string;
  entityId: string;
  revision: bigint;
  keyId: number;
  encryptionDeviceId: bigint;
  counter: bigint;
  blob: number[];
  commitSeq: bigint;
  clientUpdatedAtMs: number;
  originatorDeviceId: string;
  mutationId: string;
  blobSize: number;
  hardDeleted: boolean;
}

export interface ConflictShadowInput {
  accountId: string;
  incoming: StoredBlob;
  winnerCommitSeq: bigint;
}

export interface PushDatabase {
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  getKeyQuarantine?(accountId: string): Promise<{ currentDekKeyId: number; keyQuarantineAt: string | null } | undefined>;
  getMutationDedup(accountId: string, mutationId: string): Promise<PushRecordResult | undefined>;
  putMutationDedup(accountId: string, mutationId: string, result: PushRecordResult): Promise<void>;
  getCurrentBlob(
    accountId: string,
    entityType: string,
    entityId: string,
  ): Promise<StoredBlob | undefined>;
  upsertBlob(blob: StoredBlob): Promise<void>;
  insertConflictShadow(input: ConflictShadowInput): Promise<void>;
  allocCommitSeq(accountId: string): Promise<bigint>;
}

export async function processPushBatch(
  db: PushDatabase,
  request: PushBatchRequest,
): Promise<PushBatchResponse> {
  const results: PushRecordResult[] = [];
  for (const record of request.records) {
    results.push(await db.transaction(() => processPushRecord(db, request.accountId, record)));
  }
  return { status: 207, results };
}

export function normalizePushBatchRequest(
  input: unknown,
  context: PushRequestContext = {},
): PushBatchRequest {
  const payload = asRecord(input, 'request');
  const accountId = context.accountId ??
    optionalString(payload.accountId) ??
    optionalString(payload.account_id) ??
    undefined;
  if (!accountId) {
    throw new Error('E3005: accountId is required');
  }
  if (!Array.isArray(payload.records)) {
    throw new Error('E3005: records must be an array');
  }

  return {
    accountId,
    records: payload.records.map((record, index) =>
      normalizePushRecord(record, context, index),
    ),
  };
}

function normalizePushRecord(
  input: unknown,
  context: PushRequestContext,
  index: number,
): PushRecordRequest {
  const record = asRecord(input, `records[${index}]`);
  const originatorDeviceId = optionalString(record.originatorDeviceId) ??
    optionalString(record.originator_device_id) ??
    context.deviceId;
  if (!originatorDeviceId) {
    throw new Error(`E3005: records[${index}].originatorDeviceId is required`);
  }

  const envelope =
    Array.isArray(record.envelope)
      ? normalizeByteArray(record.envelope, `records[${index}].envelope`)
      : typeof record.blob === 'string'
        ? decodeBase64Bytes(record.blob)
        : Array.isArray(record.blob)
          ? normalizeByteArray(record.blob, `records[${index}].blob`)
          : undefined;
  if (!envelope) {
    throw new Error(`E3005: records[${index}].envelope is required`);
  }

  return {
    entityType: requiredString(record.entityType ?? record.entity_type, `records[${index}].entityType`),
    entityId: requiredString(record.entityId ?? record.entity_id, `records[${index}].entityId`),
    mutationId: requiredString(record.mutationId ?? record.mutation_id, `records[${index}].mutationId`),
    baseRevision: normalizeBaseRevision(record.baseRevision ?? record.base_revision, index),
    proposedRevision: requiredString(record.proposedRevision ?? record.proposed_revision, `records[${index}].proposedRevision`),
    clientUpdatedAtMs: requiredNumber(record.clientUpdatedAtMs ?? record.client_updated_at, `records[${index}].clientUpdatedAtMs`),
    originatorDeviceId,
    softDelete: Boolean(record.softDelete ?? record.soft_delete),
    hardDelete: Boolean(record.hardDelete ?? record.hard_delete),
    envelope,
  };
}

async function processPushRecord(
  db: PushDatabase,
  accountId: string,
  record: PushRecordRequest,
): Promise<PushRecordResult> {
  const duplicate = await db.getMutationDedup(accountId, record.mutationId);
  if (duplicate) {
    return {
      ...duplicate,
      status: 'duplicate_mutation_id',
    };
  }

  const proposedRevision = parseBigIntString(record.proposedRevision, 'proposedRevision');
  const envelope = parseEnvelope(record.envelope);
  const quarantine = await db.getKeyQuarantine?.(accountId);
  if (quarantine?.keyQuarantineAt !== null && quarantine?.currentDekKeyId === envelope.keyId) {
    const result: PushRecordResult = {
      entityId: record.entityId,
      mutationId: record.mutationId,
      status: 'error',
      errorCode: 'E3033',
    };
    await db.putMutationDedup(accountId, record.mutationId, result);
    return result;
  }

  const current = await db.getCurrentBlob(accountId, record.entityType, record.entityId);
  const currentRevision = current?.revision ?? 0n;
  const baseRevision =
    record.baseRevision === null ? 0n : parseBigIntString(record.baseRevision, 'baseRevision');

  if (baseRevision !== currentRevision || proposedRevision !== baseRevision + 1n) {
    const result: PushRecordResult = {
      entityId: record.entityId,
      mutationId: record.mutationId,
      status: 'revision_mismatch',
      currentRevision: currentRevision.toString(),
      errorCode: 'E3015',
    };
    if (current) {
      await db.insertConflictShadow({
        accountId,
        incoming: storedBlobFromRequest(accountId, record, proposedRevision, current.commitSeq, envelope),
        winnerCommitSeq: current.commitSeq,
      });
    }
    await db.putMutationDedup(accountId, record.mutationId, result);
    return result;
  }

  const commitSeq = await db.allocCommitSeq(accountId);
  const blob = storedBlobFromRequest(accountId, record, proposedRevision, commitSeq, envelope);
  await db.upsertBlob(blob);

  const result: PushRecordResult = {
    entityId: record.entityId,
    mutationId: record.mutationId,
    status: 'ok',
    appliedRevision: proposedRevision.toString(),
    commitSeq: commitSeq.toString(),
  };
  await db.putMutationDedup(accountId, record.mutationId, result);
  return result;
}

function storedBlobFromRequest(
  accountId: string,
  record: PushRecordRequest,
  revision: bigint,
  commitSeq: bigint,
  envelope = parseEnvelope(record.envelope),
): StoredBlob {
  return {
    accountId,
    entityType: record.entityType,
    entityId: record.entityId,
    revision,
    keyId: envelope.keyId,
    encryptionDeviceId: envelope.encryptionDeviceId,
    counter: envelope.counter,
    blob: [...record.envelope],
    commitSeq,
    clientUpdatedAtMs: record.clientUpdatedAtMs,
    originatorDeviceId: record.originatorDeviceId,
    mutationId: record.mutationId,
    blobSize: record.envelope.length,
    hardDeleted: Boolean(record.hardDelete),
  };
}

export function parseEnvelope(envelope: readonly number[]): {
  keyId: number;
  encryptionDeviceId: bigint;
  counter: bigint;
} {
  if (envelope.length < 2 + 4 + 8 + 4 + 16) {
    throw new Error('E3005: encrypted envelope is too short');
  }
  if (envelope[0] !== 1 || envelope[1] !== 1) {
    throw new Error('E3005: unsupported encrypted envelope version');
  }

  return {
    keyId: readU32Le(envelope, 2),
    encryptionDeviceId: readU64Le(envelope, 6),
    counter: BigInt(readU32Le(envelope, 14)),
  };
}

function parseBigIntString(value: string, field: string): bigint {
  if (!/^(0|[1-9]\d*)$/.test(value)) {
    throw new Error(`E3005: ${field} must be a non-negative BIGINT string`);
  }
  return BigInt(value);
}

function asRecord(input: unknown, field: string): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error(`E3005: ${field} must be an object`);
  }
  return input as Record<string, unknown>;
}

function optionalString(input: unknown): string | undefined {
  return typeof input === 'string' && input.length > 0 ? input : undefined;
}

function requiredString(input: unknown, field: string): string {
  const value = optionalString(input);
  if (!value) {
    throw new Error(`E3005: ${field} is required`);
  }
  return value;
}

function requiredNumber(input: unknown, field: string): number {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    throw new Error(`E3005: ${field} must be a finite number`);
  }
  return input;
}

function normalizeBaseRevision(input: unknown, index: number): string | null {
  if (input === null || input === undefined) {
    return null;
  }
  return requiredString(input, `records[${index}].baseRevision`);
}

function normalizeByteArray(input: readonly unknown[], field: string): number[] {
  const bytes: number[] = [];
  for (let index = 0; index < input.length; index += 1) {
    const value = input[index];
    if (
      typeof value !== 'number' ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 255
    ) {
      throw new Error(`E3005: ${field}[${index}] must be a byte`);
    }
    bytes.push(value);
  }
  return bytes;
}

function decodeBase64Bytes(input: string): number[] {
  const binary = globalThis.atob(input);
  return Array.from(binary, (char) => char.charCodeAt(0));
}

function readU32Le(bytes: readonly number[], offset: number): number {
  return (
    bytes[offset]! |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24)
  ) >>> 0;
}

function readU64Le(bytes: readonly number[], offset: number): bigint {
  let value = 0n;
  for (let index = 7; index >= 0; index -= 1) {
    value = (value << 8n) | BigInt(bytes[offset + index]!);
  }
  return value;
}

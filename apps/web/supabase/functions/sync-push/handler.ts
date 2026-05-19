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
  envelope: number[];
}

export interface PushBatchRequest {
  accountId: string;
  records: PushRecordRequest[];
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
}

export interface ConflictShadowInput {
  accountId: string;
  incoming: StoredBlob;
  winnerCommitSeq: bigint;
}

export interface PushDatabase {
  transaction<T>(fn: () => Promise<T>): Promise<T>;
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
        incoming: storedBlobFromRequest(accountId, record, proposedRevision, current.commitSeq),
        winnerCommitSeq: current.commitSeq,
      });
    }
    await db.putMutationDedup(accountId, record.mutationId, result);
    return result;
  }

  const commitSeq = await db.allocCommitSeq(accountId);
  const blob = storedBlobFromRequest(accountId, record, proposedRevision, commitSeq);
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
): StoredBlob {
  const envelope = parseEnvelope(record.envelope);
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

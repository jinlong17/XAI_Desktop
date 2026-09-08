export interface PullRequestContext {
  accountId?: string;
}

export interface PullBatchRequest {
  accountId: string;
  sinceCommitSeq: string;
  limit: number;
  entityType?: string;
}

export interface StoredPullBlob {
  accountId: string;
  entityType: string;
  entityId: string;
  revision: bigint;
  keyId: number;
  blob: number[];
  commitSeq: bigint;
  deletedAt?: string | null;
  hardDeleted: boolean;
  originatorDeviceId: string;
}

export interface PullDatabase {
  getCurrentAccountCommitSeq(accountId: string): Promise<bigint>;
  listBlobs(input: {
    accountId: string;
    sinceCommitSeq: bigint;
    limit: number;
    entityType?: string;
  }): Promise<StoredPullBlob[]>;
}

export interface PullRecordResponse {
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

export interface PullBatchResponse {
  records: PullRecordResponse[];
  next_commit_seq: string;
  current_account_commit_seq: string;
  has_more: boolean;
}

const DEFAULT_PULL_LIMIT = 200;
const MAX_PULL_LIMIT = 500;

export async function processPullBatch(
  db: PullDatabase,
  request: PullBatchRequest,
): Promise<PullBatchResponse> {
  const sinceCommitSeq = parseBigIntString(request.sinceCommitSeq, 'sinceCommitSeq');
  const limit = normalizeLimit(request.limit);
  const [currentAccountCommitSeq, rows] = await Promise.all([
    db.getCurrentAccountCommitSeq(request.accountId),
    db.listBlobs({
      accountId: request.accountId,
      sinceCommitSeq,
      limit,
      entityType: request.entityType,
    }),
  ]);

  let nextCommitSeq = sinceCommitSeq;
  const records = rows.map((row) => {
    nextCommitSeq = maxBigInt(nextCommitSeq, row.commitSeq);
    return toPullRecord(row);
  });

  return {
    records,
    next_commit_seq: nextCommitSeq.toString(),
    current_account_commit_seq: currentAccountCommitSeq.toString(),
    has_more:
      records.length === limit &&
      nextCommitSeq < currentAccountCommitSeq,
  };
}

export function normalizePullBatchRequest(
  url: URL,
  context: PullRequestContext = {},
): PullBatchRequest {
  const accountId = context.accountId ??
    optionalString(url.searchParams.get('account_id'));
  if (!accountId) {
    throw new Error('E3005: accountId is required');
  }

  return {
    accountId,
    sinceCommitSeq: url.searchParams.get('since_commit_seq') ?? '0',
    limit: parseLimit(url.searchParams.get('limit')),
    entityType: optionalString(url.searchParams.get('entity_type')),
  };
}

function toPullRecord(row: StoredPullBlob): PullRecordResponse {
  return {
    entity_type: row.entityType,
    entity_id: row.entityId,
    revision: row.revision.toString(),
    key_id: row.keyId,
    blob: encodeBase64Bytes(row.blob),
    commit_seq: row.commitSeq.toString(),
    soft_deleted: Boolean(row.deletedAt),
    hard_deleted: row.hardDeleted,
    originator_device_id: row.originatorDeviceId,
  };
}

function optionalString(input: string | null | undefined): string | undefined {
  return typeof input === 'string' && input.length > 0 ? input : undefined;
}

function parseLimit(value: string | null): number {
  if (value === null || value.length === 0) {
    return DEFAULT_PULL_LIMIT;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error('E3005: limit must be an integer');
  }
  return parsed;
}

function normalizeLimit(limit: number): number {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PULL_LIMIT) {
    throw new Error(`E3005: limit must be between 1 and ${MAX_PULL_LIMIT}`);
  }
  return limit;
}

function parseBigIntString(value: string, field: string): bigint {
  if (!/^(0|[1-9]\d*)$/.test(value)) {
    throw new Error(`E3005: ${field} must be a non-negative BIGINT string`);
  }
  return BigInt(value);
}

function maxBigInt(left: bigint, right: bigint): bigint {
  return left > right ? left : right;
}

function encodeBase64Bytes(bytes: readonly number[]): string {
  let binary = '';
  for (const byte of bytes) {
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
      throw new Error('E3005: blob contains a non-byte value');
    }
    binary += String.fromCharCode(byte);
  }
  return globalThis.btoa(binary);
}

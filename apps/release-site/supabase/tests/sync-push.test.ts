import { describe, expect, it } from 'vitest';

import {
  parseEnvelope,
  processPushBatch,
  type ConflictShadowInput,
  type PushDatabase,
  type PushRecordRequest,
  type PushRecordResult,
  type StoredBlob,
} from '../functions/sync-push/handler';

describe('sync-push Edge Function core', () => {
  it('applies ok records, stores dedup result, and returns duplicate without new revision', async () => {
    const db = createPushDb();
    const first = await processPushBatch(db, {
      accountId: 'account-1',
      records: [record({ mutationId: 'mut-1', proposedRevision: '1' })],
    });

    expect(first).toMatchObject({
      status: 207,
      results: [{ status: 'ok', appliedRevision: '1', commitSeq: '1' }],
    });
    expect(db.blobs.get('todos:todo-1')).toMatchObject({ revision: 1n, commitSeq: 1n });

    const duplicate = await processPushBatch(db, {
      accountId: 'account-1',
      records: [record({ mutationId: 'mut-1', proposedRevision: '1' })],
    });

    expect(duplicate.results).toEqual([
      {
        entityId: 'todo-1',
        mutationId: 'mut-1',
        status: 'duplicate_mutation_id',
        appliedRevision: '1',
        commitSeq: '1',
      },
    ]);
    expect(db.nextCommitSeq).toBe(2n);
  });

  it('returns revision_mismatch and writes conflict shadow for stale base revision', async () => {
    const db = createPushDb([
      stored({
        entityId: 'todo-1',
        revision: 2n,
        commitSeq: 9n,
      }),
    ]);

    const response = await processPushBatch(db, {
      accountId: 'account-1',
      records: [
        record({
          mutationId: 'mut-stale',
          baseRevision: '1',
          proposedRevision: '2',
          envelope: envelope({ counter: 7 }),
        }),
      ],
    });

    expect(response.results).toEqual([
      {
        entityId: 'todo-1',
        mutationId: 'mut-stale',
        status: 'revision_mismatch',
        currentRevision: '2',
        errorCode: 'E3015',
      },
    ]);
    expect(db.conflictShadow).toHaveLength(1);
    expect(db.conflictShadow[0]).toMatchObject({
      accountId: 'account-1',
      winnerCommitSeq: 9n,
    });
    expect(db.conflictShadow[0]!.incoming).toMatchObject({
      counter: 7n,
      mutationId: 'mut-stale',
    });
  });

  it('returns mixed 207 per-record results', async () => {
    const db = createPushDb([stored({ entityId: 'existing', revision: 4n, commitSeq: 4n })]);

    const response = await processPushBatch(db, {
      accountId: 'account-1',
      records: [
        record({ entityId: 'new', mutationId: 'mut-ok', proposedRevision: '1' }),
        record({
          entityId: 'existing',
          mutationId: 'mut-mismatch',
          baseRevision: '1',
          proposedRevision: '2',
        }),
      ],
    });

    expect(response.status).toBe(207);
    expect(response.results.map((result) => result.status)).toEqual(['ok', 'revision_mismatch']);
  });

  it('parses Rust cipher-envelope metadata for server columns', () => {
    expect(parseEnvelope(envelope({ keyId: 3, encryptionDeviceId: 0x0102n, counter: 9 }))).toEqual({
      keyId: 3,
      encryptionDeviceId: 0x0102n,
      counter: 9n,
    });
  });
});

function record(overrides: Partial<PushRecordRequest> = {}): PushRecordRequest {
  return {
    entityType: 'todos',
    entityId: 'todo-1',
    mutationId: 'mut-1',
    baseRevision: null,
    proposedRevision: '1',
    clientUpdatedAtMs: 1,
    originatorDeviceId: 'device-1',
    envelope: envelope(),
    ...overrides,
  };
}

function stored(overrides: Partial<StoredBlob> = {}): StoredBlob {
  return {
    accountId: 'account-1',
    entityType: 'todos',
    entityId: 'todo-1',
    revision: 1n,
    keyId: 1,
    encryptionDeviceId: 100n,
    counter: 1n,
    blob: envelope(),
    commitSeq: 1n,
    clientUpdatedAtMs: 1,
    originatorDeviceId: 'device-1',
    mutationId: 'existing-mut',
    blobSize: envelope().length,
    ...overrides,
  };
}

function envelope(options: {
  keyId?: number;
  encryptionDeviceId?: bigint;
  counter?: number;
} = {}): number[] {
  const keyId = options.keyId ?? 1;
  const encryptionDeviceId = options.encryptionDeviceId ?? 100n;
  const counter = options.counter ?? 1;
  return [
    1,
    1,
    ...u32Le(keyId),
    ...u64Le(encryptionDeviceId),
    ...u32Le(counter),
    9,
    9,
    9,
    9,
    ...Array.from({ length: 16 }, () => 7),
  ];
}

function u32Le(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
}

function u64Le(value: bigint): number[] {
  const out: number[] = [];
  let next = value;
  for (let index = 0; index < 8; index += 1) {
    out.push(Number(next & 0xffn));
    next >>= 8n;
  }
  return out;
}

function createPushDb(initial: StoredBlob[] = []) {
  const blobs = new Map<string, StoredBlob>();
  for (const blob of initial) {
    blobs.set(`${blob.entityType}:${blob.entityId}`, blob);
  }
  const dedup = new Map<string, PushRecordResult>();
  const conflictShadow: ConflictShadowInput[] = [];
  const db: PushDatabase & {
    blobs: Map<string, StoredBlob>;
    conflictShadow: ConflictShadowInput[];
    nextCommitSeq: bigint;
  } = {
    blobs,
    conflictShadow,
    nextCommitSeq: 1n,
    async transaction(fn) {
      return fn();
    },
    async getMutationDedup(_accountId, mutationId) {
      return dedup.get(mutationId);
    },
    async putMutationDedup(_accountId, mutationId, result) {
      dedup.set(mutationId, result);
    },
    async getCurrentBlob(_accountId, entityType, entityId) {
      return blobs.get(`${entityType}:${entityId}`);
    },
    async upsertBlob(blob) {
      blobs.set(`${blob.entityType}:${blob.entityId}`, blob);
    },
    async insertConflictShadow(input) {
      conflictShadow.push(input);
    },
    async allocCommitSeq() {
      const seq = db.nextCommitSeq;
      db.nextCommitSeq += 1n;
      return seq;
    },
  };
  return db;
}

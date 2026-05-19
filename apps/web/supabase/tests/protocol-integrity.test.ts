import { describe, expect, it, vi } from 'vitest';

import { handleRecoveryProof } from '../functions/recovery-proof/index';
import {
  processPushBatch,
  type ConflictShadowInput,
  type PushDatabase,
  type PushRecordRequest,
  type PushRecordResult,
  type StoredBlob,
} from '../functions/sync-push/handler';
import type {
  RecoveryChallenge,
  RecoveryPayload,
  RecoveryProofDatabase,
} from '../functions/recovery-proof/handler';

describe('protocol integrity Edge checks', () => {
  it('returns 401 for PATCH /auth/me with no recovery proof', async () => {
    const response = await handleRecoveryProof(
      new Request('https://xai.local/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({}),
      }),
      createRecoveryDb(),
      { verify: vi.fn(async () => false) },
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'E3014' });
  });

  it('resending the same mutation_id 10x creates exactly one revision', async () => {
    const db = createPushDb();
    const request = {
      accountId: 'account-1',
      records: [record({ mutationId: 'mut-idempotent', proposedRevision: '1' })],
    };

    const results = [];
    for (let index = 0; index < 10; index += 1) {
      results.push(await processPushBatch(db, request));
    }

    expect(results[0]!.results[0]).toMatchObject({ status: 'ok', appliedRevision: '1' });
    expect(results.slice(1).every((result) => result.results[0]!.status === 'duplicate_mutation_id')).toBe(true);
    expect(db.blobs.get('todos:todo-1')).toMatchObject({ revision: 1n, commitSeq: 1n });
    expect(db.nextCommitSeq).toBe(2n);
  });
});

function createRecoveryDb() {
  const db: RecoveryProofDatabase & { updatedPayload?: RecoveryPayload } = {
    async createChallenge(_challenge: RecoveryChallenge) {
      throw new Error('not used');
    },
    async getChallenge() {
      return undefined;
    },
    async markChallengeUsed() {
      throw new Error('not used');
    },
    async getRecoverySigningPub() {
      return [];
    },
    async updateAccount(_accountId, payload) {
      db.updatedPayload = payload;
    },
  };
  return db;
}

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

function envelope(): number[] {
  return [
    1,
    1,
    ...u32Le(1),
    ...u64Le(100n),
    ...u32Le(1),
    ...Array.from({ length: 20 }, () => 7),
  ];
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

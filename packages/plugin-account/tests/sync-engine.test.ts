import { describe, expect, it, vi } from 'vitest';

import {
  SyncAccountRollbackError,
  SyncPushRevisionMismatchError,
  SyncRevisionRollbackError,
  applyServerRecords,
  createSyncPullHttpTransport,
  createSyncNonceLeaseManager,
  createSyncPushHttpTransport,
  createSyncOutbox,
  createUuidV7,
  pullBatch,
  pushBatch,
  type EntityState,
  type EntityStateStore,
  type PullRecord,
  type PushBatchRequest,
  type SyncCryptoClient,
  type SyncPullTransport,
  type SyncPushTransport,
} from '../src/sync-engine';

describe('createSyncOutbox', () => {
  it('squashes repeated same-entity edits to latest plaintext and mutation_id', () => {
    let id = 0;
    const outbox = createSyncOutbox({
      nowMs: () => 1234,
      generateMutationId: () => `018f-uuid-${++id}`,
    });

    outbox.enqueue({
      entityType: 'todos',
      entityId: 'todo-1',
      plaintext: new TextEncoder().encode('first'),
    });
    outbox.enqueue({
      entityType: 'todos',
      entityId: 'todo-1',
      plaintext: new TextEncoder().encode('latest'),
    });

    const entries = outbox.list();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      entityType: 'todos',
      entityId: 'todo-1',
      mutationId: '018f-uuid-2',
      clientUpdatedAtMs: 1234,
    });
    expect(new TextDecoder().decode(entries[0]!.plaintext)).toBe('latest');
  });
});

describe('pushBatch', () => {
  it('encrypts at flush with proposed_revision = base + 1 and sends one push request', async () => {
    const entry = {
      entityType: 'todos',
      entityId: 'todo-1',
      plaintext: new TextEncoder().encode('buy milk'),
      mutationId: '018f0000-0000-7000-8000-000000000001',
      clientUpdatedAtMs: 111,
    };
    const encryptFor = vi.fn<SyncCryptoClient['encryptFor']>(async (input) => {
      expect(input).toMatchObject({
        entityType: 'todos',
        entityId: 'todo-1',
        proposedRevision: 8n,
      });
      expect(new TextDecoder().decode(input.plaintext)).toBe('buy milk');
      return new Uint8Array([7, 8, 9]);
    });
    let request: PushBatchRequest | undefined;
    const transport: SyncPushTransport = {
      pushBatch: vi.fn(async (payload) => {
        request = payload;
        return {
          status: 207,
          results: [{ mutationId: entry.mutationId, status: 'ok', appliedRevision: '8' }],
        };
      }),
    };

    await expect(
      pushBatch(
        {
          crypto: { encryptFor },
          revisions: { maxSeenRevision: vi.fn(async () => 7n) },
          transport,
        },
        { entries: [entry] },
      ),
    ).resolves.toMatchObject({ status: 207 });

    expect(encryptFor).toHaveBeenCalledOnce();
    expect(transport.pushBatch).toHaveBeenCalledOnce();
    expect(request).toEqual({
      records: [
        {
          entityType: 'todos',
          entityId: 'todo-1',
          mutationId: entry.mutationId,
          baseRevision: '7',
          proposedRevision: '8',
          clientUpdatedAtMs: 111,
          envelope: [7, 8, 9],
        },
      ],
    });
  });

  it('surfaces server revision_mismatch as the C-E protocol error', async () => {
    const mutationId = '018f0000-0000-7000-8000-000000000002';

    await expect(
      pushBatch(
        {
          crypto: { encryptFor: vi.fn(async () => new Uint8Array([1])) },
          revisions: { maxSeenRevision: vi.fn(async () => 2n) },
          transport: {
            pushBatch: vi.fn(async () => ({
              status: 409,
              results: [{ mutationId, status: 'revision_mismatch', currentRevision: '9' }],
            })),
          },
        },
        {
          entries: [
            {
              entityType: 'todos',
              entityId: 'todo-1',
              plaintext: new Uint8Array([1]),
              mutationId,
              clientUpdatedAtMs: 1,
            },
          ],
        },
      ),
    ).rejects.toBeInstanceOf(SyncPushRevisionMismatchError);
  });
});

describe('createSyncPushHttpTransport', () => {
  it('posts one JSON request to /sync/push with bearer auth', async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      status: 207,
      async json() {
        return { status: 207, results: [] };
      },
    }));
    const transport = createSyncPushHttpTransport({
      accessToken: 'access-token',
      fetch,
    });
    const request: PushBatchRequest = {
      records: [
        {
          entityType: 'todos',
          entityId: 'todo-1',
          mutationId: '018f0000-0000-7000-8000-000000000003',
          baseRevision: '0',
          proposedRevision: '1',
          clientUpdatedAtMs: 1,
          envelope: [1, 2, 3],
        },
      ],
    };

    await expect(transport.pushBatch(request)).resolves.toMatchObject({ status: 207 });

    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0]).toEqual([
      '/sync/push',
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer access-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    ]);
  });
});

describe('createSyncNonceLeaseManager', () => {
  it('requests, renews, releases nonce leases and persists progress', async () => {
    const released: unknown[] = [];
    const progress: unknown[] = [];
    const manager = createSyncNonceLeaseManager(
      {
        async requestLease(input) {
          return {
            ...input,
            encryptionDeviceId: 1001n,
            leaseStart: 0n,
            leaseEnd: BigInt(input.count - 1),
            expiresAtMs: 100,
          };
        },
        async renewLease(lease) {
          return { ...lease, expiresAtMs: 200 };
        },
        async releaseLease(lease) {
          released.push(lease);
        },
        async persistProgress(checkpoint) {
          progress.push(checkpoint);
        },
      },
      { nowMs: () => 123 },
    );

    await expect(
      manager.request({ accountId: 'acct', deviceId: 'dev-a', keyId: 1, count: 3 }),
    ).resolves.toMatchObject({ leaseEnd: 2n });
    await expect(manager.renew()).resolves.toMatchObject({ expiresAtMs: 200 });
    await expect(manager.persistProgress(7n)).resolves.toMatchObject({ lastAckCommitSeq: 7n, updatedAtMs: 123 });
    await manager.release();

    expect(progress).toHaveLength(1);
    expect(released).toHaveLength(1);
    expect(manager.current()).toBeUndefined();
  });
});

describe('applyServerRecords', () => {
  it('rejects account commit_seq rollback with E3024', async () => {
    await expect(
      applyServerRecords(createPullDeps([]), {
        records: [],
        currentAccountCommitSeq: '9',
        lastSeenAccountCommitSeq: '10',
      }),
    ).rejects.toBeInstanceOf(SyncAccountRollbackError);
  });

  it('ignores idempotent duplicates and accepts legit re-encrypt at same revision', async () => {
    const state: EntityState = {
      entityType: 'todos',
      entityId: 'todo-1',
      maxSeenRevision: 3n,
      lastBlobHash: 'hash-a',
      lastCommitSeq: 10n,
      lastKeyId: 1,
    };
    const applied: Array<{ record: PullRecord; kind: string }> = [];
    const deps = createPullDeps([state], applied);

    const result = await applyServerRecords(deps, {
      currentAccountCommitSeq: '12',
      lastSeenAccountCommitSeq: '10',
      records: [
        record({ revision: '3', commitSeq: '10', blobHash: 'hash-a', keyId: 1 }),
        record({ revision: '3', commitSeq: '11', blobHash: 'hash-b', keyId: 2 }),
      ],
    });

    expect(result.decisions.map((decision) => decision.kind)).toEqual(['idempotent', 'reencrypt']);
    expect(applied).toHaveLength(1);
    expect(applied[0]).toMatchObject({ kind: 'reencrypt' });
    await expect(deps.entityStates.get({ entityType: 'todos', entityId: 'todo-1' })).resolves.toMatchObject({
      lastBlobHash: 'hash-b',
      lastCommitSeq: 11n,
      lastKeyId: 2,
    });
  });

  it('rejects true revision rollback with E3015', async () => {
    const deps = createPullDeps([
      {
        entityType: 'todos',
        entityId: 'todo-1',
        maxSeenRevision: 5n,
        lastBlobHash: 'hash-new',
        lastCommitSeq: 20n,
        lastKeyId: 1,
      },
    ]);

    await expect(
      applyServerRecords(deps, {
        currentAccountCommitSeq: '21',
        lastSeenAccountCommitSeq: '20',
        records: [record({ revision: '4', commitSeq: '19', blobHash: 'hash-old', keyId: 1 })],
      }),
    ).rejects.toBeInstanceOf(SyncRevisionRollbackError);
  });
});

describe('pullBatch', () => {
  it('uses a single global commit_seq cursor and no entity_type query param', async () => {
    let request: { sinceCommitSeq: string; limit: number } | undefined;
    const transport: SyncPullTransport = {
      pullBatch: vi.fn(async (payload) => {
        request = payload;
        return {
          currentAccountCommitSeq: '6',
          records: [record({ revision: '1', commitSeq: '6', blobHash: 'hash-a', keyId: 1 })],
        };
      }),
    };
    const applied: Array<{ record: PullRecord; kind: string }> = [];

    await expect(
      pullBatch(
        {
          ...createPullDeps([], applied),
          transport,
        },
        { sinceCommitSeq: 5n, lastSeenAccountCommitSeq: 5n },
      ),
    ).resolves.toMatchObject({ currentAccountCommitSeq: 6n });

    expect(request).toEqual({ sinceCommitSeq: '5', limit: 500 });
    expect(applied).toHaveLength(1);
    expect(applied[0]).toMatchObject({ kind: 'applied' });
  });
});

describe('createSyncPullHttpTransport', () => {
  it('gets /sync/pull with since_commit_seq and limit only', async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      async json() {
        return { currentAccountCommitSeq: '7', records: [] };
      },
    }));
    const transport = createSyncPullHttpTransport({ accessToken: 'access-token', fetch });

    await expect(transport.pullBatch({ sinceCommitSeq: '5', limit: 500 })).resolves.toMatchObject({
      currentAccountCommitSeq: '7',
    });

    expect(fetch).toHaveBeenCalledWith('/sync/pull?since_commit_seq=5&limit=500', {
      method: 'GET',
      headers: { authorization: 'Bearer access-token' },
    });
    expect(fetch.mock.calls[0]![0]).not.toContain('entity_type');
  });
});

describe('createUuidV7', () => {
  it('sets UUIDv7 version and RFC variant bits', () => {
    const id = createUuidV7(0x018f_0000_0000, () =>
      new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x11, 0x22, 0x33, 0x44]),
    );

    expect(id).toBe('018f0000-0000-7abb-8cdd-eeff11223344');
  });
});

function record(overrides: Partial<PullRecord> = {}): PullRecord {
  return {
    entityType: 'todos',
    entityId: 'todo-1',
    revision: '1',
    commitSeq: '1',
    blobHash: 'hash-a',
    keyId: 1,
    envelope: [1, 2, 3],
    ...overrides,
  };
}

function createPullDeps(
  initial: readonly EntityState[],
  applied: Array<{ record: PullRecord; kind: string }> = [],
) {
  const states = new Map<string, EntityState>();
  for (const state of initial) {
    states.set(`${state.entityType}:${state.entityId}`, state);
  }
  const entityStates: EntityStateStore = {
    async get(entity) {
      return states.get(`${entity.entityType}:${entity.entityId}`);
    },
    async put(state) {
      states.set(`${state.entityType}:${state.entityId}`, state);
    },
  };

  return {
    entityStates,
    applier: {
      async apply(record: PullRecord, kind: 'applied' | 'reencrypt') {
        applied.push({ record, kind });
      },
    },
  };
}

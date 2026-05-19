import { describe, expect, it, vi } from 'vitest';

import {
  SyncPushRevisionMismatchError,
  createSyncPushHttpTransport,
  createSyncOutbox,
  createUuidV7,
  pushBatch,
  type PushBatchRequest,
  type SyncCryptoClient,
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

describe('createUuidV7', () => {
  it('sets UUIDv7 version and RFC variant bits', () => {
    const id = createUuidV7(0x018f_0000_0000, () =>
      new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x11, 0x22, 0x33, 0x44]),
    );

    expect(id).toBe('018f0000-0000-7abb-8cdd-eeff11223344');
  });
});

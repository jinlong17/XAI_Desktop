import { describe, expect, it } from 'vitest';

import {
  normalizePullBatchRequest,
  processPullBatch,
  type PullDatabase,
  type StoredPullBlob,
} from '../functions/sync-pull/handler';
import { handleSyncPull } from '../functions/sync-pull/index';

describe('sync-pull Edge Function core', () => {
  it('returns encrypted blobs after the requested commit_seq cursor', async () => {
    const db = createPullDb([
      blob({ entityId: 'old', commitSeq: 1n }),
      blob({ entityId: 'todo-2', revision: 2n, commitSeq: 2n, blob: [4, 5, 6] }),
      blob({ entityId: 'todo-3', revision: 3n, commitSeq: 3n, hardDeleted: true }),
    ]);

    const response = await processPullBatch(db, {
      accountId: 'account-1',
      sinceCommitSeq: '1',
      limit: 10,
    });

    expect(response).toEqual({
      records: [
        {
          entity_type: 'productivity.todo',
          entity_id: 'todo-2',
          revision: '2',
          key_id: 1,
          blob: Buffer.from([4, 5, 6]).toString('base64'),
          commit_seq: '2',
          soft_deleted: false,
          hard_deleted: false,
          originator_device_id: 'device-1',
        },
        {
          entity_type: 'productivity.todo',
          entity_id: 'todo-3',
          revision: '3',
          key_id: 1,
          blob: Buffer.from([1, 2, 3]).toString('base64'),
          commit_seq: '3',
          soft_deleted: false,
          hard_deleted: true,
          originator_device_id: 'device-1',
        },
      ],
      next_commit_seq: '3',
      current_account_commit_seq: '3',
      has_more: false,
    });
  });

  it('normalizes HTTP query and account header into a pull request', () => {
    const request = normalizePullBatchRequest(
      new URL('https://xai.local/sync/pull?since_commit_seq=9&limit=50&entity_type=productivity.todo'),
      { accountId: 'account-1' },
    );

    expect(request).toEqual({
      accountId: 'account-1',
      sinceCommitSeq: '9',
      limit: 50,
      entityType: 'productivity.todo',
    });
  });

  it('binds HTTP account context and returns JSON response', async () => {
    const db = createPullDb([blob({ entityId: 'todo-http', commitSeq: 7n })]);
    const response = await handleSyncPull(
      new Request('https://xai.local/sync/pull?since_commit_seq=0&limit=1', {
        method: 'GET',
        headers: {
          'x-account-id': 'account-1',
        },
      }),
      db,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      records: [{ entity_id: 'todo-http', commit_seq: '7' }],
      next_commit_seq: '7',
      current_account_commit_seq: '7',
    });
  });

  it('prefers the Authorization JWT subject over a spoofed account header', async () => {
    const db = createPullDb([
      blob({ accountId: 'account-from-jwt', entityId: 'todo-jwt', commitSeq: 8n }),
      blob({ accountId: 'spoofed-account', entityId: 'todo-spoofed', commitSeq: 9n }),
    ]);
    const response = await handleSyncPull(
      new Request('https://xai.local/sync/pull?account_id=spoofed-account&since_commit_seq=0&limit=10', {
        method: 'GET',
        headers: {
          authorization: bearerForSubject('account-from-jwt'),
          'x-account-id': 'spoofed-account',
        },
      }),
      db,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      records: [{ entity_id: 'todo-jwt', commit_seq: '8' }],
      current_account_commit_seq: '8',
    });
  });

  it('rejects missing account context and bad limits', async () => {
    const db = createPullDb([]);
    const missingAccount = await handleSyncPull(
      new Request('https://xai.local/sync/pull', { method: 'GET' }),
      db,
    );
    const badLimit = await handleSyncPull(
      new Request('https://xai.local/sync/pull?limit=0', {
        method: 'GET',
        headers: { 'x-account-id': 'account-1' },
      }),
      db,
    );

    expect(missingAccount.status).toBe(400);
    expect(badLimit.status).toBe(400);
  });
});

function blob(overrides: Partial<StoredPullBlob> = {}): StoredPullBlob {
  return {
    accountId: 'account-1',
    entityType: 'productivity.todo',
    entityId: 'todo-1',
    revision: 1n,
    keyId: 1,
    blob: [1, 2, 3],
    commitSeq: 1n,
    deletedAt: null,
    hardDeleted: false,
    originatorDeviceId: 'device-1',
    ...overrides,
  };
}

function createPullDb(initial: StoredPullBlob[]): PullDatabase {
  const rows = [...initial].sort((left, right) =>
    left.commitSeq < right.commitSeq ? -1 : left.commitSeq > right.commitSeq ? 1 : 0,
  );
  return {
    async getCurrentAccountCommitSeq(accountId) {
      return rows
        .filter((row) => row.accountId === accountId)
        .reduce((max, row) => (row.commitSeq > max ? row.commitSeq : max), 0n);
    },
    async listBlobs(input) {
      return rows
        .filter((row) => row.accountId === input.accountId)
        .filter((row) => row.commitSeq > input.sinceCommitSeq)
        .filter((row) => !input.entityType || row.entityType === input.entityType)
        .slice(0, input.limit);
    },
  };
}

function bearerForSubject(subject: string): string {
  return `Bearer ${base64Url({ alg: 'none' })}.${base64Url({ sub: subject })}.sig`;
}

function base64Url(input: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(input))
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');
}

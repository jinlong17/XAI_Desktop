import { describe, expect, it, vi } from 'vitest';

import {
  AccountRateLimitError,
  InMemoryAccountDeletionStore,
  StorageQuotaExceededError,
  assertWithinStorageQuota,
  createAccountRateLimiter,
  createSupportFeedback,
  executeAccountDeletion,
  exportEncryptedAccountData,
  importEncryptedAccountData,
  planAccountDeletion,
} from '../src';

describe('beta operations controls', () => {
  it('enforces configurable per-user storage quota', () => {
    expect(() =>
      assertWithinStorageQuota({ accountId: 'acct', usedBytes: 90 }, 9, { maxBytesPerUser: 100 }),
    ).not.toThrow();
    expect(() =>
      assertWithinStorageQuota({ accountId: 'acct', usedBytes: 90 }, 11, { maxBytesPerUser: 100 }),
    ).toThrow(StorageQuotaExceededError);
  });

  it('rate limits account API calls in a mock middleware closure', () => {
    let now = 1000;
    const limit = createAccountRateLimiter({ windowMs: 100, maxCalls: 2, nowMs: () => now });

    limit('acct');
    limit('acct');
    expect(() => limit('acct')).toThrow(AccountRateLimitError);
    now = 1200;
    expect(() => limit('acct')).not.toThrow();
  });

  it('builds support feedback, encrypted export and delete-account plan', async () => {
    expect(createSupportFeedback({ accountId: 'acct', category: 'sync', message: '  stuck  ' }, () => 7)).toEqual({
      accountId: 'acct',
      category: 'sync',
      message: 'stuck',
      createdAtMs: 7,
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(
      JSON.parse(
        await exportEncryptedAccountData([
          { entityType: 'todos', entityId: 'todo-1', revision: '1', encryptedPayload: [1, 2, 3] },
        ], { nowMs: () => 11 }),
      ),
    ).toMatchObject({
      schema: 'xai.encrypted-export.v2',
      exportedAtMs: 11,
      integrityAlgo: null,
      integrityMac: null,
      records: [{ entityId: 'todo-1' }],
    });
    expect(warnSpy).toHaveBeenCalledWith('export is not integrity-protected');
    warnSpy.mockRestore();
    expect(planAccountDeletion({ accountId: 'acct', deviceIds: ['dev-a', 'dev-b'] })).toMatchObject({
      accountId: 'acct',
      revokeDeviceIds: ['dev-a', 'dev-b'],
      serverCleanupRequired: true,
    });
  });

  it('executeAccountDeletion clears all 7 planned tables and revokes all devices', async () => {
    const plan = planAccountDeletion({ accountId: 'target', deviceIds: ['dev-a', 'dev-b'] });
    const store = new InMemoryAccountDeletionStore();

    for (const table of plan.deleteTables) {
      store.seed(table, [{ accountId: 'target' }, { accountId: 'other' }]);
    }

    const result = await executeAccountDeletion(store, plan);

    expect(result.deletedRowsByTable).toEqual(
      Object.fromEntries(plan.deleteTables.map((table) => [table, 1])),
    );
    for (const table of plan.deleteTables) {
      expect(store.tables.get(table)).toEqual([{ accountId: 'other' }]);
    }
    expect(result.revokedDeviceIds).toEqual(['dev-a', 'dev-b']);
    expect(store.revokedDeviceIds).toEqual(new Set(['dev-a', 'dev-b']));
    expect(result.completed).toBe(true);
  });

  it('executeAccountDeletion best-effort completes other tables when one throws', async () => {
    const plan = planAccountDeletion({ accountId: 'target', deviceIds: ['dev-a', 'dev-b'] });
    const failingTable = plan.deleteTables[2];

    class FailingAccountDeletionStore extends InMemoryAccountDeletionStore {
      constructor(private readonly failingDeleteTable: string) {
        super();
      }

      async deleteRows(table: string, filter: { accountId: string }): Promise<number> {
        if (table === this.failingDeleteTable) {
          throw new Error('delete failed');
        }
        return super.deleteRows(table, filter);
      }
    }

    const store = new FailingAccountDeletionStore(failingTable);
    for (const table of plan.deleteTables) {
      store.seed(table, [{ accountId: 'target' }, { accountId: 'other' }]);
    }

    const result = await executeAccountDeletion(store, plan);

    expect(result.completed).toBe(false);
    expect(result.deletedRowsByTable).toEqual(
      Object.fromEntries(
        plan.deleteTables.filter((table) => table !== failingTable).map((table) => [table, 1]),
      ),
    );
    for (const table of plan.deleteTables) {
      const rows = store.tables.get(table);
      if (table === failingTable) {
        expect(rows).toEqual([{ accountId: 'target' }, { accountId: 'other' }]);
      } else {
        expect(rows).toEqual([{ accountId: 'other' }]);
      }
    }
    expect(result.revokedDeviceIds).toEqual(['dev-a', 'dev-b']);
    expect(store.revokedDeviceIds).toEqual(new Set(['dev-a', 'dev-b']));
  });

  it('executeAccountDeletion does not touch rows of other accounts', async () => {
    const plan = planAccountDeletion({ accountId: 'target', deviceIds: [] });
    const store = new InMemoryAccountDeletionStore();

    for (const table of plan.deleteTables) {
      store.seed(table, [{ accountId: 'other' }, { accountId: 'another' }]);
    }

    const result = await executeAccountDeletion(store, plan);

    expect(result.deletedRowsByTable).toEqual(
      Object.fromEntries(plan.deleteTables.map((table) => [table, 0])),
    );
    for (const table of plan.deleteTables) {
      expect(store.tables.get(table)).toEqual([{ accountId: 'other' }, { accountId: 'another' }]);
    }
    expect(result.completed).toBe(true);
  });

  it('round-trips encrypted export through v2 integrity envelope', async () => {
    const records = [
      { entityType: 'todos', entityId: 'todo-1', revision: '1', encryptedPayload: [1, 2, 3] },
      { entityType: 'todos', entityId: 'todo-2', revision: '2', encryptedPayload: [4, 5, 6] },
    ];
    const hmacKey = new Uint8Array(Array.from({ length: 32 }, (_, index) => index + 1));

    const exportJson = await exportEncryptedAccountData(records, { nowMs: () => 1234, hmacKey });

    expect(JSON.parse(exportJson)).toMatchObject({
      schema: 'xai.encrypted-export.v2',
      exportedAtMs: 1234,
      integrityAlgo: 'HMAC-SHA256',
      records,
    });
    await expect(importEncryptedAccountData(exportJson, { hmacKey })).resolves.toEqual(records);
  });

  it('round-trips unsigned v2 export and warns about missing integrity protection', async () => {
    const records = [
      { entityType: 'todos', entityId: 'todo-1', revision: '1', encryptedPayload: [9, 8, 7] },
    ];
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const exportJson = await exportEncryptedAccountData(records, { nowMs: () => 55 });

    expect(JSON.parse(exportJson)).toMatchObject({
      schema: 'xai.encrypted-export.v2',
      exportedAtMs: 55,
      integrityAlgo: null,
      integrityMac: null,
      records,
    });
    expect(warnSpy).toHaveBeenCalledWith('export is not integrity-protected');
    await expect(importEncryptedAccountData(exportJson)).resolves.toEqual(records);
    warnSpy.mockRestore();
  });

  it('rejects tampered v2 exports with E3038', async () => {
    const hmacKey = new Uint8Array(Array.from({ length: 32 }, (_, index) => index + 33));
    const exportJson = await exportEncryptedAccountData(
      [{ entityType: 'todos', entityId: 'todo-1', revision: '1', encryptedPayload: [1, 2, 3] }],
      { hmacKey },
    );
    const tampered = JSON.parse(exportJson) as {
      records: Array<{ encryptedPayload: number[] }>;
    };
    tampered.records[0]!.encryptedPayload[0] = 99;

    await expect(importEncryptedAccountData(JSON.stringify(tampered), { hmacKey })).rejects.toThrow('E3038');
  });

  it('imports legacy v1 exports without integrity verification', async () => {
    const records = [
      { entityType: 'todos', entityId: 'todo-legacy', revision: '7', encryptedPayload: [6, 5, 4] },
    ];
    const hmacKey = new Uint8Array(Array.from({ length: 32 }, (_, index) => 255 - index));
    const legacyExportJson = JSON.stringify({
      schema: 'xai.encrypted-export.v1',
      exportedAtMs: 0,
      records,
    });

    await expect(importEncryptedAccountData(legacyExportJson, { hmacKey })).resolves.toEqual(records);
  });
});

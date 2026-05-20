import { describe, expect, it, vi } from 'vitest';

import {
  AccountRateLimitError,
  StorageQuotaExceededError,
  assertWithinStorageQuota,
  createAccountRateLimiter,
  createSupportFeedback,
  exportEncryptedAccountData,
  importEncryptedAccountData,
  planAccountDeletion,
} from '../src';

const integrityKey = new Uint8Array(Array.from({ length: 32 }, (_, index) => index + 1));

function sampleEncryptedRecords() {
  return [{ entityType: 'todos', entityId: 'todo-1', revision: '1', encryptedPayload: [1, 2, 3] }];
}

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

  it('builds support feedback, encrypted export and delete-account plan', () => {
    expect(createSupportFeedback({ accountId: 'acct', category: 'sync', message: '  stuck  ' }, () => 7)).toEqual({
      accountId: 'acct',
      category: 'sync',
      message: 'stuck',
      createdAtMs: 7,
    });
    expect(
      JSON.parse(
        exportEncryptedAccountData(sampleEncryptedRecords(), { nowMs: () => 7, hmacKey: integrityKey }),
      ),
    ).toMatchObject({
      schema: 'xai.encrypted-export.v2',
      exportedAtMs: 7,
      integrityAlgo: 'HMAC-SHA256',
      records: [{ entityId: 'todo-1' }],
    });
    expect(planAccountDeletion({ accountId: 'acct', deviceIds: ['dev-a', 'dev-b'] })).toMatchObject({
      accountId: 'acct',
      revokeDeviceIds: ['dev-a', 'dev-b'],
      serverCleanupRequired: true,
    });
  });

  it('round-trips encrypted exports with HMAC integrity', () => {
    const records = sampleEncryptedRecords();
    const exportJson = exportEncryptedAccountData(records, { nowMs: () => 1234, hmacKey: integrityKey });
    const parsed = JSON.parse(exportJson);

    expect(parsed).toMatchObject({
      schema: 'xai.encrypted-export.v2',
      exportedAtMs: 1234,
      integrityAlgo: 'HMAC-SHA256',
      records,
    });
    expect(parsed.integrityMac).toMatch(/^[0-9a-f]{64}$/);
    expect(importEncryptedAccountData(exportJson, { hmacKey: integrityKey })).toEqual(records);
  });

  it('round-trips encrypted exports without HMAC integrity and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const records = sampleEncryptedRecords();

    try {
      const exportJson = exportEncryptedAccountData(records, { nowMs: () => 1234 });
      const parsed = JSON.parse(exportJson);

      expect(parsed).toMatchObject({
        schema: 'xai.encrypted-export.v2',
        exportedAtMs: 1234,
        integrityAlgo: null,
        integrityMac: null,
        records,
      });
      expect(importEncryptedAccountData(exportJson)).toEqual(records);
      expect(warn).toHaveBeenCalledWith('export is not integrity-protected');
    } finally {
      warn.mockRestore();
    }
  });

  it('rejects imports when records are tampered after export', () => {
    const exportJson = exportEncryptedAccountData(sampleEncryptedRecords(), { nowMs: () => 1234, hmacKey: integrityKey });
    const tampered = JSON.parse(exportJson);
    tampered.records[0].revision = '2';

    expect(() => importEncryptedAccountData(JSON.stringify(tampered), { hmacKey: integrityKey })).toThrow('E3038');
  });

  it('imports legacy v1 encrypted exports without integrity verification', () => {
    const records = sampleEncryptedRecords();
    const exportJson = JSON.stringify({
      schema: 'xai.encrypted-export.v1',
      exportedAtMs: 0,
      records,
    });

    expect(importEncryptedAccountData(exportJson, { hmacKey: integrityKey })).toEqual(records);
  });
});

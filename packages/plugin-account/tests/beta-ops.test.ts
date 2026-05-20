import { describe, expect, it } from 'vitest';

import {
  AccountRateLimitError,
  StorageQuotaExceededError,
  assertWithinStorageQuota,
  createAccountRateLimiter,
  createSupportFeedback,
  exportEncryptedAccountData,
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

  it('builds support feedback, encrypted export and delete-account plan', () => {
    expect(createSupportFeedback({ accountId: 'acct', category: 'sync', message: '  stuck  ' }, () => 7)).toEqual({
      accountId: 'acct',
      category: 'sync',
      message: 'stuck',
      createdAtMs: 7,
    });
    expect(
      JSON.parse(
        exportEncryptedAccountData([
          { entityType: 'todos', entityId: 'todo-1', revision: '1', encryptedPayload: [1, 2, 3] },
        ]),
      ),
    ).toMatchObject({ schema: 'xai.encrypted-export.v1', records: [{ entityId: 'todo-1' }] });
    expect(planAccountDeletion({ accountId: 'acct', deviceIds: ['dev-a', 'dev-b'] })).toMatchObject({
      accountId: 'acct',
      revokeDeviceIds: ['dev-a', 'dev-b'],
      serverCleanupRequired: true,
    });
  });
});

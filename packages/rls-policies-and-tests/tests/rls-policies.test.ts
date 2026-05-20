import { describe, expect, it } from 'vitest';

import { assertUserFilter, canMutateDirectly, canSelect } from '../src';

describe('RLS policy model', () => {
  it('allows active devices to read only own account rows', () => {
    const context = { role: 'authenticated' as const, userId: 'acct-a', deviceId: 'dev-a' };

    expect(canSelect('encrypted_blobs', context, { accountId: 'acct-a', status: 'active' })).toBe(true);
    expect(canSelect('encrypted_blobs', context, { accountId: 'acct-b', status: 'active' })).toBe(false);
    expect(canSelect('device_dek_wraps', context, { accountId: 'acct-a', deviceId: 'dev-a', status: 'active' })).toBe(true);
    expect(canSelect('device_dek_wraps', context, { accountId: 'acct-a', deviceId: 'dev-b', status: 'active' })).toBe(false);
  });

  it('denies anon and direct writes except device progress', () => {
    expect(canSelect('encrypted_blobs', { role: 'anon', userId: null, deviceId: null }, { accountId: 'acct-a' })).toBe(false);
    expect(canMutateDirectly('encrypted_blobs', { role: 'authenticated', userId: 'acct-a', deviceId: 'dev-a' }, { accountId: 'acct-a' })).toBe(false);
    expect(canMutateDirectly('device_sync_progress', { role: 'authenticated', userId: 'acct-a', deviceId: 'dev-a' }, { accountId: 'acct-a' })).toBe(true);
  });

  it('requires account_id filters on mock Supabase queries', () => {
    expect(() =>
      assertUserFilter({ table: 'encrypted_blobs', filters: { account_id: 'acct-a' } }, {
        role: 'authenticated',
        userId: 'acct-a',
        deviceId: 'dev-a',
      }),
    ).not.toThrow();
    expect(() =>
      assertUserFilter({ table: 'encrypted_blobs', filters: {} }, {
        role: 'authenticated',
        userId: 'acct-a',
        deviceId: 'dev-a',
      }),
    ).toThrow(/E3030/);
  });
});

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { assertUserFilter, canMutateDirectly, canSelect } from '../../../../packages/rls-policies-and-tests/src';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');

describe('sync-v1 RLS policy mock', () => {
  it('allows an active device to read only its account blobs and own DEK wrap', () => {
    const context = { role: 'authenticated' as const, userId: 'acct-a', deviceId: 'dev-a' };

    expect(canSelect('encrypted_blobs', context, { accountId: 'acct-a', status: 'active' })).toBe(true);
    expect(canSelect('encrypted_blobs', context, { accountId: 'acct-b', status: 'active' })).toBe(false);
    expect(canSelect('device_dek_wraps', context, { accountId: 'acct-a', deviceId: 'dev-a', status: 'active' })).toBe(true);
    expect(canSelect('device_dek_wraps', context, { accountId: 'acct-a', deviceId: 'dev-b', status: 'active' })).toBe(false);
  });

  it('denies anon reads, revoked-device reads and direct client writes', () => {
    expect(canSelect('encrypted_blobs', { role: 'anon', userId: null, deviceId: null }, { accountId: 'acct-a' })).toBe(false);
    expect(
      canSelect(
        'encrypted_blobs',
        { role: 'authenticated', userId: 'acct-a', deviceId: 'dev-revoked' },
        { accountId: 'acct-a', status: 'revoked' },
      ),
    ).toBe(false);
    expect(canMutateDirectly('encrypted_blobs', { role: 'authenticated', userId: 'acct-a', deviceId: 'dev-a' }, { accountId: 'acct-a' })).toBe(false);
  });

  it('verifies mock Supabase queries carry the user_id/account_id filter', () => {
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

  it('keeps RLS SQL migration parseable for local review', () => {
    const sql = readFileSync(path.join(migrationsDir, '20260519000006_rls_policies.sql'), 'utf8');

    expect(sql).toContain('ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('sync_devices');
    expect(sql).not.toContain('TODO');
  });
});

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { InMemoryNonceLeaseServer } from '../../../../packages/nonce-lease-server/src';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');

describe('sync-v1 nonce lease server mock', () => {
  it('issues strictly monotone non-overlapping leases for the active JWT device', () => {
    const server = seededServer();

    expect(server.grantNonceLease({ accountId: 'acct-a', deviceId: 'dev-active', keyId: 1, count: 3 })).toMatchObject({
      encryptionDeviceId: 3001n,
      leaseStart: 0n,
      leaseEnd: 2n,
    });
    expect(server.grantNonceLease({ accountId: 'acct-a', deviceId: 'dev-active', keyId: 1, count: 2 })).toMatchObject({
      leaseStart: 3n,
      leaseEnd: 4n,
    });
  });

  it('rejects revoked devices, duplicate used nonce tuples, and progress rollback', () => {
    const server = seededServer();

    expect(() => server.grantNonceLease({ accountId: 'acct-a', deviceId: 'dev-revoked', keyId: 1, count: 1 })).toThrow(
      /nonce_lease_not_owned/,
    );

    server.recordUsedNonce({
      accountId: 'acct-a',
      keyId: 1,
      encryptionDeviceId: 3001n,
      counter: 10n,
      source: 'blob',
    });
    expect(() =>
      server.recordUsedNonce({
        accountId: 'acct-a',
        keyId: 1,
        encryptionDeviceId: 3001n,
        counter: 10n,
        source: 'conflict_shadow',
      }),
    ).toThrow(/E3027/);

    server.updateProgress('acct-a', 'dev-active', 22n);
    expect(() => server.updateProgress('acct-a', 'dev-active', 21n)).toThrow(/E3024/);
  });

  it('keeps nonce lease SQL migration parseable for local review', () => {
    const sql = readFileSync(path.join(migrationsDir, '20260519000008_nonce_lease_rpc.sql'), 'utf8');

    expect(sql).toContain('fn_grant_nonce_lease');
    expect(sql).toContain('nonce_lease_exhausted');
    expect(sql).not.toContain('TODO');
  });
});

function seededServer(): InMemoryNonceLeaseServer {
  const server = new InMemoryNonceLeaseServer({ nowMs: () => 1000 });
  server.addDevice({ accountId: 'acct-a', deviceId: 'dev-active', encryptionDeviceId: 3001n, status: 'active' });
  server.addDevice({ accountId: 'acct-a', deviceId: 'dev-revoked', encryptionDeviceId: 3002n, status: 'revoked' });
  server.addKey({ accountId: 'acct-a', keyId: 1, status: 'active' });
  return server;
}

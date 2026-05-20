import { describe, expect, it } from 'vitest';

import { InMemoryNonceLeaseServer } from '../src';

describe('in-memory nonce lease server', () => {
  it('grants monotone non-overlapping leases for an active device', () => {
    const server = seededServer();

    expect(server.grantNonceLease({ accountId: 'acct', deviceId: 'dev-a', keyId: 1, count: 3 })).toMatchObject({
      encryptionDeviceId: 1001n,
      leaseStart: 0n,
      leaseEnd: 2n,
    });
    expect(server.grantNonceLease({ accountId: 'acct', deviceId: 'dev-a', keyId: 1, count: 2 })).toMatchObject({
      leaseStart: 3n,
      leaseEnd: 4n,
    });
  });

  it('rejects revoked devices, retired keys, duplicate nonces and progress rollback', () => {
    const server = seededServer();

    expect(() => server.grantNonceLease({ accountId: 'acct', deviceId: 'dev-r', keyId: 1, count: 1 })).toThrow(
      /nonce_lease_not_owned/,
    );
    expect(() => server.grantNonceLease({ accountId: 'acct', deviceId: 'dev-a', keyId: 2, count: 1 })).toThrow(
      /nonce_lease_key_not_active/,
    );

    server.recordUsedNonce({
      accountId: 'acct',
      keyId: 1,
      encryptionDeviceId: 1001n,
      counter: 7n,
      source: 'blob',
    });
    expect(() =>
      server.recordUsedNonce({
        accountId: 'acct',
        keyId: 1,
        encryptionDeviceId: 1001n,
        counter: 7n,
        source: 'staging',
      }),
    ).toThrow(/E3027/);

    server.updateProgress('acct', 'dev-a', 10n);
    expect(() => server.updateProgress('acct', 'dev-a', 9n)).toThrow(/E3024/);
  });
});

function seededServer(): InMemoryNonceLeaseServer {
  const server = new InMemoryNonceLeaseServer({ nowMs: () => 1000 });
  server.addDevice({ accountId: 'acct', deviceId: 'dev-a', encryptionDeviceId: 1001n, status: 'active' });
  server.addDevice({ accountId: 'acct', deviceId: 'dev-r', encryptionDeviceId: 1002n, status: 'revoked' });
  server.addKey({ accountId: 'acct', keyId: 1, status: 'active' });
  server.addKey({ accountId: 'acct', keyId: 2, status: 'retired' });
  return server;
}

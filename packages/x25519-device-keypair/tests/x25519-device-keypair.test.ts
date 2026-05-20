import { describe, expect, it } from 'vitest';

import {
  InMemoryDevicePairingRegistry,
  assertValidPublicKey,
  deriveDeviceSharedSecret,
  generateDeviceKeypair,
} from '../src';

describe('x25519 device keypair', () => {
  it('derives matching shared secrets for two devices', () => {
    const alice = generateDeviceKeypair();
    const bob = generateDeviceKeypair();

    const left = deriveDeviceSharedSecret({
      privateKeyPkcs8: alice.privateKeyPkcs8,
      peerPublicKeySpki: bob.publicKeySpki,
    });
    const right = deriveDeviceSharedSecret({
      privateKeyPkcs8: bob.privateKeyPkcs8,
      peerPublicKeySpki: alice.publicKeySpki,
    });

    expect(left).toEqual(right);
    expect(left.length).toBe(32);
  });

  it('rejects empty or malformed public keys', () => {
    expect(() => assertValidPublicKey(new Uint8Array(0))).toThrow(/invalid X25519/);
    expect(() => assertValidPublicKey(new Uint8Array([1, 2, 3]))).toThrow(/invalid X25519/);
  });

  it('stores device public keys and enforces pairing anti-abuse limits', () => {
    let now = 1000;
    const existing = generateDeviceKeypair();
    const next = generateDeviceKeypair();
    const registry = new InMemoryDevicePairingRegistry({
      maxDevices: 2,
      minRequestIntervalMs: 100,
      nowMs: () => now,
    });

    registry.registerDevice({
      accountId: 'acct',
      deviceId: 'dev-a',
      publicKeySpki: existing.publicKeySpki,
      status: 'active',
    });
    const request = registry.requestPairing({
      accountId: 'acct',
      requestId: 'pair-1',
      newDeviceId: 'dev-b',
      newDevicePublicKeySpki: next.publicKeySpki,
    });
    expect(request.status).toBe('pending');
    expect(registry.approvePairing('pair-1')).toMatchObject({ deviceId: 'dev-b', status: 'pending_dek_wrap' });

    now = 1050;
    expect(() =>
      registry.requestPairing({
        accountId: 'acct',
        requestId: 'pair-2',
        newDeviceId: 'dev-c',
        newDevicePublicKeySpki: generateDeviceKeypair().publicKeySpki,
      }),
    ).toThrow(/rate limited/);
  });
});

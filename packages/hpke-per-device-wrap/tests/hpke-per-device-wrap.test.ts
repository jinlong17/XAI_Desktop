import { Buffer } from 'node:buffer';
import { createPrivateKey, createPublicKey } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  deriveDeviceSharedSecret,
  generateDeviceKeypair,
  type X25519DeviceKeypair,
} from '../../x25519-device-keypair/src';

import { openDekForDevice, sealDekForDevice } from '../src';

describe('hpke per-device DEK wrap', () => {
  it('seals and opens a DEK for a single recipient device', () => {
    const recipient = generateDeviceKeypair();
    const dek = new Uint8Array(Array.from({ length: 32 }, (_, index) => index));
    const wrap = sealDekForDevice({
      dek,
      recipientPublicKeySpki: recipient.publicKeySpki,
      info: new TextEncoder().encode('account:acct/key:1'),
      aad: new TextEncoder().encode('device:dev-a'),
      iv: new Uint8Array(12).fill(7),
    });

    expect(openDekForDevice({ wrap, recipientPrivateKeyPkcs8: recipient.privateKeyPkcs8 })).toEqual(dek);
    expect(wrap.ciphertext).not.toEqual(dek);
  });

  it('rejects identical info and aad inputs', () => {
    const recipient = generateDeviceKeypair();
    const same = new TextEncoder().encode('same');

    expect(() =>
      sealDekForDevice({
        dek: new Uint8Array(32),
        recipientPublicKeySpki: recipient.publicKeySpki,
        info: same,
        aad: same,
      }),
    ).toThrow(/info and aad/);
  });

  it('matches the HKDF-SHA256 AES-GCM test vector', () => {
    const recipient = deterministicX25519Keypair(
      '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f',
    );
    const ephemeral = deterministicX25519Keypair(
      '202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f',
    );
    const dek = hexToBytes('a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf');
    const iv = hexToBytes('00112233445566778899aabb');
    const info = new TextEncoder().encode('account:acct/key:vector');
    const aad = new TextEncoder().encode('device:dev-vector');

    const sharedSecret = deriveDeviceSharedSecret({
      privateKeyPkcs8: ephemeral.privateKeyPkcs8,
      peerPublicKeySpki: recipient.publicKeySpki,
    });
    expect(toHex(sharedSecret)).toBe('9663aa1da97e848a914a436d04163dfbb89178f107f1b5b77ed3854203382854');

    const wrap = sealDekForDevice({
      dek,
      recipientPublicKeySpki: recipient.publicKeySpki,
      info,
      aad,
      ephemeralKeypair: ephemeral,
      iv,
    });

    expect(wrap.suite).toBe('X25519-HKDF-SHA256-AES256GCM');
    expect(toHex(wrap.ciphertext)).toBe('d60d81d3cb2f512a4516f4aae9687784e17c0d36265923dd04571c3cef4f5172');
    expect(toHex(wrap.tag)).toBe('e1ada172c688370fa5062bf4009e1fbc');
    expect(openDekForDevice({ wrap, recipientPrivateKeyPkcs8: recipient.privateKeyPkcs8 })).toEqual(dek);
  });
});

function deterministicX25519Keypair(privateKeyRawHex: string): X25519DeviceKeypair {
  const privateKeyPkcs8 = hexToBytes(`302e020100300506032b656e04220420${privateKeyRawHex}`);
  const privateKey = createPrivateKey({ key: Buffer.from(privateKeyPkcs8), format: 'der', type: 'pkcs8' });
  const publicKey = createPublicKey(privateKey);
  return {
    privateKeyPkcs8,
    publicKeySpki: new Uint8Array(publicKey.export({ format: 'der', type: 'spki' })),
  };
}

function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('hex');
}

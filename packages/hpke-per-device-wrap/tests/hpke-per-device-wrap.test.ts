import { describe, expect, it } from 'vitest';

import { generateDeviceKeypair } from '../../x25519-device-keypair/src';

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
});

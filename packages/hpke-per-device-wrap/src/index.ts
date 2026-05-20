import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import {
  deriveDeviceSharedSecret,
  generateDeviceKeypair,
  type X25519DeviceKeypair,
} from '../../x25519-device-keypair/src';

export interface DeviceDekWrap {
  suite: 'X25519-HKDF-SHA256-AES256GCM';
  ephemeralPublicKeySpki: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
  tag: Uint8Array;
  info: Uint8Array;
  aad: Uint8Array;
}

export function sealDekForDevice(input: {
  dek: Uint8Array;
  recipientPublicKeySpki: Uint8Array;
  info: Uint8Array;
  aad: Uint8Array;
  ephemeralKeypair?: X25519DeviceKeypair;
  iv?: Uint8Array;
}): DeviceDekWrap {
  assertInfoAndAadDistinct(input.info, input.aad);
  const ephemeral = input.ephemeralKeypair ?? generateDeviceKeypair();
  const sharedSecret = deriveDeviceSharedSecret({
    privateKeyPkcs8: ephemeral.privateKeyPkcs8,
    peerPublicKeySpki: input.recipientPublicKeySpki,
  });
  const key = deriveAesKey(sharedSecret, input.info);
  const iv = input.iv ?? new Uint8Array(randomBytes(12));
  if (iv.length !== 12) {
    throw new Error('E3005: HPKE wrap iv must be 12 bytes');
  }

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(input.aad);
  const ciphertext = concat(cipher.update(input.dek), cipher.final());
  const tag = new Uint8Array(cipher.getAuthTag());
  return {
    suite: 'X25519-HKDF-SHA256-AES256GCM',
    ephemeralPublicKeySpki: ephemeral.publicKeySpki,
    iv,
    ciphertext,
    tag,
    info: new Uint8Array(input.info),
    aad: new Uint8Array(input.aad),
  };
}

export function openDekForDevice(input: {
  wrap: DeviceDekWrap;
  recipientPrivateKeyPkcs8: Uint8Array;
}): Uint8Array {
  assertInfoAndAadDistinct(input.wrap.info, input.wrap.aad);
  const sharedSecret = deriveDeviceSharedSecret({
    privateKeyPkcs8: input.recipientPrivateKeyPkcs8,
    peerPublicKeySpki: input.wrap.ephemeralPublicKeySpki,
  });
  const key = deriveAesKey(sharedSecret, input.wrap.info);
  const decipher = createDecipheriv('aes-256-gcm', key, input.wrap.iv);
  decipher.setAAD(input.wrap.aad);
  decipher.setAuthTag(input.wrap.tag);
  return concat(decipher.update(input.wrap.ciphertext), decipher.final());
}

function deriveAesKey(sharedSecret: Uint8Array, info: Uint8Array): Uint8Array {
  return new Uint8Array(createHash('sha256').update('xai.hpke.wrap.v1').update(sharedSecret).update(info).digest());
}

function assertInfoAndAadDistinct(info: Uint8Array, aad: Uint8Array): void {
  if (bytesEqual(info, aad)) {
    throw new Error('E3005: HPKE info and aad must be distinct');
  }
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index]! ^ right[index]!;
  }
  return diff === 0;
}

function concat(...chunks: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

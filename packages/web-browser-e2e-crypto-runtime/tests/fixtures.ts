import { Buffer } from "node:buffer";
import { createPrivateKey, createPublicKey } from "node:crypto";

import type { ActiveDeviceDekWrap, SyncKeyringMetadata, UnlockInput } from "../src";
import { deriveKekKey, deriveSecretKeyCheck } from "../src/internal/argon2";
import { sealActiveWrapForTest } from "../src/internal/hpke";
import { DEFAULT_ARGON2_POLICY } from "../src/internal/policy";
import { wrapCurrentDevicePrivateKeyForTest } from "../src/internal/session";

export interface X25519KeypairFixture {
  privateKeyPkcs8: Uint8Array;
  publicKeySpki: Uint8Array;
}

export function deterministicX25519Keypair(privateKeyRawHex: string): X25519KeypairFixture {
  const privateKeyPkcs8 = hexToBytes(`302e020100300506032b656e04220420${privateKeyRawHex}`);
  const privateKey = createPrivateKey({ key: Buffer.from(privateKeyPkcs8), format: "der", type: "pkcs8" });
  const publicKey = createPublicKey(privateKey);
  return {
    privateKeyPkcs8,
    publicKeySpki: new Uint8Array(publicKey.export({ format: "der", type: "spki" })),
  };
}

export function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

export function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex.replaceAll(" ", ""), "hex"));
}

export function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

export async function buildUnlockFixture(overrides?: {
  accountId?: string;
  masterPassword?: Uint8Array;
  secretKey?: Uint8Array;
  currentKeyId?: number;
  dekBytes?: Uint8Array;
  hpkeInfo?: Uint8Array;
  hpkeAad?: Uint8Array;
}): Promise<{
  input: UnlockInput;
  dek: Uint8Array;
  recipientKeypair: X25519KeypairFixture;
  ephemeralKeypair: X25519KeypairFixture;
}> {
  const accountId = overrides?.accountId ?? "acct-1";
  const masterPassword = overrides?.masterPassword ?? utf8("correct horse battery staple");
  const secretKey = overrides?.secretKey ?? utf8("server-secret-key-material");
  const currentKeyId = overrides?.currentKeyId ?? 7;
  const dek = overrides?.dekBytes ?? hexToBytes("a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf");
  const hpkeInfo = overrides?.hpkeInfo ?? utf8("account:acct/key:7");
  const hpkeAad = overrides?.hpkeAad ?? utf8("device:dev-local");

  const kekSalt = hexToBytes("6d6f636b2d6b656b2d73616c742d7631");
  const recipientKeypair = deterministicX25519Keypair(
    "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
  );
  const ephemeralKeypair = deterministicX25519Keypair(
    "202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
  );

  const keyring: SyncKeyringMetadata = {
    kekSalt,
    kekKdfVersion: 0x13,
    currentKeyId,
    keyring: [{ keyId: currentKeyId, status: "active", canRetire: false }],
    dekCheck: new Uint8Array(32).fill(3),
    secretKeyCheck: await deriveSecretKeyCheck({ secretKey, kekSalt, currentKeyId }),
  };

  const kekKey = await deriveKekKey({ masterPassword, secretKey, salt: kekSalt, policy: DEFAULT_ARGON2_POLICY });
  const wrappedDevicePrivateKey = await wrapCurrentDevicePrivateKeyForTest({
    kekKey,
    accountId,
    currentKeyId,
    wrapVersion: 1,
    devicePrivateKeyPkcs8: recipientKeypair.privateKeyPkcs8,
    wrapNonce: hexToBytes("00112233445566778899aabb"),
  });

  const wrap = await sealActiveWrapForTest({
    dek,
    recipientPublicKeySpki: recipientKeypair.publicKeySpki,
    info: hpkeInfo,
    aad: hpkeAad,
    iv: hexToBytes("00112233445566778899aabb"),
    ephemeralKeypair,
  });

  const activeWrap: ActiveDeviceDekWrap = {
    deviceId: "dev-local",
    keyId: currentKeyId,
    encryptionDeviceId: "100042",
    wrap,
    hpkeInfo,
    hpkeAad,
  };

  return {
    dek,
    recipientKeypair,
    ephemeralKeypair,
    input: {
      accountId,
      masterPassword,
      secretKey,
      keyring,
      wrappedDevicePrivateKey,
      activeWrap,
    },
  };
}

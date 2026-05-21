import { argon2id } from "hash-wasm";

import { webCryptoError } from "../errors";
import type { Argon2Policy, SyncKeyringMetadata } from "../types";
import { asBufferSource, requireSubtleCrypto } from "./webcrypto";
import { assertBytes, bytesEqual, concatBytes, copyBytes, zeroizeBuffer } from "./buffers";

const SECRET_KEY_CHECK_LABEL = new TextEncoder().encode("sync.v0.6.secret_key_check");

export async function deriveKekKey(input: {
  masterPassword: Uint8Array;
  secretKey: Uint8Array;
  salt: Uint8Array;
  policy: Argon2Policy;
}): Promise<CryptoKey> {
  assertBytes(input.masterPassword, "masterPassword");
  assertBytes(input.secretKey, "secretKey");
  assertBytes(input.salt, "kekSalt");

  const subtle = requireSubtleCrypto();
  const argonPassword = copyBytes(input.masterPassword);
  const argonSecret = copyBytes(input.secretKey);
  let keyMaterial: Uint8Array | null = null;
  try {
    keyMaterial = await argon2id({
      password: argonPassword,
      salt: input.salt,
      secret: argonSecret,
      parallelism: input.policy.parallelism,
      iterations: input.policy.iterations,
      memorySize: input.policy.memoryKiB,
      hashLength: input.policy.outputBytes,
      outputType: "binary",
    });

    return await subtle.importKey("raw", asBufferSource(keyMaterial), { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
  } catch (cause) {
    throw webCryptoError("E_WEB_CRYPTO_BAD_PASSWORD", "Argon2id KEK derivation failed", { cause });
  } finally {
    zeroizeBuffer(argonPassword);
    zeroizeBuffer(argonSecret);
    if (keyMaterial !== null) {
      zeroizeBuffer(keyMaterial);
    }
  }
}

export async function validateSecretKeyCheck(input: {
  secretKey: Uint8Array;
  keyring: SyncKeyringMetadata;
}): Promise<void> {
  assertBytes(input.secretKey, "secretKey");
  assertBytes(input.keyring.secretKeyCheck, "secretKeyCheck");

  const expected = await deriveSecretKeyCheck({
    secretKey: input.secretKey,
    kekSalt: input.keyring.kekSalt,
    currentKeyId: input.keyring.currentKeyId,
  });

  if (!bytesEqual(expected, input.keyring.secretKeyCheck)) {
    throw webCryptoError(
      "E_WEB_CRYPTO_SECRET_KEY_MISMATCH",
      "Provided secretKey does not match keyring secret_key_check",
    );
  }
}

export async function deriveSecretKeyCheck(input: {
  secretKey: Uint8Array;
  kekSalt: Uint8Array;
  currentKeyId: number;
}): Promise<Uint8Array> {
  assertBytes(input.secretKey, "secretKey");
  assertBytes(input.kekSalt, "kekSalt");
  if (!Number.isSafeInteger(input.currentKeyId) || input.currentKeyId < 0) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "currentKeyId must be a non-negative integer");
  }

  const subtle = requireSubtleCrypto();
  const keyIdBytes = new Uint8Array(4);
  const view = new DataView(keyIdBytes.buffer);
  view.setUint32(0, input.currentKeyId, false);
  const payload = concatBytes(SECRET_KEY_CHECK_LABEL, input.kekSalt, keyIdBytes, input.secretKey);
  const digest = await subtle.digest("SHA-256", asBufferSource(payload));

  zeroizeBuffer(payload);
  zeroizeBuffer(keyIdBytes);

  return copyBytes(new Uint8Array(digest));
}

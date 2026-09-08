import { argon2id } from "hash-wasm";
import { describe, expect, it } from "vitest";

import { deriveKekKey, deriveSecretKeyCheck, validateSecretKeyCheck } from "../src/internal/argon2";
import { DEFAULT_ARGON2_POLICY } from "../src/internal/policy";
import { asBufferSource, requireSubtleCrypto } from "../src/internal/webcrypto";
import { hexToBytes, toHex, utf8 } from "./fixtures";

describe("argon2 unlock helpers", () => {
  it("matches an RFC 9106-style Argon2id vector with keyed secret input", async () => {
    // hash-wasm exposes `secret` but not associatedData, so this gate pins the keyed-input subset.
    const digest = await argon2id({
      password: new Uint8Array(32).fill(0x01),
      salt: new Uint8Array(16).fill(0x02),
      secret: new Uint8Array(8).fill(0x03),
      iterations: 3,
      parallelism: 4,
      memorySize: 32,
      hashLength: 32,
      outputType: "binary",
    });

    expect(toHex(digest)).toBe("0034de3c8a75efc1148100eaf5ba9b1ce6d50ba5cdf6ae4018c54a4fc03ac10d");
  });

  it("derives a deterministic secretKeyCheck digest", async () => {
    const digest = await deriveSecretKeyCheck({
      secretKey: utf8("server-secret-key-material"),
      kekSalt: hexToBytes("6d6f636b2d6b656b2d73616c742d7631"),
      currentKeyId: 7,
    });

    expect(toHex(digest)).toBe("22882c56029558a99cecba04f8a355e0c9562a33ccb3af3a4e691fb51a424785");
  });

  it("accepts matching secretKeyCheck and rejects mismatch", async () => {
    const secretKey = utf8("server-secret-key-material");
    const keyring = {
      kekSalt: hexToBytes("6d6f636b2d6b656b2d73616c742d7631"),
      currentKeyId: 7,
      secretKeyCheck: await deriveSecretKeyCheck({
        secretKey,
        kekSalt: hexToBytes("6d6f636b2d6b656b2d73616c742d7631"),
        currentKeyId: 7,
      }),
    };

    await expect(validateSecretKeyCheck({ secretKey, keyring: keyring as never })).resolves.toBeUndefined();
    await expect(
      validateSecretKeyCheck({ secretKey: utf8("wrong-secret"), keyring: keyring as never }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_SECRET_KEY_MISMATCH" });
  });

  it("derives a non-extractable AES KEK that changes when secretKey changes", async () => {
    const subtle = requireSubtleCrypto();
    const masterPassword = utf8("correct horse battery staple");
    const salt = hexToBytes("6d6f636b2d6b656b2d73616c742d7631");
    const kekA = await deriveKekKey({
      masterPassword,
      secretKey: utf8("server-secret-key-material"),
      salt,
      policy: DEFAULT_ARGON2_POLICY,
    });
    const kekB = await deriveKekKey({
      masterPassword,
      secretKey: utf8("server-secret-key-material-v2"),
      salt,
      policy: DEFAULT_ARGON2_POLICY,
    });

    expect(kekA.extractable).toBe(false);
    expect(kekB.extractable).toBe(false);

    const plaintext = utf8("phase2-kek-vector");
    const iv = hexToBytes("00112233445566778899aabb");
    const aad = utf8("argon2-kek-test");
    const ciphertextA = await subtle.encrypt(
      { name: "AES-GCM", iv: asBufferSource(iv), additionalData: asBufferSource(aad), tagLength: 128 },
      kekA,
      asBufferSource(plaintext),
    );
    const ciphertextB = await subtle.encrypt(
      { name: "AES-GCM", iv: asBufferSource(iv), additionalData: asBufferSource(aad), tagLength: 128 },
      kekB,
      asBufferSource(plaintext),
    );

    expect(toHex(new Uint8Array(ciphertextA))).toBe(
      "19899f88e00eed990f4dbf6d7f398479ea9c3c61a410ef52a491b6172b2cc1011b",
    );
    expect(toHex(new Uint8Array(ciphertextB))).not.toBe(toHex(new Uint8Array(ciphertextA)));
  });

});

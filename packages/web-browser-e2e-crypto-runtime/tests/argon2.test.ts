import { describe, expect, it } from "vitest";

import { deriveKekKey, deriveSecretKeyCheck, validateSecretKeyCheck } from "../src/internal/argon2";
import { DEFAULT_ARGON2_POLICY } from "../src/internal/policy";
import { asBufferSource, requireSubtleCrypto } from "../src/internal/webcrypto";
import { hexToBytes, toHex, utf8 } from "./fixtures";

describe("argon2 unlock helpers", () => {
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

  it("derives a non-extractable AES KEK that matches the local vector", async () => {
    const subtle = requireSubtleCrypto();
    const kek = await deriveKekKey({
      masterPassword: utf8("correct horse battery staple"),
      secretKey: utf8("server-secret-key-material"),
      salt: hexToBytes("6d6f636b2d6b656b2d73616c742d7631"),
      policy: DEFAULT_ARGON2_POLICY,
    });

    expect(kek.extractable).toBe(false);

    const plaintext = utf8("phase2-kek-vector");
    const iv = hexToBytes("00112233445566778899aabb");
    const aad = utf8("argon2-kek-test");
    const ciphertext = await subtle.encrypt(
      { name: "AES-GCM", iv: asBufferSource(iv), additionalData: asBufferSource(aad), tagLength: 128 },
      kek,
      asBufferSource(plaintext),
    );

    expect(toHex(new Uint8Array(ciphertext))).toBe(
      "38aa3af61c4e17e65466d169a651bd05f6c471195cbad4d0d5515ffad142dece3c",
    );
  });
});

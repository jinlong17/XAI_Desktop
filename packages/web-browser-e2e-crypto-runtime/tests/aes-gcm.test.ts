import { describe, expect, it } from "vitest";

import { createBrowserCryptoRuntime } from "../src";
import { buildUnlockFixture, utf8 } from "./fixtures";

describe("aes-gcm helpers", () => {
  it("encrypts and decrypts with deterministic nonce/AAD context", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();
    await runtime.unlock(fixture.input);

    const aad = {
      accountId: fixture.input.accountId,
      entityType: "task",
      entityId: "01hzy5gtv2hyy4n1q1h8v3g1w9",
      proposedRevision: "42",
      keyId: fixture.input.keyring.currentKeyId,
      deletedFlag: false,
      schemaVersion: 1,
      encryptionDeviceId: fixture.input.activeWrap.encryptionDeviceId,
    };

    const encrypted = await runtime.encryptBlob({
      plaintext: utf8("hello encrypted world"),
      aad,
      counter: 10,
    });

    const decrypted = await runtime.decryptBlob({
      envelope: encrypted.envelope,
      aad,
    });

    expect(new TextDecoder().decode(decrypted.plaintext)).toBe("hello encrypted world");
    expect(decrypted.header.counter).toBe(10);
    expect(decrypted.header.keyId).toBe(fixture.input.keyring.currentKeyId);
  });

  it("rejects wrong aad and tampered envelope", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();
    await runtime.unlock(fixture.input);

    const aad = {
      accountId: fixture.input.accountId,
      entityType: "task",
      entityId: "01hzy5gtv2hyy4n1q1h8v3g1w9",
      proposedRevision: "42",
      keyId: fixture.input.keyring.currentKeyId,
      deletedFlag: false,
      schemaVersion: 1,
      encryptionDeviceId: fixture.input.activeWrap.encryptionDeviceId,
    };

    const encrypted = await runtime.encryptBlob({
      plaintext: utf8("blob-swap-check"),
      aad,
      counter: 11,
    });

    await expect(
      runtime.decryptBlob({
        envelope: encrypted.envelope,
        aad: { ...aad, entityId: "different-entity" },
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_AAD_MISMATCH" });

    const tampered = new Uint8Array(encrypted.envelope);
    tampered[tampered.length - 1] ^= 0xff;
    await expect(
      runtime.decryptBlob({
        envelope: tampered,
        aad,
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_AAD_MISMATCH" });
  });
});

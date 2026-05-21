import { describe, expect, it } from "vitest";

import { createBrowserCryptoRuntime } from "../src";
import { buildUnlockFixture, toHex, utf8 } from "./fixtures";

describe("runtime vectors and negative gates", () => {
  it("produces stable envelope bytes for the local deterministic fixture", async () => {
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
      plaintext: utf8("vector-body"),
      aad,
      counter: 12,
    });

    expect(toHex(encrypted.envelope)).toBe(
      "011307000000ca860100000000000c000000e8ed424295cf32e7460c4bb39ae2bb2814cbabf758492fbf6c735d",
    );
  });

  it("rejects blob swap when envelope is decrypted under another aad context", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();
    await runtime.unlock(fixture.input);

    const aadA = {
      accountId: fixture.input.accountId,
      entityType: "task",
      entityId: "entity-a",
      proposedRevision: "1",
      keyId: fixture.input.keyring.currentKeyId,
      deletedFlag: false,
      schemaVersion: 1,
      encryptionDeviceId: fixture.input.activeWrap.encryptionDeviceId,
    };

    const aadB = {
      ...aadA,
      entityId: "entity-b",
      proposedRevision: "2",
    };

    const blobA = await runtime.encryptBlob({ plaintext: utf8("alpha"), aad: aadA, counter: 20 });
    const blobB = await runtime.encryptBlob({ plaintext: utf8("beta"), aad: aadB, counter: 21 });

    await expect(runtime.decryptBlob({ envelope: blobA.envelope, aad: aadB })).rejects.toMatchObject({
      code: "E_WEB_CRYPTO_AAD_MISMATCH",
    });
    await expect(runtime.decryptBlob({ envelope: blobB.envelope, aad: aadA })).rejects.toMatchObject({
      code: "E_WEB_CRYPTO_AAD_MISMATCH",
    });
  });
});

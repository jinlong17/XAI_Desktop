import { describe, expect, it } from "vitest";

import { createBrowserCryptoRuntime } from "../src";
import { buildUnlockFixture, utf8 } from "./fixtures";

describe("runtime unlock contract", () => {
  it("unlocks with real secretKey + wrapped device key + active wrap", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();

    const result = await runtime.unlock(fixture.input);

    expect(result.state.status).toBe("unlocked");
    expect(result.state.currentKeyId).toBe(fixture.input.keyring.currentKeyId);
  });

  it("rejects wrong secret key via secretKeyCheck validation", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();

    await expect(
      runtime.unlock({
        ...fixture.input,
        secretKey: utf8("wrong-secret-key"),
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_SECRET_KEY_MISMATCH" });
  });

  it("rejects key-id mismatch between current key and active wrap", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();

    await expect(
      runtime.unlock({
        ...fixture.input,
        activeWrap: {
          ...fixture.input.activeWrap,
          keyId: fixture.input.keyring.currentKeyId + 1,
        },
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_WRAP_KEY_MISMATCH" });
  });

  it("rejects a bad password path while unwrapping the device private key", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();

    await expect(
      runtime.unlock({
        ...fixture.input,
        masterPassword: utf8("wrong-password"),
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_BAD_PASSWORD" });
  });

  it("rejects tampered hpke aad during active-wrap open", async () => {
    const runtime = createBrowserCryptoRuntime();
    const fixture = await buildUnlockFixture();

    await expect(
      runtime.unlock({
        ...fixture.input,
        activeWrap: {
          ...fixture.input.activeWrap,
          hpkeAad: utf8("tampered-device"),
        },
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_HPKE_OPEN_FAILED" });
  });
});

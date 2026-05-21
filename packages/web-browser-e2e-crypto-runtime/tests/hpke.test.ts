import { encode } from "cbor-x";
import { describe, expect, it } from "vitest";

import { openActiveWrap, sealActiveWrapForTest } from "../src/internal/hpke";
import { asBufferSource, requireSubtleCrypto } from "../src/internal/webcrypto";
import { deterministicX25519Keypair, hexToBytes, toHex, utf8 } from "./fixtures";

describe("hpke active-wrap helpers", () => {
  it("opens the desktop deterministic HPKE reference vector", async () => {
    const recipient = deterministicX25519Keypair(
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
    );
    const ephemeral = deterministicX25519Keypair(
      "202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
    );
    const info = utf8("account:acct/key:vector");
    const aad = utf8("device:dev-vector");
    const wrap = new Uint8Array(
      encode({
        suite: "X25519-HKDF-SHA256-AES256GCM",
        ephemeralPublicKeySpki: ephemeral.publicKeySpki,
        iv: hexToBytes("00112233445566778899aabb"),
        ciphertext: hexToBytes("d60d81d3cb2f512a4516f4aae9687784e17c0d36265923dd04571c3cef4f5172"),
        tag: hexToBytes("e1ada172c688370fa5062bf4009e1fbc"),
      }),
    );

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      asBufferSource(recipient.privateKeyPkcs8),
      { name: "X25519" },
      false,
      ["deriveBits"],
    );

    const dekKey = await openActiveWrap({
      activeWrap: {
        deviceId: "dev-vector",
        keyId: 7,
        encryptionDeviceId: "100042",
        wrap,
        hpkeInfo: info,
        hpkeAad: aad,
      },
      recipientPrivateKey: privateKey,
    });

    const subtle = requireSubtleCrypto();
    const probe = utf8("hpke-open-probe");
    const probeIv = hexToBytes("0102030405060708090a0b0c");
    const encrypted = await subtle.encrypt(
      { name: "AES-GCM", iv: asBufferSource(probeIv), tagLength: 128 },
      dekKey,
      asBufferSource(probe),
    );
    expect(toHex(new Uint8Array(encrypted))).toBe("f0232c1b1530f58e2eef2645eb41c0ac646354e67b6fecdce48d3e1f5e44c1");
  });

  it("rejects identical hpke info/aad", async () => {
    const recipient = deterministicX25519Keypair(
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
    );
    const same = utf8("same");

    await expect(
      sealActiveWrapForTest({
        dek: new Uint8Array(32),
        recipientPublicKeySpki: recipient.publicKeySpki,
        info: same,
        aad: same,
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_WRAP_KEY_MISMATCH" });
  });

  it("fails open when aad is wrong", async () => {
    const recipient = deterministicX25519Keypair(
      "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
    );
    const info = utf8("account:acct/key:1");
    const aad = utf8("device:dev-a");
    const wrap = await sealActiveWrapForTest({
      dek: new Uint8Array(32).fill(9),
      recipientPublicKeySpki: recipient.publicKeySpki,
      info,
      aad,
      iv: hexToBytes("00112233445566778899aabb"),
    });

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      asBufferSource(recipient.privateKeyPkcs8),
      { name: "X25519" },
      false,
      ["deriveBits"],
    );

    await expect(
      openActiveWrap({
        activeWrap: {
          deviceId: "dev-a",
          keyId: 7,
          encryptionDeviceId: "100042",
          wrap,
          hpkeInfo: info,
          hpkeAad: utf8("device:dev-b"),
        },
        recipientPrivateKey: privateKey,
      }),
    ).rejects.toMatchObject({ code: "E_WEB_CRYPTO_HPKE_OPEN_FAILED" });
  });
});

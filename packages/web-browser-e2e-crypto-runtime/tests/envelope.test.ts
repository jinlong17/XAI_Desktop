import { describe, expect, it } from "vitest";

import { decodeEnvelope, encodeEnvelope } from "../src/internal/envelope";
import { hexToBytes, toHex } from "./fixtures";

describe("envelope codec", () => {
  it("encodes and decodes header fields with nonce reconstruction", () => {
    const ciphertext = hexToBytes("aabbccddeeff");
    const tag = hexToBytes("00112233445566778899aabbccddeeff");

    const encoded = encodeEnvelope({
      kdfVersion: 0x13,
      keyId: 7,
      encryptionDeviceId: "100042",
      counter: 42,
      ciphertext,
      tag,
    });

    const decoded = decodeEnvelope(encoded.envelope);

    expect(decoded.header.version).toBe(1);
    expect(decoded.header.kdfVersion).toBe(0x13);
    expect(decoded.header.keyId).toBe(7);
    expect(decoded.header.encryptionDeviceId).toBe("100042");
    expect(decoded.header.counter).toBe(42);
    expect(toHex(decoded.header.nonce)).toBe("ca860100000000002a000000");
    expect(decoded.ciphertext).toEqual(ciphertext);
    expect(decoded.tag).toEqual(tag);
  });

  it("rejects stale envelope version", () => {
    const ciphertext = hexToBytes("aabbccddeeff");
    const tag = hexToBytes("00112233445566778899aabbccddeeff");
    const encoded = encodeEnvelope({
      kdfVersion: 0x13,
      keyId: 7,
      encryptionDeviceId: "100042",
      counter: 42,
      ciphertext,
      tag,
    });
    encoded.envelope[0] = 2;

    expect(() => decodeEnvelope(encoded.envelope)).toThrow(/version/);
  });
});

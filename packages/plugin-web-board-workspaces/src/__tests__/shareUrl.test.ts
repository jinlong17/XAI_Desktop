/**
 * Tests for generateShareUrl — SU-1..SU-6
 * Gap-closure row #6 — board-workspaces slice
 */
import { describe, test, expect } from "vitest";
import { generateShareUrl } from "../internal/shareUrl.js";

const SHARE_BASE = "https://xai-web.example/share/";

describe("generateShareUrl", () => {
  test("SU-1 resolves to a string starting with the share base", async () => {
    const url = await generateShareUrl("b-default");
    expect(url.startsWith(SHARE_BASE)).toBe(true);
  });

  test("SU-2 same input → same output across 2 calls (deterministic)", async () => {
    const url1 = await generateShareUrl("b-default");
    const url2 = await generateShareUrl("b-default");
    expect(url1).toBe(url2);
  });

  test("SU-3 different inputs → different outputs (hash distinguishability)", async () => {
    const ids = ["b-1", "b-2", "b-3", "b-4"];
    const urls = await Promise.all(ids.map(generateShareUrl));
    const unique = new Set(urls);
    expect(unique.size).toBe(ids.length); // all distinct
  });

  test("SU-4 hex tail is exactly 8 chars + matches /^[0-9a-f]{8}$/", async () => {
    const url = await generateShareUrl("b-default");
    const tail = url.slice(SHARE_BASE.length);
    expect(tail.length).toBe(8);
    expect(/^[0-9a-f]{8}$/.test(tail)).toBe(true);
  });

  test("SU-5 unicode board id produces stable hash (no encoding crash)", async () => {
    const url = await generateShareUrl("b-看板-1");
    expect(url.startsWith(SHARE_BASE)).toBe(true);
    // Should call twice and get same result
    const url2 = await generateShareUrl("b-看板-1");
    expect(url).toBe(url2);
  });

  test("SU-6 crypto.subtle === undefined fallback returns boardId.slice(0,8)", async () => {
    // Temporarily replace globalThis.crypto
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
      writable: true,
    });
    try {
      const url = await generateShareUrl("b-default");
      expect(url).toBe(SHARE_BASE + "b-defaul"); // boardId.slice(0,8)
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        value: originalCrypto,
        configurable: true,
        writable: true,
      });
    }
  });
});

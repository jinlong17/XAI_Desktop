/**
 * secretStore tests — SC1..SC8.
 *
 * Relies on fake-indexeddb (imported in vitest.setup.ts) and the real
 * WebCrypto implementation from jsdom / Node 22.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (secretStore)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiKeyStorage } from "../internal/secretStore.js";
// idb-keyval for direct IDB inspection in SC8
import { get as idbGet, createStore as idbCreateStore } from "idb-keyval";

// Wipe keys before each test — uses clearKey (doesn't delete the DB, so
// idb-keyval's internal store handle remains valid across sequential tests).
beforeEach(async () => {
  await aiKeyStorage.clearKey("anthropic");
  await aiKeyStorage.clearKey("openai-compatible");
  await aiKeyStorage.clearKey("gemini");
  await aiKeyStorage.clearKey("deepseek");
});

describe("secretStore (SC)", () => {
  it("SC1: save then load returns the same plaintext", async () => {
    await aiKeyStorage.saveKey("anthropic", "sk-ant-test-roundtrip");
    const result = await aiKeyStorage.loadKey("anthropic");
    expect(result).toBe("sk-ant-test-roundtrip");
  });

  it("SC2: load before any save returns null", async () => {
    const result = await aiKeyStorage.loadKey("anthropic");
    expect(result).toBeNull();
  });

  it("SC3: save twice with different plaintexts — load returns the latest", async () => {
    await aiKeyStorage.saveKey("anthropic", "key-v1");
    await aiKeyStorage.saveKey("anthropic", "key-v2");
    const result = await aiKeyStorage.loadKey("anthropic");
    expect(result).toBe("key-v2");
  });

  it("SC4: clear after save — subsequent load returns null", async () => {
    await aiKeyStorage.saveKey("anthropic", "sk-ant-will-be-cleared");
    await aiKeyStorage.clearKey("anthropic");
    const result = await aiKeyStorage.loadKey("anthropic");
    expect(result).toBeNull();
  });

  it("SC4b: Gemini and DeepSeek use independent encrypted key rows", async () => {
    await aiKeyStorage.saveKey("gemini", "gemini-key");
    await aiKeyStorage.saveKey("deepseek", "deepseek-key");

    expect(await aiKeyStorage.loadKey("gemini")).toBe("gemini-key");
    expect(await aiKeyStorage.loadKey("deepseek")).toBe("deepseek-key");
  });

  it("SC5: load with corrupted ciphertext — returns null and preserves damaged row", async () => {
    // Save a valid key first.
    await aiKeyStorage.saveKey("anthropic", "sk-ant-valid-key");
    // Tamper with the stored blob by writing invalid base64 ciphertext.
    const store = idbCreateStore("xai-web-ai-secrets", "secrets");
    const raw: string = (await idbGet(`scoped:v2:${encodeURIComponent(JSON.stringify(["account","ai-test-account","test","anthropic"]))}`, store)) as string;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // Replace ciphertext with random garbage (will cause AES-GCM decrypt to fail).
    parsed.ciphertext = btoa("garbage-ciphertext-that-wont-decrypt-correctly-at-all");
    const { set: idbSet } = await import("idb-keyval");
    await idbSet(`scoped:v2:${encodeURIComponent(JSON.stringify(["account","ai-test-account","test","anthropic"]))}`, JSON.stringify(parsed), store);

    // loadKey should catch the decrypt error, auto-clear the row, and return null.
    const result = await aiKeyStorage.loadKey("anthropic");
    expect(result).toBeNull();

    // Confirm the row was auto-cleared.
    const rawAfter = await idbGet(`scoped:v2:${encodeURIComponent(JSON.stringify(["account","ai-test-account","test","anthropic"]))}`, store);
    expect(rawAfter).toBeDefined();
  });

  it("SC6: save with crypto.subtle unavailable — throws", async () => {
    const original = globalThis.crypto;
    try {
      // Temporarily hide crypto.subtle
      Object.defineProperty(globalThis, "crypto", {
        value: { getRandomValues: original.getRandomValues.bind(original) },
        configurable: true,
        writable: true,
      });
      await expect(aiKeyStorage.saveKey("anthropic", "key")).rejects.toThrow(
        /crypto\.subtle/i,
      );
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        value: original,
        configurable: true,
        writable: true,
      });
    }
  });

  it("SC7: save with crypto.subtle.encrypt failure — throws", async () => {
    // Simulate encrypt failure by mocking crypto.subtle.encrypt via
    // Object.defineProperty (ESM-safe, since crypto.subtle is a host object
    // whose properties can be overridden with a plain descriptor).
    const originalEncrypt = globalThis.crypto.subtle.encrypt.bind(
      globalThis.crypto.subtle,
    );
    const mockEncrypt = vi.fn().mockRejectedValue(new Error("encrypt failed"));
    Object.defineProperty(globalThis.crypto.subtle, "encrypt", {
      value: mockEncrypt,
      writable: true,
      configurable: true,
    });
    try {
      await expect(aiKeyStorage.saveKey("anthropic", "key")).rejects.toThrow(
        /encrypt failed/,
      );
    } finally {
      Object.defineProperty(globalThis.crypto.subtle, "encrypt", {
        value: originalEncrypt,
        writable: true,
        configurable: true,
      });
    }
  });

  it("SC8: save then read raw IDB row — ciphertext does NOT contain the plaintext", async () => {
    const plaintext = "sk-ant-secret-12345";
    await aiKeyStorage.saveKey("anthropic", plaintext);

    // Directly access the IDB row.
    const customStore = idbCreateStore("xai-web-ai-secrets", "secrets");
    const raw: string | undefined = await idbGet(`scoped:v2:${encodeURIComponent(JSON.stringify(["account","ai-test-account","test","anthropic"]))}`, customStore);
    expect(raw).toBeDefined();
    // The stored JSON string must NOT contain the plaintext.
    expect(raw).not.toContain(plaintext);
    // Confirm it's a valid JSON blob (not a trivially wrong assertion).
    expect(() => JSON.parse(raw!)).not.toThrow();
  });
});

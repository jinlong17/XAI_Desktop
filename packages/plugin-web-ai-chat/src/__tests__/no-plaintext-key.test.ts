/**
 * no-plaintext-key.test.ts — NP1 acceptance signal for AS3.
 *
 * Asserts that after saving a key, the plaintext does NOT appear in
 * localStorage OR the raw IDB ciphertext blob.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §7.2 (no-plaintext-key)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { aiKeyStorage } from "../internal/secretStore.js";
import { get as idbGet, createStore as idbCreateStore } from "idb-keyval";

beforeEach(async () => {
  await aiKeyStorage.clearKey("anthropic");
  await aiKeyStorage.clearKey("openai-compatible");
  localStorage.clear();
});

describe("no-plaintext-key invariant (NP)", () => {
  it("NP1: plaintext key must NOT appear in localStorage or IDB ciphertext blob", async () => {
    const plaintext = "sk-ant-test-12345-secret";
    await aiKeyStorage.saveKey("anthropic", plaintext);

    // Check all localStorage keys/values
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) ?? "";
      const val = localStorage.getItem(key) ?? "";
      expect(val).not.toContain(plaintext);
    }

    // Check raw IDB value
    const customStore = idbCreateStore("xai-web-ai-secrets", "secrets");
    const raw: string | undefined = await idbGet("anthropic", customStore);
    expect(raw).toBeDefined();
    // The raw string is JSON — must not contain the plaintext.
    expect(raw).not.toContain(plaintext);

    // Extra: the JSON is a valid StoredSecretBlob shape.
    const parsed = JSON.parse(raw!) as Record<string, unknown>;
    expect(parsed.version).toBe(1);
    expect(parsed.algo).toBe("AES-GCM");
    expect(parsed.kdfIterations).toBe(600_000);
    expect(typeof parsed.ciphertext).toBe("string"); // base64
    expect(typeof parsed.iv).toBe("string");
    expect(typeof parsed.salt).toBe("string");
  });
});

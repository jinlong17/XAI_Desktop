/**
 * ids.test — createEventId crypto path + fallback.
 * 4 cases.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createEventId } from "../internal/eventStore/ids.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createEventId — crypto path", () => {
  it("uses crypto.randomUUID() when available", () => {
    const spy = vi.spyOn(globalThis.crypto, "randomUUID");
    const id = createEventId();
    expect(spy).toHaveBeenCalled();
    expect(id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("produces distinct ids across calls", () => {
    const a = createEventId();
    const b = createEventId();
    expect(a).not.toBe(b);
  });
});

describe("createEventId — fallback path", () => {
  it("falls back when globalThis.crypto is undefined", () => {
    const original = globalThis.crypto;
    // @ts-expect-error — simulating very old runtime
    delete globalThis.crypto;
    try {
      const id = createEventId();
      expect(id).toMatch(/^evt-/);
    } finally {
      globalThis.crypto = original;
    }
  });

  it("falls back when crypto.randomUUID is missing", () => {
    const original = globalThis.crypto;
    const stub = { randomUUID: undefined } as unknown as Crypto;
    Object.defineProperty(globalThis, "crypto", { value: stub, configurable: true });
    try {
      const id = createEventId();
      expect(id).toMatch(/^evt-/);
    } finally {
      Object.defineProperty(globalThis, "crypto", { value: original, configurable: true });
    }
  });
});

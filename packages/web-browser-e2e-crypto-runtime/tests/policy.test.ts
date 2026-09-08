import { describe, expect, it } from "vitest";

import { WebCryptoRuntimeError } from "../src/errors";
import { DEFAULT_ARGON2_POLICY, resolveArgon2Policy } from "../src/internal/policy";

describe("Argon2id policy", () => {
  it("freezes Sync v0.6 KEK defaults", () => {
    expect(DEFAULT_ARGON2_POLICY).toEqual({
      id: "sync-v0.6-argon2id-kek",
      version: 0x13,
      iterations: 3,
      memoryKiB: 65536,
      parallelism: 4,
      outputBytes: 32,
    });
    expect(Object.isFrozen(DEFAULT_ARGON2_POLICY)).toBe(true);
  });

  it("allows implementation tests to lower cost without changing output contract", () => {
    const policy = resolveArgon2Policy({ iterations: 1, memoryKiB: 32, parallelism: 1 });

    expect(policy).toMatchObject({ iterations: 1, memoryKiB: 32, parallelism: 1, outputBytes: 32 });
    expect(Object.isFrozen(policy)).toBe(true);
  });

  it("rejects policy drift that would change the KEK shape", () => {
    expect(() => resolveArgon2Policy({ outputBytes: 16 })).toThrow(WebCryptoRuntimeError);
  });
});

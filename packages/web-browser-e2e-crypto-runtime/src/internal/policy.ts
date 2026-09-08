import type { Argon2Policy } from "../types";
import { webCryptoError } from "../errors";

export const DEFAULT_ARGON2_POLICY: Argon2Policy = Object.freeze({
  id: "sync-v0.6-argon2id-kek",
  version: 0x13,
  iterations: 3,
  memoryKiB: 64 * 1024,
  parallelism: 4,
  outputBytes: 32,
});

export function resolveArgon2Policy(input?: Partial<Argon2Policy>): Argon2Policy {
  const policy: Argon2Policy = {
    ...DEFAULT_ARGON2_POLICY,
    ...input,
    id: "sync-v0.6-argon2id-kek",
    version: 0x13,
    outputBytes: input?.outputBytes ?? DEFAULT_ARGON2_POLICY.outputBytes,
  };
  assertArgon2Policy(policy);
  return Object.freeze(policy);
}

export function assertArgon2Policy(policy: Argon2Policy): void {
  if (policy.version !== 0x13) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Argon2id policy version must be 0x13");
  }
  if (!Number.isSafeInteger(policy.iterations) || policy.iterations < 1) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Argon2id iterations must be a positive integer");
  }
  if (!Number.isSafeInteger(policy.memoryKiB) || policy.memoryKiB < 8 * policy.parallelism) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Argon2id memoryKiB must be at least 8 * parallelism");
  }
  if (!Number.isSafeInteger(policy.parallelism) || policy.parallelism < 1) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Argon2id parallelism must be a positive integer");
  }
  if (policy.outputBytes !== 32) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Sync v0.6 KEK derivation must output 32 bytes");
  }
}

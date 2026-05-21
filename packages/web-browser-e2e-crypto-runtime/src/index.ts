export type {
  ActiveDeviceDekWrap,
  Argon2Policy,
  BlobAadInput,
  BrowserCryptoRuntime,
  BrowserCryptoState,
  DecryptBlobInput,
  DecryptBlobResult,
  EncryptBlobInput,
  EncryptBlobResult,
  EnvelopeHeader,
  IdleLockConfig,
  KeyStatus,
  LockReason,
  RuntimeTransition,
  RuntimeTransitionListener,
  SyncKeyringEntry,
  SyncKeyringMetadata,
  UnlockInput,
  UnlockResult,
  WrappedDevicePrivateKey,
  ZeroizeOptions,
} from "./types";
export {
  WebCryptoRuntimeError,
  isWebCryptoRuntimeError,
  type WebCryptoErrorCode,
} from "./errors";
export { DEFAULT_ARGON2_POLICY, resolveArgon2Policy } from "./internal/policy";
export { zeroizeBuffer } from "./internal/buffers";

import type {
  BrowserCryptoRuntime,
  IdleLockConfig,
  LockReason,
  RuntimeTransitionListener,
  UnlockInput,
  UnlockResult,
} from "./types";
import { webCryptoError } from "./errors";
import { createIdleLockController, createLockTransitionStore } from "./internal/idle-lock";

export function createBrowserCryptoRuntime(): BrowserCryptoRuntime {
  const transitions = createLockTransitionStore();
  const idleLock = createIdleLockController();

  return {
    async unlock(_input: UnlockInput): Promise<UnlockResult> {
      throw webCryptoError("E_WEB_CRYPTO_UNSUPPORTED", "Unlock is not wired until the Sync v0.6 runtime phase");
    },
    async lock(reason: LockReason = "manual"): Promise<void> {
      idleLock.clear();
      transitions.lock(reason);
    },
    getState() {
      return transitions.getState();
    },
    subscribe(listener: RuntimeTransitionListener) {
      return transitions.subscribe(listener);
    },
    configureIdleLock(input: IdleLockConfig) {
      idleLock.configure({
        timeoutMs: input.timeoutMs,
        onIdle: () => {
          transitions.lock("idle");
        },
      });
      transitions.setIdleDeadline(idleLock.getDeadlineMs());
    },
    async encryptBlob() {
      throw webCryptoError("E_WEB_CRYPTO_LOCKED", "Encrypt requires an unlocked DEK session");
    },
    async decryptBlob() {
      throw webCryptoError("E_WEB_CRYPTO_LOCKED", "Decrypt requires an unlocked DEK session");
    },
  };
}

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
  DecryptBlobInput,
  DecryptBlobResult,
  EncryptBlobInput,
  EncryptBlobResult,
} from "./types";
import { webCryptoError } from "./errors";
import { createRuntimeSessionController } from "./internal/session";

export function createBrowserCryptoRuntime(): BrowserCryptoRuntime {
  const session = createRuntimeSessionController();

  return {
    unlock(input) {
      return session.unlock(input);
    },
    lock(reason) {
      return session.lock(reason);
    },
    getState() {
      return session.getState();
    },
    subscribe(listener) {
      return session.subscribe(listener);
    },
    configureIdleLock(input) {
      session.configureIdleLock(input);
    },
    async encryptBlob(_input: EncryptBlobInput): Promise<EncryptBlobResult> {
      throw webCryptoError(
        "E_WEB_CRYPTO_LOCKED",
        "Encrypt helper is not wired until the AES-GCM envelope phase completes",
      );
    },
    async decryptBlob(_input: DecryptBlobInput): Promise<DecryptBlobResult> {
      throw webCryptoError(
        "E_WEB_CRYPTO_LOCKED",
        "Decrypt helper is not wired until the AES-GCM envelope phase completes",
      );
    },
  };
}

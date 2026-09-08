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
import { decryptBlobWithDek, encryptBlobWithDek } from "./internal/aes-gcm";
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
    async encryptBlob(input: EncryptBlobInput): Promise<EncryptBlobResult> {
      return session.withActiveDek(async ({ key, kdfVersion, currentKeyId }) => {
        return encryptBlobWithDek({
          dekKey: key,
          kdfVersion,
          currentKeyId,
          payload: input,
        });
      });
    },
    async decryptBlob(input: DecryptBlobInput): Promise<DecryptBlobResult> {
      return session.withActiveDek(async ({ key }) => {
        return decryptBlobWithDek({
          dekKey: key,
          payload: input,
        });
      });
    },
  };
}

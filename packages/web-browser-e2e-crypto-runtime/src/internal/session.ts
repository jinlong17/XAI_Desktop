import { webCryptoError, type WebCryptoRuntimeError } from "../errors";
import type {
  BrowserCryptoState,
  IdleLockConfig,
  LockReason,
  RuntimeTransition,
  RuntimeTransitionListener,
  UnlockInput,
  UnlockResult,
  WrappedDevicePrivateKey,
} from "../types";
import { deriveKekKey, validateSecretKeyCheck } from "./argon2";
import { assertBytes, concatBytes, zeroizeBuffer } from "./buffers";
import {
  createIdleLockController,
  createLockTransitionStore,
  type IdleLockController,
  type LockTransitionStore,
} from "./idle-lock";
import { importX25519PrivateKey, openActiveWrap } from "./hpke";
import { resolveArgon2Policy } from "./policy";
import { asBufferSource, requireSubtleCrypto } from "./webcrypto";

const WRAPPED_DEVICE_KEY_AAD_LABEL = new TextEncoder().encode("sync.v0.6.wrapped_device_private_key");

export interface RuntimeSessionController {
  unlock(input: UnlockInput): Promise<UnlockResult>;
  lock(reason?: LockReason): Promise<void>;
  getState(): BrowserCryptoState;
  subscribe(listener: RuntimeTransitionListener): () => void;
  configureIdleLock(input: IdleLockConfig): void;
  withActiveDek<T>(
    callback: (input: { key: CryptoKey; state: BrowserCryptoState; kdfVersion: number; currentKeyId: number }) => Promise<T>,
  ): Promise<T>;
}

export function createRuntimeSessionController(input?: {
  transitions?: LockTransitionStore;
  idleLock?: IdleLockController;
}): RuntimeSessionController {
  const transitions = input?.transitions ?? createLockTransitionStore();
  const idleLock = input?.idleLock ?? createIdleLockController();

  let idleTimeoutMs: number | null = null;
  let activeDek: CryptoKey | null = null;
  let activeKdfVersion = 0;
  let activeKeyId: number | null = null;

  async function lockInternal(reason: LockReason, errorCode?: string): Promise<RuntimeTransition | null> {
    activeDek = null;
    activeKdfVersion = 0;
    activeKeyId = null;
    idleLock.clear();
    return transitions.lock(reason, errorCode);
  }

  return {
    async unlock(inputUnlock) {
      transitions.transitionToUnlocking();

      try {
        validateUnlockInput(inputUnlock);
        validateKeyringAndWrap(inputUnlock);
        await validateSecretKeyCheck({ secretKey: inputUnlock.secretKey, keyring: inputUnlock.keyring });

        const policy = resolveArgon2Policy(inputUnlock.policy);
        const kekKey = await deriveKekKey({
          masterPassword: inputUnlock.masterPassword,
          secretKey: inputUnlock.secretKey,
          salt: inputUnlock.keyring.kekSalt,
          policy,
        });

        const devicePrivateKey = await unwrapCurrentDevicePrivateKey({
          kekKey,
          accountId: inputUnlock.accountId,
          currentKeyId: inputUnlock.keyring.currentKeyId,
          wrappedDevicePrivateKey: inputUnlock.wrappedDevicePrivateKey,
        });

        activeDek = await openActiveWrap({
          activeWrap: inputUnlock.activeWrap,
          recipientPrivateKey: devicePrivateKey,
        });
        activeKdfVersion = inputUnlock.keyring.kekKdfVersion;
        activeKeyId = inputUnlock.keyring.currentKeyId;

        if (idleTimeoutMs !== null) {
          idleLock.bump();
        }

        const transition = transitions.transitionToUnlocked(inputUnlock.keyring.currentKeyId, idleLock.getDeadlineMs());
        return {
          state: transitions.getState(),
          transition,
        };
      } catch (error) {
        const typed = toRuntimeError(error);
        await lockInternal("error", typed.code);
        throw typed;
      }
    },
    async lock(reason = "manual") {
      await lockInternal(reason);
    },
    getState() {
      return transitions.getState();
    },
    subscribe(listener) {
      return transitions.subscribe(listener);
    },
    configureIdleLock(inputConfig) {
      idleTimeoutMs = inputConfig.timeoutMs;
      idleLock.configure({
        timeoutMs: inputConfig.timeoutMs,
        onIdle: () => {
          void lockInternal("idle");
        },
      });
      transitions.setIdleDeadline(idleLock.getDeadlineMs());
    },
    async withActiveDek(callback) {
      if (!activeDek || activeKeyId === null) {
        throw webCryptoError("E_WEB_CRYPTO_LOCKED", "No unlocked DEK session is available");
      }
      if (idleTimeoutMs !== null) {
        idleLock.bump();
        transitions.setIdleDeadline(idleLock.getDeadlineMs());
      }
      return callback({
        key: activeDek,
        state: transitions.getState(),
        kdfVersion: activeKdfVersion,
        currentKeyId: activeKeyId,
      });
    },
  };
}

export function validateKeyringAndWrap(input: Pick<UnlockInput, "keyring" | "activeWrap">): void {
  if (!Number.isSafeInteger(input.keyring.currentKeyId) || input.keyring.currentKeyId < 0) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "keyring.currentKeyId must be a non-negative integer");
  }

  const currentEntry = input.keyring.keyring.find((entry) => entry.keyId === input.keyring.currentKeyId);
  if (!currentEntry) {
    throw webCryptoError("E_WEB_CRYPTO_WRAP_UNAVAILABLE", "Current key id not found in keyring metadata");
  }

  if (input.activeWrap.keyId !== input.keyring.currentKeyId) {
    throw webCryptoError("E_WEB_CRYPTO_WRAP_KEY_MISMATCH", "Active wrap keyId does not match keyring currentKeyId");
  }

  if (input.activeWrap.wrap.byteLength === 0) {
    throw webCryptoError("E_WEB_CRYPTO_WRAP_UNAVAILABLE", "Active wrap is missing wrap payload");
  }

  if (!input.activeWrap.deviceId) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Active wrap deviceId must be non-empty");
  }

  if (!input.activeWrap.encryptionDeviceId) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "Active wrap encryptionDeviceId must be non-empty");
  }
}

function validateUnlockInput(input: UnlockInput): void {
  if (!input.accountId) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "accountId must be non-empty");
  }
  assertBytes(input.masterPassword, "masterPassword");
  assertBytes(input.secretKey, "secretKey");
  assertBytes(input.keyring.kekSalt, "keyring.kekSalt");
  assertBytes(input.keyring.dekCheck, "keyring.dekCheck");
  assertBytes(input.keyring.secretKeyCheck, "keyring.secretKeyCheck");
  assertBytes(input.wrappedDevicePrivateKey.wrappedKey, "wrappedDevicePrivateKey.wrappedKey");
  assertBytes(input.wrappedDevicePrivateKey.wrapNonce, "wrappedDevicePrivateKey.wrapNonce", 12);
  assertBytes(input.activeWrap.wrap, "activeWrap.wrap");
  assertBytes(input.activeWrap.hpkeAad, "activeWrap.hpkeAad");
  assertBytes(input.activeWrap.hpkeInfo, "activeWrap.hpkeInfo");
}

async function unwrapCurrentDevicePrivateKey(input: {
  kekKey: CryptoKey;
  accountId: string;
  currentKeyId: number;
  wrappedDevicePrivateKey: WrappedDevicePrivateKey;
}): Promise<CryptoKey> {
  const subtle = requireSubtleCrypto();
  const aad = wrappedDeviceKeyAad(input.accountId, input.currentKeyId, input.wrappedDevicePrivateKey.wrapVersion);
  let privateKeyPkcs8: Uint8Array | null = null;

  try {
    const decrypted = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: asBufferSource(input.wrappedDevicePrivateKey.wrapNonce),
        additionalData: asBufferSource(aad),
        tagLength: 128,
      },
      input.kekKey,
      asBufferSource(input.wrappedDevicePrivateKey.wrappedKey),
    );

    privateKeyPkcs8 = new Uint8Array(decrypted);
    return await importX25519PrivateKey(privateKeyPkcs8);
  } catch (cause) {
    throw webCryptoError(
      "E_WEB_CRYPTO_BAD_PASSWORD",
      "Unable to unwrap current device private key with the derived KEK",
      { cause },
    );
  } finally {
    zeroizeBuffer(aad);
    if (privateKeyPkcs8) {
      zeroizeBuffer(privateKeyPkcs8);
    }
  }
}

export async function wrapCurrentDevicePrivateKeyForTest(input: {
  kekKey: CryptoKey;
  accountId: string;
  currentKeyId: number;
  wrapVersion: number;
  devicePrivateKeyPkcs8: Uint8Array;
  wrapNonce: Uint8Array;
}): Promise<WrappedDevicePrivateKey> {
  const subtle = requireSubtleCrypto();
  assertBytes(input.devicePrivateKeyPkcs8, "devicePrivateKeyPkcs8");
  assertBytes(input.wrapNonce, "wrapNonce", 12);
  const aad = wrappedDeviceKeyAad(input.accountId, input.currentKeyId, input.wrapVersion);

  const wrapped = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: asBufferSource(input.wrapNonce),
      additionalData: asBufferSource(aad),
      tagLength: 128,
    },
    input.kekKey,
    asBufferSource(input.devicePrivateKeyPkcs8),
  );

  zeroizeBuffer(aad);

  return {
    wrappedKey: new Uint8Array(wrapped),
    wrapNonce: new Uint8Array(input.wrapNonce),
    wrapVersion: input.wrapVersion,
  };
}

function wrappedDeviceKeyAad(accountId: string, currentKeyId: number, wrapVersion: number): Uint8Array {
  if (!Number.isSafeInteger(currentKeyId) || currentKeyId < 0) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "currentKeyId must be a non-negative integer");
  }
  if (!Number.isSafeInteger(wrapVersion) || wrapVersion < 0) {
    throw webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", "wrapVersion must be a non-negative integer");
  }

  const keyIdBytes = new Uint8Array(4);
  new DataView(keyIdBytes.buffer).setUint32(0, currentKeyId, false);
  const wrapVersionBytes = new Uint8Array(4);
  new DataView(wrapVersionBytes.buffer).setUint32(0, wrapVersion, false);
  return concatBytes(WRAPPED_DEVICE_KEY_AAD_LABEL, new TextEncoder().encode(accountId), keyIdBytes, wrapVersionBytes);
}

function toRuntimeError(error: unknown): WebCryptoRuntimeError {
  if (error && typeof error === "object" && "name" in error && error.name === "WebCryptoRuntimeError") {
    return error as WebCryptoRuntimeError;
  }

  if (error instanceof TypeError) {
    return webCryptoError("E_WEB_CRYPTO_INVALID_INPUT", error.message, { cause: error });
  }

  return webCryptoError("E_WEB_CRYPTO_HPKE_OPEN_FAILED", "Unlock failed", { cause: error });
}

/**
 * macOS Keychain bridge — TS wrapper for secret_set / secret_get / secret_del.
 *
 * Red line #4 compliance: this module NEVER imports @tauri-apps/api directly.
 * All Tauri IPC goes through the `invoke` function obtained from
 * `useTauriInvoke()` (@repo/core/hooks) and injected by the caller.
 *
 * Usage (inside a React component or hook):
 *   const { invoke } = useTauriInvoke();
 *   const kc = createKeychainClient(invoke);
 *   await kc.secretSet('xai.refresh_token.u1', bytes);
 *
 * Usage (outside React — pass invoke obtained once from useTauriInvoke):
 *   const invoke = createKeychainClient(invokeFn).secretGet;
 *
 * All errors surface as `KeychainError` instances with a typed `code` field
 * parsed from the `E11xx:` JS-parseable prefix on the Rust Display string.
 */

/** E11xx error codes mirroring AppError variants in error.rs. */
export const KEYCHAIN_ERROR_CODES = {
  LOCKED: 'E1100',
  NOT_FOUND: 'E1101',
  ACL_DENIED: 'E1102',
  BACKEND: 'E1103',
  UNSUPPORTED_PLATFORM: 'E1104',
} as const;

export type KeychainErrorCode =
  (typeof KEYCHAIN_ERROR_CODES)[keyof typeof KEYCHAIN_ERROR_CODES];

/** Typed error for Keychain bridge failures. */
export class KeychainError extends Error {
  public readonly code: KeychainErrorCode;
  public readonly rawMessage: string;

  constructor(code: KeychainErrorCode, rawMessage: string) {
    super(rawMessage);
    this.name = 'KeychainError';
    this.code = code;
    this.rawMessage = rawMessage;
  }
}

/**
 * Parse a raw AppError string (e.g. "E1100: keychain locked …") into a
 * `KeychainError`. Falls back to E1103 (backend) if the prefix is unrecognised.
 */
export function parseKeychainError(raw: unknown): KeychainError {
  const msg = typeof raw === 'string' ? raw : JSON.stringify(raw);
  for (const code of Object.values(KEYCHAIN_ERROR_CODES)) {
    if (msg.startsWith(code + ':')) {
      return new KeychainError(code as KeychainErrorCode, msg);
    }
  }
  // Unrecognised prefix — wrap as backend error
  return new KeychainError(KEYCHAIN_ERROR_CODES.BACKEND, msg);
}

/** The `invoke` function type returned by `useTauriInvoke()`. */
type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

/** Keychain client bound to a specific invoke transport seam. */
export interface KeychainClient {
  secretSet(key: string, value: Uint8Array): Promise<void>;
  secretGet(key: string): Promise<Uint8Array>;
  secretDel(key: string): Promise<void>;
}

/**
 * Create a `KeychainClient` bound to the given `invoke` seam.
 *
 * The `invoke` parameter MUST come from `useTauriInvoke()` — never pass
 * `@tauri-apps/api/core.invoke` directly here (red line #4).
 *
 * @param invoke - The `invoke` function from `useTauriInvoke().invoke`.
 */
export function createKeychainClient(invoke: InvokeFn): KeychainClient {
  return {
    async secretSet(key: string, value: Uint8Array): Promise<void> {
      try {
        await invoke<void>('secret_set', {
          key,
          value: Array.from(value), // serde_json serialises Vec<u8> as array of numbers
        });
      } catch (err) {
        throw parseKeychainError(err);
      }
    },

    async secretGet(key: string): Promise<Uint8Array> {
      try {
        const result = await invoke<number[]>('secret_get', { key });
        return new Uint8Array(result);
      } catch (err) {
        throw parseKeychainError(err);
      }
    },

    async secretDel(key: string): Promise<void> {
      try {
        await invoke<void>('secret_del', { key });
      } catch (err) {
        throw parseKeychainError(err);
      }
    },
  };
}

// ── Module-level convenience exports ──────────────────────────────────────────
// These are thin wrappers for callers that want to pass invoke separately
// rather than constructing a client object.

/**
 * Store bytes under `key` in the macOS Keychain.
 * @param invoke - from `useTauriInvoke().invoke` (red line #4 — NEVER @tauri-apps/api)
 */
export async function secretSet(
  invoke: InvokeFn,
  key: string,
  value: Uint8Array,
): Promise<void> {
  return createKeychainClient(invoke).secretSet(key, value);
}

/**
 * Retrieve bytes stored under `key` from the macOS Keychain.
 * @param invoke - from `useTauriInvoke().invoke`
 */
export async function secretGet(
  invoke: InvokeFn,
  key: string,
): Promise<Uint8Array> {
  return createKeychainClient(invoke).secretGet(key);
}

/**
 * Delete the keychain item for `key` (idempotent — no error if absent).
 * @param invoke - from `useTauriInvoke().invoke`
 */
export async function secretDel(invoke: InvokeFn, key: string): Promise<void> {
  return createKeychainClient(invoke).secretDel(key);
}

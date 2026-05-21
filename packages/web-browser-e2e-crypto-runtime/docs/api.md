# web-browser-e2e-crypto-runtime — API / Contract Notes

## Runtime API

This row plans the browser crypto runtime boundary. Final symbol names may tighten during build, but the package contract is frozen around one public surface exported from `index.ts`.

## Upstream Interfaces

| Surface | Assumption |
|---|---|
| `packages/web-sync-crypto-contract-preflight/docs/api.md` | AAD/envelope/wire semantics and browser HPKE requirement are already frozen and must be reused here without field drift. |
| `docs/planning/sub-prds/sync/PRD.md` | `encrypted_dek` is obsolete; `/auth/me` keyring metadata, `secret_key`, and active `device_dek_wraps` are the real unlock inputs. |
| `packages/web-auth-device-session/docs/api.md` | remote auth/session/device orchestration stays upstream of this package; this row receives already-fetched metadata and the local wrapped device-key record needed for unlock. |
| `apps/web` / `@repo/web` | host shell may call this package, but must not reimplement crypto logic locally. |

## Downstream Interfaces

| Consumer | Contract this row must preserve |
|---|---|
| `web-auth-device-session` | can hand off `/auth/me` keyring metadata, active-wrap material, and the local wrapped device-key record without also owning DEK runtime crypto |
| `web-sync-blob-driver` | can encrypt/decrypt blob payloads via stable helper APIs and frozen AAD/envelope rules |
| `web-encrypted-indexeddb-cache` | can observe lock transitions and wipe decrypted cache/index state without importing runtime internals |
| future worker/memory rows | can subscribe to `manual` / `idle` / `unload` / `error` lock events and clear memory-only mirrors |
| `web-export-delete-privacy` | can reuse the same package for local export/decrypt flows rather than inventing a second browser crypto path |

## Planned Public Surface

### Session lifecycle

```ts
type SyncKeyringMetadata = {
  kekSalt: Uint8Array;
  kekKdfVersion: number;
  currentKeyId: number;
  keyring: Array<{
    keyId: number;
    status: "active" | "retired" | "pending_retire";
    canRetire: boolean;
  }>;
  dekCheck: Uint8Array;
  secretKeyCheck: Uint8Array;
};

type ActiveDeviceDekWrap = {
  deviceId: string;
  keyId: number;
  encryptionDeviceId: string;
  wrap: Uint8Array;
  hpkeInfo: Uint8Array;
  hpkeAad: Uint8Array;
};

type WrappedDevicePrivateKey = {
  wrappedKey: Uint8Array;
  wrapNonce: Uint8Array;
  wrapVersion: number;
};

type UnlockInput = {
  accountId: string;
  masterPassword: Uint8Array;
  secretKey: Uint8Array;
  keyring: SyncKeyringMetadata;
  wrappedDevicePrivateKey: WrappedDevicePrivateKey;
  activeWrap: ActiveDeviceDekWrap;
  policy?: Argon2Policy;
};

type LockReason = "manual" | "idle" | "unload" | "error";

type BrowserCryptoState = {
  status: "locked" | "unlocking" | "unlocked";
  currentKeyId: number | null;
  unlockedAt: number | null;
  idleDeadlineMs: number | null;
  lastLockReason?: LockReason;
};

type RuntimeTransition = {
  from: BrowserCryptoState["status"];
  to: BrowserCryptoState["status"];
  reason: "unlock" | LockReason;
  at: number;
  currentKeyId: number | null;
  errorCode?: string;
};

type UnlockResult = {
  state: BrowserCryptoState;
  transition: RuntimeTransition;
};

type BrowserCryptoRuntime = {
  unlock(input: UnlockInput): Promise<UnlockResult>;
  lock(reason?: LockReason): Promise<void>;
  getState(): BrowserCryptoState;
  subscribe(listener: (transition: RuntimeTransition) => void): () => void;
  configureIdleLock(input: IdleLockConfig): void;
};
```

### Blob helpers

```ts
type EncryptBlobInput = {
  plaintext: Uint8Array;
  aad: BlobAadInput;
};

type EncryptBlobResult = {
  envelope: Uint8Array;
  header: EnvelopeHeader;
};

type DecryptBlobInput = {
  envelope: Uint8Array;
  aad: BlobAadInput;
};

type DecryptBlobResult = {
  plaintext: Uint8Array;
  header: EnvelopeHeader;
};
```

### Sensitive buffer helpers

```ts
type ZeroizeOptions = {
  label?: string;
};

declare function zeroizeBuffer(buffer: Uint8Array, options?: ZeroizeOptions): void;
```

## Key Contract Assumptions

- `masterPassword` and `secretKey` enter the runtime as bytes, not as long-lived React strings.
- KEK is derived via `Argon2id(password=masterPassword, salt=kekSalt, secret=secretKey, t=3, m=64MiB, p=4)` and immediately represented as a non-extractable in-memory key handle.
- The local current-device private key is KEK-unwrapped from browser-local wrapped storage during unlock; callers do not hand the package an already-open secret by default.
- Active DEK acquisition happens by HPKE-opening the active `device_dek_wraps` row with the unwrapped current-device private key handle.
- This package does **not** fetch `/auth/me`, poll for wraps, or perform donor grant writes; callers provide those real inputs.
- `secretKeyCheck` is validated before the runtime treats the session as unlocked.
- `currentKeyId` / `activeWrap.keyId` mismatch is a typed contract failure, not an implicit fallback path.
- DEK is kept as a non-extractable in-memory key handle and never serialized back out of the runtime.
- Callers may observe lock/unlock transitions, but may not export KEK/DEK material.
- AES-GCM helpers operate only while the runtime is unlocked; locked use is a typed runtime error.
- AAD inputs are structured fields; callers do not pass prebuilt raw AAD bytes as the source of truth.
- Public unlock input does not include `encrypted_dek`. If a later offline-resume optimization adds a local wrapped mirror, it must stay internal to this package and remain derived from current keyring + active wrap truth.

## HPKE / Device-Wrap Ownership

- This row **owns** browser-local open of the active device wrap and the resulting DEK session lifecycle.
- `web-auth-device-session` owns:
  - `/auth/me` fetch/refresh
  - local device identity and device-private-key persistence/import policy
  - active-wrap fetch/poll/retry orchestration
  - donor `grant_dek_wrap` orchestration
- `hpke-per-device-wrap` remains the desktop-side reference for info-vs-aad invariants and error classes; this row must preserve the same semantic split in browser form.

## Lock Transition Contract

- `subscribe(listener)` is the required observation seam for downstream rows that hold decrypted cache/index/worker memory.
- A successful unlock emits two transitions in order:
  - `locked -> unlocking` with reason `unlock`
  - `unlocking -> unlocked` with reason `unlock`
- Listeners must also receive the first lock transition for:
  - `lock("manual")`
  - `lock("idle")`
  - `lock("unload")`
  - `lock("error")`
- Repeated lock calls after the runtime is already locked are idempotent and must not emit duplicate wipe-trigger transitions.
- Downstream packages own their own memory cleanup; this package only emits the transition and clears runtime-owned secrets best effort.

## Error Semantics

| Error | Meaning |
|---|---|
| `E_WEB_CRYPTO_LOCKED` | encrypt/decrypt/unseal operation requested while no unlocked DEK session exists |
| `E_WEB_CRYPTO_SECRET_KEY_MISMATCH` | `secret_key_check` does not match the supplied `secretKey` |
| `E_WEB_CRYPTO_BAD_PASSWORD` | Argon2id-derived KEK could not unwrap or validate the local wrapped device-private-key material for the supplied password |
| `E_WEB_CRYPTO_WRAP_UNAVAILABLE` | no active wrap is available for `currentKeyId` / current device |
| `E_WEB_CRYPTO_WRAP_KEY_MISMATCH` | active wrap metadata does not match current keyring/current-device expectations |
| `E_WEB_CRYPTO_HPKE_OPEN_FAILED` | HPKE open failed for the supplied active device wrap or its AAD/info inputs |
| `E_WEB_CRYPTO_UNSUPPORTED` | required browser crypto or WASM capability unavailable |
| `E_WEB_CRYPTO_INVALID_INPUT` | malformed salt/keyring/wrap/envelope/header input shape |
| `E_WEB_CRYPTO_AAD_MISMATCH` | decrypt failed because derived AAD does not match the ciphertext |
| `E_WEB_CRYPTO_VECTOR_MISMATCH` | local RFC/contract vector gate failure; implementation must not ship past this |

## Permission / Idempotency Notes

- No network permission is required by this package.
- All public APIs are browser-local and must be safe to call repeatedly:
  - repeated `lock()` calls are idempotent
  - repeated idle-lock events after lock are no-op
  - `configureIdleLock()` may replace prior timer/controller state safely
  - `subscribe()` returns an unsubscribe closure and listener removal is idempotent
- `unlock()` is not idempotent across different credential material; a new successful unlock must replace the prior in-memory session and zeroize self-owned transient buffers best effort.
- The package must never write secrets to IndexedDB/localStorage/cookies/logs on behalf of callers.

export interface Argon2Policy {
  readonly id: "sync-v0.6-argon2id-kek";
  readonly version: 0x13;
  readonly iterations: number;
  readonly memoryKiB: number;
  readonly parallelism: number;
  readonly outputBytes: number;
}

export type KeyStatus = "active" | "retired" | "pending_retire";

export interface SyncKeyringEntry {
  readonly keyId: number;
  readonly status: KeyStatus;
  readonly canRetire: boolean;
}

export interface SyncKeyringMetadata {
  readonly kekSalt: Uint8Array;
  readonly kekKdfVersion: number;
  readonly currentKeyId: number;
  readonly keyring: readonly SyncKeyringEntry[];
  readonly dekCheck: Uint8Array;
  readonly secretKeyCheck: Uint8Array;
}

export interface ActiveDeviceDekWrap {
  readonly deviceId: string;
  readonly keyId: number;
  readonly encryptionDeviceId: string;
  readonly wrap: Uint8Array;
  readonly hpkeInfo: Uint8Array;
  readonly hpkeAad: Uint8Array;
}

export interface WrappedDevicePrivateKey {
  readonly wrappedKey: Uint8Array;
  readonly wrapNonce: Uint8Array;
  readonly wrapVersion: number;
}

export interface UnlockInput {
  readonly accountId: string;
  readonly masterPassword: Uint8Array;
  readonly secretKey: Uint8Array;
  readonly keyring: SyncKeyringMetadata;
  readonly wrappedDevicePrivateKey: WrappedDevicePrivateKey;
  readonly activeWrap: ActiveDeviceDekWrap;
  readonly policy?: Partial<Argon2Policy>;
}

export type LockReason = "manual" | "idle" | "unload" | "error";

export interface BrowserCryptoState {
  readonly status: "locked" | "unlocking" | "unlocked";
  readonly currentKeyId: number | null;
  readonly unlockedAt: number | null;
  readonly idleDeadlineMs: number | null;
  readonly lastLockReason?: LockReason;
}

export interface RuntimeTransition {
  readonly from: BrowserCryptoState["status"];
  readonly to: BrowserCryptoState["status"];
  readonly reason: "unlock" | LockReason;
  readonly at: number;
  readonly currentKeyId: number | null;
  readonly errorCode?: string;
}

export interface UnlockResult {
  readonly state: BrowserCryptoState;
  readonly transition: RuntimeTransition;
}

export interface IdleLockConfig {
  readonly timeoutMs: number | null;
}

export interface BlobAadInput {
  readonly aadVersion?: number;
  readonly accountId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly proposedRevision: string;
  readonly keyId: number;
  readonly deletedFlag: boolean;
  readonly schemaVersion: number;
  readonly encryptionDeviceId: string;
}

export interface EnvelopeHeader {
  readonly version: 1;
  readonly kdfVersion: number;
  readonly keyId: number;
  readonly encryptionDeviceId: string;
  readonly counter: number;
  readonly nonce: Uint8Array;
}

export interface EncryptBlobInput {
  readonly plaintext: Uint8Array;
  readonly aad: BlobAadInput;
  readonly counter: number;
}

export interface EncryptBlobResult {
  readonly envelope: Uint8Array;
  readonly header: EnvelopeHeader;
}

export interface DecryptBlobInput {
  readonly envelope: Uint8Array;
  readonly aad: BlobAadInput;
}

export interface DecryptBlobResult {
  readonly plaintext: Uint8Array;
  readonly header: EnvelopeHeader;
}

export interface ZeroizeOptions {
  readonly label?: string;
}

export type RuntimeTransitionListener = (transition: RuntimeTransition) => void;

export interface BrowserCryptoRuntime {
  unlock(input: UnlockInput): Promise<UnlockResult>;
  lock(reason?: LockReason): Promise<void>;
  getState(): BrowserCryptoState;
  subscribe(listener: RuntimeTransitionListener): () => void;
  configureIdleLock(input: IdleLockConfig): void;
  encryptBlob(input: EncryptBlobInput): Promise<EncryptBlobResult>;
  decryptBlob(input: DecryptBlobInput): Promise<DecryptBlobResult>;
}

import {
  SyncBlobError,
  WebCacheError,
  createSyncBlobRepo,
  createIndexedDbSyncBlobRepo,
  type Repo,
  type SyncBlobCryptoAdapter,
  type SyncBlobCryptoDecryptInput,
  type SyncBlobCryptoEncryptInput,
  type TodoEntity,
} from "@repo/core-data";

export type WebTodoRecord = TodoEntity & {
  entityType: "productivity.todo";
  schemaVersion: 1;
  syncScope: "account-sync";
  deletedAt?: string;
};

interface CreateBrowserTodoRepoOptions {
  accountId?: string;
  deviceId?: string;
  fetchSync?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  namespace?: string;
}

export interface TodoCryptoSnapshot {
  dekBase64?: string;
  keyId?: number;
  encryptionDeviceId?: string;
  nextCounter?: number;
  leaseEnd?: number;
}

const DEFAULT_NAMESPACE = "plugin-productivity-web-todos";
const MAX_GCM_COUNTER = 0xffffffff;

let cachedDekBase64: string | null = null;
let cachedDekKey: CryptoKey | null = null;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function coerceTodoCryptoSnapshot(input: unknown): TodoCryptoSnapshot | null {
  if (!isObject(input)) {
    return null;
  }

  const dekBase64 = typeof input.dekBase64 === "string" && input.dekBase64.length > 0
    ? input.dekBase64
    : undefined;
  const keyId = typeof input.keyId === "number" && Number.isSafeInteger(input.keyId) && input.keyId > 0
    ? input.keyId
    : undefined;
  const encryptionDeviceId = typeof input.encryptionDeviceId === "string" && input.encryptionDeviceId.length > 0
    ? input.encryptionDeviceId
    : undefined;
  const nextCounter = typeof input.nextCounter === "number" && Number.isInteger(input.nextCounter) && input.nextCounter >= 0 && input.nextCounter <= MAX_GCM_COUNTER
    ? input.nextCounter
    : undefined;
  const leaseEnd = typeof input.leaseEnd === "number" && Number.isInteger(input.leaseEnd) && input.leaseEnd >= 0 && input.leaseEnd <= MAX_GCM_COUNTER
    ? input.leaseEnd
    : undefined;

  if (!dekBase64 || !keyId) {
    return null;
  }

  return { dekBase64, keyId, encryptionDeviceId, nextCounter, leaseEnd };
}

export function getTodoCryptoSnapshot(): TodoCryptoSnapshot {
  const runtime = globalThis as unknown as {
    __XAI_WEB_TODO_CRYPTO__?: unknown;
  };
  return coerceTodoCryptoSnapshot(runtime.__XAI_WEB_TODO_CRYPTO__) ?? {};
}

export function setTodoCryptoSnapshot(snapshot: TodoCryptoSnapshot | null): void {
  const runtime = globalThis as unknown as {
    __XAI_WEB_TODO_CRYPTO__?: TodoCryptoSnapshot;
  };
  if (!snapshot) {
    delete runtime.__XAI_WEB_TODO_CRYPTO__;
    return;
  }

  const normalized = coerceTodoCryptoSnapshot(snapshot);
  if (!normalized) {
    delete runtime.__XAI_WEB_TODO_CRYPTO__;
    return;
  }
  runtime.__XAI_WEB_TODO_CRYPTO__ = normalized;
}

function getAesGcm(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_crypto_unavailable");
  }
  return subtle;
}

function encodeBase64(bytes: Uint8Array): string {
  if (typeof btoa === "function") {
    let binary = "";
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  const bufferCtor = (globalThis as { Buffer?: { from(input: Uint8Array): { toString(encoding: string): string } } }).Buffer;
  if (bufferCtor) {
    return bufferCtor.from(bytes).toString("base64");
  }

  throw new Error("base64_encode_unavailable");
}

function decodeBase64(encoded: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(encoded);
    const output = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      output[index] = binary.charCodeAt(index);
    }
    return output;
  }

  const bufferCtor = (globalThis as { Buffer?: { from(input: string, encoding: string): { buffer: ArrayBuffer; byteOffset: number; byteLength: number } } }).Buffer;
  if (bufferCtor) {
    const view = bufferCtor.from(encoded, "base64");
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }

  throw new Error("base64_decode_unavailable");
}

function u32Le(value: number): number[] {
  return [
    value & 0xff,
    (value >> 8) & 0xff,
    (value >> 16) & 0xff,
    (value >> 24) & 0xff,
  ];
}

function u64Le(value: bigint): number[] {
  const out: number[] = [];
  let next = value;
  for (let index = 0; index < 8; index += 1) {
    out.push(Number(next & 0xffn));
    next >>= 8n;
  }
  return out;
}

function readU32Le(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset]! |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24)
  ) >>> 0;
}

function readU64Le(bytes: Uint8Array, offset: number): bigint {
  let value = 0n;
  for (let index = 7; index >= 0; index -= 1) {
    value = (value << 8n) | BigInt(bytes[offset + index]!);
  }
  return value;
}

function encodeNonce(encryptionDeviceId: bigint, counter: number): Uint8Array {
  return Uint8Array.from([...u64Le(encryptionDeviceId), ...u32Le(counter)]);
}

function splitEnvelope(payload: Uint8Array): {
  keyId: number;
  encryptionDeviceId: bigint;
  counter: number;
  iv: Uint8Array;
  ciphertext: Uint8Array;
} {
  if (payload.byteLength < 31) {
    throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_blob_invalid");
  }
  if (payload[0] !== 1 || payload[1] !== 1) {
    throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_blob_unsupported_envelope");
  }

  return {
    keyId: readU32Le(payload, 2),
    encryptionDeviceId: readU64Le(payload, 6),
    counter: readU32Le(payload, 14),
    iv: payload.slice(18, 30),
    ciphertext: payload.slice(30),
  };
}

function encodeEnvelope(input: {
  keyId: number;
  encryptionDeviceId: bigint;
  counter: number;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}): string {
  const header = Uint8Array.from([
    1,
    1,
    ...u32Le(input.keyId),
    ...u64Le(input.encryptionDeviceId),
    ...u32Le(input.counter),
  ]);
  const payload = new Uint8Array(header.byteLength + input.iv.byteLength + input.ciphertext.byteLength);
  payload.set(header, 0);
  payload.set(input.iv, header.byteLength);
  payload.set(input.ciphertext, header.byteLength + input.iv.byteLength);
  return encodeBase64(payload);
}

function decodeEnvelope(blobBase64: string): ReturnType<typeof splitEnvelope> {
  return splitEnvelope(decodeBase64(blobBase64));
}

function makeAad(input: {
  accountId: string;
  entityType: string;
  entityId: string;
  revision: string;
  keyId: number;
  deletedFlag: boolean;
  schemaVersion: number;
  encryptionDeviceId: string;
}): Uint8Array {
  const encoded = JSON.stringify([
    "sync.v0.todo",
    input.accountId,
    input.entityType,
    input.entityId,
    input.revision,
    input.keyId,
    input.deletedFlag ? 1 : 0,
    input.schemaVersion,
    input.encryptionDeviceId,
  ]);
  return new TextEncoder().encode(encoded);
}

async function resolveDekKey(snapshot: TodoCryptoSnapshot): Promise<CryptoKey> {
  if (!snapshot.dekBase64) {
    throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_crypto_locked");
  }

  if (cachedDekBase64 === snapshot.dekBase64 && cachedDekKey) {
    return cachedDekKey;
  }

  const subtle = getAesGcm();
  const rawKey = decodeBase64(snapshot.dekBase64);
  const key = await subtle.importKey("raw", toArrayBuffer(rawKey), "AES-GCM", false, ["encrypt", "decrypt"]);

  cachedDekBase64 = snapshot.dekBase64;
  cachedDekKey = key;
  return key;
}

function createSyncBlobCryptoAdapter(accountId: string): SyncBlobCryptoAdapter<WebTodoRecord> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readKeyId = (snapshot: TodoCryptoSnapshot): number => {
    if (typeof snapshot.keyId !== "number" || !Number.isSafeInteger(snapshot.keyId) || snapshot.keyId <= 0) {
      throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_crypto_locked");
    }
    return snapshot.keyId;
  };

  const readEnvelopeContext = (snapshot: TodoCryptoSnapshot): { encryptionDeviceId: bigint; counter: number } => {
    if (typeof snapshot.encryptionDeviceId !== "string" || !/^(0|[1-9]\d*)$/.test(snapshot.encryptionDeviceId)) {
      throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_nonce_lease_missing");
    }
    if (typeof snapshot.nextCounter !== "number" || !Number.isInteger(snapshot.nextCounter) || snapshot.nextCounter < 0 || snapshot.nextCounter > MAX_GCM_COUNTER) {
      throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_nonce_lease_missing");
    }
    if (typeof snapshot.leaseEnd !== "number" || !Number.isInteger(snapshot.leaseEnd) || snapshot.nextCounter > snapshot.leaseEnd) {
      throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_nonce_lease_missing");
    }
    return {
      encryptionDeviceId: BigInt(snapshot.encryptionDeviceId),
      counter: snapshot.nextCounter,
    };
  };

  return {
    async encryptRecord(input: SyncBlobCryptoEncryptInput<WebTodoRecord>): Promise<{ blobBase64: string }> {
      const snapshot = getTodoCryptoSnapshot();
      const key = await resolveDekKey(snapshot);
      const subtle = getAesGcm();
      const envelopeContext = readEnvelopeContext(snapshot);
      const iv = encodeNonce(envelopeContext.encryptionDeviceId, envelopeContext.counter);
      const aad = makeAad({
        accountId,
        entityType: input.record.entityType,
        entityId: input.record.id,
        revision: input.proposedRevision,
        keyId: input.keyId,
        deletedFlag: input.deletedFlag,
        schemaVersion: input.record.schemaVersion,
        encryptionDeviceId: envelopeContext.encryptionDeviceId.toString(),
      });
      const plaintext = encoder.encode(JSON.stringify(input.record));

      try {
        const encrypted = await subtle.encrypt(
          {
            name: "AES-GCM",
            iv: toArrayBuffer(iv),
            additionalData: toArrayBuffer(aad),
            tagLength: 128,
          },
          key,
          toArrayBuffer(plaintext),
        );

        setTodoCryptoSnapshot({
          ...snapshot,
          nextCounter:
            envelopeContext.counter >= (snapshot.leaseEnd ?? -1)
              ? undefined
              : envelopeContext.counter + 1,
        });

        return {
          blobBase64: encodeEnvelope({
            keyId: input.keyId,
            encryptionDeviceId: envelopeContext.encryptionDeviceId,
            counter: envelopeContext.counter,
            iv,
            ciphertext: new Uint8Array(encrypted),
          }),
        };
      } catch (cause) {
        throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_encrypt_failed", cause);
      }
    },

    async decryptRecord(input: SyncBlobCryptoDecryptInput): Promise<WebTodoRecord> {
      const snapshot = getTodoCryptoSnapshot();
      const key = await resolveDekKey(snapshot);
      const subtle = getAesGcm();
      const payload = decodeEnvelope(input.blobBase64);
      const aad = makeAad({
        accountId,
        entityType: input.entityType,
        entityId: input.entityId,
        revision: input.revision,
        keyId: input.keyId,
        deletedFlag: input.deletedFlag,
        schemaVersion: 1,
        encryptionDeviceId: payload.encryptionDeviceId.toString(),
      });

      try {
        const decrypted = await subtle.decrypt(
          {
            name: "AES-GCM",
            iv: toArrayBuffer(payload.iv),
            additionalData: toArrayBuffer(aad),
            tagLength: 128,
          },
          key,
          toArrayBuffer(payload.ciphertext),
        );

        const raw = JSON.parse(decoder.decode(new Uint8Array(decrypted)));
        if (!isObject(raw) || typeof raw.id !== "string" || typeof raw.title !== "string") {
          throw new Error("todo_record_invalid");
        }

        return {
          id: raw.id,
          entityType: "productivity.todo",
          schemaVersion: 1,
          syncScope: "account-sync",
          title: raw.title,
          done: Boolean(raw.done),
          labelIds: Array.isArray(raw.labelIds) ? raw.labelIds.filter((entry): entry is string => typeof entry === "string") : [],
          dueAt: typeof raw.dueAt === "string" ? raw.dueAt : undefined,
          notes: typeof raw.notes === "string" ? raw.notes : undefined,
          projectId: typeof raw.projectId === "string" ? raw.projectId : undefined,
          deletedAt: typeof raw.deletedAt === "string" ? raw.deletedAt : undefined,
          createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
          updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
        };
      } catch (cause) {
        throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_decrypt_failed", cause);
      }
    },

    getCurrentKeyId() {
      const snapshot = getTodoCryptoSnapshot();
      readKeyId(snapshot);
      if (!snapshot.dekBase64) {
        throw new SyncBlobError("E_SYNC_BLOB_CRYPTO", "todo_crypto_locked");
      }
      return snapshot.keyId as number;
    },
  };
}

export function createBrowserTodoRepo(options: CreateBrowserTodoRepoOptions = {}): Repo<WebTodoRecord> {
  const accountId = options.accountId?.trim();
  const deviceId = options.deviceId?.trim();
  const fetchSync = options.fetchSync;

  if (!accountId || !deviceId || !fetchSync) {
    throw new SyncBlobError("E_SYNC_BLOB_AUTH", "todo_device_session_missing");
  }

  const repoOptions = {
    namespace: options.namespace ?? DEFAULT_NAMESPACE,
    accountId,
    deviceId,
    fetchSync,
    crypto: createSyncBlobCryptoAdapter(accountId),
  };

  const repo = (() => {
    try {
      return createIndexedDbSyncBlobRepo<WebTodoRecord>(repoOptions);
    } catch (error) {
      if (error instanceof WebCacheError && error.code === "E_WEB_CACHE_UNSUPPORTED") {
        return createSyncBlobRepo<WebTodoRecord>(repoOptions);
      }
      throw error;
    }
  })();

  void repo.pull().catch(() => {
    // Local route bootstrap should still work from encrypted durable cache when pull fails.
  });

  return repo;
}

export function createWebTodoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `todo-${crypto.randomUUID()}`;
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function toIsoDate(day: Date): string {
  return day.toISOString().slice(0, 10);
}

export function isToday(dueAt?: string): boolean {
  if (!dueAt) {
    return false;
  }
  return dueAt.slice(0, 10) === toIsoDate(new Date());
}

export function isDeleted(record: WebTodoRecord): boolean {
  return typeof record.deletedAt === "string" && record.deletedAt.length > 0;
}

export function isTodoWriteReady(): boolean {
  const snapshot = getTodoCryptoSnapshot();
  return Boolean(snapshot.dekBase64) &&
    typeof snapshot.keyId === "number" &&
    snapshot.keyId > 0 &&
    typeof snapshot.encryptionDeviceId === "string" &&
    /^(0|[1-9]\d*)$/.test(snapshot.encryptionDeviceId) &&
    typeof snapshot.nextCounter === "number" &&
    Number.isInteger(snapshot.nextCounter) &&
    snapshot.nextCounter >= 0 &&
    snapshot.nextCounter <= MAX_GCM_COUNTER &&
    typeof snapshot.leaseEnd === "number" &&
    Number.isInteger(snapshot.leaseEnd) &&
    snapshot.nextCounter <= snapshot.leaseEnd;
}

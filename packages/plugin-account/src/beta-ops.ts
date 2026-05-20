export interface StorageQuotaConfig {
  maxBytesPerUser: number;
}

export interface StorageUsage {
  accountId: string;
  usedBytes: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxCalls: number;
  nowMs?: () => number;
}

export interface SupportFeedback {
  accountId: string;
  category: 'bug' | 'billing' | 'sync' | 'other';
  message: string;
  createdAtMs: number;
}

export interface EncryptedExportRecord {
  entityType: string;
  entityId: string;
  revision: string;
  encryptedPayload: number[];
}

export interface ExportOptions {
  nowMs?: () => number;
  hmacKey?: Uint8Array;
}

export interface ImportOptions {
  hmacKey?: Uint8Array;
}

export interface AccountDeletionPlan {
  accountId: string;
  revokeDeviceIds: string[];
  deleteTables: readonly string[];
  serverCleanupRequired: boolean;
}

type JsonObject = Record<string, unknown>;

const ENCRYPTED_EXPORT_SCHEMA_V1 = 'xai.encrypted-export.v1';
const ENCRYPTED_EXPORT_SCHEMA_V2 = 'xai.encrypted-export.v2';
const HMAC_KEY_BYTES = 32;
const SHA256_BLOCK_BYTES = 64;
const SHA256_DIGEST_BYTES = 32;
const utf8Encoder = new TextEncoder();

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export class StorageQuotaExceededError extends Error {
  readonly code = 'E3034';

  constructor(readonly usage: StorageUsage, readonly config: StorageQuotaConfig) {
    super(`E3034: storage quota exceeded for ${usage.accountId}`);
    this.name = 'StorageQuotaExceededError';
  }
}

export class AccountRateLimitError extends Error {
  readonly code = 'E3035';

  constructor(readonly accountId: string) {
    super(`E3035: account API rate limit exceeded for ${accountId}`);
    this.name = 'AccountRateLimitError';
  }
}

export function assertWithinStorageQuota(
  usage: StorageUsage,
  incomingBytes: number,
  config: StorageQuotaConfig,
): void {
  if (!Number.isSafeInteger(incomingBytes) || incomingBytes < 0) {
    throw new Error('E3005: incomingBytes must be a non-negative safe integer');
  }
  if (usage.usedBytes + incomingBytes > config.maxBytesPerUser) {
    throw new StorageQuotaExceededError(usage, config);
  }
}

export function createAccountRateLimiter(config: RateLimitConfig): (accountId: string) => void {
  const nowMs = config.nowMs ?? Date.now;
  const callsByAccount = new Map<string, number[]>();

  return (accountId: string) => {
    const cutoff = nowMs() - config.windowMs;
    const calls = (callsByAccount.get(accountId) ?? []).filter((timestamp) => timestamp > cutoff);
    if (calls.length >= config.maxCalls) {
      throw new AccountRateLimitError(accountId);
    }
    calls.push(nowMs());
    callsByAccount.set(accountId, calls);
  };
}

export function createSupportFeedback(input: Omit<SupportFeedback, 'createdAtMs'>, nowMs = Date.now): SupportFeedback {
  const message = input.message.trim();
  if (message.length === 0) {
    throw new Error('E3005: support feedback message is required');
  }
  return {
    ...input,
    message,
    createdAtMs: nowMs(),
  };
}

export function exportEncryptedAccountData(records: readonly EncryptedExportRecord[], options: ExportOptions = {}): string {
  const exportedRecords = normalizeExportRecords(records);
  const hmacKey = options.hmacKey === undefined ? undefined : assertHmacKey(options.hmacKey);
  const integrityMac = hmacKey === undefined ? null : hmacSha256Hex(hmacKey, canonicalJsonBytes(exportedRecords));

  if (hmacKey === undefined) {
    console.warn('export is not integrity-protected');
  }

  return JSON.stringify({
    schema: ENCRYPTED_EXPORT_SCHEMA_V2,
    exportedAtMs: (options.nowMs ?? Date.now)(),
    integrityAlgo: hmacKey === undefined ? null : 'HMAC-SHA256',
    integrityMac,
    records: exportedRecords,
  });
}

export function importEncryptedAccountData(exportJson: string, options: ImportOptions = {}): EncryptedExportRecord[] {
  const parsed = parseExportObject(exportJson);

  if (parsed.schema === ENCRYPTED_EXPORT_SCHEMA_V1) {
    return parseExportRecords(parsed.records);
  }

  if (parsed.schema !== ENCRYPTED_EXPORT_SCHEMA_V2) {
    throw new Error('E3005: unsupported encrypted export schema');
  }

  const records = parseExportRecords(parsed.records);

  if (parsed.integrityMac === null) {
    if (parsed.integrityAlgo !== null) {
      throw new Error('E3038: encrypted export integrity metadata is invalid');
    }
    if (options.hmacKey !== undefined) {
      throw new Error('E3038: import requires integrity but export has none');
    }
    return records;
  }

  if (typeof parsed.integrityMac !== 'string' || parsed.integrityAlgo !== 'HMAC-SHA256') {
    throw new Error('E3038: encrypted export integrity metadata is invalid');
  }

  if (options.hmacKey === undefined) {
    throw new Error('E3038: import requires integrity key');
  }

  const expectedMac = hexToBytes(parsed.integrityMac);
  if (expectedMac === null) {
    throw new Error('E3038: encrypted export integrity MAC is invalid');
  }

  const actualMac = hmacSha256(assertHmacKey(options.hmacKey), canonicalJsonBytes(parsed.records));
  if (!timingSafeEqual(actualMac, expectedMac)) {
    throw new Error('E3038: encrypted export integrity check failed');
  }

  return records;
}

export function planAccountDeletion(input: {
  accountId: string;
  deviceIds: readonly string[];
}): AccountDeletionPlan {
  return {
    accountId: input.accountId,
    revokeDeviceIds: [...input.deviceIds],
    deleteTables: [
      'encrypted_blobs',
      'staging_blobs',
      'mutation_dedup',
      'device_sync_progress',
      'device_dek_wraps',
      'sync_devices',
      'accounts',
    ],
    serverCleanupRequired: true,
  };
}

function normalizeExportRecords(records: readonly EncryptedExportRecord[]): EncryptedExportRecord[] {
  return records.map((record, index) => normalizeExportRecord(record, index));
}

function normalizeExportRecord(record: EncryptedExportRecord, index: number): EncryptedExportRecord {
  if (
    typeof record.entityType !== 'string' ||
    typeof record.entityId !== 'string' ||
    typeof record.revision !== 'string' ||
    !Array.isArray(record.encryptedPayload)
  ) {
    throw new Error(`E3005: encrypted export record ${index} is invalid`);
  }

  return {
    entityType: record.entityType,
    entityId: record.entityId,
    revision: record.revision,
    encryptedPayload: record.encryptedPayload.map((byte) => normalizePayloadByte(byte, index)),
  };
}

function parseExportRecords(records: unknown): EncryptedExportRecord[] {
  if (!Array.isArray(records)) {
    throw new Error('E3005: encrypted export records must be an array');
  }

  return records.map((record, index) => {
    if (!isJsonObject(record)) {
      throw new Error(`E3005: encrypted export record ${index} is invalid`);
    }
    return normalizeExportRecord(
      {
        entityType: record.entityType,
        entityId: record.entityId,
        revision: record.revision,
        encryptedPayload: record.encryptedPayload,
      } as EncryptedExportRecord,
      index,
    );
  });
}

function normalizePayloadByte(byte: number, recordIndex: number): number {
  if (!Number.isSafeInteger(byte) || byte < 0 || byte > 255) {
    throw new Error(`E3005: encrypted export record ${recordIndex} payload byte is invalid`);
  }
  return byte;
}

function parseExportObject(exportJson: string): JsonObject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(exportJson);
  } catch {
    throw new Error('E3005: encrypted export JSON is invalid');
  }

  if (!isJsonObject(parsed)) {
    throw new Error('E3005: encrypted export must be an object');
  }

  return parsed;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertHmacKey(hmacKey: Uint8Array): Uint8Array {
  if (!(hmacKey instanceof Uint8Array) || hmacKey.byteLength !== HMAC_KEY_BYTES) {
    throw new Error('E3005: hmacKey must be 32 bytes');
  }
  return hmacKey;
}

function canonicalJsonBytes(value: unknown): Uint8Array {
  return utf8Encoder.encode(canonicalJson(value));
}

function canonicalJson(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('E3005: canonical JSON cannot encode non-finite numbers');
    }
    return JSON.stringify(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  }

  if (isJsonObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`;
  }

  throw new Error('E3005: canonical JSON value is invalid');
}

function hmacSha256Hex(key: Uint8Array, message: Uint8Array): string {
  return bytesToHex(hmacSha256(key, message));
}

function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  const normalizedKey = new Uint8Array(SHA256_BLOCK_BYTES);
  normalizedKey.set(key);

  const innerPad = new Uint8Array(SHA256_BLOCK_BYTES);
  const outerPad = new Uint8Array(SHA256_BLOCK_BYTES);
  for (let index = 0; index < SHA256_BLOCK_BYTES; index += 1) {
    const byte = normalizedKey[index] ?? 0;
    innerPad[index] = byte ^ 0x36;
    outerPad[index] = byte ^ 0x5c;
  }

  return sha256(concatBytes(outerPad, sha256(concatBytes(innerPad, message))));
}

function sha256(message: Uint8Array): Uint8Array {
  const paddedLength = Math.ceil((message.length + 9) / SHA256_BLOCK_BYTES) * SHA256_BLOCK_BYTES;
  const padded = new Uint8Array(paddedLength);
  padded.set(message);
  padded[message.length] = 0x80;

  const bitLength = message.length * 8;
  const highLength = Math.floor(bitLength / 0x100000000);
  const lowLength = bitLength >>> 0;
  writeUint32(padded, paddedLength - 8, highLength);
  writeUint32(padded, paddedLength - 4, lowLength);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const words = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += SHA256_BLOCK_BYTES) {
    for (let index = 0; index < 16; index += 1) {
      const wordOffset = offset + index * 4;
      words[index] =
        (((padded[wordOffset] ?? 0) << 24) |
          ((padded[wordOffset + 1] ?? 0) << 16) |
          ((padded[wordOffset + 2] ?? 0) << 8) |
          (padded[wordOffset + 3] ?? 0)) >>>
        0;
    }

    for (let index = 16; index < 64; index += 1) {
      const w15 = words[index - 15] ?? 0;
      const w2 = words[index - 2] ?? 0;
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      words[index] = ((words[index - 16] ?? 0) + s0 + (words[index - 7] ?? 0) + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let index = 0; index < 64; index += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + (SHA256_K[index] ?? 0) + (words[index] ?? 0)) >>> 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const digest = new Uint8Array(SHA256_DIGEST_BYTES);
  writeUint32(digest, 0, h0);
  writeUint32(digest, 4, h1);
  writeUint32(digest, 8, h2);
  writeUint32(digest, 12, h3);
  writeUint32(digest, 16, h4);
  writeUint32(digest, 20, h5);
  writeUint32(digest, 24, h6);
  writeUint32(digest, 28, h7);
  return digest;
}

function rightRotate(value: number, bits: number): number {
  return ((value >>> bits) | (value << (32 - bits))) >>> 0;
}

function writeUint32(bytes: Uint8Array, offset: number, value: number): void {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

function concatBytes(first: Uint8Array, second: Uint8Array): Uint8Array {
  const result = new Uint8Array(first.length + second.length);
  result.set(first);
  result.set(second, first.length);
  return result;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    return null;
  }

  const bytes = new Uint8Array(SHA256_DIGEST_BYTES);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(first: Uint8Array, second: Uint8Array): boolean {
  if (first.length !== second.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < first.length; index += 1) {
    diff |= (first[index] ?? 0) ^ (second[index] ?? 0);
  }
  return diff === 0;
}

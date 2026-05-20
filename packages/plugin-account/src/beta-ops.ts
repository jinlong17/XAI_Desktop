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

export interface EncryptedExportEnvelopeV1 {
  schema: 'xai.encrypted-export.v1';
  exportedAtMs: number;
  records: EncryptedExportRecord[];
}

export interface EncryptedExportEnvelopeV2 {
  schema: 'xai.encrypted-export.v2';
  exportedAtMs: number;
  integrityAlgo: 'HMAC-SHA256' | null;
  integrityMac: string | null;
  records: EncryptedExportRecord[];
}

export interface AccountDeletionPlan {
  accountId: string;
  revokeDeviceIds: string[];
  deleteTables: readonly string[];
  serverCleanupRequired: boolean;
}

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

export async function exportEncryptedAccountData(
  records: readonly EncryptedExportRecord[],
  options: ExportOptions = {},
): Promise<string> {
  const normalizedRecords = cloneExportRecords(records);
  const nowMs = options.nowMs ?? Date.now;
  let integrityAlgo: EncryptedExportEnvelopeV2['integrityAlgo'] = null;
  let integrityMac: string | null = null;

  if (options.hmacKey) {
    integrityAlgo = 'HMAC-SHA256';
    integrityMac = await computeIntegrityMac(normalizedRecords, options.hmacKey);
  } else {
    console.warn('export is not integrity-protected');
  }

  const envelope: EncryptedExportEnvelopeV2 = {
    schema: 'xai.encrypted-export.v2',
    exportedAtMs: nowMs(),
    integrityAlgo,
    integrityMac,
    records: normalizedRecords,
  };
  return JSON.stringify(envelope);
}

export async function importEncryptedAccountData(
  exportJson: string,
  options: ImportOptions = {},
): Promise<EncryptedExportRecord[]> {
  const parsed = parseEncryptedExportEnvelope(exportJson);
  if (parsed.schema === 'xai.encrypted-export.v1') {
    return cloneExportRecords(parsed.records);
  }

  const records = cloneExportRecords(parsed.records);
  if (parsed.integrityAlgo === null && parsed.integrityMac === null) {
    if (options.hmacKey) {
      throw new Error('E3038: import requires integrity but export has none');
    }
    return records;
  }
  if (parsed.integrityAlgo !== 'HMAC-SHA256' || typeof parsed.integrityMac !== 'string') {
    throw new Error('E3005: invalid encrypted export integrity envelope');
  }
  if (!options.hmacKey) {
    throw new Error('E3038: integrity-protected export requires hmac key');
  }

  const expectedMac = await computeIntegrityMac(records, options.hmacKey);
  if (!constantTimeEqual(expectedMac, parsed.integrityMac)) {
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

function cloneExportRecords(records: readonly EncryptedExportRecord[]): EncryptedExportRecord[] {
  return records.map((record) => ({
    entityType: record.entityType,
    entityId: record.entityId,
    revision: record.revision,
    encryptedPayload: [...record.encryptedPayload],
  }));
}

function parseEncryptedExportEnvelope(exportJson: string): EncryptedExportEnvelopeV1 | EncryptedExportEnvelopeV2 {
  let parsed: unknown;
  try {
    parsed = JSON.parse(exportJson);
  } catch {
    throw new Error('E3005: invalid encrypted export JSON');
  }
  if (!isRecord(parsed)) {
    throw new Error('E3005: invalid encrypted export envelope');
  }
  if (parsed.schema === 'xai.encrypted-export.v1') {
    return {
      schema: 'xai.encrypted-export.v1',
      exportedAtMs: parseExportedAtMs(parsed.exportedAtMs),
      records: parseExportRecords(parsed.records),
    };
  }
  if (parsed.schema === 'xai.encrypted-export.v2') {
    return {
      schema: 'xai.encrypted-export.v2',
      exportedAtMs: parseExportedAtMs(parsed.exportedAtMs),
      integrityAlgo: parseIntegrityAlgo(parsed.integrityAlgo),
      integrityMac: parseIntegrityMac(parsed.integrityMac),
      records: parseExportRecords(parsed.records),
    };
  }
  throw new Error('E3005: unsupported encrypted export schema');
}

function parseExportedAtMs(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('E3005: invalid encrypted export timestamp');
  }
  return value;
}

function parseIntegrityAlgo(value: unknown): 'HMAC-SHA256' | null {
  if (value === null || value === 'HMAC-SHA256') {
    return value;
  }
  throw new Error('E3005: invalid encrypted export integrity algorithm');
}

function parseIntegrityMac(value: unknown): string | null {
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error('E3005: invalid encrypted export integrity mac');
  }
  return value;
}

function parseExportRecords(value: unknown): EncryptedExportRecord[] {
  if (!Array.isArray(value)) {
    throw new Error('E3005: encrypted export records must be an array');
  }
  return value.map((record) => {
    if (!isRecord(record)) {
      throw new Error('E3005: invalid encrypted export record');
    }
    if (typeof record.entityType !== 'string' || typeof record.entityId !== 'string' || typeof record.revision !== 'string') {
      throw new Error('E3005: invalid encrypted export record');
    }
    if (!Array.isArray(record.encryptedPayload) || !record.encryptedPayload.every(isByteValue)) {
      throw new Error('E3005: invalid encrypted export record payload');
    }
    return {
      entityType: record.entityType,
      entityId: record.entityId,
      revision: record.revision,
      encryptedPayload: [...record.encryptedPayload],
    };
  });
}

function isByteValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 255;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function computeIntegrityMac(
  records: readonly EncryptedExportRecord[],
  hmacKey: Uint8Array,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('E3005: crypto.subtle is required for encrypted export integrity');
  }
  const importedKey = await subtle.importKey(
    'raw',
    asArrayBuffer(hmacKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const payload = new TextEncoder().encode(canonicalJson(records));
  const signature = await subtle.sign('HMAC', importedKey, asArrayBuffer(payload));
  return bytesToHex(new Uint8Array(signature));
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`)
    .join(',')}}`;
}

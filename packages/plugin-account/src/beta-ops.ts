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

export function exportEncryptedAccountData(records: readonly EncryptedExportRecord[]): string {
  return JSON.stringify({
    schema: 'xai.encrypted-export.v1',
    exportedAtMs: 0,
    records: records.map((record) => ({
      entityType: record.entityType,
      entityId: record.entityId,
      revision: record.revision,
      encryptedPayload: [...record.encryptedPayload],
    })),
  });
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

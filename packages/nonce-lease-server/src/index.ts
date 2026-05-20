export const NONCE_REKEY_THRESHOLD = 0xffffff00n;

export type DeviceStatus = 'active' | 'pending_dek_wrap' | 'revoked';
export type KeyStatus = 'active' | 'staging' | 'retired';

export interface NonceDevice {
  accountId: string;
  deviceId: string;
  encryptionDeviceId: bigint;
  status: DeviceStatus;
}

export interface NonceKey {
  accountId: string;
  keyId: number;
  status: KeyStatus;
}

export interface NonceLease {
  accountId: string;
  deviceId: string;
  encryptionDeviceId: bigint;
  keyId: number;
  leaseStart: bigint;
  leaseEnd: bigint;
  leasedAtMs: number;
  expiresAtMs: number;
}

export interface UsedNonce {
  accountId: string;
  keyId: number;
  encryptionDeviceId: bigint;
  counter: bigint;
  source: 'blob' | 'staging' | 'conflict_shadow';
}

export interface SyncProgress {
  accountId: string;
  deviceId: string;
  lastAckCommitSeq: bigint;
  updatedAtMs: number;
}

export interface GrantNonceLeaseInput {
  accountId: string;
  deviceId: string;
  keyId: number;
  count: number;
}

export interface NonceLeaseServerOptions {
  nowMs?: () => number;
  leaseTtlMs?: number;
}

export class NonceLeaseError extends Error {
  constructor(readonly code: string, message: string) {
    super(`${code}: ${message}`);
    this.name = 'NonceLeaseError';
  }
}

export class InMemoryNonceLeaseServer {
  readonly leases: NonceLease[] = [];
  readonly usedNonces = new Map<string, UsedNonce>();
  readonly progress = new Map<string, SyncProgress>();
  private readonly devices = new Map<string, NonceDevice>();
  private readonly keys = new Map<string, NonceKey>();
  private readonly nowMs: () => number;
  private readonly leaseTtlMs: number;

  constructor(options: NonceLeaseServerOptions = {}) {
    this.nowMs = options.nowMs ?? Date.now;
    this.leaseTtlMs = options.leaseTtlMs ?? 5 * 60 * 1000;
  }

  addDevice(device: NonceDevice): void {
    this.devices.set(deviceKey(device.accountId, device.deviceId), { ...device });
  }

  addKey(key: NonceKey): void {
    this.keys.set(keyKey(key.accountId, key.keyId), { ...key });
  }

  grantNonceLease(input: GrantNonceLeaseInput): NonceLease {
    if (!Number.isSafeInteger(input.count) || input.count <= 0) {
      throw new NonceLeaseError('nonce_lease_count_invalid', 'count must be positive');
    }

    const device = this.devices.get(deviceKey(input.accountId, input.deviceId));
    if (!device || device.status !== 'active') {
      throw new NonceLeaseError('nonce_lease_not_owned', 'device is absent or not active');
    }

    const key = this.keys.get(keyKey(input.accountId, input.keyId));
    if (!key || (key.status !== 'active' && key.status !== 'staging')) {
      throw new NonceLeaseError('nonce_lease_key_not_active', 'key is not active or staging');
    }

    const last = [...this.leases]
      .reverse()
      .find(
        (lease) =>
          lease.accountId === input.accountId &&
          lease.keyId === input.keyId &&
          lease.encryptionDeviceId === device.encryptionDeviceId,
      );
    const leaseStart = last ? last.leaseEnd + 1n : 0n;
    const leaseEnd = leaseStart + BigInt(input.count) - 1n;
    if (leaseEnd >= NONCE_REKEY_THRESHOLD) {
      throw new NonceLeaseError('nonce_lease_exhausted', 'lease reaches rekey threshold');
    }

    const nowMs = this.nowMs();
    const lease: NonceLease = {
      accountId: input.accountId,
      deviceId: input.deviceId,
      encryptionDeviceId: device.encryptionDeviceId,
      keyId: input.keyId,
      leaseStart,
      leaseEnd,
      leasedAtMs: nowMs,
      expiresAtMs: nowMs + this.leaseTtlMs,
    };
    this.leases.push(lease);
    return lease;
  }

  renewLease(lease: NonceLease): NonceLease {
    const index = this.leases.findIndex((candidate) => sameLease(candidate, lease));
    if (index === -1) {
      throw new NonceLeaseError('nonce_lease_not_found', 'cannot renew an unknown lease');
    }
    const renewed = { ...this.leases[index]!, expiresAtMs: this.nowMs() + this.leaseTtlMs };
    this.leases[index] = renewed;
    return renewed;
  }

  recordUsedNonce(nonce: UsedNonce): void {
    const key = usedNonceKey(nonce);
    if (this.usedNonces.has(key)) {
      throw new NonceLeaseError('E3027', 'duplicate nonce tuple rejected');
    }
    this.usedNonces.set(key, { ...nonce });
  }

  updateProgress(accountId: string, deviceId: string, lastAckCommitSeq: bigint): SyncProgress {
    const key = deviceKey(accountId, deviceId);
    const current = this.progress.get(key);
    if (current && lastAckCommitSeq < current.lastAckCommitSeq) {
      throw new NonceLeaseError('E3024', 'sync progress rollback rejected');
    }
    const progress: SyncProgress = {
      accountId,
      deviceId,
      lastAckCommitSeq,
      updatedAtMs: this.nowMs(),
    };
    this.progress.set(key, progress);
    return progress;
  }
}

function sameLease(left: NonceLease, right: NonceLease): boolean {
  return (
    left.accountId === right.accountId &&
    left.deviceId === right.deviceId &&
    left.keyId === right.keyId &&
    left.leaseStart === right.leaseStart &&
    left.leaseEnd === right.leaseEnd
  );
}

function deviceKey(accountId: string, deviceId: string): string {
  return `${accountId}\u0000${deviceId}`;
}

function keyKey(accountId: string, keyId: number): string {
  return `${accountId}\u0000${keyId}`;
}

function usedNonceKey(nonce: UsedNonce): string {
  return `${nonce.accountId}\u0000${nonce.keyId}\u0000${nonce.encryptionDeviceId}\u0000${nonce.counter}`;
}

import {
  createPrivateKey,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  type KeyObject,
} from 'node:crypto';
import { Buffer } from 'node:buffer';

export interface X25519DeviceKeypair {
  privateKeyPkcs8: Uint8Array;
  publicKeySpki: Uint8Array;
}

export interface RegisteredDevice {
  accountId: string;
  deviceId: string;
  publicKeySpki: Uint8Array;
  status: 'active' | 'pending_dek_wrap' | 'revoked';
  registeredAtMs: number;
}

export interface PairingRequest {
  accountId: string;
  requestId: string;
  newDeviceId: string;
  newDevicePublicKeySpki: Uint8Array;
  requestedAtMs: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DevicePairingPolicy {
  maxDevices: number;
  minRequestIntervalMs: number;
  nowMs?: () => number;
}

export class InMemoryDevicePairingRegistry {
  private readonly devices = new Map<string, RegisteredDevice>();
  private readonly requests = new Map<string, PairingRequest>();
  private readonly lastRequestAtByAccount = new Map<string, number>();
  private readonly nowMs: () => number;

  constructor(private readonly policy: DevicePairingPolicy) {
    this.nowMs = policy.nowMs ?? Date.now;
  }

  registerDevice(input: Omit<RegisteredDevice, 'registeredAtMs'>): RegisteredDevice {
    assertValidPublicKey(input.publicKeySpki);
    const activeCount = [...this.devices.values()].filter(
      (device) => device.accountId === input.accountId && device.status !== 'revoked',
    ).length;
    if (activeCount >= this.policy.maxDevices) {
      throw new Error('E3036: max device count exceeded');
    }
    const device: RegisteredDevice = {
      ...input,
      publicKeySpki: new Uint8Array(input.publicKeySpki),
      registeredAtMs: this.nowMs(),
    };
    this.devices.set(deviceKey(input.accountId, input.deviceId), device);
    return cloneDevice(device);
  }

  requestPairing(input: {
    accountId: string;
    requestId: string;
    newDeviceId: string;
    newDevicePublicKeySpki: Uint8Array;
  }): PairingRequest {
    assertValidPublicKey(input.newDevicePublicKeySpki);
    const nowMs = this.nowMs();
    const lastRequestAt = this.lastRequestAtByAccount.get(input.accountId);
    if (lastRequestAt !== undefined && nowMs - lastRequestAt < this.policy.minRequestIntervalMs) {
      throw new Error('E3037: pairing request rate limited');
    }
    this.lastRequestAtByAccount.set(input.accountId, nowMs);
    const request: PairingRequest = {
      ...input,
      newDevicePublicKeySpki: new Uint8Array(input.newDevicePublicKeySpki),
      requestedAtMs: nowMs,
      status: 'pending',
    };
    this.requests.set(input.requestId, request);
    return cloneRequest(request);
  }

  approvePairing(requestId: string): RegisteredDevice {
    const request = this.requests.get(requestId);
    if (!request || request.status !== 'pending') {
      throw new Error('E3005: pairing request is not pending');
    }
    const device = this.registerDevice({
      accountId: request.accountId,
      deviceId: request.newDeviceId,
      publicKeySpki: request.newDevicePublicKeySpki,
      status: 'pending_dek_wrap',
    });
    request.status = 'approved';
    this.requests.set(requestId, request);
    return device;
  }
}

export function generateDeviceKeypair(): X25519DeviceKeypair {
  const { privateKey, publicKey } = generateKeyPairSync('x25519');
  return {
    privateKeyPkcs8: new Uint8Array(privateKey.export({ format: 'der', type: 'pkcs8' })),
    publicKeySpki: new Uint8Array(publicKey.export({ format: 'der', type: 'spki' })),
  };
}

export function deriveDeviceSharedSecret(input: {
  privateKeyPkcs8: Uint8Array;
  peerPublicKeySpki: Uint8Array;
}): Uint8Array {
  assertValidPublicKey(input.peerPublicKeySpki);
  const privateKey = importPrivate(input.privateKeyPkcs8);
  const publicKey = importPublic(input.peerPublicKeySpki);
  return new Uint8Array(diffieHellman({ privateKey, publicKey }));
}

export function assertValidPublicKey(publicKeySpki: Uint8Array): void {
  if (publicKeySpki.length === 0 || publicKeySpki.every((byte) => byte === 0)) {
    throw new Error('E3005: invalid X25519 public key');
  }
  try {
    importPublic(publicKeySpki);
  } catch {
    throw new Error('E3005: invalid X25519 public key');
  }
}

function importPrivate(privateKeyPkcs8: Uint8Array): KeyObject {
  return createPrivateKey({ key: Buffer.from(privateKeyPkcs8), format: 'der', type: 'pkcs8' });
}

function importPublic(publicKeySpki: Uint8Array): KeyObject {
  return createPublicKey({ key: Buffer.from(publicKeySpki), format: 'der', type: 'spki' });
}

function deviceKey(accountId: string, deviceId: string): string {
  return `${accountId}\u0000${deviceId}`;
}

function cloneDevice(device: RegisteredDevice): RegisteredDevice {
  return { ...device, publicKeySpki: new Uint8Array(device.publicKeySpki) };
}

function cloneRequest(request: PairingRequest): PairingRequest {
  return { ...request, newDevicePublicKeySpki: new Uint8Array(request.newDevicePublicKeySpki) };
}

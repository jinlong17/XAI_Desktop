export type AccountDeviceStatus = 'active' | 'current' | 'revoked';

export interface AccountDevice {
  deviceId: string;
  name: string;
  platform: string;
  appVersion: string;
  pairedAtIso: string;
  lastSeenAtIso: string;
  status: AccountDeviceStatus;
}

export interface DeviceRevokeRequest {
  accountId: string;
  deviceId: string;
  reason: 'user_remote_revoke' | 'account_deletion';
}

export interface DeviceRevokeResult {
  deviceId: string;
  revokedAtIso: string;
  rekeyRequired: boolean;
  transport: 'mock' | 'supabase-rpc';
  deferredGate?: string;
}

export interface DeviceRevokeTransport {
  revokeDevice(request: DeviceRevokeRequest): Promise<DeviceRevokeResult>;
}

export function createMockDeviceRevokeTransport(now = () => new Date()): DeviceRevokeTransport {
  return {
    async revokeDevice(request) {
      assertDeviceRevokeRequest(request);
      return {
        deviceId: request.deviceId,
        revokedAtIso: now().toISOString(),
        rekeyRequired: true,
        transport: 'mock',
        deferredGate: 'Supabase device_revoke RPC is deferred until staging Auth is provisioned.',
      };
    },
  };
}

export async function revokeAccountDevice(
  transport: DeviceRevokeTransport,
  request: DeviceRevokeRequest,
): Promise<DeviceRevokeResult> {
  assertDeviceRevokeRequest(request);
  return transport.revokeDevice(request);
}

export function markDeviceRevoked(
  devices: readonly AccountDevice[],
  result: DeviceRevokeResult,
): AccountDevice[] {
  return devices.map((device) =>
    device.deviceId === result.deviceId
      ? {
          ...device,
          status: 'revoked',
          lastSeenAtIso: result.revokedAtIso,
        }
      : device,
  );
}

function assertDeviceRevokeRequest(request: DeviceRevokeRequest): void {
  if (request.accountId.trim().length === 0) {
    throw new Error('E3005: accountId is required for device revoke');
  }
  if (request.deviceId.trim().length === 0) {
    throw new Error('E3005: deviceId is required for device revoke');
  }
}

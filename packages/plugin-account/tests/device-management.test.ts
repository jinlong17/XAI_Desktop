import { describe, expect, it } from 'vitest';

import {
  createMockDeviceRevokeTransport,
  markDeviceRevoked,
  revokeAccountDevice,
  type AccountDevice,
} from '../src';

describe('device management', () => {
  it('uses the mock revoke transport as the Supabase device_revoke deferred gate', async () => {
    const transport = createMockDeviceRevokeTransport(() => new Date('2026-05-20T20:00:00.000Z'));

    await expect(
      revokeAccountDevice(transport, {
        accountId: 'acct_1',
        deviceId: 'dev_remote',
        reason: 'user_remote_revoke',
      }),
    ).resolves.toMatchObject({
      deviceId: 'dev_remote',
      revokedAtIso: '2026-05-20T20:00:00.000Z',
      rekeyRequired: true,
      transport: 'mock',
    });
  });

  it('marks only the target device revoked', () => {
    const devices: AccountDevice[] = [
      {
        deviceId: 'dev_current',
        name: 'Mac 1001',
        platform: 'macOS',
        appVersion: '1.0.0-rc.1',
        pairedAtIso: '2026-05-01T00:00:00.000Z',
        lastSeenAtIso: '2026-05-20T19:00:00.000Z',
        status: 'current',
      },
      {
        deviceId: 'dev_remote',
        name: 'Mac 4812',
        platform: 'Safari',
        appVersion: '1.0.0-rc.1',
        pairedAtIso: '2026-05-02T00:00:00.000Z',
        lastSeenAtIso: '2026-05-20T18:00:00.000Z',
        status: 'active',
      },
    ];

    expect(
      markDeviceRevoked(devices, {
        deviceId: 'dev_remote',
        revokedAtIso: '2026-05-20T20:00:00.000Z',
        rekeyRequired: true,
        transport: 'mock',
      }),
    ).toEqual([
      devices[0],
      {
        ...devices[1],
        status: 'revoked',
        lastSeenAtIso: '2026-05-20T20:00:00.000Z',
      },
    ]);
  });
});

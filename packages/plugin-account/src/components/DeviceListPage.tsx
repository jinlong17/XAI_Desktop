import { useMemo, useState } from 'react';

import {
  createMockDeviceRevokeTransport,
  markDeviceRevoked,
  revokeAccountDevice,
  type AccountDevice,
  type DeviceRevokeResult,
  type DeviceRevokeTransport,
} from '../device-management';
import { DeviceCard } from './DeviceCard';

export interface DeviceListPageProps {
  accountId: string;
  devices: readonly AccountDevice[];
  revokeTransport?: DeviceRevokeTransport;
  onRevokeComplete?: (result: DeviceRevokeResult) => void;
}

export function DeviceListPage({
  accountId,
  devices,
  revokeTransport,
  onRevokeComplete,
}: DeviceListPageProps) {
  const [items, setItems] = useState<AccountDevice[]>(() => [...devices]);
  const [busyDeviceId, setBusyDeviceId] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();
  const transport = useMemo(() => revokeTransport ?? createMockDeviceRevokeTransport(), [revokeTransport]);

  async function handleRevoke(deviceId: string): Promise<void> {
    setBusyDeviceId(deviceId);
    setMessage(undefined);
    try {
      const result = await revokeAccountDevice(transport, {
        accountId,
        deviceId,
        reason: 'user_remote_revoke',
      });
      setItems((current) => markDeviceRevoked(current, result));
      setMessage(result.deferredGate ?? 'Device revoked. Re-key is required before the next sync push.');
      onRevokeComplete?.(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Device revoke failed');
    } finally {
      setBusyDeviceId(undefined);
    }
  }

  return (
    <section style={styles.shell} aria-label="Paired devices">
      <div style={styles.heading}>
        <p style={styles.eyebrow}>Devices</p>
        <h1 style={styles.title}>Paired devices</h1>
      </div>
      <div style={styles.grid}>
        {items.map((device) => (
          <DeviceCard
            key={device.deviceId}
            device={device}
            busy={busyDeviceId === device.deviceId}
            onRevoke={(nextDeviceId) => {
              void handleRevoke(nextDeviceId);
            }}
          />
        ))}
      </div>
      {message ? <p style={styles.message}>{message}</p> : null}
    </section>
  );
}

const styles = {
  shell: {
    display: 'grid',
    gap: 18,
  },
  heading: {
    display: 'grid',
    gap: 4,
  },
  eyebrow: {
    margin: 0,
    color: '#287a55',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
  },
  title: {
    margin: 0,
    fontSize: 32,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 14,
  },
  message: {
    margin: 0,
    color: '#667085',
  },
};

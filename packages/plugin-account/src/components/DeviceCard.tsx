import type { AccountDevice } from '../device-management';

export interface DeviceCardProps {
  device: AccountDevice;
  busy?: boolean;
  onRevoke(deviceId: string): void;
}

export function DeviceCard({ device, busy, onRevoke }: DeviceCardProps) {
  const isRevoked = device.status === 'revoked';
  const isCurrent = device.status === 'current';

  return (
    <article style={styles.card} aria-label={`${device.name} device`}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{device.name}</h2>
          <p style={styles.meta}>{device.platform} - {device.appVersion}</p>
        </div>
        <span style={isRevoked ? styles.revokedBadge : styles.badge}>
          {isCurrent ? 'Current' : device.status}
        </span>
      </div>
      <dl style={styles.details}>
        <div>
          <dt>Last seen</dt>
          <dd>{formatDeviceDate(device.lastSeenAtIso)}</dd>
        </div>
        <div>
          <dt>Paired</dt>
          <dd>{formatDeviceDate(device.pairedAtIso)}</dd>
        </div>
      </dl>
      <button
        type="button"
        style={isRevoked || isCurrent ? styles.disabledButton : styles.button}
        disabled={isRevoked || isCurrent || busy}
        onClick={() => onRevoke(device.deviceId)}
      >
        {isRevoked ? 'Revoked' : isCurrent ? 'This device' : busy ? 'Revoking' : 'Revoke'}
      </button>
    </article>
  );
}

function formatDeviceDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = {
  card: {
    display: 'grid',
    gap: 16,
    border: '1px solid #d7ddd4',
    borderRadius: 8,
    padding: 16,
    background: '#ffffff',
  },
  header: {
    display: 'flex',
    alignItems: 'start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 18,
  },
  meta: {
    margin: '4px 0 0',
    color: '#667085',
  },
  badge: {
    borderRadius: 999,
    padding: '4px 8px',
    background: '#e8f1ff',
    color: '#2457a6',
    fontSize: 12,
    textTransform: 'capitalize' as const,
  },
  revokedBadge: {
    borderRadius: 999,
    padding: '4px 8px',
    background: '#f6e5e5',
    color: '#9b2c2c',
    fontSize: 12,
    textTransform: 'capitalize' as const,
  },
  details: {
    display: 'grid',
    gap: 8,
    margin: 0,
    color: '#667085',
  },
  button: {
    minHeight: 36,
    border: '1px solid #2457a6',
    borderRadius: 8,
    background: '#2457a6',
    color: '#ffffff',
    padding: '0 12px',
  },
  disabledButton: {
    minHeight: 36,
    border: '1px solid #d7ddd4',
    borderRadius: 8,
    background: '#f3f5f2',
    color: '#667085',
    padding: '0 12px',
  },
};

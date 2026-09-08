export type MockDeviceStatus = "active" | "current" | "revoked";

export interface MockDevice {
  deviceId: string;
  name: string;
  platform: string;
  appVersion: string;
  pairedAtIso: string;
  lastSeenAtIso: string;
  status: MockDeviceStatus;
}

export interface MockExportRecord {
  entityType: string;
  entityId: string;
  revision: string;
  encryptedPayload: number[];
}

export interface MockExportEnvelope {
  schema: "xai.encrypted-export.v2";
  exportedAtMs: number;
  integrityAlgo: "HMAC-SHA256" | null;
  integrityMac: string | null;
  records: MockExportRecord[];
}

export interface MockDeletionPlan {
  accountId: string;
  revokeDeviceIds: string[];
  deleteTables: readonly string[];
  serverCleanupRequired: boolean;
}

export const MOCK_ACCOUNT_ID = "acct_demo_rc";

export const mockDevices: MockDevice[] = [
  {
    deviceId: "dev_current",
    name: "Mac 1001",
    platform: "macOS 15",
    appVersion: "1.0.0-rc.1",
    pairedAtIso: "2026-05-18T16:30:00.000Z",
    lastSeenAtIso: "2026-05-20T19:45:00.000Z",
    status: "current",
  },
  {
    deviceId: "dev_safari",
    name: "Safari 4812",
    platform: "Web",
    appVersion: "1.0.0-rc.1",
    pairedAtIso: "2026-05-19T15:15:00.000Z",
    lastSeenAtIso: "2026-05-20T18:25:00.000Z",
    status: "active",
  },
  {
    deviceId: "dev_old",
    name: "Mac 7730",
    platform: "macOS 14",
    appVersion: "0.9.4",
    pairedAtIso: "2026-05-09T09:20:00.000Z",
    lastSeenAtIso: "2026-05-18T22:05:00.000Z",
    status: "active",
  },
];

export function createMockOAuthSession(provider: "mock-oauth"): string {
  return `${provider}: ${MOCK_ACCOUNT_ID}`;
}

export function createPasskeyStubMessage(webAuthnAvailable: boolean): string {
  return webAuthnAvailable
    ? "WebAuthn API detected. Passkey challenge endpoint is deferred to Supabase Auth."
    : "WebAuthn API unavailable in this browser runtime.";
}

export function revokeMockDevice(devices: readonly MockDevice[], deviceId: string): MockDevice[] {
  const revokedAtIso = new Date().toISOString();
  return devices.map((device) =>
    device.deviceId === deviceId
      ? {
          ...device,
          status: "revoked",
          lastSeenAtIso: revokedAtIso,
        }
      : device,
  );
}

export function createMockExportBundle(nowMs = Date.now): MockExportEnvelope {
  return {
    schema: "xai.encrypted-export.v2",
    exportedAtMs: nowMs(),
    integrityAlgo: null,
    integrityMac: null,
    records: [
      {
        entityType: "account.device",
        entityId: "dev_current",
        revision: "1",
        encryptedPayload: [88, 65, 73, 45, 68, 69, 77, 79],
      },
      {
        entityType: "productivity.todo",
        entityId: "todo_demo",
        revision: "3",
        encryptedPayload: [16, 41, 99, 201, 7, 14, 1, 44],
      },
    ],
  };
}

export function verifyMockImportBundle(value: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return "Invalid JSON bundle.";
  }
  if (!isRecord(parsed) || parsed.schema !== "xai.encrypted-export.v2" || !Array.isArray(parsed.records)) {
    return "Unsupported export envelope.";
  }
  if (parsed.integrityAlgo !== null && parsed.integrityAlgo !== "HMAC-SHA256") {
    return "Unsupported integrity algorithm.";
  }
  return `${parsed.records.length} encrypted records verified for mock restore.`;
}

export function createMockDeletionPlan(accountId = MOCK_ACCOUNT_ID): MockDeletionPlan {
  return {
    accountId,
    revokeDeviceIds: mockDevices.map((device) => device.deviceId),
    deleteTables: [
      "encrypted_blobs",
      "staging_blobs",
      "mutation_dedup",
      "device_sync_progress",
      "device_dek_wraps",
      "sync_devices",
      "accounts",
    ],
    serverCleanupRequired: true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

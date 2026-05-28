import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import type { WebRuntimeProfile } from "@repo/core";
import type {
  DesktopNotificationPermissionState,
  DesktopNotificationRuntimeAdapter,
  DesktopNotificationRuntimeSnapshot,
} from "./types";

const listeners = new Set<(snapshot: DesktopNotificationRuntimeSnapshot) => void>();

let currentSnapshot: DesktopNotificationRuntimeSnapshot = {
  status: "unsupported",
  runtimeProfile: "web-live",
  permissionState: "unknown",
  adapterAvailable: false,
  unsupported: {
    task: 0,
    calendar: 0,
  },
  unsupportedReason: "non_desktop_runtime",
  lastUpdatedAt: new Date(0).toISOString(),
};

function nowIso(): string {
  return new Date().toISOString();
}

function runtimeEnv(): Record<string, string | undefined> {
  const meta = import.meta as unknown as {
    env?: Record<string, string | undefined>;
  };
  return meta.env ?? {};
}

function readAdapter(): DesktopNotificationRuntimeAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.__XAI_DESKTOP_NOTIFICATION__ ?? null;
}

function emitSnapshot(next: DesktopNotificationRuntimeSnapshot): void {
  currentSnapshot = next;
  for (const listener of listeners) {
    listener(next);
  }
}

function mapPromptState(
  runtimeProfile: WebRuntimeProfile,
  adapterAvailable: boolean,
  permissionState: DesktopNotificationPermissionState | "unknown",
  unsupported?: { task: number; calendar: number },
): DesktopNotificationRuntimeSnapshot {
  const unsupportedCounts = unsupported ?? { task: 0, calendar: 0 };
  if (!isDesktopPhase1OfflineRuntime(runtimeProfile)) {
    return {
      status: "unsupported",
      runtimeProfile,
      permissionState,
      adapterAvailable,
      unsupported: unsupportedCounts,
      unsupportedReason: "non_desktop_runtime",
      lastUpdatedAt: nowIso(),
    };
  }

  if (!adapterAvailable) {
    return {
      status: "unsupported",
      runtimeProfile,
      permissionState,
      adapterAvailable,
      unsupported: unsupportedCounts,
      unsupportedReason: "adapter_unavailable",
      lastUpdatedAt: nowIso(),
    };
  }

  if (permissionState === "granted") {
    return {
      status: "ready",
      runtimeProfile,
      permissionState,
      adapterAvailable,
      unsupported: unsupportedCounts,
      lastUpdatedAt: nowIso(),
    };
  }

  if (permissionState === "denied") {
    return {
      status: "denied",
      runtimeProfile,
      permissionState,
      adapterAvailable,
      unsupported: unsupportedCounts,
      lastUpdatedAt: nowIso(),
    };
  }

  return {
    status: "permission-required",
    runtimeProfile,
    permissionState,
    adapterAvailable,
    unsupported: unsupportedCounts,
    lastUpdatedAt: nowIso(),
  };
}

export async function refreshDesktopNotificationRuntimeSnapshot(): Promise<DesktopNotificationRuntimeSnapshot> {
  const runtimeProfile = resolveWebRuntimeProfile(
    runtimeEnv(),
  );

  const adapter = readAdapter();
  const adapterAvailable = adapter !== null;

  if (!isDesktopPhase1OfflineRuntime(runtimeProfile)) {
    const snapshot = mapPromptState(runtimeProfile, adapterAvailable, "unknown");
    emitSnapshot(snapshot);
    return snapshot;
  }

  if (!adapter) {
    const snapshot = mapPromptState(runtimeProfile, false, "unknown");
    emitSnapshot(snapshot);
    return snapshot;
  }

  const granted = await adapter.isPermissionGranted();
  const permissionState: DesktopNotificationPermissionState = granted
    ? "granted"
    : "prompt";

  const snapshot = mapPromptState(runtimeProfile, true, permissionState);
  emitSnapshot(snapshot);
  return snapshot;
}

export function getDesktopNotificationRuntimeSnapshot(): DesktopNotificationRuntimeSnapshot {
  return currentSnapshot;
}

export function subscribeDesktopNotificationRuntimeSnapshot(
  listener: (snapshot: DesktopNotificationRuntimeSnapshot) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function requestDesktopNotificationPermission(): Promise<DesktopNotificationRuntimeSnapshot> {
  const runtimeProfile = resolveWebRuntimeProfile(
    runtimeEnv(),
  );

  const adapter = readAdapter();
  if (!adapter || !isDesktopPhase1OfflineRuntime(runtimeProfile)) {
    return refreshDesktopNotificationRuntimeSnapshot();
  }

  const permissionState = await adapter.requestPermission();
  const snapshot = mapPromptState(runtimeProfile, true, permissionState);
  emitSnapshot(snapshot);
  return snapshot;
}

export function updateDesktopNotificationUnsupportedCounts(
  unsupported: { task: number; calendar: number },
): DesktopNotificationRuntimeSnapshot {
  const runtimeProfile = resolveWebRuntimeProfile(runtimeEnv());
  const snapshot = mapPromptState(
    runtimeProfile,
    currentSnapshot.adapterAvailable,
    currentSnapshot.permissionState,
    unsupported,
  );
  emitSnapshot(snapshot);
  return snapshot;
}

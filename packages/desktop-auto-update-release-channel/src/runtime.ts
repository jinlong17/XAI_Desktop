import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import type {
  DesktopUpdaterAvailability,
  DesktopUpdaterReasonCode,
  DesktopUpdaterRuntimeAdapter,
  DesktopUpdaterSnapshot,
} from "./types";

const listeners = new Set<(snapshot: DesktopUpdaterSnapshot) => void>();

const FALLBACK_SNAPSHOT: DesktopUpdaterSnapshot = {
  channel: "disabled",
  currentVersion: "unknown",
  availability: "disabled",
  reasonCode: "updater_not_configured",
};

let currentSnapshot: DesktopUpdaterSnapshot = FALLBACK_SNAPSHOT;

function runtimeEnv(): Record<string, string | undefined> {
  const meta = import.meta as unknown as {
    env?: Record<string, string | undefined>;
  };
  return meta.env ?? {};
}

function readAdapter(): DesktopUpdaterRuntimeAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.__XAI_DESKTOP_UPDATER__ ?? null;
}

function emitSnapshot(snapshot: DesktopUpdaterSnapshot): DesktopUpdaterSnapshot {
  currentSnapshot = snapshot;
  for (const listener of listeners) {
    listener(snapshot);
  }
  return snapshot;
}

function isAvailability(value: unknown): value is DesktopUpdaterAvailability {
  return (
    value === "disabled"
    || value === "ready"
    || value === "checking"
    || value === "update-available"
    || value === "up-to-date"
    || value === "error"
  );
}

function isReasonCode(value: unknown): value is DesktopUpdaterReasonCode {
  return (
    value === "channel_disabled"
    || value === "missing_endpoint"
    || value === "placeholder_endpoint"
    || value === "missing_pubkey"
    || value === "placeholder_pubkey"
    || value === "updater_not_configured"
    || value === "install_unavailable"
    || value === "network_error"
    || value === "invalid_manifest"
    || value === "signature_error"
  );
}

function isSnapshot(value: unknown): value is DesktopUpdaterSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<DesktopUpdaterSnapshot>;
  if (typeof candidate.channel !== "string") {
    return false;
  }
  if (candidate.channel !== "disabled" && candidate.channel !== "internal-rc" && candidate.channel !== "internal-canary") {
    return false;
  }
  if (typeof candidate.currentVersion !== "string") {
    return false;
  }
  if (!isAvailability(candidate.availability)) {
    return false;
  }
  if (candidate.reasonCode !== undefined && !isReasonCode(candidate.reasonCode)) {
    return false;
  }
  if (candidate.updateVersion !== undefined && typeof candidate.updateVersion !== "string") {
    return false;
  }
  if (candidate.updateNotes !== undefined && typeof candidate.updateNotes !== "string") {
    return false;
  }
  if (candidate.lastCheckedAt !== undefined && typeof candidate.lastCheckedAt !== "string") {
    return false;
  }
  return true;
}

function fallbackSnapshot(reasonCode: DesktopUpdaterReasonCode): DesktopUpdaterSnapshot {
  return {
    ...FALLBACK_SNAPSHOT,
    reasonCode,
  };
}

export function getDesktopUpdaterSnapshot(): DesktopUpdaterSnapshot {
  return currentSnapshot;
}

export function subscribeDesktopUpdaterSnapshot(
  listener: (snapshot: DesktopUpdaterSnapshot) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function refreshDesktopUpdaterSnapshot(): Promise<DesktopUpdaterSnapshot> {
  const runtimeProfile = resolveWebRuntimeProfile(runtimeEnv());
  if (!isDesktopPhase1OfflineRuntime(runtimeProfile)) {
    return emitSnapshot(fallbackSnapshot("updater_not_configured"));
  }

  const adapter = readAdapter();
  if (!adapter) {
    return emitSnapshot(fallbackSnapshot("updater_not_configured"));
  }

  try {
    const snapshot = await adapter.getSnapshot();
    if (!isSnapshot(snapshot)) {
      return emitSnapshot(fallbackSnapshot("updater_not_configured"));
    }
    return emitSnapshot(snapshot);
  } catch {
    return emitSnapshot(fallbackSnapshot("updater_not_configured"));
  }
}

export async function checkDesktopForUpdates(): Promise<DesktopUpdaterSnapshot> {
  const runtimeProfile = resolveWebRuntimeProfile(runtimeEnv());
  if (!isDesktopPhase1OfflineRuntime(runtimeProfile)) {
    return emitSnapshot(fallbackSnapshot("updater_not_configured"));
  }

  const adapter = readAdapter();
  if (!adapter) {
    return emitSnapshot(fallbackSnapshot("updater_not_configured"));
  }

  try {
    const snapshot = await adapter.check();
    if (!isSnapshot(snapshot)) {
      return emitSnapshot(fallbackSnapshot("updater_not_configured"));
    }
    return emitSnapshot(snapshot);
  } catch {
    return emitSnapshot({
      ...fallbackSnapshot("network_error"),
      availability: "error",
    });
  }
}

export function bindDesktopUpdaterAdapter(): () => void {
  const adapter = readAdapter();
  if (!adapter) {
    return () => undefined;
  }

  return adapter.subscribe((snapshot) => {
    if (!isSnapshot(snapshot)) {
      return;
    }
    emitSnapshot(snapshot);
  });
}

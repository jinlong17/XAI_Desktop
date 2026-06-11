import type {
  DesktopQuickOpenPreferenceInput,
  DesktopQuickOpenPresetId,
  DesktopQuickOpenRuntimeAdapter,
  DesktopQuickOpenSnapshot,
} from "./types";

const listeners = new Set<(snapshot: DesktopQuickOpenSnapshot) => void>();

const FALLBACK_SNAPSHOT: DesktopQuickOpenSnapshot = {
  preference: {
    presetId: "default",
    accelerator: null,
    enabled: false,
  },
  runtime: {
    state: "native_error",
    label: "Desktop quick-open bridge unavailable",
    errorCode: "bridge_unavailable",
    recoverable: true,
  },
};

let currentSnapshot: DesktopQuickOpenSnapshot = FALLBACK_SNAPSHOT;

function isPresetId(value: unknown): value is DesktopQuickOpenPresetId {
  return value === "default" || value === "alt-1" || value === "alt-2" || value === "disabled";
}

function isSnapshot(value: unknown): value is DesktopQuickOpenSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<DesktopQuickOpenSnapshot>;
  if (!candidate.preference || !candidate.runtime) {
    return false;
  }

  const { preference, runtime } = candidate;
  return (
    isPresetId(preference.presetId)
    && (typeof preference.accelerator === "string" || preference.accelerator === null)
    && typeof preference.enabled === "boolean"
    && typeof runtime.label === "string"
    && typeof runtime.recoverable === "boolean"
    && (
      runtime.state === "ready"
      || runtime.state === "disabled"
      || runtime.state === "conflict"
      || runtime.state === "invalid_config"
      || runtime.state === "native_error"
    )
  );
}

function readAdapter(): DesktopQuickOpenRuntimeAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.__XAI_DESKTOP_GLOBAL_HOTKEY__ ?? null;
}

function emitSnapshot(snapshot: DesktopQuickOpenSnapshot): DesktopQuickOpenSnapshot {
  currentSnapshot = snapshot;
  for (const listener of listeners) {
    listener(snapshot);
  }
  return snapshot;
}

function fallbackSnapshot(errorCode: string, label: string): DesktopQuickOpenSnapshot {
  return {
    ...FALLBACK_SNAPSHOT,
    runtime: {
      ...FALLBACK_SNAPSHOT.runtime,
      label,
      errorCode,
    },
  };
}

export function getDesktopQuickOpenSnapshot(): DesktopQuickOpenSnapshot {
  return currentSnapshot;
}

export function subscribeDesktopQuickOpenSnapshot(
  listener: (snapshot: DesktopQuickOpenSnapshot) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function refreshDesktopQuickOpenSnapshot(): Promise<DesktopQuickOpenSnapshot> {
  const adapter = readAdapter();
  if (!adapter) {
    return emitSnapshot(fallbackSnapshot("bridge_unavailable", "Desktop quick-open bridge unavailable"));
  }

  try {
    const snapshot = await adapter.getSnapshot();
    if (!isSnapshot(snapshot)) {
      return emitSnapshot(fallbackSnapshot("invalid_snapshot", "Desktop quick-open snapshot invalid"));
    }
    return emitSnapshot(snapshot);
  } catch {
    return emitSnapshot(fallbackSnapshot("native_error", "Desktop quick-open unavailable"));
  }
}

export async function setDesktopQuickOpenPreference(
  input: DesktopQuickOpenPreferenceInput,
): Promise<DesktopQuickOpenSnapshot> {
  const adapter = readAdapter();
  if (!adapter) {
    return emitSnapshot(fallbackSnapshot("bridge_unavailable", "Desktop quick-open bridge unavailable"));
  }

  try {
    const snapshot = await adapter.setPreference(input);
    if (!isSnapshot(snapshot)) {
      return emitSnapshot(fallbackSnapshot("invalid_snapshot", "Desktop quick-open snapshot invalid"));
    }
    return emitSnapshot(snapshot);
  } catch {
    return emitSnapshot(fallbackSnapshot("native_error", "Desktop quick-open unavailable"));
  }
}

export function bindDesktopQuickOpenAdapter(): () => void {
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

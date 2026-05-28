import {
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from "@repo/core";
import type {
  DesktopStatusbarAvailabilityReason,
  DesktopStatusbarQuickAction,
  DesktopStatusbarQuickActionState,
  DesktopStatusbarRuntimeAdapter,
  DesktopStatusbarSnapshot,
  RefreshDesktopStatusbarSnapshotInput,
} from "./types";

const listeners = new Set<(snapshot: DesktopStatusbarSnapshot) => void>();

const INITIAL_SNAPSHOT: DesktopStatusbarSnapshot = {
  appStatus: "loading",
  summaryLabel: "Loading",
  quickActions: {
    startPomodoro: {
      enabled: false,
      reason: "bridge_not_ready",
      label: "Start Pomodoro",
    },
    viewTodayTasks: {
      enabled: false,
      reason: "bridge_not_ready",
      label: "Today's Tasks",
    },
  },
};

let currentSnapshot: DesktopStatusbarSnapshot = INITIAL_SNAPSHOT;

function runtimeEnv(): Record<string, string | undefined> {
  const meta = import.meta as unknown as {
    env?: Record<string, string | undefined>;
  };
  return meta.env ?? {};
}

function readAdapter(): DesktopStatusbarRuntimeAdapter | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.__XAI_DESKTOP_STATUSBAR__ ?? null;
}

function emitSnapshot(snapshot: DesktopStatusbarSnapshot): DesktopStatusbarSnapshot {
  currentSnapshot = snapshot;
  for (const listener of listeners) {
    listener(snapshot);
  }
  return snapshot;
}

function quickActionState(
  label: string,
  featureEnabled: boolean,
  routeContractAvailable: boolean,
  runtimeSupported: boolean,
  adapterAvailable: boolean,
): DesktopStatusbarQuickActionState {
  if (!runtimeSupported) {
    return {
      enabled: false,
      reason: "unsupported_runtime",
      label,
    };
  }

  if (!adapterAvailable) {
    return {
      enabled: false,
      reason: "bridge_not_ready",
      label,
    };
  }

  if (!featureEnabled) {
    return {
      enabled: false,
      reason: "feature_disabled",
      label,
    };
  }

  if (!routeContractAvailable) {
    return {
      enabled: false,
      reason: "route_contract_missing",
      label,
    };
  }

  return {
    enabled: true,
    reason: "ready",
    label,
  };
}

function summarize(
  startPomodoro: DesktopStatusbarQuickActionState,
  viewTodayTasks: DesktopStatusbarQuickActionState,
): { appStatus: DesktopStatusbarSnapshot["appStatus"]; summaryLabel: string } {
  const enabledCount = [startPomodoro, viewTodayTasks].filter((state) => state.enabled).length;
  if (enabledCount === 2) {
    return { appStatus: "ready", summaryLabel: "Ready" };
  }
  if (enabledCount === 1) {
    return { appStatus: "degraded", summaryLabel: "Ready (limited actions)" };
  }

  const reasons = [startPomodoro.reason, viewTodayTasks.reason];
  if (reasons.every((reason) => reason === "bridge_not_ready")) {
    return { appStatus: "loading", summaryLabel: "Bridge not ready" };
  }
  if (reasons.every((reason) => reason === "unsupported_runtime")) {
    return { appStatus: "degraded", summaryLabel: "Desktop runtime unavailable" };
  }
  return { appStatus: "degraded", summaryLabel: "Actions unavailable" };
}

function reasonPriority(reason: DesktopStatusbarAvailabilityReason): number {
  switch (reason) {
    case "feature_disabled":
      return 0;
    case "route_contract_missing":
      return 1;
    case "bridge_not_ready":
      return 2;
    case "unsupported_runtime":
      return 3;
    case "ready":
      return 4;
    default:
      return 5;
  }
}

function normalizeReason(reason: DesktopStatusbarAvailabilityReason): DesktopStatusbarAvailabilityReason {
  return reason;
}

export function createDesktopStatusbarSnapshot(
  input: RefreshDesktopStatusbarSnapshotInput,
): DesktopStatusbarSnapshot {
  const runtimeProfile = resolveWebRuntimeProfile(runtimeEnv());
  const runtimeSupported = isDesktopPhase1OfflineRuntime(runtimeProfile);
  const adapterAvailable = readAdapter() !== null;

  const startPomodoro = quickActionState(
    "Start Pomodoro",
    Boolean(input.pomodoroFeatureEnabled),
    true,
    runtimeSupported,
    adapterAvailable,
  );

  const viewTodayTasks = quickActionState(
    "Today's Tasks",
    Boolean(input.tasksFeatureEnabled),
    true,
    runtimeSupported,
    adapterAvailable,
  );

  const summary = summarize(startPomodoro, viewTodayTasks);

  return {
    appStatus: summary.appStatus,
    summaryLabel: summary.summaryLabel,
    quickActions: {
      startPomodoro,
      viewTodayTasks,
    },
    notificationsStatus: input.notificationsStatus,
  };
}

export async function refreshDesktopStatusbarSnapshot(
  input: RefreshDesktopStatusbarSnapshotInput,
): Promise<DesktopStatusbarSnapshot> {
  const snapshot = createDesktopStatusbarSnapshot(input);
  const adapter = readAdapter();

  if (adapter) {
    await adapter.publishSnapshot(snapshot);
  }

  return emitSnapshot(snapshot);
}

export function getDesktopStatusbarSnapshot(): DesktopStatusbarSnapshot {
  return currentSnapshot;
}

export function subscribeDesktopStatusbarSnapshot(
  listener: (snapshot: DesktopStatusbarSnapshot) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isDesktopStatusbarQuickAction(value: unknown): value is DesktopStatusbarQuickAction {
  if (typeof value !== "string") {
    return false;
  }
  return (
    value === "open-app"
    || value === "start-pomodoro"
    || value === "view-today-tasks"
  );
}

export function subscribeDesktopStatusbarQuickActions(
  handler: (action: DesktopStatusbarQuickAction) => void,
): () => void {
  const adapter = readAdapter();
  if (!adapter) {
    return () => undefined;
  }

  return adapter.subscribe((action) => {
    if (!isDesktopStatusbarQuickAction(action)) {
      return;
    }
    handler(action);
  });
}

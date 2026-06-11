export type DesktopStatusbarQuickAction =
  | "open-app"
  | "start-pomodoro"
  | "view-today-tasks";

export type DesktopStatusbarAvailabilityReason =
  | "ready"
  | "feature_disabled"
  | "route_contract_missing"
  | "bridge_not_ready"
  | "unsupported_runtime";

export type DesktopStatusbarAppStatus = "loading" | "ready" | "degraded";

export type DesktopStatusbarNotificationsStatus =
  | "ready"
  | "disabled"
  | "denied"
  | "unsupported";

export interface DesktopStatusbarQuickActionState {
  enabled: boolean;
  reason: DesktopStatusbarAvailabilityReason;
  label: string;
}

export interface DesktopStatusbarSnapshot {
  appStatus: DesktopStatusbarAppStatus;
  summaryLabel: string;
  quickActions: {
    startPomodoro: DesktopStatusbarQuickActionState;
    viewTodayTasks: DesktopStatusbarQuickActionState;
  };
  notificationsStatus?: DesktopStatusbarNotificationsStatus;
}

export interface DesktopStatusbarRuntimeAdapter {
  publishSnapshot(snapshot: DesktopStatusbarSnapshot): Promise<void>;
  subscribe(handler: (action: DesktopStatusbarQuickAction) => void): () => void;
}

export interface RefreshDesktopStatusbarSnapshotInput {
  pomodoroFeatureEnabled: boolean;
  tasksFeatureEnabled: boolean;
  notificationsStatus?: DesktopStatusbarNotificationsStatus;
}

declare global {
  interface Window {
    __XAI_DESKTOP_STATUSBAR__?: DesktopStatusbarRuntimeAdapter;
  }
}

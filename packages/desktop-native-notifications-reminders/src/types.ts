export type DesktopNotificationPermissionState =
  | "granted"
  | "denied"
  | "prompt"
  | "prompt-with-rationale";

export interface DesktopNotificationRuntimeAdapter {
  isPermissionGranted(): Promise<boolean>;
  requestPermission(): Promise<DesktopNotificationPermissionState>;
  sendNotification(input: {
    title: string;
    body?: string;
    tag?: string;
  }): Promise<void> | void;
}

declare global {
  interface Window {
    __XAI_DESKTOP_NOTIFICATION__?: DesktopNotificationRuntimeAdapter;
  }
}

export type DesktopNotificationSource = "task" | "pomodoro" | "calendar";

export type DesktopNotificationStatus =
  | "ready"
  | "disabled"
  | "permission-required"
  | "denied"
  | "unsupported";

export interface DesktopNotificationRuntimeSnapshot {
  status: DesktopNotificationStatus;
  runtimeProfile: string;
  permissionState: DesktopNotificationPermissionState | "unknown";
  adapterAvailable: boolean;
  unsupported: {
    task: number;
    calendar: number;
  };
  lastUpdatedAt: string;
  unsupportedReason?: "non_desktop_runtime" | "adapter_unavailable";
}

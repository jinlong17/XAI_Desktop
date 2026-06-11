export type DesktopBridgeSurface =
  | "tasks"
  | "habits"
  | "pomodoro"
  | "board-workspace"
  | "pet"
  | "settings"
  | "calendar-provider"
  | "notes";

export type DesktopBridgeErrorKind =
  | "unsupported_surface"
  | "contract_mismatch"
  | "repo_unavailable"
  | "write_failed";

export interface DesktopBridgeError {
  kind: DesktopBridgeErrorKind;
  surface: DesktopBridgeSurface;
  message: string;
}

export type DesktopBridgeReadSource = "repo" | "browser" | "empty";

export interface DesktopBridgeReadResult<T = unknown> {
  source: DesktopBridgeReadSource;
  value: T;
}

export type DesktopBridgeWriteStatus = "ok" | "degraded";

export interface DesktopBridgeWriteResult {
  status: DesktopBridgeWriteStatus;
  error?: DesktopBridgeError;
}

export const NOTES_UNSUPPORTED_ERROR: DesktopBridgeError = {
  kind: "unsupported_surface",
  surface: "notes",
  message:
    "Notes are explicitly unsupported in desktop-local-first-repository-bridge row #11.",
};

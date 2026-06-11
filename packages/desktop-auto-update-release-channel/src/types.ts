export type DesktopReleaseChannel = "disabled" | "internal-rc" | "internal-canary";

export type DesktopUpdaterAvailability =
  | "disabled"
  | "ready"
  | "checking"
  | "update-available"
  | "up-to-date"
  | "error";

export type DesktopUpdaterReasonCode =
  | "channel_disabled"
  | "missing_endpoint"
  | "placeholder_endpoint"
  | "missing_pubkey"
  | "placeholder_pubkey"
  | "updater_not_configured"
  | "install_unavailable"
  | "network_error"
  | "invalid_manifest"
  | "signature_error";

export interface DesktopUpdaterSnapshot {
  channel: DesktopReleaseChannel;
  currentVersion: string;
  availability: DesktopUpdaterAvailability;
  reasonCode?: DesktopUpdaterReasonCode;
  updateVersion?: string;
  updateNotes?: string;
  lastCheckedAt?: string;
}

export interface DesktopUpdaterRuntimeAdapter {
  getSnapshot(): Promise<DesktopUpdaterSnapshot>;
  check(): Promise<DesktopUpdaterSnapshot>;
  subscribe(handler: (snapshot: DesktopUpdaterSnapshot) => void): () => void;
}

declare global {
  interface Window {
    __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter;
  }
}

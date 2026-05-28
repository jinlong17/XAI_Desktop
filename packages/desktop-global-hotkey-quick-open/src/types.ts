export type DesktopQuickOpenRuntimeState =
  | "ready"
  | "disabled"
  | "conflict"
  | "invalid_config"
  | "native_error";

export type DesktopQuickOpenPresetId = "default" | "alt-1" | "alt-2" | "disabled";

export interface DesktopQuickOpenSnapshot {
  preference: {
    presetId: DesktopQuickOpenPresetId;
    accelerator: string | null;
    enabled: boolean;
  };
  runtime: {
    state: DesktopQuickOpenRuntimeState;
    label: string;
    errorCode?: string;
    recoverable: boolean;
  };
}

export interface DesktopQuickOpenPreferenceInput {
  presetId: DesktopQuickOpenPresetId;
  enabled: boolean;
}

export interface DesktopQuickOpenRuntimeAdapter {
  getSnapshot(): Promise<DesktopQuickOpenSnapshot>;
  setPreference(input: DesktopQuickOpenPreferenceInput): Promise<DesktopQuickOpenSnapshot>;
  subscribe(handler: (snapshot: DesktopQuickOpenSnapshot) => void): () => void;
}

declare global {
  interface Window {
    __XAI_DESKTOP_GLOBAL_HOTKEY__?: DesktopQuickOpenRuntimeAdapter;
  }
}

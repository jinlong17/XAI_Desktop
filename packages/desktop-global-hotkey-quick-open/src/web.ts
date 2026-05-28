export {
  DesktopGlobalHotkeyQuickOpenBridge,
  useDesktopQuickOpenSnapshot,
} from "./bridge";
export {
  bindDesktopQuickOpenAdapter,
  getDesktopQuickOpenSnapshot,
  refreshDesktopQuickOpenSnapshot,
  setDesktopQuickOpenPreference,
  subscribeDesktopQuickOpenSnapshot,
} from "./runtime";
export type {
  DesktopQuickOpenPreferenceInput,
  DesktopQuickOpenPresetId,
  DesktopQuickOpenRuntimeAdapter,
  DesktopQuickOpenRuntimeState,
  DesktopQuickOpenSnapshot,
} from "./types";

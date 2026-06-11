export {
  DesktopAutoUpdateReleaseChannelBridge,
  useDesktopUpdaterActions,
  useDesktopUpdaterSnapshot,
} from "./bridge";

export {
  bindDesktopUpdaterAdapter,
  checkDesktopForUpdates,
  getDesktopUpdaterSnapshot,
  refreshDesktopUpdaterSnapshot,
  subscribeDesktopUpdaterSnapshot,
} from "./runtime";

export type {
  DesktopReleaseChannel,
  DesktopUpdaterAvailability,
  DesktopUpdaterReasonCode,
  DesktopUpdaterRuntimeAdapter,
  DesktopUpdaterSnapshot,
} from "./types";

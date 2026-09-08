export { createRestRpcDeviceTransport } from "./device-transport";
export type { CreateRestRpcDeviceTransportOptions, DeviceTransport } from "./device-transport";

export { WebAuthSessionProvider, useWebAuthSession, webSyncVersion } from "./session";
export type { WebAuthSessionContextValue, WebAuthSessionProviderProps } from "./session";

export {
  AppRouteGate,
  AuthRouteGate,
  resolveAppRouteGuard,
  resolveAuthRouteGuard
} from "./guards";
export type { AppRouteGateProps, AuthRouteGateProps, GuardResolution } from "./guards";

export { WebAuthPage } from "./components/WebAuthPage";
export type { WebAuthPageProps } from "./components/WebAuthPage";

export { DeviceSessionBridge, useDeviceBoundFetch } from "./components/DeviceSessionBridge";
export type { DeviceSessionBridgeProps } from "./components/DeviceSessionBridge";

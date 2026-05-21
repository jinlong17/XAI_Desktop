export { createWebSupabaseClient } from "./client";
export type { WebSupabaseClientConfig } from "./client";

export { createAuthSessionStorage, createIndexedDbStore, createMemoryKeyValueStore } from "./storage";
export type {
  CreateAuthSessionStorageOptions,
  CreateIndexedDbStoreOptions,
  KeyValueStore
} from "./storage";

export { createDeviceIdentityStore } from "./device-store";
export type { DeviceIdentityStore, CreateDeviceIdentityStoreOptions } from "./device-store";

export { resolveSafeNextPath } from "./redirects";
export type { ResolveSafeNextPathOptions, ResolvedNextPath } from "./redirects";

export {
  clearPkceState,
  completePasswordReset,
  readPkceState,
  requestPasswordReset,
  signInWithEmail,
  signUpWithEmail,
  startOAuthLogin
} from "./auth-actions";
export type { StringStorage } from "./auth-actions";

export { AuthCallbackError, handleAuthCallback } from "./callback";
export type { HandleAuthCallbackResult } from "./callback";

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

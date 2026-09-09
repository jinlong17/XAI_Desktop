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
  startOAuthLogin,
  // Account delete (extension 2026-05-26 — gap-closure row #9)
  deleteAccount,
  AccountDeleteError,
} from "./auth-actions";
export type {
  StringStorage,
  // Account delete types (extension 2026-05-26 — gap-closure row #9)
  AccountDeleteErrorKind,
  DeleteAccountOptions,
} from "./auth-actions";

// IDB wipe helpers (extension 2026-05-26 — gap-closure row #9)
export { ACCOUNT_LOCAL_WIPE_IDB_NAMES, wipeRegisteredIDB } from "./wipe";

export { AuthCallbackError, handleAuthCallback } from "./callback";
export type { HandleAuthCallbackOptions, HandleAuthCallbackResult } from "./callback";

export { createDeviceBoundFetch, DeviceAuthError } from "./device-fetch";
export type { CreateDeviceBoundFetchOptions, DeviceBoundContext } from "./device-fetch";

export { createDeviceSessionController } from "./device-session";
export type {
  CreateDeviceSessionControllerOptions,
  DeviceSessionController,
  DeviceSessionState
} from "./device-session";

export { createRestRpcDeviceTransport, DeviceTransportError } from "./device-transport";
export type {
  CreateRestRpcDeviceTransportOptions,
  DeviceFailureReason,
  DeviceTransport,
  DeviceTransportRequest
} from "./device-transport";

export { createHeartbeatScheduler } from "./heartbeat";
export type { CreateHeartbeatSchedulerOptions, HeartbeatScheduler } from "./heartbeat";

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

export { createAuthGenerationStore, AuthGenerationStorageError } from './auth-generation-store';
export type {
  AuthGenerationLease, ActiveAuthGeneration, AuthGenerationFailure,
  AuthGenerationMutationResult, AuthGenerationRecovery, AuthGenerationStore,
  CreateAuthGenerationStoreOptions, PublishAuthGenerationOptions, ImportLegacyAuthGenerationOptions
} from './auth-generation-store';

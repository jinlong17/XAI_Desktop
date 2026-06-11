export const WEB_RUNTIME_PROFILE_WEB_LIVE = "web-live";
export const WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE = "desktop-phase1-offline";
export const XAI_DESKTOP_HOST_TAURI = "tauri";
export const XAI_DESKTOP_HOST_NONE = "none";

export type WebRuntimeProfile =
  | typeof WEB_RUNTIME_PROFILE_WEB_LIVE
  | typeof WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE;

export type DesktopHost =
  | typeof XAI_DESKTOP_HOST_TAURI
  | typeof XAI_DESKTOP_HOST_NONE;

export function resolveWebRuntimeProfile(
  env?: Record<string, string | undefined>
): WebRuntimeProfile {
  const profile = env?.VITE_WEB_RUNTIME_PROFILE;
  if (profile === WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE) {
    return WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE;
  }
  return WEB_RUNTIME_PROFILE_WEB_LIVE;
}

export function isDesktopPhase1OfflineRuntime(profile: WebRuntimeProfile): boolean {
  return profile === WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE;
}

export function resolveDesktopHost(
  env?: Record<string, string | undefined>,
  globals?: { __TAURI_INTERNALS__?: unknown }
): DesktopHost {
  const host = env?.VITE_XAI_DESKTOP_HOST;
  if (host === XAI_DESKTOP_HOST_TAURI) {
    return XAI_DESKTOP_HOST_TAURI;
  }
  if (!host && globals?.__TAURI_INTERNALS__) {
    return XAI_DESKTOP_HOST_TAURI;
  }
  return XAI_DESKTOP_HOST_NONE;
}

export function isDesktopHost(host: DesktopHost): boolean {
  return host === XAI_DESKTOP_HOST_TAURI;
}

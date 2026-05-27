export const WEB_RUNTIME_PROFILE_WEB_LIVE = "web-live";
export const WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE = "desktop-phase1-offline";

export type WebRuntimeProfile =
  | typeof WEB_RUNTIME_PROFILE_WEB_LIVE
  | typeof WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE;

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

import { describe, expect, it } from 'vitest';
import {
  WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE,
  WEB_RUNTIME_PROFILE_WEB_LIVE,
  isDesktopPhase1OfflineRuntime,
  resolveWebRuntimeProfile,
} from '../src/utils';

describe('runtime profile utils', () => {
  it('defaults to web-live when env is absent', () => {
    expect(resolveWebRuntimeProfile({})).toBe(WEB_RUNTIME_PROFILE_WEB_LIVE);
  });

  it('resolves desktop profile when env is set', () => {
    expect(
      resolveWebRuntimeProfile({
        VITE_WEB_RUNTIME_PROFILE: WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE,
      }),
    ).toBe(WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE);
  });

  it('falls back to web-live for unknown runtime profile values', () => {
    expect(
      resolveWebRuntimeProfile({
        VITE_WEB_RUNTIME_PROFILE: 'unknown-profile',
      }),
    ).toBe(WEB_RUNTIME_PROFILE_WEB_LIVE);
  });

  it('predicate only matches desktop phase1 offline profile', () => {
    expect(
      isDesktopPhase1OfflineRuntime(WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE),
    ).toBe(true);
    expect(isDesktopPhase1OfflineRuntime(WEB_RUNTIME_PROFILE_WEB_LIVE)).toBe(
      false,
    );
  });
});

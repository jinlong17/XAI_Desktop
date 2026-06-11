import { describe, expect, it } from 'vitest';
import {
  XAI_DESKTOP_HOST_NONE,
  XAI_DESKTOP_HOST_TAURI,
  WEB_RUNTIME_PROFILE_DESKTOP_PHASE1_OFFLINE,
  WEB_RUNTIME_PROFILE_WEB_LIVE,
  isDesktopHost,
  isDesktopPhase1OfflineRuntime,
  resolveDesktopHost,
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

  it('resolves desktop host from env when set to tauri', () => {
    expect(
      resolveDesktopHost({
        VITE_XAI_DESKTOP_HOST: XAI_DESKTOP_HOST_TAURI,
      }),
    ).toBe(XAI_DESKTOP_HOST_TAURI);
  });

  it('defaults desktop host to none when env is absent', () => {
    expect(resolveDesktopHost({})).toBe(XAI_DESKTOP_HOST_NONE);
  });

  it('falls back to none for unknown desktop host values', () => {
    expect(
      resolveDesktopHost({
        VITE_XAI_DESKTOP_HOST: 'unknown-host',
      }),
    ).toBe(XAI_DESKTOP_HOST_NONE);
  });

  it('uses tauri globals fallback only when env host is absent', () => {
    expect(
      resolveDesktopHost({}, { __TAURI_INTERNALS__: {} }),
    ).toBe(XAI_DESKTOP_HOST_TAURI);
    expect(
      resolveDesktopHost(
        { VITE_XAI_DESKTOP_HOST: 'unknown-host' },
        { __TAURI_INTERNALS__: {} },
      ),
    ).toBe(XAI_DESKTOP_HOST_NONE);
  });

  it('desktop host predicate only matches tauri', () => {
    expect(isDesktopHost(XAI_DESKTOP_HOST_TAURI)).toBe(true);
    expect(isDesktopHost(XAI_DESKTOP_HOST_NONE)).toBe(false);
  });
});

// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  enabled: true,
  isPermissionGranted: vi.fn(async () => true),
  requestPermission: vi.fn(async () => "granted" as const),
}));

vi.mock("@repo/plugin-web-storage", () => ({
  getPref: (key: string) => {
    if (key === "xai_pref_notif_enabled") {
      return state.enabled;
    }
    return undefined;
  },
}));

function setEnv(key: string, value: string | undefined): void {
  const env = import.meta.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
    return;
  }
  env[key] = value;
}

describe("desktop notification runtime snapshot", () => {
  beforeEach(() => {
    vi.resetModules();
    state.enabled = true;
    state.isPermissionGranted.mockReset();
    state.requestPermission.mockReset();
    state.isPermissionGranted.mockResolvedValue(true);
    state.requestPermission.mockResolvedValue("granted");

    setEnv("VITE_WEB_RUNTIME_PROFILE", "desktop-phase1-offline");
    window.__XAI_DESKTOP_NOTIFICATION__ = {
      isPermissionGranted: state.isPermissionGranted,
      requestPermission: state.requestPermission,
      sendNotification: () => undefined,
    };
  });

  afterEach(() => {
    delete window.__XAI_DESKTOP_NOTIFICATION__;
    setEnv("VITE_WEB_RUNTIME_PROFILE", undefined);
  });

  it("emits disabled status when master notification pref is off", async () => {
    state.enabled = false;
    const runtime = await import("./runtime");

    const snapshot = await runtime.refreshDesktopNotificationRuntimeSnapshot();
    expect(snapshot.status).toBe("disabled");
    expect(snapshot.runtimeProfile).toBe("desktop-phase1-offline");
    expect(snapshot.adapterAvailable).toBe(true);
  });

  it("keeps disabled status when unsupported counts update", async () => {
    state.enabled = false;
    const runtime = await import("./runtime");

    await runtime.refreshDesktopNotificationRuntimeSnapshot();
    const snapshot = runtime.updateDesktopNotificationUnsupportedCounts({
      task: 2,
      calendar: 1,
    });

    expect(snapshot.status).toBe("disabled");
    expect(snapshot.unsupported).toEqual({ task: 2, calendar: 1 });
  });
});

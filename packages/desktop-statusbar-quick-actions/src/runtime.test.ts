// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDesktopStatusbarSnapshot,
  refreshDesktopStatusbarSnapshot,
} from "./runtime";

function setEnv(key: string, value: string | undefined): void {
  const env = import.meta.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
    return;
  }
  env[key] = value;
}

describe("desktop statusbar runtime snapshot", () => {
  const publishSnapshot = vi.fn(async () => undefined);

  beforeEach(() => {
    publishSnapshot.mockReset();
    delete window.__XAI_DESKTOP_STATUSBAR__;
    setEnv("VITE_XAI_DESKTOP_HOST", "tauri");
  });

  afterEach(() => {
    delete window.__XAI_DESKTOP_STATUSBAR__;
    setEnv("VITE_XAI_DESKTOP_HOST", undefined);
  });

  it("returns unsupported runtime reasons when desktop host signal is absent", () => {
    setEnv("VITE_XAI_DESKTOP_HOST", undefined);

    const snapshot = createDesktopStatusbarSnapshot({
      tasksFeatureEnabled: true,
      pomodoroFeatureEnabled: true,
    });

    expect(snapshot.appStatus).toBe("degraded");
    expect(snapshot.quickActions.startPomodoro.reason).toBe("unsupported_runtime");
    expect(snapshot.quickActions.viewTodayTasks.reason).toBe("unsupported_runtime");
  });

  it("returns bridge-not-ready in desktop runtime when adapter is absent", () => {
    const snapshot = createDesktopStatusbarSnapshot({
      tasksFeatureEnabled: true,
      pomodoroFeatureEnabled: true,
    });

    expect(snapshot.appStatus).toBe("loading");
    expect(snapshot.summaryLabel).toContain("Bridge");
    expect(snapshot.quickActions.startPomodoro.reason).toBe("bridge_not_ready");
    expect(snapshot.quickActions.viewTodayTasks.reason).toBe("bridge_not_ready");
  });

  it("publishes snapshot through host adapter when available", async () => {
    window.__XAI_DESKTOP_STATUSBAR__ = {
      publishSnapshot,
      subscribe: () => () => undefined,
    };

    const snapshot = await refreshDesktopStatusbarSnapshot({
      tasksFeatureEnabled: true,
      pomodoroFeatureEnabled: true,
    });

    expect(snapshot.appStatus).toBe("ready");
    expect(snapshot.quickActions.startPomodoro.enabled).toBe(true);
    expect(snapshot.quickActions.viewTodayTasks.enabled).toBe(true);
    expect(publishSnapshot).toHaveBeenCalledTimes(1);
  });

  it("marks feature disabled reasons when toggles are off", () => {
    window.__XAI_DESKTOP_STATUSBAR__ = {
      publishSnapshot,
      subscribe: () => () => undefined,
    };

    const snapshot = createDesktopStatusbarSnapshot({
      tasksFeatureEnabled: false,
      pomodoroFeatureEnabled: true,
    });

    expect(snapshot.appStatus).toBe("degraded");
    expect(snapshot.quickActions.startPomodoro.reason).toBe("ready");
    expect(snapshot.quickActions.viewTodayTasks.reason).toBe("feature_disabled");
  });
});

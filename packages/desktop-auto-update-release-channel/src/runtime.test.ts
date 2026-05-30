// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bindDesktopUpdaterAdapter,
  checkDesktopForUpdates,
  refreshDesktopUpdaterSnapshot,
} from "./runtime";
import type {
  DesktopUpdaterRuntimeAdapter,
  DesktopUpdaterSnapshot,
} from "./types";

function setEnv(key: string, value: string | undefined): void {
  const env = import.meta.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
    return;
  }
  env[key] = value;
}

function readySnapshot(): DesktopUpdaterSnapshot {
  return {
    channel: "internal-rc",
    currentVersion: "1.0.0-rc.1",
    availability: "ready",
  };
}

describe("desktop updater runtime", () => {
  beforeEach(() => {
    delete (window as Window & { __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter }).__XAI_DESKTOP_UPDATER__;
    setEnv("VITE_XAI_DESKTOP_HOST", "tauri");
  });

  afterEach(() => {
    delete (window as Window & { __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter }).__XAI_DESKTOP_UPDATER__;
    setEnv("VITE_XAI_DESKTOP_HOST", undefined);
  });

  it("falls back when adapter is missing", async () => {
    const snapshot = await refreshDesktopUpdaterSnapshot();
    expect(snapshot.availability).toBe("disabled");
    expect(snapshot.reasonCode).toBe("updater_not_configured");
  });

  it("reads snapshot from adapter", async () => {
    const adapter: DesktopUpdaterRuntimeAdapter = {
      getSnapshot: vi.fn(async () => readySnapshot()),
      check: vi.fn(async () => readySnapshot()),
      subscribe: vi.fn(() => () => undefined),
    };
    (window as Window & { __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter }).__XAI_DESKTOP_UPDATER__ = adapter;

    const snapshot = await refreshDesktopUpdaterSnapshot();
    expect(snapshot.availability).toBe("ready");
    expect(adapter.getSnapshot).toHaveBeenCalledTimes(1);
  });

  it("checks through adapter", async () => {
    const adapter: DesktopUpdaterRuntimeAdapter = {
      getSnapshot: vi.fn(async () => readySnapshot()),
      check: vi.fn(async () => ({
        ...readySnapshot(),
        availability: "update-available",
        reasonCode: "install_unavailable",
        updateVersion: "1.0.0-rc.2",
      })),
      subscribe: vi.fn(() => () => undefined),
    };
    (window as Window & { __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter }).__XAI_DESKTOP_UPDATER__ = adapter;

    const snapshot = await checkDesktopForUpdates();
    expect(snapshot.availability).toBe("update-available");
    expect(snapshot.reasonCode).toBe("install_unavailable");
    expect(adapter.check).toHaveBeenCalledTimes(1);
  });

  it("binds adapter subscription", () => {
    const unsubscribe = vi.fn();
    const adapter: DesktopUpdaterRuntimeAdapter = {
      getSnapshot: vi.fn(async () => readySnapshot()),
      check: vi.fn(async () => readySnapshot()),
      subscribe: vi.fn(() => unsubscribe),
    };
    (window as Window & { __XAI_DESKTOP_UPDATER__?: DesktopUpdaterRuntimeAdapter }).__XAI_DESKTOP_UPDATER__ = adapter;

    const teardown = bindDesktopUpdaterAdapter();
    expect(adapter.subscribe).toHaveBeenCalledTimes(1);
    teardown();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("reports unsupported runtime as not configured", async () => {
    setEnv("VITE_XAI_DESKTOP_HOST", undefined);

    const snapshot = await refreshDesktopUpdaterSnapshot();
    expect(snapshot.availability).toBe("disabled");
    expect(snapshot.reasonCode).toBe("updater_not_configured");
  });
});

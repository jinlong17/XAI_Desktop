// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bindDesktopQuickOpenAdapter,
  getDesktopQuickOpenSnapshot,
  refreshDesktopQuickOpenSnapshot,
  setDesktopQuickOpenPreference,
} from "./runtime";
import type {
  DesktopQuickOpenPreferenceInput,
  DesktopQuickOpenRuntimeAdapter,
  DesktopQuickOpenSnapshot,
} from "./types";

function snapshot(state: DesktopQuickOpenSnapshot["runtime"]["state"]): DesktopQuickOpenSnapshot {
  return {
    preference: {
      presetId: "default",
      accelerator: "CommandOrControl+Shift+Space",
      enabled: state !== "disabled",
    },
    runtime: {
      state,
      label: "ok",
      recoverable: true,
    },
  };
}

describe("desktop-global-hotkey runtime", () => {
  beforeEach(() => {
    delete (window as Window & { __XAI_DESKTOP_GLOBAL_HOTKEY__?: DesktopQuickOpenRuntimeAdapter }).__XAI_DESKTOP_GLOBAL_HOTKEY__;
  });

  it("falls back when adapter is missing", async () => {
    const result = await refreshDesktopQuickOpenSnapshot();
    expect(result.runtime.state).toBe("native_error");
    expect(result.runtime.errorCode).toBe("bridge_unavailable");
  });

  it("reads snapshot from adapter", async () => {
    const adapterSnapshot = snapshot("ready");
    const adapter: DesktopQuickOpenRuntimeAdapter = {
      getSnapshot: vi.fn(async () => adapterSnapshot),
      setPreference: vi.fn(async () => adapterSnapshot),
      subscribe: vi.fn(() => () => undefined),
    };
    (window as Window & { __XAI_DESKTOP_GLOBAL_HOTKEY__?: DesktopQuickOpenRuntimeAdapter }).__XAI_DESKTOP_GLOBAL_HOTKEY__ = adapter;

    const result = await refreshDesktopQuickOpenSnapshot();
    expect(result.runtime.state).toBe("ready");
    expect(getDesktopQuickOpenSnapshot().runtime.state).toBe("ready");
    expect(adapter.getSnapshot).toHaveBeenCalledTimes(1);
  });

  it("writes preference through adapter", async () => {
    const adapterSnapshot = snapshot("disabled");
    const setPreference = vi.fn(async (_input: DesktopQuickOpenPreferenceInput) => adapterSnapshot);
    const adapter: DesktopQuickOpenRuntimeAdapter = {
      getSnapshot: vi.fn(async () => snapshot("ready")),
      setPreference,
      subscribe: vi.fn(() => () => undefined),
    };
    (window as Window & { __XAI_DESKTOP_GLOBAL_HOTKEY__?: DesktopQuickOpenRuntimeAdapter }).__XAI_DESKTOP_GLOBAL_HOTKEY__ = adapter;

    const result = await setDesktopQuickOpenPreference({ presetId: "disabled", enabled: false });
    expect(result.runtime.state).toBe("disabled");
    expect(setPreference).toHaveBeenCalledWith({ presetId: "disabled", enabled: false });
  });

  it("binds adapter subscription", () => {
    const unsubscribe = vi.fn();
    const adapter: DesktopQuickOpenRuntimeAdapter = {
      getSnapshot: vi.fn(async () => snapshot("ready")),
      setPreference: vi.fn(async () => snapshot("ready")),
      subscribe: vi.fn(() => unsubscribe),
    };
    (window as Window & { __XAI_DESKTOP_GLOBAL_HOTKEY__?: DesktopQuickOpenRuntimeAdapter }).__XAI_DESKTOP_GLOBAL_HOTKEY__ = adapter;

    const teardown = bindDesktopQuickOpenAdapter();
    expect(adapter.subscribe).toHaveBeenCalledTimes(1);
    teardown();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});

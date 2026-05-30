import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi, afterEach } from "vitest";

type DesktopGlobal = typeof globalThis & {
  __TAURI_INTERNALS__?: {
    invoke?: (command: string, args?: unknown) => Promise<unknown>;
  };
  __TAURI__?: {
    core?: {
      invoke?: (command: string, args?: unknown) => Promise<unknown>;
    };
  };
  __XAI_DESKTOP_NOTIFICATION__?: {
    isPermissionGranted: () => Promise<boolean>;
    requestPermission: () => Promise<string>;
    sendNotification: (input: unknown) => Promise<unknown>;
  };
  __XAI_DESKTOP_STATUSBAR__?: {
    publishSnapshot: (snapshot: unknown) => Promise<unknown>;
    subscribe: (handler: (payload: unknown) => void) => () => void;
  };
  __XAI_DESKTOP_GLOBAL_HOTKEY__?: {
    getSnapshot: () => Promise<unknown>;
    setPreference: (input: unknown) => Promise<unknown>;
    subscribe: (handler: (payload: unknown) => void) => () => void;
  };
  __XAI_DESKTOP_UPDATER__?: {
    getSnapshot: () => Promise<unknown>;
    check: () => Promise<unknown>;
    subscribe: (handler: (payload: unknown) => void) => () => void;
  };
};

const DESKTOP_SRC = resolve(process.cwd(), "../desktop/src-tauri/src");

function runAdapterScript(name: string): void {
  const script = readFileSync(resolve(DESKTOP_SRC, name), "utf8");
  Function(script)();
}

afterEach(() => {
  const target = globalThis as DesktopGlobal;
  delete target.__TAURI_INTERNALS__;
  delete target.__TAURI__;
  delete target.__XAI_DESKTOP_NOTIFICATION__;
  delete target.__XAI_DESKTOP_STATUSBAR__;
  delete target.__XAI_DESKTOP_GLOBAL_HOTKEY__;
  delete target.__XAI_DESKTOP_UPDATER__;
  vi.restoreAllMocks();
});

describe("desktop Tauri adapter initialization scripts", () => {
  it("installs adapters even when invoke is attached after script evaluation", async () => {
    runAdapterScript("desktop_updater_adapter.js");
    expect((globalThis as DesktopGlobal).__XAI_DESKTOP_UPDATER__).toBeDefined();

    const invoke = vi.fn(async (command: string) => ({ command }));
    (globalThis as DesktopGlobal).__TAURI_INTERNALS__ = { invoke };

    await (globalThis as DesktopGlobal).__XAI_DESKTOP_UPDATER__?.getSnapshot();
    expect(invoke).toHaveBeenCalledWith("desktop_updater_get_snapshot");
  });

  it("installs notification adapter from __TAURI_INTERNALS__.invoke", async () => {
    const invoke = vi.fn(async (command: string) => {
      if (command === "plugin:notification|is_permission_granted") return true;
      if (command === "plugin:notification|request_permission") return "prompt-with-rationale";
      return null;
    });
    (globalThis as DesktopGlobal).__TAURI_INTERNALS__ = { invoke };

    runAdapterScript("desktop_notification_adapter.js");

    const adapter = (globalThis as DesktopGlobal).__XAI_DESKTOP_NOTIFICATION__;
    expect(adapter).toBeDefined();
    await expect(adapter?.isPermissionGranted()).resolves.toBe(true);
    await expect(adapter?.requestPermission()).resolves.toBe("prompt");
    await adapter?.sendNotification({ title: "Ready", body: "Native bridge" });
    expect(invoke).toHaveBeenCalledWith("plugin:notification|notify", {
      options: { title: "Ready", body: "Native bridge" },
    });
  });

  it("installs statusbar adapter before React effects run", async () => {
    const invoke = vi.fn(async () => null);
    (globalThis as DesktopGlobal).__TAURI_INTERNALS__ = { invoke };

    runAdapterScript("desktop_statusbar_adapter.js");

    const adapter = (globalThis as DesktopGlobal).__XAI_DESKTOP_STATUSBAR__;
    expect(adapter).toBeDefined();
    const snapshot = { appStatus: "ready", summaryLabel: "Ready" };
    await adapter?.publishSnapshot(snapshot);
    expect(invoke).toHaveBeenCalledWith("statusbar_set_snapshot", { payload: snapshot });

    const handler = vi.fn();
    const unsubscribe = adapter?.subscribe(handler);
    globalThis.dispatchEvent(
      new CustomEvent("xai:desktop-statusbar-quick-action", { detail: "start-pomodoro" }),
    );
    expect(handler).toHaveBeenCalledWith("start-pomodoro");
    unsubscribe?.();
  });

  it("installs global-hotkey and updater adapters from initialization-time internals", async () => {
    const invoke = vi.fn(async (command: string) => ({ command }));
    (globalThis as DesktopGlobal).__TAURI__ = { core: { invoke } };

    runAdapterScript("desktop_global_hotkey_adapter.js");
    runAdapterScript("desktop_updater_adapter.js");

    await (globalThis as DesktopGlobal).__XAI_DESKTOP_GLOBAL_HOTKEY__?.getSnapshot();
    await (globalThis as DesktopGlobal).__XAI_DESKTOP_GLOBAL_HOTKEY__?.setPreference({ enabled: true });
    await (globalThis as DesktopGlobal).__XAI_DESKTOP_UPDATER__?.getSnapshot();
    await (globalThis as DesktopGlobal).__XAI_DESKTOP_UPDATER__?.check();

    expect(invoke).toHaveBeenCalledWith("desktop_global_hotkey_get_snapshot");
    expect(invoke).toHaveBeenCalledWith("desktop_global_hotkey_set_preference", {
      input: { enabled: true },
    });
    expect(invoke).toHaveBeenCalledWith("desktop_updater_get_snapshot");
    expect(invoke).toHaveBeenCalledWith("desktop_updater_check");
  });
});

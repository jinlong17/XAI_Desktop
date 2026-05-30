import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";
import { AppProviders } from "./AppProviders";

const authMock = vi.hoisted(() => {
  return {
    providerProps: [] as Array<{ client: unknown; config: unknown }>,
    bridgeProps: [] as Array<{ transport: unknown }>,
    createTransport: vi.fn((args: { baseUrl: string }) => ({ kind: "transport", ...args })),
  };
});

const storageMock = vi.hoisted(() => {
  return {
    mountBridge: vi.fn(),
    runImport: vi.fn(async () => ({ status: "ok" })),
    getLastReport: vi.fn(() => null),
    createBackup: vi.fn(async () => ({ status: "verified_full" })),
    verifyBackup: vi.fn(async () => ({ status: "verified_full" })),
    importBackup: vi.fn(async () => ({ status: "restored" })),
    getBackupReport: vi.fn(() => null),
    reconnectPreflight: vi.fn(async () => "queue_empty"),
    runReconnect: vi.fn(async () => ({ preflight: "queue_empty", attempted: 0 })),
    runCalendarReconnect: vi.fn(async () => ({
      preflight: "queue_empty",
      attemptedProviders: [],
      reconciledProviders: [],
      deferredProviders: [],
      failures: [],
    })),
  };
});

vi.mock("@repo/web-auth-device-session/web", () => ({
  createRestRpcDeviceTransport: authMock.createTransport,
  WebAuthSessionProvider: ({ children, client, config }: PropsWithChildren<{ client: unknown; config: unknown }>) => {
    authMock.providerProps.push({ client, config });
    return children;
  },
  DeviceSessionBridge: ({ children, transport }: PropsWithChildren<{ transport: unknown }>) => {
    authMock.bridgeProps.push({ transport });
    return children;
  },
  useDeviceBoundFetch: () => null,
  useWebAuthSession: () => ({
    state: "authenticated",
    session: {
      access_token: "mock-access-token",
      user: { id: "mock-user", user_metadata: {}, app_metadata: {} },
    },
    deviceId: null,
    syncVersion: "2026-05",
  }),
}));

vi.mock("@repo/plugin-web-storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@repo/plugin-web-storage")>();
  return {
    ...actual,
    mountDesktopLocalFirstRepositoryBridge: storageMock.mountBridge,
    runDesktopLocalFirstWebDataImport: storageMock.runImport,
    getDesktopLocalFirstWebDataImportReport: storageMock.getLastReport,
    createDesktopLocalFirstBackupArtifact: storageMock.createBackup,
    verifyDesktopLocalFirstBackupArtifact: storageMock.verifyBackup,
    importDesktopLocalFirstBackupArtifact: storageMock.importBackup,
    getDesktopLocalFirstBackupReport: storageMock.getBackupReport,
    getDesktopLocalFirstReconnectSyncPreflight: storageMock.reconnectPreflight,
    runDesktopLocalFirstReconnectSync: storageMock.runReconnect,
    runDesktopLocalFirstCalendarProviderReconnect:
      storageMock.runCalendarReconnect,
  };
});

function setEnv(key: string, value: string | undefined): void {
  const env = import.meta.env as Record<string, string | undefined>;
  if (value === undefined) {
    delete env[key];
    return;
  }
  env[key] = value;
}

describe("AppProviders desktop auth contract", () => {
  beforeEach(() => {
    authMock.providerProps.length = 0;
    authMock.bridgeProps.length = 0;
    authMock.createTransport.mockClear();
    storageMock.mountBridge.mockClear();
    storageMock.runImport.mockClear();
    storageMock.getLastReport.mockClear();
    storageMock.createBackup.mockClear();
    storageMock.verifyBackup.mockClear();
    storageMock.importBackup.mockClear();
    storageMock.getBackupReport.mockClear();
    storageMock.reconnectPreflight.mockClear();
    storageMock.runReconnect.mockClear();
    storageMock.runCalendarReconnect.mockClear();
    delete (globalThis as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
    delete (globalThis as { __TAURI__?: unknown }).__TAURI__;
    delete (globalThis as { __XAI_DESKTOP_NOTIFICATION__?: unknown }).__XAI_DESKTOP_NOTIFICATION__;
    delete (globalThis as { __XAI_DESKTOP_STATUSBAR__?: unknown }).__XAI_DESKTOP_STATUSBAR__;
    delete (globalThis as { __XAI_DESKTOP_GLOBAL_HOTKEY__?: unknown }).__XAI_DESKTOP_GLOBAL_HOTKEY__;
    delete (globalThis as { __XAI_DESKTOP_UPDATER__?: unknown }).__XAI_DESKTOP_UPDATER__;
    delete (globalThis as { __XAI_DESKTOP_WEB_IMPORT__?: unknown }).__XAI_DESKTOP_WEB_IMPORT__;
    delete (globalThis as { __XAI_DESKTOP_RECONNECT_SYNC__?: unknown }).__XAI_DESKTOP_RECONNECT_SYNC__;
    delete (globalThis as { __XAI_DESKTOP_BACKUP__?: unknown }).__XAI_DESKTOP_BACKUP__;
    setEnv("VITE_WEB_AUTH_MODE", undefined);
    setEnv("VITE_WEB_RUNTIME_PROFILE", undefined);
    setEnv("VITE_XAI_DESKTOP_HOST", undefined);
    setEnv("VITE_SUPABASE_URL", undefined);
    setEnv("VITE_SUPABASE_ANON_KEY", undefined);
  });

  it("keeps transport inactive and resolves mock authenticated session in desktop mock mode", async () => {
    setEnv("VITE_WEB_AUTH_MODE", "mock-authenticated");

    render(
      <AppProviders>
        <div>child</div>
      </AppProviders>
    );

    expect(authMock.createTransport).not.toHaveBeenCalled();
    expect(authMock.bridgeProps).toHaveLength(0);
    expect(storageMock.mountBridge).toHaveBeenCalledWith(false);
    expect((globalThis as { __XAI_DESKTOP_WEB_IMPORT__?: unknown }).__XAI_DESKTOP_WEB_IMPORT__).toBeUndefined();
    expect((globalThis as { __XAI_DESKTOP_RECONNECT_SYNC__?: unknown }).__XAI_DESKTOP_RECONNECT_SYNC__).toBeUndefined();
    expect((globalThis as { __XAI_DESKTOP_BACKUP__?: unknown }).__XAI_DESKTOP_BACKUP__).toBeUndefined();
    expect(authMock.providerProps).toHaveLength(1);
    expect(authMock.providerProps[0]?.config).toBeNull();
    expect(authMock.providerProps[0]?.client).toBeTruthy();

    const client = authMock.providerProps[0]?.client as {
      auth: { getSession: () => Promise<{ data: { session: { user: { role: string } } | null } }> };
    };
    const { data } = await client.auth.getSession();
    expect(data.session?.user.role).toBe("authenticated");
  });

  it("keeps transport inactive when desktop host signal is present even in live auth mode", () => {
    setEnv("VITE_WEB_AUTH_MODE", "live");
    setEnv("VITE_XAI_DESKTOP_HOST", "tauri");
    setEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
    setEnv("VITE_SUPABASE_ANON_KEY", "anon-key");

    render(
      <AppProviders>
        <div>child</div>
      </AppProviders>
    );

    expect(authMock.createTransport).not.toHaveBeenCalled();
    expect(authMock.bridgeProps).toHaveLength(0);
    expect(storageMock.mountBridge).toHaveBeenCalledWith(true);

    const runtime = globalThis as {
      __XAI_DESKTOP_WEB_IMPORT__?: {
        run: unknown;
        getLastReport: unknown;
      };
      __XAI_DESKTOP_RECONNECT_SYNC__?: {
        preflight: unknown;
        runOnce: unknown;
        reconcileCalendarProviders: unknown;
      };
      __XAI_DESKTOP_BACKUP__?: {
        create: unknown;
        verify: unknown;
        importBundle: unknown;
        getLastReport: unknown;
      };
    };
    expect(runtime.__XAI_DESKTOP_WEB_IMPORT__).toBeTruthy();
    expect(runtime.__XAI_DESKTOP_WEB_IMPORT__?.run).toBe(storageMock.runImport);
    expect(runtime.__XAI_DESKTOP_WEB_IMPORT__?.getLastReport).toBe(storageMock.getLastReport);
    expect(runtime.__XAI_DESKTOP_RECONNECT_SYNC__).toBeTruthy();
    expect(runtime.__XAI_DESKTOP_RECONNECT_SYNC__?.preflight).toBe(storageMock.reconnectPreflight);
    expect(runtime.__XAI_DESKTOP_RECONNECT_SYNC__?.runOnce).toBe(storageMock.runReconnect);
    expect(runtime.__XAI_DESKTOP_RECONNECT_SYNC__?.reconcileCalendarProviders).toBe(
      storageMock.runCalendarReconnect,
    );
    expect(runtime.__XAI_DESKTOP_BACKUP__).toBeTruthy();
    expect(runtime.__XAI_DESKTOP_BACKUP__?.create).toBe(storageMock.createBackup);
    expect(runtime.__XAI_DESKTOP_BACKUP__?.verify).toBe(storageMock.verifyBackup);
    expect(runtime.__XAI_DESKTOP_BACKUP__?.importBundle).toBe(storageMock.importBackup);
    expect(runtime.__XAI_DESKTOP_BACKUP__?.getLastReport).toBe(storageMock.getBackupReport);
  });

  it("installs desktop host capability adapters before bridge effects run", async () => {
    setEnv("VITE_WEB_AUTH_MODE", "mock-authenticated");
    setEnv("VITE_XAI_DESKTOP_HOST", "tauri");
    const invoke = vi.fn(async (command: string) => {
      if (command === "plugin:notification|request_permission") {
        return "prompt-with-rationale";
      }
      return { command };
    });
    (globalThis as { __TAURI__?: { core: { invoke: typeof invoke } } }).__TAURI__ = {
      core: { invoke },
    };

    render(
      <AppProviders>
        <div>child</div>
      </AppProviders>
    );

    const runtime = globalThis as {
      __XAI_DESKTOP_NOTIFICATION__?: {
        requestPermission: () => Promise<unknown>;
        sendNotification: (input: Record<string, unknown>) => Promise<unknown>;
      };
      __XAI_DESKTOP_STATUSBAR__?: {
        publishSnapshot: (snapshot: Record<string, unknown>) => Promise<unknown>;
      };
      __XAI_DESKTOP_GLOBAL_HOTKEY__?: {
        getSnapshot: () => Promise<unknown>;
      };
      __XAI_DESKTOP_UPDATER__?: {
        getSnapshot: () => Promise<unknown>;
      };
    };

    expect(runtime.__XAI_DESKTOP_NOTIFICATION__).toBeTruthy();
    expect(runtime.__XAI_DESKTOP_STATUSBAR__).toBeTruthy();
    expect(runtime.__XAI_DESKTOP_GLOBAL_HOTKEY__).toBeTruthy();
    expect(runtime.__XAI_DESKTOP_UPDATER__).toBeTruthy();

    await expect(runtime.__XAI_DESKTOP_NOTIFICATION__?.requestPermission()).resolves.toBe("prompt");
    await runtime.__XAI_DESKTOP_NOTIFICATION__?.sendNotification({ title: "Hello" });
    await runtime.__XAI_DESKTOP_STATUSBAR__?.publishSnapshot({ appStatus: "ready" });
    await runtime.__XAI_DESKTOP_GLOBAL_HOTKEY__?.getSnapshot();
    await runtime.__XAI_DESKTOP_UPDATER__?.getSnapshot();

    expect(invoke).toHaveBeenCalledWith("plugin:notification|request_permission");
    expect(invoke).toHaveBeenCalledWith("plugin:notification|notify", {
      options: { title: "Hello" },
    });
    expect(invoke).toHaveBeenCalledWith("statusbar_set_snapshot", {
      payload: { appStatus: "ready" },
    });
    expect(invoke).toHaveBeenCalledWith("desktop_global_hotkey_get_snapshot");
    expect(invoke).toHaveBeenCalledWith("desktop_updater_get_snapshot");
  });
});

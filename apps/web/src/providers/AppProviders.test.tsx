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
    delete (globalThis as { __XAI_DESKTOP_WEB_IMPORT__?: unknown }).__XAI_DESKTOP_WEB_IMPORT__;
    setEnv("VITE_WEB_AUTH_MODE", undefined);
    setEnv("VITE_WEB_RUNTIME_PROFILE", undefined);
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
    expect(authMock.providerProps).toHaveLength(1);
    expect(authMock.providerProps[0]?.config).toBeNull();
    expect(authMock.providerProps[0]?.client).toBeTruthy();

    const client = authMock.providerProps[0]?.client as {
      auth: { getSession: () => Promise<{ data: { session: { user: { role: string } } | null } }> };
    };
    const { data } = await client.auth.getSession();
    expect(data.session?.user.role).toBe("authenticated");
  });

  it("keeps transport inactive when desktop offline runtime profile is set even in live auth mode", () => {
    setEnv("VITE_WEB_AUTH_MODE", "live");
    setEnv("VITE_WEB_RUNTIME_PROFILE", "desktop-phase1-offline");
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
    };
    expect(runtime.__XAI_DESKTOP_WEB_IMPORT__).toBeTruthy();
    expect(runtime.__XAI_DESKTOP_WEB_IMPORT__?.run).toBe(storageMock.runImport);
    expect(runtime.__XAI_DESKTOP_WEB_IMPORT__?.getLastReport).toBe(storageMock.getLastReport);
  });
});

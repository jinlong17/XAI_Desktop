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
    setEnv("VITE_WEB_AUTH_MODE", undefined);
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
    expect(authMock.providerProps).toHaveLength(1);
    expect(authMock.providerProps[0]?.config).toBeNull();
    expect(authMock.providerProps[0]?.client).toBeTruthy();

    const client = authMock.providerProps[0]?.client as {
      auth: { getSession: () => Promise<{ data: { session: { user: { role: string } } | null } }> };
    };
    const { data } = await client.auth.getSession();
    expect(data.session?.user.role).toBe("authenticated");
  });
});

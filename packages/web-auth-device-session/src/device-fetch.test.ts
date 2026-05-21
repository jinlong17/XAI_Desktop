import { describe, expect, it, vi } from "vitest";
import { DeviceAuthError, createDeviceBoundFetch } from "./device-fetch";

describe("createDeviceBoundFetch", () => {
  it("injects auth/device headers", async () => {
    const fetchImpl = vi.fn(async () => new Response("ok", { status: 200 }));
    const deviceFetch = createDeviceBoundFetch({
      fetchImpl,
      getContext: async () => ({
        accessToken: "token",
        deviceId: "device-1",
        syncVersion: "2026-05"
      })
    });

    await deviceFetch("https://api.test/items", { method: "GET" });

    const requestInit = fetchImpl.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(requestInit.headers);
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("X-Device-Id")).toBe("device-1");
    expect(headers.get("X-Sync-Version")).toBe("2026-05");
  });

  it("maps 401 to unknown_device and invokes cleanup", async () => {
    const onDeviceAuthFailure = vi.fn(async () => {});
    const deviceFetch = createDeviceBoundFetch({
      fetchImpl: async () => new Response("unauthorized", { status: 401 }),
      getContext: async () => ({ accessToken: "token", deviceId: "device-1", syncVersion: "2026-05" }),
      onDeviceAuthFailure
    });

    await expect(deviceFetch("https://api.test/items")).rejects.toMatchObject({
      reason: "unknown_device"
    } satisfies Pick<DeviceAuthError, "reason">);
    expect(onDeviceAuthFailure).toHaveBeenCalledWith("unknown_device");
  });

  it("maps 403 device_revoked payload", async () => {
    const deviceFetch = createDeviceBoundFetch({
      fetchImpl: async () =>
        new Response(JSON.stringify({ code: "device_revoked" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        }),
      getContext: async () => ({ accessToken: "token", deviceId: "device-1", syncVersion: "2026-05" })
    });

    await expect(deviceFetch("https://api.test/items")).rejects.toMatchObject({ reason: "device_revoked" });
  });
});

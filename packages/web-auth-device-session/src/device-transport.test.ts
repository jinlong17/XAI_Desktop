import { describe, expect, it, vi } from "vitest";
import { DeviceTransportError, createRestRpcDeviceTransport } from "./device-transport";

describe("createRestRpcDeviceTransport", () => {
  it("posts register with required headers", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    const transport = createRestRpcDeviceTransport({
      baseUrl: "https://xai.local",
      fetchImpl
    });

    await transport.register({
      accessToken: "token",
      deviceId: "device-1",
      syncVersion: "2026-05"
    });

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://xai.local/rest/v1/rpc/device_register");
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("X-Device-Id")).toBe("device-1");
  });

  it("maps unknown_device failure", async () => {
    const transport = createRestRpcDeviceTransport({
      baseUrl: "https://xai.local",
      fetchImpl: async () => new Response("{}", { status: 401 })
    });

    await expect(
      transport.heartbeat({ accessToken: "token", deviceId: "device-1", syncVersion: "2026-05" })
    ).rejects.toMatchObject({ reason: "unknown_device" } satisfies Pick<DeviceTransportError, "reason">);
  });

  it("maps device_revoked failure", async () => {
    const transport = createRestRpcDeviceTransport({
      baseUrl: "https://xai.local",
      fetchImpl: async () =>
        new Response(JSON.stringify({ code: "device_revoked" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        })
    });

    await expect(
      transport.heartbeat({ accessToken: "token", deviceId: "device-1", syncVersion: "2026-05" })
    ).rejects.toMatchObject({ reason: "device_revoked" } satisfies Pick<DeviceTransportError, "reason">);
  });
});

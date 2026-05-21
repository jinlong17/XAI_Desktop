import { describe, expect, it, vi } from "vitest";
import { createDeviceSessionController } from "./device-session";
import { createDeviceIdentityStore } from "./device-store";
import { createMemoryKeyValueStore } from "./storage";
import type { DeviceTransport } from "./device-transport";

function createTransport(): DeviceTransport {
  return {
    register: vi.fn(async () => {}),
    heartbeat: vi.fn(async () => {})
  };
}

describe("createDeviceSessionController", () => {
  it("registers and heartbeats with persisted device id", async () => {
    const transport = createTransport();
    const store = createDeviceIdentityStore({
      store: createMemoryKeyValueStore()
    });
    await store.set("device-fixed");

    const controller = createDeviceSessionController({ transport, deviceStore: store });

    const registered = await controller.ensureRegistered({ accessToken: "token", syncVersion: "2026-05" });
    const heartbeated = await controller.heartbeat({ accessToken: "token", syncVersion: "2026-05" });

    expect(registered).toBe("device-fixed");
    expect(heartbeated).toBe("device-fixed");
    expect(transport.register).toHaveBeenCalledWith({
      accessToken: "token",
      deviceId: "device-fixed",
      syncVersion: "2026-05"
    });
    expect(transport.heartbeat).toHaveBeenCalledWith({
      accessToken: "token",
      deviceId: "device-fixed",
      syncVersion: "2026-05"
    });
  });

  it("clears device id on failure cleanup", async () => {
    const onFailureCleanup = vi.fn(async () => {});
    const store = createDeviceIdentityStore({
      store: createMemoryKeyValueStore()
    });
    await store.set("device-fixed");

    const controller = createDeviceSessionController({
      transport: createTransport(),
      deviceStore: store,
      onFailureCleanup
    });

    await controller.handleDeviceFailure("device_revoked");
    expect(await store.get()).toBeNull();
    expect(onFailureCleanup).toHaveBeenCalledWith("device_revoked");
  });
});

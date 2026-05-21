import { describe, expect, it } from "vitest";
import { createDeviceIdentityStore } from "./device-store";
import { createMemoryKeyValueStore } from "./storage";

describe("createDeviceIdentityStore", () => {
  it("persists and reuses generated device id", async () => {
    const store = createMemoryKeyValueStore();
    const deviceStore = createDeviceIdentityStore({ store });

    const first = await deviceStore.ensure(() => "device-fixed");
    const second = await deviceStore.ensure(() => "device-new");

    expect(first).toBe("device-fixed");
    expect(second).toBe("device-fixed");
    expect(await deviceStore.get()).toBe("device-fixed");
  });

  it("can clear and regenerate id", async () => {
    const store = createMemoryKeyValueStore();
    const deviceStore = createDeviceIdentityStore({ store });

    await deviceStore.set("device-original");
    await deviceStore.clear();

    const next = await deviceStore.ensure(() => "device-regenerated");
    expect(next).toBe("device-regenerated");
  });
});

import { describe, expect, it, vi } from "vitest";
import { createObservabilityController } from "./controller";

describe("createObservabilityController", () => {
  it("does not initialize or send events when consent is unknown", () => {
    const initialize = vi.fn();
    const send = vi.fn();
    const controller = createObservabilityController("unknown", { initialize, send });

    expect(controller.initialize()).toBe(false);
    expect(controller.capture({ channel: "error", routeGroup: "landing", message: "test" })).toBe(false);

    expect(initialize).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("does not initialize or send events when consent is denied", () => {
    const initialize = vi.fn();
    const send = vi.fn();
    const controller = createObservabilityController("denied", { initialize, send });

    expect(controller.initialize()).toBe(false);
    expect(controller.capture({ channel: "error", routeGroup: "landing", message: "test" })).toBe(false);

    expect(initialize).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it("initializes and sends only when consent is granted", () => {
    const initialize = vi.fn();
    const send = vi.fn();
    const controller = createObservabilityController("granted", { initialize, send });

    expect(controller.initialize()).toBe(true);
    expect(controller.capture({ channel: "error", routeGroup: "module", message: "route failed" })).toBe(true);

    expect(initialize).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledTimes(1);
  });
});

import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@repo/core/registry";
import { registerAiCubePlugin } from "./register-plugin";

describe("registerAiCubePlugin", () => {
  it("registers an enabled control widget", () => {
    registerAiCubePlugin();

    const registration = PluginRegistry.getPlugin("ai-cube");
    expect(registration).toBeDefined();
    expect(registration?.manifest.enabled).toBe(true);
    expect(registration?.manifest.windows.control).toBe(true);
    expect(registration?.components.ControlWidget).toBeTypeOf("function");
  });

  it("remains idempotent across repeated calls", () => {
    registerAiCubePlugin();
    registerAiCubePlugin();

    const aiCubeEntries = PluginRegistry
      .getAllEnabled()
      .filter((registration) => registration.manifest.name === "ai-cube");

    expect(aiCubeEntries).toHaveLength(1);
  });
});

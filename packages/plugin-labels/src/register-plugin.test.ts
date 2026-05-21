import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@repo/core/registry";
import { registerLabelsPlugin } from "./register-plugin";

describe("registerLabelsPlugin", () => {
  it("registers labels as an enabled console view", () => {
    registerLabelsPlugin();

    const registration = PluginRegistry.getPlugin("labels");
    expect(registration).toBeDefined();
    expect(registration?.manifest.windows.console).toBe(true);

    const labelsSlot = PluginRegistry
      .getConsoleViewRegistrations()
      .find((entry) => entry.moduleId === "labels");

    expect(labelsSlot).toBeDefined();
    expect(labelsSlot?.sidebar.placeholder).toBe(false);
  });

  it("is idempotent across repeated registration calls", () => {
    registerLabelsPlugin();
    registerLabelsPlugin();

    const rows = PluginRegistry
      .getAllEnabled()
      .filter((entry) => entry.manifest.name === "labels");

    expect(rows).toHaveLength(1);
  });
});

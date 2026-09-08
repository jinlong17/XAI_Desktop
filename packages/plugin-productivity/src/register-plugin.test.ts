import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@repo/core/registry";
import { registerProductivityPlugin } from "./register-plugin";

describe("registerProductivityPlugin", () => {
  it("registers console views for tasks, pomodoro, habits, and matrix", () => {
    registerProductivityPlugin();

    const registration = PluginRegistry.getPlugin("productivity");
    expect(registration).toBeDefined();
    expect(registration?.manifest.windows.console).toBe(true);

    const moduleIds = PluginRegistry
      .getConsoleViewRegistrations()
      .filter((item) => item.sidebar.group === "productivity")
      .map((item) => item.moduleId);

    expect(moduleIds).toEqual(["tasks", "pomodoro", "habits", "matrix"]);
  });

  it("is idempotent across repeated registration calls", () => {
    registerProductivityPlugin();
    registerProductivityPlugin();

    const rows = PluginRegistry
      .getAllEnabled()
      .filter((entry) => entry.manifest.name === "productivity");

    expect(rows).toHaveLength(1);
  });
});

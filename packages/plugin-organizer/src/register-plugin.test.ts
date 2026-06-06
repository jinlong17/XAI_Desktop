import { describe, expect, it } from "vitest";
import { PluginRegistry } from "@repo/core/registry";
import { registerOrganizerPlugin } from "./register-plugin";

describe("registerOrganizerPlugin", () => {
  it("registers organizer as an enabled Plugin Center entry", () => {
    registerOrganizerPlugin();

    const registration = PluginRegistry.getPlugin("organizer");
    expect(registration?.manifest.enabled).toBe(true);
    expect(registration?.manifest.contentTypes).toContain(
      "normal-window-organizer",
    );
  });

  it("is idempotent", () => {
    registerOrganizerPlugin();
    registerOrganizerPlugin();

    expect(PluginRegistry.getPlugin("organizer")?.manifest.name).toBe(
      "organizer",
    );
  });
});

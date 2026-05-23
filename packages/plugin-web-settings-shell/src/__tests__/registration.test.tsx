import { describe, it, expect } from "vitest";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { settingsShellWebModuleRegistration } from "../registration.js";

describe("settingsShellWebModuleRegistration (RG)", () => {
  it("RG1: satisfies WebModuleSlotRegistration + moduleId='settings', icon='sliders', railOrder=99, showInRail=false", () => {
    const reg: WebModuleSlotRegistration = settingsShellWebModuleRegistration;
    expect(reg).toBeDefined();
    expect(settingsShellWebModuleRegistration.moduleId).toBe("settings");
    expect(settingsShellWebModuleRegistration.icon).toBe("sliders");
    expect(settingsShellWebModuleRegistration.railOrder).toBe(99);
    expect(settingsShellWebModuleRegistration.showInRail).toBe(false);
  });

  it("RG2: defaultChildPath='' + 2 children both with render functions", () => {
    expect(settingsShellWebModuleRegistration.defaultChildPath).toBe("");
    expect(settingsShellWebModuleRegistration.children).toHaveLength(2);
    const paths = settingsShellWebModuleRegistration.children.map((c) => c.path);
    expect(paths).toContain("");
    expect(paths).toContain("*");
    for (const child of settingsShellWebModuleRegistration.children) {
      expect(typeof child.render).toBe("function");
    }
  });

  it("RG3: label='Settings' + i18nKey='nav.settings'", () => {
    expect(settingsShellWebModuleRegistration.label).toBe("Settings");
    expect(settingsShellWebModuleRegistration.i18nKey).toBe("nav.settings");
  });
});

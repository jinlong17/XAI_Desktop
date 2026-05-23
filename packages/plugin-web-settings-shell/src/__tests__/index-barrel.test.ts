import { describe, it, expect } from "vitest";
import * as Barrel from "../index.js";

/**
 * B1..B3 — public surface enumeration (P2 surface).
 *
 * The P2 surface adds SettingsModule + atomic components.
 * settingsShellWebModuleRegistration lands in P3.
 */
describe("index barrel — P2 surface", () => {
  it("B1: P2 named exports present", () => {
    expect(typeof Barrel.SettingsModule).toBe("function");
    expect(typeof Barrel.Toggle).toBe("function");
    expect(typeof Barrel.SettingRow).toBe("function");
    expect(typeof Barrel.SectionBlock).toBe("function");
    expect(typeof Barrel.SettingsFooter).toBe("function");
    expect(typeof Barrel.resetAllPrefs).toBe("function");
    expect(Array.isArray(Barrel.paneRegistry)).toBe(true);
  });

  it("B2: paneRegistry length is 13", () => {
    expect(Barrel.paneRegistry).toHaveLength(13);
  });

  it("B3: internal helpers not exposed", () => {
    const exposed = Object.keys(Barrel as Record<string, unknown>);
    expect(exposed).not.toContain("confirmAction");
    expect(exposed).not.toContain("RESET_DEFAULTS");
    expect(exposed).not.toContain("SettingsSidebar");
    expect(exposed).not.toContain("SettingsDetail");
  });
});

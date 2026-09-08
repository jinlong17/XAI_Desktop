import { describe, it, expect } from "vitest";
import * as Barrel from "../index.js";

/**
 * B1..B3 — public surface enumeration (P3 final surface).
 */
describe("index barrel — P3 final surface", () => {
  it("B1: full surface present (components + atoms + registration + utilities)", () => {
    expect(typeof Barrel.SettingsModule).toBe("function");
    expect(typeof Barrel.Toggle).toBe("function");
    expect(typeof Barrel.SettingRow).toBe("function");
    expect(typeof Barrel.SectionBlock).toBe("function");
    expect(typeof Barrel.SettingsFooter).toBe("function");
    expect(typeof Barrel.resetAllPrefs).toBe("function");
    expect(Array.isArray(Barrel.paneRegistry)).toBe(true);
    expect(Barrel.settingsShellWebModuleRegistration).toBeDefined();
    expect(Barrel.settingsShellWebModuleRegistration.moduleId).toBe("settings");
  });

  it("B2: paneRegistry length is 14 (13 baseline + 'ai' from row #2 ai-chat-real-llm-adapter)", () => {
    // Pre-existing drift fixed 2026-05-26 alongside codex C3-CHROME-1
    // deep-link fix. Row #2 added the "ai" pane but did not update tests.
    expect(Barrel.paneRegistry).toHaveLength(14);
  });

  it("B3: internal helpers + sub-components not exposed", () => {
    const exposed = Object.keys(Barrel as Record<string, unknown>);
    expect(exposed).not.toContain("confirmAction");
    expect(exposed).not.toContain("RESET_DEFAULTS");
    expect(exposed).not.toContain("SettingsSidebar");
    expect(exposed).not.toContain("SettingsDetail");
    expect(exposed).not.toContain("SettingsModuleRoute");
  });
});

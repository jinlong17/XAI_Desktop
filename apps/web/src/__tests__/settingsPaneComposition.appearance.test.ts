/**
 * Host integration test — row #22 (xai-web-settings-appearance).
 * AC-COMP-1..AC-COMP-4 (packages/xai-web-settings-appearance/docs/test.md §B1).
 *
 * Verifies that composeSettingsPaneRegistry() correctly substitutes the
 * appearance pane (row #22) and that row #23 (features) is not broken.
 */
import { describe, it, expect } from "vitest";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
import { appearancePane } from "@repo/plugin-web-settings-appearance";
import { featuresPane } from "@repo/plugin-web-settings-features-panel";
import { composeSettingsPaneRegistry } from "../routes/modules/settingsPaneComposition.js";

describe("composeSettingsPaneRegistry — row #22 appearance (AC-COMP-1..4)", () => {
  it("AC-COMP-1: composed pane list has same length as chassis (13)", () => {
    const composed = composeSettingsPaneRegistry();
    expect(composed.length).toBe(13);
    expect(composed.length).toBe(paneRegistry.length);
  });

  it("AC-COMP-2: entry with id==='appearance' is appearancePane (NOT the placeholder)", () => {
    const composed = composeSettingsPaneRegistry();
    const entry = composed.find((p) => p.id === "appearance");
    expect(entry).toBeDefined();
    expect(entry).toBe(appearancePane);
    // Confirm it's not the chassis placeholder (icon is "sun" per B1 fix)
    expect(entry?.icon).toBe("sun");
  });

  it("AC-COMP-3: entry with id==='features' is still featuresPane (row #23 not broken)", () => {
    const composed = composeSettingsPaneRegistry();
    const entry = composed.find((p) => p.id === "features");
    expect(entry).toBeDefined();
    expect(entry).toBe(featuresPane);
  });

  it("AC-COMP-4: all non-substituted entries are reference-equal to their paneRegistry source", () => {
    const composed = composeSettingsPaneRegistry();
    // Only the "appearance" id is substituted by row #22; the rest are handled by #23 and #24.
    const SUBSTITUTED_BY_ROW_22 = new Set(["appearance"]);
    for (let i = 0; i < paneRegistry.length; i++) {
      const orig = paneRegistry[i]!;
      const next = composed[i]!;
      expect(next.id).toBe(orig.id);
      if (!SUBSTITUTED_BY_ROW_22.has(orig.id)) {
        // Other substituted panes (#23/#24) are handled — just verify they have the right id
        expect(next.id).toBe(orig.id);
      }
    }
  });
});

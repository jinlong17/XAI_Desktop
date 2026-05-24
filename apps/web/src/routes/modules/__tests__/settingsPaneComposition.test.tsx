/**
 * Settings pane composition integration test — row #23 (xai-web-settings-features-panel).
 * AC-COMP-1..AC-COMP-3 (packages/xai-web-settings-features-panel/docs/test.md §B1).
 */
import { describe, it, expect } from "vitest";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
import { featuresPane } from "@repo/plugin-web-settings-features-panel";
import { composeSettingsPaneRegistry } from "../settingsPaneComposition.js";

describe("composeSettingsPaneRegistry", () => {
  it("AC-COMP-1: returns the same length as upstream paneRegistry (13)", () => {
    const composed = composeSettingsPaneRegistry();
    expect(composed.length).toBe(paneRegistry.length);
    expect(composed.length).toBe(13);
  });

  it("AC-COMP-2: the 'features' entry is featuresPane (row #23 substitution)", () => {
    const composed = composeSettingsPaneRegistry();
    const composedFeatures = composed.find((p) => p.id === "features");
    expect(composedFeatures).toBe(featuresPane);
  });

  it("AC-COMP-3: all other entries pass through unchanged (id parity)", () => {
    const composed = composeSettingsPaneRegistry();
    // Panes substituted by row #22 (appearance), row #23 (features-panel), and row #24 (rest — 11 panes).
    const SUBSTITUTED_IDS = new Set([
      "features",      // row #23
      "appearance",    // row #22
      "account",
      "premium",
      "smart_lists",
      "notifications",
      "date_time",
      "more",
      "integrations",
      "collaborate",
      "sticky",
      "hotkeys",
      "about",         // row #24
    ]);
    for (let i = 0; i < paneRegistry.length; i++) {
      const orig = paneRegistry[i]!;
      const next = composed[i]!;
      expect(next.id).toBe(orig.id);
      if (!SUBSTITUTED_IDS.has(orig.id)) {
        // Identity-preserved: this slot has not been substituted by any row yet.
        expect(next).toBe(orig);
      }
    }
  });
});

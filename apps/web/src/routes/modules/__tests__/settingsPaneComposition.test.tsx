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
    for (let i = 0; i < paneRegistry.length; i++) {
      const orig = paneRegistry[i]!;
      const next = composed[i]!;
      expect(next.id).toBe(orig.id);
      if (orig.id !== "features") {
        // Identity-preserved: sibling rows have not yet substituted.
        expect(next).toBe(orig);
      }
    }
  });
});

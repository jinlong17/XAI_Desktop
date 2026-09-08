/**
 * AP1..AP5 — applyRestPanesToRegistry tests (test.md §3 P3)
 */
import { describe, it, expect } from "vitest";
import { applyRestPanesToRegistry } from "../internal/applyRestPanesToRegistry.js";
import { paneRegistry } from "@repo/plugin-web-settings-shell";
import { restPanesById } from "../internal/restPanesById.js";

describe("applyRestPanesToRegistry", () => {
  it("AP1: returns same length as input registry", () => {
    const result = applyRestPanesToRegistry(paneRegistry);
    expect(result.length).toBe(paneRegistry.length);
  });

  it("AP2: substitutes all 11 owned pane ids", () => {
    const result = applyRestPanesToRegistry(paneRegistry);
    for (const id of Object.keys(restPanesById) as (keyof typeof restPanesById)[]) {
      const substituted = result.find((p) => p.id === id);
      expect(substituted).toBeDefined();
      // The render function should be the owned pane's render, not the placeholder.
      expect(substituted?.render).toBe(restPanesById[id].render);
    }
  });

  it("AP3: does NOT substitute panes not owned by this row (e.g. appearance, features)", () => {
    const result = applyRestPanesToRegistry(paneRegistry);
    const appearanceEntry = result.find((p) => p.id === "appearance");
    const featuresEntry = result.find((p) => p.id === "features");
    // These should still be placeholders from the chassis registry.
    const origAppearance = paneRegistry.find((p) => p.id === "appearance");
    const origFeatures = paneRegistry.find((p) => p.id === "features");
    expect(appearanceEntry?.render).toBe(origAppearance?.render);
    expect(featuresEntry?.render).toBe(origFeatures?.render);
  });

  it("AP4: idempotent — calling twice produces equivalent output", () => {
    const once = applyRestPanesToRegistry(paneRegistry);
    const twice = applyRestPanesToRegistry(once);
    expect(twice.length).toBe(once.length);
    for (let i = 0; i < once.length; i++) {
      expect(twice[i]?.id).toBe(once[i]?.id);
      expect(twice[i]?.render).toBe(once[i]?.render);
    }
  });

  it("AP5: preserves original order of pane ids", () => {
    const result = applyRestPanesToRegistry(paneRegistry);
    const resultIds = result.map((p) => p.id);
    const origIds = paneRegistry.map((p) => p.id);
    expect(resultIds).toEqual(origIds);
  });
});

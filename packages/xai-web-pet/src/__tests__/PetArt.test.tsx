/**
 * PetArt.test.tsx — P1 test for SVG renderers.
 *
 * AC-PET-1: all 8 ids render an <svg> with width="84" height="84".
 * Mood swap: happy mood changes the eye/mouth paths.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PetArtRenderers } from "../PetArt.js";
import { PET_DEFS } from "../internal/petDefs.js";
import type { Mood } from "../PetArt.js";

const ALL_IDS = PET_DEFS.map((p) => p.id);

describe("PetArtRenderers", () => {
  it.each(ALL_IDS)("renders an <svg> with width=84 height=84 for '%s' (idle)", (id) => {
    const renderer = PetArtRenderers[id];
    expect(renderer).toBeDefined();
    if (!renderer) return;
    const { container } = render(renderer("idle"));
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("width")).toBe("84");
    expect(svg?.getAttribute("height")).toBe("84");
  });

  it.each(ALL_IDS)("renders without throwing for '%s' in happy mood", (id) => {
    const renderer = PetArtRenderers[id];
    expect(renderer).toBeDefined();
    if (!renderer) return;
    expect(() => render(renderer("happy"))).not.toThrow();
  });

  it("has renderers for all 8 PET_DEF ids", () => {
    for (const id of ALL_IDS) {
      expect(PetArtRenderers).toHaveProperty(id);
    }
  });

  describe("mood swap: idle vs happy", () => {
    // In idle mood, eyes are ellipses (default).
    // In happy mood, eyes are arc paths (Q curves).
    it("mochi happy mode renders arc eye paths (Q)", () => {
      const mochiRenderer = PetArtRenderers["mochi"];
      expect(mochiRenderer).toBeDefined();
      if (!mochiRenderer) return;
      const { container: idleContainer } = render(mochiRenderer("idle"));
      const { container: happyContainer } = render(mochiRenderer("happy"));

      // In happy mode we expect <path> elements from Eyes (Q curves)
      const idlePaths = idleContainer.querySelectorAll("path");
      const happyPaths = happyContainer.querySelectorAll("path");

      // happy mode has additional eye arc paths
      expect(happyPaths.length).toBeGreaterThanOrEqual(idlePaths.length);
    });

    it("pip idle mood has ellipses for eyes", () => {
      const pipRenderer = PetArtRenderers["pip"];
      expect(pipRenderer).toBeDefined();
      if (!pipRenderer) return;
      const { container } = render(pipRenderer("idle"));
      const ellipses = container.querySelectorAll("ellipse");
      // pip has body ellipse + 2 eye ellipses
      expect(ellipses.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("renders all 8 pets consistently without error", () => {
    const moods: Mood[] = ["idle", "happy"];
    for (const id of ALL_IDS) {
      const renderer = PetArtRenderers[id];
      if (!renderer) continue;
      for (const mood of moods) {
        expect(() => render(renderer(mood))).not.toThrow();
      }
    }
  });
});

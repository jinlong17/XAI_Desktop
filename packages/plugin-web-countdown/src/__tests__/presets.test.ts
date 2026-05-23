/**
 * presets.test.ts — Tests P1..P3
 *
 * P1: IMAGE_PRESETS is frozen (Object.isFrozen)
 * P2: all ids are unique
 * P3: gradient strings look like CSS gradients (smoke regex)
 */

import { describe, it, expect } from "vitest";
import { IMAGE_PRESETS } from "../internal/presets.js";

describe("IMAGE_PRESETS", () => {
  it("P1: is frozen", () => {
    expect(Object.isFrozen(IMAGE_PRESETS)).toBe(true);
  });

  it("P2: all ids are unique", () => {
    const ids = IMAGE_PRESETS.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("P3: gradient strings look like CSS gradients", () => {
    const cssGradientRe = /^(linear|radial|conic)-gradient\(/;
    for (const preset of IMAGE_PRESETS) {
      expect(preset.gradient).toMatch(cssGradientRe);
    }
  });

  it("has 6 presets matching design.md §9", () => {
    const expectedIds = ["dusk", "midnight", "sand", "forest", "peach", "lavender"];
    const actualIds = IMAGE_PRESETS.map((p) => p.id);
    expect(actualIds).toEqual(expectedIds);
  });

  it("each preset has label_en and label_zh", () => {
    for (const preset of IMAGE_PRESETS) {
      expect(typeof preset.label_en).toBe("string");
      expect(preset.label_en.length).toBeGreaterThan(0);
      expect(typeof preset.label_zh).toBe("string");
      expect(preset.label_zh.length).toBeGreaterThan(0);
    }
  });
});

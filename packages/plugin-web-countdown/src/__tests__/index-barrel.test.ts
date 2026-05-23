/**
 * index-barrel.test.ts — Tests B1..B5
 *
 * B1: CountdownModule, countdownWebModuleRegistration, IMAGE_PRESETS exported
 * B2: Types CountdownCard, CountdownVariant, ImagePresetId, ImagePreset exported (type check)
 * B3: No unexpected runtime exports (check known keys)
 * B4: Structural type check via expectTypeOf
 * B5: Type shape of CountdownCard matches api.md §1.2
 */

import { describe, it, expect, expectTypeOf } from "vitest";
import * as barrel from "../index.js";
import type { CountdownCard, CountdownVariant, ImagePreset, ImagePresetId } from "../index.js";

describe("index-barrel", () => {
  it("B1a: exports CountdownModule function", () => {
    expect(typeof barrel.CountdownModule).toBe("function");
  });

  it("B1b: exports countdownWebModuleRegistration object", () => {
    expect(typeof barrel.countdownWebModuleRegistration).toBe("object");
    expect(barrel.countdownWebModuleRegistration).not.toBeNull();
  });

  it("B1c: exports IMAGE_PRESETS array", () => {
    expect(Array.isArray(barrel.IMAGE_PRESETS)).toBe(true);
    expect(barrel.IMAGE_PRESETS.length).toBeGreaterThan(0);
  });

  it("B3: known runtime exports are CountdownModule, countdownWebModuleRegistration, IMAGE_PRESETS", () => {
    // Types don't appear at runtime — only runtime values
    const runtimeKeys = Object.keys(barrel).filter((k) => k !== "default");
    const expected = new Set(["CountdownModule", "countdownWebModuleRegistration", "IMAGE_PRESETS"]);
    for (const key of runtimeKeys) {
      expect(expected.has(key)).toBe(true);
    }
  });

  // B4 + B5: TypeScript structural checks (compile-time; vitest runs tsc first)
  it("B4: CountdownCard type has required fields", () => {
    const card: CountdownCard = {
      id: "cd_test",
      title: { en: "Test", zh: "测试" },
      target_date: "2026-12-25",
      variant: "light",
      cover_url: null,
    };
    expect(card.id).toBe("cd_test");
    expect(card.title.en).toBe("Test");
    expect(card.title.zh).toBe("测试");
    expect(card.target_date).toBe("2026-12-25");
    expect(card.variant).toBe("light");
    expect(card.cover_url).toBeNull();
  });

  it("B5: ImagePreset type has expected fields", () => {
    const preset = barrel.IMAGE_PRESETS[0];
    if (!preset) throw new Error("IMAGE_PRESETS is empty");
    expectTypeOf<typeof preset>().toMatchTypeOf<ImagePreset>();
    expect(typeof preset.id).toBe("string");
    expect(typeof preset.gradient).toBe("string");
    expect(typeof preset.label_en).toBe("string");
    expect(typeof preset.label_zh).toBe("string");
  });

  it("B5b: CountdownVariant is a string union", () => {
    const variants: CountdownVariant[] = ["image", "light"];
    expect(variants).toHaveLength(2);
  });

  it("B5c: ImagePresetId includes all 6 ids", () => {
    const expectedIds: ImagePresetId[] = ["dusk", "midnight", "sand", "forest", "peach", "lavender"];
    const actualIds = barrel.IMAGE_PRESETS.map((p) => p.id);
    expect(actualIds).toEqual(expectedIds);
  });
});

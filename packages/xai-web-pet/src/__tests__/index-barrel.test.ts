/**
 * index-barrel.test.ts — P1 test for public surface.
 *
 * AC-PET-16: verifies that only the documented exports are present on the
 * public barrel and that they are the correct types.
 *
 * Note: CSS side-effects are not testable in Vitest (jsdom ignores @keyframes),
 * so we only verify the JS/TS surface here.
 */

import { describe, it, expect } from "vitest";
import * as petBarrel from "../index.js";

describe("@repo/plugin-web-pet barrel exports", () => {
  it("exports DesktopPet as a function", () => {
    expect(typeof petBarrel.DesktopPet).toBe("function");
  });

  it("exports PetPicker as a function", () => {
    expect(typeof petBarrel.PetPicker).toBe("function");
  });

  it("exports PET_DEFS as a non-empty array", () => {
    expect(Array.isArray(petBarrel.PET_DEFS)).toBe(true);
    expect(petBarrel.PET_DEFS.length).toBeGreaterThan(0);
  });

  it("PET_DEFS has 8 entries", () => {
    expect(petBarrel.PET_DEFS).toHaveLength(8);
  });

  it("each PET_DEF entry has id, anim, name, desc", () => {
    for (const def of petBarrel.PET_DEFS) {
      expect(def).toHaveProperty("id");
      expect(def).toHaveProperty("anim");
      expect(def).toHaveProperty("name");
      expect(def).toHaveProperty("desc");
      expect(typeof def.name.en).toBe("string");
      expect(typeof def.name.zh).toBe("string");
    }
  });
});

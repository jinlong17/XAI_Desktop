/**
 * petDefs.test.ts — P1 test for PET_DEFS catalog.
 *
 * AC-PET-1 coverage: all 8 ids present, each with anim, bilingual name+desc.
 */

import { describe, it, expect } from "vitest";
import { PET_DEFS } from "../internal/petDefs.js";

const EXPECTED_IDS = [
  "mochi",
  "pip",
  "sprout",
  "lumi",
  "drip",
  "pebble",
  "star",
  "ember",
] as const;

const VALID_ANIMS = [
  "bob",
  "hop",
  "sway",
  "glow",
  "still",
  "twinkle",
  "flicker",
] as const;

describe("PET_DEFS", () => {
  it("has exactly 8 entries", () => {
    expect(PET_DEFS).toHaveLength(8);
  });

  it("contains all 8 expected ids in order", () => {
    const ids = PET_DEFS.map((p) => p.id);
    expect(ids).toEqual(EXPECTED_IDS);
  });

  it("each entry has a valid anim from the 7-keyframe set", () => {
    for (const pet of PET_DEFS) {
      expect(VALID_ANIMS).toContain(pet.anim);
    }
  });

  it("mochi and drip both share the 'bob' animation", () => {
    const mochi = PET_DEFS.find((p) => p.id === "mochi");
    const drip = PET_DEFS.find((p) => p.id === "drip");
    expect(mochi?.anim).toBe("bob");
    expect(drip?.anim).toBe("bob");
  });

  it("pebble uses the 'still' animation", () => {
    const pebble = PET_DEFS.find((p) => p.id === "pebble");
    expect(pebble?.anim).toBe("still");
  });

  it.each(EXPECTED_IDS)(
    "entry for '%s' has non-empty bilingual name and desc",
    (id) => {
      const pet = PET_DEFS.find((p) => p.id === id);
      expect(pet).toBeDefined();
      expect(pet?.name.en).toBeTruthy();
      expect(pet?.name.zh).toBeTruthy();
      expect(pet?.desc.en).toBeTruthy();
      expect(pet?.desc.zh).toBeTruthy();
    },
  );

  it("uses exactly 7 distinct animation values across 8 pets", () => {
    const animSet = new Set(PET_DEFS.map((p) => p.anim));
    expect(animSet.size).toBe(7);
  });
});

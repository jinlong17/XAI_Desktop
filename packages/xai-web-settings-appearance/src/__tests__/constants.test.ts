/**
 * AC-CONST-1..AC-CONST-7 — constant tables shape + content.
 */
import { describe, it, expect } from "vitest";
import { BG_TONES, HUE_PRESETS, RAIL_POSITIONS } from "../constants.js";

describe("BG_TONES", () => {
  it("AC-CONST-1: length=6 and correct id order", () => {
    expect(BG_TONES.length).toBe(6);
    expect(BG_TONES.map((o) => o.id)).toEqual([
      "default", "cream", "mist", "lavender", "peach", "graphite",
    ]);
  });

  it("AC-CONST-4: hues match source lines 498-503", () => {
    expect(BG_TONES.map((o) => o.hue)).toEqual([165, 55, 230, 295, 35, 220]);
  });

  it("AC-CONST-6: every entry has non-empty en and zh name", () => {
    for (const t of BG_TONES) {
      expect(t.name.en.length).toBeGreaterThan(0);
      expect(t.name.zh.length).toBeGreaterThan(0);
    }
  });

  it("AC-CONST-7: array is frozen and first element is frozen", () => {
    expect(Object.isFrozen(BG_TONES)).toBe(true);
    expect(Object.isFrozen(BG_TONES[0])).toBe(true);
  });
});

describe("HUE_PRESETS", () => {
  it("AC-CONST-2: length=6 and correct id order", () => {
    expect(HUE_PRESETS.length).toBe(6);
    expect(HUE_PRESETS.map((o) => o.id)).toEqual([
      "sage", "ocean", "sunset", "rose", "violet", "amber",
    ]);
  });

  it("AC-CONST-3: hues match source (verbatim)", () => {
    expect(HUE_PRESETS.map((o) => o.hue)).toEqual([165, 230, 35, 355, 295, 75]);
  });

  it("AC-CONST-6: every entry has non-empty en and zh name", () => {
    for (const p of HUE_PRESETS) {
      expect(p.name.en.length).toBeGreaterThan(0);
      expect(p.name.zh.length).toBeGreaterThan(0);
    }
  });
});

describe("RAIL_POSITIONS", () => {
  it("AC-CONST-5: length=4 and correct id order", () => {
    expect(RAIL_POSITIONS.length).toBe(4);
    expect(RAIL_POSITIONS.map((o) => o.id)).toEqual([
      "left", "right", "top", "bottom",
    ]);
  });

  it("AC-CONST-6: every entry has non-empty en and zh label", () => {
    for (const r of RAIL_POSITIONS) {
      expect(r.label.en.length).toBeGreaterThan(0);
      expect(r.label.zh.length).toBeGreaterThan(0);
    }
  });
});

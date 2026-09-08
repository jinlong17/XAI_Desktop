/**
 * drag.test.ts — pure unit tests for clampPos helper.
 *
 * AC-PET-4: clamp keeps 8 ≤ pos ≤ viewport-92 (both axes).
 */

import { describe, it, expect } from "vitest";
import { clampPos } from "../internal/drag.js";

const VIEWPORT = { w: 1280, h: 800 };

// With EDGE_GUARD_PX=8 and PET_BODY_PX=84:
//   x: 8 ≤ x ≤ 1280-92 = 1188
//   y: 8 ≤ y ≤ 800-92  = 708
const MIN = 8;
const MAX_X = 1188;
const MAX_Y = 708;

describe("clampPos", () => {
  it("leaves coords in the safe zone unchanged", () => {
    const pos = { x: 100, y: 200 };
    expect(clampPos(pos, VIEWPORT)).toEqual(pos);
  });

  it("clamps x to minimum (EDGE_GUARD_PX) when x is negative", () => {
    expect(clampPos({ x: -100, y: 200 }, VIEWPORT).x).toBe(MIN);
  });

  it("clamps y to minimum (EDGE_GUARD_PX) when y is negative", () => {
    expect(clampPos({ x: 100, y: -50 }, VIEWPORT).y).toBe(MIN);
  });

  it("clamps x to maximum (w - PET_BODY_PX - EDGE_GUARD_PX)", () => {
    expect(clampPos({ x: 9999, y: 200 }, VIEWPORT).x).toBe(MAX_X);
  });

  it("clamps y to maximum (h - PET_BODY_PX - EDGE_GUARD_PX)", () => {
    expect(clampPos({ x: 100, y: 9999 }, VIEWPORT).y).toBe(MAX_Y);
  });

  it("clamps both axes simultaneously when both out of range", () => {
    const result = clampPos({ x: -999, y: 9999 }, VIEWPORT);
    expect(result.x).toBe(MIN);
    expect(result.y).toBe(MAX_Y);
  });

  it("returns exactly min when x === EDGE_GUARD_PX", () => {
    expect(clampPos({ x: MIN, y: 100 }, VIEWPORT).x).toBe(MIN);
  });

  it("returns exactly max when x === MAX_X", () => {
    expect(clampPos({ x: MAX_X, y: 100 }, VIEWPORT).x).toBe(MAX_X);
  });

  it("handles zero viewport dimensions without throwing", () => {
    expect(() => clampPos({ x: 0, y: 0 }, { w: 0, h: 0 })).not.toThrow();
  });

  it("returns correct values for a typical starting position", () => {
    const result = clampPos({ x: 24, y: 24 }, VIEWPORT);
    expect(result).toEqual({ x: 24, y: 24 });
  });
});

/**
 * Unit on computeAnalogAngles — angle math for the analog clock variant.
 */
import { describe, it, expect } from "vitest";
import { computeAnalogAngles } from "../internal/computeAnalogAngles.js";

describe("computeAnalogAngles", () => {
  it("midnight = 0/0/0", () => {
    expect(computeAnalogAngles(new Date(2024, 0, 1, 0, 0, 0))).toEqual({
      h: 0,
      m: 0,
      s: 0,
    });
  });

  it("3:00:00 = h 90 / m 0 / s 0", () => {
    const a = computeAnalogAngles(new Date(2024, 0, 1, 3, 0, 0));
    expect(a.h).toBeCloseTo(90, 5);
    expect(a.m).toBe(0);
    expect(a.s).toBe(0);
  });

  it("6:30:15 — hour 30° per hour + 0.5° per minute", () => {
    const a = computeAnalogAngles(new Date(2024, 0, 1, 6, 30, 15));
    // h = (6 + 30/60) * 30 = 195
    expect(a.h).toBeCloseTo(195, 5);
    // m = (30 + 15/60) * 6 = 181.5
    expect(a.m).toBeCloseTo(181.5, 5);
    // s = 15 * 6 = 90
    expect(a.s).toBe(90);
  });

  it("12-hour wrap: 15:00 (3pm) = 90°", () => {
    const a = computeAnalogAngles(new Date(2024, 0, 1, 15, 0, 0));
    expect(a.h).toBeCloseTo(90, 5);
  });

  it("11:59:59 — all hands near full revolution", () => {
    const a = computeAnalogAngles(new Date(2024, 0, 1, 11, 59, 59));
    expect(a.h).toBeGreaterThan(355);
    expect(a.m).toBeGreaterThan(355);
    expect(a.s).toBe(354);
  });
});

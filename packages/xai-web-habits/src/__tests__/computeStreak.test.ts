/**
 * AC-STREAK-1..7: computeStreak pure function tests.
 */
import { describe, it, expect } from "vitest";
import { computeStreak } from "../internal/computeStreak.js";
import type { DateKey } from "../types.js";

const ci = (keys: string[]): Record<DateKey, true> =>
  Object.fromEntries(keys.map((k) => [k, true])) as Record<DateKey, true>;

describe("computeStreak", () => {
  it("AC-STREAK-1: empty check-ins → 0", () => {
    expect(computeStreak({}, new Date("2026-05-23T12:00:00Z"))).toBe(0);
  });

  it("AC-STREAK-2: today not checked → 0 (even if prior days checked)", () => {
    const checkIns = ci(["2026-05-22", "2026-05-21"]);
    expect(computeStreak(checkIns, new Date("2026-05-23T12:00:00Z"))).toBe(0);
  });

  it("AC-STREAK-3: today checked, no prior → 1", () => {
    const checkIns = ci(["2026-05-23"]);
    expect(computeStreak(checkIns, new Date("2026-05-23T12:00:00Z"))).toBe(1);
  });

  it("AC-STREAK-4: today + 5 prior consecutive → 6", () => {
    const checkIns = ci([
      "2026-05-23", "2026-05-22", "2026-05-21",
      "2026-05-20", "2026-05-19", "2026-05-18",
    ]);
    expect(computeStreak(checkIns, new Date("2026-05-23T12:00:00Z"))).toBe(6);
  });

  it("AC-STREAK-5: skip breaks the run (C1 zero-out on skip)", () => {
    // today + 3 prior + skip + 4 prior → only 4 (today + 3 prior)
    const checkIns = ci([
      "2026-05-23", "2026-05-22", "2026-05-21", "2026-05-20",
      // 2026-05-19 is missing (skip)
      "2026-05-18", "2026-05-17", "2026-05-16", "2026-05-15",
    ]);
    expect(computeStreak(checkIns, new Date("2026-05-23T12:00:00Z"))).toBe(4);
  });

  it("AC-STREAK-6: DST spring-forward UTC keys still work", () => {
    // 2026-03-08 UTC is DST spring-forward in US — UTC keys are unaffected
    const checkIns = ci(["2026-03-08", "2026-03-07", "2026-03-06"]);
    expect(computeStreak(checkIns, new Date("2026-03-08T12:00:00Z"))).toBe(3);
  });

  it("AC-STREAK-7: future dates ignored — streak still anchored at today", () => {
    const checkIns = ci(["2099-01-01", "2026-05-23"]);
    expect(computeStreak(checkIns, new Date("2026-05-23T12:00:00Z"))).toBe(1);
  });
});

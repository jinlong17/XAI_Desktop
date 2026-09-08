/**
 * AC-STAT-1..6: computeMonthlyCount, computeMonthlyRate, compute365 pure tests.
 */
import { describe, it, expect } from "vitest";
import { computeMonthlyCount, computeMonthlyRate, compute365 } from "../internal/computeStats.js";
import type { DateKey } from "../types.js";

const ci = (keys: string[]): Record<DateKey, true> =>
  Object.fromEntries(keys.map((k) => [k, true])) as Record<DateKey, true>;

describe("computeMonthlyCount", () => {
  it("AC-STAT-1: counts only current-month dates", () => {
    const checkIns = ci(["2026-05-01", "2026-04-30", "2026-05-15"]);
    expect(computeMonthlyCount(checkIns, new Date("2026-05-23T00:00:00Z"))).toBe(2);
  });

  it("AC-STAT-2: returns 0 for empty map", () => {
    expect(computeMonthlyCount({}, new Date("2026-05-23T00:00:00Z"))).toBe(0);
  });
});

describe("computeMonthlyRate", () => {
  it("AC-STAT-3: uses today.getUTCDate() as denominator", () => {
    // 5 checks in first 10 days, today = day 10
    const keys: string[] = [];
    for (let d = 1; d <= 5; d++) keys.push(`2026-05-0${d}`);
    const checkIns = ci(keys);
    const rate = computeMonthlyRate(checkIns, new Date("2026-05-10T00:00:00Z"));
    expect(rate).toBe(50);
  });

  it("AC-STAT-4: 100% when every elapsed day is checked", () => {
    const keys: string[] = [];
    for (let d = 1; d <= 23; d++) keys.push(`2026-05-${d < 10 ? "0" + d : d}`);
    const checkIns = ci(keys);
    const rate = computeMonthlyRate(checkIns, new Date("2026-05-23T00:00:00Z"));
    expect(rate).toBe(100);
  });
});

describe("compute365", () => {
  it("AC-STAT-5: non-leap year has denominator 365", () => {
    const checkIns = ci(["2026-01-01", "2026-02-14", "2026-12-25"]);
    const result = compute365(checkIns, new Date("2026-05-23T00:00:00Z"));
    expect(result.denominator).toBe(365);
    expect(result.numerator).toBe(3);
  });

  it("AC-STAT-6: leap year has denominator 366", () => {
    const checkIns = ci(["2024-01-01", "2024-02-29"]);
    const result = compute365(checkIns, new Date("2024-05-23T00:00:00Z"));
    expect(result.denominator).toBe(366);
    expect(result.numerator).toBe(2);
  });

  it("excludes prior-year dates from numerator", () => {
    const checkIns = ci(["2025-12-31", "2026-01-01", "2026-05-23"]);
    const result = compute365(checkIns, new Date("2026-05-23T00:00:00Z"));
    expect(result.numerator).toBe(2); // only 2026 dates
  });
});

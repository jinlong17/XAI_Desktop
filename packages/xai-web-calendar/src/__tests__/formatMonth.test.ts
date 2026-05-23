/**
 * Tests for internal/formatMonth.ts.
 */
import { describe, it, expect } from "vitest";
import { formatMonthTitle } from "../internal/formatMonth.js";

// Minimal common.{jan..dec} bundle fixture (only the fields used).
const T = {
  common: {
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
  },
} as const;

describe("formatMonthTitle", () => {
  it("EN: May 2026", () => {
    expect(formatMonthTitle(2026, 5, "en", T)).toBe("May 2026");
  });

  it("ZH: 2026 年 5 月", () => {
    expect(formatMonthTitle(2026, 5, "zh", T)).toBe("2026 年 5 月");
  });

  it("EN: all 12 months", () => {
    const expected = [
      "Jan 2026",
      "Feb 2026",
      "Mar 2026",
      "Apr 2026",
      "May 2026",
      "Jun 2026",
      "Jul 2026",
      "Aug 2026",
      "Sep 2026",
      "Oct 2026",
      "Nov 2026",
      "Dec 2026",
    ];
    for (let m = 1; m <= 12; m++) {
      expect(formatMonthTitle(2026, m, "en", T)).toBe(expected[m - 1]);
    }
  });
});

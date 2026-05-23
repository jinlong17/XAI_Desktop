/**
 * Tests for internal/dateKeys.ts — AC-DATE-1..6.
 */
import { describe, it, expect } from "vitest";
import { pad2, utcDateKey, isLeapYear, daysInMonth } from "../internal/dateKeys.js";

describe("dateKeys", () => {
  it("AC-DATE-1: utcDateKey returns YYYY-MM-DD", () => {
    expect(utcDateKey(new Date(Date.UTC(2026, 4, 1)))).toBe("2026-05-01");
    expect(utcDateKey(new Date(Date.UTC(2026, 11, 31)))).toBe("2026-12-31");
    expect(utcDateKey(new Date(Date.UTC(2026, 0, 1)))).toBe("2026-01-01");
  });

  it("AC-DATE-2: daysInMonth Feb 2024 leap = 29", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it("AC-DATE-3: daysInMonth Feb 2025 non-leap = 28", () => {
    expect(daysInMonth(2025, 2)).toBe(28);
  });

  it("AC-DATE-4: isLeapYear(2000) centennial true", () => {
    expect(isLeapYear(2000)).toBe(true);
  });

  it("AC-DATE-5: isLeapYear(1900) centennial false", () => {
    expect(isLeapYear(1900)).toBe(false);
  });

  it("AC-DATE-6: pad2", () => {
    expect(pad2(0)).toBe("00");
    expect(pad2(7)).toBe("07");
    expect(pad2(12)).toBe("12");
    expect(pad2(31)).toBe("31");
  });

  it("daysInMonth for all 12 months", () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 3)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 5)).toBe(31);
    expect(daysInMonth(2026, 6)).toBe(30);
    expect(daysInMonth(2026, 7)).toBe(31);
    expect(daysInMonth(2026, 8)).toBe(31);
    expect(daysInMonth(2026, 9)).toBe(30);
    expect(daysInMonth(2026, 10)).toBe(31);
    expect(daysInMonth(2026, 11)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

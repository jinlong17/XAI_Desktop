/**
 * Tests for internal/holidays.ts.
 */
import { describe, it, expect } from "vitest";
import { findHolidayKey, HOLIDAYS } from "../internal/holidays.js";

describe("holidays", () => {
  it("findHolidayKey returns correct key for May 1 2026", () => {
    expect(findHolidayKey(2026, 5, 1)).toBe("cal.holiday_mayday");
  });

  it("findHolidayKey returns correct key for May 9 2026", () => {
    expect(findHolidayKey(2026, 5, 9)).toBe("cal.holiday_mothers_day");
  });

  it("findHolidayKey returns undefined for non-holiday day", () => {
    expect(findHolidayKey(2026, 5, 15)).toBeUndefined();
    expect(findHolidayKey(2026, 5, 22)).toBeUndefined();
    expect(findHolidayKey(2025, 5, 1)).toBeUndefined(); // year mismatch
  });

  it("HOLIDAYS table is non-empty + entries well-formed", () => {
    expect(HOLIDAYS.length).toBeGreaterThanOrEqual(2);
    for (const h of HOLIDAYS) {
      expect(h.year).toBeGreaterThan(2000);
      expect(h.month).toBeGreaterThanOrEqual(1);
      expect(h.month).toBeLessThanOrEqual(12);
      expect(h.day).toBeGreaterThanOrEqual(1);
      expect(h.day).toBeLessThanOrEqual(31);
      expect(h.i18nKey).toMatch(/^cal\.holiday_/);
    }
  });
});

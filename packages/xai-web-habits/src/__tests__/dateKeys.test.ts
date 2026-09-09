/**
 * AC-DATE-1..7: Pure date helper unit tests.
 */
import { describe, it, expect } from "vitest";
import {
  utcDateKey,
  monthKey,
  weekDates,
  daysInMonth,
  isLeapYear,
  pad2,
} from "../internal/dateKeys.js";

describe("pad2", () => {
  it("pads single digits", () => {
    expect(pad2(5)).toBe("05");
    expect(pad2(1)).toBe("01");
  });
  it("does not pad double digits", () => {
    expect(pad2(10)).toBe("10");
    expect(pad2(31)).toBe("31");
  });
});

describe("utcDateKey", () => {
  it("AC-DATE-1: returns YYYY-MM-DD", () => {
    expect(utcDateKey(new Date(2026, 4, 23))).toBe("2026-05-23");
  });
  it("pads month and day", () => {
    expect(utcDateKey(new Date(2026, 0, 1))).toBe("2026-01-01");
  });
});

describe("monthKey", () => {
  it("AC-DATE-2: returns YYYY-MM", () => {
    expect(monthKey(new Date(2026, 4, 23))).toBe("2026-05");
  });
});

describe("weekDates", () => {
  it("AC-DATE-3: weekStart=sun returns 7 dates, first is Sunday", () => {
    // 2026-05-23 is a Saturday (getDay() = 6)
    const now = new Date(2026, 4, 23);
    const dates = weekDates(now, "sun");
    expect(dates).toHaveLength(7);
    expect(dates[0]!.getDay()).toBe(0); // Sunday
  });

  it("AC-DATE-4: weekStart=mon returns 7 dates, first is Monday", () => {
    const now = new Date(2026, 4, 23);
    const dates = weekDates(now, "mon");
    expect(dates).toHaveLength(7);
    expect(dates[0]!.getDay()).toBe(1); // Monday
  });

  it("AC-DATE-5: rolls correctly across month boundaries", () => {
    // 2026-05-01 is a Friday (getDay() = 5)
    // With weekStart=sun, the week starts on 2026-04-26 (Sunday)
    const now = new Date(2026, 4, 1);
    const dates = weekDates(now, "sun");
    expect(dates).toHaveLength(7);
    expect(utcDateKey(dates[0]!)).toBe("2026-04-26"); // Sunday
    expect(utcDateKey(dates[6]!)).toBe("2026-05-02"); // Saturday
  });
});

describe("daysInMonth", () => {
  it("AC-DATE-6: February 2024 (leap) = 29", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
  });
  it("AC-DATE-6: February 2025 = 28", () => {
    expect(daysInMonth(2025, 1)).toBe(28);
  });
  it("AC-DATE-6: April 2026 = 30", () => {
    expect(daysInMonth(2026, 3)).toBe(30);
  });
  it("AC-DATE-6: May 2026 = 31", () => {
    expect(daysInMonth(2026, 4)).toBe(31);
  });
});

describe("isLeapYear", () => {
  it("AC-DATE-7: 2024 is leap", () => expect(isLeapYear(2024)).toBe(true));
  it("AC-DATE-7: 2100 is not leap (div by 100 not 400)", () => expect(isLeapYear(2100)).toBe(false));
  it("AC-DATE-7: 2400 is leap (div by 400)", () => expect(isLeapYear(2400)).toBe(true));
  it("AC-DATE-7: 2026 is not leap", () => expect(isLeapYear(2026)).toBe(false));
});

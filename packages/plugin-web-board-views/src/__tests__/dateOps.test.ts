/**
 * Unit tests for dateOps.ts helpers — DO1..DO7
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.2
 */

import { describe, expect, test } from "vitest";
import {
  calendarDayInMonth,
  calendarDayToIso,
  parseDay,
  dayToStr,
  clampDay,
} from "../internal/dateOps.js";

const TODAY = new Date(2026, 4, 23); // 2026-05-23 (month 4 = May)

describe("dateOps", () => {
  test("DO1 parseDay('2026-05-24') from today 5/23 returns 1", () => {
    expect(parseDay("2026-05-24", TODAY)).toBe(1);
  });

  test("DO2 parseDay(today ISO) returns 0", () => {
    expect(parseDay("2026-05-23", TODAY)).toBe(0);
  });

  test("DO3 parseDay rejects legacy display labels", () => {
    expect(parseDay("今天", TODAY)).toBeNull();
    expect(parseDay("Today", TODAY)).toBeNull();
    expect(parseDay("5/24", TODAY)).toBeNull();
  });

  test("DO4 parseDay(undefined) returns null", () => {
    expect(parseDay(undefined, TODAY)).toBeNull();
  });

  test("DO5 parseDay('garbage') returns null", () => {
    expect(parseDay("garbage", TODAY)).toBeNull();
  });

  test("DO6 dayToStr(2) from today 5/23 returns '2026-05-25'", () => {
    expect(dayToStr(2, TODAY)).toBe("2026-05-25");
  });

  test("DO7 clampDay(-5) returns 0; clampDay(40) returns 29", () => {
    expect(clampDay(-5)).toBe(0);
    expect(clampDay(40)).toBe(29);
  });

  test("DO8 calendar helpers map ISO dates to current-month days", () => {
    expect(calendarDayInMonth("2026-05-24", 2026, 5)).toBe(24);
    expect(calendarDayInMonth("2026-06-01", 2026, 5)).toBeNull();
    expect(calendarDayToIso(2026, 5, 24)).toBe("2026-05-24");
    expect(calendarDayToIso(2026, 2, 31)).toBeNull();
  });
});

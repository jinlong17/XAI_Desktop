/**
 * Unit tests for dateOps.ts helpers — DO1..DO7
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.2
 */

import { describe, expect, test } from "vitest";
import { parseDay, dayToStr, clampDay } from "../internal/dateOps.js";

const TODAY = new Date(2026, 4, 23); // 2026-05-23 (month 4 = May)

describe("dateOps", () => {
  test("DO1 parseDay('5/24') from today 5/23 returns 1", () => {
    expect(parseDay("5/24", TODAY)).toBe(1);
  });

  test("DO2 parseDay('Today') returns 0", () => {
    expect(parseDay("Today", TODAY)).toBe(0);
  });

  test("DO3 parseDay('今天') returns 0", () => {
    expect(parseDay("今天", TODAY)).toBe(0);
  });

  test("DO4 parseDay(undefined) returns null", () => {
    expect(parseDay(undefined, TODAY)).toBeNull();
  });

  test("DO5 parseDay('garbage') returns null", () => {
    expect(parseDay("garbage", TODAY)).toBeNull();
  });

  test("DO6 dayToStr(2) from today 5/23 returns '5/25'", () => {
    expect(dayToStr(2, TODAY)).toBe("5/25");
  });

  test("DO7 clampDay(-5) returns 0; clampDay(40) returns 29", () => {
    expect(clampDay(-5)).toBe(0);
    expect(clampDay(40)).toBe(29);
  });
});

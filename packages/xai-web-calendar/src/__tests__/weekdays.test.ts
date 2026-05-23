/**
 * Tests for internal/weekdays.ts.
 */
import { describe, it, expect } from "vitest";
import { weekdayLabels } from "../internal/weekdays.js";

const SUN_FIRST = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

describe("weekdayLabels", () => {
  it("Sunday-first (weekStart=0) returns Sun..Sat", () => {
    expect(weekdayLabels(SUN_FIRST, 0)).toEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });

  it("Monday-first (weekStart=1) returns Mon..Sun", () => {
    expect(weekdayLabels(SUN_FIRST, 1)).toEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  it("ZH labels rotate correctly Monday-first", () => {
    const ZH = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const;
    expect(weekdayLabels(ZH, 1)).toEqual([
      "周一",
      "周二",
      "周三",
      "周四",
      "周五",
      "周六",
      "周日",
    ]);
  });
});

/**
 * Unit tests for dueShortcuts.ts helpers — DS1..DS7
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.1
 */

import { describe, expect, test } from "vitest";
import {
  todayShortcut,
  tomorrowShortcut,
  nextMondayShortcut,
} from "../internal/dueShortcuts.js";

describe("dueShortcuts", () => {
  test("DS1 todayShortcut('en') returns 'Today'", () => {
    expect(todayShortcut("en")).toBe("Today");
  });

  test("DS2 todayShortcut('zh') returns '今天'", () => {
    expect(todayShortcut("zh")).toBe("今天");
  });

  test("DS3 tomorrowShortcut(2026, 5, 23) returns '5/24'", () => {
    expect(tomorrowShortcut(2026, 5, 23)).toBe("5/24");
  });

  test("DS4 tomorrowShortcut at month boundary (2026-12-31) returns '1/1'", () => {
    expect(tomorrowShortcut(2026, 12, 31)).toBe("1/1");
  });

  test("DS5 nextMondayShortcut from Saturday (2026-5-23) returns Monday (today+2='5/25')", () => {
    // 2026-05-23 is a Saturday (day=6)
    const result = nextMondayShortcut(2026, 5, 23);
    // Saturday → next Monday = +2 days
    expect(result).toBe("5/25");
  });

  test("DS6 nextMondayShortcut from Monday (2026-5-25) returns NEXT Monday (today+7='6/1')", () => {
    // 2026-05-25 is a Monday
    const result = nextMondayShortcut(2026, 5, 25);
    expect(result).toBe("6/1");
  });

  test("DS7 nextMondayShortcut from Sunday (2026-5-24) returns Monday (today+1='5/25')", () => {
    // 2026-05-24 is a Sunday
    const result = nextMondayShortcut(2026, 5, 24);
    expect(result).toBe("5/25");
  });
});

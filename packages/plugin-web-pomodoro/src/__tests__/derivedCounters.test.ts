/**
 * DC1..DC9 — derivedCounters pure function tests.
 * test.md §2
 *
 * vitest.setup.ts sets system time to 2026-05-23 14:30 local.
 * Fixtures reference this as "today" = 2026-05-23 in local TZ.
 */

import { describe, it, expect } from "vitest";
import {
  countTodaysPomos,
  sumTodaysFocusMs,
  countTotalPomos,
  sumTotalFocusMs,
  computeStreak,
} from "../internal/derivedCounters.js";
import {
  FIXTURE_FOCUS_TODAY,
  FIXTURE_FOCUS_TODAY_PARTIAL,
  FIXTURE_FOCUS_YESTERDAY,
  FIXTURE_SHORT_BREAK_TODAY,
} from "../__fixtures__/sessions.js";
// "Today" as a fixed literal aligned to vitest.setup.ts TEST_NOW = new Date(2026, 4, 23, 14, 30, 0).
// Must NOT call new Date() here — module top-level runs before beforeEach installs fake timers,
// so it would read the real host clock and diverge from the fixture anchor.
const TODAY_LOCAL = "2026-05-23";

describe("countTodaysPomos", () => {
  // DC1: empty array → 0
  it("DC1: empty array → 0", () => {
    expect(countTodaysPomos([], TODAY_LOCAL)).toBe(0);
  });

  // DC2: only non-focus sessions → 0
  it("DC2: only non-focus sessions → 0", () => {
    expect(countTodaysPomos([FIXTURE_SHORT_BREAK_TODAY], TODAY_LOCAL)).toBe(0);
  });

  // DC3: today's focus counted
  it("DC3: completed focus session today → 1", () => {
    expect(countTodaysPomos([FIXTURE_FOCUS_TODAY], TODAY_LOCAL)).toBe(1);
  });

  // Non-completed excluded
  it("DC3b: non-completed (partial) focus excluded", () => {
    expect(countTodaysPomos([FIXTURE_FOCUS_TODAY_PARTIAL], TODAY_LOCAL)).toBe(0);
  });
});

describe("sumTodaysFocusMs", () => {
  // DC4: today's focus ms
  it("DC4: completed focus today → correct sum", () => {
    const result = sumTodaysFocusMs([FIXTURE_FOCUS_TODAY], TODAY_LOCAL);
    expect(result).toBe(25 * 60 * 1000);
  });

  // DC5 (cross): yesterday excluded from today's sum
  it("DC5: yesterday's session excluded from today's sum", () => {
    const result = sumTodaysFocusMs([FIXTURE_FOCUS_YESTERDAY], TODAY_LOCAL);
    expect(result).toBe(0);
  });
});

describe("countTotalPomos", () => {
  // DC5: total includes all completed focus
  it("DC5: counts all completed focus sessions", () => {
    const sessions = [FIXTURE_FOCUS_TODAY, FIXTURE_FOCUS_YESTERDAY, FIXTURE_SHORT_BREAK_TODAY];
    expect(countTotalPomos(sessions)).toBe(2); // focus only, completed
  });

  // Non-completed excluded
  it("non-completed excluded from total", () => {
    expect(countTotalPomos([FIXTURE_FOCUS_TODAY_PARTIAL])).toBe(0);
  });
});

describe("sumTotalFocusMs", () => {
  // DC6: total focus ms
  it("DC6: sums all completed focus sessions", () => {
    const result = sumTotalFocusMs([FIXTURE_FOCUS_TODAY, FIXTURE_FOCUS_YESTERDAY]);
    expect(result).toBe(2 * 25 * 60 * 1000);
  });

  // DC7: yesterday excluded from "today" but included in total
  it("DC7: yesterday included in total (not in today)", () => {
    const todaySum = sumTodaysFocusMs([FIXTURE_FOCUS_YESTERDAY], TODAY_LOCAL);
    const totalSum = sumTotalFocusMs([FIXTURE_FOCUS_YESTERDAY]);
    expect(todaySum).toBe(0);
    expect(totalSum).toBe(25 * 60 * 1000);
  });
});

describe("computeStreak", () => {
  // DC8: empty → 0
  it("DC8: empty sessions → streak = 0", () => {
    expect(computeStreak([], TODAY_LOCAL)).toBe(0);
  });

  // DC9: today has session → streak = 1 (at least)
  it("DC9: today has session → streak ≥ 1", () => {
    expect(computeStreak([FIXTURE_FOCUS_TODAY], TODAY_LOCAL)).toBeGreaterThanOrEqual(1);
  });

  // streak with today + yesterday
  it("streak = 2 for consecutive today + yesterday", () => {
    const result = computeStreak([FIXTURE_FOCUS_TODAY, FIXTURE_FOCUS_YESTERDAY], TODAY_LOCAL);
    expect(result).toBe(2);
  });

  // streak breaks at first gap
  it("streak breaks at first gap (today only, no yesterday)", () => {
    // Only today's session → streak = 1 (no yesterday)
    expect(computeStreak([FIXTURE_FOCUS_TODAY], TODAY_LOCAL)).toBe(1);
  });

  // no session today or yesterday → 0
  it("no session today or yesterday → streak = 0", () => {
    // Only 2 days ago
    const twoDaysAgo = {
      ...FIXTURE_FOCUS_YESTERDAY,
      id: "pomo_2dago",
      startedAt: "2026-05-21T10:00:00.000Z",
      finishedAt: "2026-05-21T10:25:00.000Z",
    };
    expect(computeStreak([twoDaysAgo], TODAY_LOCAL)).toBe(0);
  });
});

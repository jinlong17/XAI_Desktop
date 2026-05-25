/**
 * calendar adapter — C1..C4
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { calendarAdapter } from "../../adapters/calendar.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

it("C1 — empty query → module-jump", () => {
  const hits = calendarAdapter("", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("C2 — query 'cal' matches → module-jump", () => {
  const hits = calendarAdapter("cal", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("C3 — query '日历' matches → module-jump", () => {
  const hits = calendarAdapter("日历", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("C4 — query 'month' matches alias → module-jump", () => {
  const hits = calendarAdapter("month", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

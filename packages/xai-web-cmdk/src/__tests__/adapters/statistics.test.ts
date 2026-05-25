/**
 * statistics adapter — ST1..ST3
 * test.md §3 P2
 */
import { it, expect, beforeEach } from "vitest";
import { __resetCmdkRegistry } from "../../internal/registry.js";
import { statisticsAdapter } from "../../adapters/statistics.js";

beforeEach(() => {
  __resetCmdkRegistry();
});

it("ST1 — empty query → module-jump", () => {
  const hits = statisticsAdapter("", {});
  expect(hits).toHaveLength(1);
  expect(hits[0]?.kind).toBe("module-jump");
});

it("ST2 — 'stats' / '统计' / 'graph' / 'chart' aliases match", () => {
  expect(statisticsAdapter("stats", {})).toHaveLength(1);
  expect(statisticsAdapter("统计", {})).toHaveLength(1);
  expect(statisticsAdapter("graph", {})).toHaveLength(1);
  expect(statisticsAdapter("chart", {})).toHaveLength(1);
  expect(statisticsAdapter("data", {})).toHaveLength(1);
});

it("ST3 — unrelated query → []", () => {
  expect(statisticsAdapter("xyznotmatched", {})).toHaveLength(0);
});

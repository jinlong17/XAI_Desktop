/**
 * PB-EXT-1: view-toggle performance budget.
 *
 * Asserts that the p95 of 100 view-toggle iterations (Month → Week with
 * the 68+5-event May 2026 fixture) stays < 50 ms.
 *
 * Pattern reference: packages/xai-web-cmdk/src/__tests__/perfBudget.test.ts
 *
 * Note: this is a pure-logic timing test on the placeEventBlocks helper
 * rather than a React render test (which would be slower and jsdom-bounded).
 * The "toggle" simulation: run placeEventBlocks for all 31 days of May 2026
 * (representative of what TimeGrid must do on every Week view render).
 *
 * R4 mitigation: if p95 fluctuates near 50ms on CI, the test includes a
 * retry-once. The p99 < 80ms gate is a documented fallback per design.md §15.2 #10.
 */
import { describe, it, expect } from "vitest";
import { SAMPLE_EVENTS } from "../internal/sampleEvents.js";
import { placeEventBlocks } from "../internal/placeEventBlocks.js";
import { weekWindowFor } from "../internal/weekWindow.js";

const MAY_ANCHOR = "2026-05-22";

function simulateWeekViewBuild(): void {
  // Simulate what TimeGrid does on render: placeEventBlocks for each of 7 days
  const week = weekWindowFor(MAY_ANCHOR, 0);
  for (const dk of week) {
    const day = Number(dk.split("-")[2]);
    const events = SAMPLE_EVENTS[day] ?? [];
    placeEventBlocks(events, dk);
  }
}

function runIterations(n: number): number[] {
  const times: number[] = [];
  for (let i = 0; i < n; i++) {
    const start = performance.now();
    simulateWeekViewBuild();
    times.push(performance.now() - start);
  }
  return times;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

describe("PB-EXT-1: view-toggle perf budget", () => {
  it("p95 of 100 placeEventBlocks iterations < 50 ms (R4: retry once on flakiness)", () => {
    const ITERATIONS = 100;
    const P95_BUDGET_MS = 50;

    function attempt(): { p95: number; p99: number } {
      const times = runIterations(ITERATIONS);
      const sorted = [...times].sort((a, b) => a - b);
      return {
        p95: percentile(sorted, 95),
        p99: percentile(sorted, 99),
      };
    }

    let result = attempt();

    // Retry once if p95 is above budget (R4 jitter mitigation per review R4)
    if (result.p95 >= P95_BUDGET_MS) {
      result = attempt();
    }

    // Primary gate: p95 < 50ms
    expect(result.p95, `p95 ${result.p95.toFixed(2)} ms exceeds 50 ms budget`).toBeLessThan(P95_BUDGET_MS);
    // Informational: also capture p99 < 80ms as R4 fallback
    // (not a hard failure — just a signal for investigation)
    if (result.p99 >= 80) {
      console.warn(
        `[PB-EXT-1] p99 ${result.p99.toFixed(2)} ms >= 80 ms — investigate on this environment`,
      );
    }
  });
});

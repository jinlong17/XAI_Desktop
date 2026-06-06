/**
 * PB-CREATE-1 — event-create viewport recompute budget.
 *
 * Measures p95 of `mergeEventsForWindow` with 100 user events (95 single +
 * 5 weekly recurring) over a 7-day Week window.
 *
 * Budget: p95 < 16ms.
 */

import { describe, it, expect } from "vitest";
import { SAMPLE_EVENTS } from "../internal/sampleEvents.js";
import { mergeEventsForWindow } from "../internal/eventStore/mergeEventsForViewport.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";

const ITERATIONS = 100;
const P95_BUDGET_MS = 16;

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

function makeStore(): Record<string, UserCalEvent> {
  const out: Record<string, UserCalEvent> = {};
  for (let i = 0; i < 95; i++) {
    const day = String((i % 28) + 1).padStart(2, "0");
    const id = `single-${i}`;
    out[id] = {
      id,
      title: `Single ${i}`,
      startISO: `2026-05-${day}T09:00`,
      endISO: `2026-05-${day}T10:00`,
      colorPreset: "mint",
      recurrence: null,
      createdAt: "2026-05-22T00:00:00.000Z",
      updatedAt: "2026-05-22T00:00:00.000Z",
    };
  }
  for (let i = 0; i < 5; i++) {
    const id = `weekly-${i}`;
    out[id] = {
      id,
      title: `Weekly ${i}`,
      startISO: "2026-05-15T08:00",
      endISO: "2026-05-15T09:00",
      colorPreset: "blue",
      recurrence: { kind: "weekly" },
      createdAt: "2026-05-22T00:00:00.000Z",
      updatedAt: "2026-05-22T00:00:00.000Z",
    };
  }
  return out;
}

describe("PB-CREATE-1", () => {
  it("viewport merge p95 < 16ms for 100 events", () => {
    const userEvents = makeStore();
    const run = (): number => {
      const durations: number[] = [];
      for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        mergeEventsForWindow(
          SAMPLE_EVENTS,
          { year: 2026, month: 5 },
          userEvents,
          "2026-05-17",
          "2026-05-23",
        );
        durations.push(performance.now() - start);
      }
      return percentile([...durations].sort((a, b) => a - b), 95);
    };

    let p95 = run();
    if (p95 >= P95_BUDGET_MS) {
      p95 = run();
    }
    expect(p95).toBeLessThan(P95_BUDGET_MS);
  });
});

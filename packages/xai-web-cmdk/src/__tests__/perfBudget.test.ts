/**
 * PB1 — Perf budget test for buildIndex.
 *
 * Assertion: p95 of 100 iterations of buildIndex with a realistic 11-module
 * state must be < 50 ms (leaving 50 ms headroom for modal mount + first paint
 * to hit the 100 ms total open budget — AS1).
 *
 * If this test is flaky on slow CI, retry once per R10 mitigation. The 50 ms
 * ceiling is 5× the expected synchronous pipeline time.
 *
 * test.md §4 PB1
 * design.md Frozen assumption #14 (100 ms open budget)
 * dev_log.md Risk R3, R10
 */

import { it, expect, beforeAll } from "vitest";
import { buildIndex } from "../internal/buildIndex.js";
import { REALISTIC_MODULE_STATES } from "./fixtures/realisticState.js";

// Import adapters for side-effect registration (so all 11 are in the registry)
import "../adapters/index.js";

const ITERATIONS = 100;
const P95_MAX_MS = 50;
const REPRESENTATIVE_QUERY = "focus";

function p95(samples: number[]): number {
  const sorted = [...samples].sort((a, b) => a - b);
  const idx = Math.ceil(0.95 * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

let durations: number[] = [];

beforeAll(() => {
  // Warm up: 5 ignored iterations to prime JIT/caches
  for (let i = 0; i < 5; i++) {
    buildIndex(REPRESENTATIVE_QUERY, REALISTIC_MODULE_STATES);
  }

  // Measure 100 iterations
  durations = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    buildIndex(REPRESENTATIVE_QUERY, REALISTIC_MODULE_STATES);
    durations.push(performance.now() - start);
  }
});

it(`PB1 — buildIndex p95 < ${P95_MAX_MS}ms over ${ITERATIONS} iterations (query="${REPRESENTATIVE_QUERY}")`, () => {
  const result = p95(durations);
  console.info(`[PB1] buildIndex p95=${result.toFixed(3)}ms (budget: ${P95_MAX_MS}ms, iterations: ${ITERATIONS})`);
  expect(result).toBeLessThan(P95_MAX_MS);
});

it("PB1b — buildIndex p95 < 50ms with empty query (module-jump harvest)", () => {
  const empties: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    buildIndex("", REALISTIC_MODULE_STATES);
    empties.push(performance.now() - start);
  }
  const result = p95(empties);
  console.info(`[PB1b] buildIndex(empty) p95=${result.toFixed(3)}ms (budget: ${P95_MAX_MS}ms)`);
  expect(result).toBeLessThan(P95_MAX_MS);
});

it("PB1c — buildIndex returns ≤ 50 hits (cap enforced)", () => {
  // With empty query, adapters that return module-jumps + many entities
  // should still be capped at 50 by buildIndex
  const hits = buildIndex("", REALISTIC_MODULE_STATES);
  expect(hits.length).toBeLessThanOrEqual(50);
});

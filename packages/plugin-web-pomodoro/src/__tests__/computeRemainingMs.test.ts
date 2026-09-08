/**
 * C1..C8 — computeRemainingMs pure function tests.
 * test.md §2
 */

import { describe, it, expect } from "vitest";
import { computeRemainingMs } from "../internal/computeRemainingMs.js";

const DURATION = 25 * 60 * 1000; // 1_500_000 ms

describe("computeRemainingMs", () => {
  // C1: zero elapsed → full remaining
  it("C1: zero elapsed returns full remaining", () => {
    const now = 1000000;
    expect(computeRemainingMs(now, DURATION, now)).toBe(DURATION);
  });

  // C2: exactly at zero (elapsed === remaining)
  it("C2: elapsed exactly equals remaining → 0", () => {
    const start = 1000000;
    expect(computeRemainingMs(start, DURATION, start + DURATION)).toBe(0);
  });

  // C3: over-elapsed → 0 (clamped)
  it("C3: over-elapsed is clamped to 0", () => {
    const start = 1000000;
    expect(computeRemainingMs(start, DURATION, start + DURATION + 5000)).toBe(0);
  });

  // C4: partial elapsed → correct ms math
  it("C4: partial elapsed returns correct remaining", () => {
    const start = 1000000;
    const elapsed = 5 * 60 * 1000; // 5 minutes
    expect(computeRemainingMs(start, DURATION, start + elapsed)).toBe(DURATION - elapsed);
  });

  // C5: large drift → 0
  it("C5: large drift clamps to 0", () => {
    const start = 1000000;
    expect(computeRemainingMs(start, DURATION, start + 10 * DURATION)).toBe(0);
  });

  // C6: negative nowMs - startedAt (clock went backward) — we clamp at 0 via max
  it("C6: negative elapsed (clock backward) → full remaining or more", () => {
    const start = 2000000;
    const now = 1000000; // before start
    // remainingAtStartMs - (now - start) = DURATION - (1000000 - 2000000) = DURATION + 1000000
    // but Math.max(0, ...) keeps it clamped on the positive side
    const result = computeRemainingMs(start, DURATION, now);
    expect(result).toBe(DURATION + 1000000);
  });

  // C7: sub-second precision (250 ms granularity)
  it("C7: sub-second precision", () => {
    const start = 1000000;
    const elapsed = 250;
    expect(computeRemainingMs(start, DURATION, start + elapsed)).toBe(DURATION - 250);
  });

  // C8: idempotent same-input
  it("C8: same inputs produce same output (idempotent)", () => {
    const start = 5000000;
    const remaining = 10 * 60 * 1000;
    const now = start + 2000;
    const r1 = computeRemainingMs(start, remaining, now);
    const r2 = computeRemainingMs(start, remaining, now);
    expect(r1).toBe(r2);
  });
});

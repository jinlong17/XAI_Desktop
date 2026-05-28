/**
 * T-MID-1..2 — createMatrixId unit tests.
 *
 * EP1 data layer.
 * Design: design.md §E.1 #10 (id namespace disjoint from seed-<digit>)
 */

import { describe, it, expect } from "vitest";
import { createMatrixId } from "../internal/ids.js";

describe("createMatrixId", () => {
  it("T-MID-1: returns a non-empty string", () => {
    const id = createMatrixId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("T-MID-1: two consecutive calls return distinct values", () => {
    const a = createMatrixId();
    const b = createMatrixId();
    expect(a).not.toBe(b);
  });

  it("T-MID-2: id does NOT match the seed pattern ^seed-\\d+$", () => {
    // Verify namespace disjointness: generated ids must not look like "seed-1", "seed-8", etc.
    const SEED_PATTERN = /^seed-\d+$/;
    for (let i = 0; i < 20; i++) {
      const id = createMatrixId();
      expect(SEED_PATTERN.test(id)).toBe(false);
    }
  });
});

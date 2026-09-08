/**
 * ids.test.ts — T-IDS-1..2
 *
 * Pure tests for createTaskId() — no React, no storage.
 * Phase: EP1
 *
 * Test plan: packages/xai-web-tasks/docs/test.md §E.1
 */

import { describe, it, expect } from "vitest";
import { createTaskId } from "../internal/ids.js";

// Seed ids to check against (t1..t26, c1..c6 from MOCK)
const SEED_IDS = new Set([
  "t1","t2","t3","t4","t5","t6","t7","t8","t9","t10",
  "t11","t12","t13","t14","t15","t16","t17","t18","t19","t20",
  "t21","t22","t23","t24","t25","t26",
  "c1","c2","c3","c4","c5","c6",
]);

describe("createTaskId", () => {
  // T-IDS-1: returns a non-empty string; two calls differ
  it("T-IDS-1: returns a non-empty string and two calls return different values", () => {
    const id1 = createTaskId();
    const id2 = createTaskId();
    expect(typeof id1).toBe("string");
    expect(id1.length).toBeGreaterThan(0);
    expect(id1).not.toBe(id2);
  });

  // T-IDS-2: structurally disjoint from seed ids; matches UUID or t-…-… fallback shape
  it("T-IDS-2: generated id is not a seed id; matches UUID or fallback shape", () => {
    const id = createTaskId();

    // Must not collide with any seed id
    expect(SEED_IDS.has(id)).toBe(false);

    // Must match either UUID v4 format or the t-<base36>-<base36> fallback
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const fallbackPattern = /^t-[0-9a-z]+-[0-9a-z]+$/;
    expect(uuidPattern.test(id) || fallbackPattern.test(id)).toBe(true);
  });
});

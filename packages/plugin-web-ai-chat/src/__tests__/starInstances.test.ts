/**
 * starInstances — deterministic 60-entry star generator tests.
 *
 * Design: packages/xai-web-ai-chat/docs/test.md §3 — S
 */

import { describe, it, expect } from "vitest";
import { getStarInstances } from "../internal/starInstances.js";

describe("starInstances (S)", () => {
  const instances = getStarInstances();

  it("S1: returns array of length 60", () => {
    expect(instances.length).toBe(60);
  });

  it("S2: deterministic — two calls return the same (frozen) reference and equal contents", () => {
    const a = getStarInstances();
    const b = getStarInstances();
    expect(a).toBe(b);
    expect(a).toEqual(b);
  });

  it("S3: first entry matches the prototype formula at i=0", () => {
    expect(instances[0]).toEqual({
      left: "0%",
      top: "0%",
      animationDelay: "0s",
      animationDuration: "3s",
      opacity: 0.3,
    });
  });

  it("S4: i=1 entry matches the prototype formula", () => {
    expect(instances[1]).toEqual({
      left: "53%",
      top: "97%",
      animationDelay: "0.7s",
      animationDuration: "4s",
      opacity: expect.closeTo(0.45, 5),
    });
  });

  it("S5: i=8 entry — left=24%, top=76%", () => {
    expect(instances[8]?.left).toBe("24%"); // 8*53 % 100 = 24
    expect(instances[8]?.top).toBe("76%"); // 8*97 % 100 = 76
  });

  it("S6: opacity is within [0.3, 0.9]", () => {
    for (const s of instances) {
      expect(s.opacity).toBeGreaterThanOrEqual(0.3);
      expect(s.opacity).toBeLessThanOrEqual(0.9);
    }
  });

  it("S7: every entry is frozen", () => {
    for (const s of instances) {
      expect(Object.isFrozen(s)).toBe(true);
    }
  });
});

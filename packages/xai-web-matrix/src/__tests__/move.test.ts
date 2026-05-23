/**
 * Unit tests for the pure moveCardTo() reducer.
 * No React; no localStorage. Pure function cases.
 */
import { describe, it, expect } from "vitest";
import { moveCardTo } from "../internal/move.js";
import type { MatrixState } from "../types.js";

const BASE_STATE: MatrixState = {
  schemaVersion: 1,
  q1: [{ id: "a", title: { en: "A", zh: "甲" } }],
  q2: [],
  q3: [],
  q4: [{ id: "b", title: { en: "B", zh: "乙" } }],
};

describe("moveCardTo", () => {
  it("happy-path: moves card from q1 to q2", () => {
    const { next, from } = moveCardTo(BASE_STATE, "a", "q2");
    expect(from).toBe("q1");
    expect(next.q1).toHaveLength(0);
    expect(next.q2).toHaveLength(1);
    expect(next.q2[0]?.id).toBe("a");
  });

  it("no-op: card already in target quadrant returns same state reference", () => {
    const { next, from } = moveCardTo(BASE_STATE, "a", "q1");
    expect(from).toBe("q1");
    expect(next).toBe(BASE_STATE);
  });

  it("not-found: missing cardId returns { next: state, from: null }", () => {
    const { next, from } = moveCardTo(BASE_STATE, "nonexistent", "q2");
    expect(from).toBeNull();
    expect(next).toBe(BASE_STATE);
  });

  it("cross-quadrant: moves from q4 to q1", () => {
    const { next, from } = moveCardTo(BASE_STATE, "b", "q1");
    expect(from).toBe("q4");
    expect(next.q4).toHaveLength(0);
    expect(next.q1).toHaveLength(2);
  });

  it("preserves other quadrants untouched", () => {
    const { next } = moveCardTo(BASE_STATE, "a", "q3");
    expect(next.q4).toBe(BASE_STATE.q4); // same reference since q4 not touched
    expect(next.q2).toBe(BASE_STATE.q2);
  });
});

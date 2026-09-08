/**
 * DnD reducer unit tests — pure function tests for reorderArray.
 * Satisfies internal coverage requirement for src/internal/dnd.ts.
 */

import { describe, it, expect } from "vitest";
import { reorderArray } from "../../internal/dnd.js";

describe("reorderArray", () => {
  it("moves item from position 0 to position 2", () => {
    const result = reorderArray(["a", "b", "c", "d"], "a", "c");
    expect(result).toEqual(["b", "c", "a", "d"]);
  });

  it("moves item from position 2 to position 0", () => {
    const result = reorderArray(["a", "b", "c", "d"], "c", "a");
    expect(result).toEqual(["c", "a", "b", "d"]);
  });

  it("returns original array when fromId === toId (N7 — drag onto self)", () => {
    const original = ["a", "b", "c"];
    const result = reorderArray(original, "b", "b");
    expect(result).toBe(original);
  });

  it("returns original array when fromId not found", () => {
    const original = ["a", "b", "c"];
    const result = reorderArray(original, "x" as "a", "b");
    expect(result).toBe(original);
  });

  it("returns original array when toId not found", () => {
    const original = ["a", "b", "c"];
    const result = reorderArray(original, "a", "x" as "a");
    expect(result).toBe(original);
  });

  it("always returns a new array (safe for React state)", () => {
    const original = ["a", "b", "c"];
    const result = reorderArray(original, "a", "b");
    expect(result).not.toBe(original);
  });

  it("moves last item to first", () => {
    const result = reorderArray(["a", "b", "c", "d"], "d", "a");
    expect(result).toEqual(["d", "a", "b", "c"]);
  });

  it("moves first item to last", () => {
    const result = reorderArray(["a", "b", "c", "d"], "a", "d");
    expect(result).toEqual(["b", "c", "d", "a"]);
  });

  it("handles 2-element arrays", () => {
    expect(reorderArray(["a", "b"], "a", "b")).toEqual(["b", "a"]);
    expect(reorderArray(["a", "b"], "b", "a")).toEqual(["b", "a"]);
  });
});

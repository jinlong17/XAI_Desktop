import { describe, it, expect } from "vitest";
import { narrowTaskCols } from "../internal/narrowTaskCols.js";

describe("narrowTaskCols", () => {
  it("NARROW-1: returns false for null", () => {
    expect(narrowTaskCols(null)).toBe(false);
  });

  it("NARROW-2: returns false for non-object primitives", () => {
    expect(narrowTaskCols(undefined)).toBe(false);
    expect(narrowTaskCols(42)).toBe(false);
    expect(narrowTaskCols("string")).toBe(false);
    expect(narrowTaskCols(true)).toBe(false);
  });

  it("NARROW-3: returns false when a column value is missing tasks array", () => {
    const bad = { overdue: { noTasksKey: [] } };
    expect(narrowTaskCols(bad)).toBe(false);
  });

  it("NARROW-4: returns false when tasks is not an array", () => {
    const bad = { next7: { tasks: "not-an-array" } };
    expect(narrowTaskCols(bad)).toBe(false);
  });

  it("NARROW-5: returns true for empty record (registry default {})", () => {
    expect(narrowTaskCols({})).toBe(true);
  });

  it("NARROW-6: returns true for valid TaskCol shape with tasks + optional completed", () => {
    const valid = {
      overdue: { tasks: [{ done: true }], completed: [{ done: false }] },
      next7: { tasks: [] },
      later: { tasks: [{}] }, // done absent → treated as false by consumer
    };
    expect(narrowTaskCols(valid)).toBe(true);
  });

  it("NARROW-7: returns false when completed is present but not an array", () => {
    const bad = { later: { tasks: [], completed: "bad" } };
    expect(narrowTaskCols(bad)).toBe(false);
  });

  it("NARROW-8: tolerates unknown bucket ids (not just the 4 canonical ids)", () => {
    const extra = { custom_bucket: { tasks: [{ done: true }] } };
    expect(narrowTaskCols(extra)).toBe(true);
  });
});

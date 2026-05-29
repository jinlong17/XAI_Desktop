import { describe, it, expect } from "vitest";
import { countDoneTasks } from "../internal/countDoneTasks.js";

describe("countDoneTasks", () => {
  it("TASKS-1: returns 0 for null/undefined/invalid inputs (defensive)", () => {
    expect(countDoneTasks(null)).toBe(0);
    expect(countDoneTasks(undefined)).toBe(0);
    expect(countDoneTasks(42)).toBe(0);
    expect(countDoneTasks("bad")).toBe(0);
  });

  it("TASKS-2: returns 0 for registry default empty object ({})", () => {
    expect(countDoneTasks({})).toBe(0);
  });

  it("TASKS-3: counts done cards across all buckets", () => {
    const store = {
      overdue: { tasks: [{ done: true }, { done: false }, { done: true }] },
      next7:   { tasks: [{ done: true }] },
      later:   { tasks: [] },
      nodate:  { tasks: [{ done: false }] },
    };
    expect(countDoneTasks(store)).toBe(3);
  });

  it("TASKS-4: absent done treated as false (AC-RD-TASKS-4)", () => {
    const store = {
      next7: { tasks: [{ /* no done */ }, { done: true }] },
    };
    expect(countDoneTasks(store)).toBe(1);
  });

  it("TASKS-5: reads from col.tasks (NOT from col directly — RD2 guard)", () => {
    // Confirms we read `col.tasks`, not `Object.values(col)` directly
    const store = {
      overdue: { tasks: [{ done: true }] },
    };
    expect(countDoneTasks(store)).toBe(1);
  });

  it("TASKS-6: also counts done in optional col.completed array", () => {
    const store = {
      overdue: {
        tasks: [{ done: true }],
        completed: [{ done: true }, { done: false }],
      },
    };
    expect(countDoneTasks(store)).toBe(2);
  });

  it("TASKS-7: returns 0 when all tasks are undone", () => {
    const store = {
      next7:  { tasks: [{ done: false }, {}] },
      later:  { tasks: [{}] },
      nodate: { tasks: [] },
    };
    expect(countDoneTasks(store)).toBe(0);
  });
});

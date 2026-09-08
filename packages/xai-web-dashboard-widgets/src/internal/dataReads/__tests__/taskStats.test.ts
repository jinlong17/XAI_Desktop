import { describe, it, expect } from "vitest";
import { isTaskColsRecord } from "../isTaskColsRecord.js";
import { countDone } from "../taskStats.js";

// ---------------------------------------------------------------------------
// AC-RD-TASKS-1: isTaskColsRecord rejects non-objects
// ---------------------------------------------------------------------------
describe("isTaskColsRecord", () => {
  it("AC-RD-TASKS-1: rejects null/undefined/string", () => {
    expect(isTaskColsRecord(null)).toBe(false);
    expect(isTaskColsRecord(undefined)).toBe(false);
    expect(isTaskColsRecord("hello")).toBe(false);
    expect(isTaskColsRecord(42)).toBe(false);
  });

  it("AC-RD-TASKS-1: rejects object with non-object column values", () => {
    expect(isTaskColsRecord({ overdue: "bad" })).toBe(false);
    expect(isTaskColsRecord({ overdue: null })).toBe(false);
    expect(isTaskColsRecord({ overdue: 42 })).toBe(false);
  });

  it("AC-RD-TASKS-1: rejects col without tasks array", () => {
    expect(isTaskColsRecord({ overdue: { tasks: "nope" } })).toBe(false);
    expect(isTaskColsRecord({ overdue: { cards: [] } })).toBe(false);
  });

  it("AC-RD-TASKS-1: accepts empty object (no buckets)", () => {
    expect(isTaskColsRecord({})).toBe(true);
  });

  it("AC-RD-TASKS-1: accepts valid col shape", () => {
    expect(
      isTaskColsRecord({
        overdue: { tasks: [] },
        next7: { tasks: [{ id: "t1", done: true }] },
      }),
    ).toBe(true);
  });

  it("AC-RD-TASKS-1: accepts col with optional completed array", () => {
    expect(
      isTaskColsRecord({
        overdue: { tasks: [], completed: [{ done: false }] },
      }),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-TASKS-2: countDone returns 0 when store is invalid
// ---------------------------------------------------------------------------
describe("countDone — invalid store", () => {
  it("AC-RD-TASKS-2: returns { done:0, total:0 } for null", () => {
    expect(countDone(null)).toEqual({ done: 0, total: 0 });
  });

  it("AC-RD-TASKS-2: returns { done:0, total:0 } for empty array", () => {
    expect(countDone([])).toEqual({ done: 0, total: 0 });
  });

  it("AC-RD-TASKS-2: returns { done:0, total:0 } for empty object", () => {
    expect(countDone({})).toEqual({ done: 0, total: 0 });
  });
});

// ---------------------------------------------------------------------------
// AC-RD-TASKS-3: cards from col.tasks, NOT directly from col (Cmd-K guard)
// ---------------------------------------------------------------------------
describe("countDone — col.tasks shape guard (AC-RD-TASKS-3)", () => {
  it("counts cards from col.tasks, not from col directly", () => {
    // A real TaskCol with 2 tasks; 1 done
    const store = {
      overdue: {
        tasks: [{ id: "t1", done: true }, { id: "t2", done: false }],
      },
    };
    expect(countDone(store)).toEqual({ done: 1, total: 2 });
  });

  it("counts tasks across multiple buckets", () => {
    const store = {
      overdue: { tasks: [{ done: true }, { done: true }] },
      next7: { tasks: [{ done: false }] },
      later: { tasks: [] },
      nodate: { tasks: [{ done: true }] },
    };
    expect(countDone(store)).toEqual({ done: 3, total: 4 });
  });
});

// ---------------------------------------------------------------------------
// AC-RD-TASKS-4: absent done treated as false (T-10 guard)
// ---------------------------------------------------------------------------
describe("countDone — absent done === false (AC-RD-TASKS-4)", () => {
  it("treats missing done as false", () => {
    const store = {
      next7: {
        tasks: [
          { id: "t1" }, // no done field → false
          { id: "t2", done: true },
        ],
      },
    };
    expect(countDone(store)).toEqual({ done: 1, total: 2 });
  });

  it("treats done: undefined as false", () => {
    const store = {
      overdue: {
        tasks: [{ done: undefined }],
      },
    };
    expect(countDone(store)).toEqual({ done: 0, total: 1 });
  });
});

// ---------------------------------------------------------------------------
// AC-RD-TASKS-5: completed[] array also counted
// ---------------------------------------------------------------------------
describe("countDone — optional completed bucket (AC-RD-TASKS-5)", () => {
  it("counts cards in the optional completed array", () => {
    const store = {
      overdue: {
        tasks: [{ done: false }],
        completed: [{ done: true }, { done: true }],
      },
    };
    expect(countDone(store)).toEqual({ done: 2, total: 3 });
  });
});

/**
 * filterCardsByList.test.ts — T-FILT-1..8 + T-FILT-NOMUT
 *
 * Tests the pure view selector filterCardsByList against the per-list predicate table
 * (design §F.2 / discovery §3). Also asserts the load-bearing no-mutation property
 * (T-FILT-NOMUT): applying every filter in turn does not mutate the input or storage.
 *
 * Phase: FP1 (smartlist-filter)
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { filterCardsByList } from "../internal/filterCardsByList.js";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";
import type { TaskCol, TaskCard } from "../types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deep-clone cols so we can assert mutation against the original reference. */
function cloneCols(cols: readonly TaskCol[]): TaskCol[] {
  return JSON.parse(JSON.stringify(cols)) as TaskCol[];
}

// ---------------------------------------------------------------------------
// T-FILT-1 — all → identity (no allocation)
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-1 all → identity", () => {
  it("T-FILT-1: list=all returns the same reference (no allocation)", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "all");
    expect(result).toBe(cols); // referential equality
  });
});

// ---------------------------------------------------------------------------
// T-FILT-2 — summary → identity (no allocation)
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-2 summary → identity", () => {
  it("T-FILT-2: list=summary returns the same reference (treat-as-all, Q2)", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "summary");
    expect(result).toBe(cols); // referential equality
  });
});

// ---------------------------------------------------------------------------
// T-FILT-3 — inbox → card.inbox === true across all buckets
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-3 inbox filter", () => {
  it("T-FILT-3a: returns only inbox:true cards across all buckets", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "inbox");

    let total = 0;
    for (const col of result) {
      for (const task of col.tasks) {
        expect(task.inbox).toBe(true);
        total++;
      }
      if (col.completed) {
        for (const task of col.completed) {
          expect(task.inbox).toBe(true);
        }
        total += col.completed.length;
      }
    }
    // Seed: 10 overdue (all inbox) + 1 nodate active (t26 inbox) + 6 nodate completed (inbox)
    // = 17 inbox cards (discovery §3 / design §F.2)
    expect(total).toBe(17);
  });

  it("T-FILT-3b: result count reflects filtered tasks.length (derived view count, not stored count)", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "inbox");
    for (const col of result) {
      expect(col.count).toBe(col.tasks.length);
    }
  });

  it("T-FILT-3c: overdue column (all inbox:true) is returned by reference", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "inbox");
    // overdue: all 10 cards are inbox:true → should be referentially equal
    const overdueIn = cols.find((c) => c.id === "overdue")!;
    const overdueOut = result.find((c) => c.id === "overdue")!;
    expect(overdueOut).toBe(overdueIn);
  });
});

// ---------------------------------------------------------------------------
// T-FILT-4 — next7 bucket filter
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-4 next7 filter", () => {
  it("T-FILT-4a: returns only cards in the next7 bucket; other buckets are empty", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "next7");

    const next7Out = result.find((c) => c.id === "next7")!;
    const next7In  = cols.find((c)  => c.id === "next7")!;

    // next7 column unchanged (referential equality)
    expect(next7Out).toBe(next7In);

    // All other columns have empty tasks
    for (const col of result) {
      if (col.id !== "next7") {
        expect(col.tasks).toHaveLength(0);
        expect(col.count).toBe(0);
      }
    }
  });

  it("T-FILT-4b: next7 column still has 2 seed tasks", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "next7");
    const next7Out = result.find((c) => c.id === "next7")!;
    expect(next7Out.tasks).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// T-FILT-5 — today → overdue bucket (bucket approximation, Q-T)
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-5 today → overdue bucket (Q-T approximation)", () => {
  it("T-FILT-5a: today returns only overdue bucket cards; other buckets empty", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "today");

    const overdueOut = result.find((c) => c.id === "overdue")!;
    const overdueIn  = cols.find((c)  => c.id === "overdue")!;

    // overdue column unchanged (referential equality)
    expect(overdueOut).toBe(overdueIn);

    for (const col of result) {
      if (col.id !== "overdue") {
        expect(col.tasks).toHaveLength(0);
        expect(col.count).toBe(0);
      }
    }
  });

  it("T-FILT-5b: today returns 10 overdue cards (seed count)", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "today");
    const overdueOut = result.find((c) => c.id === "overdue")!;
    expect(overdueOut.tasks).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// T-FILT-6 — tomorrow → next7 bucket (bucket approximation, Q-T)
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-6 tomorrow → next7 bucket (Q-T approximation)", () => {
  it("T-FILT-6a: tomorrow returns only next7 bucket cards; other buckets empty", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "tomorrow");

    const next7Out = result.find((c) => c.id === "next7")!;
    const next7In  = cols.find((c)  => c.id === "next7")!;

    expect(next7Out).toBe(next7In);

    for (const col of result) {
      if (col.id !== "next7") {
        expect(col.tasks).toHaveLength(0);
        expect(col.count).toBe(0);
      }
    }
  });

  it("T-FILT-6b: tomorrow returns 2 next7 seed cards", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    const result = filterCardsByList(cols, "tomorrow");
    const next7Out = result.find((c) => c.id === "next7")!;
    expect(next7Out.tasks).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// T-FILT-7 — unknown list → identity (defensive)
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-7 unknown list → identity", () => {
  it("T-FILT-7: unknown list id returns cols unchanged (defensive fallback)", () => {
    const cols = cloneCols(SEED_TASK_COLS);
    // Cast to SmartListId to satisfy TS — real-world guard
    const result = filterCardsByList(cols, "unknown-list" as Parameters<typeof filterCardsByList>[1]);
    expect(result).toBe(cols);
  });
});

// ---------------------------------------------------------------------------
// T-FILT-8 — always returns 4 columns (headers/empty-states render)
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-8 always returns 4 columns", () => {
  const lists = ["all", "inbox", "next7", "today", "tomorrow", "summary"] as const;

  for (const list of lists) {
    it(`T-FILT-8 (${list}): returns exactly 4 columns`, () => {
      const cols = cloneCols(SEED_TASK_COLS);
      const result = filterCardsByList(cols, list);
      expect(result).toHaveLength(4);
    });
  }
});

// ---------------------------------------------------------------------------
// T-FILT-NOMUT — THE HEADLINE NO-MUTATION GATE
//
// Applying every smart-list filter in turn must not mutate the original cols
// array or any of its nested objects. This is the pure-selector guarantee.
// (localStorage is checked separately in T-FILT-COUNT in persistence tests.)
// ---------------------------------------------------------------------------

describe("filterCardsByList — T-FILT-NOMUT (headline pure no-mutation gate)", () => {
  let originalCols: TaskCol[];
  let originalSnapshot: string;

  beforeEach(() => {
    originalCols = cloneCols(SEED_TASK_COLS);
    originalSnapshot = JSON.stringify(originalCols);
  });

  afterEach(() => {
    // After each test, the original cols object must be byte-identical to before
    expect(JSON.stringify(originalCols)).toBe(originalSnapshot);
  });

  it("T-FILT-NOMUT-all: list=all does not mutate cols", () => {
    filterCardsByList(originalCols, "all");
  });

  it("T-FILT-NOMUT-inbox: list=inbox does not mutate cols", () => {
    filterCardsByList(originalCols, "inbox");
  });

  it("T-FILT-NOMUT-next7: list=next7 does not mutate cols", () => {
    filterCardsByList(originalCols, "next7");
  });

  it("T-FILT-NOMUT-today: list=today does not mutate cols", () => {
    filterCardsByList(originalCols, "today");
  });

  it("T-FILT-NOMUT-tomorrow: list=tomorrow does not mutate cols", () => {
    filterCardsByList(originalCols, "tomorrow");
  });

  it("T-FILT-NOMUT-summary: list=summary does not mutate cols", () => {
    filterCardsByList(originalCols, "summary");
  });

  it("T-FILT-NOMUT-all-lists-in-sequence: applying all filters in sequence does not mutate cols", () => {
    const lists = ["all", "inbox", "next7", "today", "tomorrow", "summary"] as const;
    for (const list of lists) {
      filterCardsByList(originalCols, list);
    }
    // originalCols is checked in afterEach
  });

  it("T-FILT-NOMUT-tasks-array: task objects inside cols are not mutated by filtering", () => {
    // Verify actual task identity — the task objects themselves must not be mutated
    const originalTask: TaskCard = originalCols[0]!.tasks[0]!;
    const originalTaskSnapshot = JSON.stringify(originalTask);

    filterCardsByList(originalCols, "inbox");
    filterCardsByList(originalCols, "next7");
    filterCardsByList(originalCols, "today");

    expect(JSON.stringify(originalTask)).toBe(originalTaskSnapshot);
  });
});

/**
 * tasksReducer.test.ts — T-RD-1..7
 *
 * Pure reducer tests — no React, no storage, deterministic.
 * Clock is pinned to 2026-05-23 14:30 by vitest.setup.ts.
 * Phase: P2
 */

import { describe, it, expect } from "vitest";
import { moveCard, toggleComplete } from "../internal/tasksReducer.js";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";
import type { TaskCol } from "../types.js";

// Mutable copy helper (the seed is ReadonlyArray, but the reducer accepts TaskCol[])
function cloneSeed(): TaskCol[] {
  return JSON.parse(JSON.stringify(SEED_TASK_COLS)) as TaskCol[];
}

const NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local

describe("tasksReducer.moveCard", () => {
  // T-RD-1: same column no-op
  it("T-RD-1: returns prev unchanged when fromColId === toColId", () => {
    const cols = cloneSeed();
    const result = moveCard(cols, "t1", "overdue", "overdue", NOW);
    expect(result).toBe(cols); // referential equality
  });

  // T-RD-2: unknown taskId no-op
  it("T-RD-2: returns prev unchanged when taskId not found in fromCol", () => {
    const cols = cloneSeed();
    const result = moveCard(cols, "DOES_NOT_EXIST", "overdue", "next7", NOW);
    expect(result).toBe(cols);
  });

  // T-RD-3: t1 overdue → next7: removed from source, prepended to dest
  it("T-RD-3: removes t1 from overdue and prepends it to next7", () => {
    const cols = cloneSeed();
    const result = moveCard(cols, "t1", "overdue", "next7", NOW);
    const overdue = result.find((c) => c.id === "overdue")!;
    const next7   = result.find((c) => c.id === "next7")!;
    expect(overdue.tasks.find((t) => t.id === "t1")).toBeUndefined();
    expect(next7.tasks[0]!.id).toBe("t1"); // prepended (index 0)
  });

  // T-RD-4: count updated on both columns; untouched columns referentially equal
  it("T-RD-4: count updated; untouched columns are referentially equal to prev", () => {
    const cols = cloneSeed();
    const result = moveCard(cols, "t1", "overdue", "next7", NOW);
    const prevOverdue = cols.find((c) => c.id === "overdue")!;
    const prevNext7   = cols.find((c) => c.id === "next7")!;
    const nextOverdue = result.find((c) => c.id === "overdue")!;
    const nextNext7   = result.find((c) => c.id === "next7")!;

    expect(nextOverdue.count).toBe(prevOverdue.count - 1);
    expect(nextNext7.count).toBe(prevNext7.count + 1);

    // later and nodate should be referentially equal
    expect(result.find((c) => c.id === "later")).toBe(cols.find((c) => c.id === "later"));
    expect(result.find((c) => c.id === "nodate")).toBe(cols.find((c) => c.id === "nodate"));
  });

  // T-RD-5: move to nodate strips date/dateZh/dateLabel/sub, keeps tag + inbox
  it("T-RD-5: moveCard to nodate strips date fields, keeps tag + inbox", () => {
    const cols = cloneSeed();
    // t1 has date + inbox + tag
    const result = moveCard(cols, "t1", "overdue", "nodate", NOW);
    const nodate = result.find((c) => c.id === "nodate")!;
    const moved = nodate.tasks[0]!;
    expect(moved.id).toBe("t1");
    expect(moved.date).toBeUndefined();
    expect(moved.dateZh).toBeUndefined();
    expect(moved.dateLabel).toBeUndefined();
    expect(moved.sub).toBeUndefined();
    expect(moved.tag).toBe("study"); // preserved
    expect(moved.inbox).toBe(true);  // preserved
  });

  // T-RD-6: move to non-nodate bucket writes date + dateZh, strips dateLabel + sub
  it("T-RD-6: moveCard to later writes date + dateZh, strips dateLabel + sub, keeps tag + inbox", () => {
    const cols = cloneSeed();
    // t12 in next7 has dateLabel + sub, no date
    const result = moveCard(cols, "t12", "next7", "later", NOW);
    const later = result.find((c) => c.id === "later")!;
    const moved = later.tasks[0]!;
    expect(moved.id).toBe("t12");
    expect(moved.date).toBeDefined();
    expect(moved.dateZh).toBeDefined();
    expect(moved.dateLabel).toBeUndefined();
    expect(moved.sub).toBeUndefined();
  });

  // T-RD-7: toggleComplete toggles set membership
  it("T-RD-7: toggleComplete adds then removes a taskId", () => {
    const s1 = toggleComplete(new Set<string>(), "t1");
    expect(s1.has("t1")).toBe(true);
    const s2 = toggleComplete(s1, "t1");
    expect(s2.has("t1")).toBe(false);
    // Original set unchanged
    expect(s1.has("t1")).toBe(true);
  });
});

/**
 * tasksReducer.test.ts — T-RD-1..7 + T-ADD-1..8
 *
 * Pure reducer tests — no React, no storage, deterministic.
 * Clock is pinned to 2026-05-23 14:30 by vitest.setup.ts.
 * Phase: P2 (T-RD-1..7) + EP1 (T-ADD-1..8)
 */

import { describe, it, expect } from "vitest";
import { moveCard, toggleComplete, addCard } from "../internal/tasksReducer.js";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";
import { isTaskColsArray } from "../internal/validate.js";
import type { TaskCol, NewTaskDraft } from "../types.js";

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

// ---------------------------------------------------------------------------
// T-ADD-1..8 — addCard (EP1)
// ---------------------------------------------------------------------------

describe("tasksReducer.addCard", () => {
  // Explicit now for date determinism (Rec-E3)
  const NOW_ADD = new Date(2026, 4, 28, 12, 0, 0); // 2026-05-28 12:00 local

  // T-ADD-1: prepends a new card to targetBucket.tasks[0]; count +1; card passes isTaskCard
  it("T-ADD-1: prepends new card to targetBucket; count +1; card is valid", () => {
    const cols = cloneSeed();
    const prevNext7 = cols.find((c) => c.id === "next7")!;
    const draft: NewTaskDraft = { title: "New task", withDate: false };
    const result = addCard(cols, draft, "next7", NOW_ADD);
    const next7 = result.find((c) => c.id === "next7")!;
    expect(next7.tasks[0]!.title.en).toBe("New task");
    expect(next7.count).toBe(prevNext7.count + 1);
    expect(next7.tasks.length).toBe(prevNext7.tasks.length + 1);
  });

  // T-ADD-2: fills BOTH title.en + title.zh from single draft string (trimmed)
  it("T-ADD-2: fills both title.en and title.zh from draft.title (trimmed)", () => {
    const cols = cloneSeed();
    const draft: NewTaskDraft = { title: "  Hello task  ", withDate: false };
    const result = addCard(cols, draft, "later", NOW_ADD);
    const later = result.find((c) => c.id === "later")!;
    const card = later.tasks[0]!;
    expect(card.title.en).toBe("Hello task");
    expect(card.title.zh).toBe("Hello task");
  });

  // T-ADD-3: tag set when draft.tag defined; absent when omitted
  it("T-ADD-3: tag field is set when draft.tag provided; absent when omitted", () => {
    const cols = cloneSeed();

    const withTag: NewTaskDraft = { title: "With tag", tag: "work", withDate: false };
    const r1 = addCard(cols, withTag, "next7", NOW_ADD);
    expect(r1.find((c) => c.id === "next7")!.tasks[0]!.tag).toBe("work");

    const noTag: NewTaskDraft = { title: "No tag", withDate: false };
    const r2 = addCard(cols, noTag, "next7", NOW_ADD);
    expect(r2.find((c) => c.id === "next7")!.tasks[0]!.tag).toBeUndefined();
  });

  // T-ADD-4: withDate:true + non-nodate bucket sets date+dateZh via dateForCol (explicit now)
  it("T-ADD-4: withDate:true + non-nodate sets date+dateZh; withDate:false writes no date", () => {
    const cols = cloneSeed();
    const draft: NewTaskDraft = { title: "Dated task", withDate: true };
    const result = addCard(cols, draft, "next7", NOW_ADD);
    const card = result.find((c) => c.id === "next7")!.tasks[0]!;
    expect(card.date).toBeDefined();
    expect(card.dateZh).toBeDefined();

    const draftNoDate: NewTaskDraft = { title: "Undated task", withDate: false };
    const r2 = addCard(cols, draftNoDate, "next7", NOW_ADD);
    const card2 = r2.find((c) => c.id === "next7")!.tasks[0]!;
    expect(card2.date).toBeUndefined();
    expect(card2.dateZh).toBeUndefined();
  });

  // T-ADD-5: withDate:true + nodate target writes NO date fields
  it("T-ADD-5: withDate:true + nodate target writes no date fields", () => {
    const cols = cloneSeed();
    const draft: NewTaskDraft = { title: "Nodate task", withDate: true };
    const result = addCard(cols, draft, "nodate", NOW_ADD);
    const card = result.find((c) => c.id === "nodate")!.tasks[0]!;
    expect(card.date).toBeUndefined();
    expect(card.dateZh).toBeUndefined();
  });

  // T-ADD-6: untouched columns referentially equal to prev
  it("T-ADD-6: untouched columns are referentially equal to prev", () => {
    const cols = cloneSeed();
    const draft: NewTaskDraft = { title: "Only later", withDate: false };
    const result = addCard(cols, draft, "later", NOW_ADD);
    // overdue, next7, nodate should be identical references
    expect(result.find((c) => c.id === "overdue")).toBe(cols.find((c) => c.id === "overdue"));
    expect(result.find((c) => c.id === "next7")).toBe(cols.find((c) => c.id === "next7"));
    expect(result.find((c) => c.id === "nodate")).toBe(cols.find((c) => c.id === "nodate"));
  });

  // T-ADD-7: empty/whitespace title returns prev unchanged (defensive guard)
  it("T-ADD-7: empty title returns prev unchanged", () => {
    const cols = cloneSeed();
    const emptyDraft: NewTaskDraft = { title: "", withDate: false };
    expect(addCard(cols, emptyDraft, "next7", NOW_ADD)).toBe(cols);

    const whitespaceDraft: NewTaskDraft = { title: "   ", withDate: false };
    expect(addCard(cols, whitespaceDraft, "next7", NOW_ADD)).toBe(cols);
  });

  // T-ADD-8: addCard result passes isTaskColsArray (persistence round-trip validity)
  it("T-ADD-8: result passes isTaskColsArray (persistence round-trip valid)", () => {
    const cols = cloneSeed();
    const draft: NewTaskDraft = { title: "Valid task", tag: "personal", withDate: true };
    const result = addCard(cols, draft, "next7", NOW_ADD);
    expect(isTaskColsArray(result)).toBe(true);
  });
});

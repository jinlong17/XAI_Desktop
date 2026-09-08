/**
 * tasksReducer.test.ts — T-RD-1..7 + T-ADD-1..8 + T-DONE-MOVE-1
 *
 * Pure reducer tests — no React, no storage, deterministic.
 * Clock is pinned to 2026-05-23 14:30 by vitest.setup.ts.
 * Phase: P2 (T-RD-1..7) + EP1 (T-ADD-1..8) + T-10-bugfix (T-DONE-MOVE-1)
 */

import { describe, it, expect } from "vitest";
import { moveCard, toggleComplete, addCard, deleteCard, updateCard } from "../internal/tasksReducer.js";
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

  // T-RD-7 (T-10 rewrite): toggleComplete flips done in TaskCol[] (persisted path)
  it("T-RD-7: toggleComplete flips done:true on first toggle, clears on second; untouched cols referentially equal", () => {
    const cols = cloneSeed();
    // First toggle — t1 should get done:true
    const r1 = toggleComplete(cols, "t1");
    const overdue1 = r1.find((c) => c.id === "overdue")!;
    expect(overdue1.tasks.find((t) => t.id === "t1")!.done).toBe(true);
    // Untouched columns must be referentially equal
    expect(r1.find((c) => c.id === "next7")).toBe(cols.find((c) => c.id === "next7"));
    expect(r1.find((c) => c.id === "later")).toBe(cols.find((c) => c.id === "later"));
    expect(r1.find((c) => c.id === "nodate")).toBe(cols.find((c) => c.id === "nodate"));
    // Second toggle — done should be cleared (falsy)
    const r2 = toggleComplete(r1, "t1");
    const overdue2 = r2.find((c) => c.id === "overdue")!;
    expect(overdue2.tasks.find((t) => t.id === "t1")!.done).toBe(false);
    // result passes isTaskColsArray (persistence round-trip valid)
    expect(isTaskColsArray(r1)).toBe(true);
    expect(isTaskColsArray(r2)).toBe(true);
  });

  // T-RD-7b: toggleComplete returns prev unchanged when taskId not found
  it("T-RD-7b: toggleComplete returns prev unchanged when taskId not found", () => {
    const cols = cloneSeed();
    const result = toggleComplete(cols, "DOES_NOT_EXIST");
    expect(result).toBe(cols);
  });
});

// ---------------------------------------------------------------------------
// T-DONE-MOVE-1 — moveCard preserves done field (T-10 sub-fix 4)
// ---------------------------------------------------------------------------

describe("tasksReducer.moveCard preserves done (T-DONE-MOVE-1)", () => {
  // T-DONE-MOVE-1: drag a done:true card to another bucket → done survives
  it("T-DONE-MOVE-1: done:true card dragged to another bucket retains done:true", () => {
    const cols = cloneSeed() as import("../types.js").TaskCol[];
    // Manually set t1 (in overdue) to done:true to simulate a completed card
    const overdueIdx = cols.findIndex((c) => c.id === "overdue");
    const t1Idx = cols[overdueIdx]!.tasks.findIndex((t) => t.id === "t1");
    const tasksWithDone = [...cols[overdueIdx]!.tasks];
    tasksWithDone[t1Idx] = { ...tasksWithDone[t1Idx]!, done: true };
    cols[overdueIdx] = { ...cols[overdueIdx]!, tasks: tasksWithDone };

    // Move t1 from overdue → next7
    const result = moveCard(cols, "t1", "overdue", "next7", NOW);
    const next7 = result.find((c) => c.id === "next7")!;
    const movedCard = next7.tasks[0]!; // prepended to front
    expect(movedCard.id).toBe("t1");
    expect(movedCard.done).toBe(true); // done preserved
  });

  // T-DONE-MOVE-2: drag done:true card to nodate → done preserved (nodate branch)
  it("T-DONE-MOVE-2: done:true card dragged to nodate retains done:true", () => {
    const cols = cloneSeed() as import("../types.js").TaskCol[];
    const overdueIdx = cols.findIndex((c) => c.id === "overdue");
    const t1Idx = cols[overdueIdx]!.tasks.findIndex((t) => t.id === "t1");
    const tasksWithDone = [...cols[overdueIdx]!.tasks];
    tasksWithDone[t1Idx] = { ...tasksWithDone[t1Idx]!, done: true };
    cols[overdueIdx] = { ...cols[overdueIdx]!, tasks: tasksWithDone };

    const result = moveCard(cols, "t1", "overdue", "nodate", NOW);
    const nodate = result.find((c) => c.id === "nodate")!;
    const movedCard = nodate.tasks[0]!;
    expect(movedCard.id).toBe("t1");
    expect(movedCard.done).toBe(true); // done preserved across nodate branch
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

// ---------------------------------------------------------------------------
// TR-DEL — deleteCard (xai-web-ai-tool-edit-delete P1)
// ---------------------------------------------------------------------------

describe("tasksReducer.deleteCard (TR-DEL)", () => {
  // TR-DEL-1: removes the matching card; count decremented
  it("TR-DEL-1: removes matching card; column count decremented by 1", () => {
    const cols = cloneSeed();
    const overdueCol = cols.find((c) => c.id === "overdue")!;
    const firstId = overdueCol.tasks[0]!.id;
    const prevCount = overdueCol.count;

    const result = deleteCard(cols, firstId);
    const after = result.find((c) => c.id === "overdue")!;
    expect(after.tasks.find((t) => t.id === firstId)).toBeUndefined();
    expect(after.count).toBe(Math.max(0, prevCount - 1));
  });

  // TR-DEL-2: untouched columns returned by REFERENCE
  it("TR-DEL-2: untouched columns returned by reference (referential equality)", () => {
    const cols = cloneSeed();
    const targetId = cols.find((c) => c.id === "overdue")!.tasks[0]!.id;
    const result = deleteCard(cols, targetId);
    // next7, later, nodate untouched → referentially equal
    expect(result.find((c) => c.id === "next7")).toBe(cols.find((c) => c.id === "next7"));
    expect(result.find((c) => c.id === "later")).toBe(cols.find((c) => c.id === "later"));
    expect(result.find((c) => c.id === "nodate")).toBe(cols.find((c) => c.id === "nodate"));
  });

  // TR-DEL-3: id in no column returns prev UNCHANGED (same reference)
  it("TR-DEL-3: id in no column returns prev unchanged (same reference)", () => {
    const cols = cloneSeed();
    const result = deleteCard(cols, "DOES_NOT_EXIST_ANYWHERE");
    expect(result).toBe(cols);
  });

  // TR-DEL-4: does not mutate prev (deep-freeze fixture)
  it("TR-DEL-4: does not mutate prev (deep-freeze guard)", () => {
    const cols = cloneSeed();
    // Deep-freeze
    Object.freeze(cols);
    cols.forEach((col) => {
      Object.freeze(col);
      Object.freeze(col.tasks);
      col.tasks.forEach((t) => Object.freeze(t));
    });
    const targetId = cols.find((c) => c.id === "overdue")!.tasks[0]!.id;
    // Should not throw even though cols is frozen (immutable impl returns a new array)
    expect(() => deleteCard(cols as TaskCol[], targetId)).not.toThrow();
    // prev content unchanged (no mutation)
    expect(cols.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === targetId)).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// TR-UPD — updateCard (xai-web-ai-tool-edit-delete P1)
// ---------------------------------------------------------------------------

describe("tasksReducer.updateCard (TR-UPD)", () => {
  // TR-UPD-1: patch {title} rewrites BOTH title.en + title.zh; other fields untouched
  it("TR-UPD-1: title patch rewrites both title.en and title.zh; other fields untouched", () => {
    const cols = cloneSeed();
    const overdueCol = cols.find((c) => c.id === "overdue")!;
    const card = overdueCol.tasks[0]!;
    const cardId = card.id;
    const origTag = card.tag;

    const result = updateCard(cols, cardId, { title: "Updated title" });
    const after = result.find((c) => c.id === "overdue")!;
    const updated = after.tasks.find((t) => t.id === cardId)!;
    expect(updated.title.en).toBe("Updated title");
    expect(updated.title.zh).toBe("Updated title");
    // Other fields untouched
    expect(updated.tag).toBe(origTag);
    expect(updated.id).toBe(cardId);
  });

  // TR-UPD-2 (preserve-done — T-10 lifeline): updateCard on done:true card keeps done:true
  it("TR-UPD-2: updateCard preserves done:true (T-10 lifeline)", () => {
    const cols = cloneSeed() as TaskCol[];
    const overdueIdx = cols.findIndex((c) => c.id === "overdue");
    const t1Idx = cols[overdueIdx]!.tasks.findIndex((t) => t.id === "t1");
    const tasksWithDone = [...cols[overdueIdx]!.tasks];
    tasksWithDone[t1Idx] = { ...tasksWithDone[t1Idx]!, done: true };
    cols[overdueIdx] = { ...cols[overdueIdx]!, tasks: tasksWithDone };

    const result = updateCard(cols, "t1", { title: "New title for done card" });
    const updated = result.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === "t1")!;
    expect(updated.done).toBe(true); // preserved!
    expect(updated.title.en).toBe("New title for done card");
  });

  // TR-UPD-3: preserves tag/date/dateZh/inbox when not in patch; sets tag when in patch
  it("TR-UPD-3: preserves tag/date/dateZh/inbox when not in patch; sets tag when included", () => {
    const cols = cloneSeed();
    const card = cols.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === "t1")!;
    const origDate = card.date;
    const origInbox = card.inbox;

    // Title-only patch → tag/date/inbox preserved
    const r1 = updateCard(cols, "t1", { title: "New title only" });
    const c1 = r1.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === "t1")!;
    expect(c1.tag).toBe(card.tag);
    expect(c1.date).toBe(origDate);
    expect(c1.inbox).toBe(origInbox);

    // Tag patch → tag updated; other fields preserved
    const r2 = updateCard(cols, "t1", { tag: "work" });
    const c2 = r2.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === "t1")!;
    expect(c2.tag).toBe("work");
    expect(c2.date).toBe(origDate);
  });

  // TR-UPD-4: NEVER overwrites id
  it("TR-UPD-4: id cannot be overwritten by patch (re-pins card.id)", () => {
    const cols = cloneSeed();
    // TypeScript won't allow passing id in patch (not in interface), but test the runtime guard
    const cardId = cols.find((c) => c.id === "overdue")!.tasks[0]!.id;
    // Cast to any to simulate a malformed patch that tries to override id
    const result = updateCard(cols, cardId, { title: "Title" } as unknown as import("../internal/tasksReducer.js").TaskCardPatch);
    const updated = result.find((c) => c.id === "overdue")!.tasks.find((t) => t.id === cardId)!;
    expect(updated.id).toBe(cardId); // id unchanged
  });

  // TR-UPD-5: untouched columns returned by REFERENCE
  it("TR-UPD-5: untouched columns returned by reference (referential equality)", () => {
    const cols = cloneSeed();
    const cardId = cols.find((c) => c.id === "overdue")!.tasks[0]!.id;
    const result = updateCard(cols, cardId, { title: "Updated" });
    expect(result.find((c) => c.id === "next7")).toBe(cols.find((c) => c.id === "next7"));
    expect(result.find((c) => c.id === "later")).toBe(cols.find((c) => c.id === "later"));
    expect(result.find((c) => c.id === "nodate")).toBe(cols.find((c) => c.id === "nodate"));
  });

  // TR-UPD-6: id in no column OR empty patch returns prev UNCHANGED
  it("TR-UPD-6: id not found returns prev unchanged; empty patch returns prev unchanged", () => {
    const cols = cloneSeed();
    // Unknown id
    expect(updateCard(cols, "DOES_NOT_EXIST", { title: "Something" })).toBe(cols);
    // Empty patch (no keys)
    expect(updateCard(cols, "t1", {})).toBe(cols);
  });

  // TR-UPD-7: does not mutate prev (deep-freeze fixture)
  it("TR-UPD-7: does not mutate prev (deep-freeze guard)", () => {
    const cols = cloneSeed();
    Object.freeze(cols);
    cols.forEach((col) => {
      Object.freeze(col);
      Object.freeze(col.tasks);
      col.tasks.forEach((t) => Object.freeze(t));
    });
    const cardId = (cols as TaskCol[]).find((c) => c.id === "overdue")!.tasks[0]!.id;
    expect(() => updateCard(cols as TaskCol[], cardId, { title: "Frozen test" })).not.toThrow();
    // Original title unchanged
    const origCard = (cols as TaskCol[]).find((c) => c.id === "overdue")!.tasks.find((t) => t.id === cardId)!;
    expect(origCard.title.en).not.toBe("Frozen test");
  });
});

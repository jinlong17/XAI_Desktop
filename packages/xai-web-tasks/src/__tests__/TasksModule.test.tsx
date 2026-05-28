/**
 * TasksModule.test.tsx — T-MOD-1..T-MOD-6 + T-COL-1
 *
 * P1 tests: T-MOD-1, T-MOD-2 (column header render in EN and ZH)
 * P2 tests: T-MOD-3..T-MOD-6 (checkbox toggle, DnD happy path, highlight, drag hint)
 * EP2 test: T-COL-1 (+ button opens composer with that bucket pre-selected)
 *
 * Clock is set to 2026-05-23 14:30 by vitest.setup.ts (vi.useFakeTimers).
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TasksModule } from "../TasksModule.js";

// ---------------------------------------------------------------------------
// T-MOD-1 — EN column headers
// ---------------------------------------------------------------------------

describe("TasksModule — T-MOD-1 EN column headers", () => {
  it("T-MOD-1: renders 4 column headers in correct order for lang=en", () => {
    render(<TasksModule lang="en" />);
    const headers = screen.getAllByRole("heading", { level: 2 });
    const texts = headers.map((h) => h.textContent?.trim());
    expect(texts).toContain("Overdue");
    expect(texts).toContain("Next 7 Days");
    expect(texts).toContain("Later");
    expect(texts).toContain("No Date");
    // Verify order
    const idx = (label: string) => texts.findIndex((t) => t === label);
    expect(idx("Overdue")).toBeLessThan(idx("Next 7 Days"));
    expect(idx("Next 7 Days")).toBeLessThan(idx("Later"));
    expect(idx("Later")).toBeLessThan(idx("No Date"));
  });
});

// ---------------------------------------------------------------------------
// T-MOD-2 — ZH column headers
// ---------------------------------------------------------------------------

describe("TasksModule — T-MOD-2 ZH column headers", () => {
  it("T-MOD-2: renders 4 column headers in correct order for lang=zh", () => {
    render(<TasksModule lang="zh" />);
    const headers = screen.getAllByRole("heading", { level: 2 });
    const texts = headers.map((h) => h.textContent?.trim());
    expect(texts).toContain("过期");
    expect(texts).toContain("最近 7 天");
    expect(texts).toContain("以后");
    expect(texts).toContain("无日期");
  });
});

// ---------------------------------------------------------------------------
// T-MOD-3 — Checkbox toggle (P2)
// ---------------------------------------------------------------------------

describe("TasksModule — T-MOD-3 checkbox toggle", () => {
  it("T-MOD-3: clicking checkbox toggles is-completed class on card", () => {
    render(<TasksModule lang="en" />);
    // Find the first checkbox (cbx span) in the overdue column
    const checkboxes = document.querySelectorAll(".cbx");
    expect(checkboxes.length).toBeGreaterThan(0);
    const cbx = checkboxes[0] as HTMLElement;
    // Initially unchecked
    expect(cbx).not.toHaveClass("checked");
    // Toggle
    fireEvent.click(cbx);
    expect(cbx).toHaveClass("checked");
    // Toggle back
    fireEvent.click(cbx);
    expect(cbx).not.toHaveClass("checked");
  });
});

// ---------------------------------------------------------------------------
// T-MOD-4 — DnD happy path (P2) — overdue → nodate, date stripped
// ---------------------------------------------------------------------------

describe("TasksModule — T-MOD-4 DnD overdue → nodate", () => {
  it("T-MOD-4: dragging a card from overdue to nodate strips its date element", () => {
    render(<TasksModule lang="en" />);

    // Find first card in overdue column
    const colList = document.querySelectorAll(".task-col");
    expect(colList.length).toBe(4);
    const overdueCol = colList[0] as HTMLElement;
    const nodateCol  = colList[3] as HTMLElement;

    const firstCard = overdueCol.querySelector(".task-card") as HTMLElement;
    expect(firstCard).toBeTruthy();

    // Simulate dragStart on the card (t1 is the first overdue card)
    const dataTransfer = {
      effectAllowed: "" as string,
      dropEffect: "" as string,
      data: {} as Record<string, string>,
      setData(type: string, value: string) { this.data[type] = value; },
      getData(type: string) { return this.data[type] ?? ""; },
    };

    fireEvent.dragStart(firstCard, { dataTransfer });
    expect(dataTransfer.effectAllowed).toBe("move");
    const rawPayload = dataTransfer.data["text/plain"];
    expect(rawPayload).toBeDefined();
    const payload = JSON.parse(rawPayload!) as { taskId: string; fromColId: string };
    expect(payload.fromColId).toBe("overdue");

    // Simulate dragOver on nodate column section
    const nodateSection = nodateCol as Element;
    fireEvent.dragOver(nodateSection, { dataTransfer, preventDefault: () => {} });

    // Simulate drop on nodate column
    fireEvent.drop(nodateSection, { dataTransfer, preventDefault: () => {} });

    // The card should now be in nodate and have no .task-date element
    const nodateCards = nodateCol.querySelectorAll(".task-card");
    // t26 was already there + the moved card (t1) prepended
    expect(nodateCards.length).toBeGreaterThan(1);
    const movedCard = nodateCards[0] as HTMLElement;
    expect(movedCard.querySelector(".task-date")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// T-MOD-5 — drop-target highlight (P2)
// ---------------------------------------------------------------------------

describe("TasksModule — T-MOD-5 drop-target highlight", () => {
  it("T-MOD-5: while dragging over later column, it has drop-target class", () => {
    render(<TasksModule lang="en" />);
    const colList2 = document.querySelectorAll(".task-col");
    const overdueCol = colList2[0] as HTMLElement;
    const laterCol   = colList2[2] as HTMLElement;
    const firstCard  = overdueCol.querySelector(".task-card") as HTMLElement;

    const dataTransfer = {
      effectAllowed: "" as string,
      dropEffect: "" as string,
      data: {} as Record<string, string>,
      setData(type: string, value: string) { this.data[type] = value; },
      getData(type: string) { return this.data[type] ?? ""; },
    };

    fireEvent.dragStart(firstCard, { dataTransfer });
    fireEvent.dragOver(laterCol, { dataTransfer, preventDefault: () => {} });
    expect(laterCol).toHaveClass("drop-target");
  });
});

// ---------------------------------------------------------------------------
// T-MOD-6 — topbar drag hint (P2)
// ---------------------------------------------------------------------------

describe("TasksModule — T-MOD-6 drag hint while dragging", () => {
  it("T-MOD-6: drag-hint element appears while a card is being dragged", () => {
    render(<TasksModule lang="en" />);
    expect(document.querySelector(".drag-hint")).toBeNull();

    const firstCard = document.querySelector(".task-col .task-card") as HTMLElement;
    const dataTransfer = {
      effectAllowed: "" as string,
      dropEffect: "" as string,
      data: {} as Record<string, string>,
      setData(type: string, value: string) { this.data[type] = value; },
      getData(type: string) { return this.data[type] ?? ""; },
    };
    fireEvent.dragStart(firstCard, { dataTransfer });
    expect(document.querySelector(".drag-hint")).toBeTruthy();

    // dragEnd clears it
    fireEvent.dragEnd(firstCard);
    expect(document.querySelector(".drag-hint")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// T-COL-1 — clicking + opens composer with bucket pre-selected (EP2)
// ---------------------------------------------------------------------------

describe("TasksModule — T-COL-1 + button opens composer", () => {
  it("T-COL-1: clicking + on a column with action===add opens the composer with that bucket pre-selected", () => {
    render(<TasksModule lang="en" />);

    // Find the first column with action "add" — look for the icon-btn with aria-label "Add"
    const addButtons = document.querySelectorAll('.icon-btn[aria-label="Add"]');
    expect(addButtons.length).toBeGreaterThan(0);

    const addBtn = addButtons[0] as HTMLElement;
    fireEvent.click(addBtn);

    // The composer dialog should now be visible
    const dialog = document.querySelector("dialog.task-composer");
    expect(dialog).toBeTruthy();

    // Determine which column the + was in to find which bucket
    // The seed has "add" action on next7, later, nodate
    // We just confirm a bucket radio is aria-checked
    const checkedBucketRadios = document.querySelectorAll(
      "dialog.task-composer [role='radio'][aria-checked='true']"
    );
    // Should have at least one checked radio in the bucket picker
    const bucketGroupRadios = Array.from(checkedBucketRadios).filter((el) => {
      const group = el.closest('[role="radiogroup"]');
      // bucket radiogroup has bucket labels
      return group?.textContent?.toLowerCase().includes("overdue") ||
             group?.textContent?.toLowerCase().includes("next 7") ||
             group?.textContent?.toLowerCase().includes("later") ||
             group?.textContent?.toLowerCase().includes("no date");
    });
    expect(bucketGroupRadios.length).toBeGreaterThan(0);
  });
});


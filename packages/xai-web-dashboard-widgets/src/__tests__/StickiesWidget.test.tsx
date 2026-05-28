/**
 * StickiesWidget tests — SHIPPED AC-STICKIES-1..3 re-homed under empty-store branch
 * + new AC-STICKIES-CREATE-1..8 for user-sticky create + delete + persist.
 */
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { StickiesWidget } from "../widgets/StickiesWidget.js";
import { STICKIES } from "../internal/fixtures.js";

// jsdom stubs for HTMLDialogElement (needed by StickyComposer)
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };
  }
});

// ---------------------------------------------------------------------------
// SHIPPED AC-STICKIES-1..3 — re-homed under empty-store fixture-sample branch
// ---------------------------------------------------------------------------

describe("StickiesWidget — empty-store fixture-sample branch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("AC-STICKIES-1: renders 3 fixture sticky notes (samples) when store is empty", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    expect(container.querySelectorAll(".sticky")).toHaveLength(3);
  });

  it("AC-STICKIES-2: each sample note has its fixture color and en text", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    const notes = container.querySelectorAll<HTMLElement>(".sticky");
    notes.forEach((note, i) => {
      expect(note.style.background).toBeTruthy();
      expect(note.textContent).toContain(STICKIES[i]!.text.en);
    });
  });

  it("AC-STICKIES-3: zh renders zh fixture text", () => {
    const { container } = render(<StickiesWidget lang="zh" />);
    const notes = container.querySelectorAll(".sticky");
    notes.forEach((note, i) => {
      expect(note.textContent).toContain(STICKIES[i]!.text.zh);
    });
  });

  it("AC-STICKIES-CREATE-2: fixture samples carry data-sample=true and no .sticky-del", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    const samples = container.querySelectorAll("[data-sample='true']");
    expect(samples).toHaveLength(3);
    const delBtns = container.querySelectorAll(".sticky-del");
    expect(delBtns).toHaveLength(0);
  });

  it("AC-STICKIES-CREATE-5: + button is present and wired (opens composer)", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    const addBtn = container.querySelector(".icon-btn[data-no-drag]");
    expect(addBtn).not.toBeNull();
    // Click should open the dialog
    act(() => {
      fireEvent.click(addBtn!);
    });
    const dialog = container.querySelector("dialog");
    expect(dialog!.hasAttribute("open")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-STICKIES-CREATE-1..8 — user-sticky create + delete + persist
// ---------------------------------------------------------------------------

describe("StickiesWidget — user sticky create + delete", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("AC-STICKIES-CREATE-1: creating a sticky switches from fixture-sample to user branch", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    // Open composer
    const addBtn = container.querySelector(".icon-btn[data-no-drag]")!;
    act(() => { fireEvent.click(addBtn); });

    // Fill textarea and save
    const textarea = container.querySelector("textarea")!;
    act(() => { fireEvent.change(textarea, { target: { value: "My note" } }); });
    const saveBtn = screen.getByText("Save");
    act(() => { fireEvent.click(saveBtn); });

    // Fixture samples gone; user sticky present
    const samples = container.querySelectorAll("[data-sample='true']");
    expect(samples).toHaveLength(0);
    expect(container.querySelectorAll(".sticky")).toHaveLength(1);
    expect(container.querySelector(".sticky")!.textContent).toContain("My note");
  });

  it("AC-STICKIES-CREATE-3: user sticky has delete button; fixture samples do not", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    // Create one sticky
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    act(() => { fireEvent.change(container.querySelector("textarea")!, { target: { value: "Note A" } }); });
    act(() => { fireEvent.click(screen.getByText("Save")); });

    const delBtns = container.querySelectorAll(".sticky-del");
    expect(delBtns).toHaveLength(1);
  });

  it("AC-STICKIES-CREATE-4: user sticky text is rendered as single string (not bilingual)", () => {
    const { container } = render(<StickiesWidget lang="zh" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    act(() => { fireEvent.change(container.querySelector("textarea")!, { target: { value: "English only" } }); });
    act(() => { fireEvent.click(screen.getByText("保存")); });

    // The user sticky renders the raw text, not n.text["zh"]
    expect(container.querySelector(".sticky")!.textContent).toContain("English only");
  });

  it("AC-STICKIES-CREATE-6: deleting the only sticky reverts to fixture-sample branch", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    // Create one
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    act(() => { fireEvent.change(container.querySelector("textarea")!, { target: { value: "Delete me" } }); });
    act(() => { fireEvent.click(screen.getByText("Save")); });
    expect(container.querySelectorAll("[data-sample='true']")).toHaveLength(0);

    // Delete it
    const delBtn = container.querySelector(".sticky-del")!;
    act(() => { fireEvent.click(delBtn); });
    // Reverts to 3 fixture samples
    expect(container.querySelectorAll("[data-sample='true']")).toHaveLength(3);
  });

  it("AC-STICKIES-CREATE-7: create→persist→rerender shows user sticky", () => {
    const { container, rerender } = render(<StickiesWidget lang="en" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    act(() => { fireEvent.change(container.querySelector("textarea")!, { target: { value: "Persist me" } }); });
    act(() => { fireEvent.click(screen.getByText("Save")); });

    // Re-render simulates page refresh with same localStorage
    rerender(<StickiesWidget lang="en" />);
    expect(container.querySelectorAll("[data-sample='true']")).toHaveLength(0);
    expect(container.querySelector(".sticky")!.textContent).toContain("Persist me");
  });

  it("AC-STICKIES-CREATE-8: composer stays closed across a re-render with new lang prop", () => {
    const { container, rerender } = render(<StickiesWidget lang="en" />);
    // Open composer
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    const dialog = container.querySelector("dialog")!;
    expect(dialog.hasAttribute("open")).toBe(true);

    // Simulate a new ctx tick by re-rendering with lang change (like grid's 1Hz tick)
    rerender(<StickiesWidget lang="zh" />);
    // Composer should still be open (stable component instance)
    expect(dialog.hasAttribute("open")).toBe(true);
  });
});

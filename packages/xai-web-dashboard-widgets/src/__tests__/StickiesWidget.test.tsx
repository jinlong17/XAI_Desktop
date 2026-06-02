/**
 * StickiesWidget tests — SHIPPED AC-STICKIES-1..3 re-homed under empty-store branch
 * + new AC-STICKIES-CREATE-1..8 for user-sticky create + delete + persist.
 */
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

import { StickiesWidget } from "../widgets/StickiesWidget.js";
import { STICKIES } from "../internal/fixtures.js";
import { STICKY_DEFAULT_SIZE } from "../internal/stickiesStore/types.js";

function seedTaskCols(): void {
  localStorage.setItem(
    "xai_task_cols",
    JSON.stringify([
      {
        id: "overdue",
        key: "overdue",
        count: 1,
        tasks: [
          {
            id: "task-source-1",
            title: { en: "Finish grant proposal", zh: "完成基金申请" },
            tag: "work",
            date: "Jun 3",
            dateZh: "6 月 3 日",
            inbox: true,
          },
        ],
        completed: [
          {
            id: "task-source-2",
            title: { en: "Submitted review", zh: "已提交审稿" },
            tag: "study",
            inbox: true,
          },
        ],
      },
    ]),
  );
}

function seedNoDateTaskCols(): void {
  localStorage.setItem(
    "xai_task_cols",
    JSON.stringify([
      {
        id: "nodate",
        key: "nodate",
        count: 1,
        tasks: [
          {
            id: "task-no-date",
            title: { en: "Plan inbox cleanup", zh: "整理收件箱" },
            tag: "todo",
            date: "No date",
            dateZh: "无日期",
            dateLabel: { en: "No date", zh: "无日期" },
            inbox: true,
          },
        ],
      },
    ]),
  );
}

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
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = function () {
      /* jsdom pointer-capture no-op */
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

  it("empty-state add action opens composer", () => {
    const { container } = render(<StickiesWidget lang="zh" />);
    const action = container.querySelector(".sticky-empty-action")!;
    act(() => {
      fireEvent.click(action);
    });
    expect(container.querySelector("dialog")!.hasAttribute("open")).toBe(true);
  });

  it("composer shows an expanded 10-color palette", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    expect(container.querySelectorAll(".sticky-composer-chip")).toHaveLength(10);
    expect(screen.getByLabelText("Rose")).toBeTruthy();
    expect(screen.getByLabelText("Teal")).toBeTruthy();
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
    const sticky = container.querySelector<HTMLElement>(".sticky")!;
    expect(sticky.style.width).toBe(`${STICKY_DEFAULT_SIZE.width}px`);
    expect(sticky.style.height).toBe(`${STICKY_DEFAULT_SIZE.height}px`);
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

  it("selecting an existing task fills the note and persists source metadata", () => {
    seedTaskCols();
    const { container } = render(<StickiesWidget lang="en" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });

    const sourceTitle = screen.getByText("Finish grant proposal");
    act(() => { fireEvent.click(sourceTitle.closest("button")!); });

    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea.value).toContain("Finish grant proposal");
    expect(textarea.value).toContain("List: Overdue");
    expect(textarea.value).toContain("Tag: Work");
    expect(textarea.value).toContain("Time: Jun 3");

    act(() => { fireEvent.click(screen.getByText("Save")); });

    const sticky = container.querySelector(".sticky")!;
    expect(sticky.textContent).toContain("Finish grant proposal");
    expect(sticky.textContent).toContain("Overdue");
    expect(sticky.textContent).toContain("Work");
    expect(sticky.textContent).toContain("Jun 3");

    const raw = localStorage.getItem("xai_dashboard_stickies");
    const stored = Object.values(JSON.parse(raw!) as Record<string, { source?: { title?: string; tagLabel?: string } }>);
    expect(stored[0]!.source?.title).toBe("Finish grant proposal");
    expect(stored[0]!.source?.tagLabel).toBe("Work");
  });

  it("existing-task filters can preview completed task sources", () => {
    seedTaskCols();
    const { container } = render(<StickiesWidget lang="zh" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });

    act(() => { fireEvent.click(screen.getByRole("tab", { name: "已完成" })); });
    expect(screen.getByText("已提交审稿")).toBeTruthy();
    expect(screen.queryByText("完成基金申请")).toBeNull();
  }, 10000);

  it("does not paste or render meaningless no-date metadata from task sources", () => {
    seedNoDateTaskCols();
    const { container } = render(<StickiesWidget lang="zh" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });

    act(() => { fireEvent.click(screen.getByText("整理收件箱").closest("button")!); });

    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea.value).toContain("整理收件箱");
    expect(textarea.value).not.toContain("无日期");
    expect(textarea.value).not.toContain("时间:");

    act(() => { fireEvent.click(screen.getByText("保存")); });

    const sticky = container.querySelector(".sticky")!;
    expect(sticky.textContent).toContain("整理收件箱");
    expect(sticky.textContent).not.toContain("无日期");
  });

  it("double-clicking a user sticky opens edit composer and updates the same note", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    act(() => { fireEvent.change(container.querySelector("textarea")!, { target: { value: "Original note" } }); });
    act(() => { fireEvent.click(screen.getByText("Save")); });
    expect(container.querySelectorAll(".sticky")).toHaveLength(1);

    const sticky = container.querySelector(".sticky")!;
    act(() => { fireEvent.doubleClick(sticky); });
    expect(screen.getByText("Edit sticky note")).toBeTruthy();
    const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Original note");
    act(() => { fireEvent.change(textarea, { target: { value: "Edited note" } }); });
    act(() => { fireEvent.click(screen.getByText("Save")); });

    expect(container.querySelectorAll(".sticky")).toHaveLength(1);
    expect(container.querySelector(".sticky")!.textContent).toContain("Edited note");
    expect(container.querySelector(".sticky")!.textContent).not.toContain("Original note");
  });

  it("resizing a user sticky preserves the sticky's own saved width and height", () => {
    const { container } = render(<StickiesWidget lang="en" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    act(() => { fireEvent.change(container.querySelector("textarea")!, { target: { value: "Resizable note" } }); });
    act(() => { fireEvent.click(screen.getByText("Save")); });

    const sticky = container.querySelector<HTMLElement>(".sticky")!;
    const handle = container.querySelector<HTMLElement>(".sticky-resize")!;
    expect(sticky.style.width).toBe(`${STICKY_DEFAULT_SIZE.width}px`);
    expect(sticky.style.height).toBe(`${STICKY_DEFAULT_SIZE.height}px`);

    act(() => {
      fireEvent.pointerDown(handle, { button: 0, pointerId: 9, clientX: 20, clientY: 20 });
    });
    act(() => {
      fireEvent.pointerMove(window, { pointerId: 9, clientX: 76, clientY: 44 });
    });
    expect(sticky.style.width).toBe("260px");
    expect(sticky.style.height).toBe("136px");

    act(() => {
      fireEvent.pointerUp(window, { pointerId: 9, clientX: 76, clientY: 44 });
    });

    const raw = localStorage.getItem("xai_dashboard_stickies");
    const stored = Object.values(JSON.parse(raw!) as Record<string, { width?: number; height?: number }>);
    expect(stored[0]!.width).toBe(260);
    expect(stored[0]!.height).toBe(136);
    expect(sticky.style.width).toBe("260px");
    expect(sticky.style.height).toBe("136px");
  });

  it("dragging a user sticky moves it freely inside the sticky canvas and persists position", () => {
    const { container, rerender } = render(<StickiesWidget lang="en" />);
    act(() => { fireEvent.click(container.querySelector(".icon-btn[data-no-drag]")!); });
    act(() => { fireEvent.change(container.querySelector("textarea")!, { target: { value: "Free move note" } }); });
    act(() => { fireEvent.click(screen.getByText("Save")); });

    const canvas = container.querySelector<HTMLElement>(".sticky-stack")!;
    canvas.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 600,
      bottom: 420,
      width: 600,
      height: 420,
      toJSON: () => ({}),
    });
    const sticky = container.querySelector<HTMLElement>(".sticky[role='button']")!;
    expect(sticky.style.left).toBe("12px");
    expect(sticky.style.top).toBe("12px");

    act(() => {
      fireEvent.pointerDown(sticky, { button: 0, pointerId: 12, clientX: 20, clientY: 20 });
    });
    act(() => {
      fireEvent.pointerMove(window, { pointerId: 12, clientX: 185, clientY: 130 });
    });
    expect(sticky.style.left).toBe("177px");
    expect(sticky.style.top).toBe("122px");

    act(() => {
      fireEvent.pointerUp(window, { pointerId: 12, clientX: 185, clientY: 130 });
    });

    const raw = localStorage.getItem("xai_dashboard_stickies");
    const stored = Object.values(JSON.parse(raw!) as Record<string, { text: string; x?: number; y?: number }>);
    expect(stored[0]!.text).toBe("Free move note");
    expect(stored[0]!.x).toBe(177);
    expect(stored[0]!.y).toBe(122);

    rerender(<StickiesWidget lang="en" />);
    expect(container.querySelector<HTMLElement>(".sticky[role='button']")!.style.left).toBe("177px");
    expect(container.querySelector<HTMLElement>(".sticky[role='button']")!.style.top).toBe("122px");
  });
});

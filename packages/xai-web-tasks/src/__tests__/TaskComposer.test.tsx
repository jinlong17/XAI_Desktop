/**
 * TaskComposer.test.tsx — T-TC-1..7
 *
 * RTL tests for the TaskComposer dialog component.
 * Tests open/close, validation, save, tag, bucket, bilingual labels.
 * Phase: EP2 (T-TC-1..7) + EP3 (T-A11Y-1)
 *
 * jsdom dialog polyfill: vitest.setup.ts extends jest-dom.
 * showModal/close + cancel event are jsdom-supported.
 *
 * Test plan: packages/xai-web-tasks/docs/test.md §E.1
 */

import { describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { TaskComposer } from "../TaskComposer.js";
import type { TaskComposerProps } from "../TaskComposer.js";
import type { NewTaskDraft, BucketId } from "../types.js";

// ---------------------------------------------------------------------------
// Helper: render with default props
// ---------------------------------------------------------------------------
function renderComposer(overrides: Partial<{
  open: boolean;
  lang: "en" | "zh";
  defaultBucket: BucketId;
  onSave: TaskComposerProps["onSave"];
  onClose: () => void;
}> = {}) {
  const defaults = {
    open: true,
    lang: "en" as const,
    defaultBucket: "later" as BucketId,
    onSave: vi.fn(),
    onClose: vi.fn(),
  };
  const props = { ...defaults, ...overrides };
  return { ...render(<TaskComposer {...props} />), ...props };
}

// ---------------------------------------------------------------------------
// T-TC-1: dialog renders; bucket radio pre-selected; (autofocus async)
// ---------------------------------------------------------------------------
describe("TaskComposer — T-TC-1 open renders correctly", () => {
  it("T-TC-1: renders dialog with defaultBucket pre-selected", () => {
    renderComposer({ defaultBucket: "later" });
    // Dialog element exists
    const dialog = document.querySelector("dialog.task-composer");
    expect(dialog).toBeTruthy();

    // Bucket radio for "later" should be aria-checked
    const laterBtn = screen.getByRole("radio", { name: /later/i });
    expect(laterBtn).toHaveAttribute("aria-checked", "true");

    // Other bucket radios not selected
    const next7Btn = screen.getByRole("radio", { name: /next 7 days/i });
    expect(next7Btn).toHaveAttribute("aria-checked", "false");
  });
});

// ---------------------------------------------------------------------------
// T-TC-2: save with empty title → inline error; onSave NOT called
// ---------------------------------------------------------------------------
describe("TaskComposer — T-TC-2 empty title validation", () => {
  it("T-TC-2: empty title shows inline error; onSave not called; dialog stays open", () => {
    const onSave = vi.fn();
    renderComposer({ onSave, open: true });

    // Click save without entering title
    const saveBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(saveBtn);

    expect(onSave).not.toHaveBeenCalled();
    // Error message visible
    expect(screen.getByText(/title is required/i)).toBeTruthy();
    // Dialog still open
    const dialog = document.querySelector("dialog.task-composer");
    expect(dialog).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// T-TC-3: type title + pick tag "work" + Save → onSave called correctly
// ---------------------------------------------------------------------------
describe("TaskComposer — T-TC-3 valid save with tag", () => {
  it("T-TC-3: title + tag work + Save → onSave({title, tag:'work', withDate:false}, 'later') called once", () => {
    const onSave = vi.fn();
    renderComposer({ onSave, defaultBucket: "later" });

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Test task" } });

    // Pick tag "work" — it's a radio button in the tag group
    const workRadio = screen.getAllByRole("radio", { name: /work/i })[0]!;
    fireEvent.click(workRadio);

    const saveBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    const [draft, bucket] = onSave.mock.calls[0] as [NewTaskDraft, BucketId];
    expect(draft.title).toBe("Test task");
    expect(draft.tag).toBe("work");
    expect(draft.withDate).toBe(false);
    expect(bucket).toBe("later");
  });
});

// ---------------------------------------------------------------------------
// T-TC-4: "None" tag selected by default → onSave draft has no tag
// ---------------------------------------------------------------------------
describe("TaskComposer — T-TC-4 tag none by default", () => {
  it("T-TC-4: default tag is None → onSave draft has no tag property", () => {
    const onSave = vi.fn();
    renderComposer({ onSave, defaultBucket: "next7" });

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Task with no tag" } });

    // Verify None radio is checked by default
    const noneRadio = screen.getAllByRole("radio", { name: /none/i })[0]!;
    expect(noneRadio).toHaveAttribute("aria-checked", "true");

    const saveBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    const [draft] = onSave.mock.calls[0] as [NewTaskDraft, BucketId];
    expect(draft.tag).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// T-TC-5: bucket radiogroup retarget to "overdue" → onSave second arg is "overdue"
// ---------------------------------------------------------------------------
describe("TaskComposer — T-TC-5 bucket retarget", () => {
  it("T-TC-5: retarget bucket to overdue → second arg of onSave is overdue", () => {
    const onSave = vi.fn();
    renderComposer({ onSave, defaultBucket: "later" });

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Retargeted task" } });

    // Click overdue bucket radio
    const overdueRadio = screen.getByRole("radio", { name: /overdue/i });
    fireEvent.click(overdueRadio);

    const saveBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    const [, bucket] = onSave.mock.calls[0] as [NewTaskDraft, BucketId];
    expect(bucket).toBe("overdue");
  });
});

// ---------------------------------------------------------------------------
// T-TC-6: ESC (cancel event) → onClose; Cancel button → onClose
// ---------------------------------------------------------------------------
describe("TaskComposer — T-TC-6 close mechanisms", () => {
  it("T-TC-6a: Cancel button calls onClose", () => {
    const onClose = vi.fn();
    renderComposer({ onClose });

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("T-TC-6b: native cancel event (ESC) calls onClose", () => {
    const onClose = vi.fn();
    renderComposer({ onClose });

    const dialog = document.querySelector("dialog.task-composer") as HTMLDialogElement;
    // Fire the native cancel event (simulates ESC in real browser)
    fireEvent(dialog, new Event("cancel", { bubbles: false, cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("T-TC-6c: backdrop click (e.target === dialog) calls onClose", () => {
    const onClose = vi.fn();
    renderComposer({ onClose });

    const dialog = document.querySelector("dialog.task-composer") as HTMLDialogElement;
    // Simulate a click where target is the dialog itself (backdrop)
    fireEvent.click(dialog);
    // Note: in jsdom, fireEvent.click sets e.target to the element
    // so this exercises the e.target === dialogRef.current path
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// T-TC-7: bilingual labels
// ---------------------------------------------------------------------------
describe("TaskComposer — T-TC-7 bilingual labels", () => {
  it("T-TC-7a: lang=en renders English labels", () => {
    renderComposer({ lang: "en" });
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByRole("button", { name: /^add$/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^cancel$/i })).toBeTruthy();
  });

  it("T-TC-7b: lang=zh renders Chinese labels", () => {
    renderComposer({ lang: "zh" });
    expect(screen.getByText("标题")).toBeTruthy();
    expect(screen.getByRole("button", { name: "添加" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "取消" })).toBeTruthy();

    // Validate empty title to trigger Chinese error
    const saveBtn = screen.getByRole("button", { name: "添加" });
    fireEvent.click(saveBtn);
    expect(screen.getByText("标题不能为空")).toBeTruthy();
  });
});

describe("TaskComposer — async save lifecycle", () => {
  it("blocks duplicate saves and ignores an old result after a new composer session opens", async () => {
    let resolve!: (value: boolean) => void;
    const onSave = vi.fn(() => new Promise<boolean>(done => { resolve = done; }));
    const onClose = vi.fn();
    const view = render(<TaskComposer open lang="en" defaultBucket="later" onSave={onSave} onClose={onClose} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Old session" } });
    const save = screen.getByRole("button", { name: /^add$/i });
    fireEvent.click(save);
    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(save).toBeDisabled();

    view.rerender(<TaskComposer open={false} lang="en" defaultBucket="later" onSave={onSave} onClose={onClose} />);
    view.rerender(<TaskComposer open lang="en" defaultBucket="nodate" onSave={onSave} onClose={onClose} />);
    await act(async () => {});
    resolve(false);
    await act(async () => {});

    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: /^add$/i })).not.toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// T-A11Y-1 (EP3): aria-modal + aria-labelledby + aria-required + aria-describedby
// ---------------------------------------------------------------------------
describe("TaskComposer — T-A11Y-1 accessibility attributes", () => {
  it("T-A11Y-1: dialog has aria-modal; title input aria-required; error wired via aria-describedby", () => {
    const { onSave } = renderComposer({ open: true });

    const dialog = document.querySelector("dialog.task-composer");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "task-composer-title");

    const titleInput = screen.getByRole("textbox");
    expect(titleInput).toHaveAttribute("aria-required", "true");
    // No aria-describedby initially (no error)
    expect(titleInput).not.toHaveAttribute("aria-describedby");

    // Trigger error
    const saveBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(saveBtn);

    // Now aria-describedby should be present
    expect(titleInput).toHaveAttribute("aria-describedby", "task-composer-err-title");

    // onSave not called
    expect(onSave).not.toHaveBeenCalled();
  });
});

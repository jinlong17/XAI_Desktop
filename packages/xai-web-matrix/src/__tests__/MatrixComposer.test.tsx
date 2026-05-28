/**
 * T-MC-1..7 — MatrixComposer component tests (EP2).
 *
 * Tests: dialog open/close/save/validation/tag/quadrant/a11y and bilingual STR parity.
 * Design: design.md §E.1 #7
 *
 * Note: jsdom treats <dialog> as hidden by default (showModal is a no-op).
 * We mock showModal + close and query elements with { hidden: true }.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import React from "react";
import { MatrixComposer } from "../MatrixComposer.js";
import type { Quadrant, NewMatrixCardDraft } from "../types.js";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderComposer(
  overrides: Partial<{
    open: boolean;
    lang: "en" | "zh";
    defaultQuadrant: Quadrant;
    onSave: (draft: NewMatrixCardDraft, q: Quadrant) => void;
    onClose: () => void;
  }> = {},
) {
  const defaults = {
    open: true,
    lang: "en" as const,
    defaultQuadrant: "q1" as Quadrant,
    onSave: vi.fn(),
    onClose: vi.fn(),
  };
  const props = { ...defaults, ...overrides };
  const result = render(<MatrixComposer {...props} />);
  return { ...result, onSave: props.onSave, onClose: props.onClose };
}

/** Find button by text in dialog (hidden: true needed for jsdom <dialog>) */
function getDialogButton(text: RegExp | string): HTMLButtonElement {
  const btn = screen.getByRole("button", { name: text, hidden: true });
  return btn as HTMLButtonElement;
}

/** Find all radio buttons (hidden: true for jsdom dialog) */
function getDialogRadios(): HTMLElement[] {
  return screen.getAllByRole("radio", { hidden: true });
}

describe("MatrixComposer", () => {
  it("T-MC-1: open=false → showModal not called; open=true → showModal called", async () => {
    // open=false
    render(
      <MatrixComposer
        open={false}
        lang="en"
        defaultQuadrant="q1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();

    cleanup();

    // open=true
    render(
      <MatrixComposer
        open={true}
        lang="en"
        defaultQuadrant="q1"
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it("T-MC-2: empty title + Save → error shown; onSave NOT called", async () => {
    const onSave = vi.fn();
    renderComposer({ onSave });

    const saveBtn = getDialogButton(/^add$/i);
    await act(async () => { fireEvent.click(saveBtn); });

    // Error message appears
    const errEl = document.getElementById("matrix-composer-err-title");
    expect(errEl).toBeTruthy();
    expect(errEl?.textContent).toBe("Title is required");

    // onSave not called
    expect(onSave).not.toHaveBeenCalled();
  });

  it("T-MC-3: valid title + Save → onSave called with trimmed title and defaultQuadrant", async () => {
    const onSave = vi.fn();
    renderComposer({ onSave, defaultQuadrant: "q2" });

    const titleInput = document.getElementById("matrix-composer-title-input") as HTMLInputElement;
    await act(async () => { fireEvent.change(titleInput, { target: { value: "  My new card  " } }); });

    const saveBtn = getDialogButton(/^add$/i);
    await act(async () => { fireEvent.click(saveBtn); });

    expect(onSave).toHaveBeenCalledOnce();
    const [draft, quadrant] = onSave.mock.calls[0] as [NewMatrixCardDraft, Quadrant];
    expect(draft.title).toBe("My new card");
    expect(quadrant).toBe("q2");
  });

  it("T-MC-4: tag radiogroup — select a preset → draft carries tag; None → tag omitted", async () => {
    const onSave = vi.fn();
    renderComposer({ onSave });

    // Type title
    const titleInput = document.getElementById("matrix-composer-title-input") as HTMLInputElement;
    await act(async () => { fireEvent.change(titleInput, { target: { value: "Tagged card" } }); });

    // Select "Work" tag — find radio with text "Work"
    const radios = getDialogRadios();
    const workBtn = radios.find((el) => el.textContent === "Work");
    expect(workBtn).toBeTruthy();
    await act(async () => { fireEvent.click(workBtn!); });

    const saveBtn = getDialogButton(/^add$/i);
    await act(async () => { fireEvent.click(saveBtn); });

    const [draft] = onSave.mock.calls[0] as [NewMatrixCardDraft, Quadrant];
    expect(draft.tag).toBe("work");

    // Now test "None" tag
    onSave.mockClear();
    cleanup();
    renderComposer({ onSave });

    const titleInput2 = document.getElementById("matrix-composer-title-input") as HTMLInputElement;
    await act(async () => { fireEvent.change(titleInput2, { target: { value: "No tag" } }); });

    const saveBtn2 = getDialogButton(/^add$/i);
    await act(async () => { fireEvent.click(saveBtn2); });

    const [draft2] = onSave.mock.calls[0] as [NewMatrixCardDraft, Quadrant];
    expect(draft2.tag).toBeUndefined();
  });

  it("T-MC-5: quadrant radiogroup — change selection → onSave carries chosen quadrant", async () => {
    const onSave = vi.fn();
    renderComposer({ onSave, defaultQuadrant: "q1" });

    const titleInput = document.getElementById("matrix-composer-title-input") as HTMLInputElement;
    await act(async () => { fireEvent.change(titleInput, { target: { value: "Retargeted card" } }); });

    // Find the q3 radio — "Urgent & Unimportant"
    const radios = getDialogRadios();
    const q3Btn = radios.find((el) => el.textContent === "Urgent & Unimportant");
    expect(q3Btn).toBeTruthy();
    await act(async () => { fireEvent.click(q3Btn!); });

    const saveBtn = getDialogButton(/^add$/i);
    await act(async () => { fireEvent.click(saveBtn); });

    const [, quadrant] = onSave.mock.calls[0] as [NewMatrixCardDraft, Quadrant];
    expect(quadrant).toBe("q3");
  });

  it("T-MC-6: Cancel button → onClose called; no save", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    renderComposer({ onClose, onSave });

    const cancelBtn = getDialogButton(/^cancel$/i);
    await act(async () => { fireEvent.click(cancelBtn); });

    expect(onClose).toHaveBeenCalledOnce();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("T-MC-6: backdrop click (dialog element itself) → onClose called", async () => {
    const onClose = vi.fn();
    renderComposer({ onClose });

    const dialog = document.querySelector("dialog");
    expect(dialog).toBeTruthy();
    // Simulate backdrop click: event target IS the dialog element itself
    await act(async () => {
      // We need the event target to be the dialog itself
      const event = new MouseEvent("click", { bubbles: true });
      Object.defineProperty(event, "target", { get: () => dialog });
      dialog!.dispatchEvent(event);
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("T-MC-7: bilingual STR parity — EN labels under lang=en, ZH under lang=zh", async () => {
    // EN
    renderComposer({ lang: "en" });

    expect(document.querySelector(".matrix-composer__title")?.textContent).toBe("New card");
    // Check label texts exist
    const labels = document.querySelectorAll(".matrix-composer__label");
    const labelTexts = Array.from(labels).map((el) => el.textContent);
    expect(labelTexts).toContain("Title");
    expect(labelTexts).toContain("Tag");
    expect(labelTexts).toContain("Quadrant");
    expect(getDialogButton(/^add$/i).textContent).toBe("Add");
    expect(getDialogButton(/^cancel$/i).textContent).toBe("Cancel");

    cleanup();

    // ZH
    renderComposer({ lang: "zh" });

    expect(document.querySelector(".matrix-composer__title")?.textContent).toBe("新建卡片");
    const labelsZh = document.querySelectorAll(".matrix-composer__label");
    const labelTextsZh = Array.from(labelsZh).map((el) => el.textContent);
    expect(labelTextsZh).toContain("标题");
    expect(labelTextsZh).toContain("标签");
    expect(labelTextsZh).toContain("象限");
    expect(getDialogButton(/^添加$/i).textContent).toBe("添加");
    expect(getDialogButton(/^取消$/i).textContent).toBe("取消");
  });
});

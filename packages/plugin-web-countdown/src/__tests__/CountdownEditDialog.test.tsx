/**
 * CountdownEditDialog.test.tsx — Tests E1..E12 + extras
 *
 * E1: opens via showModal (dialog has open attribute)
 * E2: EN input renders
 * E3: ZH input renders
 * E4: date input renders
 * E5: variant radio change toggles preset picker visibility
 * E6: Save calls onSave with form data
 * E7: Cancel calls onCancel
 * E8: Escape key closes dialog (dispatches close event)
 * E9: empty title (both blank) marks Save invalid and shows inline guidance
 * E10: invalid date marks Save invalid and shows inline guidance
 * E11: Delete button only shown in edit mode
 * E12: Delete fires onDelete
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { CountdownEditDialog } from "../internal/CountdownEditDialog.js";
import { FIXTURE_FUTURE } from "../__fixtures__/cards.js";

function renderCreate(onSave = vi.fn(), onDelete = vi.fn(), onCancel = vi.fn()) {
  return render(
    <CountdownEditDialog
      card={null}
      lang="en"
      onSave={onSave}
      onDelete={onDelete}
      onCancel={onCancel}
    />,
  );
}

function renderEdit(onSave = vi.fn(), onDelete = vi.fn(), onCancel = vi.fn()) {
  return render(
    <CountdownEditDialog
      card={FIXTURE_FUTURE}
      lang="en"
      onSave={onSave}
      onDelete={onDelete}
      onCancel={onCancel}
    />,
  );
}

describe("CountdownEditDialog — create mode", () => {
  it("E1: dialog element has open attribute after mount (showModal shim)", () => {
    const { container } = renderCreate();
    const dialog = container.querySelector("dialog");
    expect(dialog).not.toBeNull();
    expect(dialog?.hasAttribute("open")).toBe(true);
  });

  it("E2: EN title input is rendered", () => {
    renderCreate();
    expect(screen.getByLabelText("Title (English)")).toBeInTheDocument();
  });

  it("E3: ZH title input is rendered", () => {
    renderCreate();
    expect(screen.getByLabelText("Title (Chinese)")).toBeInTheDocument();
  });

  it("E4: date input is rendered", () => {
    renderCreate();
    expect(screen.getByLabelText("Target date")).toBeInTheDocument();
  });

  it("E9: empty title (both blank) marks Save invalid and shows inline guidance", () => {
    renderCreate();
    const saveBtn = screen.getByText("Save");
    expect(saveBtn).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(saveBtn);
    expect(screen.getByText("Check the required fields")).toBeInTheDocument();
    expect(screen.getByText("Add a title in at least one language.")).toBeInTheDocument();
  });

  it("E10: filled title but missing/invalid date marks Save invalid and shows inline guidance", () => {
    renderCreate();
    const enInput = screen.getByLabelText("Title (English)");
    fireEvent.change(enInput, { target: { value: "Test" } });
    fireEvent.change(screen.getByLabelText("Target date"), {
      target: { value: "" },
    });
    const saveBtn = screen.getByText("Save");
    expect(saveBtn).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(saveBtn);
    expect(screen.getByText("Choose a target date.")).toBeInTheDocument();
  });

  it("E6: Save calls onSave with form data when valid", () => {
    const onSave = vi.fn();
    renderCreate(onSave);
    fireEvent.change(screen.getByLabelText("Title (English)"), {
      target: { value: "Test Event" },
    });
    fireEvent.change(screen.getByLabelText("Title (Chinese)"), {
      target: { value: "测试事件" },
    });
    fireEvent.change(screen.getByLabelText("Target date"), {
      target: { value: "2026-12-25" },
    });
    fireEvent.change(screen.getByLabelText("Target time"), {
      target: { value: "09:30" },
    });
    const saveBtn = screen.getByText("Save");
    expect(saveBtn).toHaveAttribute("aria-disabled", "false");
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
    const arg = onSave.mock.calls[0]![0];
    expect(arg.title.en).toBe("Test Event");
    expect(arg.title.zh).toBe("测试事件");
    expect(arg.target_date).toBe("2026-12-25");
    expect(arg.target_time).toBe("09:30");
  });

  it("E7: Cancel calls onCancel", () => {
    const onCancel = vi.fn();
    renderCreate(vi.fn(), vi.fn(), onCancel);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("E8: dialog close event triggers onCancel", () => {
    const onCancel = vi.fn();
    const { container } = renderCreate(vi.fn(), vi.fn(), onCancel);
    const dialog = container.querySelector("dialog")!;
    fireEvent(dialog, new Event("close"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("E11: Delete button NOT shown in create mode", () => {
    renderCreate();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("E5: preset picker hidden when variant=light", () => {
    renderCreate();
    // Default variant is "image", so preset picker is visible.
    // Switch to "light":
    const lightRadio = screen.getByLabelText("Light");
    fireEvent.click(lightRadio);
    // Preset grid should not be visible now
    expect(screen.queryByText("Dusk")).not.toBeInTheDocument();
  });

  it("E5b: preset picker visible when variant=image", () => {
    renderCreate();
    fireEvent.click(screen.getByLabelText("Image"));
    expect(screen.getByText("Dusk")).toBeInTheDocument();
  });
});

describe("CountdownEditDialog — edit mode", () => {
  it("E11: Delete button IS shown in edit mode", () => {
    renderEdit();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("E12: Delete fires onDelete with the card id", () => {
    const onDelete = vi.fn();
    renderEdit(vi.fn(), onDelete);
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledWith(FIXTURE_FUTURE.id);
  });

  it("pre-fills form with card data", () => {
    renderEdit();
    const enInput = screen.getByLabelText("Title (English)") as HTMLInputElement;
    expect(enInput.value).toBe(FIXTURE_FUTURE.title.en);
  });
});

describe("CountdownEditDialog — ZH lang", () => {
  it("renders ZH modal title in create mode", () => {
    render(
      <CountdownEditDialog
        card={null}
        lang="zh"
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("新建倒计时")).toBeInTheDocument();
  });

  it("renders ZH modal title in edit mode", () => {
    render(
      <CountdownEditDialog
        card={FIXTURE_FUTURE}
        lang="zh"
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("编辑倒计时")).toBeInTheDocument();
  });
});

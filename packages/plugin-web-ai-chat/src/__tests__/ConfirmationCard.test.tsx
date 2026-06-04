/**
 * ConfirmationCard.test.tsx — CC-1..CC-3
 *
 * Tests ConfirmationCard rendering and handler invocation.
 *
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 CC tests
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmationCard } from "../ConfirmationCard.js";

const SPEC = {
  label: "Create task",
  description: '"Buy groceries" in Next 7 Days',
};

describe("CC-1: renders label and description", () => {
  it("shows the label and description text", () => {
    render(
      <ConfirmationCard
        spec={SPEC}
        lang="en"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Create task")).toBeDefined();
    expect(screen.getByText('"Buy groceries" in Next 7 Days')).toBeDefined();
  });
});

describe("CC-2: Confirm button calls onConfirm", () => {
  it("clicking Confirm invokes onConfirm once", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmationCard
        spec={SPEC}
        lang="en"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe("CC-3: Cancel button calls onCancel", () => {
  it("clicking Cancel invokes onCancel once", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmationCard
        spec={SPEC}
        lang="en"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// CC-TONE tests (xai-web-ai-tool-edit-delete P2 — ED-7 tone seam)
// ---------------------------------------------------------------------------

describe("CC-TONE-1: default/omitted tone preserves SHIPPED markup (no destructive class)", () => {
  it("CC-TONE-1a: spec with no tone → no destructive class/button; Confirm label = 'Confirm'", () => {
    const { container } = render(
      <ConfirmationCard
        spec={{ label: "Create task", description: '"Buy groceries" in Next 7 Days' }}
        lang="en"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const card = container.firstElementChild!;
    expect(card.classList.contains("ai-confirmation-card--destructive")).toBe(false);
    const confirmBtn = screen.getByRole("button", { name: /confirm/i });
    expect(confirmBtn.textContent).toBe("Confirm");
    expect(confirmBtn.classList.contains("ai-confirmation-confirm--destructive")).toBe(false);
  });

  it("CC-TONE-1b: spec with tone:'default' → same as omitted (no destructive styling)", () => {
    const { container } = render(
      <ConfirmationCard
        spec={{ label: "Create task", description: "Something", tone: "default" }}
        lang="en"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const card = container.firstElementChild!;
    expect(card.classList.contains("ai-confirmation-card--destructive")).toBe(false);
    expect(screen.getByRole("button", { name: /confirm/i }).textContent).toBe("Confirm");
  });
});

describe("CC-TONE-2: destructive tone applies distinct styling and button label", () => {
  it("CC-TONE-2a: spec.tone:'destructive' → destructive class on card + confirm button + label 'Delete'", () => {
    const { container } = render(
      <ConfirmationCard
        spec={{ label: "Delete task", description: 'Delete task (id: t-123)?', tone: "destructive" }}
        lang="en"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const card = container.firstElementChild!;
    expect(card.classList.contains("ai-confirmation-card--destructive")).toBe(true);
    const confirmBtn = screen.getByRole("button", { name: /delete/i });
    expect(confirmBtn.textContent).toBe("Delete");
    expect(confirmBtn.classList.contains("ai-confirmation-confirm--destructive")).toBe(true);
  });

  it("CC-TONE-2b: destructive spec shows item-naming description", () => {
    render(
      <ConfirmationCard
        spec={{ label: "Delete event", description: 'Delete calendar event (id: ev-xyz-789)?', tone: "destructive" }}
        lang="en"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText('Delete calendar event (id: ev-xyz-789)?')).toBeDefined();
  });

  it("CC-TONE-2c: destructive cancel button still shows 'Cancel' (unchanged)", () => {
    render(
      <ConfirmationCard
        spec={{ label: "Delete task", description: "desc", tone: "destructive" }}
        lang="en"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /cancel/i }).textContent).toBe("Cancel");
  });
});

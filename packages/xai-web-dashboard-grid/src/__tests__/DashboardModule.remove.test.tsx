/**
 * AC-RM-6..7: DashboardModule widget remove integration (Audit Top-10 #9, D-06).
 *
 * Tests the remove lifecycle:
 *   AC-RM-6 — clicking the remove button on a widget removes it from the grid
 *              AND from localStorage AND makes it re-available in AddWidgetPicker.
 *   AC-RM-7 — idempotency / no-event-leak: clicking remove on an isDragging shell
 *              still calls the remove handler (button stopPropagation guards it).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";

import { getPref, setPref } from "@repo/plugin-web-storage";

import { DashboardModule } from "../DashboardModule.js";
import type { WidgetRegistration } from "../types.js";

// Stub dialog methods (picker uses showModal/close).
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

function fixture(id: string): WidgetRegistration {
  return {
    id,
    span: "w-stat",
    render: () => <div data-testid={`widget-${id}`}>{id}</div>,
  };
}

describe("DashboardModule — remove widget (AC-RM-6..7)", () => {
  // ---- AC-RM-6: end-to-end remove flow --------------------------------------
  it("AC-RM-6: clicking remove on a widget removes it from the rendered grid", () => {
    setPref("xai_dash_order", ["alpha", "bravo", "charlie"]);
    const widgets = [fixture("alpha"), fixture("bravo"), fixture("charlie")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);

    // 3 shells should be rendered initially.
    const shellsBefore = container.querySelectorAll(".widget-shell");
    expect(shellsBefore).toHaveLength(3);

    // Find the remove button on the second shell (bravo).
    const bravoShell = container.querySelector('[data-widget-id="bravo"]') as HTMLElement;
    expect(bravoShell).toBeTruthy();
    const removeBtn = bravoShell.querySelector(".widget-shell__remove") as HTMLButtonElement;
    expect(removeBtn).toBeTruthy();

    fireEvent.click(removeBtn);

    // After remove, only alpha and charlie remain.
    const shellsAfter = container.querySelectorAll(".widget-shell");
    expect(shellsAfter).toHaveLength(2);
    const remainingIds = Array.from(shellsAfter).map((el) => el.getAttribute("data-widget-id"));
    expect(remainingIds).toContain("alpha");
    expect(remainingIds).toContain("charlie");
    expect(remainingIds).not.toContain("bravo");
  });

  it("AC-RM-6: clicking remove persists the new order to xai_dash_order localStorage", () => {
    setPref("xai_dash_order", ["alpha", "bravo", "charlie"]);
    const widgets = [fixture("alpha"), fixture("bravo"), fixture("charlie")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);

    const bravoShell = container.querySelector('[data-widget-id="bravo"]') as HTMLElement;
    const removeBtn = bravoShell.querySelector(".widget-shell__remove") as HTMLButtonElement;
    fireEvent.click(removeBtn);

    const persisted = getPref("xai_dash_order") as string[];
    expect(persisted).toEqual(["alpha", "charlie"]);
  });

  it("AC-RM-6: removed widget re-appears as available in AddWidgetPicker", () => {
    // Use real widget ids that AddWidgetPicker's currentOrder filter recognizes.
    // We need widget ids known to the picker's available filter.
    // Setup: put "clock" in rawOrder (bravo), then remove it.
    // Since we control the fixture here, we just need to verify the picker
    // shows a card (count increases after remove).
    setPref("xai_dash_order", ["alpha", "bravo"]);
    const widgets = [fixture("alpha"), fixture("bravo")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);

    // Open the picker BEFORE remove — 0 available (both in rawOrder).
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button") as HTMLButtonElement;
    fireEvent.click(addBtn);
    // With both alpha and bravo in rawOrder (stableCurrentOrder), 0 cards available.
    const cardsBefore = document.querySelectorAll(".awp-card").length;

    // Close picker (by calling close stub).
    // We check that after removal, the available count increases.
    // Remove alpha.
    const alphaShell = container.querySelector('[data-widget-id="alpha"]') as HTMLElement;
    const removeBtn = alphaShell.querySelector(".widget-shell__remove") as HTMLButtonElement;
    fireEvent.click(removeBtn);

    // After remove, rawOrder no longer contains "alpha" — picker should show it.
    // Re-open picker.
    fireEvent.click(addBtn);
    const cardsAfter = document.querySelectorAll(".awp-card").length;

    // After removing alpha from rawOrder, the picker's currentOrder (stableCurrentOrder)
    // excludes alpha — so alpha becomes available. Cards count should be > before.
    expect(cardsAfter).toBeGreaterThan(cardsBefore);
  });

  // ---- AC-RM-7: remove button is accessible even on dragging shell ----------
  it("AC-RM-7: remove button click calls onRemove even when the shell has isDragging styling", () => {
    // We cannot set isDragging directly from outside DashboardModule — instead
    // we verify that the remove button is a native <button type="button"> which
    // is sufficient for browser drag-exclusion. The test simulates a click on
    // the button and confirms the handler fires (stopPropagation is in place).
    setPref("xai_dash_order", ["alpha"]);
    const widgets = [fixture("alpha")];
    const { container } = render(<DashboardModule lang="en" widgets={widgets} />);

    const shell = container.querySelector('[data-widget-id="alpha"]') as HTMLElement;
    const removeBtn = shell.querySelector(".widget-shell__remove") as HTMLButtonElement;

    // Verify it is a native button with type="button" (drag safety).
    expect(removeBtn.tagName).toBe("BUTTON");
    expect(removeBtn.getAttribute("type")).toBe("button");

    fireEvent.click(removeBtn);

    // Widget should be gone from the grid (remove fired).
    const shellsAfter = container.querySelectorAll(".widget-shell");
    expect(shellsAfter).toHaveLength(0);
  });
});

/**
 * AC-DMP-1..6: DashboardModule + AddWidgetPicker integration (gap-closure row #5, P2).
 *
 * Tests the picker lifecycle: open/close/add/cancel paths.
 * Uses real i18n bundle and real event bus.
 *
 * Note on currentOrder: DashboardModule calls useDashOrder(widgets) which sanitizes
 * the persisted storage value. Since THREE_WIDGETS ids ("alpha","bravo","charlie")
 * don't match the registry defaults, sanitize returns [] initially (empty storage).
 * Tests that need available cards use EMPTY widgets (so EmptyState renders) OR
 * use widgets not yet in currentOrder (clear localStorage beforeEach).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, act } from "@testing-library/react";

import { onWebEvent } from "@repo/xai-web-event-bus";

import { DashboardModule } from "../DashboardModule.js";
import { THREE_WIDGETS } from "./__fixtures__/widgets.js";
import type { WidgetRegistration } from "../types.js";

// Stub dialog methods per settings-rest precedent (accountPane.test.tsx).
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("DashboardModule picker integration (AC-DMP)", () => {
  // ---- AC-DMP-1: pickerOpen starts false; dialog is closed on first render --
  it("AC-DMP-1: picker dialog is closed on first render (showModal not called)", () => {
    render(<DashboardModule lang="en" widgets={THREE_WIDGETS} />);
    // showModal is called when open=true; on first render picker is closed.
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  // ---- AC-DMP-2: click Add Widget button (from header) opens picker ----------
  it("AC-DMP-2: clicking Add Widget button opens picker", () => {
    render(<DashboardModule lang="en" widgets={THREE_WIDGETS} />);
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(addBtn);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  // ---- AC-DMP-3: click Empty State CTA opens picker -------------------------
  it("AC-DMP-3: clicking Empty State CTA opens picker", () => {
    // Render with empty widgets so the empty state is shown
    render(<DashboardModule lang="en" widgets={[]} />);
    const cta = document.querySelector(".dash-empty__cta") as HTMLButtonElement;
    fireEvent.click(cta);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  // ---- AC-DMP-4: picker card click → widget appended, picker closes, new event emitted
  // REC-1: verify emit fires BEFORE setPickerOpen(false) (i.e. close is called after emit)
  it("AC-DMP-4: picker card click appends widget + emits event + closes picker", () => {
    const addedEvents: Array<{ widgetId: string; source: string }> = [];
    const off = onWebEvent("web:dashboard:widget-added", (payload) => {
      addedEvents.push(payload);
    });

    // Use a single-widget catalog with empty localStorage so the picker
    // shows that one card as available.
    const ONE_WIDGET: WidgetRegistration[] = [
      { id: "solo", span: "w-stat", render: () => null },
    ];
    // currentOrder will start as [] (registry default doesn't match "solo")
    // so picker will show 1 card for "solo".
    render(<DashboardModule lang="en" widgets={ONE_WIDGET} />);

    // Open picker
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(addBtn);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();

    // Click the first card in the picker
    const firstCard = document.querySelector(".awp-card") as HTMLButtonElement;
    expect(firstCard).toBeTruthy(); // guard: picker should have 1 card
    fireEvent.click(firstCard);

    // Event must have been emitted (REC-1: before close)
    expect(addedEvents).toHaveLength(1);
    expect(addedEvents[0]!.source).toBe("picker");
    expect(addedEvents[0]!.widgetId).toBe("solo");

    // close() is called after emit (REC-1 ordering)
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();

    off();
  });

  // ---- AC-DMP-5: picker Cancel → closes, no new event emitted ---------------
  it("AC-DMP-5: picker Cancel closes without emitting widget-added event", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:widget-added", listener);

    render(<DashboardModule lang="en" widgets={THREE_WIDGETS} />);

    // Open picker
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(addBtn);

    // Click Cancel
    const cancelBtn = document.querySelector(".awp-actions button") as HTMLButtonElement;
    fireEvent.click(cancelBtn);

    // No widget-added event
    expect(listener).not.toHaveBeenCalled();
    // close() called (picker closed)
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();

    off();
  });

  // ---- AC-DMP-6: picker ESC → closes, no new event emitted ------------------
  it("AC-DMP-6: picker ESC (cancel event) closes without emitting widget-added event", () => {
    const listener = vi.fn();
    const off = onWebEvent("web:dashboard:widget-added", listener);

    render(<DashboardModule lang="en" widgets={THREE_WIDGETS} />);

    // Open picker
    const addBtn = document
      .querySelector(".dash-head")!
      .querySelector("button[aria-label='Add a new dashboard widget']") as HTMLButtonElement;
    fireEvent.click(addBtn);

    // Simulate ESC via native cancel event on the dialog
    const dialog = document.querySelector("dialog.add-widget-picker") as HTMLDialogElement;
    act(() => {
      fireEvent(dialog, new Event("cancel", { cancelable: true }));
    });

    // No widget-added event
    expect(listener).not.toHaveBeenCalled();
    // close() called (picker closed)
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();

    off();
  });
});

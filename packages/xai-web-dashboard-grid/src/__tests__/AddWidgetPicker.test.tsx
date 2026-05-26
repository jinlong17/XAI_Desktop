/**
 * AC-AWP-1..15: AddWidgetPicker component tests (gap-closure row #5, P1).
 * AC-A11Y-1..4: Picker accessibility checks.
 *
 * Uses real useI18n / real i18n bundle (catches missing key gaps).
 * Stubs HTMLDialogElement.prototype.showModal / close per settings-rest precedent
 * (accountPane.test.tsx) — jsdom 26 has partial HTMLDialogElement support.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { AddWidgetPicker } from "../AddWidgetPicker.js";
import { TEN_WIDGETS, THREE_WIDGETS } from "./__fixtures__/widgets.js";

// Stub showModal / close to avoid jsdom partial-impl errors.
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

// Helpers
const noop = () => {};

describe("AddWidgetPicker", () => {
  // ---- AC-AWP-1: closed when open=false --------------------------------------
  it("AC-AWP-1: when open=false, showModal is NOT called", () => {
    render(
      <AddWidgetPicker
        open={false}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    expect(HTMLDialogElement.prototype.showModal).not.toHaveBeenCalled();
  });

  // ---- AC-AWP-2: open when open=true, showModal called ----------------------
  it("AC-AWP-2: when open=true, showModal is called", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  // ---- AC-AWP-3: renders one card per widget NOT in currentOrder -------------
  it("AC-AWP-3: renders cards for widgets not in currentOrder", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={["clock", "weather"]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    // 10 total - 2 already added = 8 cards
    const cards = document.querySelectorAll(".awp-card");
    expect(cards).toHaveLength(8);
  });

  it("AC-AWP-3b: shows all 10 cards when currentOrder is empty", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    const cards = document.querySelectorAll(".awp-card");
    expect(cards).toHaveLength(10);
  });

  // ---- AC-AWP-4: empty state when all catalog ids are in currentOrder ---------
  it("AC-AWP-4: when all catalog ids are in currentOrder, renders .awp-empty not .awp-grid", () => {
    const allIds = TEN_WIDGETS.map((w) => w.id);
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={allIds}
        onAdd={noop}
        onClose={noop}
      />,
    );
    expect(document.querySelector(".awp-empty")).toBeTruthy();
    expect(document.querySelector(".awp-grid")).toBeNull();
  });

  // ---- AC-AWP-5: empty state bilingual title + subtitle ----------------------
  it("AC-AWP-5: empty state shows bilingual EN text", () => {
    const allIds = TEN_WIDGETS.map((w) => w.id);
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={allIds}
        onAdd={noop}
        onClose={noop}
      />,
    );
    expect(screen.getByText("All widgets are on your dashboard")).toBeTruthy();
    expect(screen.getByText("Remove a widget first to add a different one.")).toBeTruthy();
  });

  it("AC-AWP-5b: empty state shows bilingual ZH text", () => {
    const allIds = TEN_WIDGETS.map((w) => w.id);
    render(
      <AddWidgetPicker
        open={true}
        lang="zh"
        widgets={TEN_WIDGETS}
        currentOrder={allIds}
        onAdd={noop}
        onClose={noop}
      />,
    );
    expect(screen.getByText("所有组件已添加")).toBeTruthy();
    expect(screen.getByText("先移除一个组件后再添加其他组件。")).toBeTruthy();
  });

  // ---- AC-AWP-6: clicking a card calls onAdd with the correct id -------------
  it("AC-AWP-6: clicking a card calls onAdd with the widget id", () => {
    const onAdd = vi.fn();
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={THREE_WIDGETS}
        currentOrder={[]}
        onAdd={onAdd}
        onClose={noop}
      />,
    );
    const firstCard = document.querySelector(".awp-card") as HTMLButtonElement;
    fireEvent.click(firstCard);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("alpha");
  });

  // ---- AC-AWP-7: clicking a card does NOT call onClose -----------------------
  it("AC-AWP-7: clicking a card does NOT call onClose", () => {
    const onClose = vi.fn();
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={THREE_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={onClose}
      />,
    );
    const firstCard = document.querySelector(".awp-card") as HTMLButtonElement;
    fireEvent.click(firstCard);
    expect(onClose).not.toHaveBeenCalled();
  });

  // ---- AC-AWP-8: Cancel button calls onClose (not onAdd) ---------------------
  it("AC-AWP-8: Cancel button calls onClose and NOT onAdd", () => {
    const onAdd = vi.fn();
    const onClose = vi.fn();
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={onAdd}
        onClose={onClose}
      />,
    );
    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onAdd).not.toHaveBeenCalled();
  });

  // ---- AC-AWP-9: backdrop click (target === dialogRef) calls onClose ---------
  // Mirrors DeleteAccountConfirmModal.tsx handleDialogClick pattern (REC-2).
  // In jsdom, firing a click directly on the dialog element simulates the
  // backdrop click (the target equals the dialog element itself).
  it("AC-AWP-9: click on dialog backdrop (target === dialog element) calls onClose", () => {
    const onClose = vi.fn();
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={onClose}
      />,
    );
    const dialog = document.querySelector("dialog.add-widget-picker") as HTMLDialogElement;
    // Fire click directly on the dialog element — this is the backdrop click scenario.
    fireEvent.click(dialog, { target: dialog });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ---- AC-AWP-10: ESC keypress fires native cancel event → calls onClose ----
  it("AC-AWP-10: native cancel event on dialog calls onClose", () => {
    const onClose = vi.fn();
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={onClose}
      />,
    );
    const dialog = document.querySelector("dialog.add-widget-picker") as HTMLDialogElement;
    // Simulate the native cancel event (fired by browser on ESC).
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ---- AC-AWP-11: lang=en renders English picker title ----------------------
  it("AC-AWP-11: lang=en renders English picker title", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    expect(screen.getByText("Add a widget")).toBeTruthy();
  });

  // ---- AC-AWP-12: lang=zh renders Chinese picker title ----------------------
  it("AC-AWP-12: lang=zh renders Chinese picker title", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="zh"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    expect(screen.getByText("添加组件")).toBeTruthy();
  });

  // ---- AC-AWP-13: each card has bilingual title from WIDGET_TITLES ----------
  it("AC-AWP-13: cards have bilingual title (EN) from WIDGET_TITLES", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={THREE_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    // THREE_WIDGETS uses ids: alpha, bravo, charlie — all unknown to WIDGET_TITLES,
    // so fall back to id as title. Verify titles render.
    const titles = document.querySelectorAll(".awp-card__title");
    expect(titles).toHaveLength(3);
  });

  it("AC-AWP-13b: known widget id shows correct EN title from WIDGET_TITLES", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    // "clock" → "Clock"
    expect(screen.getByText("Clock")).toBeTruthy();
    // "weather" → "Weather"
    expect(screen.getByText("Weather")).toBeTruthy();
  });

  // ---- AC-AWP-14: each card has bilingual description from WIDGET_DESCRIPTIONS
  it("AC-AWP-14: cards have bilingual description (EN) from WIDGET_DESCRIPTIONS", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    const descs = document.querySelectorAll(".awp-card__desc");
    expect(descs).toHaveLength(10);
    // clock description
    expect(screen.getByText("Analog or digital clock for your local time.")).toBeTruthy();
  });

  // ---- AC-AWP-15: each card has inline SVG icon from WIDGET_ICONS -----------
  it("AC-AWP-15: each card has an inline SVG icon", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    const icons = document.querySelectorAll(".awp-card__icon svg");
    expect(icons).toHaveLength(10);
  });

  // ---- AC-A11Y-1: dialog has aria-labelledby pointing to title id -----------
  it("AC-A11Y-1: dialog has aria-labelledby pointing to the title h2 id", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).toBeTruthy();
    expect(titleEl!.tagName).toBe("H2");
  });

  // ---- AC-A11Y-2: each card is a <button type="button"> ---------------------
  it("AC-A11Y-2: each card is a button type=button", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={THREE_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    const cards = document.querySelectorAll(".awp-card");
    cards.forEach((card) => {
      expect(card.tagName).toBe("BUTTON");
      expect(card.getAttribute("type")).toBe("button");
    });
  });

  // ---- AC-A11Y-3: cards have accessible name = WIDGET_TITLES or widget id ---
  it("AC-A11Y-3: known widget cards have accessible title text content", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    // Button text content includes the title span
    const clockCard = Array.from(document.querySelectorAll(".awp-card")).find((el) =>
      el.textContent?.includes("Clock"),
    );
    expect(clockCard).toBeTruthy();
  });

  // ---- AC-A11Y-4: Cancel button has accessible name per lang ----------------
  it("AC-A11Y-4: Cancel button has aria-label from dashboard.picker.aria_close (EN)", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="en"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    const cancelBtn = screen.getByText("Cancel");
    expect(cancelBtn.getAttribute("aria-label")).toBe("Close picker");
  });

  it("AC-A11Y-4b: Cancel button has aria-label from dashboard.picker.aria_close (ZH)", () => {
    render(
      <AddWidgetPicker
        open={true}
        lang="zh"
        widgets={TEN_WIDGETS}
        currentOrder={[]}
        onAdd={noop}
        onClose={noop}
      />,
    );
    const cancelBtn = screen.getByText("取消");
    expect(cancelBtn.getAttribute("aria-label")).toBe("关闭组件选择器");
  });
});

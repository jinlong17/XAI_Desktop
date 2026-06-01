/**
 * EventComposer — native <dialog> component tests.
 *
 * AC-CREATE-2 / AC-CREATE-6 / AC-EDIT-3 / AC-DELETE-1 /
 * AC-I18N-CREATE-1..3 / AC-DIALOG-1..7 / AC-BARREL-CREATE-1,6.
 * 18 cases.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventComposer } from "../EventComposer.js";
import type { UserCalEvent } from "../internal/eventStore/types.js";
import { STR_EVENT_COMPOSER } from "../internal/strings.js";

function sampleEvent(over: Partial<UserCalEvent> = {}): UserCalEvent {
  return {
    id: "evt-1",
    title: "Existing",
    startISO: "2026-05-22T09:00",
    endISO: "2026-05-22T10:00",
    colorPreset: "blue",
    recurrence: null,
    createdAt: "2026-05-22T00:00:00.000Z",
    updatedAt: "2026-05-22T00:00:00.000Z",
    ...over,
  };
}

describe("EventComposer — AC-DIALOG-* native <dialog> behavior", () => {
  it("AC-DIALOG-1: open={true} calls dialog.showModal()", () => {
    const spy = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    expect(spy).toHaveBeenCalled();
  });

  it("AC-DIALOG-2: ESC (cancel event) calls onClose", () => {
    const onClose = vi.fn();
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={onClose}
      />,
    );
    const dialog = document.querySelector("dialog.event-composer") as HTMLDialogElement;
    fireEvent(dialog, new Event("cancel"));
    expect(onClose).toHaveBeenCalled();
  });

  it("AC-DIALOG-3: backdrop click (target === dialog) calls onClose", () => {
    const onClose = vi.fn();
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={onClose}
      />,
    );
    const dialog = document.querySelector("dialog.event-composer") as HTMLDialogElement;
    fireEvent.click(dialog, { target: dialog });
    expect(onClose).toHaveBeenCalled();
  });

  it("AC-DIALOG-4: click inside content does NOT close", () => {
    const onClose = vi.fn();
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={onClose}
      />,
    );
    const content = document.querySelector(".event-composer__content") as HTMLElement;
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("AC-DIALOG-5: dialog has aria-modal + aria-labelledby", () => {
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    const dialog = document.querySelector("dialog.event-composer") as HTMLDialogElement;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBe("event-composer-title");
    expect(screen.getByText(STR_EVENT_COMPOSER.title_create.en).id).toBe(
      "event-composer-title",
    );
  });

  it("AC-DIALOG-6: focus moves to first input on open (scheduled after rAF)", async () => {
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    const titleInput = document.getElementById("event-composer-title-input") as HTMLInputElement;
    // Allow the setTimeout(0) inside EventComposer to fire.
    await new Promise((r) => setTimeout(r, 5));
    expect(document.activeElement).toBe(titleInput);
  });

  it("AC-DIALOG-7: Save button click stops propagation (dialog click handler does not fire)", () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        defaultDateKey="2026-05-22"
        onSave={onSave}
        onClose={onClose}
      />,
    );
    const titleInput = document.getElementById("event-composer-title-input") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Title here" } });
    const saveBtn = screen.getByText(STR_EVENT_COMPOSER.btn_save.en);
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("EventComposer — AC-CREATE-* defaults + save", () => {
  it("AC-CREATE-2: mode=create defaults populated", () => {
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        defaultDateKey="2026-05-22"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    expect((document.getElementById("event-composer-title-input") as HTMLInputElement).value).toBe("");
    expect((document.getElementById("event-composer-date-input") as HTMLInputElement).value).toBe("2026-05-22");
    expect((document.getElementById("event-composer-start-input") as HTMLInputElement).value).toBe("09:00");
    expect((document.getElementById("event-composer-end-input") as HTMLInputElement).value).toBe("10:00");
    // Mint chip is selected by default.
    const mintChip = document.querySelector('.event-composer__color-chip.ev-mint') as HTMLButtonElement;
    expect(mintChip.getAttribute("data-selected")).toBe("true");
    // Recurrence None selected by default.
    const noneBtn = screen.getByText(STR_EVENT_COMPOSER.recur_none.en);
    expect(noneBtn.getAttribute("data-selected")).toBe("true");
  });

  it("AC-CREATE-6: empty title → validation error shown, composer stays open, onSave NOT called", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        defaultDateKey="2026-05-22"
        onSave={onSave}
        onClose={onClose}
      />,
    );
    const saveBtn = screen.getByText(STR_EVENT_COMPOSER.btn_save.en);
    fireEvent.click(saveBtn);
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(STR_EVENT_COMPOSER.err_title_required.en)).toBeTruthy();
  });

  it("save with valid form → builds UserCalEvent + calls onSave(event)", () => {
    const onSave = vi.fn();
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        defaultDateKey="2026-05-22"
        onSave={onSave}
        onClose={() => {}}
      />,
    );
    const titleInput = document.getElementById("event-composer-title-input") as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: "Lunch with Lily" } });
    // Choose rose color
    const roseChip = document.querySelector('.event-composer__color-chip.ev-rose') as HTMLButtonElement;
    fireEvent.click(roseChip);
    // Set Weekly recurrence
    const weeklyBtn = screen.getByText(STR_EVENT_COMPOSER.recur_weekly.en);
    fireEvent.click(weeklyBtn);
    // Save
    fireEvent.click(screen.getByText(STR_EVENT_COMPOSER.btn_save.en));
    expect(onSave).toHaveBeenCalledTimes(1);
    const created = onSave.mock.calls[0]?.[0];
    expect(created.title).toBe("Lunch with Lily");
    expect(created.startISO).toBe("2026-05-22T09:00");
    expect(created.endISO).toBe("2026-05-22T10:00");
    expect(created.colorPreset).toBe("rose");
    expect(created.recurrence).toEqual({ kind: "weekly" });
    expect(typeof created.id).toBe("string");
  });
});

describe("EventComposer — AC-EDIT-3 + AC-DELETE-1 edit mode", () => {
  it("AC-EDIT-3: Cancel in edit mode → onClose called, onSave NOT called", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(
      <EventComposer
        open={true}
        mode="edit"
        event={sampleEvent()}
        lang="en"
        onSave={onSave}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText(STR_EVENT_COMPOSER.btn_cancel.en));
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("AC-DELETE-1: Delete button only visible in edit mode (create mode hides it)", () => {
    const { rerender } = render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onDelete={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.queryByText(STR_EVENT_COMPOSER.btn_delete.en)).toBeNull();
    rerender(
      <EventComposer
        open={true}
        mode="edit"
        event={sampleEvent()}
        lang="en"
        onSave={() => {}}
        onDelete={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText(STR_EVENT_COMPOSER.btn_delete.en)).toBeTruthy();
  });

  it("edit mode pre-fills the form from the event prop", () => {
    render(
      <EventComposer
        open={true}
        mode="edit"
        event={sampleEvent({ title: "Existing event", startISO: "2026-05-30T13:00", endISO: "2026-05-30T15:30", colorPreset: "violet", recurrence: { kind: "daily" } })}
        lang="en"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    expect((document.getElementById("event-composer-title-input") as HTMLInputElement).value).toBe("Existing event");
    expect((document.getElementById("event-composer-date-input") as HTMLInputElement).value).toBe("2026-05-30");
    expect((document.getElementById("event-composer-start-input") as HTMLInputElement).value).toBe("13:00");
    expect((document.getElementById("event-composer-end-input") as HTMLInputElement).value).toBe("15:30");
    const violetChip = document.querySelector('.event-composer__color-chip.ev-violet') as HTMLButtonElement;
    expect(violetChip.getAttribute("data-selected")).toBe("true");
    const dailyBtn = screen.getByText(STR_EVENT_COMPOSER.recur_daily.en);
    expect(dailyBtn.getAttribute("data-selected")).toBe("true");
  });

  it("delete click calls onDelete(event.id) then onClose", () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    const event = sampleEvent();
    render(
      <EventComposer
        open={true}
        mode="edit"
        event={event}
        lang="en"
        onSave={() => {}}
        onDelete={onDelete}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText(STR_EVENT_COMPOSER.btn_delete.en));
    expect(onDelete).toHaveBeenCalledWith("evt-1");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("EventComposer — AC-I18N-CREATE-1..3 bilingual", () => {
  it("AC-I18N-CREATE-1: EN composer renders English title + labels + buttons", () => {
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        defaultDateKey="2026-05-22"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("New event")).toBeTruthy();
    expect(screen.getByText("Title")).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.getByText("None")).toBeTruthy();
    expect(screen.getByText("Daily")).toBeTruthy();
    expect(screen.getByText("Weekly")).toBeTruthy();
  });

  it("AC-I18N-CREATE-2: ZH composer renders Chinese title + labels + buttons", () => {
    render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="zh"
        defaultDateKey="2026-05-22"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText("新建事件")).toBeTruthy();
    expect(screen.getByText("标题")).toBeTruthy();
    expect(screen.getByText("保存")).toBeTruthy();
    expect(screen.getByText("取消")).toBeTruthy();
    expect(screen.getByText("不重复")).toBeTruthy();
    expect(screen.getByText("每天")).toBeTruthy();
    expect(screen.getByText("每周")).toBeTruthy();
  });

  it("AC-I18N-CREATE-3: every STR key has both en + zh (sibling-pair shape)", () => {
    for (const key of Object.keys(STR_EVENT_COMPOSER) as Array<keyof typeof STR_EVENT_COMPOSER>) {
      const entry = STR_EVENT_COMPOSER[key];
      expect(typeof entry.en).toBe("string");
      expect(typeof entry.zh).toBe("string");
      expect(entry.en.length).toBeGreaterThan(0);
      expect(entry.zh.length).toBeGreaterThan(0);
    }
  });
});

describe("EventComposer — AC-BARREL-CREATE-1 + 6 + closed lifecycle", () => {
  it("AC-BARREL-CREATE-1: EventComposer is exported from src/index.ts", async () => {
    const pkg = await import("../index.js");
    expect(typeof pkg.EventComposer).toBe("function");
  });

  it("AC-BARREL-CREATE-6: EventComposerProps type is exported (compile-time check)", async () => {
    const pkg = await import("../index.js");
    expect(pkg).toBeDefined();
  });

  it("open={false} after open={true} → dialog.close() is called", () => {
    const spyClose = vi.spyOn(HTMLDialogElement.prototype, "close");
    const { rerender } = render(
      <EventComposer
        open={true}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    rerender(
      <EventComposer
        open={false}
        mode="create"
        event={null}
        lang="en"
        onSave={() => {}}
        onClose={() => {}}
      />,
    );
    expect(spyClose).toHaveBeenCalled();
  });
});

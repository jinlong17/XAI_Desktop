/**
 * AC-ADD-3..6: AddHabitDialog tests.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act, screen } from "@testing-library/react";
import React from "react";
import { AddHabitDialog } from "../internal/AddHabitDialog.js";

// jsdom does not implement showModal/close natively — stub them
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AddHabitDialog", () => {
  it("AC-ADD-3: save button disabled when habit name is empty", () => {
    render(
      <AddHabitDialog
        open={true}
        lang="en"
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    const saveBtn = screen.getByText("Save");
    expect((saveBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("AC-ADD-3: localized secondary title is optional", () => {
    render(
      <AddHabitDialog
        open={true}
        lang="en"
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    fireEvent.change(document.getElementById("hb-title")!, { target: { value: "Test" } });
    const saveBtn = screen.getByText("Save");
    expect((saveBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it("AC-ADD-4: cancel closes dialog without calling onSave", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <AddHabitDialog open={true} lang="en" onClose={onClose} onSave={onSave} />
    );
    await act(async () => {
      fireEvent.click(screen.getByText("Cancel"));
    });
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("AC-ADD-5: default icon writes full habit metadata", async () => {
    const onSave = vi.fn();
    render(
      <AddHabitDialog open={true} lang="en" onClose={() => {}} onSave={onSave} />
    );
    fireEvent.change(document.getElementById("hb-title")!, { target: { value: "Test" } });
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      emoji: "🏃",
      icon: "run",
      color: "accent",
      category: "health",
      startDate: "2026-05-23",
      reminder: { enabled: true, time: "08:00" },
      frequency: { type: "daily" },
      title: { en: "Test", zh: "Test" },
    }));
  });

  it("AC-ADD-6: back-to-back saves produce distinct results (icon varies)", async () => {
    const onSave = vi.fn();
    const { rerender } = render(
      <AddHabitDialog open={true} lang="en" onClose={() => {}} onSave={onSave} />
    );

    // Save first habit
    fireEvent.change(document.getElementById("hb-title")!, { target: { value: "Habit 1" } });
    await act(async () => { fireEvent.click(screen.getByText("Save")); });

    // Re-open dialog for second habit
    rerender(
      <AddHabitDialog open={true} lang="en" onClose={() => {}} onSave={onSave} />
    );
    fireEvent.change(document.getElementById("hb-title")!, { target: { value: "Habit 2" } });
    fireEvent.click(document.querySelector("button[title='Water']")!);
    await act(async () => { fireEvent.click(screen.getByText("Save")); });

    expect(onSave).toHaveBeenCalledTimes(2);
    const [first, second] = onSave.mock.calls as [[{ icon: string; emoji: string }], [{ icon: string; emoji: string }]];
    expect(first[0].icon).toBe("run");
    expect(second[0].icon).toBe("water");
    expect(second[0].emoji).toBe("💧");
  });
});

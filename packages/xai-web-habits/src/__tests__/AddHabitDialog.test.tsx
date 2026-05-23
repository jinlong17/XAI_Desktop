/**
 * AC-ADD-3..6: AddHabitDialog tests.
 */
import { describe, it, expect, vi } from "vitest";
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

describe("AddHabitDialog", () => {
  it("AC-ADD-3: save button disabled when EN title is empty", () => {
    render(
      <AddHabitDialog
        open={true}
        lang="en"
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    // Fill only ZH, leave EN empty
    fireEvent.change(document.getElementById("hb-title-zh")!, { target: { value: "测试" } });
    const saveBtn = screen.getByText("Save");
    expect((saveBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("AC-ADD-3: save button disabled when ZH title is empty", () => {
    render(
      <AddHabitDialog
        open={true}
        lang="en"
        onClose={() => {}}
        onSave={() => {}}
      />
    );
    fireEvent.change(document.getElementById("hb-title-en")!, { target: { value: "Test" } });
    const saveBtn = screen.getByText("Save");
    expect((saveBtn as HTMLButtonElement).disabled).toBe(true);
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

  it("AC-ADD-5: empty emoji input falls back to 🌱", async () => {
    const onSave = vi.fn();
    render(
      <AddHabitDialog open={true} lang="en" onClose={() => {}} onSave={onSave} />
    );
    // Fill titles but leave emoji blank
    fireEvent.change(document.getElementById("hb-title-en")!, { target: { value: "Test" } });
    fireEvent.change(document.getElementById("hb-title-zh")!, { target: { value: "测试" } });
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });
    expect(onSave).toHaveBeenCalledWith({
      emoji: "🌱",
      title: { en: "Test", zh: "测试" },
    });
  });

  it("AC-ADD-6: back-to-back saves produce distinct results (emoji varies)", async () => {
    const onSave = vi.fn();
    const { rerender } = render(
      <AddHabitDialog open={true} lang="en" onClose={() => {}} onSave={onSave} />
    );

    // Save first habit
    fireEvent.change(document.getElementById("hb-title-en")!, { target: { value: "Habit 1" } });
    fireEvent.change(document.getElementById("hb-title-zh")!, { target: { value: "习惯一" } });
    fireEvent.change(document.getElementById("hb-emoji")!, { target: { value: "🌞" } });
    await act(async () => { fireEvent.click(screen.getByText("Save")); });

    // Re-open dialog for second habit
    rerender(
      <AddHabitDialog open={true} lang="en" onClose={() => {}} onSave={onSave} />
    );
    fireEvent.change(document.getElementById("hb-title-en")!, { target: { value: "Habit 2" } });
    fireEvent.change(document.getElementById("hb-title-zh")!, { target: { value: "习惯二" } });
    fireEvent.change(document.getElementById("hb-emoji")!, { target: { value: "🌚" } });
    await act(async () => { fireEvent.click(screen.getByText("Save")); });

    expect(onSave).toHaveBeenCalledTimes(2);
    const [first, second] = onSave.mock.calls as [[{ emoji: string; title: { en: string; zh: string } }], [{ emoji: string; title: { en: string; zh: string } }]];
    expect(first[0].emoji).toBe("🌞");
    expect(second[0].emoji).toBe("🌚");
  });
});

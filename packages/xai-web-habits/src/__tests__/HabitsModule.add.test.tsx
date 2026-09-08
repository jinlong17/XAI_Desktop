/**
 * AC-ADD-1..2: Add-Habit modal flow in HabitsModule.
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, fireEvent, act, screen } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { HabitsModule } from "../HabitsModule.js";
import { habitsSlotRegistration } from "../registration.js";
import { INITIAL_HABITS } from "../internal/seed.js";

vi.useFakeTimers();
vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));

afterEach(() => {
  vi.useRealTimers();
});

// jsdom does not implement showModal/close natively
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <WebShellProvider
      modules={[habitsSlotRegistration]}
      lang="en"
      railPos="left"
      petOn={false}
      setPetOn={() => {}}
    >
      {children}
    </WebShellProvider>
  );
}

describe("HabitsModule add-habit flow", () => {
  it("AC-ADD-1: clicking the + button opens the dialog", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);

    // Dialog should not be visible initially
    expect(document.querySelector(".hb-dialog")).toBeFalsy();

    // Click the add habit button
    const addBtn = document.querySelector("button[aria-label='Add habit']")!;
    await act(async () => { fireEvent.click(addBtn); });

    expect(document.querySelector(".hb-dialog")).toBeTruthy();
  });

  it("AC-ADD-2: saving a new habit appends it to the list and closes the dialog", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);

    const addBtn = document.querySelector("button[aria-label='Add habit']")!;
    await act(async () => { fireEvent.click(addBtn); });

    // Fill the form
    fireEvent.change(document.getElementById("hb-title")!, { target: { value: "New Habit" } });
    fireEvent.change(document.getElementById("hb-title-alt")!, { target: { value: "新习惯" } });
    fireEvent.change(document.getElementById("hb-category")!, { target: { value: "learning" } });
    fireEvent.change(document.getElementById("hb-frequency")!, { target: { value: "weekdays" } });

    const saveBtn = screen.getByText("Save");
    await act(async () => { fireEvent.click(saveBtn); });

    // Dialog should be closed
    expect(document.querySelector(".hb-dialog")).toBeFalsy();

    // New habit should appear in the list
    const rows = document.querySelectorAll(".habit-row");
    expect(rows.length).toBe(INITIAL_HABITS.length + 1);

    // The new habit title should be visible
    const titles = Array.from(document.querySelectorAll(".habit-title")).map(
      (el) => el.textContent
    );
    expect(titles).toContain("New Habit");
  });
});

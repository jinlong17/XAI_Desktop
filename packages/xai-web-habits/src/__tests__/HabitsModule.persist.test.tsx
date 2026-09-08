/**
 * AC-PERSIST-1..6: Persistence correctness tests.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { HabitsModule } from "../HabitsModule.js";
import { habitsSlotRegistration } from "../registration.js";
import { HABITS_STORAGE_KEY } from "../constants.js";
import { INITIAL_HABITS } from "../internal/seed.js";
import type { HabitsState } from "../types.js";

vi.useFakeTimers();
vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  localStorage.clear();
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

describe("HabitsModule persistence", () => {
  it("AC-PERSIST-1: toggle writes to localStorage", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const cell = document.querySelector(".hcell.today")!;
    await act(async () => { fireEvent.click(cell); });
    const raw = localStorage.getItem(HABITS_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const state = JSON.parse(raw!) as HabitsState;
    const habitId = state.habits[0]?.id ?? "";
    expect((state.checkIns[habitId] as Record<string, true>)?.["2026-05-23"]).toBe(true);
  });

  it("AC-PERSIST-2: remount restores persisted state", async () => {
    // First mount: toggle
    const { unmount } = render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    await act(async () => {
      fireEvent.click(document.querySelector(".hcell.today")!);
    });
    unmount();

    // Second mount: should still show checked
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    expect(document.querySelector(".hcell.on.today")).toBeTruthy();
  });

  it("AC-PERSIST-3: fresh mount with no stored value seeds from INITIAL_HABITS", () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const rows = document.querySelectorAll(".habit-row");
    expect(rows.length).toBe(INITIAL_HABITS.length);
  });

  it("AC-PERSIST-4: corrupted JSON in localStorage falls back gracefully", () => {
    localStorage.setItem(HABITS_STORAGE_KEY, "not-json");
    expect(() => {
      render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    }).not.toThrow();
    // Should seed to INITIAL_HABITS
    const rows = document.querySelectorAll(".habit-row");
    expect(rows.length).toBe(INITIAL_HABITS.length);
  });

  it("AC-PERSIST-5: schemaVersion mismatch falls back to default + seed", () => {
    localStorage.setItem(
      HABITS_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, habits: [], checkIns: {}, diaries: {} })
    );
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const rows = document.querySelectorAll(".habit-row");
    expect(rows.length).toBe(INITIAL_HABITS.length);
  });

  it("AC-PERSIST-6: cross-tab storage event updates state", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const newState: HabitsState = {
      schemaVersion: 1,
      habits: [
        { id: "h_ext", emoji: "🌟", title: { en: "External habit", zh: "外部习惯" }, createdAt: "2026-01-01T00:00:00.000Z" }
      ],
      checkIns: {},
      diaries: {},
    };
    await act(async () => {
      const event = new StorageEvent("storage", {
        key: HABITS_STORAGE_KEY,
        newValue: JSON.stringify(newState),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);
    });
    // After storage event, the new habit should appear
    const titles = Array.from(document.querySelectorAll(".habit-row .habit-title")).map(
      (el) => el.textContent,
    );
    expect(titles).toContain("External habit");
  });
});

/**
 * AC-TOGGLE-1..5 + AC-STAT-7: Toggle interaction and stat card live recalc.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { HabitsModule } from "../HabitsModule.js";
import { habitsSlotRegistration } from "../registration.js";
import { HABITS_STORAGE_KEY } from "../constants.js";
import type { HabitsState } from "../types.js";

vi.useFakeTimers();
vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));

afterEach(() => {
  vi.useRealTimers();
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

function getStoredState(): HabitsState | null {
  const raw = localStorage.getItem(HABITS_STORAGE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as HabitsState;
}

describe("HabitsModule check-toggle", () => {
  it("AC-TOGGLE-1: clicking an unchecked hcell toggles it ON + persists", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);

    // Find the first habit row and its hcells
    const firstRow = document.querySelector(".habit-row");
    expect(firstRow).toBeTruthy();
    const hcells = firstRow!.querySelectorAll(".hcell");
    expect(hcells.length).toBe(7);

    const todayCell = Array.from(hcells).find((c) => c.classList.contains("today"));
    expect(todayCell).toBeTruthy();

    // Should not be checked initially
    expect(todayCell!.classList.contains("on")).toBe(false);

    // Toggle ON
    await act(async () => {
      fireEvent.click(todayCell!);
    });

    // Should now be checked
    expect(document.querySelector(".hcell.on.today")).toBeTruthy();

    // Persisted
    const stored = getStoredState();
    expect(stored).toBeTruthy();
    const habitId = stored!.habits[0]?.id ?? "";
    expect((stored!.checkIns[habitId] as Record<string, true>)?.["2026-05-23"]).toBe(true);
  });

  it("AC-TOGGLE-2: clicking a checked hcell removes the dateKey", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const hcells = document.querySelectorAll(".habit-row")[0]!.querySelectorAll(".hcell");
    const todayCell = Array.from(hcells).find((c) => c.classList.contains("today"))!;

    // Toggle ON then OFF
    await act(async () => { fireEvent.click(todayCell); });
    await act(async () => { fireEvent.click(todayCell); });

    expect(todayCell.classList.contains("on")).toBe(false);
    const stored = getStoredState();
    const habitId = stored!.habits[0]?.id ?? "";
    expect((stored!.checkIns[habitId] as Record<string, true> | undefined)?.["2026-05-23"]).toBeUndefined();
  });

  it("AC-TOGGLE-3: toggling hcell does not bubble click to parent .habit-row", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    // Select the second habit row first
    const rows = document.querySelectorAll(".habit-row");
    if (rows.length < 2) return; // skip if only 1 habit

    // Click the second row to select it
    await act(async () => { fireEvent.click(rows[1]!); });
    const selectedBefore = document.querySelector(".habit-row.active");

    // Click an hcell in the first row
    const firstRowHcell = rows[0]!.querySelector(".hcell")!;
    await act(async () => { fireEvent.click(firstRowHcell); });

    // Selected habit should not have changed to first row
    const selectedAfter = document.querySelector(".habit-row.active");
    expect(selectedAfter).toBe(selectedBefore);
  });

  it("AC-TOGGLE-5: rapid N clicks leave expected end-state", async () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    const hcell = document.querySelector(".hcell.today")!;

    // 3 clicks: ON → OFF → ON = odd = should be ON
    for (let i = 0; i < 3; i++) {
      await act(async () => { fireEvent.click(hcell); });
    }
    expect(document.querySelector(".hcell.on.today")).toBeTruthy();
  });

  it("AC-STAT-7: stat cards re-render live on toggle", async () => {
    await act(async () => {
      render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    });

    // Get monthly_checkins stat card value before
    const statValues = document.querySelectorAll(".stat-value");
    // stat-card 1 = monthly_checkins
    const beforeText = statValues[0]?.textContent ?? "";

    // Toggle today's check
    const todayCell = document.querySelector(".hcell.today")!;
    await act(async () => { fireEvent.click(todayCell); });

    const afterStatValues = document.querySelectorAll(".stat-value");
    const afterText = afterStatValues[0]?.textContent ?? "";
    // The value should have changed (0 → 1)
    expect(afterText).not.toBe(beforeText);
  });
});

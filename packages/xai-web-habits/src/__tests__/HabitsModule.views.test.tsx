import { accountScope } from "@repo/plugin-web-storage";
/**
 * AC-VIEWS-1..4: all Habits view modes render usable content.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import React from "react";
import { WebShellProvider } from "@repo/xai-web-shell";
import { HabitsModule } from "../HabitsModule.js";
import { habitsSlotRegistration } from "../registration.js";
import { HABITS_STORAGE_KEY } from "../constants.js";
import type { Habit, HabitsState } from "../types.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
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

describe("HabitsModule view modes", () => {
  it("AC-VIEWS-1: calendar view renders by default", () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    expect(screen.getByText("Habit Log")).toBeTruthy();
    expect(document.querySelectorAll(".cal-cell.in").length).toBeGreaterThan(0);
  });

  it("AC-VIEWS-2: list view renders management cards", () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    fireEvent.click(screen.getByText("List"));
    expect(screen.getByText("List View")).toBeTruthy();
    expect(screen.getAllByText("Check today").length).toBeGreaterThan(0);
  });

  it("AC-VIEWS-3: statistics view renders leaderboard and heatmap", () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    fireEvent.click(screen.getByText("Stats"));
    expect(screen.getByText("Statistics")).toBeTruthy();
    expect(screen.getByText("Leaderboard")).toBeTruthy();
    expect(document.querySelectorAll(".heat-cell").length).toBeGreaterThan(0);
  });

  it("AC-VIEWS-4: all habits view renders multi-habit month cells", () => {
    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    fireEvent.click(screen.getByText("All"));
    expect(screen.getAllByText("All Habits").length).toBeGreaterThan(0);
    expect(document.querySelectorAll(".habits-detail .stat-card")).toHaveLength(4);
    expect(document.querySelector(".all-calendar-card .progress-head")).toBeTruthy();
    expect(document.querySelector(".all-calendar-card .month-cal")).toBeTruthy();
    expect(document.querySelector(".all-month-grid.cal-grid")).toBeTruthy();
    expect(document.querySelector(".all-cal-cell.cal-cell")).toBeTruthy();
    expect(document.querySelector(".all-cal-ring.cal-ring")).toBeTruthy();
    expect(document.querySelectorAll(".all-cal-cell.in").length).toBeGreaterThan(0);
    expect(document.querySelectorAll(".all-habit-dot").length).toBeGreaterThan(0);
  });

  it("AC-VIEWS-4b: all habits cells render up to twenty habit dots before +N", () => {
    const habits: Habit[] = Array.from({ length: 20 }, (_, index) => ({
      id: `h_extra_${index}`,
      emoji: "•",
      title: { en: `Habit ${index + 1}`, zh: `习惯 ${index + 1}` },
      createdAt: "2026-01-01T00:00:00.000Z",
      color: "accent",
      icon: "target",
      category: "health",
      frequency: { type: "daily" },
      startDate: "2026-01-01",
    }));
    const state: HabitsState = {
      schemaVersion: 1,
      habits,
      checkIns: {},
      diaries: {},
    };
    localStorage.setItem(accountScope.physicalKey(HABITS_STORAGE_KEY), JSON.stringify(state));

    render(<Wrapper><HabitsModule lang="en" /></Wrapper>);
    fireEvent.click(screen.getByText("All"));

    const firstInMonthCell = document.querySelector(".all-cal-cell.in");
    expect(firstInMonthCell?.querySelectorAll(".all-habit-dot")).toHaveLength(20);
    expect(firstInMonthCell?.querySelector(".all-more")).toBeFalsy();
  });
});

import { accountScope } from "@repo/plugin-web-storage";
/**
 * StatStreak — real-data tests (§F rewrite).
 *
 * Seeds `xai_habits_state` via `localStorage` before rendering.
 * Old magic-number assertions (27) are REMOVED (RD8 guard).
 *
 * Date basis = UTC (habits use UTC day keys; AC-RD-HABIT-5).
 *
 * AC-STATS-REAL-STREAK-1: no habits → empty label
 * AC-STATS-REAL-STREAK-2: habits with today checked → streak count
 * AC-STATS-REAL-STREAK-3: habits exist but today not checked → 0 (not empty label)
 * AC-STATS-REAL-STREAK-4: bilingual labels
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatStreak } from "../widgets/StatStreak.js";

function seedHabitsState(store: unknown) {
  localStorage.setItem(accountScope.physicalKey("xai_habits_state"), JSON.stringify(store));
}

beforeEach(() => {
  localStorage.clear();
});

describe("StatStreak — real data", () => {
  // AC-STATS-REAL-STREAK-1: no habits → empty label
  it("AC-STATS-REAL-STREAK-1: shows empty label when no habits", () => {
    // Default empty state
    render(<StatStreak lang="en" />);
    expect(screen.getByText("No habits yet")).toBeTruthy();
    expect(screen.queryByText(/\d+ d/)).toBeNull();
  });

  it("AC-STATS-REAL-STREAK-1: shows empty label in Chinese", () => {
    render(<StatStreak lang="zh" />);
    expect(screen.getByText("暂无习惯")).toBeTruthy();
  });

  it("AC-STATS-REAL-STREAK-1: shows empty label when habits array is empty", () => {
    seedHabitsState({ schemaVersion: 1, habits: [], checkIns: {}, diaries: {} });
    render(<StatStreak lang="en" />);
    expect(screen.getByText("No habits yet")).toBeTruthy();
  });

  // AC-STATS-REAL-STREAK-2: real streak
  it("AC-STATS-REAL-STREAK-2: shows streak count when today is checked", () => {
    // Use a fixed UTC "today"
    const today = new Date(Date.UTC(2026, 4, 28, 12, 0, 0)); // 2026-05-28 UTC
    seedHabitsState({
      schemaVersion: 1,
      habits: [{ id: "h1", emoji: "🏃", title: { en: "Run", zh: "跑步" }, createdAt: "" }],
      checkIns: {
        h1: {
          "2026-05-26": true,
          "2026-05-27": true,
          "2026-05-28": true,
        },
      },
      diaries: {},
    });
    render(<StatStreak lang="en" now={today} />);
    // Expect "3" + " d" unit
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.queryByText("No habits yet")).toBeNull();
  });

  // AC-STATS-REAL-STREAK-3: habits exist but streak === 0 (today not checked)
  it("AC-STATS-REAL-STREAK-3: shows 0 (not empty label) when streak broke", () => {
    const today = new Date(Date.UTC(2026, 4, 28, 12, 0, 0));
    seedHabitsState({
      schemaVersion: 1,
      habits: [{ id: "h1" }],
      checkIns: {
        h1: { "2026-05-27": true }, // yesterday, not today
      },
      diaries: {},
    });
    render(<StatStreak lang="en" now={today} />);
    expect(screen.getByText("0")).toBeTruthy();
    // Not empty label — habit exists, just streak is 0
    expect(screen.queryByText("No habits yet")).toBeNull();
  });

  // AC-STATS-REAL-STREAK-4: bilingual
  it("AC-STATS-REAL-STREAK-4: bilingual label en/zh", () => {
    const today = new Date(Date.UTC(2026, 4, 28));
    seedHabitsState({
      schemaVersion: 1,
      habits: [{ id: "h1" }],
      checkIns: { h1: { "2026-05-28": true } },
      diaries: {},
    });
    const { rerender, container } = render(<StatStreak lang="en" now={today} />);
    expect(screen.getByText("Habit streak")).toBeTruthy();
    expect(container.querySelector(".ws-unit")?.textContent).toBe(" d");
    rerender(<StatStreak lang="zh" now={today} />);
    expect(screen.getByText("习惯连胜")).toBeTruthy();
    expect(container.querySelector(".ws-unit")?.textContent).toBe(" 天");
  });

  // Flame icon always present when habits exist
  it("shows flame icon when habits exist", () => {
    const today = new Date(Date.UTC(2026, 4, 28));
    seedHabitsState({
      schemaVersion: 1,
      habits: [{ id: "h1" }],
      checkIns: { h1: { "2026-05-28": true } },
      diaries: {},
    });
    const { container } = render(<StatStreak lang="en" now={today} />);
    expect(container.querySelector("[data-icon='flame']")).not.toBeNull();
  });
});

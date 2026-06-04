/**
 * StatPomos — real-data tests (§F rewrite).
 *
 * Seeds `xai_pomodoro_sessions` via `localStorage` before rendering.
 * Old magic-number assertions (6/8) are REMOVED (RD8 guard).
 *
 * Date basis = LOCAL day (pomodoro uses `localDateKey`).
 *
 * AC-STATS-REAL-POMOS-1: empty store → 0 count + all dots off
 * AC-STATS-REAL-POMOS-2: today's focus sessions counted correctly
 * AC-STATS-REAL-POMOS-3: completedAt-only session NOT counted (Cmd-K guard)
 * AC-STATS-REAL-POMOS-4: bilingual labels
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatPomos } from "../widgets/StatPomos.js";

function seedPomoSessions(store: unknown) {
  localStorage.setItem("xai_pomodoro_sessions", JSON.stringify(store));
}

beforeEach(() => {
  localStorage.clear();
});

describe("StatPomos — real data", () => {
  // AC-STATS-REAL-POMOS-1: empty store
  it("AC-STATS-REAL-POMOS-1: shows 0 when no sessions", () => {
    const now = new Date();
    render(<StatPomos lang="en" now={now} />);
    expect(screen.getByText("0")).toBeTruthy();
    // All 8 dots off
    const { container } = render(<StatPomos lang="en" now={now} />);
    expect(container.querySelectorAll(".pd-dot")).toHaveLength(8);
    expect(container.querySelectorAll(".pd-dot.on")).toHaveLength(0);
  });

  // AC-STATS-REAL-POMOS-2: today's sessions counted
  it("AC-STATS-REAL-POMOS-2: counts today's completed focus sessions", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0); // local May 28
    const makeSession = (hour: number) => ({
      mode: "focus",
      finishedAt: new Date(2026, 4, 28, hour, 0, 0).toISOString(),
      completed: true,
    });
    seedPomoSessions([makeSession(9), makeSession(11), makeSession(13)]);
    render(<StatPomos lang="en" now={now} />);
    expect(screen.getByText("3")).toBeTruthy();
    const { container } = render(<StatPomos lang="en" now={now} />);
    expect(container.querySelectorAll(".pd-dot.on")).toHaveLength(3);
  });

  it("AC-STATS-REAL-POMOS-2: does NOT count yesterday's sessions", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0); // local May 28
    const yesterdaySession = {
      mode: "focus",
      finishedAt: new Date(2026, 4, 27, 15, 0, 0).toISOString(),
      completed: true,
    };
    const todaySession = {
      mode: "focus",
      finishedAt: new Date(2026, 4, 28, 9, 0, 0).toISOString(),
      completed: true,
    };
    seedPomoSessions([yesterdaySession, todaySession]);
    render(<StatPomos lang="en" now={now} />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("AC-STATS-REAL-POMOS-2: does NOT count break sessions", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0);
    seedPomoSessions([
      { mode: "short-break", finishedAt: new Date(2026, 4, 28, 10, 0, 0).toISOString(), completed: true },
      { mode: "focus", finishedAt: new Date(2026, 4, 28, 11, 0, 0).toISOString(), completed: true },
    ]);
    render(<StatPomos lang="en" now={now} />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  // AC-STATS-REAL-POMOS-3: completedAt guard (Cmd-K stale)
  it("AC-STATS-REAL-POMOS-3: completedAt-only session NOT counted", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0);
    seedPomoSessions([
      // Stale Cmd-K format — has completedAt but no finishedAt + completed
      { mode: "focus", completedAt: new Date(2026, 4, 28, 10, 0, 0).toISOString() },
    ]);
    render(<StatPomos lang="en" now={now} />);
    expect(screen.getByText("0")).toBeTruthy();
  });

  // AC-STATS-REAL-POMOS-4: bilingual label
  it("AC-STATS-REAL-POMOS-4: bilingual label en/zh", () => {
    const now = new Date();
    const { rerender } = render(<StatPomos lang="en" now={now} />);
    expect(screen.getByText("Pomodoros")).toBeTruthy();
    rerender(<StatPomos lang="zh" now={now} />);
    expect(screen.getByText("番茄数")).toBeTruthy();
  });

  // Dots cap at 8 (PomoDots total=8)
  it("dots cap at 8 even when count > 8", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0);
    const sessions = Array.from({ length: 10 }, (_, i) => ({
      mode: "focus",
      finishedAt: new Date(2026, 4, 28, i, 0, 0).toISOString(),
      completed: true,
    }));
    seedPomoSessions(sessions);
    render(<StatPomos lang="en" now={now} />);
    // count = 10 but rendered text is "10"
    expect(screen.getByText("10")).toBeTruthy();
    const { container } = render(<StatPomos lang="en" now={now} />);
    // PomoDots total=8 → always 8 dot divs; all 8 "on" (cap)
    expect(container.querySelectorAll(".pd-dot")).toHaveLength(8);
    expect(container.querySelectorAll(".pd-dot.on")).toHaveLength(8);
  });
});

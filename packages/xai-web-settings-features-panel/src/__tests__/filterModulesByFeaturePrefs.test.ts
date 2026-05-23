/**
 * AC-FILTER-1..AC-FILTER-4 (test.md §A1).
 */
import { describe, it, expect } from "vitest";
import { filterModulesByFeaturePrefs } from "../filterModulesByFeaturePrefs.js";
import type { FeaturePrefs } from "../types.js";

interface ModuleLike {
  readonly moduleId: string;
  readonly label: string;
}

const ALL_TRUE: FeaturePrefs = {
  tasks: true, board: true, dashboard: true, calendar: true,
  matrix: true, pomodoro: true, habits: true, meditation: true,
};

const MODULES: readonly ModuleLike[] = [
  { moduleId: "tasks", label: "Tasks" },
  { moduleId: "board", label: "Board" },
  { moduleId: "dashboard", label: "Dashboard" },
  { moduleId: "calendar", label: "Calendar" },
  { moduleId: "matrix", label: "Matrix" },
  { moduleId: "pomodoro", label: "Pomodoro" },
  { moduleId: "habits", label: "Habits" },
  { moduleId: "meditation", label: "Meditation" },
  { moduleId: "countdown", label: "Countdown" },
  { moduleId: "ai", label: "AI" },
  { moduleId: "statistics", label: "Statistics" },
  { moduleId: "settings", label: "Settings" },
];

describe("filterModulesByFeaturePrefs", () => {
  it("AC-FILTER-1: all prefs true → input is unchanged by value", () => {
    const out = filterModulesByFeaturePrefs(MODULES, ALL_TRUE);
    expect(out).toEqual([...MODULES]);
    expect(out.length).toBe(12);
  });

  it("AC-FILTER-2: one pref false → that module is removed", () => {
    const prefs: FeaturePrefs = { ...ALL_TRUE, board: false };
    const out = filterModulesByFeaturePrefs(MODULES, prefs);
    expect(out.map((m) => m.moduleId)).not.toContain("board");
    expect(out.length).toBe(11);
  });

  it("AC-FILTER-3: non-FeatureId modules always pass through", () => {
    const prefs: FeaturePrefs = {
      tasks: false, board: false, dashboard: false, calendar: false,
      matrix: false, pomodoro: false, habits: false, meditation: false,
    };
    const out = filterModulesByFeaturePrefs(MODULES, prefs);
    expect(out.map((m) => m.moduleId)).toEqual(["countdown", "ai", "statistics", "settings"]);
  });

  it("AC-FILTER-4: pure — same inputs produce structurally equal output across calls", () => {
    const a = filterModulesByFeaturePrefs(MODULES, ALL_TRUE);
    const b = filterModulesByFeaturePrefs(MODULES, ALL_TRUE);
    expect(a).toEqual(b);
  });
});

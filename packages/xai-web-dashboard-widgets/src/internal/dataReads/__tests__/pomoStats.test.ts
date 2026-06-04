import { describe, it, expect } from "vitest";
import { isPomodoroSession } from "../isPomodoroSession.js";
import { countTodaysFocus, localDateKey } from "../pomoStats.js";

// ---------------------------------------------------------------------------
// AC-RD-POMO-1: isPomodoroSession rejects non-conforming values
// ---------------------------------------------------------------------------
describe("isPomodoroSession", () => {
  it("AC-RD-POMO-1: rejects null/string/number", () => {
    expect(isPomodoroSession(null)).toBe(false);
    expect(isPomodoroSession("focus")).toBe(false);
    expect(isPomodoroSession(42)).toBe(false);
  });

  it("AC-RD-POMO-1: rejects missing finishedAt", () => {
    expect(isPomodoroSession({ mode: "focus", completed: true })).toBe(false);
  });

  it("AC-RD-POMO-1: rejects missing completed", () => {
    expect(
      isPomodoroSession({ mode: "focus", finishedAt: "2026-05-28T10:00:00.000Z" }),
    ).toBe(false);
  });

  it("AC-RD-POMO-1: rejects invalid mode", () => {
    expect(
      isPomodoroSession({ mode: "work", finishedAt: "2026-05-28T10:00:00.000Z", completed: true }),
    ).toBe(false);
  });

  it("AC-RD-POMO-1: accepts valid focus session", () => {
    expect(
      isPomodoroSession({ mode: "focus", finishedAt: "2026-05-28T10:00:00.000Z", completed: true }),
    ).toBe(true);
  });

  it("AC-RD-POMO-1: accepts break session (not focus, but still valid shape)", () => {
    expect(
      isPomodoroSession({
        mode: "short-break",
        finishedAt: "2026-05-28T10:00:00.000Z",
        completed: false,
      }),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-POMO-2: countTodaysFocus returns 0 for invalid store
// ---------------------------------------------------------------------------
describe("countTodaysFocus — invalid store", () => {
  const now = new Date("2026-05-28T12:00:00");

  it("AC-RD-POMO-2: returns 0 for null", () => {
    expect(countTodaysFocus(null, now)).toBe(0);
  });

  it("AC-RD-POMO-2: returns 0 for object (not array)", () => {
    expect(countTodaysFocus({}, now)).toBe(0);
  });

  it("AC-RD-POMO-2: returns 0 for empty array", () => {
    expect(countTodaysFocus([], now)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-POMO-3: completedAt-only session NOT counted (Cmd-K stale guard)
// ---------------------------------------------------------------------------
describe("countTodaysFocus — completedAt guard (AC-RD-POMO-3)", () => {
  it("does NOT count session that only has completedAt (Cmd-K stale field)", () => {
    const now = new Date("2026-05-28T12:00:00");
    // Session with stale Cmd-K completedAt but NO finishedAt+completed
    const store = [{ mode: "focus", completedAt: "2026-05-28T10:00:00.000Z" }];
    expect(countTodaysFocus(store, now)).toBe(0);
  });

  it("counts session with canonical finishedAt + completed=true", () => {
    const now = new Date("2026-05-28T12:00:00");
    const store = [
      {
        mode: "focus",
        finishedAt: "2026-05-28T10:00:00.000Z",
        completed: true,
      },
    ];
    expect(countTodaysFocus(store, now)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-POMO-4: local day boundary (23:59 local vs UTC midnight)
// ---------------------------------------------------------------------------
describe("countTodaysFocus — local day basis (AC-RD-POMO-4)", () => {
  it("counts a session finishing at 23:59 local as that local day", () => {
    // We fake "now" as the same local day
    // Use a fixed local time approach: set now to a date where 23:59 local is "today"
    const localYear = 2026;
    const localMonth = 4; // May (0-indexed)
    const localDay = 28;
    const now = new Date(localYear, localMonth, localDay, 12, 0, 0); // local noon
    const todayKey = localDateKey(now);

    // Create a session that finishes at local 23:59 on the same day
    const lateSession = new Date(localYear, localMonth, localDay, 23, 59, 0);
    const store = [
      {
        mode: "focus",
        finishedAt: lateSession.toISOString(),
        completed: true,
      },
    ];
    expect(countTodaysFocus(store, now)).toBe(1);
    expect(localDateKey(lateSession)).toBe(todayKey);
  });

  it("does NOT count session from yesterday local", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0); // May 28 local noon
    const yesterday = new Date(2026, 4, 27, 23, 59, 0); // May 27 local 23:59
    const store = [
      {
        mode: "focus",
        finishedAt: yesterday.toISOString(),
        completed: true,
      },
    ];
    expect(countTodaysFocus(store, now)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-POMO-5: only counts mode==="focus" + completed===true
// ---------------------------------------------------------------------------
describe("countTodaysFocus — filters by mode + completed (AC-RD-POMO-5)", () => {
  it("excludes break sessions", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0);
    const store = [
      { mode: "short-break", finishedAt: new Date(2026, 4, 28, 10, 0, 0).toISOString(), completed: true },
      { mode: "long-break", finishedAt: new Date(2026, 4, 28, 10, 0, 0).toISOString(), completed: true },
      { mode: "focus", finishedAt: new Date(2026, 4, 28, 10, 0, 0).toISOString(), completed: true },
    ];
    expect(countTodaysFocus(store, now)).toBe(1);
  });

  it("excludes incomplete focus sessions (completed=false)", () => {
    const now = new Date(2026, 4, 28, 12, 0, 0);
    const store = [
      { mode: "focus", finishedAt: new Date(2026, 4, 28, 10, 0, 0).toISOString(), completed: false },
      { mode: "focus", finishedAt: new Date(2026, 4, 28, 11, 0, 0).toISOString(), completed: true },
    ];
    expect(countTodaysFocus(store, now)).toBe(1);
  });

  it("counts multiple valid focus sessions today", () => {
    const now = new Date(2026, 4, 28, 15, 0, 0);
    const makeSession = (hour: number) => ({
      mode: "focus",
      finishedAt: new Date(2026, 4, 28, hour, 0, 0).toISOString(),
      completed: true,
    });
    const store = [makeSession(9), makeSession(11), makeSession(13)];
    expect(countTodaysFocus(store, now)).toBe(3);
  });
});

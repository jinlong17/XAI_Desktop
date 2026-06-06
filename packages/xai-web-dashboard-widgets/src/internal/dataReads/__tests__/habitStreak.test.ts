import { describe, it, expect } from "vitest";
import { isHabitsState } from "../isHabitsState.js";
import { maxStreak, utcDateKey } from "../habitStreak.js";

// ---------------------------------------------------------------------------
// AC-RD-HABIT-1: isHabitsState rejects non-conforming values
// ---------------------------------------------------------------------------
describe("isHabitsState", () => {
  it("AC-RD-HABIT-1: rejects null/string/number", () => {
    expect(isHabitsState(null)).toBe(false);
    expect(isHabitsState("state")).toBe(false);
    expect(isHabitsState(42)).toBe(false);
  });

  it("AC-RD-HABIT-1: rejects object without habits array", () => {
    expect(isHabitsState({ checkIns: {} })).toBe(false);
    expect(isHabitsState({ habits: "bad", checkIns: {} })).toBe(false);
  });

  it("AC-RD-HABIT-1: rejects object without checkIns object", () => {
    expect(isHabitsState({ habits: [] })).toBe(false);
    expect(isHabitsState({ habits: [], checkIns: null })).toBe(false);
  });

  it("AC-RD-HABIT-1: rejects habit with no id", () => {
    expect(isHabitsState({ habits: [{ name: "no id" }], checkIns: {} })).toBe(false);
  });

  it("AC-RD-HABIT-1: accepts valid state with no habits", () => {
    expect(isHabitsState({ habits: [], checkIns: {} })).toBe(true);
  });

  it("AC-RD-HABIT-1: accepts valid state with habits", () => {
    expect(
      isHabitsState({
        habits: [{ id: "h1", emoji: "🏃", title: { en: "Run", zh: "跑步" } }],
        checkIns: { h1: { "2026-05-28": true } },
        diaries: {},
      }),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-HABIT-2: maxStreak returns 0 when store is invalid
// ---------------------------------------------------------------------------
describe("maxStreak — invalid store", () => {
  const today = new Date("2026-05-28T12:00:00Z");

  it("AC-RD-HABIT-2: returns 0 for null", () => {
    expect(maxStreak(null, today)).toBe(0);
  });

  it("AC-RD-HABIT-2: returns 0 for string", () => {
    expect(maxStreak("nope", today)).toBe(0);
  });

  it("AC-RD-HABIT-2: returns 0 for empty habits list", () => {
    expect(maxStreak({ habits: [], checkIns: {} }, today)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-HABIT-3: C1 streak — today not checked → 0
// ---------------------------------------------------------------------------
describe("maxStreak — C1 today-anchor (AC-RD-HABIT-3)", () => {
  it("returns 0 if today is not checked", () => {
    const today = new Date(Date.UTC(2026, 4, 28)); // 2026-05-28 UTC
    const store = {
      habits: [{ id: "h1" }],
      checkIns: {
        h1: {
          "2026-05-27": true, // yesterday checked, today not
        },
      },
    };
    expect(maxStreak(store, today)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// AC-RD-HABIT-4: consecutive streak counting
// ---------------------------------------------------------------------------
describe("maxStreak — consecutive days (AC-RD-HABIT-4)", () => {
  it("returns 1 if only today is checked", () => {
    const today = new Date(Date.UTC(2026, 4, 28));
    const store = {
      habits: [{ id: "h1" }],
      checkIns: {
        h1: { "2026-05-28": true as const },
      },
    };
    expect(maxStreak(store, today)).toBe(1);
  });

  it("returns 3 for 3 consecutive days ending today", () => {
    const today = new Date(Date.UTC(2026, 4, 28));
    const store = {
      habits: [{ id: "h1" }],
      checkIns: {
        h1: {
          "2026-05-26": true as const,
          "2026-05-27": true as const,
          "2026-05-28": true as const,
        },
      },
    };
    expect(maxStreak(store, today)).toBe(3);
  });

  it("stops counting at a gap", () => {
    const today = new Date(Date.UTC(2026, 4, 28));
    const store = {
      habits: [{ id: "h1" }],
      checkIns: {
        h1: {
          "2026-05-24": true as const, // gap on 25th
          "2026-05-26": true as const,
          "2026-05-27": true as const,
          "2026-05-28": true as const,
        },
      },
    };
    expect(maxStreak(store, today)).toBe(3); // not 4 — gap breaks it
  });
});

// ---------------------------------------------------------------------------
// AC-RD-HABIT-5: UTC day keys (NOT local) — date-basis guard
// ---------------------------------------------------------------------------
describe("maxStreak — UTC date basis (AC-RD-HABIT-5)", () => {
  it("uses UTC day keys, not local", () => {
    // utcDateKey on a fixed UTC Date should produce the UTC date string
    const utcMidnight = new Date(Date.UTC(2026, 4, 28, 0, 0, 0)); // 2026-05-28T00:00:00Z
    expect(utcDateKey(utcMidnight)).toBe("2026-05-28");

    // Even if local time is "yesterday" (UTC-5 would be May 27 at 19:00 local),
    // the UTC date key is still 2026-05-28
    const store = {
      habits: [{ id: "h1" }],
      checkIns: {
        h1: { "2026-05-28": true as const },
      },
    };
    expect(maxStreak(store, utcMidnight)).toBe(1);
  });

  it("utcDateKey produces YYYY-MM-DD in UTC", () => {
    // Verify helper directly
    const d = new Date(Date.UTC(2026, 0, 5)); // Jan 5, 2026
    expect(utcDateKey(d)).toBe("2026-01-05");
  });
});

// ---------------------------------------------------------------------------
// AC-RD-HABIT-6: max across multiple habits
// ---------------------------------------------------------------------------
describe("maxStreak — max across habits (AC-RD-HABIT-6)", () => {
  it("returns the maximum streak across all habits", () => {
    const today = new Date(Date.UTC(2026, 4, 28));
    const store = {
      habits: [{ id: "h1" }, { id: "h2" }, { id: "h3" }],
      checkIns: {
        h1: { "2026-05-28": true as const }, // streak 1
        h2: {
          "2026-05-26": true as const,
          "2026-05-27": true as const,
          "2026-05-28": true as const,
        }, // streak 3
        h3: { "2026-05-27": true as const }, // today not checked → streak 0
      },
    };
    expect(maxStreak(store, today)).toBe(3);
  });

  it("returns 0 when no habit has today checked", () => {
    const today = new Date(Date.UTC(2026, 4, 28));
    const store = {
      habits: [{ id: "h1" }, { id: "h2" }],
      checkIns: {
        h1: { "2026-05-27": true as const },
        h2: { "2026-05-26": true as const },
      },
    };
    expect(maxStreak(store, today)).toBe(0);
  });
});

import { describe, it, expect } from "vitest";
import {
  aggregateRange,
  bucketLevel,
  computeStreak,
} from "../internal/aggregators.js";
import { EMPTY_HABITS_STATE } from "../internal/isHabitsStateRecord.js";
import type { PomodoroSessionRecord } from "../internal/isPomodoroSession.js";
import { makeHabit } from "./__fixtures__/habits.js";

const NOW = new Date("2026-05-23T10:30:00Z"); // Saturday UTC

function focus(finishedAt: string, minutes = 25): PomodoroSessionRecord {
  return {
    mode: "focus",
    durationMs: minutes * 60_000,
    elapsedMs: minutes * 60_000,
    finishedAt,
  };
}

describe("aggregateRange — empty inputs", () => {
  it("A1: empty + empty produces zero buckets, peak=null, em-dash trends", () => {
    const agg = aggregateRange("week", [], EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.labels).toHaveLength(7);
    expect(agg.focusBuckets.every((v) => v === 0)).toBe(true);
    expect(agg.taskBuckets.every((v) => v === 0)).toBe(true);
    expect(agg.peakHour).toBeNull();
    expect(agg.kpis.tasksTotal).toBe(0);
    expect(agg.kpis.focusMinutesTotal).toBe(0);
    expect(agg.kpis.habitsKeptStr).toBe("0/0");
    expect(agg.kpis.tasksTrend).toBe("—");
    expect(agg.kpis.focusTrend).toBe("—");
    expect(agg.kpis.avgTrend).toBe("—");
    expect(agg.tagDistribution).toEqual([]);
    expect(agg.habitRanking).toEqual([]);
  });
});

describe("aggregateRange — single focus session current week", () => {
  it("A2: one session current, none prior → focusTrend='—', tasksTotal=0 (no done tasks), tasksTrend='—'", () => {
    const sessions = [focus("2026-05-20T09:00:00Z", 25)]; // Wed inside current week
    const agg = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    // tasksTotal comes from xai_task_cols now (not sessions), so 0 with no taskCols
    expect(agg.kpis.tasksTotal).toBe(0);
    expect(agg.kpis.tasksTrend).toBe("—");
    expect(agg.kpis.focusMinutesTotal).toBe(25);
    expect(agg.kpis.focusTrend).toBe("—");
    expect(agg.peakHour).toBe(new Date("2026-05-20T09:00:00Z").getHours());
  });
});

describe("aggregateRange — sessions in current and prior week", () => {
  it("A3: 3 current vs 2 prior → focusTrend='+50%', tasksTrend always '—' (real count, no prior-window)", () => {
    const sessions = [
      focus("2026-05-19T09:00:00Z", 25),
      focus("2026-05-20T09:00:00Z", 25),
      focus("2026-05-21T09:00:00Z", 25),
      // prior week
      focus("2026-05-12T09:00:00Z", 25),
      focus("2026-05-13T09:00:00Z", 25),
    ];
    const agg = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    // tasksTotal is from real done count (0 here — no taskCols seeded)
    expect(agg.kpis.tasksTotal).toBe(0);
    expect(agg.kpis.focusMinutesTotal).toBe(75);
    expect(agg.kpis.focusTrend).toBe("+50%");
    // tasksTrend is ALWAYS "—" (no honest prior-window for a timestamp-less count)
    expect(agg.kpis.tasksTrend).toBe("—");
  });
});

describe("aggregateRange — hour distribution", () => {
  it("A4: hour bucket math + peak", () => {
    const sessions = [
      focus("2026-05-20T09:00:00Z", 25),
      focus("2026-05-21T09:00:00Z", 25),
      focus("2026-05-22T14:00:00Z", 25),
    ];
    const agg = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.hourDistribution[new Date("2026-05-20T09:00:00Z").getHours()]).toBe(50);
    expect(agg.hourDistribution[new Date("2026-05-22T14:00:00Z").getHours()]).toBe(25);
    expect(agg.peakHour).toBe(new Date("2026-05-20T09:00:00Z").getHours());
  });
});

describe("aggregateRange — break sessions ignored", () => {
  it("A5: short-break / long-break do not contribute", () => {
    const sessions: PomodoroSessionRecord[] = [
      { mode: "short-break", durationMs: 300_000, finishedAt: "2026-05-20T09:00:00Z" },
      { mode: "long-break", durationMs: 900_000, finishedAt: "2026-05-20T10:00:00Z" },
    ];
    const agg = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.kpis.tasksTotal).toBe(0);
    expect(agg.kpis.focusMinutesTotal).toBe(0);
    expect(agg.peakHour).toBeNull();
  });
});

describe("aggregateRange — tag distribution", () => {
  it("A6: groups by emoji, top 5, color rotates", () => {
    const habits = {
      habits: [
        // typed as unknown via fixture; we know the shape
        makeHabit("h1", "☕", "Coffee", "咖啡"),
        makeHabit("h2", "💧", "Water", "饮水"),
        makeHabit("h3", "🏃", "Run", "跑步"),
      ] as unknown as [],
      checkIns: {
        h1: { /* no check-ins this week */ } as Record<string, boolean>,
        h2: { "2026-05-18": true, "2026-05-19": true } as Record<string, boolean>,
        h3: {
          "2026-05-18": true,
          "2026-05-19": true,
          "2026-05-20": true,
          "2026-05-21": true,
        } as Record<string, boolean>,
      },
      diaries: {} as Record<string, unknown>,
    };
    const agg = aggregateRange("week", [], habits, 0, NOW, "en");
    // top group: 🏃 (4), then 💧 (2). ☕ has 0 → excluded.
    expect(agg.tagDistribution.length).toBe(2);
    expect(agg.tagDistribution[0]!.emoji).toBe("🏃");
    expect(agg.tagDistribution[0]!.color).toBe("var(--accent)");
    expect(agg.tagDistribution[1]!.emoji).toBe("💧");
    expect(agg.tagDistribution[1]!.color).toBe("var(--blue)");
    // percentages sum to ~100
    const sum = agg.tagDistribution.reduce((a, s) => a + s.percent, 0);
    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
  });

  it("A7: empty when no check-ins", () => {
    const habits = {
      habits: [makeHabit("h1", "☕", "Coffee", "咖啡")] as unknown as [],
      checkIns: {} as Record<string, Record<string, boolean>>,
      diaries: {} as Record<string, unknown>,
    };
    const agg = aggregateRange("week", [], habits, 0, NOW, "en");
    expect(agg.tagDistribution).toEqual([]);
  });
});

describe("aggregateRange — habit ranking", () => {
  it("A8-A9: sorts desc by percent, caps at 5", () => {
    const habits = {
      habits: [
        makeHabit("h1", "💧", "Water", "饮水"),
        makeHabit("h2", "🏃", "Run", "跑步"),
        makeHabit("h3", "☕", "Coffee", "咖啡"),
        makeHabit("h4", "📖", "Read", "阅读"),
        makeHabit("h5", "🧘", "Meditate", "冥想"),
        makeHabit("h6", "💤", "Sleep", "睡眠"),
      ] as unknown as [],
      checkIns: {
        h1: { "2026-05-18": true, "2026-05-19": true, "2026-05-20": true } as Record<string, boolean>,
        h2: {} as Record<string, boolean>,
      } as Record<string, Record<string, boolean>>,
      diaries: {} as Record<string, unknown>,
    };
    const agg = aggregateRange("week", [], habits, 0, NOW, "en");
    expect(agg.habitRanking.length).toBe(5);
    expect(agg.habitRanking[0]!.id).toBe("h1");
    expect(agg.habitRanking[0]!.percent).toBeGreaterThan(0);
  });

  it("A10: streak defaults to 0 when no consecutive check-ins ending today", () => {
    const habits = {
      habits: [makeHabit("h1", "💧", "Water", "饮水")] as unknown as [],
      checkIns: {
        // gap before today (2026-05-23)
        h1: { "2026-05-18": true, "2026-05-19": true } as Record<string, boolean>,
      } as Record<string, Record<string, boolean>>,
      diaries: {} as Record<string, unknown>,
    };
    const agg = aggregateRange("week", [], habits, 0, NOW, "en");
    expect(agg.habitRanking[0]!.streak).toBe(0);
  });
});

describe("aggregateRange — month / all ranges", () => {
  it("A11: month has 4 buckets", () => {
    const agg = aggregateRange("month", [], EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.labels).toHaveLength(4);
  });

  it("A12: all has 5 buckets", () => {
    const agg = aggregateRange("all", [], EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.labels).toHaveLength(5);
  });

  it("A13: all three return the same shape", () => {
    const w = aggregateRange("week", [], EMPTY_HABITS_STATE, 0, NOW, "en");
    const m = aggregateRange("month", [], EMPTY_HABITS_STATE, 0, NOW, "en");
    const a = aggregateRange("all", [], EMPTY_HABITS_STATE, 0, NOW, "en");
    for (const agg of [w, m, a]) {
      expect(typeof agg.range).toBe("string");
      expect(Array.isArray(agg.labels)).toBe(true);
      expect(Array.isArray(agg.focusBuckets)).toBe(true);
      expect(Array.isArray(agg.taskBuckets)).toBe(true);
      expect(agg.kpis).toBeTruthy();
    }
  });
});

describe("aggregateRange — invariants", () => {
  it("A14: undated current completions contribute to total but never fabricate a date bucket", () => {
    const taskCols = {
      overdue: { tasks: [{ done: true }, { done: false }] },
      next7:   { tasks: [{ done: true }] },
    };
    const sessions = [
      focus("2026-05-19T09:00:00Z"),
      focus("2026-05-20T09:00:00Z"),
      focus("2026-05-21T09:00:00Z"),
    ];
    const agg = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en", taskCols);
    // tasksTotal = real count (2), not session count (3)
    expect(agg.kpis.tasksTotal).toBe(2);
    expect(agg.taskBuckets.every(n => n === 0)).toBe(true);
    expect(agg.undatedCompletedTasks).toBe(2);
    expect(agg.taskSeriesAvailable).toBe(false);
  });

  it("A15: focusMinutesTotal === sum(focusBuckets)", () => {
    const sessions = [focus("2026-05-19T09:00:00Z", 25), focus("2026-05-20T09:00:00Z", 50)];
    const agg = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.kpis.focusMinutesTotal).toBe(agg.focusBuckets.reduce((a, b) => a + b, 0));
    expect(agg.kpis.focusMinutesTotal).toBe(75);
  });

  it("A16: dailyAvg === round(focusMinutesTotal / labels.length)", () => {
    const sessions = [focus("2026-05-19T09:00:00Z", 25)];
    const agg = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.kpis.dailyAvgMinutes).toBe(Math.round(25 / 7));
  });

  it("A17: habitsKeptStr is 'kept/total'", () => {
    const habits = {
      habits: [
        makeHabit("h1", "💧", "Water", "饮水"),
        makeHabit("h2", "🏃", "Run", "跑步"),
      ] as unknown as [],
      checkIns: {
        h1: { "2026-05-18": true } as Record<string, boolean>,
      } as Record<string, Record<string, boolean>>,
      diaries: {} as Record<string, unknown>,
    };
    const agg = aggregateRange("week", [], habits, 0, NOW, "en");
    expect(agg.kpis.habitsKeptStr).toBe("1/2");
  });

  it("A18: 0/0 when no habits", () => {
    const agg = aggregateRange("week", [], EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(agg.kpis.habitsKeptStr).toBe("0/0");
  });

  it("A19: habitsKeptTrend = '100%' when fully kept", () => {
    const habits = {
      habits: [makeHabit("h1", "💧", "Water", "饮水")] as unknown as [],
      checkIns: {
        h1: { "2026-05-18": true } as Record<string, boolean>,
      } as Record<string, Record<string, boolean>>,
      diaries: {} as Record<string, unknown>,
    };
    const agg = aggregateRange("week", [], habits, 0, NOW, "en");
    expect(agg.kpis.habitsKeptTrend).toBe("100%");
  });

  it("A20: pure function — same inputs → deep-equal output", () => {
    const sessions = [focus("2026-05-19T09:00:00Z")];
    const a1 = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    const a2 = aggregateRange("week", sessions, EMPTY_HABITS_STATE, 0, NOW, "en");
    expect(a1).toEqual(a2);
  });

  it("A21: range-invariant — tasksTotal same across week/month/all for same taskCols", () => {
    const taskCols = {
      overdue: { tasks: [{ done: true }, { done: true }] },
      next7:   { tasks: [{ done: false }] },
    };
    const weekAgg  = aggregateRange("week",  [], EMPTY_HABITS_STATE, 0, NOW, "en", taskCols);
    const monthAgg = aggregateRange("month", [], EMPTY_HABITS_STATE, 0, NOW, "en", taskCols);
    const allAgg   = aggregateRange("all",   [], EMPTY_HABITS_STATE, 0, NOW, "en", taskCols);
    expect(weekAgg.kpis.tasksTotal).toBe(2);
    expect(monthAgg.kpis.tasksTotal).toBe(2);
    expect(allAgg.kpis.tasksTotal).toBe(2);
    // tasksTrend is always "—" regardless of range
    expect(weekAgg.kpis.tasksTrend).toBe("—");
    expect(monthAgg.kpis.tasksTrend).toBe("—");
    expect(allAgg.kpis.tasksTrend).toBe("—");
  });

  it("A22: read-only — aggregateRange does NOT mutate the taskCols input", () => {
    const taskCols = {
      overdue: { tasks: [{ done: true }] },
    };
    const taskColsBefore = JSON.stringify(taskCols);
    aggregateRange("week", [], EMPTY_HABITS_STATE, 0, NOW, "en", taskCols);
    expect(JSON.stringify(taskCols)).toBe(taskColsBefore);
  });

  it("A23: pomodoro/habits regression — focus/habits KPIs unaffected by proxy retirement", () => {
    // Ensure retiring the tasks proxy did NOT break focus or habits aggregation
    const sessions = [
      focus("2026-05-20T09:00:00Z", 30),
      focus("2026-05-21T09:00:00Z", 30),
    ];
    const habits = {
      habits: [makeHabit("h1", "💧", "Water", "饮水")] as unknown as [],
      checkIns: {
        h1: { "2026-05-18": true } as Record<string, boolean>,
      } as Record<string, Record<string, boolean>>,
      diaries: {} as Record<string, unknown>,
    };
    const agg = aggregateRange("week", sessions, habits, 0, NOW, "en");
    // Focus KPI still works correctly
    expect(agg.kpis.focusMinutesTotal).toBe(60);
    expect(agg.focusBuckets.reduce((a, b) => a + b, 0)).toBe(60);
    // Habits KPI still works correctly
    expect(agg.kpis.habitsKeptStr).toBe("1/1");
    expect(agg.kpis.habitsKeptTrend).toBe("100%");
    // Tasks is now real (0 — no taskCols seeded)
    expect(agg.kpis.tasksTotal).toBe(0);
    expect(agg.kpis.tasksTrend).toBe("—");
  });
});

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    const checkIns = {
      "2026-05-21": true,
      "2026-05-22": true,
      "2026-05-23": true,
    };
    expect(computeStreak(checkIns, NOW)).toBe(3);
  });

  it("stops at the first gap", () => {
    const checkIns = {
      "2026-05-20": true,
      // gap on 2026-05-21
      "2026-05-22": true,
      "2026-05-23": true,
    };
    expect(computeStreak(checkIns, NOW)).toBe(2);
  });

  it("returns 0 when today has no check-in", () => {
    expect(computeStreak({}, NOW)).toBe(0);
  });
});

describe("bucketLevel", () => {
  it("H7: threshold map", () => {
    expect(bucketLevel(0)).toBe(0);
    expect(bucketLevel(1)).toBe(1);
    expect(bucketLevel(15)).toBe(1);
    expect(bucketLevel(16)).toBe(2);
    expect(bucketLevel(45)).toBe(2);
    expect(bucketLevel(46)).toBe(3);
    expect(bucketLevel(90)).toBe(3);
    expect(bucketLevel(91)).toBe(4);
    expect(bucketLevel(999)).toBe(4);
  });
});

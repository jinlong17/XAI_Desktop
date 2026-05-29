/**
 * notifications.ts tests — AC-RD-OVERDUE-1..5 + AC-RD-TODAY-1..6 + AC-RD-COMBINE-1..3
 *
 * Pure unit tests for overdueTasks, todaysEvents, buildNotifications.
 * No RTL / no React / no localStorage. Deterministic via injected `now`.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * Test:   packages/xai-web-dashboard-widgets/docs/test.md §G.3
 *
 * Fixture shape used by all tests:
 *   - xai_task_cols: { overdue: { tasks: TaskCard[]; completed?: TaskCard[] }, ... }
 *   - xai_calendar_events: Record<string, UserCalEventMin>
 */
import { describe, it, expect } from "vitest";
import { overdueTasks, todaysEvents, buildNotifications } from "../notifications.js";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const NOW = new Date("2026-05-29T14:30:00"); // local 2026-05-29 14:30

const OVERDUE_TASK_1 = {
  id: "t1",
  title: { en: "Finish report", zh: "完成报告" },
  done: false,
};
const OVERDUE_TASK_2 = {
  id: "t2",
  title: { en: "Submit invoice", zh: "提交发票" },
  // done absent = not done
};
const DONE_TASK = {
  id: "t3",
  title: { en: "Done task", zh: "已完成任务" },
  done: true,
};

const OVERDUE_COL = {
  tasks: [OVERDUE_TASK_1, OVERDUE_TASK_2],
  completed: [DONE_TASK],
};

const STORE_WITH_OVERDUE = {
  overdue: OVERDUE_COL,
  next7: { tasks: [] },
  later: { tasks: [] },
  nodate: { tasks: [] },
};

const TODAY_EVENT = {
  id: "ev1",
  title: "Team standup",
  startISO: "2026-05-29T09:00",
  endISO: "2026-05-29T09:30",
  colorPreset: "mint",
  recurrence: null,
};

const TODAY_EVENT_LATE = {
  id: "ev2",
  title: "Design review",
  startISO: "2026-05-29T15:00",
  endISO: "2026-05-29T16:00",
  colorPreset: "blue",
  recurrence: null,
};

const TOMORROW_EVENT = {
  id: "ev3",
  title: "Team lunch",
  startISO: "2026-05-30T12:00",
  endISO: "2026-05-30T13:00",
  colorPreset: "amber",
  recurrence: null,
};

const CAL_STORE_TODAY = {
  ev1: TODAY_EVENT,
  ev2: TODAY_EVENT_LATE,
  ev3: TOMORROW_EVENT,
};

// ---------------------------------------------------------------------------
// AC-RD-OVERDUE — overdueTasks
// ---------------------------------------------------------------------------

describe("AC-RD-OVERDUE-1: defensive — malformed input → [] (never throws)", () => {
  it("overdueTasks({}, 'en') → []", () => {
    expect(overdueTasks({}, "en")).toEqual([]);
  });
  it("overdueTasks(null, 'en') → []", () => {
    expect(overdueTasks(null, "en")).toEqual([]);
  });
  it("overdueTasks([], 'en') → []", () => {
    expect(overdueTasks([], "en")).toEqual([]);
  });
  it("overdueTasks({overdue:42}, 'en') → []", () => {
    expect(overdueTasks({ overdue: 42 }, "en")).toEqual([]);
  });
  it("never throws on malformed input", () => {
    expect(() => overdueTasks(null, "en")).not.toThrow();
    expect(() => overdueTasks({ overdue: "bad" }, "en")).not.toThrow();
  });
});

describe("AC-RD-OVERDUE-2: reads OVERDUE bucket specifically — next7/later/nodate tasks excluded", () => {
  it("store with cards only in next7/later/nodate (empty overdue) → []", () => {
    const store = {
      overdue: { tasks: [] },
      next7: { tasks: [{ id: "x", title: { en: "X", zh: "X" }, done: false }] },
      later: { tasks: [] },
      nodate: { tasks: [] },
    };
    expect(overdueTasks(store, "en")).toEqual([]);
  });
});

describe("AC-RD-OVERDUE-3: overdue tasks with done !== true → one signal each; done === true excluded", () => {
  it("2 undone overdue tasks produce 2 signals with sourceType='task-overdue'", () => {
    const sigs = overdueTasks(STORE_WITH_OVERDUE, "en");
    expect(sigs.length).toBe(2);
    for (const s of sigs) {
      expect(s.sourceType).toBe("task-overdue");
    }
  });
  it("done=true task in overdue.tasks is excluded", () => {
    const store = {
      overdue: { tasks: [DONE_TASK, OVERDUE_TASK_1] },
    };
    const sigs = overdueTasks(store, "en");
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.label).toBe("Finish report");
  });
  it("label uses card.title[lang]", () => {
    const sigs = overdueTasks(STORE_WITH_OVERDUE, "en");
    const labels = sigs.map((s) => s.label);
    expect(labels).toContain("Finish report");
    expect(labels).toContain("Submit invoice");
  });
});

describe("AC-RD-OVERDUE-4: overdue.completed? array cards also filtered by done !== true", () => {
  it("done=true card in overdue.completed is excluded", () => {
    const store = {
      overdue: {
        tasks: [OVERDUE_TASK_1],
        completed: [DONE_TASK, OVERDUE_TASK_2], // DONE_TASK has done:true → excluded
      },
    };
    const sigs = overdueTasks(store, "en");
    // t1 + t2 (from tasks + completed), DONE_TASK excluded
    expect(sigs.length).toBe(2);
  });
  it("overdue.completed? cards with done !== true → included", () => {
    const undoneInCompleted = {
      id: "t-comp",
      title: { en: "Undone-in-completed", zh: "未完成" },
      done: false,
    };
    const store = {
      overdue: {
        tasks: [],
        completed: [undoneInCompleted],
      },
    };
    const sigs = overdueTasks(store, "en");
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.label).toBe("Undone-in-completed");
  });
});

describe("AC-RD-OVERDUE-5: bilingual — lang=zh uses title.zh", () => {
  it("zh labels use title.zh", () => {
    const sigs = overdueTasks(STORE_WITH_OVERDUE, "zh");
    const labels = sigs.map((s) => s.label);
    expect(labels).toContain("完成报告");
    expect(labels).toContain("提交发票");
  });
  it("en labels use title.en", () => {
    const sigs = overdueTasks(STORE_WITH_OVERDUE, "en");
    const labels = sigs.map((s) => s.label);
    expect(labels).toContain("Finish report");
    expect(labels).toContain("Submit invoice");
  });
});

// ---------------------------------------------------------------------------
// AC-RD-TODAY — todaysEvents
// ---------------------------------------------------------------------------

describe("AC-RD-TODAY-1: defensive — malformed input → [] (never throws)", () => {
  it("todaysEvents({}, now) → []", () => {
    expect(todaysEvents({}, NOW)).toEqual([]);
  });
  it("todaysEvents(null, now) → []", () => {
    expect(todaysEvents(null, NOW)).toEqual([]);
  });
  it("never throws", () => {
    expect(() => todaysEvents(null, NOW)).not.toThrow();
    expect(() => todaysEvents([], NOW)).not.toThrow();
  });
});

describe("AC-RD-TODAY-2: today-date event → one signal; different-day event excluded", () => {
  it("event on today (2026-05-29) → one signal with sourceType=calendar-today", () => {
    const store = { ev1: TODAY_EVENT };
    const sigs = todaysEvents(store, NOW);
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.sourceType).toBe("calendar-today");
    expect(sigs[0]!.label).toBe("Team standup");
    expect(sigs[0]!.time).toBe("09:00");
  });
  it("event on tomorrow (2026-05-30) excluded", () => {
    const store = { ev3: TOMORROW_EVENT };
    const sigs = todaysEvents(store, NOW);
    expect(sigs.length).toBe(0);
  });
});

describe("AC-RD-TODAY-3: multiple today events sorted by HH:MM ascending", () => {
  it("today events sorted by time ascending (09:00 before 15:00)", () => {
    const sigs = todaysEvents(CAL_STORE_TODAY, NOW);
    // ev1 (09:00) and ev2 (15:00) are today; ev3 (tomorrow) excluded
    const todaySigs = sigs.filter((s) => s.sourceType === "calendar-today");
    expect(todaySigs.length).toBe(2);
    expect(todaySigs[0]!.time).toBe("09:00");
    expect(todaySigs[1]!.time).toBe("15:00");
  });
});

describe("AC-RD-TODAY-4: DAILY-recurring event with past anchor → today instance still surfaces (RM3)", () => {
  it("daily-recurring event with anchor yesterday → today instance produced", () => {
    const yesterday = "2026-05-28"; // one day before NOW (2026-05-29)
    const recurringDaily = {
      id: "daily1",
      title: "Daily standup",
      startISO: `${yesterday}T10:00`,
      endISO: `${yesterday}T10:30`,
      colorPreset: "blue" as const,
      recurrence: { kind: "daily" as const },
    };
    const store = { d1: recurringDaily };
    const sigs = todaysEvents(store, NOW);
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.label).toBe("Daily standup");
    expect(sigs[0]!.time).toBe("10:00");
  });
});

describe("AC-RD-TODAY-5: WEEKLY-recurring event landing on today → today instance; non-matching weekday excluded", () => {
  it("weekly-recurring event anchored 7 days ago → today instance produced", () => {
    const sevenDaysAgo = "2026-05-22"; // exactly 7 days before 2026-05-29 (Thursday)
    const weeklyEv = {
      id: "wk1",
      title: "Weekly review",
      startISO: `${sevenDaysAgo}T14:00`,
      endISO: `${sevenDaysAgo}T15:00`,
      colorPreset: "mint" as const,
      recurrence: { kind: "weekly" as const },
    };
    const store = { wk1: weeklyEv };
    const sigs = todaysEvents(store, NOW);
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.label).toBe("Weekly review");
  });

  it("weekly-recurring event anchored 6 days ago (wrong weekday) → no today instance", () => {
    const sixDaysAgo = "2026-05-23"; // 6 days before 2026-05-29 (Friday, not Thu)
    const weeklyEv = {
      id: "wk2",
      title: "Off-day review",
      startISO: `${sixDaysAgo}T14:00`,
      endISO: `${sixDaysAgo}T15:00`,
      colorPreset: "amber" as const,
      recurrence: { kind: "weekly" as const },
    };
    const store = { wk2: weeklyEv };
    const sigs = todaysEvents(store, NOW);
    // 6 days ago is a different weekday → no weekly instance on today
    expect(sigs.length).toBe(0);
  });
});

describe("AC-RD-TODAY-6: LOCAL date basis — event at 23:30 on today (local) IS today even with now=14:30", () => {
  it("event at 2026-05-29T23:30 with now=2026-05-29T14:30 → IS surfaced (day-START basis, not current-time)", () => {
    // Key feature: todaysEvents uses DAY-START (localDateKey only, not current-minute comparison)
    const lateEvent = {
      id: "ev-late",
      title: "Late meeting",
      startISO: "2026-05-29T23:30",
      endISO: "2026-05-29T23:59",
      colorPreset: "rose" as const,
      recurrence: null,
    };
    const store = { late: lateEvent };
    const nowEarly = new Date("2026-05-29T08:00:00"); // earlier in the day
    const sigs = todaysEvents(store, nowEarly);
    // With day-START basis, event at 23:30 is still today
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.label).toBe("Late meeting");
    expect(sigs[0]!.time).toBe("23:30");
  });

  it("past-time-today event (e.g. 09:00 with now=14:30) is STILL surfaced (build-rec-1 compliance)", () => {
    const pastTimeToday = {
      id: "ev-past",
      title: "Morning meeting",
      startISO: "2026-05-29T09:00",
      endISO: "2026-05-29T09:30",
      colorPreset: "mint" as const,
      recurrence: null,
    };
    const store = { past: pastTimeToday };
    // NOW is 14:30 — the event at 09:00 has already passed
    const sigs = todaysEvents(store, NOW);
    // With day-START basis, past-time-today is still surfaced
    expect(sigs.length).toBe(1);
    expect(sigs[0]!.label).toBe("Morning meeting");
  });
});

// ---------------------------------------------------------------------------
// AC-RD-COMBINE — buildNotifications
// ---------------------------------------------------------------------------

describe("AC-RD-COMBINE-1: overdue signals ordered before today signals", () => {
  it("overdue task appears before today's calendar event in combined output", () => {
    const sigs = buildNotifications(STORE_WITH_OVERDUE, CAL_STORE_TODAY, NOW, "en");
    const types = sigs.map((s) => s.sourceType);
    // All task-overdue come before all calendar-today
    const lastOverdueIdx = types.lastIndexOf("task-overdue");
    const firstTodayIdx = types.indexOf("calendar-today");
    if (lastOverdueIdx >= 0 && firstTodayIdx >= 0) {
      expect(lastOverdueIdx).toBeLessThan(firstTodayIdx);
    }
  });
});

describe("AC-RD-COMBINE-2: capped at max (6) even when more qualify", () => {
  it("with 5 overdue + 3 today events, capped at 6", () => {
    const manyOverdue = {
      overdue: {
        tasks: Array.from({ length: 5 }, (_, i) => ({
          id: `t${i}`,
          title: { en: `Task ${i}`, zh: `任务 ${i}` },
          done: false,
        })),
      },
    };
    const manyEvents = {
      e1: { ...TODAY_EVENT, id: "e1" },
      e2: { ...TODAY_EVENT, id: "e2", startISO: "2026-05-29T10:00", endISO: "2026-05-29T11:00" },
      e3: { ...TODAY_EVENT, id: "e3", startISO: "2026-05-29T11:00", endISO: "2026-05-29T12:00" },
    };
    const sigs = buildNotifications(manyOverdue, manyEvents, NOW, "en", 6);
    expect(sigs.length).toBeLessThanOrEqual(6);
    // With 5 overdue + 3 today → 8 total, capped to 6
    expect(sigs.length).toBe(6);
  });
});

describe("AC-RD-COMBINE-3: both sources empty → []", () => {
  it("empty task store + empty cal store → []", () => {
    const sigs = buildNotifications({}, {}, NOW, "en");
    expect(sigs).toEqual([]);
  });
  it("null inputs → []", () => {
    const sigs = buildNotifications(null, null, NOW, "en");
    expect(sigs).toEqual([]);
  });
});

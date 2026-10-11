/**
 * contextProvider.test.ts — CP-1..CP-8
 *
 * Tests for buildTodayContext: per-source narrowing, today-filter,
 * empty-state, deterministic output, token-budget.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension FA-1
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 CP tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildTodayContext } from "../internal/contextProvider.js";

// We spy on getPref to avoid depending on real localStorage in unit tests.
// The contextProvider reads keys directly via getPref().
vi.mock("@repo/plugin-web-storage", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/plugin-web-storage")>()),
  getPref: vi.fn().mockReturnValue(null),
  setPref: vi.fn(),
}));

import { getPref } from "@repo/plugin-web-storage";
const mockGetPref = vi.mocked(getPref);

const TODAY = new Date("2026-05-29T09:00:00");
const TODAY_KEY = "2026-05-29";

function makeTasks(titles: string[], bucketId = "next7") {
  return [
    {
      id: bucketId,
      key: bucketId,
      count: titles.length,
      tasks: titles.map((title, i) => ({
        id: `t${i}`,
        title: { en: title, zh: title },
        done: false,
      })),
    },
  ];
}

function makeCalEvents(events: Array<{ title: string; startISO: string; endISO: string }>) {
  const store: Record<string, unknown> = {};
  events.forEach((e, i) => {
    store[`ev${i}`] = { id: `ev${i}`, ...e };
  });
  return store;
}

function makePomodoroSessions(
  sessions: Array<{ date: string; durationMs: number; mode: string }>,
) {
  return sessions;
}

function makeHabitsState(habits: Array<{ id: string; name: string; checkIns?: Record<string, boolean> }>) {
  return { habits };
}

beforeEach(() => {
  mockGetPref.mockReset();
  mockGetPref.mockReturnValue(null);
});

describe("CP-1: task narrowing — valid task cols produce task lines", () => {
  it("includes open tasks from next7 bucket", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_task_cols") return makeTasks(["Buy groceries", "Write report"]);
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.isEmpty).toBe(false);
    expect(result.text).toContain("Buy groceries");
    expect(result.text).toContain("Write report");
    expect(result.text).toContain("[next7]");
  });
});

describe("CP-2: task narrowing — done tasks are excluded", () => {
  it("skips done=true tasks", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_task_cols") {
        return [
          {
            id: "next7",
            key: "next7",
            count: 2,
            tasks: [
              { id: "t1", title: { en: "Open task", zh: "Open task" }, done: false },
              { id: "t2", title: { en: "Done task", zh: "Done task" }, done: true },
            ],
          },
        ];
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("Open task");
    expect(result.text).not.toContain("Done task");
  });
});

describe("CP-3: calendar event narrowing — only today's events included", () => {
  it("filters calendar events to today only", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_calendar_events") {
        return makeCalEvents([
          {
            title: "Today meeting",
            startISO: `${TODAY_KEY}T10:00`,
            endISO: `${TODAY_KEY}T11:00`,
          },
          {
            title: "Tomorrow event",
            startISO: "2026-05-30T10:00",
            endISO: "2026-05-30T11:00",
          },
        ]);
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("Today meeting");
    expect(result.text).not.toContain("Tomorrow event");
  });
});

describe("CP-4: pomodoro narrowing — today focus minutes and session count", () => {
  it("aggregates today's focus sessions", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_pomodoro_sessions") {
        return makePomodoroSessions([
          { date: TODAY_KEY, durationMs: 25 * 60 * 1000, mode: "focus" },
          { date: TODAY_KEY, durationMs: 25 * 60 * 1000, mode: "focus" },
          { date: "2026-05-28", durationMs: 25 * 60 * 1000, mode: "focus" },
          { date: TODAY_KEY, durationMs: 5 * 60 * 1000, mode: "short-break" },
        ]);
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.isEmpty).toBe(false);
    // 2 focus sessions × 25 min = 50 min
    expect(result.text).toContain("50 min");
    expect(result.text).toContain("2 session");
  });
});

describe("CP-5: habits narrowing — today checked habits counted", () => {
  it("counts checked habits for today", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_habits_state") {
        return makeHabitsState([
          { id: "h1", name: "Exercise", checkIns: { [TODAY_KEY]: true } },
          { id: "h2", name: "Read", checkIns: { [TODAY_KEY]: false } },
          { id: "h3", name: "Meditate", checkIns: {} },
        ]);
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.isEmpty).toBe(false);
    expect(result.text).toContain("1/3 checked today");
  });
});

describe("CP-6: empty state — returns isEmpty:true and honest 'no data' line", () => {
  it("returns isEmpty=true when all sources are empty", () => {
    // mockGetPref returns null for all keys (default)
    const result = buildTodayContext(TODAY);
    expect(result.isEmpty).toBe(true);
    expect(result.text).toContain("No tasks");
  });
});

describe("CP-7: malformed data — dropped silently without throw", () => {
  it("handles malformed task cols without throwing", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_task_cols") {
        return [
          null,
          "not-an-object",
          { id: "bad", tasks: "not-array" },
          { id: "next7", tasks: [null, undefined, { id: "t1", title: { en: "Good", zh: "Good" } }] },
        ];
      }
      return null;
    });

    expect(() => buildTodayContext(TODAY)).not.toThrow();
    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("Good");
  });

  it("handles malformed calendar events without throwing", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_calendar_events") {
        return {
          bad1: null,
          bad2: { id: "e2", title: 42, startISO: "not-iso", endISO: "bad" },
          good: {
            id: "eg",
            title: "Good event",
            startISO: `${TODAY_KEY}T14:00`,
            endISO: `${TODAY_KEY}T15:00`,
          },
        };
      }
      return null;
    });

    expect(() => buildTodayContext(TODAY)).not.toThrow();
    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("Good event");
  });
});

describe("CP-8: deterministic output — same inputs produce same text", () => {
  it("returns the same text on repeated calls with same data", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_task_cols") return makeTasks(["Task A", "Task B"]);
      return null;
    });

    const r1 = buildTodayContext(TODAY);
    const r2 = buildTodayContext(TODAY);
    expect(r1.text).toBe(r2.text);
    expect(r1.isEmpty).toBe(r2.isEmpty);
  });
});

// ---------------------------------------------------------------------------
// CP-ID — context id exposure (xai-web-ai-tool-edit-delete ED-2 P1)
// ---------------------------------------------------------------------------

describe("CP-ID-1: task lines include (id: <card.id>) token", () => {
  it("CP-ID-1: each open task line contains (id: <card.id>) token", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_task_cols") {
        return [
          {
            id: "next7",
            key: "next7",
            count: 2,
            tasks: [
              { id: "task-abc-123", title: { en: "Buy groceries", zh: "Buy groceries" }, done: false },
              { id: "task-def-456", title: { en: "Write report", zh: "Write report" }, done: false },
            ],
          },
        ];
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("(id: task-abc-123)");
    expect(result.text).toContain("(id: task-def-456)");
  });
});

describe("CP-ID-2: calendar event lines include (id: <event.id>) token", () => {
  it("CP-ID-2: each today calendar event line contains (id: <event.id>) token", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_calendar_events") {
        return {
          "ev-xyz-789": {
            id: "ev-xyz-789",
            title: "Team standup",
            startISO: `${TODAY_KEY}T09:00`,
            endISO: `${TODAY_KEY}T09:30`,
          },
        };
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("(id: ev-xyz-789)");
    expect(result.text).toContain("Team standup");
  });
});

describe("CP-ID-3: title/time/bucket-label content unchanged (additive regression)", () => {
  it("CP-ID-3: task lines still contain bucket label and title (id token is additive)", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_task_cols") {
        return [
          {
            id: "overdue",
            key: "overdue",
            count: 1,
            tasks: [{ id: "t-reg", title: { en: "Regression check", zh: "Regression check" }, done: false }],
          },
        ];
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("[overdue]");         // bucket label preserved
    expect(result.text).toContain("Regression check");  // title preserved
    expect(result.text).toContain("(id: t-reg)");       // id token additive
  });

  it("CP-ID-3b: calendar lines still contain time range and title (id token is additive)", () => {
    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_calendar_events") {
        return {
          "ev-reg": {
            id: "ev-reg",
            title: "Daily sync",
            startISO: `${TODAY_KEY}T10:00`,
            endISO: `${TODAY_KEY}T10:30`,
          },
        };
      }
      return null;
    });

    const result = buildTodayContext(TODAY);
    expect(result.text).toContain("10:00");      // time preserved
    expect(result.text).toContain("10:30");      // end time preserved
    expect(result.text).toContain("Daily sync"); // title preserved
    expect(result.text).toContain("(id: ev-reg)"); // id token additive
  });
});

describe("CP-ID-4: token budget still ≤ ~600 tokens with large fixture + ids", () => {
  it("CP-ID-4: 20-task + 5-event fixture with ids stays within budget", () => {
    const tasks = Array.from({ length: 20 }, (_, i) => ({
      id: `task-cap-${i}`,
      title: { en: `Task number ${i}`, zh: `Task number ${i}` },
      done: false,
    }));
    const events = Array.from({ length: 5 }, (_, i) => ({
      id: `ev-cap-${i}`,
      title: `Event ${i}`,
      startISO: `${TODAY_KEY}T${String(9 + i).padStart(2, "0")}:00`,
      endISO: `${TODAY_KEY}T${String(10 + i).padStart(2, "0")}:00`,
    }));
    const evStore: Record<string, unknown> = {};
    events.forEach((e) => { evStore[e.id] = e; });

    mockGetPref.mockImplementation((key: string) => {
      if (key === "xai_task_cols") {
        return [{ id: "next7", key: "next7", count: 20, tasks }];
      }
      if (key === "xai_calendar_events") return evStore;
      return null;
    });

    const result = buildTodayContext(TODAY);
    // Rough token estimate: each char ≈ 0.25 tokens; 600 tokens ≈ 2400 chars
    // Budget target is ≤~600 tokens (~2400 chars); allow generous headroom at 3000 chars.
    expect(result.text.length).toBeLessThan(3000);
  });
});

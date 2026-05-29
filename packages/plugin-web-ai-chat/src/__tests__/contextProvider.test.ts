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
vi.mock("@repo/plugin-web-storage", () => ({
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

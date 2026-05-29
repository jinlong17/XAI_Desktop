/**
 * contextProvider — builds a read-only today context snapshot for context injection.
 *
 * Pure function: reads xai_task_cols / xai_calendar_events / xai_pomodoro_sessions /
 * xai_habits_state via getPref() (NOT usePref hook — this runs outside React).
 * Each source is narrowed with a LOCAL boundary predicate (copied from the
 * dataReads/narrowTaskCols precedent — NO cross-plugin import, malformed entries
 * dropped silently). Returns a compact ≤~600-token English snapshot.
 *
 * DESIGN: READ-ONLY. No write, no event emit, no new storage key.
 *
 * Design: packages/xai-web-ai-chat/docs/design.md §2026-05-29 Extension FA-1
 * API contract: packages/xai-web-ai-chat/docs/api.md §13
 * Test strategy: packages/xai-web-ai-chat/docs/test.md §8 (CP tests)
 *
 * @internal
 */

import { getPref } from "@repo/plugin-web-storage";

// ---- Local predicate helpers (copied from dataReads/narrowTaskCols precedent) ----
// These MUST NOT import from other plugin packages — each is a self-contained guard.

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

// ---- Task narrowing (mirrors xai-web-statistics/narrowTaskCols pattern) ----

interface NarrowTaskCard {
  id: string;
  title: { en: string; zh: string } | string;
  done?: boolean;
}

interface NarrowTaskCol {
  id: string;
  tasks: NarrowTaskCard[];
}

function isNarrowTaskCard(x: unknown): x is NarrowTaskCard {
  if (!isObject(x)) return false;
  if (!isString(x["id"])) return false;
  const title = x["title"];
  if (isObject(title)) {
    if (!isString(title["en"])) return false;
  } else if (!isString(title)) {
    return false;
  }
  return true;
}

function isNarrowTaskCol(x: unknown): x is NarrowTaskCol {
  if (!isObject(x)) return false;
  if (!isString(x["id"])) return false;
  if (!Array.isArray(x["tasks"])) return false;
  return true;
}

function narrowTaskCols(raw: unknown): NarrowTaskCol[] {
  if (!Array.isArray(raw)) return [];
  const result: NarrowTaskCol[] = [];
  for (const item of raw as unknown[]) {
    if (!isNarrowTaskCol(item)) continue;
    const tasks: NarrowTaskCard[] = [];
    for (const t of item.tasks as unknown[]) {
      if (isNarrowTaskCard(t)) tasks.push(t);
    }
    result.push({ id: item.id, tasks });
  }
  return result;
}

// ---- Calendar event narrowing ----

interface NarrowCalEvent {
  id: string;
  title: string;
  startISO: string;
  endISO: string;
}

function isNarrowCalEvent(x: unknown): x is NarrowCalEvent {
  if (!isObject(x)) return false;
  return (
    isString(x["id"]) &&
    isString(x["title"]) &&
    isString(x["startISO"]) &&
    isString(x["endISO"])
  );
}

function narrowCalEvents(raw: unknown): NarrowCalEvent[] {
  if (!isObject(raw)) return [];
  const result: NarrowCalEvent[] = [];
  for (const v of Object.values(raw)) {
    if (isNarrowCalEvent(v)) result.push(v);
  }
  return result;
}

function getCalEventDate(startISO: string): string {
  // "YYYY-MM-DDTHH:MM" — date is the first 10 chars
  return startISO.slice(0, 10);
}

// ---- Pomodoro session narrowing ----

interface NarrowPomodoroSession {
  date: string;
  durationMs: number;
  mode?: string;
}

function isNarrowPomodoroSession(x: unknown): x is NarrowPomodoroSession {
  if (!isObject(x)) return false;
  return isString(x["date"]) && typeof x["durationMs"] === "number";
}

function narrowPomodoroSessions(raw: unknown): NarrowPomodoroSession[] {
  if (!Array.isArray(raw)) return [];
  const result: NarrowPomodoroSession[] = [];
  for (const item of raw as unknown[]) {
    if (isNarrowPomodoroSession(item)) result.push(item);
  }
  return result;
}

// ---- Habits state narrowing ----

interface NarrowHabit {
  id: string;
  name: string;
  checkIns?: Record<string, boolean>;
}

function isNarrowHabit(x: unknown): x is NarrowHabit {
  if (!isObject(x)) return false;
  return isString(x["id"]) && isString(x["name"]);
}

function narrowHabitsState(raw: unknown): NarrowHabit[] {
  // xai_habits_state can be an object with a "habits" array or just an array
  if (Array.isArray(raw)) {
    return (raw as unknown[]).filter(isNarrowHabit) as NarrowHabit[];
  }
  if (isObject(raw)) {
    const habits = raw["habits"];
    if (Array.isArray(habits)) {
      return (habits as unknown[]).filter(isNarrowHabit) as NarrowHabit[];
    }
  }
  return [];
}

// ---- Date utilities (local, no import) ----

function todayDateKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTaskTitle(card: NarrowTaskCard): string {
  if (isObject(card.title)) {
    return (card.title as { en: string }).en || "";
  }
  return card.title as string;
}

// ---- Public API ----

export interface TodayContext {
  /** The full context text to inject. Empty string when isEmpty=true. */
  text: string;
  /** True when all four sources are empty (no data for today). */
  isEmpty: boolean;
}

/**
 * Builds a compact today-context snapshot from 4 preference keys.
 *
 * Token budget target: ≤ ~600 tokens. Capped list lengths:
 * - Tasks: top 20 open (across all buckets, prioritised by overdue/next7)
 * - Calendar events: all today's events (typically 0-10)
 * - Pomodoro: aggregate only (focus minutes + session count for today)
 * - Habits: aggregate only (checked/total for today)
 *
 * @param now - Injected for testability. Defaults to new Date().
 */
export function buildTodayContext(now: Date = new Date()): TodayContext {
  const todayKey = todayDateKey(now);

  // ---- 1. Tasks ----
  const rawCols = getPref("xai_task_cols");
  const cols = narrowTaskCols(rawCols);

  // Collect open (not done) tasks prioritizing overdue + next7, capped at 20.
  const TASK_CAP = 20;
  const taskLines: string[] = [];
  const bucketOrder = ["overdue", "next7", "later", "nodate"];

  for (const bucketId of bucketOrder) {
    const col = cols.find((c) => c.id === bucketId);
    if (!col) continue;
    for (const card of col.tasks) {
      if (card.done) continue;
      if (taskLines.length >= TASK_CAP) break;
      const title = getTaskTitle(card);
      if (title) {
        // ED-2: render (id: …) token so the model can target update/delete.
        // Format: "- [bucket] (id: <id>) <title>" — additive; titles/ordering/caps unchanged.
        taskLines.push(`- [${bucketId}] (id: ${card.id}) ${title}`);
      }
    }
    if (taskLines.length >= TASK_CAP) break;
  }

  // ---- 2. Calendar events today ----
  const rawCal = getPref("xai_calendar_events");
  const allEvents = narrowCalEvents(rawCal);
  const todayEvents = allEvents.filter((e) => getCalEventDate(e.startISO) === todayKey);
  todayEvents.sort((a, b) => a.startISO.localeCompare(b.startISO));

  const calLines: string[] = todayEvents.map((e) => {
    const time = e.startISO.slice(11, 16); // "HH:MM"
    const endTime = e.endISO.slice(11, 16);
    // ED-2: render (id: …) token so the model can target update/delete.
    // Format: "- (id: <id>) HH:MM–HH:MM: <title>" — additive; times/titles unchanged.
    return `- (id: ${e.id}) ${time}–${endTime}: ${e.title}`;
  });

  // ---- 3. Pomodoro focus today ----
  const rawPomodoro = getPref("xai_pomodoro_sessions");
  const sessions = narrowPomodoroSessions(rawPomodoro);
  const todaySessions = sessions.filter((s) => s.date === todayKey && s.mode === "focus");
  const focusMinutes = Math.round(
    todaySessions.reduce((acc, s) => acc + s.durationMs, 0) / 60000,
  );
  const focusCount = todaySessions.length;

  // ---- 4. Habits today ----
  const rawHabits = getPref("xai_habits_state");
  const habits = narrowHabitsState(rawHabits);
  const totalHabits = habits.length;
  const checkedHabits = habits.filter((h) => {
    const checkIns = h.checkIns;
    return isObject(checkIns) && checkIns[todayKey] === true;
  }).length;

  // ---- Determine emptiness ----
  const tasksEmpty = taskLines.length === 0;
  const calEmpty = calLines.length === 0;
  const pomodoroEmpty = focusMinutes === 0;
  const habitsEmpty = totalHabits === 0;
  const isEmpty = tasksEmpty && calEmpty && pomodoroEmpty && habitsEmpty;

  if (isEmpty) {
    return {
      text: "[Context: No tasks, calendar events, focus sessions, or habits recorded for today yet.]",
      isEmpty: true,
    };
  }

  // ---- Build context text ----
  const lines: string[] = [
    `[Today's context — ${todayKey}]`,
  ];

  if (!tasksEmpty) {
    lines.push("", "## Open tasks (top 20):");
    lines.push(...taskLines);
  }

  if (!calEmpty) {
    lines.push("", "## Calendar events today:");
    lines.push(...calLines);
  }

  if (!pomodoroEmpty) {
    lines.push("", `## Focus today: ${focusMinutes} min across ${focusCount} session(s)`);
  }

  if (!habitsEmpty) {
    lines.push("", `## Habits: ${checkedHabits}/${totalHabits} checked today`);
  }

  return { text: lines.join("\n"), isEmpty: false };
}

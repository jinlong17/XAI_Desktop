/**
 * @internal — Notifications digest selectors.
 *
 * Aggregates REAL local signals for the Mail→Notifications widget (§G-B):
 *   1. overdueTasks: reads the OVERDUE bucket from xai_task_cols (NOT §F's all-bucket countDone)
 *   2. todaysEvents: reads today's calendar events from xai_calendar_events (REUSE §F's listValidCalEvents)
 *   3. buildNotifications: combined, capped at max (default 6), overdue-first
 *
 * **ALL FUNCTIONS ARE PURE + READ-ONLY.** No usePref setter call, ever (RM1).
 * Defensive: any malformed/missing input → [] (RG3, never throws).
 *
 * §G-B divergences from §F's calUpcoming.ts:
 *   - todaysEvents uses a LOCAL DAY-START basis (not current-time), so events
 *     with startISO earlier in the day are still surfaced (build rec 1 from feature-review).
 *   - Recurrence expansion covers today's full day window (startKey → same startKey).
 *
 * Authority: ADR-0010 §D4 carve-out `43ba6f8`
 * Design:    packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:       packages/xai-web-dashboard-widgets/docs/api.md §G.4
 */

import { isTaskColsRecord } from "./isTaskColsRecord.js";
import { listValidCalEvents } from "./isUserCalEventMap.js";
import type { UserCalEventMin } from "./isUserCalEventMap.js";

// ---------------------------------------------------------------------------
// NotificationSignal type
// ---------------------------------------------------------------------------

export type NotificationSourceType = "task-overdue" | "calendar-today";

export interface NotificationSignal {
  /** "task:<cardId>" | "event:<eventId>|<startISO>" */
  id: string;
  sourceType: NotificationSourceType;
  /** task title[lang] | event title */
  label: string;
  /** event "HH:MM"; overdue tasks: may carry a time string or undefined */
  time?: string;
  /** deterministic sort key (overdue-first, then today-events by HH:MM) */
  sortKey: string;
}

// ---------------------------------------------------------------------------
// Task-overdue helpers
// ---------------------------------------------------------------------------

/** Extended card narrow that includes bilingual title (widen from §F's TaskCardMinimal). */
interface OverdueTaskCard {
  done?: boolean;
  title?: { en?: string; zh?: string } | unknown;
}

function getCardTitle(card: OverdueTaskCard, lang: "en" | "zh"): string {
  const t = card.title;
  if (!t || typeof t !== "object" || Array.isArray(t)) return "";
  const titleObj = t as Record<string, unknown>;
  const s = titleObj[lang];
  if (typeof s === "string") return s;
  // Fallback: try the other lang
  const other = titleObj[lang === "en" ? "zh" : "en"];
  if (typeof other === "string") return other;
  return "";
}

/**
 * Reads the OVERDUE bucket specifically (NOT §F's all-bucket countDone).
 * Cards in next7/later/nodate are not included (AC-RD-OVERDUE-2).
 * Returns NotificationSignal[] for cards where done !== true (OQ-Mail-4).
 * Also includes overdue.completed? array under the same done !== true filter (AC-RD-OVERDUE-4).
 */
export function overdueTasks(store: unknown, lang: "en" | "zh"): NotificationSignal[] {
  if (!isTaskColsRecord(store)) return [];

  const overdue = Array.isArray(store)
    ? store.find((col) => {
        if (typeof col !== "object" || col === null) return false;
        return (col as Record<string, unknown>)["id"] === "overdue";
      })
    : (store as Record<string, unknown>)["overdue"];
  if (!overdue || typeof overdue !== "object" || overdue === null) return [];

  const col = overdue as Record<string, unknown>;
  const tasks: OverdueTaskCard[] = [];

  if (Array.isArray(col.tasks)) {
    for (const c of col.tasks as unknown[]) {
      if (typeof c === "object" && c !== null) tasks.push(c as OverdueTaskCard);
    }
  }
  if (Array.isArray(col.completed)) {
    for (const c of col.completed as unknown[]) {
      if (typeof c === "object" && c !== null) tasks.push(c as OverdueTaskCard);
    }
  }

  const signals: NotificationSignal[] = [];
  for (const card of tasks) {
    // done !== true means absent or false
    if (card.done === true) continue;

    // Need a non-empty id or label to surface
    const cardWithId = card as Record<string, unknown>;
    const cardId =
      typeof cardWithId.id === "string" && cardWithId.id.length > 0
        ? cardWithId.id
        : `overdue-${signals.length}`;
    const label = getCardTitle(card, lang);
    if (!label) continue; // defensive: drop cards with no title

    signals.push({
      id: `task:${cardId}`,
      sourceType: "task-overdue",
      label,
      // Overdue tasks may have a date; if `card.date` is a string, expose it as time
      time:
        typeof cardWithId.date === "string" && cardWithId.date.length > 0
          ? cardWithId.date
          : undefined,
      sortKey: `0_${cardId}`, // overdue sorts before today-events (prefix "0_")
    });
  }
  return signals;
}

// ---------------------------------------------------------------------------
// Today's events helpers (recurrence-aware, LOCAL DAY-START basis — RM3 / build-rec-1)
// ---------------------------------------------------------------------------

/** Build local "YYYY-MM-DD" from a Date. */
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Parse "YYYY-MM-DD" → UTC Date at noon (DST-safe, mirrors calUpcoming / calMonthDots). */
function dateKeyToUTCDate(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0));
}

/** Format UTC Date back to "YYYY-MM-DD". */
function utcDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/**
 * Expand a calendar event into its occurring date-keys within [windowStartKey, windowEndKey].
 * Mirrors calUpcoming.expandRecurrenceLocal semantics (advance date prefix, keep HH:MM).
 * Returns date-key strings ("YYYY-MM-DD").
 */
function expandForWindow(
  event: UserCalEventMin,
  windowStartKey: string,
  windowEndKey: string,
  maxInstances = 366,
): { dateKey: string; startISO: string }[] {
  const windowStart = dateKeyToUTCDate(windowStartKey);
  const windowEnd = dateKeyToUTCDate(windowEndKey);
  if (!windowStart || !windowEnd) return [];
  if (windowEnd.getTime() < windowStart.getTime()) return [];

  const anchorKey = event.startISO.slice(0, 10);
  const anchorDate = dateKeyToUTCDate(anchorKey);
  if (!anchorDate) return [];

  const startTime = event.startISO.slice(11); // "HH:MM"
  const endTime = event.endISO.slice(11);

  if (event.recurrence === null) {
    if (
      anchorDate.getTime() >= windowStart.getTime() &&
      anchorDate.getTime() <= windowEnd.getTime()
    ) {
      return [{ dateKey: anchorKey, startISO: `${anchorKey}T${startTime}` }];
    }
    return [];
  }

  const stepDays = event.recurrence.kind === "daily" ? 1 : 7;
  const out: { dateKey: string; startISO: string }[] = [];
  let cursor = new Date(anchorDate.getTime());

  // Fast-forward into window
  if (cursor.getTime() < windowStart.getTime()) {
    const diffDays = Math.ceil((windowStart.getTime() - cursor.getTime()) / 86_400_000);
    const skipSteps = Math.ceil(diffDays / stepDays);
    cursor = new Date(cursor.getTime() + skipSteps * stepDays * 86_400_000);
  }

  while (cursor.getTime() <= windowEnd.getTime() && out.length < maxInstances) {
    const dk = utcDateKey(cursor);
    out.push({ dateKey: dk, startISO: `${dk}T${startTime}` });
    void endTime; // used for structural parity with expandRecurrenceLocal
    cursor = new Date(cursor.getTime() + stepDays * 86_400_000);
  }

  return out;
}

/**
 * Returns NotificationSignal[] for events occurring TODAY (local date basis — RM3).
 *
 * Uses a DAY-START basis for `now` (NOT current-time) so events earlier in the day
 * are still surfaced (build-rec-1 from feature-review: todaysEvents must use day-start).
 *
 * @param store  Raw value from `usePref("xai_calendar_events")`.
 * @param now    Current Date (injected for testability). Day-key extracted via localDateKey(now).
 */
export function todaysEvents(store: unknown, now: Date): NotificationSignal[] {
  const events = listValidCalEvents(store);
  if (events.length === 0) return [];

  const todayKey = localDateKey(now); // "YYYY-MM-DD" LOCAL date basis (NOT UTC — RM3)

  const signals: NotificationSignal[] = [];
  for (const ev of events) {
    // Expand within today's single-day window (start → end = same day)
    const instances = expandForWindow(ev, todayKey, todayKey);
    for (const inst of instances) {
      // inst.dateKey must equal todayKey (guaranteed by single-day window, but double-check)
      if (inst.dateKey !== todayKey) continue;

      const timeStr = inst.startISO.slice(11); // "HH:MM"
      signals.push({
        id: `event:${ev.id}|${inst.startISO}`,
        sourceType: "calendar-today",
        label: ev.title,
        time: timeStr,
        sortKey: `1_${timeStr}`, // today-events sort after overdue (prefix "1_"); then by HH:MM
      });
    }
  }

  // Sort today-events by HH:MM ascending
  signals.sort((a, b) => (a.sortKey < b.sortKey ? -1 : a.sortKey > b.sortKey ? 1 : 0));

  return signals;
}

// ---------------------------------------------------------------------------
// Combined builder
// ---------------------------------------------------------------------------

/**
 * Combined: [...overdueTasks(taskStore, lang), ...todaysEvents(calStore, now)]
 * capped at `max` (overdue-first, then today-by-time).
 */
export function buildNotifications(
  taskStore: unknown,
  calStore: unknown,
  now: Date,
  lang: "en" | "zh",
  max = 6,
): NotificationSignal[] {
  const signals = [...overdueTasks(taskStore, lang), ...todaysEvents(calStore, now)];
  return signals.slice(0, max);
}

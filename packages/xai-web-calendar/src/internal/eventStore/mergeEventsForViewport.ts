/**
 * @internal — Merge fixture + user events for the active viewport.
 *
 * The fixture (SAMPLE_EVENTS) is indexed by day-of-month (1..31). User
 * events are full-date ("YYYY-MM-DDTHH:MM"). The merge layer projects
 * `UserCalEvent` instances down to the legacy `CalEvent` shape that
 * existing view components (MonthCell / EventBlock) already render.
 *
 * Two consumers:
 *   - Month view: `mergeEventsForMonth` returns a CalEventsByDay (1..31
 *     indexed) consumed by MonthRow.
 *   - Week/Day views: `mergeEventsForWindow` returns a Record<dateKey,
 *     CalEvent[]> consumed by TimeGridDayColumn (already day-key-aware).
 *
 * The fixture stays day-of-month indexed; only the merge layer knows the
 * year/month context. User events outside the displayed month are
 * filtered out at the merge boundary for Month view; for Week/Day the
 * window bounds (startKey, endKey) define inclusion.
 *
 * `data-source` carrying — see api.md §11.6 + design §16.4: the merged
 * event carries `_source` ("fixture" | "user") + `_userId?` so view
 * components can wire user-specific click handlers and apply the
 * `.cal-sample-badge` to fixture chips.
 *
 * Design: docs/design.md §16.7
 * API:    docs/api.md §11.3 / §11.4
 */

import type { CalEvent, CalEventsByDay } from "../sampleEvents.js";
import type { UserCalEvent } from "./types.js";
import { expandRecurrence } from "./expandRecurrence.js";

/**
 * Extended `CalEvent` shape that view components use to differentiate
 * fixture vs user events. The base `CalEvent` shape is untouched; this
 * adds two optional fields that view code reads via narrowing.
 */
export interface MergedCalEvent extends CalEvent {
  /** "fixture" for sample events, "user" for user-created events. */
  _source?: "fixture" | "user";
  /** Original UserCalEvent id; absent for fixture rows. */
  _userId?: string;
  /** Optional tag carried from user-created events. */
  _tag?: string;
  /** Optional reminder label key carried from user-created events. */
  _reminder?: string;
  /** Optional notes / description carried from user-created events. */
  _notes?: string;
  /** True when the user event is explicitly all-day. */
  _allDay?: boolean;
}

/**
 * Format a day-of-month into a `MergedCalEvent` array with `_source = "fixture"`.
 * Fixture rows stay byte-identical; only the metadata fields are appended.
 */
function fixtureRows(fixture: CalEventsByDay, day: number): MergedCalEvent[] {
  const raw = fixture[day] ?? [];
  return raw.map((e) => ({ ...e, _source: "fixture" }));
}

/**
 * Convert a UserCalEvent into the legacy CalEvent display shape.
 * Color preset maps 1:1 onto CalEventColor (rose is a new union member).
 */
function projectToCalEvent(userEvent: UserCalEvent): MergedCalEvent {
  const startTime = userEvent.startISO.slice(11); // "HH:MM"
  const endTime = userEvent.endISO.slice(11);
  return {
    c: userEvent.colorPreset,
    t: { en: userEvent.title, zh: userEvent.title },
    time: userEvent.allDay ? undefined : startTime,
    endTime: userEvent.allDay ? undefined : endTime,
    _source: "user",
    _userId: userEvent.id,
    _tag: userEvent.tag?.trim() || undefined,
    _reminder: userEvent.reminder && userEvent.reminder !== "none" ? userEvent.reminder : undefined,
    _notes: userEvent.notes?.trim() || undefined,
    _allDay: userEvent.allDay === true,
  };
}

/**
 * Returns the byDay map (1..31) consumed by MonthGrid. Fixture rows are
 * preserved; user events that fall inside the displayed month (after
 * recurrence expansion) are merged in. User events outside the month
 * are skipped.
 *
 * Recurrence expansion uses the displayed month's bounds.
 */
export function mergeEventsForMonth(
  fixture: CalEventsByDay,
  userEvents: Record<string, UserCalEvent>,
  displayedYear: number,
  displayedMonth: number,
): Record<number, MergedCalEvent[]> {
  const out: Record<number, MergedCalEvent[]> = {};
  // Seed with fixture rows (carrying _source).
  const lastDay = new Date(displayedYear, displayedMonth, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    out[d] = fixtureRows(fixture, d);
  }
  // Compute window keys.
  const startKey = `${displayedYear}-${String(displayedMonth).padStart(2, "0")}-01`;
  const endKey = `${displayedYear}-${String(displayedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  for (const event of Object.values(userEvents)) {
    const instances = expandRecurrence(event, startKey, endKey);
    for (const inst of instances) {
      const day = Number(inst.startISO.slice(8, 10));
      if (!Number.isFinite(day) || day < 1 || day > lastDay) continue;
      const projected = projectToCalEvent(inst);
      const bucket = out[day] ?? [];
      bucket.push(projected);
      out[day] = bucket;
    }
  }

  // NOTE: fixture rows stay in their original index order (SHIPPED contract).
  // User events appended AFTER fixture rows in the order they were
  // expanded — listEvents() is sorted by createdAt ASC so this is stable.
  return out;
}

/**
 * Returns the byDateKey map ("YYYY-MM-DD" → MergedCalEvent[]) consumed by
 * Week/Day views. Fixture rows are projected from day-of-month into the
 * provided `fixtureYearMonth` context. User events use full-date keys
 * directly (after recurrence expansion inside the window).
 */
export function mergeEventsForWindow(
  fixture: CalEventsByDay,
  fixtureYearMonth: { year: number; month: number },
  userEvents: Record<string, UserCalEvent>,
  windowStartKey: string,
  windowEndKey: string,
): Record<string, MergedCalEvent[]> {
  const out: Record<string, MergedCalEvent[]> = {};

  // Inclusive iteration across the window.
  const startParts = windowStartKey.split("-").map((n) => Number(n));
  const endParts = windowEndKey.split("-").map((n) => Number(n));
  if (startParts.length !== 3 || endParts.length !== 3) return out;
  const sy = startParts[0];
  const sm = startParts[1];
  const sd = startParts[2];
  const ey = endParts[0];
  const em = endParts[1];
  const ed = endParts[2];
  if (
    sy === undefined || sm === undefined || sd === undefined ||
    ey === undefined || em === undefined || ed === undefined
  ) return out;
  const start = new Date(Date.UTC(sy, sm - 1, sd, 12, 0, 0));
  const end = new Date(Date.UTC(ey, em - 1, ed, 12, 0, 0));
  if (end.getTime() < start.getTime()) return out;

  // Seed with fixture rows where the iter date matches fixtureYearMonth.
  const msPerDay = 86_400_000;
  for (
    let cursor = new Date(start.getTime());
    cursor.getTime() <= end.getTime();
    cursor = new Date(cursor.getTime() + msPerDay)
  ) {
    const y = cursor.getUTCFullYear();
    const m = cursor.getUTCMonth() + 1;
    const d = cursor.getUTCDate();
    const key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (y === fixtureYearMonth.year && m === fixtureYearMonth.month) {
      out[key] = fixtureRows(fixture, d);
    } else {
      out[key] = [];
    }
  }

  // Merge user events (with recurrence expanded inside the window).
  for (const event of Object.values(userEvents)) {
    const instances = expandRecurrence(event, windowStartKey, windowEndKey);
    for (const inst of instances) {
      const dateKey = inst.startISO.slice(0, 10);
      const projected = projectToCalEvent(inst);
      const bucket = out[dateKey] ?? [];
      bucket.push(projected);
      out[dateKey] = bucket;
    }
  }

  // NOTE: fixture rows stay in their original index order (SHIPPED contract).
  // User events appended after fixture for that date in expansion order.
  return out;
}

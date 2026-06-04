/**
 * @internal — calUpcoming selector.
 *
 * Produces the next ≤ `max` events sorted by startISO ascending, for
 * events whose startISO >= now.
 *
 * Handles:
 *   - Non-recurring events: included if startISO >= now's local datetime.
 *   - Recurring (daily / weekly): expand within a bounded forward window
 *     (now → now + lookAheadDays). Minimal local recurrence re-implementation
 *     because calendar's `expandRecurrence` is `internal/` (un-importable).
 *
 * **Date basis = LOCAL-CLOCK ISO.** `startISO` is "YYYY-MM-DDTHH:MM" local
 * clock (no TZ suffix). Comparison is done via string lexicographic order
 * (which works because the format is ISO-ordered). (RD3 guard.)
 *
 * N3 build note: recurrence re-implementation MUST preserve owner semantics:
 *   - advance the date PREFIX ("YYYY-MM-DD"), keep the HH:MM suffix unchanged.
 *   - Window math in UTC (dateKeyToUTCDate) — same as calendar's expandRecurrence.
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #11/12
 */

import { listValidCalEvents, type UserCalEventMin } from "./isUserCalEventMap.js";

/** A rendered upcoming event item for the widget. */
export interface UpcomingItem {
  id: string;
  title: string;
  /** "YYYY-MM-DD" */
  dateKey: string;
  /** "HH:MM" */
  timeStr: string;
  colorPreset: string;
}

/** Parse "YYYY-MM-DD" → UTC Date at noon (DST-safe, mirrors calendar's dateKeyToUTCDate). */
function dateKeyToUTCDate(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo, d, 12, 0, 0));
}

/** Format UTC Date back to "YYYY-MM-DD". */
function utcDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Build local "YYYY-MM-DDTHH:MM" from now (for comparison). */
function localISOMinute(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${h}:${min}`;
}

/** Build local "YYYY-MM-DD" from now. */
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/**
 * Materialize recurring instances of `event` in [windowStartKey, windowEndKey].
 * Mirrors calendar's expandRecurrence semantics (N3):
 *   - advance date prefix, keep HH:MM suffix.
 *   - Window math in UTC via noon-anchored UTC dates.
 */
function expandRecurrenceLocal(
  event: UserCalEventMin,
  windowStartKey: string,
  windowEndKey: string,
  maxInstances = 366,
): UserCalEventMin[] {
  const windowStart = dateKeyToUTCDate(windowStartKey);
  const windowEnd = dateKeyToUTCDate(windowEndKey);
  if (!windowStart || !windowEnd) return [];
  if (windowEnd.getTime() < windowStart.getTime()) return [];

  const anchorKey = event.startISO.slice(0, 10);
  const anchorDate = dateKeyToUTCDate(anchorKey);
  if (!anchorDate) return [];

  if (event.recurrence === null) {
    if (
      anchorDate.getTime() >= windowStart.getTime() &&
      anchorDate.getTime() <= windowEnd.getTime()
    ) {
      return [event];
    }
    return [];
  }

  const stepDays = event.recurrence.kind === "daily" ? 1 : 7;
  const startTime = event.startISO.slice(11); // "HH:MM"
  const endTime = event.endISO.slice(11);

  const out: UserCalEventMin[] = [];
  let cursor = new Date(anchorDate.getTime());

  // Fast-forward cursor to enter window
  if (cursor.getTime() < windowStart.getTime()) {
    const diffDays = Math.ceil((windowStart.getTime() - cursor.getTime()) / 86_400_000);
    const skipSteps = Math.ceil(diffDays / stepDays);
    cursor = new Date(cursor.getTime() + skipSteps * stepDays * 86_400_000);
  }

  while (cursor.getTime() <= windowEnd.getTime() && out.length < maxInstances) {
    const dk = utcDateKey(cursor);
    out.push({
      ...event,
      startISO: `${dk}T${startTime}`,
      endISO: `${dk}T${endTime}`,
    });
    cursor = new Date(cursor.getTime() + stepDays * 86_400_000);
  }

  return out;
}

/**
 * Returns the next ≤ `max` upcoming events, sorted by startISO ascending.
 *
 * @param store          Raw value from `usePref("xai_calendar_events")`.
 * @param now            Current Date (injected for testability).
 * @param lookAheadDays  Window size for recurrence expansion (default 60 days).
 * @param max            Maximum items to return (default 4).
 */
export function upcomingEvents(
  store: unknown,
  now: Date,
  lookAheadDays = 60,
  max = 4,
): UpcomingItem[] {
  const events = listValidCalEvents(store);
  if (events.length === 0) return [];

  const nowISO = localISOMinute(now); // "YYYY-MM-DDTHH:MM" local
  const windowStartKey = localDateKey(now); // "YYYY-MM-DD" for recurrence expansion
  const windowEndDate = new Date(now.getTime() + lookAheadDays * 86_400_000);
  const windowEndKey = localDateKey(windowEndDate);

  const instances: UserCalEventMin[] = [];
  for (const ev of events) {
    const expanded = expandRecurrenceLocal(ev, windowStartKey, windowEndKey);
    for (const inst of expanded) {
      if (inst.startISO >= nowISO) {
        instances.push(inst);
      }
    }
  }

  // Sort by startISO ascending (lexicographic works because ISO-ordered format)
  instances.sort((a, b) => a.startISO.localeCompare(b.startISO));

  return instances.slice(0, max).map((inst) => ({
    id: inst.id + "|" + inst.startISO, // unique key for recurring instances
    title: inst.title,
    dateKey: inst.startISO.slice(0, 10),
    timeStr: inst.startISO.slice(11),
    colorPreset: inst.colorPreset,
  }));
}

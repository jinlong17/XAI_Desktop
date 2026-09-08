/**
 * @internal — calMonthDots selector.
 *
 * Produces a map of `{ [dayOfMonth]: dotColor[] }` for the events that
 * fall in the specified year/month (after minimal recurrence expansion).
 *
 * Used by MiniCalWidget to replace the hardcoded CAL_EVENTS fixture.
 *
 * Supports all 5 colorPresets: mint | amber | blue | violet | rose.
 * (RD4: `rose` needs `.mc-dot-rose` CSS class — added in F2 styles.css.)
 *
 * **Date basis = LOCAL-CLOCK.** `startISO` is "YYYY-MM-DDTHH:MM" local clock.
 * The day-of-month is extracted from the local date prefix "YYYY-MM-DD".
 * (RD3 guard — do not parse as UTC.)
 *
 * N3 build note: recurrence expansion mirrors calendar's semantics (UTC noon
 * anchors for window math, date prefix advances, HH:MM kept).
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #10
 */

import { listValidCalEvents } from "./isUserCalEventMap.js";

/** dateKeyToUTCDate and utcDateKey are re-implemented locally (same logic as calUpcoming). */
function dateKeyToUTCDate(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(Date.UTC(y, mo, d, 12, 0, 0));
}

function utcDateKey(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function expandForMonth(
  startISO: string,
  endISO: string,
  recurrenceKind: "daily" | "weekly" | null,
  windowStartKey: string,
  windowEndKey: string,
  maxInstances = 366,
): string[] {
  const windowStart = dateKeyToUTCDate(windowStartKey);
  const windowEnd = dateKeyToUTCDate(windowEndKey);
  if (!windowStart || !windowEnd) return [];
  if (windowEnd.getTime() < windowStart.getTime()) return [];

  const anchorKey = startISO.slice(0, 10);
  const anchorDate = dateKeyToUTCDate(anchorKey);
  if (!anchorDate) return [];

  if (recurrenceKind === null) {
    if (
      anchorDate.getTime() >= windowStart.getTime() &&
      anchorDate.getTime() <= windowEnd.getTime()
    ) {
      return [anchorKey];
    }
    return [];
  }

  const stepDays = recurrenceKind === "daily" ? 1 : 7;
  const out: string[] = [];
  let cursor = new Date(anchorDate.getTime());

  if (cursor.getTime() < windowStart.getTime()) {
    const diffDays = Math.ceil((windowStart.getTime() - cursor.getTime()) / 86_400_000);
    const skipSteps = Math.ceil(diffDays / stepDays);
    cursor = new Date(cursor.getTime() + skipSteps * stepDays * 86_400_000);
  }

  while (cursor.getTime() <= windowEnd.getTime() && out.length < maxInstances) {
    out.push(utcDateKey(cursor));
    cursor = new Date(cursor.getTime() + stepDays * 86_400_000);
  }

  return out;
}

/**
 * Returns a map of `{ [dayOfMonth]: string[] }` where values are colorPreset
 * strings (up to 3 dots per day, matching MiniCalWidget's original `ev.slice(0,3)` cap).
 *
 * @param store      Raw value from `usePref("xai_calendar_events")`.
 * @param viewYear   4-digit year of the viewed month.
 * @param viewMonth  0-indexed month of the viewed month.
 */
export function monthDots(
  store: unknown,
  viewYear: number,
  viewMonth: number,
): Record<number, string[]> {
  const events = listValidCalEvents(store);
  if (events.length === 0) return {};

  // Build window: first → last day of the viewed month
  const firstDay = new Date(viewYear, viewMonth, 1);
  const lastDay = new Date(viewYear, viewMonth + 1, 0);

  // "YYYY-MM-DD" local-clock for window bounds
  function localKey(d: Date): string {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  }

  const windowStartKey = localKey(firstDay);
  const windowEndKey = localKey(lastDay);

  const dotsByDay: Record<number, string[]> = {};

  for (const ev of events) {
    const kind = ev.recurrence?.kind ?? null;
    const dateKeys = expandForMonth(
      ev.startISO,
      ev.endISO,
      kind,
      windowStartKey,
      windowEndKey,
    );

    for (const dk of dateKeys) {
      // Extract day-of-month from "YYYY-MM-DD"
      const dayOfMonth = parseInt(dk.slice(8), 10);
      if (!dotsByDay[dayOfMonth]) dotsByDay[dayOfMonth] = [];
      if (dotsByDay[dayOfMonth].length < 3) {
        dotsByDay[dayOfMonth].push(ev.colorPreset);
      }
    }
  }

  return dotsByDay;
}

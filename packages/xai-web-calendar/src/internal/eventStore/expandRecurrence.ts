/**
 * @internal — Pure recurrence expansion.
 *
 * Expands a `UserCalEvent` with a `recurrence` rule into the materialized
 * instances that fall inside `[windowStartKey, windowEndKey]` (inclusive),
 * bounded by `maxInstances` (default 366) as a hard safety cap.
 *
 * Non-recurring events: returned as-is if their start date falls in the
 * window; empty array otherwise.
 *
 * Recurrence rules:
 *   - "daily":  one instance per day starting at the anchor date and stepping
 *               +1 day each iteration.
 *   - "weekly": one instance per 7-day cycle starting at the anchor date.
 *
 * Each materialized instance preserves the original `startISO/endISO` HH:MM
 * time-of-day (local-clock semantics — stable across DST). Only the
 * date prefix advances.
 *
 * Design: docs/design.md §16.7
 * API:    docs/api.md §11.3 / §11.7 (defensive on malformed rules)
 * Tests:  __tests__/expandRecurrence.test.ts (AC-RECUR-8 + 11 more)
 */

import type { UserCalEvent } from "./types.js";

const DEFAULT_MAX_INSTANCES = 366;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Parse "YYYY-MM-DD" into a UTC Date at noon (DST-safe). Returns null on malformed input. */
function dateKeyToUTCDate(key: string): Date | null {
  if (!DATE_RE.test(key)) return null;
  const parts = key.split("-").map((n) => Number(n));
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (y === undefined || m === undefined || d === undefined) return null;
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

/** Format a UTC Date back to "YYYY-MM-DD". */
function utcDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Splice a materialized instance: keep `time` (HH:MM) of original, swap date prefix.
 *
 * @param event original UserCalEvent
 * @param dateKey "YYYY-MM-DD" of the instance day
 */
function materialize(event: UserCalEvent, dateKey: string): UserCalEvent {
  const startTime = event.startISO.slice(11); // "HH:MM"
  const endTime = event.endISO.slice(11);
  return {
    ...event,
    startISO: `${dateKey}T${startTime}`,
    endISO: `${dateKey}T${endTime}`,
  };
}

/**
 * Returns the list of materialized event instances inside `[windowStartKey,
 * windowEndKey]` (inclusive). Bounded by `maxInstances`.
 *
 * Defensive behaviour:
 *   - Malformed `startISO/endISO`: returns `[]` (no expansion).
 *   - Malformed window keys: returns `[]`.
 *   - Window end < window start: returns `[]`.
 *   - Unknown recurrence kind: returns `[]`.
 *   - `recurrence === null`: returns `[event]` if start date is in window,
 *     else `[]`.
 */
export function expandRecurrence(
  event: UserCalEvent,
  windowStartKey: string,
  windowEndKey: string,
  maxInstances: number = DEFAULT_MAX_INSTANCES,
): UserCalEvent[] {
  // Defensive guards.
  if (!ISO_RE.test(event.startISO) || !ISO_RE.test(event.endISO)) return [];
  const windowStart = dateKeyToUTCDate(windowStartKey);
  const windowEnd = dateKeyToUTCDate(windowEndKey);
  if (!windowStart || !windowEnd) return [];
  if (windowEnd.getTime() < windowStart.getTime()) return [];

  const anchorKey = event.startISO.slice(0, 10);
  const anchorDate = dateKeyToUTCDate(anchorKey);
  if (!anchorDate) return [];

  // Non-recurring: include if anchor falls in window.
  if (event.recurrence === null) {
    if (
      anchorDate.getTime() >= windowStart.getTime() &&
      anchorDate.getTime() <= windowEnd.getTime()
    ) {
      return [event];
    }
    return [];
  }

  const kind = event.recurrence.kind;
  const stepDays = kind === "daily" ? 1 : kind === "weekly" ? 7 : 0;
  if (stepDays === 0) return []; // unknown kind

  const out: UserCalEvent[] = [];
  // Start cursor: either the anchor itself (if >= window start) or the
  // first occurrence that lands in the window.
  let cursor = new Date(anchorDate.getTime());
  if (cursor.getTime() < windowStart.getTime()) {
    // Fast-forward in step-day increments to enter the window.
    const msPerDay = 86_400_000;
    const diffDays = Math.ceil(
      (windowStart.getTime() - cursor.getTime()) / msPerDay,
    );
    const skipSteps = Math.ceil(diffDays / stepDays);
    cursor = new Date(cursor.getTime() + skipSteps * stepDays * msPerDay);
  }

  while (
    cursor.getTime() <= windowEnd.getTime() &&
    out.length < maxInstances
  ) {
    out.push(materialize(event, utcDateKey(cursor)));
    cursor = new Date(cursor.getTime() + stepDays * 86_400_000);
  }

  return out;
}

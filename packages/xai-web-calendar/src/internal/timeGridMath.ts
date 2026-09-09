import { parseLocalDateKey, nextLocalDayStart } from "@repo/plugin-web-tokens";
/**
 * @internal — hour-grid math for Week/Day views.
 *
 * All hour labels are LOCAL clock (getHours()) per design.md §15.2 #2 (UX-correct,
 * matches every shipped consumer calendar app).
 *
 * DST handling: device-local midnight boundaries and actual offset transitions.
 *
 * Design ref: design.md §15.7 timeGridMath signatures.
 */

/** Pixel height of one hour row in the time grid. */
export const HOUR_HEIGHT_PX = 48;

/** Describes a DST clock shift occurring within a single calendar day. */
export interface DstShift {
  /** "spring-forward" (23-row day; hour skipped) | "fall-back" (25-row day; hour repeated). */
  kind: "spring-forward" | "fall-back";
  /** The row index AFTER which the shift label is inserted. */
  atRow: number;
  /** Actual offset change; supports half-hour transitions. */
  deltaHours?: number;
  transitionHour?: number;
}

/** The result of `dstHoursForDay`: how many hour-rows the day has + optional shift. */
export interface DstHoursResult {
  hours: number;
  shift?: DstShift;
}

/**
 * Returns the number of hour rows for a given date key (local calendar date).
 *
 * Implementation: derive current device-local offsets for the requested day.
 * - 2026-03-08: spring-forward (clocks skip 02:00 → 03:00) → 23 rows.
 * - 2026-11-01: fall-back (01:00 appears twice) → 25 rows.
 *
 * Other dates follow their own device-local offset transitions.
 */
export function dstHoursForDay(dateKey: string): DstHoursResult {
  const start = parseLocalDateKey(dateKey);
  if (!start) return { hours: 24 };
  const end = nextLocalDayStart(start);
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  const initialOffset = start.getTimezoneOffset();
  for (let t = start.getTime() + 60_000; t < end.getTime(); t += 60_000) {
    const instant = new Date(t);
    if (instant.getTimezoneOffset() !== initialOffset) {
      const deltaHours = (initialOffset - instant.getTimezoneOffset()) / 60;
      const transitionHour = instant.getHours() + instant.getMinutes() / 60;
      return { hours, shift: { kind: deltaHours > 0 ? "spring-forward" : "fall-back", atRow: Math.max(0, Math.floor((t - start.getTime()) / 3_600_000) - 1), deltaHours, transitionHour } };
    }
  }
  return { hours };
}

/**
 * Parse "HH:MM" → { hours, minutes }.
 * Returns null on malformed input (bad format, out-of-range components).
 */
export function parseHHMM(s: string): { hours: number; minutes: number } | null {
  if (typeof s !== "string") return null;
  const parts = s.split(":");
  if (parts.length !== 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23) return null;
  if (minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

/**
 * Convert an HH:MM time into a fractional row index within the day grid.
 *
 * Row 0 = 00:00, row N-1 = hour N-1.
 * Minutes contribute a fractional offset within the row (for top% positioning).
 *
 * @param hours    0..23
 * @param minutes  0..59
 * @param dst      Optional DST shift — adjusts row index for spring-forward days.
 * @returns        Fractional row index (e.g. 14.25 for 14:15).
 */
export function hourToRow(hours: number, minutes: number, dst?: DstShift): number {
  let row = hours + minutes / 60;
  // Spring-forward: rows after the skipped hour shift down by 1
  // Ambiguous floating HH:MM resolves to the earlier occurrence.
  const threshold = dst?.transitionHour === undefined
    ? (dst?.kind === "spring-forward" ? 3 : 2)
    : dst.transitionHour - (dst.kind === "fall-back" ? (dst.deltaHours ?? -1) : 0);
  if (dst && row >= threshold) {
    row -= dst.deltaHours ?? (dst.kind === "spring-forward" ? 1 : -1);
  }
  return row;
}

/**
 * Compute the number of grid rows an event block occupies.
 *
 * - If `endHHMM` is absent or malformed, returns 1 (default 1-hour block).
 * - If endHHMM ≤ startHHMM (same time or past midnight), returns 1 (guards
 *   against past-midnight spans; multi-day events are out of scope in v1).
 *
 * @param startHHMM  "HH:MM"
 * @param endHHMM    "HH:MM" | undefined
 * @param dst        Optional DST shift for spring-forward row adjustments.
 */
export function rowsForBlock(
  startHHMM: string,
  endHHMM: string | undefined,
  dst?: DstShift,
): number {
  const start = parseHHMM(startHHMM);
  if (!start) return 1;
  if (!endHHMM) return 1;
  const end = parseHHMM(endHHMM);
  if (!end) return 1;

  const startRow = hourToRow(start.hours, start.minutes, dst);
  const endRow = hourToRow(end.hours, end.minutes, dst);
  const span = endRow - startRow;
  if (span <= 0) return 1; // past-midnight guard
  return Math.max(1, span); // always at least 1 row
}

/**
 * Build an array of hour labels for the time grid column.
 *
 * For a normal day (24 hours): ["00", "01", …, "23"]
 * For spring-forward (23 hours): skip "02"
 * For fall-back (25 hours): repeat "01" (with "(DST)" marker in second position)
 *
 * Returns objects with `label: string` and `isDst: boolean` (the repeated/skipped marker slot).
 */
export interface HourLabel {
  label: string;
  isDst: boolean;
  durationHours?: number;
}

export function buildHourLabels(dateKey: string): HourLabel[] {
  const start = parseLocalDateKey(dateKey);
  if (!start) return [];
  const end = nextLocalDayStart(start).getTime();
  const labels: HourLabel[] = [];
  const seen = new Set<string>();
  for (let t = start.getTime(); t < end; t += 3_600_000) {
    const instant = new Date(t);
    const label = String(instant.getHours()).padStart(2, "0") + (instant.getMinutes() ? `:${String(instant.getMinutes()).padStart(2, "0")}` : "");
    const isDst = seen.has(label) || (labels.length > 0 && instant.getTimezoneOffset() !== new Date(t - 3_600_000).getTimezoneOffset());
    labels.push({ label: seen.has(label) ? `${label} (DST)` : label, isDst, durationHours: Math.min(1, (end - t) / 3_600_000) });
    seen.add(label);
  }
  return labels;
}

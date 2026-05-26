/**
 * @internal — hour-grid math for Week/Day views.
 *
 * All hour labels are LOCAL clock (getHours()) per design.md §15.2 #2 (UX-correct,
 * matches every shipped consumer calendar app).
 *
 * DST handling: a table of known 2026 US Pacific transitions is used for v1.
 * Future row may substitute Intl.DateTimeFormat per api.md §10.9 fallback note.
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
}

/** The result of `dstHoursForDay`: how many hour-rows the day has + optional shift. */
export interface DstHoursResult {
  hours: 23 | 24 | 25;
  shift?: DstShift;
}

/**
 * Returns the number of hour rows for a given date key (local calendar date).
 *
 * Implementation: hard-coded 2026 US Pacific DST table per design.md §15.2 #2.
 * - 2026-03-08: spring-forward (clocks skip 02:00 → 03:00) → 23 rows.
 * - 2026-11-01: fall-back (01:00 appears twice) → 25 rows.
 *
 * All other dates: 24 rows (standard).
 */
export function dstHoursForDay(dateKey: string): DstHoursResult {
  if (dateKey === "2026-03-08") {
    return { hours: 23, shift: { kind: "spring-forward", atRow: 1 } }; // skip row at 02:00
  }
  if (dateKey === "2026-11-01") {
    return { hours: 25, shift: { kind: "fall-back", atRow: 1 } }; // repeat row after 01:00
  }
  return { hours: 24 };
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
  if (dst?.kind === "spring-forward" && hours >= 3) {
    row -= 1;
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
}

export function buildHourLabels(dateKey: string): HourLabel[] {
  const { hours, shift } = dstHoursForDay(dateKey);
  const labels: HourLabel[] = [];
  if (hours === 23 && shift?.kind === "spring-forward") {
    // Skip 02:00
    for (let h = 0; h < 24; h++) {
      if (h === 2) continue; // skipped hour
      labels.push({ label: String(h).padStart(2, "0"), isDst: false });
    }
    // Insert DST marker after row corresponding to 01:00 (row 1)
    labels.splice(2, 0, { label: "(DST)", isDst: true });
  } else if (hours === 25 && shift?.kind === "fall-back") {
    // Repeat 01:00
    for (let h = 0; h < 24; h++) {
      labels.push({ label: String(h).padStart(2, "0"), isDst: false });
      if (h === 1) {
        labels.push({ label: "01 (DST)", isDst: true }); // repeated slot
      }
    }
  } else {
    for (let h = 0; h < 24; h++) {
      labels.push({ label: String(h).padStart(2, "0"), isDst: false });
    }
  }
  return labels;
}

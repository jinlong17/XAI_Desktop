/**
 * @internal — greedy first-fit event block positioning for Week/Day views.
 *
 * Each positioned EventBlock carries grid coordinates (startRow, rowSpan,
 * col, colSpan) used by TimeGridDayColumn to set CSS grid placement or
 * absolute positioning.
 *
 * All-day events (no `time` field) are marked with `allDay: true` and
 * rendered in the sticky all-day strip — they do NOT occupy hour-row slots.
 *
 * Design ref: design.md §15.7 placeEventBlocks signature + §15.2 #7.
 */

import type { CalEvent } from "./sampleEvents.js";
import { parseHHMM, rowsForBlock, dstHoursForDay } from "./timeGridMath.js";

/** A positioned event block for rendering in the time grid. */
export interface EventBlock {
  /** The source event. */
  event: CalEvent;
  /** Row index (0..) where this block starts. Fractional (e.g. 14.25 for 14:15). */
  startRow: number;
  /** Row span (≥ 1). Fractional when endTime falls mid-hour. */
  rowSpan: number;
  /** Column index within the day column for side-by-side packing. */
  col: number;
  /** Total number of columns at this row (for width fraction). */
  colSpan: number;
  /** True = all-day event (render in all-day strip, not hour rows). */
  allDay: boolean;
}

/**
 * Place events for a single day into positioned `EventBlock[]`.
 *
 * @param events   All events for a given day (from SAMPLE_EVENTS[d]).
 * @param dateKey  "YYYY-MM-DD" of the day (used for DST row-count lookup).
 * @returns        Positioned blocks, ordered by startRow then col.
 */
export function placeEventBlocks(events: CalEvent[], dateKey: string): EventBlock[] {
  if (!events || events.length === 0) return [];

  const { shift } = dstHoursForDay(dateKey);
  const result: EventBlock[] = [];

  // Separate all-day events (no `time`) from timed events.
  const allDayEvents = events.filter((e) => !e.time);
  const timedEvents = events.filter((e) => !!e.time);

  // All-day events: placed in strip, col=0, colSpan=1, startRow=0, rowSpan=0.
  for (const ev of allDayEvents) {
    result.push({
      event: ev,
      startRow: 0,
      rowSpan: 0,
      col: 0,
      colSpan: 1,
      allDay: true,
    });
  }

  if (timedEvents.length === 0) return result;

  // Sort timed events by start time.
  const sorted = timedEvents
    .map((ev) => {
      const parsed = parseHHMM(ev.time!);
      const startRow = parsed ? parsed.hours + parsed.minutes / 60 : 0;
      const rowSpan = rowsForBlock(ev.time!, (ev as CalEvent & { endTime?: string }).endTime, shift);
      return { ev, startRow, rowSpan };
    })
    .sort((a, b) => a.startRow - b.startRow);

  // Greedy first-fit column packing.
  // `colEndRows[i]` = endRow of the last event placed in column i.
  const colEndRows: number[] = [];

  // Two-pass: first assign columns, then compute colSpan.
  const placed: Array<{ ev: CalEvent; startRow: number; rowSpan: number; col: number }> = [];

  for (const { ev, startRow, rowSpan } of sorted) {
    // Find the first column where this event can fit (no overlap).
    let col = 0;
    while (col < colEndRows.length && (colEndRows[col] ?? 0) > startRow) {
      col++;
    }
    colEndRows[col] = startRow + rowSpan;
    placed.push({ ev, startRow, rowSpan, col });
  }

  const totalCols = colEndRows.length;

  // Convert to EventBlock with colSpan = totalCols (equal-width columns).
  for (const { ev, startRow, rowSpan, col } of placed) {
    result.push({
      event: ev,
      startRow,
      rowSpan,
      col,
      colSpan: totalCols,
      allDay: false,
    });
  }

  return result;
}

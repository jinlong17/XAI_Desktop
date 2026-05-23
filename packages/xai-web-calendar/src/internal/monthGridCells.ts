/**
 * @internal — Pure helper that emits the cells for one month grid.
 *
 * Returns a flat array of 35 or 42 cells (ceil((leadingPad + numDays) / 7) * 7).
 * Leading pad cells come from the previous month; trailing pad cells from the
 * next month — both flagged `inMonth: false`.
 *
 * See docs/design.md §6.3.
 */

import { daysInMonth, pad2 } from "./dateKeys.js";
import { findHolidayKey } from "./holidays.js";
import { isoWeekNumber } from "./isoWeekNumber.js";

export interface MonthCellData {
  /** Day-of-month integer (1..31). */
  d: number;
  /** Year the cell belongs to (handles leading/trailing pads crossing years). */
  year: number;
  /** Month the cell belongs to (1..12). */
  month: number;
  /** True iff the cell belongs to the displayed month (vs leading/trailing pad). */
  inMonth: boolean;
  /** ISO date string YYYY-MM-DD (UTC). */
  dateKey: string;
  /** ISO week number — populated only on the week-start column (ci === 0). */
  weekNum?: number;
  /** Optional i18n key for the holiday label, e.g. "cal.holiday_mayday". */
  holidayKey?: string;
}

/** Step (year, month) by ±1. */
function stepMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const m = month + delta;
  if (m < 1) return { year: year - 1, month: 12 };
  if (m > 12) return { year: year + 1, month: 1 };
  return { year, month: m };
}

/**
 * Emit cells for one month grid.
 *
 * @param year Displayed year.
 * @param month Displayed month, 1..12.
 * @param weekStart 0 = Sun, 1 = Mon.
 */
export function monthGridCells(
  year: number,
  month: number,
  weekStart: 0 | 1,
): MonthCellData[] {
  const firstUtc = new Date(Date.UTC(year, month - 1, 1));
  const firstDow = firstUtc.getUTCDay(); // 0=Sun..6=Sat
  const leadingPad = (firstDow - weekStart + 7) % 7;
  const numDays = daysInMonth(year, month);
  const totalCells = Math.ceil((leadingPad + numDays) / 7) * 7;

  const prev = stepMonth(year, month, -1);
  const next = stepMonth(year, month, +1);
  const prevDays = daysInMonth(prev.year, prev.month);

  const cells: MonthCellData[] = [];
  for (let i = 0; i < totalCells; i++) {
    let cellYear: number;
    let cellMonth: number;
    let cellDay: number;
    let inMonth: boolean;
    if (i < leadingPad) {
      // Leading pad — previous month.
      const offsetFromEnd = leadingPad - 1 - i;
      cellYear = prev.year;
      cellMonth = prev.month;
      cellDay = prevDays - offsetFromEnd;
      inMonth = false;
    } else if (i < leadingPad + numDays) {
      cellYear = year;
      cellMonth = month;
      cellDay = i - leadingPad + 1;
      inMonth = true;
    } else {
      // Trailing pad — next month.
      cellYear = next.year;
      cellMonth = next.month;
      cellDay = i - (leadingPad + numDays) + 1;
      inMonth = false;
    }
    const dateKey =
      cellYear + "-" + pad2(cellMonth) + "-" + pad2(cellDay);
    const cell: MonthCellData = {
      d: cellDay,
      year: cellYear,
      month: cellMonth,
      inMonth,
      dateKey,
    };
    if (i % 7 === 0) {
      cell.weekNum = isoWeekNumber(
        new Date(Date.UTC(cellYear, cellMonth - 1, cellDay)),
      );
    }
    const holiday = findHolidayKey(cellYear, cellMonth, cellDay);
    if (holiday !== undefined) {
      cell.holidayKey = holiday;
    }
    cells.push(cell);
  }
  return cells;
}

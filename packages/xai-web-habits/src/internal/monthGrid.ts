/**
 * @internal — shared month-grid builder for single-habit and all-habits views.
 */

import type { DateKey, WeekStart } from "../types.js";
import { daysInMonth, pad2 } from "./dateKeys.js";

export interface MonthGridCell {
  readonly day: number;
  readonly inMonth: boolean;
  readonly dateKey: DateKey;
}

export function buildMonthGrid(
  year: number,
  month0: number,
  weekStart: WeekStart,
): MonthGridCell[] {
  const startDow = weekStart === "sun" ? 0 : 1;
  const firstDay = new Date(year, month0, 1);
  const firstDow = firstDay.getDay();
  const paddingBefore = ((firstDow - startDow) + 7) % 7;
  const numDays = daysInMonth(year, month0);
  const totalCells = Math.max(35, Math.ceil((paddingBefore + numDays) / 7) * 7);
  const cells: MonthGridCell[] = [];

  const prevMonth0 = month0 === 0 ? 11 : month0 - 1;
  const prevYear = month0 === 0 ? year - 1 : year;
  const prevMonthDays = daysInMonth(prevYear, prevMonth0);
  for (let i = 0; i < paddingBefore; i++) {
    const d = prevMonthDays - paddingBefore + 1 + i;
    cells.push({
      day: d,
      inMonth: false,
      dateKey: `${prevYear}-${pad2(prevMonth0 + 1)}-${pad2(d)}`,
    });
  }

  for (let d = 1; d <= numDays; d++) {
    cells.push({
      day: d,
      inMonth: true,
      dateKey: `${year}-${pad2(month0 + 1)}-${pad2(d)}`,
    });
  }

  const nextMonth0 = month0 === 11 ? 0 : month0 + 1;
  const nextYear = month0 === 11 ? year + 1 : year;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({
      day: nextDay,
      inMonth: false,
      dateKey: `${nextYear}-${pad2(nextMonth0 + 1)}-${pad2(nextDay)}`,
    });
    nextDay++;
  }

  return cells;
}

/**
 * @internal — heatmap cell generator.
 *
 * Deterministic. NO Math.random. Returns exactly 182 cells (26 weeks × 7
 * days), column-major (week 0..25, day 0..6 within each week).
 *
 * Level thresholds (minutes):
 *   0     → level 0
 *   1..15 → level 1
 *   16..45 → level 2
 *   46..90 → level 3
 *   91+   → level 4
 *
 * api.md §5.9.
 */

import type { HeatmapCell } from "../types.js";
import {
  bucketLevel,
  dateKeyOf,
  dateKeyOfFinishedAt,
} from "./aggregators.js";
import { type PomodoroSessionRecord } from "./isPomodoroSession.js";
import { addDays, startOfWeek, type WeekStart } from "./rangeWindow.js";
import { measuredDurationMs } from './measuredDuration.js';

const TOTAL_WEEKS = 26;
const DAYS_PER_WEEK = 7;
const MS_PER_MIN = 60_000;

export function heatmapCells(
  sessions: PomodoroSessionRecord[],
  weekStart: WeekStart,
  now: Date,
): HeatmapCell[] {
  // Build a map of date-key → minutes from focus sessions.
  const minutesByDate = new Map<string, number>();
  for (const s of sessions) {
    if (s.mode !== "focus") continue;
    const dk = dateKeyOfFinishedAt(s.finishedAt);
    if (dk === null) continue;
    const minutes = (measuredDurationMs(s) ?? 0) / MS_PER_MIN;
    minutesByDate.set(dk, (minutesByDate.get(dk) ?? 0) + minutes);
  }

  // First cell: 25 weeks before this week's start (so 26 columns total
  // ending at the current week).
  const thisWeekStart = startOfWeek(now, weekStart);
  const firstCellDate = addDays(thisWeekStart, -(TOTAL_WEEKS - 1) * DAYS_PER_WEEK);

  const cells: HeatmapCell[] = [];
  for (let w = 0; w < TOTAL_WEEKS; w++) {
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const cellDate = addDays(firstCellDate, w * DAYS_PER_WEEK + d);
      const dk = dateKeyOf(cellDate);
      const minutes = minutesByDate.get(dk) ?? 0;
      cells.push({
        week: w,
        day: d,
        date: dk,
        minutes,
        level: bucketLevel(minutes),
      });
    }
  }
  return cells;
}

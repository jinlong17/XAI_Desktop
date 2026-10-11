/** Current completed count, including legacy completed containers.
 * Reads are defensive and never invent completion timestamps or write storage.
 */

import { narrowTaskCols } from "./narrowTaskCols.js";

/** Explicit-offset ISO instants only; Date.parse alone normalizes impossible dates. */
function completionInstant(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]!
    || Number(match[4]) > 23 || Number(match[5]) > 59 || Number(match[6]) > 59
    || (match[7] !== 'Z' && (Number(match[8]) > 23 || Number(match[9]) > 59))) return null;
  const instant = Date.parse(value);
  return Number.isFinite(instant) ? instant : null;
}

/**
 * Returns the count of `done === true` cards in the raw `xai_task_cols`
 * store value.  Reads from `col.tasks` (+ optional `col.completed`).
 *
 * Returns `0` for any non-conforming input (defensive).
 */
export function countDoneTasks(store: unknown): number {
  return readTaskCompletions(store).length;
}

/** No timestamp is invented for legacy completed containers or boolean-only rows. */
export function readTaskCompletions(store: unknown): Array<{ completedAt: number | null }> {
  if (!narrowTaskCols(store)) return [];

  const completed: Array<{ completedAt: number | null }> = [];
  const append = (card: unknown, legacyCompleted: boolean) => {
    if (!card || typeof card !== 'object') return;
    const value = card as Record<string, unknown>;
    if (value.done !== true && !(legacyCompleted && value.done === undefined)) return;
    completed.push({ completedAt: completionInstant(value.completedAt) });
  };
  for (const col of Object.values(store)) {
    // Primary card list
    for (const card of col.tasks) {
      append(card, false);
    }
    // Optional completed bucket
    if (Array.isArray(col.completed)) {
      for (const card of col.completed) {
        append(card, true);
      }
    }
  }
  return completed;
}

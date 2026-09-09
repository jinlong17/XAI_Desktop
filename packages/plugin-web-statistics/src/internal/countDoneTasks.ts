/** Current completed count, including legacy completed containers.
 * Reads are defensive and never invent completion timestamps or write storage.
 */

import { narrowTaskCols } from "./narrowTaskCols.js";

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
    const at = typeof value.completedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value.completedAt)
      ? Date.parse(value.completedAt) : NaN;
    completed.push({ completedAt: Number.isFinite(at) ? at : null });
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

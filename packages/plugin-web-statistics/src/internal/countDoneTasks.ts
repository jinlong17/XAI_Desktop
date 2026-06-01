/**
 * @internal — countDoneTasks pure aggregator.
 *
 * Counts `done === true` task cards across all columns in the task board.
 *
 * Metric: real count of `TaskCard.done === true` cards in `xai_task_cols`
 * (current board, range-invariant — there is no completion timestamp on
 * `TaskCard`; the `done` boolean reflects the board's CURRENT state).
 *
 * Returns `0` when:
 * - The value does not conform to `Record<BucketId, TaskColMinimal>`.
 * - There are no columns, or all cards are undone.
 *
 * **AC-RD-TASKS-3**: cards must be read from `col.tasks` (NOT `col` directly).
 * **AC-RD-TASKS-4**: absent `done` treated as `false`.
 *
 * This function is intentionally ~10 lines, mirroring the dashboard's
 * `countDone` selector (`xai-web-dashboard-widgets/src/internal/dataReads/taskStats.ts`).
 * The dashboard version is un-importable (`internal/`), so we re-implement
 * here (Risk RA1 — justified, documented in dev_log §SRA).
 *
 * Statistics NEVER writes `xai_task_cols` — this is a read-only aggregator.
 *
 * Authority: packages/xai-web-statistics/docs/dev_log.md §SRA Phase P1
 */

import { narrowTaskCols } from "./narrowTaskCols.js";

/**
 * Returns the count of `done === true` cards in the raw `xai_task_cols`
 * store value.  Reads from `col.tasks` (+ optional `col.completed`).
 *
 * Returns `0` for any non-conforming input (defensive).
 */
export function countDoneTasks(store: unknown): number {
  if (!narrowTaskCols(store)) return 0;

  let done = 0;
  for (const col of Object.values(store)) {
    // Primary card list
    for (const card of col.tasks) {
      if (card.done === true) done += 1;
    }
    // Optional completed bucket
    if (Array.isArray(col.completed)) {
      for (const card of col.completed) {
        if (card.done === true) done += 1;
      }
    }
  }
  return done;
}

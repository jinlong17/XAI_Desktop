/**
 * @internal — taskStats selector.
 *
 * Counts `done` / `total` task cards across all columns in the task board.
 *
 * Metric for StatTasks:
 *   - done  = cards where `card.done === true` (T-10 field; absent === false)
 *   - total = all cards across all columns (`tasks` + `completed?` arrays)
 *
 * "Done" is NOT a today-filtered metric — there is no completion timestamp on
 * TaskCard; the `done` boolean reflects the board's CURRENT state. This
 * matches the SHIPPED `14/22` donut shape (zero CSS/Donut change).
 *
 * **AC-RD-TASKS-3**: cards must be read from `col.tasks` (NOT `col` directly —
 * guard against Cmd-K's flattened-read stale pattern).
 * **AC-RD-TASKS-4**: absent `done` treated as `false`.
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #6
 */

import { isTaskColsRecord } from "./isTaskColsRecord.js";

export interface TaskStats {
  done: number;
  total: number;
}

/**
 * Returns `{ done, total }` from the raw `xai_task_cols` store value.
 *
 * Returns `{ done: 0, total: 0 }` when:
 * - The value does not conform to the expected shape (defensive).
 * - There are no columns or all columns are empty.
 */
export function countDone(store: unknown): TaskStats {
  if (!isTaskColsRecord(store)) return { done: 0, total: 0 };

  let done = 0;
  let total = 0;

  for (const col of Object.values(store)) {
    // Primary card list
    for (const card of col.tasks) {
      total += 1;
      if (card.done === true) done += 1;
    }
    // Optional completed bucket (some columns carry a separate completed list)
    if (Array.isArray(col.completed)) {
      for (const card of col.completed) {
        total += 1;
        if (card.done === true) done += 1;
      }
    }
  }

  return { done, total };
}

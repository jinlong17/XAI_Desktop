/**
 * @internal — narrowTaskCols predicate.
 *
 * Narrows the `unknown` value from `usePref("xai_task_cols")` into the
 * real owner shape:
 *
 *   Record<BucketId, { tasks: TaskCardMinimal[]; completed?: TaskCardMinimal[] }>
 *
 * where BucketId = "overdue" | "next7" | "later" | "nodate".
 *
 * **Cards live at `col.tasks`, NOT directly at the value.** The Cmd-K
 * pattern reads `Record<string, unknown[]>` (treating the column value as the
 * card array) — that is WRONG (stale). The real `TaskCol` shape is
 * `{ tasks: TaskCard[] }`.  DO NOT copy Cmd-K's flattened read (RD2 guard).
 *
 * `TaskCard.done?: boolean` — T-10 made this real. Absent/undefined treated
 * as `false` by all consumers (AC-RD-TASKS-4 guard).
 *
 * Non-conforming entries are silently skipped (defensive — RD12).
 *
 * Mirrors SHIPPED dashboard `isTaskColsRecord` (xai-web-dashboard-widgets).
 * Logic re-implemented here because the dashboard's version lives in
 * `src/internal/` (un-importable — red-line: `index.ts` is the only public
 * surface). Recorded as Risk RA1 in dev_log §SRA.
 *
 * Authority: packages/xai-web-statistics/docs/dev_log.md §SRA Phase P1
 * Discovery: docs/reviews/xai-web-statistics-real-aggregation/20260529-discovery-review.md §2.3
 */

export interface TaskCardMinimal {
  /** T-10: `done?: boolean` — absent === false. */
  done?: boolean;
}

export interface TaskColMinimal {
  tasks: TaskCardMinimal[];
  completed?: TaskCardMinimal[];
}

/**
 * Returns `true` if `v` is a non-null object where each value is a valid
 * `TaskCol` shape (has a `tasks` array). Unknown bucket ids are tolerated.
 */
export function narrowTaskCols(v: unknown): v is Record<string, TaskColMinimal> {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  for (const val of Object.values(obj)) {
    if (typeof val !== "object" || val === null) return false;
    const col = val as Record<string, unknown>;
    if (!Array.isArray(col.tasks)) return false;
    // `completed` is optional; if present, must be an array.
    if (col.completed !== undefined && !Array.isArray(col.completed)) return false;
  }
  return true;
}

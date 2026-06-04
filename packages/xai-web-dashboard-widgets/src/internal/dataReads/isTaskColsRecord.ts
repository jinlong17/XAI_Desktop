/**
 * @internal — isTaskColsRecord predicate.
 *
 * Narrows the `unknown` from `usePref("xai_task_cols")` into the real
 * owner shape:
 *
 *   Record<BucketId, { tasks: TaskCard[]; completed?: TaskCard[] }>
 *   OR TaskCol[] from the current xai-web-tasks owner package.
 *
 * where BucketId = "overdue" | "next7" | "later" | "nodate".
 *
 * **Cards are at `col.tasks`, NOT directly at the value.** Cmd-K reads
 * `Record<string, unknown[]>` (treating the column value as the card array)
 * — that is WRONG (stale guess). The real `TaskCol` has `{ tasks: TaskCard[] }`.
 * DO NOT copy Cmd-K's flattened read (RD2 guard).
 *
 * `TaskCard.done?: boolean` — T-10 made this real. Absent/undefined is
 * treated as `false` by all consumers (AC-RD-TASKS-4 guard).
 *
 * Non-conforming entries are silently skipped (defensive — RD12).
 *
 * Authority: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #3/4/6
 * Discovery: docs/reviews/xai-web-dashboard-real-data/20260528-discovery-review.md §3.1
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
 * Checks if `v` is a non-null object where each value is a valid TaskCol
 * shape (has a `tasks` array). Unknown bucket ids are tolerated.
 */
export function isTaskColsRecord(v: unknown): v is Record<string, TaskColMinimal> {
  if (Array.isArray(v)) {
    return v.every((val) => {
      if (typeof val !== "object" || val === null) return false;
      const col = val as Record<string, unknown>;
      if (typeof col.id !== "string") return false;
      if (!Array.isArray(col.tasks)) return false;
      if (col.completed !== undefined && !Array.isArray(col.completed)) return false;
      return true;
    });
  }
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  for (const val of Object.values(obj)) {
    if (typeof val !== "object" || val === null) return false;
    const col = val as Record<string, unknown>;
    if (!Array.isArray(col.tasks)) return false;
    // `completed` is optional; if present, it must be an array.
    if (col.completed !== undefined && !Array.isArray(col.completed)) return false;
  }
  return true;
}

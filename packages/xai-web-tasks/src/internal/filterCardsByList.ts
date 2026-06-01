/**
 * filterCardsByList.ts — pure view selector for smart-list filtering.
 *
 * Returns a new TaskCol[] whose per-column task arrays are filtered based on
 * the active SmartListId. The stored xai_task_cols is NEVER mutated; this
 * function only produces a READ-ONLY projection for rendering.
 *
 * Key design decisions (design.md §F.1–§F.2, discovery §2–§3):
 *  - "all" / "summary": identity — returns `cols` unchanged (no allocation).
 *  - "inbox": keeps cards where card.inbox === true across ALL buckets,
 *             including nodate.completed.
 *  - "next7": keeps cards in the "next7" bucket; other buckets → tasks: [].
 *  - "today": keeps cards in the "overdue" bucket (bucket approximation — Q-T).
 *  - "tomorrow": keeps cards in the "next7" bucket (bucket approximation — Q-T).
 *  - unknown list: identity (defensive — returns cols unchanged).
 *
 * Q-T honesty: "today" maps to the "overdue" bucket (past-due / needs-attention-now)
 * and "tomorrow" maps to the "next7" bucket (nearest upcoming dated bucket).
 * The card shape has NO real per-day due dates (TaskCard.date is a year-less display
 * string; next7 cards have no date at all). This bucket approximation is the honest,
 * deterministic mapping given the existing persisted data model. See design §F.1 + Q-T.
 *
 * No-mutation guarantee (T-FILT-NOMUT):
 *  - This function never calls setRawCols, never touches localStorage, and never
 *    invokes moveCard/toggleComplete/addCard. All three mutation handlers in
 *    TasksModule continue to operate on the UNFILTERED taskCols and write through
 *    the SHIPPED setRawCols boundary cast. See design §F.1 assumption 2.
 *
 * Derived view count:
 *  - Each returned column's `count` reflects filtered tasks.length for display
 *    honesty. The persisted `count` in xai_task_cols is untouched (T-FILT-COUNT).
 *
 * `now` is threaded for API consistency/future-proofing even though v1 predicates
 * are purely bucket-based and have no clock dependency.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §F.2
 * Design:       packages/xai-web-tasks/docs/design.md §F.1–§F.2
 *
 * @internal
 */

import type { TaskCol, TaskCard, SmartListId } from "../types.js";

/**
 * Pure view selector. Returns a new TaskCol[] for rendering only.
 * Never writes storage. Untouched columns may be returned by reference
 * (referential equality, mirroring the moveCard discipline).
 *
 * @param cols    - Current resolved taskCols (UNFILTERED, from usePref).
 * @param list    - Active SmartListId from TasksModule useState.
 * @param _now    - Unused in v1 (bucket-derived predicates have no clock dependency).
 *                  Kept in signature for future real due-date support.
 */
export function filterCardsByList(
  cols: TaskCol[],
  list: SmartListId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _now?: Date,
): TaskCol[] {
  switch (list) {
    // identity — return cols unchanged (no allocation)
    case "all":
    case "summary":
      return cols;

    // inbox: keep cards where card.inbox === true across ALL buckets
    // including nodate.completed (discovery §3)
    case "inbox": {
      return cols.map((col) => {
        const filteredTasks = col.tasks.filter((t: TaskCard) => t.inbox === true);
        const filteredCompleted = col.completed
          ? col.completed.filter((t: TaskCard) => t.inbox === true)
          : undefined;

        // Referential equality when nothing changed (mirroring moveCard discipline)
        const tasksUnchanged =
          filteredTasks.length === col.tasks.length &&
          (!col.completed || (filteredCompleted && filteredCompleted.length === col.completed.length));

        if (tasksUnchanged) return col;

        return {
          ...col,
          tasks: filteredTasks,
          count: filteredTasks.length,
          ...(filteredCompleted !== undefined ? { completed: filteredCompleted } : {}),
        };
      });
    }

    // next7: keep cards in the "next7" bucket; other buckets → tasks: []
    // The "next7" bucket IS "within the next 7 days" per dateForCol (today+2d).
    case "next7": {
      return _filterByBucket(cols, "next7");
    }

    // today: keep cards in the "overdue" bucket (bucket approximation — Q-T).
    // "Today" maps to the most-urgent dated bucket the board models.
    // Empty-state wording MUST NOT claim "due today" precision (D-QT directive).
    case "today": {
      return _filterByBucket(cols, "overdue");
    }

    // tomorrow: keep cards in the "next7" bucket (bucket approximation — Q-T).
    // "Tomorrow" maps to the nearest upcoming dated bucket.
    // Empty-state wording MUST NOT claim "due tomorrow" precision (D-QT directive).
    case "tomorrow": {
      return _filterByBucket(cols, "next7");
    }

    // Defensive: unknown list → identity (no allocation)
    default:
      return cols;
  }
}

/**
 * @internal helper — keeps only the specified bucket's cards; other buckets get empty tasks.
 * Columns already empty for that bucket are returned by reference.
 */
function _filterByBucket(cols: TaskCol[], bucketId: string): TaskCol[] {
  return cols.map((col) => {
    if (col.id === bucketId) {
      // Keep this column unchanged (referential equality)
      return col;
    }
    // Other columns: empty tasks + empty completed (no cards shown under this list)
    if (col.tasks.length === 0 && (!col.completed || col.completed.length === 0)) {
      return col; // already empty — referential equality
    }
    return {
      ...col,
      tasks: [],
      count: 0,
      ...(col.completed !== undefined ? { completed: [] } : {}),
    };
  });
}

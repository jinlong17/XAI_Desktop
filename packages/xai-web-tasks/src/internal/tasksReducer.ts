/**
 * tasksReducer.ts — pure state-transition helpers.
 *
 * moveCard:      remove a task from fromCol, rewrite its date, prepend to toCol.
 * toggleComplete: toggle a task id in the in-memory completed set.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §5.2 + §5.3
 * Design: packages/xai-web-tasks/docs/design.md §1 (D1 dateForCol)
 *
 * @internal
 */

import type { TaskCol, TaskCard, BucketId } from "../types.js";
import { dateForCol } from "./dateForCol.js";

/**
 * Pure move: removes task from fromColId, rewrites date per toColId, prepends to toColId.tasks.
 *
 * Returns `prev` unchanged when:
 *  - fromColId === toColId
 *  - taskId not found in fromColId
 *
 * Columns not involved in the move are returned by reference (referential equality preserved).
 */
export function moveCard(
  prev: TaskCol[],
  taskId: string,
  fromColId: BucketId,
  toColId: BucketId,
  now?: Date,
): TaskCol[] {
  if (fromColId === toColId) return prev;

  const fromIdx = prev.findIndex((c) => c.id === fromColId);
  const toIdx   = prev.findIndex((c) => c.id === toColId);
  if (fromIdx < 0 || toIdx < 0) return prev;

  const fromCol = prev[fromIdx]!;
  const task = fromCol.tasks.find((t) => t.id === taskId);
  if (!task) return prev;

  // Rewrite date fields — strip date/dateZh/dateLabel/sub regardless of destination,
  // then re-add date fields for dated buckets (api.md §5.2).
  const newDateResult = dateForCol(toColId, now);
  const { id, title, tag, inbox } = task;

  const moved: TaskCard = (() => {
    if (toColId === "nodate") {
      // Strip date + dateZh + dateLabel + sub; keep tag + inbox (api.md §5.2)
      return {
        id,
        title,
        ...(tag !== undefined    ? { tag }    : {}),
        ...(inbox !== undefined  ? { inbox }  : {}),
      };
    }
    // Non-nodate: set date + dateZh from dateForCol; strip dateLabel + sub
    const base = {
      id,
      title,
      ...(tag !== undefined   ? { tag }   : {}),
      ...(inbox !== undefined ? { inbox } : {}),
    };
    if (newDateResult) {
      return { ...base, date: newDateResult.date, dateZh: newDateResult.dateZh };
    }
    return base;
  })();

  return prev.map((col, i) => {
    if (i === fromIdx) {
      return {
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
        count: Math.max(0, (col.count ?? 0) - 1),
      };
    }
    if (i === toIdx) {
      return {
        ...col,
        tasks: [moved, ...col.tasks],
        count: (col.count ?? 0) + 1,
      };
    }
    return col; // referential equality for untouched columns
  });
}

/**
 * Pure toggle: add taskId if absent, remove if present.
 * Returns a new Set — original is not mutated.
 */
export function toggleComplete(
  prev: ReadonlySet<string>,
  taskId: string,
): Set<string> {
  const next = new Set(prev);
  if (next.has(taskId)) {
    next.delete(taskId);
  } else {
    next.add(taskId);
  }
  return next;
}

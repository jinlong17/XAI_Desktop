/**
 * tasksReducer.ts — pure state-transition helpers.
 *
 * moveCard:      remove a task from fromCol, rewrite its date, prepend to toCol.
 * toggleComplete: flip the `done` field on a card in TaskCol[] — persisted via setRawCols.
 * addCard:       create a new card from a NewTaskDraft and prepend to targetBucket.
 *
 * T-10 fix: toggleComplete now operates on TaskCol[] (not Set<string>) so completion
 * is stored in xai_task_cols and survives page refresh.
 *
 * API contract: packages/xai-web-tasks/docs/api.md §5.2 + §5.3 + §E.3
 * Design: packages/xai-web-tasks/docs/design.md §1 (D1 dateForCol) + §E.3
 *
 * @internal
 */

import type { TaskCol, TaskCard, BucketId, NewTaskDraft } from "../types.js";
import { dateForCol } from "./dateForCol.js";
import { createTaskId } from "./ids.js";

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
  // T-10 sub-fix 4: preserve `done` across bucket moves (prevents drag clearing completion)
  const { id, title, tag, inbox, done } = task;

  const moved: TaskCard = (() => {
    if (toColId === "nodate") {
      // Strip date + dateZh + dateLabel + sub; keep tag + inbox + done (api.md §5.2)
      return {
        id,
        title,
        ...(tag !== undefined    ? { tag }    : {}),
        ...(inbox !== undefined  ? { inbox }  : {}),
        ...(done !== undefined   ? { done }   : {}),
      };
    }
    // Non-nodate: set date + dateZh from dateForCol; strip dateLabel + sub; keep done
    const base = {
      id,
      title,
      ...(tag !== undefined   ? { tag }   : {}),
      ...(inbox !== undefined ? { inbox } : {}),
      ...(done !== undefined  ? { done }  : {}),
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
 * Pure toggle: flips the `done` field on the matching card in TaskCol[].
 *
 * T-10 fix: result is a new TaskCol[] that can be passed to setRawCols for
 * persistence — completion now survives page refresh.
 *
 * Returns `prev` unchanged when taskId is not found in any column.
 * Columns that do not contain the card are returned by reference (referential equality).
 *
 * API contract: packages/xai-web-tasks/docs/api.md §5.3 (T-10 update)
 */
export function toggleComplete(
  prev: TaskCol[],
  taskId: string,
): TaskCol[] {
  let found = false;
  const next = prev.map((col) => {
    const taskIdx = col.tasks.findIndex((t) => t.id === taskId);
    if (taskIdx < 0) return col; // referential equality for untouched columns

    found = true;
    const task = col.tasks[taskIdx]!;
    const updatedTask: TaskCard = { ...task, done: !task.done };
    const updatedTasks = [
      ...col.tasks.slice(0, taskIdx),
      updatedTask,
      ...col.tasks.slice(taskIdx + 1),
    ];
    return { ...col, tasks: updatedTasks };
  });
  return found ? next : prev;
}

/**
 * Pure create: builds a new TaskCard from a NewTaskDraft and prepends it
 * to targetBucket.tasks (top of column = index 0, matching moveCard's
 * prepend convention). targetBucket.count becomes count + 1.
 *
 * Returns `prev` unchanged when:
 *  - draft.title.trim().length === 0 (defensive guard; composer also blocks this)
 *  - targetBucket not found in prev
 *
 * All other columns pass through untouched (referential equality preserved).
 *
 * API contract: packages/xai-web-tasks/docs/api.md §E.3
 */
export function addCard(
  prev: TaskCol[],
  draft: NewTaskDraft,
  targetBucket: BucketId,
  now?: Date,
): TaskCol[] {
  const trimmedTitle = draft.title.trim();
  // Defensive guard: empty title returns prev unchanged
  if (trimmedTitle.length === 0) return prev;

  const toIdx = prev.findIndex((c) => c.id === targetBucket);
  // targetBucket not found: return prev unchanged
  if (toIdx < 0) return prev;

  // Build the date fields if opted-in and bucket is not nodate
  const dateResult = (draft.withDate && targetBucket !== "nodate")
    ? dateForCol(targetBucket, now)
    : null;

  // Build the new card (no sub / dateLabel / inbox on user-created cards)
  const newCard: TaskCard = {
    id: createTaskId(),
    title: { en: trimmedTitle, zh: trimmedTitle },
    ...(draft.tag !== undefined ? { tag: draft.tag } : {}),
    ...(dateResult ? { date: dateResult.date, dateZh: dateResult.dateZh } : {}),
  };

  return prev.map((col, i) => {
    if (i === toIdx) {
      return {
        ...col,
        tasks: [newCard, ...col.tasks],
        count: (col.count ?? 0) + 1,
      };
    }
    return col; // referential equality for untouched columns
  });
}

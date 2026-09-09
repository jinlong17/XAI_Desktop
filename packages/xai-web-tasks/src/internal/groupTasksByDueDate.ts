import { addLocalDays, localDateKey, parseLocalDateKey } from "@repo/plugin-web-tokens";
import type { BucketId, TaskCard, TaskCol } from "../types.js";

/** Regroup known dates without rewriting dates or guessing legacy years. */
export function groupTasksByDueDate(cols: TaskCol[], now: Date = new Date(), clearIds?: ReadonlySet<string>): TaskCol[] {
  const today = localDateKey(now);
  const end = localDateKey(addLocalDays(now, 7));
  const destination = (task: TaskCard, original: BucketId): BucketId => {
    if (clearIds?.has(task.id)) return "nodate";
    const due = task.dueDate;
    if (!due || !parseLocalDateKey(due)) return original;
    return due <= today ? "overdue" : due <= end ? "next7" : "later";
  };
  const next = cols.map(c => ({ ...c, tasks: [] as TaskCard[], ...(c.completed ? { completed: [] as TaskCard[] } : {}) }));
  for (const col of cols) {
    for (const task of col.tasks) (next.find(c => c.id === destination(task, col.id)) ?? next.find(c => c.id === col.id))!.tasks.push(task);
    for (const task of col.completed ?? []) {
      const target = (next.find(c => c.id === destination(task, col.id)) ?? next.find(c => c.id === col.id))!;
      target.completed ??= [];
      (target.completed as TaskCard[]).push(task);
    }
  }
  return next.map((col, i) => {
    const prev = cols[i]!;
    const same = col.tasks.length === prev.tasks.length && col.tasks.every((t, j) => t === prev.tasks[j]) && col.completed?.length === prev.completed?.length && (col.completed ?? []).every((t, j) => t === prev.completed?.[j]);
    return same ? prev : { ...col, count: col.tasks.length };
  });
}

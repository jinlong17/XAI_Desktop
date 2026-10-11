import { addLocalDays, localDateKey, parseLocalDateKey } from "@repo/plugin-web-tokens";
import type { TaskCol, TaskCard, SmartListId } from "../types.js";

/** Read-only projection: legacy yearless labels never imply a calendar date. */
export function filterCardsByList(cols: TaskCol[], list: SmartListId, now: Date = new Date()): TaskCol[] {
  if (list === "all" || list === "summary" || !["today", "tomorrow", "next7", "inbox"].includes(list)) return cols;
  const today = localDateKey(now);
  const tomorrow = localDateKey(addLocalDays(now, 1));
  const end = localDateKey(addLocalDays(now, 7));
  const matches = (task: TaskCard) => {
    if (list === "inbox") return task.inbox === true || task.listId === "inbox";
    const due = task.dueDate;
    if (!due || !parseLocalDateKey(due)) return false;
    if (list === "today") return due <= today;
    if (list === "tomorrow") return due === tomorrow;
    return due > today && due <= end;
  };
  return cols.map(col => {
    const tasks = col.tasks.filter(matches);
    const completed = col.completed?.filter(matches);
    if (tasks.length === col.tasks.length && completed?.length === col.completed?.length) return col;
    return { ...col, tasks, count: tasks.length, ...(completed ? { completed } : {}) };
  });
}

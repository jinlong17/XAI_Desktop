import { parseLocalDateKey } from "@repo/plugin-web-tokens";
/**
 * Public helpers for creating and resolving Tasks that originate from Board
 * cards. This keeps Board integrations on the public package surface instead
 * of importing Tasks internals directly.
 */

import type {
  BoardTaskLinkSource,
  BucketId,
  TaskCard,
  TaskCol,
  TaskTitleBundle,
} from "./types.js";
import { SEED_TASK_COLS } from "./internal/seed/tasksMock.js";
import { isTaskColsArray } from "./internal/validate.js";

export interface BoardLinkedTaskInput extends BoardTaskLinkSource {
  readonly title: TaskTitleBundle;
  readonly dueDate?: string;
}

export interface BoardLinkedTaskLookup {
  readonly task: TaskCard;
  readonly bucketId: BucketId;
  readonly completed: boolean;
}

export function loadTaskColsOrSeed(raw: unknown): TaskCol[] {
  if (isTaskColsArray(raw)) return raw;
  return SEED_TASK_COLS.map((col) => ({
    ...col,
    tasks: [...col.tasks],
    ...(col.completed ? { completed: [...col.completed] } : {}),
  }));
}

export function boardLinkedTaskId(
  input: Pick<BoardTaskLinkSource, "boardId" | "cardId">,
): string {
  return `bt-${input.boardId}-${input.cardId}`;
}

function parseIsoDateOnly(value: string): { year: number; month: number; day: number } | null {
  if (!parseLocalDateKey(value)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function dayNumberUtc(parts: { year: number; month: number; day: number }): number {
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86_400_000);
}

function todayNumberUtc(now: Date): number {
  return Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
  );
}

export function bucketIdForBoardDueDate(
  dueDate: string | undefined,
  now: Date = new Date(),
): BucketId {
  if (!dueDate) return "nodate";
  const parts = parseIsoDateOnly(dueDate);
  if (!parts) return "nodate";
  const delta = dayNumberUtc(parts) - todayNumberUtc(now);
  if (delta < 0) return "overdue";
  if (delta <= 7) return "next7";
  return "later";
}

function dateDisplayFromIso(dueDate: string | undefined): {
  date?: string;
  dateZh?: string;
} {
  if (!dueDate) return {};
  const parts = parseIsoDateOnly(dueDate);
  if (!parts) return {};
  return {
    date: `${parts.month}/${parts.day}`,
    dateZh: `${parts.month} 月 ${parts.day} 日`,
  };
}

export function taskCardFromBoardLink(input: BoardLinkedTaskInput): TaskCard {
  return {
    id: boardLinkedTaskId(input),
    title: input.title,
    tag: "todo",
    inbox: true,
    source: {
      type: "board-card",
      boardId: input.boardId,
      listId: input.listId,
      cardId: input.cardId,
    },
    ...(input.dueDate && parseIsoDateOnly(input.dueDate) ? { dueDate: input.dueDate } : {}),
    ...dateDisplayFromIso(input.dueDate),
  };
}

function sourceMatches(task: TaskCard, source: BoardTaskLinkSource): boolean {
  return (
    task.source?.type === "board-card" &&
    task.source.boardId === source.boardId &&
    task.source.listId === source.listId &&
    task.source.cardId === source.cardId
  );
}

function sameLinkedTask(candidate: TaskCard, task: TaskCard): boolean {
  if (candidate.id === task.id) return true;
  return task.source ? sourceMatches(candidate, task.source) : false;
}

export function findBoardLinkedTask(
  cols: readonly TaskCol[],
  source: BoardTaskLinkSource,
): BoardLinkedTaskLookup | null {
  for (const col of cols) {
    const task = col.tasks.find((entry) => sourceMatches(entry, source));
    if (task) return { task, bucketId: col.id, completed: false };
    const completed = col.completed?.find((entry) => sourceMatches(entry, source));
    if (completed) return { task: completed, bucketId: col.id, completed: true };
  }
  return null;
}

export function upsertBoardLinkedTask(
  cols: readonly TaskCol[],
  task: TaskCard,
  bucketId: BucketId = "nodate",
): TaskCol[] {
  let updatedExisting = false;
  const withoutDuplicate = cols.map((col) => {
    const tasks = col.tasks.map((entry) => {
      if (!sameLinkedTask(entry, task)) return entry;
      updatedExisting = true;
      return task;
    });
    const completed = col.completed?.map((entry) => {
      if (!sameLinkedTask(entry, task)) return entry;
      updatedExisting = true;
      return task;
    });
    return {
      ...col,
      tasks,
      count: tasks.length,
      ...(completed ? { completed } : {}),
    };
  });

  if (updatedExisting) return withoutDuplicate;

  return withoutDuplicate.map((col) =>
    col.id === bucketId
      ? { ...col, tasks: [task, ...col.tasks], count: col.tasks.length + 1 }
      : col,
  );
}

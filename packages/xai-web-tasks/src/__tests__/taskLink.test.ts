import { describe, expect, it } from "vitest";
import {
  boardLinkedTaskId,
  bucketIdForBoardDueDate,
  findBoardLinkedTask,
  loadTaskColsOrSeed,
  taskCardFromBoardLink,
  upsertBoardLinkedTask,
} from "../taskLink.js";
import { SEED_TASK_COLS } from "../internal/seed/tasksMock.js";
import type { TaskCol } from "../types.js";

const SOURCE = {
  type: "board-card" as const,
  boardId: "b1",
  listId: "l1",
  cardId: "c1",
};

describe("board task link helpers", () => {
  it("BTL1 creates deterministic ids", () => {
    expect(boardLinkedTaskId(SOURCE)).toBe("bt-b1-c1");
  });

  it("BTL2 maps board due dates to task buckets", () => {
    const now = new Date("2026-06-03T12:00:00.000Z");
    expect(bucketIdForBoardDueDate(undefined, now)).toBe("nodate");
    expect(bucketIdForBoardDueDate("2026-06-02", now)).toBe("overdue");
    expect(bucketIdForBoardDueDate("2026-06-10", now)).toBe("next7");
    expect(bucketIdForBoardDueDate("2026-06-11", now)).toBe("later");
    expect(bucketIdForBoardDueDate("not-a-date", now)).toBe("nodate");
  });

  it("BTL3 creates TaskCard payload from board reference", () => {
    const task = taskCardFromBoardLink({
      ...SOURCE,
      title: { en: "Card title", zh: "卡片标题" },
      dueDate: "2026-06-04",
    });
    expect(task.id).toBe("bt-b1-c1");
    expect(task.title.en).toBe("Card title");
    expect(task.date).toBe("6/4");
    expect(task.dateZh).toBe("6 月 4 日");
    expect(task.source).toEqual(SOURCE);
  });

  it("BTL4 loadTaskColsOrSeed returns valid raw values or seed fallback", () => {
    const seeded = loadTaskColsOrSeed(null);
    expect(seeded).toHaveLength(4);
    expect(seeded).not.toBe(SEED_TASK_COLS);
    const valid = SEED_TASK_COLS as TaskCol[];
    expect(loadTaskColsOrSeed(valid)).toBe(valid);
  });

  it("BTL5 upsert inserts a linked task into the target bucket", () => {
    const cols = loadTaskColsOrSeed(null);
    const task = taskCardFromBoardLink({
      ...SOURCE,
      title: { en: "Linked", zh: "Linked" },
    });
    const next = upsertBoardLinkedTask(cols, task, "next7");
    const next7 = next.find((col) => col.id === "next7")!;
    expect(next7.tasks[0]).toEqual(task);
    expect(next7.count).toBe(cols.find((col) => col.id === "next7")!.count + 1);
  });

  it("BTL6 upsert updates existing linked task without duplicating", () => {
    const cols = loadTaskColsOrSeed(null);
    const task = taskCardFromBoardLink({
      ...SOURCE,
      title: { en: "Linked", zh: "Linked" },
    });
    const first = upsertBoardLinkedTask(cols, task, "nodate");
    const updated = upsertBoardLinkedTask(
      first,
      { ...task, title: { en: "Updated", zh: "Updated" } },
      "nodate",
    );
    const nodate = updated.find((col) => col.id === "nodate")!;
    const matches = nodate.tasks.filter((entry) => entry.id === task.id);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.title.en).toBe("Updated");
  });

  it("BTL7 findBoardLinkedTask detects active and completed linked tasks", () => {
    const task = taskCardFromBoardLink({
      ...SOURCE,
      title: { en: "Linked", zh: "Linked" },
    });
    const activeCols = upsertBoardLinkedTask(loadTaskColsOrSeed(null), task, "later");
    expect(findBoardLinkedTask(activeCols, SOURCE)).toMatchObject({
      bucketId: "later",
      completed: false,
    });

    const completedCols: TaskCol[] = [
      { id: "overdue", key: "overdue", count: 0, tasks: [] },
      { id: "next7", key: "next_7_days", count: 0, tasks: [] },
      { id: "later", key: "later", count: 0, tasks: [] },
      {
        id: "nodate",
        key: "no_date",
        count: 0,
        tasks: [],
        completed: [task],
      },
    ];
    expect(findBoardLinkedTask(completedCols, SOURCE)).toMatchObject({
      bucketId: "nodate",
      completed: true,
    });
  });
});

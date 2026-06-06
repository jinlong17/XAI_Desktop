import { describe, expect, test } from "vitest";
import {
  BOARD_AUTOMATION_URGENT_LABEL_ID,
  applyBoardAutomationLite,
} from "../internal/automationLite.js";
import type { BoardList } from "../types.js";

const NOW = new Date("2026-06-03T12:00:00.000Z");

function makeCard(id: string, patch = {}) {
  return {
    id,
    title: { en: id, zh: id },
    ...patch,
  };
}

function makeList(id: string, cards: BoardList["cards"], patch = {}): BoardList {
  return {
    id,
    key: null,
    customName: { en: id, zh: id },
    cards,
    ...patch,
  };
}

describe("applyBoardAutomationLite", () => {
  test("AUTO-1 marks active cards in semantic Done lists complete", () => {
    const lists = [
      makeList(
        "done",
        [
          makeCard("c1", {
            checklistItems: [
              { id: "i1", text: "One", done: false },
              { id: "i2", text: "Two", done: true },
            ],
          }),
          makeCard("c2", {
            archived: true,
            checklist: { done: 0, total: 2 },
          }),
        ],
        { customName: { en: "Done", zh: "已完成" } },
      ),
    ];

    const result = applyBoardAutomationLite(lists, { now: NOW });

    expect(result.changed).toBe(true);
    expect(result.stats.completedCards).toBe(1);
    expect(result.lists[0]!.cards[0]!.completedAt).toBe(NOW.toISOString());
    expect(result.lists[0]!.cards[0]!.checklistItems).toEqual([
      { id: "i1", text: "One", done: true },
      { id: "i2", text: "Two", done: true },
    ]);
    expect(result.lists[0]!.cards[0]!.checklist).toEqual({ done: 2, total: 2 });
    expect(result.lists[0]!.cards[1]!.completedAt).toBeUndefined();
    expect(result.lists[0]!.cards[1]!.checklist).toEqual({ done: 0, total: 2 });
  });

  test("AUTO-2 adds urgent once to due-soon active non-Done cards", () => {
    const lists = [
      makeList("doing", [
        makeCard("today", { dueDate: "2026-06-03", labels: ["feature"] }),
        makeCard("soon", { dueDate: "2026-06-05" }),
        makeCard("duplicate", { dueDate: "2026-06-04", labels: ["urgent"] }),
        makeCard("overdue", { dueDate: "2026-06-02" }),
        makeCard("later", { dueDate: "2026-06-06" }),
      ]),
      makeList(
        "done",
        [makeCard("done-soon", { dueDate: "2026-06-04" })],
        { key: "done" },
      ),
    ];

    const result = applyBoardAutomationLite(lists, { now: NOW, sortDueDates: false });
    const cards = result.lists[0]!.cards;

    expect(result.stats.urgentLabelsAdded).toBe(2);
    expect(cards[0]!.labels).toEqual(["feature", BOARD_AUTOMATION_URGENT_LABEL_ID]);
    expect(cards[1]!.labels).toEqual([BOARD_AUTOMATION_URGENT_LABEL_ID]);
    expect(cards[2]!.labels).toEqual([BOARD_AUTOMATION_URGENT_LABEL_ID]);
    expect(cards[3]!.labels).toBeUndefined();
    expect(cards[4]!.labels).toBeUndefined();
    expect(result.lists[1]!.cards[0]!.labels).toBeUndefined();
  });

  test("AUTO-3 sorts active non-Done cards by due date and preserves no-due order", () => {
    const lists = [
      makeList("doing", [
        makeCard("no-due-1"),
        makeCard("archived", { archived: true, dueDate: "2026-06-01" }),
        makeCard("due-later", { dueDate: "2026-06-05" }),
        makeCard("due-today", { dueDate: "2026-06-03" }),
        makeCard("no-due-2"),
      ]),
    ];

    const result = applyBoardAutomationLite(lists, { now: NOW });

    expect(result.stats.sortedLists).toBe(1);
    expect(result.lists[0]!.cards.map((card) => card.id)).toEqual([
      "due-today",
      "archived",
      "due-later",
      "no-due-1",
      "no-due-2",
    ]);
  });

  test("AUTO-4 returns the same lists reference when no presets change data", () => {
    const lists = [
      makeList("doing", [
        makeCard("later", { dueDate: "2026-06-07" }),
        makeCard("no-due"),
      ]),
      makeList("archived-list", [makeCard("today", { dueDate: "2026-06-03" })], {
        archived: true,
      }),
    ];

    const result = applyBoardAutomationLite(lists, { now: NOW });

    expect(result.changed).toBe(false);
    expect(result.lists).toBe(lists);
    expect(result.stats).toEqual({
      completedCards: 0,
      urgentLabelsAdded: 0,
      sortedLists: 0,
    });
  });
});

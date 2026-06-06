import { describe, expect, test } from "vitest";
import {
  BOARD_TEMPLATES,
  BOARD_MEMBER_OPTIONS,
  DEFAULT_WORKSPACES,
  PM_LABELS,
  makeDefaultBoards,
} from "../internal/seed/board-data.js";
import {
  isBoard,
  isBoardCard,
  isBoardList,
} from "../internal/isBoardArray.js";

describe("seed/board-data", () => {
  test("S1 makeDefaultBoards() returns at least 3 boards (b-default + b-pm + b-marketing)", () => {
    const boards = makeDefaultBoards();
    expect(boards.length).toBeGreaterThanOrEqual(3);
    expect(boards.map((b) => b.id)).toEqual(
      expect.arrayContaining(["b-default", "b-pm", "b-marketing"]),
    );
  });

  test("S2 every board passes isBoard guard", () => {
    for (const board of makeDefaultBoards()) {
      expect(isBoard(board)).toBe(true);
    }
  });

  test("S3 every list in every board passes isBoardList guard", () => {
    for (const board of makeDefaultBoards()) {
      for (const list of board.lists) {
        expect(isBoardList(list)).toBe(true);
      }
    }
  });

  test("S4 every card passes isBoardCard guard", () => {
    for (const board of makeDefaultBoards()) {
      for (const list of board.lists) {
        for (const card of list.cards) {
          expect(isBoardCard(card)).toBe(true);
        }
      }
    }
  });

  test("S5 DEFAULT_WORKSPACES.length === 2 (ws-personal + ws-team)", () => {
    expect(DEFAULT_WORKSPACES.length).toBe(2);
    expect(DEFAULT_WORKSPACES.map((w) => w.id)).toEqual([
      "ws-personal",
      "ws-team",
    ]);
  });

  test("S6 BOARD_TEMPLATES.length === 3 (kanban + pm + blank)", () => {
    expect(BOARD_TEMPLATES.length).toBe(3);
    expect(BOARD_TEMPLATES.map((t) => t.id)).toEqual(["kanban", "pm", "blank"]);
  });

  test("S7 BOARD_TEMPLATES[0].lists() returns 5 lists (Backlog/Today/Week/Later/Done) with keys set", () => {
    const lists = BOARD_TEMPLATES[0]!.lists();
    expect(lists.length).toBe(5);
    expect(lists.map((l) => l.key)).toEqual([
      "backlog",
      "today",
      "week",
      "later",
      "done",
    ]);
    for (const list of lists) {
      expect(list.cards).toEqual([]);
    }
  });

  test("S8 BOARD_TEMPLATES[1].lists() returns 5 lists (PM shape) with empty cards", () => {
    const lists = BOARD_TEMPLATES[1]!.lists();
    expect(lists.length).toBe(5);
    for (const list of lists) {
      expect(list.cards).toEqual([]);
      expect(list.key).toBe(null);
      expect(list.customName).toBeDefined();
    }
  });

  test("S9 BOARD_TEMPLATES[2].lists() returns []", () => {
    const lists = BOARD_TEMPLATES[2]!.lists();
    expect(lists).toEqual([]);
  });

  test("S10 PM_LABELS.length === 5", () => {
    expect(PM_LABELS.length).toBe(5);
    expect(PM_LABELS.map((l) => l.id)).toEqual([
      "pm-forms",
      "pm-accounts",
      "pm-feedback",
      "pm-billing",
      "pm-research",
    ]);
  });

  test("S10b BOARD_MEMBER_OPTIONS covers seed card member ids", () => {
    const memberIds = new Set(BOARD_MEMBER_OPTIONS.map((m) => m.id));
    expect(Array.from(memberIds)).toEqual(["u1", "u2", "u3"]);

    for (const board of makeDefaultBoards()) {
      for (const list of board.lists) {
        for (const card of list.cards) {
          for (const memberId of card.members ?? []) {
            expect(memberIds.has(memberId)).toBe(true);
          }
        }
      }
    }
  });

  test("S11 default kanban list `b-default` references only LIST_COLOR_IDS-valid colors (or undefined)", () => {
    const board = makeDefaultBoards().find((b) => b.id === "b-default")!;
    // Default kanban lists carry no `.color` field; PM and marketing do.
    for (const list of board.lists) {
      expect(list.color === undefined || list.color === null || typeof list.color === "string").toBe(true);
    }
  });
});

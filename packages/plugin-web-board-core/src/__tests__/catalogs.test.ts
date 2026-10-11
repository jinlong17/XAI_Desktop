import { describe, expect, test } from "vitest";
import {
  BOARD_PRIORITIES,
  DEFAULT_BOARD_LABELS,
  DEFAULT_BOARD_MEMBERS,
  getPriorityMeta,
  indexBoardLabels,
  memberInitials,
  resolveBoardLabels,
  resolveBoardMembers,
  stripLabelFromBoardLists,
  stripMemberFromBoardLists,
} from "../internal/catalogs.js";
import { makeDefaultBoards } from "../internal/seed/board-data.js";
import type { BoardList } from "../types.js";

describe("catalogs", () => {
  test("CAT1 every seed card label/member id resolves in the default catalogs (no orphan ids)", () => {
    const labelIndex = indexBoardLabels(DEFAULT_BOARD_LABELS);
    const memberIds = new Set(DEFAULT_BOARD_MEMBERS.map((m) => m.id));
    for (const board of makeDefaultBoards()) {
      for (const list of board.lists) {
        for (const card of list.cards) {
          for (const labelId of card.labels ?? []) {
            expect(labelIndex.has(labelId), `orphan label id ${labelId} on ${card.id}`).toBe(true);
          }
          for (const memberId of card.members ?? []) {
            expect(memberIds.has(memberId), `orphan member id ${memberId} on ${card.id}`).toBe(true);
          }
        }
      }
    }
  });

  test("CAT2 resolveBoardLabels: undefined → defaults; explicit [] respected; own catalog wins", () => {
    expect(resolveBoardLabels({})).toBe(DEFAULT_BOARD_LABELS);
    expect(resolveBoardLabels({ labels: [] })).toEqual([]);
    const own = [{ id: "x", name: { en: "X", zh: "X" }, color: "red" }];
    expect(resolveBoardLabels({ labels: own })).toBe(own);
  });

  test("CAT3 resolveBoardMembers: undefined → defaults; explicit [] respected", () => {
    expect(resolveBoardMembers({})).toBe(DEFAULT_BOARD_MEMBERS);
    expect(resolveBoardMembers({ members: [] })).toEqual([]);
  });

  test("CAT4 default label catalog has no duplicate ids and no duplicate display names", () => {
    const ids = DEFAULT_BOARD_LABELS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = DEFAULT_BOARD_LABELS.map((l) => l.name.en);
    expect(new Set(names).size).toBe(names.length);
  });

  test("CAT5 stripLabelFromBoardLists removes the id from every card incl. archived", () => {
    const lists: BoardList[] = [
      {
        id: "a",
        key: null,
        cards: [
          { id: "c1", title: { en: "1", zh: "1" }, labels: ["l1", "l2"] },
          { id: "c2", title: { en: "2", zh: "2" }, labels: ["l1"], archived: true },
        ],
      },
      {
        id: "b",
        key: null,
        archived: true,
        cards: [{ id: "c3", title: { en: "3", zh: "3" }, labels: ["l1"] }],
      },
    ];
    const next = stripLabelFromBoardLists(lists, "l1");
    expect(next[0]!.cards[0]!.labels).toEqual(["l2"]);
    expect(next[0]!.cards[1]!.labels).toEqual([]);
    expect(next[1]!.cards[0]!.labels).toEqual([]);
  });

  test("CAT6 stripMemberFromBoardLists removes the member id from every card", () => {
    const lists: BoardList[] = [
      {
        id: "a",
        key: null,
        cards: [{ id: "c1", title: { en: "1", zh: "1" }, members: ["u1", "u2"] }],
      },
    ];
    expect(stripMemberFromBoardLists(lists, "u1")[0]!.cards[0]!.members).toEqual(["u2"]);
  });

  test("CAT7 memberInitials: single word → first two letters; two words → first letters; empty → ?", () => {
    expect(memberInitials("Alice")).toBe("AL");
    expect(memberInitials("Ada Lovelace")).toBe("AL");
    expect(memberInitials("  ")).toBe("?");
  });

  test("CAT8 priority metadata covers all four levels ranked urgent > low", () => {
    expect(BOARD_PRIORITIES.map((p) => p.id)).toEqual(["urgent", "high", "medium", "low"]);
    expect(getPriorityMeta("urgent").rank).toBeGreaterThan(getPriorityMeta("low").rank);
  });
});

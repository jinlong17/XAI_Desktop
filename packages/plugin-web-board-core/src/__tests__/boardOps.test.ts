import { describe, expect, test } from "vitest";
import {
  addCardToListById,
  addCardToList,
  addNewList,
  archiveCard,
  archiveList,
  canManageBoardList,
  deleteCard,
  deleteList,
  getActiveBoardCardLists,
  getActiveBoardCards,
  getActiveBoardLists,
  getArchivedBoardCards,
  getArchivedBoardLists,
  mergeBoardCardPatch,
  moveCardWithinListByOffset,
  moveListByOffset,
  moveCardToList,
  renameCard,
  renameList,
  restoreCard,
  restoreList,
  setListColor,
  updateCardInList,
} from "../internal/boardOps.js";
import type { BoardList, BoardListMutationContext } from "../types.js";

const PM_CTX: BoardListMutationContext = { template: "pm" };
const KANBAN_CTX: BoardListMutationContext = { template: "kanban" };

function makeLists(): BoardList[] {
  return [
    {
      id: "A",
      key: null,
      customName: { en: "A", zh: "A" },
      color: "blue",
      cards: [
        { id: "c1", title: { en: "one", zh: "一" } },
        { id: "c2", title: { en: "two", zh: "二" } },
      ],
    },
    {
      id: "B",
      key: null,
      customName: { en: "B", zh: "B" },
      color: "green",
      cards: [{ id: "c3", title: { en: "three", zh: "三" } }],
    },
  ];
}

describe("boardOps", () => {
  test("M1 moveCardToList moves card from A to B; A loses card, B gains card; total count unchanged", () => {
    const lists = makeLists();
    const next = moveCardToList(lists, "c1", "A", "B");
    expect(next[0]?.cards.map((c) => c.id)).toEqual(["c2"]);
    expect(next[1]?.cards.map((c) => c.id)).toEqual(["c3", "c1"]);
    const totalBefore = lists[0]!.cards.length + lists[1]!.cards.length;
    const totalAfter = next[0]!.cards.length + next[1]!.cards.length;
    expect(totalAfter).toBe(totalBefore);
  });

  test("M2 moveCardToList returns same reference when card not in source", () => {
    const lists = makeLists();
    const next = moveCardToList(lists, "missing", "A", "B");
    expect(next).toBe(lists);
  });

  test("M3 moveCardToList with from === to is a no-op (same reference)", () => {
    const lists = makeLists();
    const next = moveCardToList(lists, "c1", "A", "A");
    expect(next).toBe(lists);
  });

  test("M3b moveCardToList with unknown target list is a no-op (same reference)", () => {
    const lists = makeLists();
    const next = moveCardToList(lists, "c1", "A", "ZZZ");
    expect(next).toBe(lists);
  });

  test("M4 addCardToList appends a card with bilingual title mirror and labels: []", () => {
    const lists = makeLists();
    const next = addCardToList(lists, 0, "Hello");
    expect(next[0]?.cards.length).toBe(3);
    const newCard = next[0]?.cards.at(-1);
    expect(newCard?.title.en).toBe("Hello");
    expect(newCard?.title.zh).toBe("Hello");
    expect(newCard?.labels).toEqual([]);
    expect(typeof newCard?.id).toBe("string");
  });

  test("M5 addCardToList with whitespace-only text returns same reference", () => {
    const lists = makeLists();
    expect(addCardToList(lists, 0, "   ")).toBe(lists);
    expect(addCardToList(lists, 0, "")).toBe(lists);
  });

  test("M5b addCardToList with out-of-range listIdx returns same reference", () => {
    const lists = makeLists();
    expect(addCardToList(lists, 99, "Hello")).toBe(lists);
    expect(addCardToList(lists, -1, "Hello")).toBe(lists);
  });

  test("M6 addNewList appends a list with key:null, customName bilingual mirror, color:null, cards: []", () => {
    const lists = makeLists();
    const next = addNewList(lists, "My List");
    expect(next.length).toBe(3);
    const created = next.at(-1);
    expect(created?.key).toBe(null);
    expect(created?.customName?.en).toBe("My List");
    expect(created?.customName?.zh).toBe("My List");
    expect(created?.color).toBe(null);
    expect(created?.cards).toEqual([]);
  });

  test("M6b addNewList with whitespace-only is a no-op (same reference)", () => {
    const lists = makeLists();
    expect(addNewList(lists, "   ")).toBe(lists);
  });

  test("M7 setListColor sets the color on the matching list; others untouched", () => {
    const lists = makeLists();
    const next = setListColor(lists, "B", "red");
    expect(next[0]?.color).toBe("blue");
    expect(next[1]?.color).toBe("red");
  });

  test("M8 setListColor(_, _, null) clears the color", () => {
    const lists = makeLists();
    const next = setListColor(lists, "A", null);
    expect(next[0]?.color).toBe(null);
    expect(next[1]?.color).toBe("green");
  });

  test("M9 updateCardInList merges patch into the matching card", () => {
    const lists = makeLists();
    const next = updateCardInList(lists, "A", "c1", { due: "5/26", dueLate: true });
    expect(next[0]?.cards[0]?.due).toBe("5/26");
    expect(next[0]?.cards[0]?.dueLate).toBe(true);
    expect(next[0]?.cards[0]?.title.en).toBe("one"); // preserved
  });

  test("M9b mergeBoardCardPatch derives checklist and attachment chips from detail fields", () => {
    const card = makeLists()[0]!.cards[0]!;
    const next = mergeBoardCardPatch(card, {
      checklistItems: [
        { id: "i1", text: "One", done: true },
        { id: "i2", text: "Two", done: false },
      ],
      attachments: [
        { id: "a1", url: "https://example.com/spec" },
        { id: "a2", url: "https://example.com/prd", title: "PRD" },
      ],
    });

    expect(next.checklist).toEqual({ done: 1, total: 2 });
    expect(next.attach).toBe(2);
  });

  test("M9bb mergeBoardCardPatch clears legacy checklist chip when checklistItems is empty", () => {
    const card = {
      ...makeLists()[0]!.cards[0]!,
      checklist: { done: 1, total: 2 },
    };
    const next = mergeBoardCardPatch(card, { checklistItems: [] });
    expect(next.checklistItems).toEqual([]);
    expect(next.checklist).toBeUndefined();
  });

  test("M9c mergeBoardCardPatch derives legacy date fields from ISO detail dates and clears them", () => {
    const card = makeLists()[0]!.cards[0]!;
    const withDates = mergeBoardCardPatch(card, {
      startDate: "2099-01-01",
      dueDate: "2099-01-02",
    });

    expect(withDates.start).toBe("1/1");
    expect(withDates.due).toBe("1/2");
    expect(withDates.dueLate).toBe(false);

    const cleared = mergeBoardCardPatch(withDates, {
      startDate: undefined,
      dueDate: undefined,
    });
    expect(cleared.startDate).toBeUndefined();
    expect(cleared.dueDate).toBeUndefined();
    expect(cleared.start).toBeUndefined();
    expect(cleared.due).toBeUndefined();
    expect(cleared.dueEn).toBeUndefined();
    expect(cleared.dueLate).toBeUndefined();
  });

  test("M9d mergeBoardCardPatch does not rewrite date compatibility fields on unrelated edits", () => {
    const card = {
      ...makeLists()[0]!.cards[0]!,
      dueDate: "2099-01-02",
      due: "custom",
      dueEn: "custom-en",
      dueLate: true,
    };
    const next = mergeBoardCardPatch(card, { labels: ["feature"] });
    expect(next.labels).toEqual(["feature"]);
    expect(next.dueDate).toBe("2099-01-02");
    expect(next.due).toBe("custom");
    expect(next.dueEn).toBe("custom-en");
    expect(next.dueLate).toBe(true);
  });

  test("M9e mergeBoardCardPatch clears invalid ISO date edits instead of persisting malformed typed state", () => {
    const card = makeLists()[0]!.cards[0]!;
    const next = mergeBoardCardPatch(card, {
      dueDate: "2026-02-31",
    });
    expect(next.dueDate).toBeUndefined();
    expect(next.due).toBeUndefined();
    expect(next.dueEn).toBeUndefined();
    expect(next.dueLate).toBeUndefined();
  });

  test("M10 helpers do not mutate input arrays (input remains structurally equal)", () => {
    const lists = makeLists();
    const snapshot = JSON.stringify(lists);
    moveCardToList(lists, "c1", "A", "B");
    addCardToListById(lists, "A", "X");
    addCardToList(lists, 0, "X");
    addNewList(lists, "Y");
    setListColor(lists, "A", "red");
    renameList(lists, "A", "Renamed", PM_CTX);
    moveListByOffset(lists, "B", -1, PM_CTX);
    archiveList(lists, "A", PM_CTX);
    restoreList([{ ...lists[0]!, archived: true }, lists[1]!], "A", PM_CTX);
    deleteList([{ ...lists[0]!, cards: [] }, lists[1]!], "A", PM_CTX);
    renameCard(lists, "A", "c1", "Renamed");
    moveCardWithinListByOffset(lists, "A", "c2", -1);
    archiveCard(lists, "A", "c1");
    restoreCard([{ ...lists[0]!, cards: [{ ...lists[0]!.cards[0]!, archived: true }] }, lists[1]!], "A", "c1");
    deleteCard([{ ...lists[0]!, cards: [{ ...lists[0]!.cards[0]!, archived: true }] }, lists[1]!], "A", "c1");
    updateCardInList(lists, "A", "c1", { due: "Z" });
    expect(JSON.stringify(lists)).toBe(snapshot);
  });

  test("LC1 addCardToListById appends to the matching raw list by id", () => {
    const lists = makeLists();
    const next = addCardToListById(lists, "B", "By id");
    expect(next[0]?.cards.map((c) => c.id)).toEqual(["c1", "c2"]);
    expect(next[1]?.cards.at(-1)?.title.en).toBe("By id");
  });

  test("LC2 addCardToListById returns same reference for blank text or unknown id", () => {
    const lists = makeLists();
    expect(addCardToListById(lists, "B", "   ")).toBe(lists);
    expect(addCardToListById(lists, "missing", "By id")).toBe(lists);
  });

  test("LC3 canManageBoardList allows PM custom lists and keyed kanban defaults only in kanban context", () => {
    const custom = makeLists()[0]!;
    const keyed: BoardList = { ...custom, id: "K", key: "today" };
    expect(canManageBoardList(custom, PM_CTX)).toBe(true);
    expect(canManageBoardList(keyed, PM_CTX)).toBe(false);
    expect(canManageBoardList(keyed, KANBAN_CTX)).toBe(true);
  });

  test("LC4 renameList mirrors customName and preserves keyed kanban key", () => {
    const keyed: BoardList = {
      id: "K",
      key: "today",
      cards: [],
    };
    const next = renameList([keyed], "K", "Focus Lane", KANBAN_CTX);
    expect(next[0]?.key).toBe("today");
    expect(next[0]?.customName).toEqual({
      en: "Focus Lane",
      zh: "Focus Lane",
    });
  });

  test("LC5 renameList rejects blank, unknown, and disallowed keyed-list edits", () => {
    const keyed: BoardList = {
      id: "K",
      key: "today",
      cards: [],
    };
    const lists = [keyed];
    expect(renameList(lists, "K", "   ", KANBAN_CTX)).toBe(lists);
    expect(renameList(lists, "missing", "X", KANBAN_CTX)).toBe(lists);
    expect(renameList(lists, "K", "X", PM_CTX)).toBe(lists);
  });

  test("LC6 moveListByOffset evaluates neighbors in active visible order across archived gaps", () => {
    const lists: BoardList[] = [
      { id: "A", key: null, customName: { en: "A", zh: "A" }, cards: [] },
      { id: "X", key: null, customName: { en: "X", zh: "X" }, archived: true, cards: [] },
      { id: "B", key: null, customName: { en: "B", zh: "B" }, cards: [] },
    ];
    const next = moveListByOffset(lists, "B", -1, PM_CTX);
    expect(next.map((list) => list.id)).toEqual(["B", "X", "A"]);
  });

  test("LC7 moveListByOffset rejects out-of-bounds, archived target, and disallowed keyed target", () => {
    const lists: BoardList[] = [
      { id: "A", key: null, customName: { en: "A", zh: "A" }, cards: [] },
      { id: "B", key: null, customName: { en: "B", zh: "B" }, archived: true, cards: [] },
      { id: "K", key: "done", cards: [] },
    ];
    expect(moveListByOffset(lists, "A", -1, PM_CTX)).toBe(lists);
    expect(moveListByOffset(lists, "B", -1, PM_CTX)).toBe(lists);
    expect(moveListByOffset(lists, "K", -1, PM_CTX)).toBe(lists);
  });

  test("LC8 archiveList and restoreList preserve nested cards byte-for-byte", () => {
    const lists = makeLists();
    const cardSnapshot = JSON.stringify(lists[0]?.cards);
    const archived = archiveList(lists, "A", PM_CTX);
    expect(archived[0]?.archived).toBe(true);
    expect(JSON.stringify(archived[0]?.cards)).toBe(cardSnapshot);

    const restored = restoreList(archived, "A", PM_CTX);
    expect(restored[0]?.archived).toBeUndefined();
    expect(JSON.stringify(restored[0]?.cards)).toBe(cardSnapshot);
  });

  test("LC9 archiveList/restoreList no-op for unknown, repeated, or disallowed targets", () => {
    const keyed: BoardList = { id: "K", key: "today", cards: [] };
    const lists = [keyed];
    expect(archiveList(lists, "missing", KANBAN_CTX)).toBe(lists);
    expect(archiveList(lists, "K", PM_CTX)).toBe(lists);

    const archived = [{ ...keyed, archived: true }];
    expect(archiveList(archived, "K", KANBAN_CTX)).toBe(archived);
    expect(restoreList(lists, "K", KANBAN_CTX)).toBe(lists);
  });

  test("LC10 deleteList removes empty active lists and archived lists but rejects non-empty active lists", () => {
    const lists = makeLists();
    expect(deleteList(lists, "A", PM_CTX)).toBe(lists);

    const emptyActive: BoardList[] = [
      { id: "A", key: null, customName: { en: "A", zh: "A" }, cards: [] },
      lists[1]!,
    ];
    expect(deleteList(emptyActive, "A", PM_CTX).map((list) => list.id)).toEqual(["B"]);

    const archivedNonEmpty = [{ ...lists[0]!, archived: true }, lists[1]!];
    expect(deleteList(archivedNonEmpty, "A", PM_CTX).map((list) => list.id)).toEqual(["B"]);
  });

  test("LC11 active and archived selectors split lists without mutating source order", () => {
    const lists: BoardList[] = [
      { id: "A", key: null, customName: { en: "A", zh: "A" }, cards: [] },
      { id: "X", key: null, customName: { en: "X", zh: "X" }, archived: true, cards: [] },
      { id: "B", key: null, customName: { en: "B", zh: "B" }, cards: [] },
    ];
    expect(getActiveBoardLists(lists).map((list) => list.id)).toEqual(["A", "B"]);
    expect(getArchivedBoardLists(lists).map((list) => list.id)).toEqual(["X"]);
    expect(lists.map((list) => list.id)).toEqual(["A", "X", "B"]);
  });

  test("CC1 active card selectors hide archived cards without mutating source", () => {
    const lists: BoardList[] = [
      {
        id: "A",
        key: null,
        customName: { en: "A", zh: "A" },
        cards: [
          { id: "c1", title: { en: "one", zh: "一" } },
          { id: "c2", title: { en: "two", zh: "二" }, archived: true },
        ],
      },
    ];
    const snapshot = JSON.stringify(lists);

    expect(getActiveBoardCards(lists[0]!.cards).map((card) => card.id)).toEqual(["c1"]);
    const activeLists = getActiveBoardCardLists(lists);
    expect(activeLists[0]?.cards.map((card) => card.id)).toEqual(["c1"]);
    expect(JSON.stringify(lists)).toBe(snapshot);
  });

  test("CC2 active card list selector returns the same reference when no card is archived", () => {
    const lists = makeLists();
    expect(getActiveBoardCardLists(lists)).toBe(lists);
  });

  test("CC3 archived card selector returns list/card records", () => {
    const lists: BoardList[] = [
      {
        id: "A",
        key: null,
        customName: { en: "A", zh: "A" },
        cards: [
          { id: "c1", title: { en: "one", zh: "一" }, archived: true },
          { id: "c2", title: { en: "two", zh: "二" } },
        ],
      },
    ];
    const records = getArchivedBoardCards(lists);
    expect(records).toHaveLength(1);
    expect(records[0]?.listId).toBe("A");
    expect(records[0]?.card.id).toBe("c1");
    expect(records[0]?.list).toBe(lists[0]);
  });

  test("CC4 renameCard mirrors title and rejects blank/unknown/archived targets", () => {
    const lists = makeLists();
    const next = renameCard(lists, "A", "c1", "Updated");
    expect(next[0]?.cards[0]?.title).toEqual({ en: "Updated", zh: "Updated" });

    expect(renameCard(lists, "A", "c1", "   ")).toBe(lists);
    expect(renameCard(lists, "missing", "c1", "X")).toBe(lists);
    expect(renameCard(lists, "A", "missing", "X")).toBe(lists);

    const archived: BoardList[] = [
      { ...lists[0]!, cards: [{ ...lists[0]!.cards[0]!, archived: true }] },
    ];
    expect(renameCard(archived, "A", "c1", "X")).toBe(archived);
  });

  test("CC5 moveCardWithinListByOffset swaps by active order across archived gaps", () => {
    const lists: BoardList[] = [
      {
        id: "A",
        key: null,
        customName: { en: "A", zh: "A" },
        cards: [
          { id: "c1", title: { en: "one", zh: "一" } },
          { id: "cX", title: { en: "archived", zh: "归档" }, archived: true },
          { id: "c2", title: { en: "two", zh: "二" } },
        ],
      },
    ];
    const next = moveCardWithinListByOffset(lists, "A", "c2", -1);
    expect(next[0]?.cards.map((card) => card.id)).toEqual(["c2", "cX", "c1"]);
  });

  test("CC6 moveCardWithinListByOffset rejects bounds, archived targets, and unknown ids", () => {
    const lists: BoardList[] = [
      {
        id: "A",
        key: null,
        customName: { en: "A", zh: "A" },
        cards: [
          { id: "c1", title: { en: "one", zh: "一" } },
          { id: "c2", title: { en: "two", zh: "二" }, archived: true },
        ],
      },
    ];
    expect(moveCardWithinListByOffset(lists, "A", "c1", -1)).toBe(lists);
    expect(moveCardWithinListByOffset(lists, "A", "c2", -1)).toBe(lists);
    expect(moveCardWithinListByOffset(lists, "missing", "c1", 1)).toBe(lists);
    expect(moveCardWithinListByOffset(lists, "A", "missing", 1)).toBe(lists);
  });

  test("CC7 archiveCard and restoreCard preserve detail/date fields", () => {
    const lists: BoardList[] = [
      {
        id: "A",
        key: null,
        customName: { en: "A", zh: "A" },
        cards: [
          {
            id: "c1",
            title: { en: "one", zh: "一" },
            description: "Detail",
            checklistItems: [{ id: "i1", text: "Task", done: true }],
            attachments: [{ id: "a1", url: "https://example.com" }],
            activity: [{ id: "n1", kind: "note", body: "Note", createdAt: "2026-06-03T00:00:00.000Z" }],
            startDate: "2026-06-03",
            dueDate: "2026-06-04",
            location: { lat: 40, lng: -74, label: "NYC" },
            cover: "linear-gradient(red, blue)",
          },
        ],
      },
    ];
    const beforePayload = { ...lists[0]!.cards[0]! };
    const archived = archiveCard(lists, "A", "c1");
    expect(archived[0]?.cards[0]?.archived).toBe(true);
    expect({ ...archived[0]!.cards[0]!, archived: undefined }).toEqual({
      ...beforePayload,
      archived: undefined,
    });

    const restored = restoreCard(archived, "A", "c1");
    expect(restored[0]?.cards[0]?.archived).toBeUndefined();
    expect(restored[0]?.cards[0]?.description).toBe("Detail");
    expect(restored[0]?.cards[0]?.dueDate).toBe("2026-06-04");
  });

  test("CC8 archiveCard, restoreCard, and deleteCard no-op policy", () => {
    const lists = makeLists();
    expect(archiveCard(lists, "missing", "c1")).toBe(lists);
    expect(archiveCard(lists, "A", "missing")).toBe(lists);

    const archived = archiveCard(lists, "A", "c1");
    expect(archiveCard(archived, "A", "c1")).toBe(archived);
    expect(restoreCard(lists, "A", "c1")).toBe(lists);
    expect(deleteCard(lists, "A", "c1")).toBe(lists);

    const deleted = deleteCard(archived, "A", "c1");
    expect(deleted[0]?.cards.map((card) => card.id)).toEqual(["c2"]);
  });
});

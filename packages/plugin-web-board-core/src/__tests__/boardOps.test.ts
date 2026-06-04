import { describe, expect, test } from "vitest";
import {
  addCardToList,
  addNewList,
  mergeBoardCardPatch,
  moveCardToList,
  setListColor,
  updateCardInList,
} from "../internal/boardOps.js";
import type { BoardList } from "../types.js";

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
    addCardToList(lists, 0, "X");
    addNewList(lists, "Y");
    setListColor(lists, "A", "red");
    updateCardInList(lists, "A", "c1", { due: "Z" });
    expect(JSON.stringify(lists)).toBe(snapshot);
  });
});

/**
 * Tests for applyFilter / FilterState / EMPTY_FILTER
 * Gap-closure row #6 — FIL-1..FIL-12
 */
import { describe, expect, test } from "vitest";
import { applyFilter, EMPTY_FILTER } from "../internal/filter.js";
import type { FilterState } from "../internal/filter.js";
import type { BoardListData } from "@repo/plugin-web-board-core";

// ---- Fixtures -----------------------------------------------------------

function makeCard(
  id: string,
  overrides: Partial<{
    labels: string[];
    members: string[];
    due: string;
    dueLate: boolean;
  }> = {},
) {
  return {
    id,
    title: { en: `Card ${id}`, zh: `卡片 ${id}` },
    ...overrides,
  };
}

function makeLists(cards1: ReturnType<typeof makeCard>[], cards2: ReturnType<typeof makeCard>[] = []): BoardListData[] {
  return [
    { id: "l1", key: "todo", cards: cards1 as unknown as BoardListData["cards"] },
    { id: "l2", key: "done", cards: cards2 as unknown as BoardListData["cards"] },
  ];
}

const TODAY = new Date(2026, 4, 25); // 2026-05-25
const TODAY_MD = "5/25";
const TOMORROW_MD = "5/26";
const IN_5_DAYS_MD = "5/30";
const IN_8_DAYS_MD = "6/2";

// ---- Tests ------------------------------------------------------------------

describe("applyFilter", () => {
  test("FIL-1 EMPTY_FILTER returns lists with same card count", () => {
    const cards = [makeCard("c1"), makeCard("c2"), makeCard("c3")];
    const lists = makeLists(cards);
    const result = applyFilter(lists, EMPTY_FILTER, TODAY);
    const inCount = lists.flatMap((l) => l.cards).length;
    const outCount = result.flatMap((l) => l.cards).length;
    expect(outCount).toBe(inCount);
  });

  test("FIL-2 label-only filter — single label match", () => {
    const cards = [
      makeCard("c1", { labels: ["urgent"] }),
      makeCard("c2", { labels: ["low"] }),
      makeCard("c3"),
    ];
    const filter: FilterState = {
      labels: new Set(["urgent"]),
      members: new Set(),
      dueRange: "all",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    expect(result.flatMap((l) => l.cards).map((c) => c.id)).toEqual(["c1"]);
  });

  test("FIL-3 label-only filter — multiple labels (OR within facet)", () => {
    const cards = [
      makeCard("c1", { labels: ["urgent"] }),
      makeCard("c2", { labels: ["low"] }),
      makeCard("c3", { labels: ["medium"] }),
    ];
    const filter: FilterState = {
      labels: new Set(["urgent", "low"]),
      members: new Set(),
      dueRange: "all",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    const ids = result.flatMap((l) => l.cards).map((c) => c.id);
    expect(ids).toContain("c1");
    expect(ids).toContain("c2");
    expect(ids).not.toContain("c3");
  });

  test("FIL-4 member-only filter — single member", () => {
    const cards = [
      makeCard("c1", { members: ["alice"] }),
      makeCard("c2", { members: ["bob"] }),
    ];
    const filter: FilterState = {
      labels: new Set(),
      members: new Set(["alice"]),
      dueRange: "all",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    const ids = result.flatMap((l) => l.cards).map((c) => c.id);
    expect(ids).toEqual(["c1"]);
  });

  test("FIL-5 member + label combined (AND between facets)", () => {
    const cards = [
      makeCard("c1", { labels: ["urgent"], members: ["alice"] }),
      makeCard("c2", { labels: ["urgent"] }), // no member match
      makeCard("c3", { members: ["alice"] }), // no label match
    ];
    const filter: FilterState = {
      labels: new Set(["urgent"]),
      members: new Set(["alice"]),
      dueRange: "all",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    const ids = result.flatMap((l) => l.cards).map((c) => c.id);
    expect(ids).toEqual(["c1"]);
  });

  test("FIL-6 dueRange: 'overdue' — only cards with dueLate === true", () => {
    const cards = [
      makeCard("c1", { dueLate: true }),
      makeCard("c2", { dueLate: false }),
      makeCard("c3"),
    ];
    const filter: FilterState = {
      labels: new Set(),
      members: new Set(),
      dueRange: "overdue",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    const ids = result.flatMap((l) => l.cards).map((c) => c.id);
    expect(ids).toEqual(["c1"]);
  });

  test("FIL-7 dueRange: 'today' — matches 'Today' / '今天' / today's M/D", () => {
    const cards = [
      makeCard("c1", { due: "Today" }),
      makeCard("c2", { due: "今天" }),
      makeCard("c3", { due: TODAY_MD }),
      makeCard("c4", { due: TOMORROW_MD }),
    ];
    const filter: FilterState = {
      labels: new Set(),
      members: new Set(),
      dueRange: "today",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    const ids = result.flatMap((l) => l.cards).map((c) => c.id);
    expect(ids).toContain("c1");
    expect(ids).toContain("c2");
    expect(ids).toContain("c3");
    expect(ids).not.toContain("c4");
  });

  test("FIL-8 dueRange: 'week' — matches due parseable to [today, today+7)", () => {
    const cards = [
      makeCard("c1", { due: TODAY_MD }),        // day 0 — IN
      makeCard("c2", { due: TOMORROW_MD }),      // day 1 — IN
      makeCard("c3", { due: IN_5_DAYS_MD }),     // day 5 — IN
      makeCard("c4", { due: IN_8_DAYS_MD }),     // day 8 — OUT
      makeCard("c5"),                             // no due — OUT
    ];
    const filter: FilterState = {
      labels: new Set(),
      members: new Set(),
      dueRange: "week",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    const ids = result.flatMap((l) => l.cards).map((c) => c.id);
    expect(ids).toContain("c1");
    expect(ids).toContain("c2");
    expect(ids).toContain("c3");
    expect(ids).not.toContain("c4");
    expect(ids).not.toContain("c5");
  });

  test("FIL-9 empty lists input → returns empty lists; no crash", () => {
    const result = applyFilter([], EMPTY_FILTER, TODAY);
    expect(result).toHaveLength(0);
  });

  test("FIL-10 filter that excludes ALL cards → lists preserved (empty cards arrays)", () => {
    const cards = [makeCard("c1", { labels: ["low"] }), makeCard("c2", { labels: ["medium"] })];
    const filter: FilterState = {
      labels: new Set(["urgent"]),
      members: new Set(),
      dueRange: "all",
    };
    const result = applyFilter(makeLists(cards), filter, TODAY);
    expect(result).toHaveLength(2); // lists preserved
    result.forEach((l) => expect(l.cards).toHaveLength(0)); // but cards empty
  });

  test("FIL-11 applyFilter is pure — same input twice → identical output", () => {
    const cards = [makeCard("c1", { labels: ["urgent"] })];
    const filter: FilterState = {
      labels: new Set(["urgent"]),
      members: new Set(),
      dueRange: "all",
    };
    const lists = makeLists(cards);
    const r1 = applyFilter(lists, filter, TODAY);
    const r2 = applyFilter(lists, filter, TODAY);
    expect(r1).toEqual(r2);
    expect(r1).not.toBe(r2); // reference inequality (new array each time)
  });

  test("FIL-12 applyFilter is referentially transparent — input not mutated", () => {
    const cards = [makeCard("c1", { labels: ["urgent"] }), makeCard("c2")];
    const filter: FilterState = {
      labels: new Set(["urgent"]),
      members: new Set(),
      dueRange: "all",
    };
    const lists = makeLists(cards);
    const originalLength = lists[0]!.cards.length;
    applyFilter(lists, filter, TODAY);
    // Source cards array unchanged
    expect(lists[0]!.cards.length).toBe(originalLength);
  });
});

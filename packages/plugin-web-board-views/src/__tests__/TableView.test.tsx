/**
 * Component tests for TableView — TV1..TV13
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.4
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TableView } from "../TableView.js";
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";

function makeCard(overrides: Partial<BoardCardData> = {}): BoardCardData {
  return {
    id: "c1",
    title: { en: "Test Card", zh: "测试卡片" },
    labels: [],
    members: [],
    ...overrides,
  };
}

function makeList(overrides: Partial<BoardListData> = {}): BoardListData {
  return {
    id: "l1",
    key: "backlog",
    cards: [],
    color: null,
    ...overrides,
  };
}

describe("TableView", () => {
  test("TV1 renders one row per card across all lists", () => {
    const lists: BoardListData[] = [
      makeList({ id: "l1", cards: [makeCard({ id: "c1" }), makeCard({ id: "c2" })] }),
      makeList({ id: "l2", key: "done", cards: [makeCard({ id: "c3" })] }),
    ];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    const rows = screen.getAllByTestId("board-table-row");
    expect(rows).toHaveLength(3);
  });

  test("TV2 clicking title cell calls onOpenCard(card, listId)", () => {
    const onOpenCard = vi.fn();
    const card = makeCard({ id: "cx" });
    const lists = [makeList({ id: "lx", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} onOpenCard={onOpenCard} />);
    fireEvent.click(screen.getByTestId("td-title"));
    expect(onOpenCard).toHaveBeenCalledOnce();
    expect(onOpenCard).toHaveBeenCalledWith(card, "lx");
  });

  test("TV3 list pill has inline style using CSS var when list.color is set", () => {
    const lists = [makeList({ id: "l1", color: "green", cards: [makeCard()] })];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    const pill = screen.getByTestId("td-list-pill");
    expect(pill.getAttribute("style")).toContain("var(--board-list-color-green)");
  });

  test("TV4 labels cell shows empty hint when card has no labels", () => {
    const lists = [makeList({ cards: [makeCard({ labels: [] })] })];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    expect(screen.getByTestId("td-labels-empty")).toBeInTheDocument();
  });

  test("TV5 labels popover opens on click and toggleLabel calls updateCard", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1", labels: [] });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    // Open labels popover
    fireEvent.click(screen.getByTestId("td-labels"));
    const toggleBtn = screen.getByTestId("label-toggle-pm-forms");
    fireEvent.click(toggleBtn);
    expect(updateCard).toHaveBeenCalledWith("l1", "c1", { labels: ["pm-forms"] });
  });

  test("TV6 members popover opens and toggleMember calls updateCard", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1", members: [] });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    fireEvent.click(screen.getByTestId("td-members"));
    const toggleBtn = screen.getByTestId("member-toggle-u1");
    fireEvent.click(toggleBtn);
    expect(updateCard).toHaveBeenCalledWith("l1", "c1", { members: ["u1"] });
  });

  test("TV7 Due Today shortcut calls updateCard with ISO dueDate", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1" });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    fireEvent.click(screen.getByTestId("td-due"));
    fireEvent.click(screen.getByTestId("due-shortcut-today"));
    const patch = updateCard.mock.calls[0]?.[2] as Partial<BoardCardData>;
    expect(patch.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(patch.due).toBeUndefined();
    expect(patch.dueLate).toBeUndefined();
  });

  test("TV8 Due Tomorrow shortcut calls updateCard with ISO dueDate", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1" });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    fireEvent.click(screen.getByTestId("td-due"));
    fireEvent.click(screen.getByTestId("due-shortcut-tomorrow"));
    expect(updateCard).toHaveBeenCalledOnce();
    const patch = updateCard.mock.calls[0]?.[2] as Partial<BoardCardData>;
    expect(patch.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(patch.due).toBeUndefined();
  });

  test("TV9 Due Next Mon shortcut calls updateCard with ISO dueDate", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1" });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    fireEvent.click(screen.getByTestId("td-due"));
    fireEvent.click(screen.getByTestId("due-shortcut-next-mon"));
    expect(updateCard).toHaveBeenCalledOnce();
    const patch = updateCard.mock.calls[0]?.[2] as Partial<BoardCardData>;
    expect(patch.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(patch.due).toBeUndefined();
  });

  test("TV10 Progress column renders '3/5' text + bar when checklist={done:3,total:5}", () => {
    const card = makeCard({ checklist: { done: 3, total: 5 } });
    const lists = [makeList({ cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    expect(screen.getByTestId("td-cl-text").textContent).toBe("3/5");
    const bar = screen.getByTestId("td-cl-bar-fill");
    expect(bar.getAttribute("style")).toContain("60%");
  });

  test("TV11 Progress column shows — when checklist is undefined", () => {
    const card = makeCard({ checklist: undefined });
    const lists = [makeList({ cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    expect(screen.queryByTestId("td-cl-text")).not.toBeInTheDocument();
    expect(screen.getByTestId("td-checklist").textContent).toContain("—");
  });

  test("TV12 Progress with total:0 renders bar at 0% (no div-by-zero)", () => {
    const card = makeCard({ checklist: { done: 0, total: 0 } });
    const lists = [makeList({ cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    const bar = screen.getByTestId("td-cl-bar-fill");
    expect(bar.getAttribute("style")).toContain("0%");
  });

  test("TV13 bilingual: zh lang flips column headers", () => {
    const lists = [makeList({ cards: [makeCard()] })];
    const { rerender } = render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    expect(screen.getAllByRole("columnheader")[0]!.textContent).toBe("Card");
    rerender(<TableView lists={lists} lang="zh" updateCard={() => {}} />);
    expect(screen.getAllByRole("columnheader")[0]!.textContent).toBe("卡片");
  });
});

describe("TableView — priority column (W2)", () => {
  test("TV-P1 renders priority chip when card.priority set, hint otherwise", () => {
    const lists = [
      makeList({
        id: "l1",
        cards: [makeCard({ id: "c1", priority: "high" }), makeCard({ id: "c2" })],
      }),
    ];
    render(<TableView lists={lists} lang="en" updateCard={() => {}} />);
    const chips = screen.getAllByTestId("td-priority-value");
    expect(chips).toHaveLength(1);
    expect(chips[0]!.textContent).toContain("High");
    expect(chips[0]!.getAttribute("data-priority")).toBe("high");
  });

  test("TV-P2 popover sets priority via updateCard and Clear removes it", () => {
    const updateCard = vi.fn();
    const lists = [makeList({ id: "lx", cards: [makeCard({ id: "cx", priority: "low" })] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);

    fireEvent.click(screen.getByTestId("td-priority"));
    expect(screen.getByTestId("priority-popover")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("priority-set-urgent"));
    expect(updateCard).toHaveBeenCalledWith("lx", "cx", { priority: "urgent" });

    fireEvent.click(screen.getByTestId("td-priority"));
    fireEvent.click(screen.getByTestId("priority-clear"));
    expect(updateCard).toHaveBeenCalledWith("lx", "cx", { priority: undefined });
  });
});

describe("TableView — column sorting (W3)", () => {
  const sortLists = [
    makeList({
      id: "l1",
      cards: [
        makeCard({ id: "c-none", title: { en: "Bravo", zh: "B" } }),
        makeCard({ id: "c-low", title: { en: "Alpha", zh: "A" }, priority: "low", dueDate: "2026-06-20" }),
        makeCard({ id: "c-urgent", title: { en: "Charlie", zh: "C" }, priority: "urgent", dueDate: "2026-06-10" }),
      ],
    }),
  ];
  const rowIds = () =>
    screen.getAllByTestId("board-table-row").map((row) =>
      row.querySelector(".td-title span:last-child")!.textContent,
    );

  test("TV-S1 priority sort: first click urgent-first, missing priority last", () => {
    render(<TableView lists={sortLists} lang="en" updateCard={() => {}} />);
    fireEvent.click(screen.getByTestId("th-sort-priority"));
    expect(rowIds()).toEqual(["Charlie", "Alpha", "Bravo"]);
    // second click flips: low first, missing still last
    fireEvent.click(screen.getByTestId("th-sort-priority"));
    expect(rowIds()).toEqual(["Alpha", "Charlie", "Bravo"]);
    // third click resets to natural order
    fireEvent.click(screen.getByTestId("th-sort-priority"));
    expect(rowIds()).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  test("TV-S2 due sort ascending puts earliest first and missing-due last", () => {
    render(<TableView lists={sortLists} lang="en" updateCard={() => {}} />);
    fireEvent.click(screen.getByTestId("th-sort-due"));
    expect(rowIds()).toEqual(["Charlie", "Alpha", "Bravo"]);
  });

  test("TV-S3 title sort ascending is locale-alphabetical", () => {
    render(<TableView lists={sortLists} lang="en" updateCard={() => {}} />);
    fireEvent.click(screen.getByTestId("th-sort-title"));
    expect(rowIds()).toEqual(["Alpha", "Bravo", "Charlie"]);
  });
});

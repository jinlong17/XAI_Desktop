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

  test("TV7 Due Today shortcut calls updateCard with {due:'Today',dueEn:undefined,dueLate:false}", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1" });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    fireEvent.click(screen.getByTestId("td-due"));
    fireEvent.click(screen.getByTestId("due-shortcut-today"));
    expect(updateCard).toHaveBeenCalledWith("l1", "c1", {
      due: "Today",
      dueEn: undefined,
      dueLate: false,
    });
  });

  test("TV8 Due Tomorrow shortcut calls updateCard with {due:M/D,...}", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1" });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    fireEvent.click(screen.getByTestId("td-due"));
    fireEvent.click(screen.getByTestId("due-shortcut-tomorrow"));
    expect(updateCard).toHaveBeenCalledOnce();
    const patch = updateCard.mock.calls[0]?.[2] as { due: string };
    // Must match M/D format
    expect(patch.due).toMatch(/^\d+\/\d+$/);
  });

  test("TV9 Due Next Mon shortcut calls updateCard with {due:M/D,...}", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "c1" });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<TableView lists={lists} lang="en" updateCard={updateCard} />);
    fireEvent.click(screen.getByTestId("td-due"));
    fireEvent.click(screen.getByTestId("due-shortcut-next-mon"));
    expect(updateCard).toHaveBeenCalledOnce();
    const patch = updateCard.mock.calls[0]?.[2] as { due: string };
    expect(patch.due).toMatch(/^\d+\/\d+$/);
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

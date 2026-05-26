/**
 * FilterPopover tests — FP-1..FP-10
 * Gap-closure row #6
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterPopover } from "../FilterPopover.js";
import { EMPTY_FILTER } from "@repo/plugin-web-board-views";
import type { FilterState } from "@repo/plugin-web-board-views";
import type { BoardListData } from "@repo/plugin-web-board-core";

// ---- Fixtures ---------------------------------------------------------------

function makeCard(id: string, labels: string[] = [], members: string[] = []) {
  return {
    id,
    title: { en: `Card ${id}`, zh: `卡片 ${id}` },
    labels,
    members,
  };
}

const LISTS: BoardListData[] = [
  {
    id: "l1",
    key: "todo",
    cards: [
      makeCard("c1", ["urgent", "high"], ["alice"]),
      makeCard("c2", ["low"], ["bob"]),
    ] as unknown as BoardListData["cards"],
  },
];

const EMPTY_LISTS: BoardListData[] = [];

// ---- Helper -----------------------------------------------------------------

function renderPopover(
  opts: {
    lists?: BoardListData[];
    filter?: FilterState;
    lang?: "en" | "zh";
    onChange?: (f: FilterState) => void;
    onClose?: () => void;
  } = {},
) {
  const { lists = LISTS, filter = EMPTY_FILTER, lang = "en", onChange = vi.fn(), onClose = vi.fn() } = opts;
  render(
    <FilterPopover
      lists={lists}
      filter={filter}
      onChange={onChange}
      onClose={onClose}
      lang={lang}
    />,
  );
  return { onChange, onClose };
}

// ---- Tests ------------------------------------------------------------------

describe("FilterPopover", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("FP-1 renders three facet sections", () => {
    renderPopover();
    expect(screen.getByTestId("fp-labels-section")).toBeInTheDocument();
    expect(screen.getByTestId("fp-members-section")).toBeInTheDocument();
    expect(screen.getByTestId("fp-due-section")).toBeInTheDocument();
  });

  test("FP-2 labels facet renders deduped label list from lists", () => {
    renderPopover();
    // urgent, high, low — 3 unique labels from LISTS
    const urgentCb = screen.getByTestId("fp-label-urgent");
    const highCb = screen.getByTestId("fp-label-high");
    const lowCb = screen.getByTestId("fp-label-low");
    expect(urgentCb).toBeInTheDocument();
    expect(highCb).toBeInTheDocument();
    expect(lowCb).toBeInTheDocument();
  });

  test("FP-3 click label checkbox calls onChange with label toggled", () => {
    const onChange = vi.fn();
    renderPopover({ onChange });
    fireEvent.click(screen.getByTestId("fp-label-urgent"));
    expect(onChange).toHaveBeenCalledOnce();
    const newFilter: FilterState = onChange.mock.calls[0]![0];
    expect(newFilter.labels.has("urgent")).toBe(true);
  });

  test("FP-4 click member checkbox calls onChange", () => {
    const onChange = vi.fn();
    renderPopover({ onChange });
    fireEvent.click(screen.getByTestId("fp-member-alice"));
    expect(onChange).toHaveBeenCalledOnce();
    const newFilter: FilterState = onChange.mock.calls[0]![0];
    expect(newFilter.members.has("alice")).toBe(true);
  });

  test("FP-5 set due range to 'overdue' calls onChange", () => {
    const onChange = vi.fn();
    renderPopover({ onChange });
    fireEvent.click(screen.getByTestId("fp-due-overdue"));
    expect(onChange).toHaveBeenCalledOnce();
    const newFilter: FilterState = onChange.mock.calls[0]![0];
    expect(newFilter.dueRange).toBe("overdue");
  });

  test("FP-6 Clear button calls onChange(EMPTY_FILTER)", () => {
    const onChange = vi.fn();
    const activeFilter: FilterState = {
      labels: new Set(["urgent"]),
      members: new Set(),
      dueRange: "all",
    };
    renderPopover({ onChange, filter: activeFilter });
    fireEvent.click(screen.getByTestId("fp-clear-btn"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0]![0]).toBe(EMPTY_FILTER); // reference equality
  });

  test("FP-7 ESC fires onClose", () => {
    const onClose = vi.fn();
    renderPopover({ onClose });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("FP-8 outside-click fires onClose", () => {
    const onClose = vi.fn();
    renderPopover({ onClose });
    // Click outside the popover
    fireEvent.mouseDown(document.body);
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("FP-9 bilingual zh — facet headings switch", () => {
    renderPopover({ lang: "zh" });
    expect(screen.getByText("标签")).toBeInTheDocument();
    expect(screen.getByText("成员")).toBeInTheDocument();
    expect(screen.getByText("截止日期")).toBeInTheDocument();
  });

  test("FP-10 empty lists → facet sections render empty hint; no crash", () => {
    renderPopover({ lists: EMPTY_LISTS });
    expect(screen.getByTestId("fp-labels-empty")).toBeInTheDocument();
    expect(screen.getByTestId("fp-members-empty")).toBeInTheDocument();
    // Due range facet still renders
    expect(screen.getByTestId("fp-due-section")).toBeInTheDocument();
  });
});

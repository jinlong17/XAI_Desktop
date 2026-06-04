/**
 * Component tests for BoardCalendarView — BC1..BC12
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.5
 */

import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BoardCalendarView } from "../BoardCalendarView.js";
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";
import { isoDateFromOffset } from "@repo/plugin-web-board-core";
import { makeDataTransferMock } from "./_helpers/dataTransfer.js";

function makeCard(overrides: Partial<BoardCardData> = {}): BoardCardData {
  return {
    id: "c1",
    title: { en: "Test Card", zh: "测试卡片" },
    labels: [],
    ...overrides,
  };
}

function makeList(overrides: Partial<BoardListData> = {}): BoardListData {
  return {
    id: "l1",
    key: "backlog",
    cards: [],
    ...overrides,
  };
}

// Determine current month/day for deterministic tests
const TODAY = new Date();
const TODAY_DATE = TODAY.getDate();
const TOMORROW = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 1);
const TOMORROW_DATE = TOMORROW.getDate();
const TOMORROW_DUE_DATE = isoDateFromOffset(1, TODAY);

describe("BoardCalendarView", () => {
  test("BC1 renders 7 weekday headers (Mon–Sun)", () => {
    render(<BoardCalendarView lists={[]} lang="en" updateCard={() => {}} />);
    const headers = screen.getAllByTestId("cal-weekday");
    expect(headers).toHaveLength(7);
    expect(headers[0]!.textContent).toBe("Mon");
    expect(headers[6]!.textContent).toBe("Sun");
  });

  test("BC2 renders correct number of day cells for the current month", () => {
    render(<BoardCalendarView lists={[]} lang="en" updateCard={() => {}} />);
    const daysInMonth = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate();
    // At least that many cells with data-day attribute
    const grid = screen.getByTestId("cal-grid");
    const cells = grid.querySelectorAll("[data-testid^='cal-cell-']");
    expect(cells.length).toBe(daysInMonth);
  });

  test("BC3 cards with dueDate === tomorrow appear in the correct day cell", () => {
    const card = makeCard({ id: "c1", dueDate: TOMORROW_DUE_DATE });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<BoardCalendarView lists={lists} lang="en" updateCard={() => {}} />);
    const cell = screen.getByTestId(`cal-cell-${TOMORROW_DATE}`);
    expect(cell.textContent).toContain("Test Card");
  });

  test("BC4 recoverable legacy due === 'Today' appears in today's cell", () => {
    const card = makeCard({ id: "c1", due: "Today" });
    const lists = [makeList({ id: "l1", cards: [card] })];
    render(<BoardCalendarView lists={lists} lang="en" updateCard={() => {}} />);
    const cell = screen.getByTestId(`cal-cell-${TODAY_DATE}`);
    expect(cell.textContent).toContain("Test Card");
  });

  test("BC5 cell with >3 cards shows +N more indicator", () => {
    const cards = Array.from({ length: 5 }, (_, i) =>
      makeCard({ id: `c${i}`, due: "Today" }),
    );
    const lists = [makeList({ id: "l1", cards })];
    render(<BoardCalendarView lists={lists} lang="en" updateCard={() => {}} />);
    expect(screen.getByTestId("cal-more").textContent).toBe("+2");
  });

  test("BC6 dragstart on a card sets dataTransfer to JSON {cardId, listId}", () => {
    const card = makeCard({ id: "cx", dueDate: isoDateFromOffset(0, TODAY) });
    const lists = [makeList({ id: "lx", cards: [card] })];
    render(<BoardCalendarView lists={lists} lang="en" updateCard={() => {}} />);
    const cardEl = screen.getByTestId("cal-card");
    const dt = makeDataTransferMock();
    fireEvent.dragStart(cardEl, { dataTransfer: dt });
    const payload = JSON.parse(dt.getData("text/plain")) as { cardId: string; listId: string };
    expect(payload.cardId).toBe("cx");
    expect(payload.listId).toBe("lx");
  });

  test("BC7 dragover on a cell calls preventDefault (DnD spec compliance)", () => {
    render(<BoardCalendarView lists={[]} lang="en" updateCard={() => {}} />);
    const cell = screen.getByTestId(`cal-cell-${TODAY_DATE}`);
    const event = new Event("dragover", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: makeDataTransferMock() });
    cell.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  test("BC8 drop on a day calls updateCard with correct ISO dueDate patch", () => {
    const updateCard = vi.fn();
    const card = makeCard({ id: "cx", due: "Today" });
    const lists = [makeList({ id: "lx", cards: [card] })];
    render(<BoardCalendarView lists={lists} lang="en" updateCard={updateCard} />);

    const targetDay = TOMORROW_DATE <= 28 ? TOMORROW_DATE : TODAY_DATE - 1;
    const cell = screen.queryByTestId(`cal-cell-${targetDay}`);
    if (!cell) return; // edge case: can't find cell

    const dt = makeDataTransferMock();
    dt.setData("text/plain", JSON.stringify({ cardId: "cx", listId: "lx" }));
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", { value: dt });
    cell.dispatchEvent(dropEvent);

    expect(updateCard).toHaveBeenCalledOnce();
    const [lId, cId, patch] = updateCard.mock.calls[0] as [string, string, Partial<BoardCardData>];
    expect(lId).toBe("lx");
    expect(cId).toBe("cx");
    expect(patch.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(patch.due).toBeUndefined();
    expect(patch.dueLate).toBeUndefined();
  });

  test("BC9 drop with malformed dataTransfer payload is a no-op", () => {
    const updateCard = vi.fn();
    render(<BoardCalendarView lists={[makeList({ cards: [makeCard({ due: "Today" })] })]} lang="en" updateCard={updateCard} />);
    const cell = screen.getByTestId(`cal-cell-${TODAY_DATE}`);
    const dt = makeDataTransferMock();
    dt.setData("text/plain", "NOT JSON");
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", { value: dt });
    cell.dispatchEvent(dropEvent);
    expect(updateCard).not.toHaveBeenCalled();
  });

  test("BC10 drop on empty cell (no day) is a no-op", () => {
    const updateCard = vi.fn();
    render(<BoardCalendarView lists={[]} lang="en" updateCard={updateCard} />);
    const grid = screen.getByTestId("cal-grid");
    // Find a padding cell (no data-day attribute)
    const emptyPadding = Array.from(grid.children).find(
      (c) => !(c as HTMLElement).dataset.testid,
    ) as HTMLElement | undefined;
    if (!emptyPadding) return; // no padding cells in this month
    const dt = makeDataTransferMock();
    dt.setData("text/plain", JSON.stringify({ cardId: "c1", listId: "l1" }));
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, "dataTransfer", { value: dt });
    emptyPadding.dispatchEvent(dropEvent);
    expect(updateCard).not.toHaveBeenCalled();
  });

  test("BC11 bilingual: weekday names flip on zh", () => {
    const { rerender } = render(
      <BoardCalendarView lists={[]} lang="en" updateCard={() => {}} />,
    );
    expect(screen.getAllByTestId("cal-weekday")[0]!.textContent).toBe("Mon");
    rerender(<BoardCalendarView lists={[]} lang="zh" updateCard={() => {}} />);
    expect(screen.getAllByTestId("cal-weekday")[0]!.textContent).toBe("周一");
  });

  test("BC12 no cards with due dates shows empty hint", () => {
    const card = makeCard({ due: undefined });
    render(
      <BoardCalendarView
        lists={[makeList({ cards: [card] })]}
        lang="en"
        updateCard={() => {}}
      />,
    );
    expect(screen.getByTestId("cal-empty")).toBeInTheDocument();
  });
});

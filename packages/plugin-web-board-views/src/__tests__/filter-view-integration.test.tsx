/**
 * Filter integration tests — FVI-Board / FVI-Table / FVI-Calendar / FVI-Dashboard / FVI-Timeline / FVI-Map
 * Gap-closure row #6 §6.5
 *
 * Verifies that applyFilter applied at the view boundary correctly narrows
 * cards visible in each of the 6 board views (HC1 consistency).
 */
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { applyFilter } from "../internal/filter.js";
import type { FilterState } from "../internal/filter.js";
import { TableView } from "../TableView.js";
import { BoardCalendarView } from "../BoardCalendarView.js";
import { BoardDashboardView } from "../BoardDashboardView.js";
import { TimelineView } from "../TimelineView.js";
import { MapView } from "../MapView.js";
import type { BoardListData } from "@repo/plugin-web-board-core";

// ---- Fixtures ---------------------------------------------------------------

const TODAY = new Date(2026, 4, 25);

function makeCard(id: string, labels: string[] = [], due?: string) {
  return {
    id,
    title: { en: `Card ${id}`, zh: `卡片 ${id}` },
    labels,
    due,
  };
}

const LISTS: BoardListData[] = [
  {
    id: "l1",
    key: "todo",
    cards: [
      makeCard("c1", ["urgent"], "5/25"),
      makeCard("c2", ["low"], "5/26"),
      makeCard("c3", ["urgent"], "5/27"),
    ] as unknown as BoardListData["cards"],
  },
  {
    id: "l2",
    key: "done",
    cards: [
      makeCard("c4", ["urgent"]),
      makeCard("c5", ["low"]),
    ] as unknown as BoardListData["cards"],
  },
];

const URGENT_FILTER: FilterState = {
  labels: new Set(["urgent"]),
  members: new Set(),
  dueRange: "all",
};

// "urgent" cards: c1, c3 (l1) + c4 (l2) = 3 total
const URGENT_COUNT = 3;

// ---- Tests ------------------------------------------------------------------

describe("Filter view integration (HC1 consistency)", () => {
  test("FVI-Board: applyFilter narrows to urgent card count", () => {
    const filtered = applyFilter(LISTS, URGENT_FILTER, TODAY);
    const count = filtered.flatMap((l) => l.cards).length;
    expect(count).toBe(URGENT_COUNT);
  });

  test("FVI-Table: TableView receives filtered lists — row count matches urgent cards", () => {
    const filtered = applyFilter(LISTS, URGENT_FILTER, TODAY);
    const noop = vi.fn();
    render(<TableView lists={filtered} lang="en" updateCard={noop} />);
    // board-table-row data-testid is used per TableView.tsx line 97
    const rows = screen.getAllByTestId("board-table-row");
    expect(rows.length).toBe(URGENT_COUNT);
  });

  test("FVI-Calendar: BoardCalendarView receives filtered lists — only urgent card titles appear", () => {
    const filtered = applyFilter(LISTS, URGENT_FILTER, TODAY);
    const noop = vi.fn();
    render(<BoardCalendarView lists={filtered} lang="en" updateCard={noop} />);
    // Cards without labels (low priority) should NOT appear in the calendar
    // c2 has label "low" → should be filtered out
    // We can check that "Card c2" is NOT present
    expect(screen.queryByText("Card c2")).not.toBeInTheDocument();
    expect(screen.queryByText("Card c5")).not.toBeInTheDocument();
  });

  test("FVI-Dashboard: BoardDashboardView receives filtered lists — total KPI reflects urgent count", () => {
    const filtered = applyFilter(LISTS, URGENT_FILTER, TODAY);
    render(<BoardDashboardView lists={filtered} lang="en" />);
    // bd-kpi-val contains the count per BoardDashboardView's BdKpi component
    const kpiVals = screen.getAllByTestId("bd-kpi-val");
    // First KPI is "Total cards"
    expect(kpiVals[0]?.textContent).toBe(String(URGENT_COUNT));
  });

  test("FVI-Timeline: TimelineView receives filtered lists — only urgent card bars rendered", () => {
    const filtered = applyFilter(LISTS, URGENT_FILTER, TODAY);
    const noop = vi.fn();
    render(<TimelineView lists={filtered} lang="en" updateCard={noop} />);
    // Only cards with a parseable due are rendered as bars
    // urgent cards with due: c1 (5/25, today=day 0) and c3 (5/27)
    // c4 (urgent, no due) doesn't render as a bar
    // c2, c5 (low) are filtered out
    // data-testid="tl-bar" per TimelineView.tsx line 229
    const bars = screen.getAllByTestId("tl-bar");
    // bars for c1 + c3 (both have a due date within the 30-day window)
    expect(bars.length).toBe(2);
  });

  test("FVI-Map: MapView receives filtered lists — prop accepted, no crash (HC1 consistency)", () => {
    const filtered = applyFilter(LISTS, URGENT_FILTER, TODAY);
    // MapView still renders the SVG placeholder in P2; the lists prop is accepted
    render(<MapView lists={filtered} lang="en" />);
    // The map renders without crash
    expect(screen.getByTestId("board-map")).toBeInTheDocument();
  });
});

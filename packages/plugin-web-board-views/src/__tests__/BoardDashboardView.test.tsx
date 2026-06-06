/**
 * Component tests for BoardDashboardView — BD1..BD10
 *
 * Test plan: packages/xai-web-board-views/docs/test.md §2.6
 */

import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { BoardDashboardView } from "../BoardDashboardView.js";
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";
import { isoDateFromOffset } from "@repo/plugin-web-board-core";

function makeCard(overrides: Partial<BoardCardData> = {}): BoardCardData {
  return {
    id: "c" + Math.random().toString(36).slice(2),
    title: { en: "Card", zh: "卡片" },
    labels: [],
    ...overrides,
  };
}

function makeList(overrides: Partial<BoardListData> = {}): BoardListData {
  return {
    id: "l" + Math.random().toString(36).slice(2),
    key: null,
    customName: { en: "List", zh: "列" },
    cards: [],
    ...overrides,
  };
}

describe("BoardDashboardView", () => {
  test("BD1 KPI 'Total cards' renders total count", () => {
    const lists = [
      makeList({ cards: [makeCard(), makeCard()] }),
      makeList({ cards: [makeCard()] }),
    ];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const vals = screen.getAllByTestId("bd-kpi-val");
    expect(vals[0]!.textContent).toBe("3");
  });

  test("BD2 KPI 'Due today' counts typed dueDate and recoverable legacy today", () => {
    const lists = [
      makeList({
        cards: [
          makeCard({ dueDate: isoDateFromOffset(0, new Date()) }),
          makeCard({ due: "今天" }),
          makeCard({ dueDate: isoDateFromOffset(1, new Date()) }),
        ],
      }),
    ];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const vals = screen.getAllByTestId("bd-kpi-val");
    expect(vals[1]!.textContent).toBe("2");
  });

  test("BD3 KPI 'Overdue' counts cards with typed dueDate before today", () => {
    const lists = [
      makeList({
        cards: [
          makeCard({ dueDate: "2000-01-01" }),
          makeCard({ dueDate: "2000-01-02" }),
          makeCard({ dueLate: true }),
        ],
      }),
    ];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const vals = screen.getAllByTestId("bd-kpi-val");
    expect(vals[2]!.textContent).toBe("2");
  });

  test("BD4 KPI 'Lists' renders lists.length", () => {
    const lists = [makeList(), makeList(), makeList()];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const vals = screen.getAllByTestId("bd-kpi-val");
    expect(vals[3]!.textContent).toBe("3");
  });

  test("BD5 per-list bar chart renders one row per list", () => {
    const lists = [makeList({ cards: [makeCard()] }), makeList({ cards: [makeCard(), makeCard()] })];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const rows = screen.getAllByTestId("bd-bar-row-list");
    expect(rows).toHaveLength(2);
  });

  test("BD6 per-list bar uses CSS var for list.color", () => {
    const lists = [makeList({ color: "red", cards: [makeCard()] })];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const fill = screen.getByTestId("bd-bar-fill-list");
    expect(fill.getAttribute("style")).toContain("var(--board-list-color-red)");
  });

  test("BD7 per-label bar chart renders only labels with count > 0", () => {
    // Only give one card a label from PM_LABELS
    const lists = [makeList({ cards: [makeCard({ labels: ["pm-forms"] })] })];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const rows = screen.getAllByTestId("bd-bar-row-label");
    expect(rows).toHaveLength(1);
  });

  test("BD8 per-label bar width is proportional to count/maxLabelCount*100", () => {
    const lists = [
      makeList({
        cards: [
          makeCard({ labels: ["pm-forms"] }),
          makeCard({ labels: ["pm-forms"] }),
          makeCard({ labels: ["pm-accounts"] }),
        ],
      }),
    ];
    render(<BoardDashboardView lists={lists} lang="en" />);
    const fills = screen.getAllByTestId("bd-bar-fill-label");
    // pm-forms count=2, pm-accounts count=1, maxLabelCount=2
    // pm-forms bar should be 100%, pm-accounts 50%
    const styles = fills.map((f) => f.getAttribute("style") ?? "");
    expect(styles.some((s) => s.includes("100%"))).toBe(true);
    expect(styles.some((s) => s.includes("50%"))).toBe(true);
  });

  test("BD9 empty lists: KPIs show 0/0/0/0 + bar charts render empty containers", () => {
    expect(() => render(<BoardDashboardView lists={[]} lang="en" />)).not.toThrow();
    const vals = screen.getAllByTestId("bd-kpi-val");
    vals.forEach((v) => expect(v.textContent).toBe("0"));
  });

  test("BD10 bilingual: KPI labels flip on zh", () => {
    const { rerender } = render(<BoardDashboardView lists={[]} lang="en" />);
    const labels = screen.getAllByTestId("bd-kpi-label");
    expect(labels[0]!.textContent).toBe("Total cards");
    rerender(<BoardDashboardView lists={[]} lang="zh" />);
    const labelsZh = screen.getAllByTestId("bd-kpi-label");
    expect(labelsZh[0]!.textContent).toBe("卡片总数");
  });
});

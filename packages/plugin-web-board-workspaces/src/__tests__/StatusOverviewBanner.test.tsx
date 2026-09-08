/**
 * SOB1..SOB10 — StatusOverviewBanner component.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { BoardListData } from "@repo/plugin-web-board-core";
import { StatusOverviewBanner } from "../StatusOverviewBanner.js";

const mkList = (over: Partial<BoardListData>): BoardListData => ({
  id: "l1",
  key: null,
  customName: { en: "Stage", zh: "阶段" },
  color: null,
  cards: [],
  ...over,
});

const mkCard = (id: string) => ({ id, title: { en: id, zh: id } });

describe("StatusOverviewBanner (SOB1..SOB10)", () => {
  it("SOB1: renders ring SVG + legend + center pct", () => {
    const lists = [mkList({ id: "a", cards: [mkCard("c1")] })];
    render(<StatusOverviewBanner lists={lists} lang="en" />);
    expect(screen.getByTestId("status-overview")).toBeInTheDocument();
    expect(screen.getByTestId("so-ring-svg")).toBeInTheDocument();
    expect(screen.getByTestId("so-ring-pct")).toBeInTheDocument();
  });

  it("SOB2: total === 0 → donePct === 0%", () => {
    render(<StatusOverviewBanner lists={[]} lang="en" />);
    expect(screen.getByTestId("so-ring-pct").textContent).toBe("0%");
  });

  it("SOB3: PM-style 'Done' list at 100% → 100%", () => {
    const lists = [
      mkList({
        id: "d",
        customName: { en: "Done", zh: "已完成" },
        cards: [mkCard("c1"), mkCard("c2")],
      }),
    ];
    render(<StatusOverviewBanner lists={lists} lang="en" />);
    expect(screen.getByTestId("so-ring-pct").textContent).toBe("100%");
  });

  it("SOB4: 'Done' label en/zh", () => {
    const { unmount } = render(<StatusOverviewBanner lists={[]} lang="en" />);
    expect(screen.getByText("Done")).toBeInTheDocument();
    unmount();
    render(<StatusOverviewBanner lists={[]} lang="zh" />);
    expect(screen.getByText("已完成")).toBeInTheDocument();
  });

  it("SOB5: legend renders 1 row per non-empty list + 'Total' row", () => {
    const lists = [
      mkList({ id: "a", customName: { en: "Todo", zh: "待办" }, cards: [mkCard("c1")] }),
      mkList({ id: "b", customName: { en: "Done", zh: "完成" }, cards: [mkCard("c2")] }),
      mkList({ id: "empty", cards: [] }),
    ];
    render(<StatusOverviewBanner lists={lists} lang="en" />);
    const legendItems = document.querySelectorAll(".so-legend li");
    // 2 non-empty + 1 total row = 3
    expect(legendItems.length).toBe(3);
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("SOB6: legend dot color matches list.color", () => {
    const lists = [
      mkList({ id: "a", color: "red", cards: [mkCard("c1")] }),
    ];
    render(<StatusOverviewBanner lists={lists} lang="en" />);
    const dot = document.querySelector(".leg-dot") as HTMLElement;
    expect(dot.style.background).toContain("--board-list-color-red");
  });

  it("SOB7: legend dot for color:null uses var(--accent)", () => {
    const lists = [mkList({ id: "a", color: null, cards: [mkCard("c1")] })];
    render(<StatusOverviewBanner lists={lists} lang="en" />);
    const dot = document.querySelector(".leg-dot") as HTMLElement;
    expect(dot.style.background).toBe("var(--accent)");
  });

  it("SOB8: bilingual title 'Status Overview' / '状态总览'", () => {
    const { unmount } = render(<StatusOverviewBanner lists={[]} lang="en" />);
    expect(screen.getByText("Status Overview")).toBeInTheDocument();
    unmount();
    render(<StatusOverviewBanner lists={[]} lang="zh" />);
    expect(screen.getByText("状态总览")).toBeInTheDocument();
  });

  it("SOB9: bilingual 'Last 7 days' / '近 7 天'", () => {
    const { unmount } = render(<StatusOverviewBanner lists={[]} lang="en" />);
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    unmount();
    render(<StatusOverviewBanner lists={[]} lang="zh" />);
    expect(screen.getByText("近 7 天")).toBeInTheDocument();
  });

  it("SOB10: 5-list PM template → 5 segment circles (excluding base circle)", () => {
    const lists: BoardListData[] = [
      mkList({ id: "todo", customName: { en: "To Do", zh: "待办" }, cards: [mkCard("c1"), mkCard("c2"), mkCard("c3"), mkCard("c4")] }),
      mkList({ id: "prog", customName: { en: "In Progress", zh: "进行中" }, cards: [mkCard("c5"), mkCard("c6"), mkCard("c7")] }),
      mkList({ id: "rev", customName: { en: "In Review", zh: "审核中" }, cards: [mkCard("c8"), mkCard("c9")] }),
      mkList({ id: "blk", customName: { en: "Blocked", zh: "阻塞" }, cards: [mkCard("c10")] }),
      mkList({ id: "done", customName: { en: "Done", zh: "已完成" }, cards: [mkCard("c11"), mkCard("c12")] }),
    ];
    render(<StatusOverviewBanner lists={lists} lang="en" />);
    const svg = screen.getByTestId("so-ring-svg");
    // 1 base ring + 5 segments = 6 circles total
    expect(svg.querySelectorAll("circle").length).toBe(6);
  });
});

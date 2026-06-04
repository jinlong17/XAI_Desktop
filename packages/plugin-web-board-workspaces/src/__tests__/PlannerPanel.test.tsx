/**
 * PP1..PP12 — PlannerPanel component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { BoardCardData, BoardListData } from "@repo/plugin-web-board-core";
import { PlannerPanel, computePlannerSlots } from "../PlannerPanel.js";

// Fixed reference date — 2026-05-22 (Friday)
const NOW = new Date("2026-05-22T10:00:00");

const mkList = (over: Partial<BoardListData>): BoardListData => ({
  id: "l1",
  key: null,
  customName: { en: "Stage", zh: "阶段" },
  color: null,
  cards: [],
  ...over,
});

const mkCard = (
  id: string,
  title: string,
  due: string | null = null,
  extra: Partial<BoardCardData> = {},
) => ({
  id,
  title: { en: title, zh: title + " ZH" },
  due: due ?? undefined,
  ...extra,
});

describe("PlannerPanel (PP1..PP12)", () => {
  it("PP1: renders header + date + 12 hour rows", () => {
    render(<PlannerPanel lists={[]} lang="en" now={NOW} />);
    expect(screen.getByTestId("planner-panel")).toBeInTheDocument();
    const rows = document.querySelectorAll(".pl-row");
    expect(rows.length).toBe(12);
  });

  it("PP2: hour labels — 8a..7p (12-hour format)", () => {
    render(<PlannerPanel lists={[]} lang="en" now={NOW} />);
    const labels = Array.from(document.querySelectorAll(".pl-h")).map((el) => el.textContent);
    expect(labels).toEqual([
      "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p",
    ]);
  });

  it("PP3: bilingual 'Planner' / '计划'", () => {
    const { unmount } = render(<PlannerPanel lists={[]} lang="en" now={NOW} />);
    expect(screen.getByText("Planner")).toBeInTheDocument();
    unmount();
    render(<PlannerPanel lists={[]} lang="zh" now={NOW} />);
    expect(screen.getByText("计划")).toBeInTheDocument();
  });

  it("PP4: date label en-US format", () => {
    render(<PlannerPanel lists={[]} lang="en" now={NOW} />);
    // Expected: "May 22, Fri"
    expect(screen.getByText("May 22, Fri")).toBeInTheDocument();
  });

  it("PP5: date label zh format", () => {
    render(<PlannerPanel lists={[]} lang="zh" now={NOW} />);
    // 2026-05-22 is a Friday → 周五
    expect(screen.getByText("5月22日 周五")).toBeInTheDocument();
  });

  it("PP6: no due-today cards → 3 sample slots at 9 / 11 / 14", () => {
    render(<PlannerPanel lists={[mkList({ cards: [] })]} lang="en" now={NOW} />);
    expect(screen.getByTestId("planner-slot-9")).toBeInTheDocument();
    expect(screen.getByTestId("planner-slot-11")).toBeInTheDocument();
    expect(screen.getByTestId("planner-slot-14")).toBeInTheDocument();
    expect(screen.getByText("Deep focus")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Walk")).toBeInTheDocument();
  });

  it("PP7: cards with due='Today' → seeded slots cycling colors", () => {
    const lists = [
      mkList({
        id: "l1",
        cards: [
          mkCard("c1", "Task 1", "Today"),
          mkCard("c2", "Task 2", "Today"),
        ],
      }),
    ];
    render(<PlannerPanel lists={lists} lang="en" now={NOW} />);
    expect(screen.getByTestId("planner-slot-9")).toBeInTheDocument();
    expect(screen.getByTestId("planner-slot-11")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("PP8: slot cap at 6 cards", () => {
    const cards = Array.from({ length: 10 }, (_, i) =>
      mkCard("c" + i, "Card " + i, "Today"),
    );
    const slots = computePlannerSlots([mkList({ cards })], NOW, "en");
    expect(slots.length).toBe(6);
  });

  it("PP9: bilingual sample labels", () => {
    const { unmount } = render(<PlannerPanel lists={[]} lang="en" now={NOW} />);
    expect(screen.getByText("Deep focus")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Walk")).toBeInTheDocument();
    unmount();
    render(<PlannerPanel lists={[]} lang="zh" now={NOW} />);
    expect(screen.getByText("专注")).toBeInTheDocument();
    expect(screen.getByText("复盘")).toBeInTheDocument();
    expect(screen.getByText("散步")).toBeInTheDocument();
  });

  it("PP10: color cycle — green/blue/amber/purple by i%4", () => {
    const cards = Array.from({ length: 5 }, (_, i) => mkCard("c" + i, "C" + i, "Today"));
    const slots = computePlannerSlots([mkList({ cards })], NOW, "en");
    const colors = slots.map((s) => s.color);
    expect(colors).toEqual(["green", "blue", "amber", "purple", "green"]);
  });

  it("PP11: onOpenCard not provided → slot click is a safe no-op", () => {
    const lists = [mkList({ cards: [mkCard("c1", "Real card", "Today")] })];
    render(<PlannerPanel lists={lists} lang="en" now={NOW} />);
    fireEvent.click(screen.getByTestId("planner-slot-9"));
    // No throw — test passes if we get here
    expect(true).toBe(true);
  });

  it("PP12: onOpenCard called with (cardId, listId)", () => {
    const onOpen = vi.fn();
    const lists = [mkList({ id: "L1", cards: [mkCard("c1", "Real card", "Today")] })];
    render(<PlannerPanel lists={lists} lang="en" now={NOW} onOpenCard={onOpen} />);
    fireEvent.click(screen.getByTestId("planner-slot-9"));
    expect(onOpen).toHaveBeenCalledWith("c1", "L1");
  });

  it("matches due='5/22' to today's M/D", () => {
    const lists = [mkList({ cards: [mkCard("c1", "Due today by date", "5/22")] })];
    render(<PlannerPanel lists={lists} lang="en" now={NOW} />);
    expect(screen.getByText("Due today by date")).toBeInTheDocument();
  });

  it("matches due='今天' as today", () => {
    const lists = [mkList({ cards: [mkCard("c1", "Today by zh", "今天")] })];
    render(<PlannerPanel lists={lists} lang="zh" now={NOW} />);
    expect(screen.getByText("Today by zh ZH")).toBeInTheDocument();
  });

  it("matches typed dueDate as today and ignores dueLate-only cards", () => {
    const lists = [
      mkList({
        cards: [
          mkCard("c1", "Typed today", null, { dueDate: "2026-05-22" }),
          mkCard("c2", "Raw late only", null, { dueLate: true }),
        ],
      }),
    ];
    render(<PlannerPanel lists={lists} lang="en" now={NOW} />);
    expect(screen.getByText("Typed today")).toBeInTheDocument();
    expect(screen.queryByText("Raw late only")).not.toBeInTheDocument();
  });
});

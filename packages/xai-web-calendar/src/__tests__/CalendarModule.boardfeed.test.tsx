import { accountScope } from "@repo/plugin-web-storage";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { makeDefaultBoards } from "@repo/plugin-web-board-core";
import type { Board } from "@repo/plugin-web-board-core";
import { CalendarModule } from "../CalendarModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 4, 22)));
});

afterEach(() => {
  vi.useRealTimers();
});

function seedBoardCardDueDate(dueDate: string): void {
  const boards = makeDefaultBoards() as Board[];
  boards[0]!.lists[0]!.cards[0] = {
    ...boards[0]!.lists[0]!.cards[0]!,
    dueDate,
  };
  localStorage.setItem(accountScope.physicalKey("xai_boards_v2"), JSON.stringify(boards));
}

function chipsForDay(container: HTMLElement, day: string): HTMLElement[] {
  return Array.from(
    container.querySelectorAll(`[data-date="${day}"] .cal-event`),
  ) as HTMLElement[];
}

describe("CalendarModule Board feed", () => {
  it("BCF-MOD-1: absent xai_boards_v2 does not auto-seed Board cards", () => {
    const { container } = render(<CalendarModule lang="en" />);

    expect(chipsForDay(container, "2026-05-14")).toHaveLength(0);
  });

  it("BCF-MOD-2: Board card dueDate appears in Month view", () => {
    seedBoardCardDueDate("2026-05-14");

    const { container } = render(<CalendarModule lang="en" />);
    const chips = chipsForDay(container, "2026-05-14");

    expect(chips).toHaveLength(1);
    expect(chips[0]?.textContent).toContain("Onboarding flow concepts");
    expect(chips[0]?.className).toContain("ev-blue");
  });

  it("BCF-MOD-3: Board card dueDate appears in Week view all-day strip", () => {
    seedBoardCardDueDate("2026-05-22");
    localStorage.setItem(accountScope.physicalKey("xai_calendar_view"), "week");

    render(<CalendarModule lang="en" />);

    expect(screen.getByTitle("Onboarding flow concepts")).toBeTruthy();
  });
});

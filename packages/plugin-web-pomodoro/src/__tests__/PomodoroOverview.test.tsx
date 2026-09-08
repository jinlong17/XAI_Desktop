/**
 * PO1..PO5 — PomodoroOverview component tests.
 * test.md §2
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PomodoroOverview } from "../PomodoroOverview.js";
import {
  FIXTURE_FOCUS_TODAY,
  FIXTURE_FOCUS_YESTERDAY,
  FIXTURE_SHORT_BREAK_TODAY,
} from "../__fixtures__/sessions.js";

describe("PomodoroOverview", () => {
  // PO1: renders 4 cards with correct labels (en)
  it("PO1: renders 4 cards with EN labels", () => {
    render(<PomodoroOverview sessions={[]} lang="en" />);
    expect(screen.getByText("Today's Pomos")).toBeTruthy();
    expect(screen.getByText("Today's Focus")).toBeTruthy();
    expect(screen.getByText("Total Pomos")).toBeTruthy();
    expect(screen.getByText("Total Focus")).toBeTruthy();
  });

  // PO1b: ZH labels
  it("PO1b: renders 4 cards with ZH labels", () => {
    render(<PomodoroOverview sessions={[]} lang="zh" />);
    expect(screen.getByText("今日番茄数")).toBeTruthy();
    expect(screen.getByText("今日专注")).toBeTruthy();
    expect(screen.getByText("累计番茄")).toBeTruthy();
    expect(screen.getByText("累计专注")).toBeTruthy();
  });

  // PO2: today's pomos counter
  it("PO2: today's pomos counter reflects completed focus sessions today", () => {
    const { container } = render(
      <PomodoroOverview sessions={[FIXTURE_FOCUS_TODAY, FIXTURE_FOCUS_YESTERDAY]} lang="en" />,
    );
    // Today's Pomos card should show 1 (only today's session)
    const cards = container.querySelectorAll(".pomo-stat");
    const todayCard = Array.from(cards).find((c) => c.textContent?.includes("Today's Pomos"));
    expect(todayCard?.querySelector(".ps-val")?.textContent).toContain("1");
  });

  // PO3: today's focus minutes formatted
  it("PO3: today's focus minutes formatted", () => {
    const { container } = render(
      <PomodoroOverview sessions={[FIXTURE_FOCUS_TODAY]} lang="en" />,
    );
    const cards = container.querySelectorAll(".pomo-stat");
    const focusCard = Array.from(cards).find((c) => c.textContent?.includes("Today's Focus"));
    // 25 min = "25m"
    expect(focusCard?.textContent).toContain("25");
  });

  // PO4: total focus hours+minutes formatted
  it("PO4: total focus formatted correctly for 1h 15m", () => {
    // 3 sessions × 25min = 75min = 1h 15m
    const sessions = [FIXTURE_FOCUS_TODAY, FIXTURE_FOCUS_YESTERDAY, {
      ...FIXTURE_FOCUS_TODAY,
      id: "pomo_extra",
      finishedAt: "2026-05-22T12:00:00.000Z",
    }];
    const { container } = render(<PomodoroOverview sessions={sessions} lang="en" />);
    const cards = container.querySelectorAll(".pomo-stat");
    const totalFocusCard = Array.from(cards).find((c) => c.textContent?.includes("Total Focus"));
    expect(totalFocusCard?.textContent).toContain("1");
    expect(totalFocusCard?.textContent).toMatch(/h|时/);
  });

  // PO5: zero values render as "0"
  it("PO5: zero values render as '0'", () => {
    const { container } = render(<PomodoroOverview sessions={[]} lang="en" />);
    const vals = container.querySelectorAll(".ps-val");
    for (const val of vals) {
      expect(val.textContent?.trim()).toBe("0");
    }
  });

  // Non-focus excluded
  it("short-break sessions do not count in overview", () => {
    const { container } = render(
      <PomodoroOverview sessions={[FIXTURE_SHORT_BREAK_TODAY]} lang="en" />,
    );
    const vals = container.querySelectorAll(".ps-val");
    for (const val of vals) {
      expect(val.textContent?.trim()).toBe("0");
    }
  });
});

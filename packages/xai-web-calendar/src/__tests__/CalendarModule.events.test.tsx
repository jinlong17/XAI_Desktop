/**
 * Event-chip rendering — AC-EVENT-1..4.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { CalendarModule } from "../CalendarModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 4, 22)));
});

afterEach(() => {
  vi.useRealTimers();
});

function chipsForDay(container: HTMLElement, day: string): HTMLElement[] {
  return Array.from(
    container.querySelectorAll(`[data-date="${day}"] .cal-event`),
  ) as HTMLElement[];
}

describe("event-chip rendering", () => {
  it("AC-EVENT-1: Day 1 → 4 chips (amber/blue/mint/mint)", () => {
    const { container } = render(<CalendarModule lang="en" />);
    const chips = chipsForDay(container, "2026-05-01");
    expect(chips).toHaveLength(4);
    expect(chips[0]?.className).toContain("ev-amber");
    expect(chips[1]?.className).toContain("ev-blue");
    expect(chips[2]?.className).toContain("ev-mint");
    expect(chips[3]?.className).toContain("ev-mint");
  });

  it("AC-EVENT-2: Day 14 → 0 chips", () => {
    const { container } = render(<CalendarModule lang="en" />);
    const chips = chipsForDay(container, "2026-05-14");
    expect(chips).toHaveLength(0);
  });

  it("AC-EVENT-3: Day 22 → 3 chips with Data Analysis/Brainstorming/Meditation", () => {
    const { container } = render(<CalendarModule lang="en" />);
    const chips = chipsForDay(container, "2026-05-22");
    expect(chips).toHaveLength(3);
    const titles = chips.map((c) => c.querySelector(".ev-title")?.textContent);
    expect(titles).toEqual(["Data Analysis", "Brainstorming", "Meditation"]);
  });

  it("AC-EVENT-4: time field renders ev-time.mono", () => {
    const { container } = render(<CalendarModule lang="en" />);
    // Day 22 Data Analysis has time 11:00.
    const day22 = chipsForDay(container, "2026-05-22");
    const times = day22.map((c) => c.querySelector(".ev-time")?.textContent);
    expect(times).toContain("11:00");
    expect(times).toContain("11:30");
  });

  it("AC-EVENT-6: pad cells (m=prev) render no chips", () => {
    const { container } = render(<CalendarModule lang="en" />);
    const padCells = container.querySelectorAll('[data-in-month="false"]');
    padCells.forEach((cell) => {
      expect(cell.querySelectorAll(".cal-event")).toHaveLength(0);
    });
  });

  it("ZH day-1 chips use Chinese titles", () => {
    const { container } = render(<CalendarModule lang="zh" />);
    const chips = chipsForDay(container, "2026-05-01");
    const titles = chips.map((c) => c.querySelector(".ev-title")?.textContent);
    expect(titles).toEqual([
      "打电话给 Sandy",
      "需求调研",
      "展示",
      "体检",
    ]);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatStreak, STAT_STREAK_DAYS } from "../widgets/StatStreak.js";

describe("StatStreak", () => {
  it("AC-STATS-2: renders streak days value", () => {
    render(<StatStreak lang="en" />);
    expect(screen.getByText(STAT_STREAK_DAYS.toString())).toBeTruthy();
  });

  it("AC-STATS-2: renders a flame icon", () => {
    const { container } = render(<StatStreak lang="en" />);
    expect(container.querySelector("[data-icon='flame']")).not.toBeNull();
  });

  it("AC-STATS-4: bilingual unit suffix d/天", () => {
    const { container, rerender } = render(<StatStreak lang="en" />);
    expect(container.querySelector(".ws-unit")?.textContent).toBe(" d");
    rerender(<StatStreak lang="zh" />);
    expect(container.querySelector(".ws-unit")?.textContent).toBe(" 天");
  });

  it("AC-STATS-4: bilingual label en/zh", () => {
    const { rerender } = render(<StatStreak lang="en" />);
    expect(screen.getByText("Habit streak")).toBeTruthy();
    rerender(<StatStreak lang="zh" />);
    expect(screen.getByText("习惯连胜")).toBeTruthy();
  });
});

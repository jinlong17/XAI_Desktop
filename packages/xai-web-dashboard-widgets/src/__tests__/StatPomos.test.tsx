import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatPomos, STAT_POMOS_DONE, STAT_POMOS_TOTAL } from "../widgets/StatPomos.js";

describe("StatPomos", () => {
  it("AC-STATS-3: renders pomos count value", () => {
    render(<StatPomos lang="en" />);
    expect(screen.getByText(STAT_POMOS_DONE.toString())).toBeTruthy();
  });

  it("AC-STATS-3: renders 8 dots with 6 'on'", () => {
    const { container } = render(<StatPomos lang="en" />);
    expect(container.querySelectorAll(".pd-dot")).toHaveLength(STAT_POMOS_TOTAL);
    expect(container.querySelectorAll(".pd-dot.on")).toHaveLength(STAT_POMOS_DONE);
  });

  it("AC-STATS-4: bilingual label en/zh", () => {
    const { rerender } = render(<StatPomos lang="en" />);
    expect(screen.getByText("Pomodoros")).toBeTruthy();
    rerender(<StatPomos lang="zh" />);
    expect(screen.getByText("番茄数")).toBeTruthy();
  });
});

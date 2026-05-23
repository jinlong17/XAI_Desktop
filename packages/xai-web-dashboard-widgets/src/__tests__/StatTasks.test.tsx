import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatTasks, STAT_TASKS_DONE, STAT_TASKS_TOTAL } from "../widgets/StatTasks.js";

describe("StatTasks", () => {
  it("AC-STATS-1: renders 14/22 value", () => {
    render(<StatTasks lang="en" />);
    expect(screen.getByText(STAT_TASKS_DONE.toString())).toBeTruthy();
    expect(screen.getByText("/" + STAT_TASKS_TOTAL)).toBeTruthy();
  });

  it("AC-STATS-1: renders a donut with progress = done/total", () => {
    const { container } = render(<StatTasks lang="en" />);
    const filled = container.querySelector("circle[data-value]");
    expect(filled).not.toBeNull();
    const v = parseFloat(filled!.getAttribute("data-value") || "0");
    expect(v).toBeCloseTo(STAT_TASKS_DONE / STAT_TASKS_TOTAL, 5);
  });

  it("AC-STATS-4: bilingual label en/zh", () => {
    const { rerender } = render(<StatTasks lang="en" />);
    expect(screen.getByText("Tasks done")).toBeTruthy();
    rerender(<StatTasks lang="zh" />);
    expect(screen.getByText("完成任务")).toBeTruthy();
  });
});

/**
 * StatTasks — real-data tests (§F rewrite).
 *
 * Seeds `xai_task_cols` via `localStorage` before rendering.
 * Old magic-number assertions (14/22) are REMOVED (RD8 guard).
 *
 * AC-STATS-REAL-TASKS-1: empty store → empty label (not a 0/0 donut)
 * AC-STATS-REAL-TASKS-2: real data → correct done/total
 * AC-STATS-REAL-TASKS-3: bilingual labels
 * AC-STATS-REAL-TASKS-4: widget re-renders stably (RD6 guard)
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatTasks } from "../widgets/StatTasks.js";

function seedTaskCols(store: unknown) {
  localStorage.setItem("xai_task_cols", JSON.stringify(store));
}

beforeEach(() => {
  localStorage.clear();
});

describe("StatTasks — real data", () => {
  // AC-STATS-REAL-TASKS-1: empty / no-tasks state
  it("AC-STATS-REAL-TASKS-1: shows empty label when no tasks", () => {
    // No localStorage entry → default {}
    render(<StatTasks lang="en" />);
    expect(screen.getByText("No tasks yet")).toBeTruthy();
    expect(screen.queryByText(/\//)).toBeNull(); // no "done/total"
  });

  it("AC-STATS-REAL-TASKS-1: shows empty label in Chinese", () => {
    render(<StatTasks lang="zh" />);
    expect(screen.getByText("暂无任务")).toBeTruthy();
  });

  // AC-STATS-REAL-TASKS-2: real data with done tasks
  it("AC-STATS-REAL-TASKS-2: renders correct done/total", () => {
    seedTaskCols({
      overdue: {
        tasks: [
          { id: "t1", done: true },
          { id: "t2", done: false },
          { id: "t3", done: true },
        ],
      },
      next7: {
        tasks: [
          { id: "t4", done: false },
          { id: "t5" }, // absent done === false (T-10 guard)
        ],
      },
    });
    render(<StatTasks lang="en" />);
    // 2 done out of 5 total
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("/5")).toBeTruthy();
  });

  it("AC-STATS-REAL-TASKS-2: all done shows done === total", () => {
    seedTaskCols({
      overdue: {
        tasks: [{ done: true }, { done: true }],
      },
    });
    render(<StatTasks lang="en" />);
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("/2")).toBeTruthy();
  });

  it("AC-STATS-REAL-TASKS-2: 0 done with tasks renders 0/total donut", () => {
    seedTaskCols({
      next7: { tasks: [{ done: false }, { done: false }] },
    });
    render(<StatTasks lang="en" />);
    expect(screen.getByText("0")).toBeTruthy();
    expect(screen.getByText("/2")).toBeTruthy();
    // Should NOT show empty label
    expect(screen.queryByText("No tasks yet")).toBeNull();
  });

  it("AC-STATS-REAL-TASKS-2: donut value reflects real ratio", () => {
    seedTaskCols({
      overdue: { tasks: [{ done: true }, { done: false }, { done: false }, { done: false }] },
    });
    const { container } = render(<StatTasks lang="en" />);
    const filled = container.querySelector("circle[data-value]");
    expect(filled).not.toBeNull();
    const v = parseFloat(filled!.getAttribute("data-value") || "0");
    expect(v).toBeCloseTo(0.25, 5);
  });

  // AC-STATS-REAL-TASKS-3: bilingual labels
  it("AC-STATS-REAL-TASKS-3: bilingual label en/zh", () => {
    const { rerender } = render(<StatTasks lang="en" />);
    expect(screen.getByText("Tasks done")).toBeTruthy();
    rerender(<StatTasks lang="zh" />);
    expect(screen.getByText("完成任务")).toBeTruthy();
  });

  // AC-STATS-REAL-TASKS-4: stable re-render (RD6 guard)
  it("AC-STATS-REAL-TASKS-4: re-renders without crash (RD6)", () => {
    seedTaskCols({ overdue: { tasks: [{ done: true }] } });
    const { rerender, container } = render(<StatTasks lang="en" />);
    expect(container.querySelector(".stat-tasks")).not.toBeNull();
    rerender(<StatTasks lang="zh" />);
    expect(container.querySelector(".stat-tasks")).not.toBeNull();
  });
});

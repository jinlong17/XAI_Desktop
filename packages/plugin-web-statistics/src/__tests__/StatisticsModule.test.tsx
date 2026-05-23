import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { setPref } from "@repo/plugin-web-storage";
import { StatisticsModule } from "../StatisticsModule.js";
import { makeFocusSession } from "./__fixtures__/sessions.js";

const NOW_ISO = "2026-05-23T10:30:00Z";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: false });
  vi.setSystemTime(new Date(NOW_ISO));
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("StatisticsModule", () => {
  it("S1: renders with no seeded data — empty-state safe", () => {
    const { container } = render(<StatisticsModule lang="en" />);
    expect(container.querySelector(".module-stats")).not.toBeNull();
    // KPI tasks shows 0
    expect(screen.getByLabelText("KPI tasks")).toBeInTheDocument();
    // Heatmap is 182 cells
    expect(container.querySelectorAll(".heatmap .heat-cell").length).toBe(182);
    // No peak hint
    expect(screen.getByText(/No peak yet/)).toBeInTheDocument();
  });

  it("S2: seeded focus sessions update KPI value", () => {
    act(() => {
      setPref("xai_pomodoro_sessions", [
        makeFocusSession("2026-05-20T09:00:00Z", 25),
        makeFocusSession("2026-05-21T09:00:00Z", 25),
        makeFocusSession("2026-05-22T09:00:00Z", 25),
      ] as never);
    });
    render(<StatisticsModule lang="en" />);
    // 3 focus sessions in current week → tasksTotal = 3
    const tasksCell = screen.getByLabelText("KPI tasks");
    expect(tasksCell.textContent).toContain("3");
  });

  it("S3: clicking 本月 switches to month range", () => {
    render(<StatisticsModule lang="zh" />);
    const monthBtn = screen.getByTestId("stats-range-month");
    fireEvent.click(monthBtn);
    expect(monthBtn.getAttribute("aria-selected")).toBe("true");
  });

  it("S4: clicking 全部 switches to all range", () => {
    render(<StatisticsModule lang="zh" />);
    const allBtn = screen.getByTestId("stats-range-all");
    fireEvent.click(allBtn);
    expect(allBtn.getAttribute("aria-selected")).toBe("true");
  });

  it("S5: lang=zh shows ZH tab labels", () => {
    render(<StatisticsModule lang="zh" />);
    expect(screen.getByText("本周")).toBeInTheDocument();
    expect(screen.getByText("本月")).toBeInTheDocument();
    expect(screen.getByText("全部时间")).toBeInTheDocument();
  });

  it("S6: 'Statistics' module title appears for en", () => {
    render(<StatisticsModule lang="en" />);
    expect(screen.getByText("Statistics")).toBeInTheDocument();
  });

  it("S8: aria-selected on the active tab", () => {
    render(<StatisticsModule lang="en" />);
    const weekBtn = screen.getByTestId("stats-range-week");
    expect(weekBtn.getAttribute("aria-selected")).toBe("true");
    const monthBtn = screen.getByTestId("stats-range-month");
    expect(monthBtn.getAttribute("aria-selected")).toBe("false");
  });

  it("S9: stable data-testid on tab buttons", () => {
    render(<StatisticsModule lang="en" />);
    expect(screen.getByTestId("stats-range-week")).toBeInTheDocument();
    expect(screen.getByTestId("stats-range-month")).toBeInTheDocument();
    expect(screen.getByTestId("stats-range-all")).toBeInTheDocument();
  });

  it("S10: no console.error during render", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<StatisticsModule lang="en" />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

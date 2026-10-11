import { accountScope } from "@repo/plugin-web-storage";
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
  it('shows only current total for undated tasks and creates a timeline only from recorded dates', () => {
    act(() => { setPref('xai_task_cols', [{ tasks: [{ done: true }] }] as never); });
    const view = render(<StatisticsModule lang="en" />);
    expect(screen.getByTestId('tasks-no-history')).toHaveTextContent('current completed total only');
    act(() => { setPref('xai_task_cols', [{ tasks: [{ done: true }, { done: true, completedAt: NOW_ISO }] }] as never); });
    expect(screen.queryByTestId('tasks-no-history')).toBeNull();
    expect(screen.getByText('1 dated task completions in the selected range')).toBeInTheDocument();
    expect(screen.getByText('1 completed tasks have no valid completion date and are excluded from the timeline.')).toBeInTheDocument();
    view.unmount();
  });
  it('shows measured partial time and explains legacy exclusions without rewriting storage', () => {
    const rows = [
      { mode: 'focus', durationMs: 1_500_000, elapsedMs: 60_000, finishedAt: NOW_ISO },
      { mode: 'focus', durationMs: 1_500_000, finishedAt: NOW_ISO },
    ];
    act(() => { setPref('xai_pomodoro_sessions', rows as never); });
    const before = JSON.stringify({ ...localStorage });
    const { rerender } = render(<StatisticsModule lang="en" />);
    expect(screen.getByLabelText('KPI focus')).toHaveTextContent('h 1m');
    expect(screen.getByTestId('stats-unmeasured-focus')).toHaveTextContent('1 focus records');
    rerender(<StatisticsModule lang="zh" />);
    expect(screen.getByTestId('stats-unmeasured-focus')).toHaveTextContent('1 条专注记录');
    expect(JSON.stringify({ ...localStorage })).toBe(before);
  });
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

  it("S2: seeded xai_task_cols updates tasks KPI with real done count (not session count)", () => {
    act(() => {
      // Seed focus sessions (these should NOT affect tasksTotal anymore)
      setPref("xai_pomodoro_sessions", [
        makeFocusSession("2026-05-20T09:00:00Z", 25),
        makeFocusSession("2026-05-21T09:00:00Z", 25),
        makeFocusSession("2026-05-22T09:00:00Z", 25),
      ] as never);
      // Real done count: 2 done cards
      setPref("xai_task_cols", {
        overdue: { tasks: [{ done: true }, { done: false }] },
        next7:   { tasks: [{ done: true }] },
        later:   { tasks: [] },
      } as never);
    });
    render(<StatisticsModule lang="en" />);
    // tasksTotal = 2 real done cards (NOT 3 focus sessions)
    const tasksCell = screen.getByLabelText("KPI tasks");
    expect(tasksCell.textContent).toContain("2");
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

  it("S11: honest zero — tasksTotal = 0 when no done tasks (empty-state safe)", () => {
    act(() => {
      setPref("xai_task_cols", { overdue: { tasks: [{ done: false }] } } as never);
    });
    render(<StatisticsModule lang="en" />);
    const tasksCell = screen.getByLabelText("KPI tasks");
    // Shows 0, not undefined or crash
    expect(tasksCell.textContent).toContain("0");
    // Still shows the current board marker
    expect(screen.getByTestId("kpi-sublabel")).toBeInTheDocument();
  });

  it("S12: live update — tasks KPI updates when xai_task_cols changes", () => {
    act(() => {
      setPref("xai_task_cols", {
        overdue: { tasks: [{ done: true }] },
      } as never);
    });
    render(<StatisticsModule lang="en" />);
    const tasksCell = screen.getByLabelText("KPI tasks");
    expect(tasksCell.textContent).toContain("1");

    act(() => {
      setPref("xai_task_cols", {
        overdue: { tasks: [{ done: true }, { done: true }] },
        next7:   { tasks: [{ done: true }] },
      } as never);
    });
    expect(tasksCell.textContent).toContain("3");
  });

  it("S13: read-only — no setPref('xai_task_cols') call during render (RA3 gate)", () => {
    // This test ensures Statistics never writes xai_task_cols.
    // We spy on the storage to confirm xai_task_cols is never set by the module.
    const originalStorage = { ...localStorage };
    act(() => {
      setPref("xai_task_cols", { overdue: { tasks: [{ done: true }] } } as never);
    });
    const stateBefore = localStorage.getItem(accountScope.physicalKey("xai_task_cols"));
    render(<StatisticsModule lang="en" />);
    // Storage value must be byte-identical (not mutated by Statistics)
    expect(localStorage.getItem(accountScope.physicalKey("xai_task_cols"))).toBe(stateBefore);
    void originalStorage;
  });

  it("S14: KPI marker — 'current board' / '当前看板' sub-label on Tasks KPI card", () => {
    render(<StatisticsModule lang="en" />);
    expect(screen.getByTestId("kpi-sublabel")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-sublabel").textContent).toBe("current board");
  });

  it("S14-zh: KPI marker shows zh version for lang=zh", () => {
    render(<StatisticsModule lang="zh" />);
    expect(screen.getByTestId("kpi-sublabel").textContent).toBe("当前看板");
  });

  it("S15: BarChart panel — 'current board' marker appears in the Tasks panel header", () => {
    render(<StatisticsModule lang="en" />);
    expect(screen.getByTestId("tasks-barchart-marker")).toBeInTheDocument();
    expect(screen.getByTestId("tasks-barchart-marker").textContent).toBe("current board");
  });

  it("S15-range-invariant: marker still renders + value identical across all range tabs", () => {
    act(() => {
      setPref("xai_task_cols", {
        overdue: { tasks: [{ done: true }, { done: true }] },
      } as never);
    });
    render(<StatisticsModule lang="en" />);

    // Week tab (default)
    const tasksCell = screen.getByLabelText("KPI tasks");
    expect(tasksCell.textContent).toContain("2");
    expect(screen.getByTestId("kpi-sublabel")).toBeInTheDocument();
    expect(screen.getByTestId("tasks-barchart-marker")).toBeInTheDocument();

    // Switch to month
    act(() => { fireEvent.click(screen.getByTestId("stats-range-month")); });
    expect(screen.getByLabelText("KPI tasks").textContent).toContain("2");
    expect(screen.getByTestId("kpi-sublabel")).toBeInTheDocument();
    expect(screen.getByTestId("tasks-barchart-marker")).toBeInTheDocument();

    // Switch to all
    act(() => { fireEvent.click(screen.getByTestId("stats-range-all")); });
    expect(screen.getByLabelText("KPI tasks").textContent).toContain("2");
    expect(screen.getByTestId("kpi-sublabel")).toBeInTheDocument();
    expect(screen.getByTestId("tasks-barchart-marker")).toBeInTheDocument();
  });
});

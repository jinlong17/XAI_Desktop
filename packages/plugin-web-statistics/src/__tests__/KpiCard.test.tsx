import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "../KpiCard.js";

describe("KpiCard", () => {
  it("K1: renders label, value, unit, trend", () => {
    render(
      <KpiCard
        cellId="tasks"
        colorVar="var(--accent)"
        icon="check"
        label="Tasks completed"
        value={42}
        trend="+12%"
      />,
    );
    expect(screen.getByText("Tasks completed")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("K2: data-cell-id attr matches cellId", () => {
    const { container } = render(
      <KpiCard
        cellId="focus"
        colorVar="var(--blue)"
        icon="timer"
        label="Focus"
        value="3"
        unit="h 30m"
        trend="+8%"
      />,
    );
    const cell = container.querySelector('[data-cell-id="focus"]');
    expect(cell).not.toBeNull();
  });

  it("K3: em-dash trend renders without crash", () => {
    render(
      <KpiCard
        cellId="daily-avg"
        colorVar="var(--red)"
        icon="flame"
        label="Daily avg"
        value="—"
        trend="—"
      />,
    );
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(2);
  });

  it("K4: aria-label includes cellId", () => {
    render(
      <KpiCard
        cellId="habits"
        colorVar="var(--amber)"
        icon="pin"
        label="Habits"
        value="3"
        unit="/5"
        trend="—"
      />,
    );
    expect(screen.getByLabelText("KPI habits")).toBeInTheDocument();
  });
});

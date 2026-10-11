/**
 * Tests for TimeGrid shared component — AC-TIMEGRID-1..8.
 * Design ref: design.md §15.4 + §15.2 #6.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimeGrid } from "../TimeGrid.js";
import { SAMPLE_EVENTS } from "../internal/sampleEvents.js";

const DATE = "2026-05-22";
const DAY_KEYS_1 = [DATE];
const DAY_LABELS_1 = ["Fri 22"];
const DAY_KEYS_7 = [
  "2026-05-17",
  "2026-05-18",
  "2026-05-19",
  "2026-05-20",
  "2026-05-21",
  DATE,
  "2026-05-23",
];
const DAY_LABELS_7 = ["Sun 17", "Mon 18", "Tue 19", "Wed 20", "Thu 21", "Fri 22", "Sat 23"];

function renderTimeGrid(props?: Partial<Parameters<typeof TimeGrid>[0]>) {
  return render(
    <TimeGrid
      columns={1}
      dayKeys={DAY_KEYS_1}
      dayLabels={DAY_LABELS_1}
      events={SAMPLE_EVENTS}
      activeDate={DATE}
      todayKey={DATE}
      lang="en"
      {...props}
    />,
  );
}

describe("TimeGrid", () => {
  it("AC-TIMEGRID-1: renders the time grid container", () => {
    renderTimeGrid();
    expect(screen.getByTestId("cal-time-grid")).toBeTruthy();
  });

  it("AC-TIMEGRID-2: day header shows correct label", () => {
    renderTimeGrid();
    expect(screen.getByText("Fri 22")).toBeTruthy();
  });

  it("AC-TIMEGRID-3: renders 24 hour-row elements for a standard day", () => {
    renderTimeGrid({ dayKeys: [DATE], dayLabels: ["Fri 22"] });
    const container = screen.getByTestId("cal-time-grid");
    const hourRows = container.querySelectorAll(".cal-hour-row");
    expect(hourRows.length).toBe(24);
  });

  it("AC-TIMEGRID-4: spring-forward day has 23 real hour labels", () => {
    const dstDayKey = "2026-03-08";
    renderTimeGrid({ dayKeys: [dstDayKey], dayLabels: ["Sun 8"] });
    const container = screen.getByTestId("cal-time-grid");
    const hourRows = container.querySelectorAll(".cal-hour-row");
    expect(hourRows.length).toBe(23);
  });

  it("AC-TIMEGRID-5: fall-back day has 25 hour-row elements", () => {
    const dstDayKey = "2026-11-01";
    renderTimeGrid({ dayKeys: [dstDayKey], dayLabels: ["Sun 1"] });
    const container = screen.getByTestId("cal-time-grid");
    const hourRows = container.querySelectorAll(".cal-hour-row");
    expect(hourRows.length).toBe(25);
  });

  it("AC-TIMEGRID-6: renders 7-column grid for week", () => {
    renderTimeGrid({
      columns: 7,
      dayKeys: DAY_KEYS_7,
      dayLabels: DAY_LABELS_7,
    });
    // All 7 day labels should be in the header
    for (const label of DAY_LABELS_7) {
      expect(screen.getByText(label)).toBeTruthy();
    }
  });

  it("AC-TIMEGRID-7: activeDate column gets data-active", () => {
    renderTimeGrid({ dayKeys: DAY_KEYS_7, dayLabels: DAY_LABELS_7, columns: 7, activeDate: DATE });
    const activeCol = screen.getByTestId(`cal-day-col-${DATE}`);
    expect(activeCol).toBeTruthy();
    // The column should have data-active="true"
    expect(activeCol.getAttribute("data-active")).toBe("true");
  });

  it("AC-TIMEGRID-8: scrollable area rendered", () => {
    renderTimeGrid();
    expect(screen.getByTestId("cal-time-scroll")).toBeTruthy();
  });
});

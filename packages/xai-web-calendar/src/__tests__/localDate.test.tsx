import { expect, it, vi } from "vitest";
import { render, act, screen, fireEvent } from "@testing-library/react";
import { TimeGridHourRow } from "../TimeGridHourRow.js";
import { CalendarModule } from "../CalendarModule.js";
import { dstHoursForDay, buildHourLabels, hourToRow } from "../internal/timeGridMath.js";
it("derives grid hours from this device's civil date including future and half-hour DST", () => {
  for (const key of ["2026-03-08", "2026-11-01", "2027-03-14", "2026-04-05", "2026-10-04"]) {
    const start = new Date(`${key}T00:00:00`);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    const hours = (end.getTime() - start.getTime()) / 3600000;
    expect(dstHoursForDay(key).hours).toBe(hours);
    expect(buildHourLabels(key)).toHaveLength(Math.ceil(hours));
    expect(buildHourLabels(key).reduce((sum, label) => sum + (label.durationHours ?? 1), 0)).toBe(hours);
  }
});
it("today action uses the new civil day after midnight without remounting", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 8, 23, 59, 59));
  const view = render(<CalendarModule lang="en" />);
  act(() => vi.advanceTimersByTime(1000));
  fireEvent.click(screen.getByTestId("cal-today"));
  expect(document.querySelector('[data-date-key="2026-09-09"]') ?? document.querySelector('[data-date="2026-09-09"]')).toBeTruthy();
  view.unmount();
  vi.useRealTimers();
});

it("resolves repeated floating clock times to the earlier occurrence", () => {
 const shift = {kind: "fall-back" as const, atRow: 1, deltaHours: -1, transitionHour: 1};
 expect(hourToRow(1, 30, shift)).toBe(1.5);
 expect(hourToRow(2, 0, shift)).toBe(3);
});

it("renders fractional duration rows at their actual height", () => {
 const view=render(<TimeGridHourRow label={{label:"23:30",isDst:false,durationHours:0.5}}/>);
 expect((view.container.firstElementChild as HTMLElement).style.height).toBe("24px");
 view.unmount();
});

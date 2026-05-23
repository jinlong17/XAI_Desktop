/**
 * Week-start preference — AC-WEEKSTART-1..3.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { setPref } from "@repo/plugin-web-storage";
import { CalendarModule } from "../CalendarModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 4, 22)));
});

afterEach(() => {
  vi.useRealTimers();
});

function weekdayLabels(): string[] {
  return Array.from(document.querySelectorAll(".cal-weekday")).map(
    (el) => el.textContent ?? "",
  );
}

describe("CalendarModule weekStart preference", () => {
  it("AC-WEEKSTART-1: default Sun-first", () => {
    render(<CalendarModule lang="en" />);
    expect(weekdayLabels()).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("AC-WEEKSTART-2: setPref(1) re-renders Mon-first", () => {
    render(<CalendarModule lang="en" />);
    act(() => {
      setPref("xai_pref_week_start", 1);
    });
    expect(weekdayLabels()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("AC-WEEKSTART-3: flipping back to 0 restores Sun-first", () => {
    render(<CalendarModule lang="en" />);
    act(() => {
      setPref("xai_pref_week_start", 1);
    });
    act(() => {
      setPref("xai_pref_week_start", 0);
    });
    expect(weekdayLabels()).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });
});

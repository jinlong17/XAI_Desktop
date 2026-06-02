/**
 * Week-start preference — AC-WEEKSTART-1..3.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, act, fireEvent, screen } from "@testing-library/react";
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
      // Cast: registry default is the literal `0`, but the entry satisfies
      // PrefEntry<0 | 1>; setPref's inferred argument narrows to the default
      // literal. Cast widens to the actual storage union.
      setPref("xai_pref_week_start", 1 as unknown as 0);
    });
    expect(weekdayLabels()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });

  it("AC-WEEKSTART-3: flipping back to 0 restores Sun-first", () => {
    render(<CalendarModule lang="en" />);
    act(() => {
      // Cast: registry default is the literal `0`, but the entry satisfies
      // PrefEntry<0 | 1>; setPref's inferred argument narrows to the default
      // literal. Cast widens to the actual storage union.
      setPref("xai_pref_week_start", 1 as unknown as 0);
    });
    act(() => {
      setPref("xai_pref_week_start", 0);
    });
    expect(weekdayLabels()).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("AC-WEEKSTART-4: toolbar settings can switch to Mon-first", () => {
    render(<CalendarModule lang="en" />);

    fireEvent.click(screen.getByTestId("cal-dots"));
    fireEvent.click(screen.getByText("Monday"));

    expect(weekdayLabels()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });
});

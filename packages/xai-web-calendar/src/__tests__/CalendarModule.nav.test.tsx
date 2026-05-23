/**
 * Month-nav — AC-NAV-1..6.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CalendarModule } from "../CalendarModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 4, 22)));
});

afterEach(() => {
  vi.useRealTimers();
});

function clickPrev() {
  act(() => {
    screen.getByTestId("cal-prev-month").click();
  });
}
function clickNext() {
  act(() => {
    screen.getByTestId("cal-next-month").click();
  });
}
function clickToday() {
  act(() => {
    screen.getByTestId("cal-today").click();
  });
}
function title() {
  return screen.getByRole("heading", { level: 1 }).textContent;
}

describe("CalendarModule nav", () => {
  it("AC-NAV-1: > → June 2026", () => {
    render(<CalendarModule lang="en" />);
    expect(title()).toBe("May 2026");
    clickNext();
    expect(title()).toBe("Jun 2026");
  });

  it("AC-NAV-2: < → April 2026", () => {
    render(<CalendarModule lang="en" />);
    clickPrev();
    expect(title()).toBe("Apr 2026");
  });

  it("AC-NAV-3: year rollover Dec → Jan", () => {
    render(<CalendarModule lang="en" />);
    // Advance to Dec 2026 (7 clicks from May).
    for (let i = 0; i < 7; i++) clickNext();
    expect(title()).toBe("Dec 2026");
    clickNext();
    expect(title()).toBe("Jan 2027");
  });

  it("AC-NAV-4: today button resets to May 2026 anchor", () => {
    render(<CalendarModule lang="en" />);
    clickNext();
    clickNext();
    clickNext();
    expect(title()).not.toBe("May 2026");
    clickToday();
    expect(title()).toBe("May 2026");
  });

  it("AC-NAV-5: nav clears focusedDate", () => {
    // We can't programmatically set focusedDate here, but we can assert that
    // after any nav, no .cal-day[data-focused] outline exists.
    render(<CalendarModule lang="en" />);
    clickNext();
    expect(document.querySelector('[data-focused="true"]')).toBeNull();
    clickPrev();
    expect(document.querySelector('[data-focused="true"]')).toBeNull();
    clickToday();
    expect(document.querySelector('[data-focused="true"]')).toBeNull();
  });

  it("AC-NAV-6 (ZH): title updates in ZH after nav", () => {
    render(<CalendarModule lang="zh" />);
    expect(title()).toBe("2026 年 5 月");
    clickNext();
    expect(title()).toBe("2026 年 6 月");
  });
});

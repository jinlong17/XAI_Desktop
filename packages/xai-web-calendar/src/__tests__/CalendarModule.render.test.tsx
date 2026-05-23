/**
 * Component-level render tests — AC-RENDER-1..6, AC-VIEW-1..2, AC-VIEW-3..5,
 * AC-TODAY-1, AC-TODAY-3.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CalendarModule } from "../CalendarModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 4, 22, 12, 0, 0)));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CalendarModule render", () => {
  it("AC-RENDER-1: renders without throwing (EN)", () => {
    expect(() => render(<CalendarModule lang="en" />)).not.toThrow();
  });

  it("AC-RENDER-4: title shows May 2026 in EN", () => {
    render(<CalendarModule lang="en" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("May 2026");
  });

  it("AC-RENDER-4 (ZH): title shows 2026 年 5 月", () => {
    render(<CalendarModule lang="zh" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("2026 年 5 月");
  });

  it("AC-RENDER-3: month grid has 42 cells for May 2026 Sunday-first (6 rows)", () => {
    render(<CalendarModule lang="en" />);
    const cells = document.querySelectorAll(".cal-day");
    expect(cells).toHaveLength(42);
  });

  it("AC-RENDER-5: sample-data banner is visible (EN)", () => {
    render(<CalendarModule lang="en" />);
    expect(
      screen.getByText("Sample data — switch to your account to see real events."),
    ).toBeTruthy();
  });

  it("AC-RENDER-6 / AC-TODAY-1: today-pill wraps exactly one in-month day (May 22)", () => {
    render(<CalendarModule lang="en" />);
    const pills = document.querySelectorAll(".today-pill");
    expect(pills).toHaveLength(1);
    expect(pills[0]?.textContent).toBe("22");
  });

  it("AC-VIEW-1: all 3 view tabs are present", () => {
    render(<CalendarModule lang="en" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("AC-VIEW-2: Month is selected by default", () => {
    render(<CalendarModule lang="en" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[2]?.getAttribute("aria-selected")).toBe("true");
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("false");
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("false");
  });

  it("AC-VIEW-3: clicking Week swaps grid for ComingSoonPanel", () => {
    render(<CalendarModule lang="en" />);
    const tabs = screen.getAllByRole("tab");
    act(() => {
      tabs[1]?.click();
    });
    expect(document.querySelector('[data-testid="cal-coming-soon"]')).toBeTruthy();
    expect(document.querySelectorAll(".cal-day")).toHaveLength(0);
  });

  it("AC-VIEW-5: clicking back to Month restores the grid", () => {
    render(<CalendarModule lang="en" />);
    const tabs = screen.getAllByRole("tab");
    act(() => {
      tabs[1]?.click(); // Week
    });
    act(() => {
      tabs[2]?.click(); // Month again
    });
    expect(document.querySelector('[data-testid="cal-coming-soon"]')).toBeNull();
    expect(document.querySelectorAll(".cal-day").length).toBeGreaterThan(0);
  });

  it("AC-TODAY-3: DST boundary — UTC today still pinned (Mar 8 2026 spring-forward)", () => {
    // Re-mock to a DST boundary date.
    vi.setSystemTime(new Date(Date.UTC(2026, 2, 8, 12, 0, 0))); // Mar 8 2026 UTC
    const { container } = render(<CalendarModule lang="en" />);
    // Default displayed month is still May 2026 (anchor); today-pill should not
    // appear in May 2026 grid because Mar 8 is outside May 2026.
    const pills = container.querySelectorAll(".today-pill");
    expect(pills).toHaveLength(0);
  });
});

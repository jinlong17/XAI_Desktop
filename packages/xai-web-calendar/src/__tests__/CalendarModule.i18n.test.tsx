/**
 * Bilingual parity — AC-I18N-1..3, AC-I18N-4..5 (holiday).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarModule } from "../CalendarModule.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(Date.UTC(2026, 4, 22)));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("CalendarModule i18n", () => {
  it("AC-I18N-1: EN weekday header (Sun-first default) renders Sun..Sat", () => {
    render(<CalendarModule lang="en" />);
    const headers = document.querySelectorAll(".cal-weekday");
    const labels = Array.from(headers).map((el) => el.textContent);
    expect(labels).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("AC-I18N-2: ZH weekday header (Sun-first default) renders 周日..周六", () => {
    render(<CalendarModule lang="zh" />);
    const headers = document.querySelectorAll(".cal-weekday");
    const labels = Array.from(headers).map((el) => el.textContent);
    expect(labels).toEqual(["周日", "周一", "周二", "周三", "周四", "周五", "周六"]);
  });

  it("AC-I18N-3: today button text — EN Today / ZH 今天", () => {
    const { rerender } = render(<CalendarModule lang="en" />);
    expect(screen.getByTestId("cal-today").textContent).toBe("Today");
    rerender(<CalendarModule lang="zh" />);
    expect(screen.getByTestId("cal-today").textContent).toBe("今天");
  });

  it("AC-I18N-4: holiday May 1 — EN 'Labor Day' / ZH '劳动节'", () => {
    const { rerender, container } = render(<CalendarModule lang="en" />);
    const may1En = container.querySelector('[data-date="2026-05-01"] .cal-holiday');
    expect(may1En?.textContent).toBe("Labor Day");
    rerender(<CalendarModule lang="zh" />);
    const may1Zh = container.querySelector('[data-date="2026-05-01"] .cal-holiday');
    expect(may1Zh?.textContent).toBe("劳动节");
  });

  it("AC-I18N-5: holiday May 9 — EN 'Mother\\'s Day' / ZH '母亲节'", () => {
    const { rerender, container } = render(<CalendarModule lang="en" />);
    const may9En = container.querySelector('[data-date="2026-05-09"] .cal-holiday');
    expect(may9En?.textContent).toBe("Mother's Day");
    rerender(<CalendarModule lang="zh" />);
    const may9Zh = container.querySelector('[data-date="2026-05-09"] .cal-holiday');
    expect(may9Zh?.textContent).toBe("母亲节");
  });

  it("AC-I18N-6: coming-soon panel bilingual", () => {
    const { container, rerender } = render(<CalendarModule lang="en" />);
    const tabs = screen.getAllByRole("tab");
    tabs[1]?.click(); // Week
    rerender(<CalendarModule lang="en" />);
    expect(container.textContent).toContain("Week and Day views are coming soon.");
    rerender(<CalendarModule lang="zh" />);
    expect(container.textContent).toContain("周视图与日视图即将推出。");
  });
});

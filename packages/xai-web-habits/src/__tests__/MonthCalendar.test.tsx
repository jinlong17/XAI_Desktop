/**
 * AC-CAL-1..7: MonthCalendar tests.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import React, { useState } from "react";
import { MonthCalendar } from "../MonthCalendar.js";
import type { Habit, HabitId, DateKey } from "../types.js";

vi.useFakeTimers();
vi.setSystemTime(new Date("2026-05-23T12:00:00Z"));

afterEach(() => {
  vi.useRealTimers();
});

const testHabit: Habit = {
  id: "h_cal_test",
  emoji: "📅",
  title: { en: "Cal Test", zh: "日历测试" },
  createdAt: "2026-01-01T00:00:00.000Z",
};

function CalWrapper({
  checkIns = {},
  initialMonth = { year: 2026, month0: 3 }, // April 2026 (Apr 1 = Wed: 3 pre-pad + 30 days + 2 post-pad = 35)
  onToggle = () => {},
}: {
  checkIns?: Record<DateKey, true>;
  initialMonth?: { year: number; month0: number };
  onToggle?: (id: HabitId, dk: DateKey) => void;
}) {
  const [month, setMonth] = useState(initialMonth);
  return (
    <MonthCalendar
      habit={testHabit}
      checkIns={checkIns}
      displayedMonth={month}
      weekStart="sun"
      today={new Date("2026-05-23T12:00:00Z")}
      lang="en"
      onToggle={onToggle}
      onPrevMonth={() => setMonth((m) => m.month0 === 0 ? { year: m.year - 1, month0: 11 } : { ...m, month0: m.month0 - 1 })}
      onNextMonth={() => setMonth((m) => m.month0 === 11 ? { year: m.year + 1, month0: 0 } : { ...m, month0: m.month0 + 1 })}
    />
  );
}

describe("MonthCalendar", () => {
  it("AC-CAL-1: 35 cells, in-month count matches daysInMonth(2026, 3) = 30 (April 2026)", () => {
    render(<CalWrapper />);
    expect(document.querySelectorAll(".cal-cell")).toHaveLength(35);
    // April 2026: Apr 1 = Wed (DOW 3), weekStart=sun → paddingBefore=3, days=30, post=2 → total 35
    expect(document.querySelectorAll(".cal-cell.in")).toHaveLength(30);
  });

  it("AC-CAL-2: today cell absent in April 2026 (today=May 23)", () => {
    // April 2026 calendar: today is May 23 which is not in April, so no today cell
    render(<CalWrapper />);
    // today (May 23) is not in April, so it may appear as padding — but .today class only shows if dateKey matches todayKey
    // May 23 is post-padding in April display → expect 0 or 1 depending on implementation
    // Our implementation: non-in-month cells do NOT get .today (checked: isToday checks dateKey regardless)
    // May 23 2026 would be in post-padding (May 1-2 are post-padding for April). May 23 is outside the 35 cells.
    // So expect 0 today cells.
    expect(document.querySelectorAll(".cal-cell.today")).toHaveLength(0);
  });

  it("AC-CAL-2b: today cell shown when viewing current month (May 2026)", () => {
    render(<CalWrapper initialMonth={{ year: 2026, month0: 4 }} />);
    // May 2026: paddingBefore=5, 31 days = 36 > 35, so last day cut. May 23 should still be visible (23+5=28th cell ≤ 35).
    expect(document.querySelectorAll(".cal-cell.today")).toHaveLength(1);
  });

  it("AC-CAL-3: checked date shows .checked class", () => {
    const checkIns: Record<DateKey, true> = { "2026-04-10": true };
    render(<CalWrapper checkIns={checkIns} />);
    const checked = document.querySelectorAll(".cal-cell.checked");
    expect(checked.length).toBeGreaterThan(0);
  });

  it("AC-CAL-4: < prev button decrements to March, > next increments to May", async () => {
    render(<CalWrapper />);
    const h3 = document.querySelector("h3")!;
    expect(h3.textContent).toContain("Apr");

    const buttons = document.querySelectorAll(".month-cal .icon-btn");
    // First button is prev, second is next
    await act(async () => { fireEvent.click(buttons[0]!); }); // prev → March
    expect(document.querySelector("h3")!.textContent).toContain("Mar");
    await act(async () => { fireEvent.click(document.querySelectorAll(".month-cal .icon-btn")[1]!); }); // next → April
    await act(async () => { fireEvent.click(document.querySelectorAll(".month-cal .icon-btn")[1]!); }); // next → May
    expect(document.querySelector("h3")!.textContent).toContain("May");
  });

  it("AC-CAL-5: year rollover from Jan 2026 → Dec 2025", async () => {
    render(<CalWrapper initialMonth={{ year: 2026, month0: 0 }} />);
    const prevBtn = document.querySelectorAll(".month-cal .icon-btn")[0]!;
    await act(async () => { fireEvent.click(prevBtn); });
    const h3 = document.querySelector("h3")!;
    expect(h3.textContent).toContain("Dec");
    // Year should be 2025 in EN label: "Dec 2025"
    expect(h3.textContent).toContain("2025");
  });

  it("AC-CAL-6: weekStart=sun header starts with Sun (EN)", () => {
    render(<CalWrapper />);
    const headers = document.querySelectorAll(".cal-h");
    expect(headers[0]?.textContent).toBe("Sun");
  });

  it("AC-CAL-7: clicking in-month cell calls onToggle", async () => {
    const toggleMock = vi.fn();
    render(<CalWrapper onToggle={toggleMock} />);
    const inMonthCell = document.querySelector(".cal-cell.in");
    await act(async () => { fireEvent.click(inMonthCell!); });
    expect(toggleMock).toHaveBeenCalledTimes(1);
    expect(toggleMock).toHaveBeenCalledWith("h_cal_test", expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });
});

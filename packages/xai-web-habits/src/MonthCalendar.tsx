/**
 * MonthCalendar — 5×7 month grid with month-nav, check rings, and today highlight.
 *
 * Design: design.md §3 (progress-card / month-cal section)
 * - 35 cells (5 rows × 7 cols); pre/post padding with adjacent-month dates.
 * - In-month cells have `.in` class; today has `.today`; checked dates show ring via `.checked`.
 * - Clicking an in-month cell toggles that date's check-in.
 *
 * D3: weekStart prop (default "sun"; Settings W4 may flip to "mon").
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Habit, HabitId, DateKey, WeekStart } from "./types.js";
import { ArrowLIcon, ArrowRIcon } from "./internal/icons.js";
import { daysInMonth, utcDateKey, pad2 } from "./internal/dateKeys.js";

interface MonthCalendarProps {
  habit: Habit;
  checkIns: Readonly<Record<DateKey, true>>;
  displayedMonth: { year: number; month0: number };
  weekStart: WeekStart;
  today: Date;
  lang: Lang;
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthCalendar({
  habit,
  checkIns,
  displayedMonth,
  weekStart,
  today,
  lang,
  onToggle,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const { t } = useI18n(lang);
  const { year, month0 } = displayedMonth;
  const todayKey = utcDateKey(today);

  // Month name label
  const monthNames = [
    t.common.jan, t.common.feb, t.common.mar, t.common.apr,
    t.common.may, t.common.jun, t.common.jul, t.common.aug,
    t.common.sep, t.common.oct, t.common.nov, t.common.dec,
  ];
  const monthLabel = lang === "zh"
    ? `${month0 + 1} 月`
    : `${monthNames[month0] ?? ""} ${year}`;

  // Weekday header labels (ordered by weekStart)
  const allWeekdays = lang === "zh"
    ? ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // weekStart="sun": 0,1,2,3,4,5,6 → Sun first
  // weekStart="mon": 1,2,3,4,5,6,0 → Mon first
  const startDow = weekStart === "sun" ? 0 : 1;
  const headerLabels: string[] = [];
  for (let i = 0; i < 7; i++) {
    headerLabels.push(allWeekdays[(startDow + i) % 7]!);
  }

  // Build the 35-cell grid
  const firstDay = new Date(Date.UTC(year, month0, 1));
  const firstDow = firstDay.getUTCDay(); // 0=Sun
  // How many padding cells before the 1st?
  const paddingBefore = ((firstDow - startDow) + 7) % 7;

  const numDays = daysInMonth(year, month0);
  const cells: Array<{ day: number; inMonth: boolean; dateKey: DateKey }> = [];

  // Pre-padding (days from previous month)
  const prevMonth0 = month0 === 0 ? 11 : month0 - 1;
  const prevYear = month0 === 0 ? year - 1 : year;
  const prevMonthDays = daysInMonth(prevYear, prevMonth0);
  for (let i = 0; i < paddingBefore; i++) {
    const d = prevMonthDays - paddingBefore + 1 + i;
    const dk = `${prevYear}-${pad2(prevMonth0 + 1)}-${pad2(d)}`;
    cells.push({ day: d, inMonth: false, dateKey: dk });
  }

  // Current month
  for (let d = 1; d <= numDays; d++) {
    const dk = `${year}-${pad2(month0 + 1)}-${pad2(d)}`;
    cells.push({ day: d, inMonth: true, dateKey: dk });
  }

  // Post-padding — always emit exactly 35 cells total (5 rows × 7 cols).
  // If paddingBefore + numDays already ≥ 35, truncate to 35 (no overflow rows).
  const nextMonth0 = month0 === 11 ? 0 : month0 + 1;
  const nextYear = month0 === 11 ? year + 1 : year;
  let nextDay = 1;
  while (cells.length < 35) {
    const dk = `${nextYear}-${pad2(nextMonth0 + 1)}-${pad2(nextDay)}`;
    cells.push({ day: nextDay, inMonth: false, dateKey: dk });
    nextDay++;
  }
  // Truncate any overflow (can happen when paddingBefore + numDays > 35)
  if (cells.length > 35) {
    cells.splice(35);
  }

  return (
    <div className="month-cal">
      <header>
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "上个月" : "Previous month"}
          onClick={onPrevMonth}
        >
          <ArrowLIcon size={14} />
        </button>
        <h3>{monthLabel}</h3>
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "下个月" : "Next month"}
          onClick={onNextMonth}
        >
          <ArrowRIcon size={14} />
        </button>
      </header>
      <div className="cal-grid">
        {headerLabels.map((label, i) => (
          <div key={i} className="cal-h">{label}</div>
        ))}
        {cells.map((cell, i) => {
          const isToday = cell.dateKey === todayKey;
          const isChecked = cell.inMonth && checkIns[cell.dateKey] === true;
          return (
            <div
              key={i}
              className={
                "cal-cell" +
                (cell.inMonth ? " in" : "") +
                (isToday ? " today" : "") +
                (isChecked ? " checked" : "")
              }
              onClick={cell.inMonth ? () => onToggle(habit.id, cell.dateKey) : undefined}
              role={cell.inMonth ? "button" : undefined}
              tabIndex={cell.inMonth ? 0 : undefined}
              onKeyDown={cell.inMonth ? (e) => {
                if (e.key === "Enter" || e.key === " ") onToggle(habit.id, cell.dateKey);
              } : undefined}
              aria-label={cell.inMonth ? cell.dateKey : undefined}
              aria-pressed={cell.inMonth ? isChecked : undefined}
            >
              <div className="cal-num">{cell.day}</div>
              <div className="cal-ring" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

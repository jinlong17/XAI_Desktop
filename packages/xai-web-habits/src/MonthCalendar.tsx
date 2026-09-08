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
import { ArrowLIcon, ArrowRIcon, CheckIcon } from "./internal/icons.js";
import { utcDateKey } from "./internal/dateKeys.js";
import { buildMonthGrid } from "./internal/monthGrid.js";
import { habitColorCss } from "./internal/habitMeta.js";

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
  const color = habitColorCss(habit.color);

  // Month name label
  const monthNames = [
    t.common.jan, t.common.feb, t.common.mar, t.common.apr,
    t.common.may, t.common.jun, t.common.jul, t.common.aug,
    t.common.sep, t.common.oct, t.common.nov, t.common.dec,
  ];
  const monthLabel = lang === "zh"
    ? `${year} 年 ${month0 + 1} 月`
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

  const cells = buildMonthGrid(year, month0, weekStart);

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
      <div className="cal-grid" style={{ "--habit-color": color } as React.CSSProperties}>
        {headerLabels.map((label, i) => (
          <div key={i} className="cal-h">{label}</div>
        ))}
        {cells.map((cell, i) => {
          const isToday = cell.dateKey === todayKey;
          const isChecked = cell.inMonth && checkIns[cell.dateKey] === true;
          const status = isChecked
            ? (lang === "zh" ? "已完成" : "Completed")
            : (lang === "zh" ? "未完成" : "Not completed");
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
              aria-label={cell.inMonth ? `${cell.dateKey} ${status}` : undefined}
              aria-pressed={cell.inMonth ? isChecked : undefined}
              data-tooltip={cell.inMonth ? `${cell.dateKey}\n${status}` : undefined}
            >
              <div className="cal-num">{cell.day}</div>
              <div className="cal-ring">
                {isChecked && <CheckIcon size={9} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

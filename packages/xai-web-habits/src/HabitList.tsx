/**
 * HabitList — left pane of the Habits module.
 *
 * Renders: header (title + view-toggle + add-button + dots) + week-strip header
 * + scrollable habit rows.
 *
 * Design: design.md §3
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Habit, HabitId, DateKey, WeekStart } from "./types.js";
import { HabitRow } from "./HabitRow.js";
import { PlusIcon, DotsIcon, ListIcon, Grid4Icon } from "./internal/icons.js";
import { weekDates as computeWeekDates, utcDateKey } from "./internal/dateKeys.js";

interface HabitListProps {
  habits: ReadonlyArray<Habit>;
  checkIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  selectedId: HabitId;
  lang: Lang;
  weekStart: WeekStart;
  onSelect: (id: HabitId) => void;
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
  onAddHabit: () => void;
}

export function HabitList({
  habits,
  checkIns,
  selectedId,
  lang,
  weekStart,
  onSelect,
  onToggle,
  onAddHabit,
}: HabitListProps) {
  const { s } = useI18n(lang);
  const now = new Date();
  const weekDatesArr = computeWeekDates(now, weekStart);
  const todayKey = utcDateKey(now);

  // Weekday short labels — follow the language setting
  const weekdayLabels = lang === "zh"
    ? ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Map each week date to its short label
  const displayedLabels = weekDatesArr.map((d) => {
    const dow = d.getUTCDay(); // 0=Sun
    return weekdayLabels[dow] ?? "";
  });

  return (
    <section className="habits-list panel">
      <header className="module-head module-head-inline">
        <h1 className="module-title">{s("habits.title")}</h1>
        <span className="grow" />
        <div className="seg">
          <button
            type="button"
            aria-selected={true}
            aria-label={lang === "zh" ? "列表视图" : "List view"}
          >
            <ListIcon size={13} />
          </button>
          <button
            type="button"
            aria-selected={false}
            aria-label={lang === "zh" ? "网格视图" : "Grid view"}
          >
            <Grid4Icon size={13} />
          </button>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "添加习惯" : "Add habit"}
          onClick={onAddHabit}
        >
          <PlusIcon size={16} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "更多" : "More"}
        >
          <DotsIcon size={16} />
        </button>
      </header>

      <div className="week-header">
        {displayedLabels.map((label, i) => {
          const dk = utcDateKey(weekDatesArr[i]!);
          const isToday = dk === todayKey;
          return (
            <div key={i} className={"weekday" + (isToday ? " today" : "")}>
              <div className="wd-name">{label}</div>
              <div className="wd-num">{weekDatesArr[i]!.getUTCDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="habit-rows">
        {habits.map((h) => (
          <HabitRow
            key={h.id}
            habit={h}
            checkIns={checkIns[h.id] ?? {}}
            weekDatesArr={weekDatesArr}
            selected={h.id === selectedId}
            lang={lang}
            weekStart={weekStart}
            onSelect={onSelect}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}

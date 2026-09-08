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
import type { Habit, HabitId, DateKey, WeekStart, HabitViewMode } from "./types.js";
import { HabitRow } from "./HabitRow.js";
import { PlusIcon, DotsIcon, ListIcon, Grid4Icon, TargetIcon, BoltIcon } from "./internal/icons.js";
import { weekDates as computeWeekDates, utcDateKey } from "./internal/dateKeys.js";

interface HabitListProps {
  habits: ReadonlyArray<Habit>;
  checkIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  selectedId: HabitId;
  viewMode: HabitViewMode;
  lang: Lang;
  weekStart: WeekStart;
  onSelect: (id: HabitId) => void;
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
  onViewModeChange: (mode: HabitViewMode) => void;
  onAddHabit: () => void;
}

function completionLevel(done: number, total: number): number {
  if (total <= 0 || done <= 0) return 0;
  return Math.max(1, Math.min(4, Math.ceil((done / total) * 4)));
}

export function HabitList({
  habits,
  checkIns,
  selectedId,
  viewMode,
  lang,
  weekStart,
  onSelect,
  onToggle,
  onViewModeChange,
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

  const viewChoices: readonly {
    mode: HabitViewMode;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      mode: "list",
      label: lang === "zh" ? "列表" : "List",
      icon: <ListIcon size={13} />,
    },
    {
      mode: "calendar",
      label: lang === "zh" ? "日历" : "Calendar",
      icon: <Grid4Icon size={13} />,
    },
    {
      mode: "stats",
      label: lang === "zh" ? "统计" : "Stats",
      icon: <BoltIcon size={13} />,
    },
    {
      mode: "all",
      label: lang === "zh" ? "全部" : "All",
      icon: <TargetIcon size={13} />,
    },
  ];

  const completedToday = habits.filter((h) => checkIns[h.id]?.[todayKey] === true).length;

  return (
    <section className="habits-list panel">
      <header className="module-head module-head-inline">
        <h1 className="module-title">{s("habits.title")}</h1>
        <span className="grow" />
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

      <div className="habit-view-tabs" role="tablist" aria-label={lang === "zh" ? "习惯视图" : "Habit views"}>
        {viewChoices.map((choice) => (
          <button
            key={choice.mode}
            type="button"
            aria-selected={viewMode === choice.mode}
            onClick={() => onViewModeChange(choice.mode)}
          >
            {choice.icon}
            <span>{choice.label}</span>
          </button>
        ))}
      </div>

      <div className="week-header">
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <div className="week-strip-head">
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
      </div>

      <div className="habit-rows">
        <button
          type="button"
          className={"habit-all-row" + (viewMode === "all" ? " active" : "")}
          onClick={() => onViewModeChange("all")}
        >
          <span
            className="habit-icon-wrap"
            style={{ "--habit-color": "var(--accent)" } as React.CSSProperties}
          >
            <TargetIcon size={18} />
          </span>
          <span className="habit-row-body">
            <span className="habit-title">{lang === "zh" ? "全部习惯" : "All Habits"}</span>
            <span className="habit-stats">
              {completedToday}/{habits.length} {lang === "zh" ? "今日完成" : "completed today"}
            </span>
          </span>
          <span className="habit-all-week" aria-hidden="true">
            {weekDatesArr.map((date, i) => {
              const dk = utcDateKey(date);
              const done = habits.filter((habit) => checkIns[habit.id]?.[dk] === true).length;
              const level = completionLevel(done, habits.length);
              const isToday = dk === todayKey;
              return (
              <span
                key={i}
                className={`all-hcell level-${level}` + (isToday ? " today" : "")}
              />
              );
            })}
          </span>
        </button>
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

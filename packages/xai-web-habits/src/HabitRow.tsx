/**
 * HabitRow — single habit row in the left pane.
 *
 * Renders: emoji + bilingual title + stats (total + streak) + 7-cell week strip.
 *
 * Design: design.md §3
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Habit, HabitId, DateKey, WeekStart } from "./types.js";
import { BoltIcon, FireIcon, CheckIcon } from "./internal/icons.js";
import { utcDateKey } from "./internal/dateKeys.js";
import { computeStreak } from "./internal/computeStreak.js";

interface HabitRowProps {
  habit: Habit;
  checkIns: Readonly<Record<DateKey, true>>;
  weekDatesArr: Date[];
  selected: boolean;
  lang: Lang;
  weekStart: WeekStart;
  onSelect: (id: HabitId) => void;
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
}

export function HabitRow({
  habit,
  checkIns,
  weekDatesArr,
  selected,
  lang,
  onSelect,
  onToggle,
}: HabitRowProps) {
  const { s } = useI18n(lang);
  const today = new Date();
  const todayKey = utcDateKey(today);
  const totalCount = Object.keys(checkIns).length;
  const streak = computeStreak(checkIns, today);

  return (
    <div
      className={"habit-row" + (selected ? " active" : "")}
      onClick={() => onSelect(habit.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(habit.id); }}
      aria-selected={selected}
    >
      <div className="habit-emoji">{habit.emoji}</div>
      <div className="habit-row-body">
        <div className="habit-title">{habit.title[lang]}</div>
        <div className="habit-stats">
          <BoltIcon size={12} />
          {" "}
          <span>{totalCount} {s("common.days")}</span>
          <FireIcon size={12} style={{ marginLeft: 8 }} />
          {" "}
          <span>{streak} {s("common.day")}</span>
        </div>
      </div>
      <div className="habit-week">
        {weekDatesArr.map((d, i) => {
          const dk = utcDateKey(d);
          const checked = checkIns[dk] === true;
          const isToday = dk === todayKey;
          return (
            <button
              key={i}
              type="button"
              className={"hcell" + (checked ? " on" : "") + (isToday ? " today" : "")}
              aria-label={`${dk}${checked ? " checked" : ""}`}
              aria-pressed={checked}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(habit.id, dk);
              }}
            >
              {checked && <CheckIcon size={10} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

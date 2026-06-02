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
import {
  HabitIcon,
  habitColorCss,
  habitIconName,
  labelForCategory,
  labelForFrequency,
} from "./internal/habitMeta.js";

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
  const color = habitColorCss(habit.color);
  const iconName = habitIconName(habit);
  const title = habit.title[lang];
  const categoryLabel = labelForCategory(habit.category, lang);
  const frequencyLabel = labelForFrequency(habit.frequency?.type, lang);

  return (
    <div
      className={"habit-row" + (selected ? " active" : "")}
      style={{ "--habit-color": color } as React.CSSProperties}
      onClick={() => onSelect(habit.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(habit.id); }}
      aria-selected={selected}
    >
      <div className="habit-icon-wrap habit-emoji">
        <HabitIcon name={iconName} size={18} />
      </div>
      <div className="habit-row-body">
        <div className="habit-title">{title}</div>
        <div className="habit-stats">
          <span className="habit-meta-pill">{categoryLabel}</span>
          <span>{frequencyLabel}</span>
          <BoltIcon size={11} />
          <span>{totalCount}</span>
          <FireIcon size={11} />
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
              style={{ "--habit-color": color } as React.CSSProperties}
              aria-label={`${dk} ${title} ${checked ? "checked" : "not checked"}`}
              aria-pressed={checked}
              data-tooltip={`${dk}\n${title} ${checked ? (lang === "zh" ? "已完成" : "completed") : (lang === "zh" ? "未完成" : "not completed")}`}
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

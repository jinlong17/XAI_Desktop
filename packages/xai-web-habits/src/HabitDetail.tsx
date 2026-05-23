/**
 * HabitDetail — right pane of the Habits module.
 *
 * Renders: detail header (emoji + title + dots) + 4 stat cards + progress card
 * (6/365 mono numerator + medal SVG + month calendar) + diary card.
 *
 * Design: design.md §3 (HabitDetail composition)
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Habit, HabitId, DateKey, MonthKey, WeekStart } from "./types.js";
import { StatCard } from "./StatCard.js";
import { MonthCalendar } from "./MonthCalendar.js";
import { DiaryCard } from "./DiaryCard.js";
import { DotsIcon } from "./internal/icons.js";
import { computeMonthlyCount, computeMonthlyRate, compute365 } from "./internal/computeStats.js";
import { computeStreak } from "./internal/computeStreak.js";
import { monthKey as toMonthKey } from "./internal/dateKeys.js";

interface HabitDetailProps {
  habit: Habit | undefined;
  checkIns: Readonly<Record<DateKey, true>>;
  diary: Readonly<Record<MonthKey, string>>;
  lang: Lang;
  weekStart: WeekStart;
  displayedMonth: { year: number; month0: number };
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  setDiary: (habitId: HabitId, mk: MonthKey, text: string) => void;
}

/** Goal medal SVG (inline, from prototype). */
function GoalMedal() {
  return (
    <svg viewBox="0 0 60 60" width="56" height="56" aria-hidden="true">
      <defs>
        <linearGradient id="med-habit" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="oklch(95% 0.02 165)" />
          <stop offset="1" stopColor="oklch(82% 0.05 165)" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="22" fill="url(#med-habit)"
        stroke="oklch(75% 0.05 165)" strokeWidth="1" />
      <path d="M22 30l5 5 11-11" fill="none" stroke="oklch(55% 0.10 165)"
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HabitDetail({
  habit,
  checkIns,
  diary,
  lang,
  weekStart,
  displayedMonth,
  onToggle,
  onPrevMonth,
  onNextMonth,
  setDiary,
}: HabitDetailProps) {
  const { s } = useI18n(lang);
  const now = new Date();

  if (!habit) {
    return (
      <section className="habits-detail">
        <div className="detail-empty">
          {lang === "zh" ? "请选择一个习惯" : "Select a habit"}
        </div>
      </section>
    );
  }

  const monthlyCount = computeMonthlyCount(checkIns, now);
  const totalCount = Object.keys(checkIns).length;
  const monthlyRate = computeMonthlyRate(checkIns, now);
  const streak = computeStreak(checkIns, now);
  const { numerator, denominator } = compute365(checkIns, now);

  const displayedDate = new Date(Date.UTC(displayedMonth.year, displayedMonth.month0, 1));
  const mk = toMonthKey(displayedDate);
  const diaryText = diary[mk] ?? "";

  return (
    <section className="habits-detail">
      <header className="detail-head">
        <span className="habit-emoji-lg">{habit.emoji}</span>
        <h2 className="detail-title">{habit.title[lang]}</h2>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "更多" : "More"}
        >
          <DotsIcon size={16} />
        </button>
      </header>

      <div className="stat-grid">
        <StatCard
          icon="check"
          color="var(--accent)"
          label={s("habits.monthly_checkins")}
          value={monthlyCount}
          unit={s("common.day")}
        />
        <StatCard
          icon="bolt"
          color="var(--blue)"
          label={s("habits.total_checkins")}
          value={totalCount}
          unit={s("common.days")}
        />
        <StatCard
          icon="target"
          color="var(--amber)"
          label={s("habits.monthly_rate")}
          value={monthlyRate}
          unit="%"
        />
        <StatCard
          icon="fire"
          color="var(--red)"
          label={s("habits.streak")}
          value={streak}
          unit={s("common.day")}
        />
      </div>

      <div className="progress-card panel">
        <div className="progress-head">
          <div>
            <div className="progress-num mono">{numerator}/{denominator}</div>
            <div className="progress-sub">
              {denominator - numerator} {s("common.days")}
            </div>
          </div>
          <div className="grow" />
          <div className="goal-medal">
            <GoalMedal />
          </div>
        </div>
        <MonthCalendar
          habit={habit}
          checkIns={checkIns}
          displayedMonth={displayedMonth}
          weekStart={weekStart}
          today={now}
          lang={lang}
          onToggle={onToggle}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
        />
      </div>

      <DiaryCard
        habitId={habit.id}
        monthKey={mk}
        value={diaryText}
        setValue={setDiary}
        emptyHint={s("habits.empty_log")}
        lang={lang}
      />
    </section>
  );
}

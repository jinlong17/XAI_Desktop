import { useLocalDayClock } from "@repo/plugin-web-tokens";
/**
 * HabitDetail — right-pane view router for the Habits module.
 *
 * Supports four real modes: list, single-habit calendar, statistics, and all
 * habits month view.
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type {
  DateKey,
  Habit,
  HabitId,
  HabitViewMode,
  MonthKey,
  WeekStart,
} from "./types.js";
import { StatCard } from "./StatCard.js";
import { MonthCalendar } from "./MonthCalendar.js";
import { DiaryCard } from "./DiaryCard.js";
import { DotsIcon, CheckIcon, FireIcon, BoltIcon, TargetIcon, ArrowLIcon, ArrowRIcon } from "./internal/icons.js";
import { computeMonthlyCount, computeMonthlyRate, compute365 } from "./internal/computeStats.js";
import { computeStreak } from "./internal/computeStreak.js";
import { monthKey as toMonthKey, utcDateKey } from "./internal/dateKeys.js";
import { buildMonthGrid } from "./internal/monthGrid.js";
import {
  HabitIcon,
  habitColorCss,
  habitIconName,
  labelForCategory,
  labelForFrequency,
} from "./internal/habitMeta.js";

interface HabitDetailProps {
  habit: Habit | undefined;
  habits: ReadonlyArray<Habit>;
  checkIns: Readonly<Record<DateKey, true>>;
  allCheckIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  diary: Readonly<Record<MonthKey, string>>;
  lang: Lang;
  weekStart: WeekStart;
  viewMode: HabitViewMode;
  displayedMonth: { year: number; month0: number };
  onSelect: (habitId: HabitId) => void;
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  setDiary: (habitId: HabitId, mk: MonthKey, text: string) => void;
}

const COPY = {
  en: {
    allHabits: "All Habits",
    allSub: "Monthly completion across every active habit.",
    list: "List View",
    listSub: "Manage cadence, reminders, and today's check-in.",
    stats: "Statistics",
    statsSub: "Streaks, completion rate, and recent consistency.",
    calendarSub: "Month calendar and streak detail.",
    completed: "Completed",
    notCompleted: "Not completed",
    completedToday: "Completed today",
    activeHabits: "Active habits",
    monthChecks: "Month checks",
    bestStreak: "Best streak",
    monthRate: "Month rate",
    currentStreak: "Current streak",
    startDate: "Start",
    reminder: "Reminder",
    off: "Off",
    today: "Today",
    checkToday: "Check today",
    undoToday: "Undo today",
    leaderboard: "Leaderboard",
    recentHeatmap: "Recent heatmap",
    noHabits: "Create a habit to start tracking.",
    legendDone: "done",
    legendMissed: "missed",
    milestone7: "7 day streak",
    milestone30: "30 day streak",
    milestone100: "100 day streak",
  },
  zh: {
    allHabits: "全部习惯",
    allSub: "查看本月所有习惯的完成情况。",
    list: "列表视图",
    listSub: "管理频率、提醒与今日打卡。",
    stats: "统计视图",
    statsSub: "查看连续打卡、完成率与近期稳定性。",
    calendarSub: "月历与连续打卡详情。",
    completed: "已完成",
    notCompleted: "未完成",
    completedToday: "今日完成",
    activeHabits: "活跃习惯",
    monthChecks: "本月打卡",
    bestStreak: "最佳连续",
    monthRate: "本月完成率",
    currentStreak: "当前连续",
    startDate: "开始",
    reminder: "提醒",
    off: "关闭",
    today: "今天",
    checkToday: "今日打卡",
    undoToday: "取消今日",
    leaderboard: "习惯排行",
    recentHeatmap: "近期热力图",
    noHabits: "新建一个习惯后开始追踪。",
    legendDone: "已完成",
    legendMissed: "未完成",
    milestone7: "连续 7 天",
    milestone30: "连续 30 天",
    milestone100: "连续 100 天",
  },
} as const;

const MAX_ALL_HABIT_DOTS = 20;

function titleFor(habit: Habit, lang: Lang): string {
  return habit.title[lang] || habit.title.en || habit.title.zh;
}

function monthPrefix(displayedMonth: { year: number; month0: number }): string {
  return `${displayedMonth.year}-${String(displayedMonth.month0 + 1).padStart(2, "0")}-`;
}

function countForMonth(checkIns: Readonly<Record<DateKey, true>>, displayedMonth: { year: number; month0: number }): number {
  const prefix = monthPrefix(displayedMonth);
  return Object.keys(checkIns).filter((key) => key.startsWith(prefix)).length;
}

function monthLabel(lang: Lang, monthNames: readonly string[], displayedMonth: { year: number; month0: number }): string {
  return lang === "zh"
    ? `${displayedMonth.year} 年 ${displayedMonth.month0 + 1} 月`
    : `${monthNames[displayedMonth.month0] ?? ""} ${displayedMonth.year}`;
}

function aggregateMonthCount(
  habits: ReadonlyArray<Habit>,
  allCheckIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>,
  displayedMonth: { year: number; month0: number },
): number {
  return habits.reduce((total, habit) => total + countForMonth(allCheckIns[habit.id] ?? {}, displayedMonth), 0);
}

function elapsedDaysForMonth(today: Date, displayedMonth: { year: number; month0: number }): number {
  if (today.getFullYear() === displayedMonth.year && today.getMonth() === displayedMonth.month0) {
    return today.getDate();
  }
  return new Date(displayedMonth.year, displayedMonth.month0 + 1, 0).getDate();
}

function buildRecentDays(days: number, today: Date): Date[] {
  const result: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    result.push(new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - i,
    ));
  }
  return result;
}

function completionLevel(done: number, total: number): number {
  if (total <= 0 || done <= 0) return 0;
  return Math.max(1, Math.min(4, Math.ceil((done / total) * 4)));
}

function StreakBadges({ streak, lang }: { streak: number; lang: Lang }) {
  const c = COPY[lang];
  const milestones = [
    { value: 7, label: c.milestone7 },
    { value: 30, label: c.milestone30 },
    { value: 100, label: c.milestone100 },
  ];
  return (
    <div className="streak-badges" aria-label={c.currentStreak}>
      {milestones.map((milestone) => (
        <span
          key={milestone.value}
          className={"streak-badge" + (streak >= milestone.value ? " achieved" : "")}
        >
          <FireIcon size={12} />
          {milestone.label}
        </span>
      ))}
    </div>
  );
}

function HabitAvatar({ habit, size = 18 }: { habit: Habit; size?: number }) {
  return (
    <span
      className="habit-icon-wrap"
      style={{ "--habit-color": habitColorCss(habit.color) } as React.CSSProperties}
    >
      <HabitIcon name={habitIconName(habit)} size={size} />
    </span>
  );
}

export function HabitDetail({
  habit,
  habits,
  checkIns,
  allCheckIns,
  diary,
  lang,
  weekStart,
  viewMode,
  displayedMonth,
  onSelect,
  onToggle,
  onPrevMonth,
  onNextMonth,
  setDiary,
}: HabitDetailProps) {
  const { s } = useI18n(lang);
  const { now } = useLocalDayClock();

  if (viewMode === "all") {
    return (
      <AllHabitsView
        habits={habits}
        allCheckIns={allCheckIns}
        displayedMonth={displayedMonth}
        weekStart={weekStart}
        today={now}
        lang={lang}
        onToggle={onToggle}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
    );
  }

  if (viewMode === "list") {
    return (
      <HabitsListView
        habits={habits}
        allCheckIns={allCheckIns}
        displayedMonth={displayedMonth}
        today={now}
        lang={lang}
        onSelect={onSelect}
        onToggle={onToggle}
      />
    );
  }

  if (viewMode === "stats") {
    return (
      <HabitStatsView
        habits={habits}
        allCheckIns={allCheckIns}
        displayedMonth={displayedMonth}
        today={now}
        lang={lang}
      />
    );
  }

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
  const displayedDate = new Date(displayedMonth.year, displayedMonth.month0, 1);
  const mk = toMonthKey(displayedDate);
  const diaryText = diary[mk] ?? "";
  const c = COPY[lang];

  return (
    <section className="habits-detail">
      <header className="detail-head">
        <HabitAvatar habit={habit} size={21} />
        <div className="detail-title-stack">
          <h2 className="detail-title">{titleFor(habit, lang)}</h2>
          <p className="detail-subtitle">
            {labelForCategory(habit.category, lang)} · {labelForFrequency(habit.frequency?.type, lang)} · {c.calendarSub}
          </p>
        </div>
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
          color={habitColorCss(habit.color)}
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

      <StreakBadges streak={streak} lang={lang} />

      <div className="progress-card panel">
        <div className="progress-head">
          <div>
            <div className="progress-num mono">{numerator}/{denominator}</div>
            <div className="progress-sub">
              {denominator - numerator} {s("common.days")}
            </div>
          </div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${Math.round((numerator / denominator) * 100)}%` }} />
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

function HabitsListView({
  habits,
  allCheckIns,
  displayedMonth,
  today,
  lang,
  onSelect,
  onToggle,
}: {
  habits: ReadonlyArray<Habit>;
  allCheckIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  displayedMonth: { year: number; month0: number };
  today: Date;
  lang: Lang;
  onSelect: (habitId: HabitId) => void;
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
}) {
  const c = COPY[lang];
  const todayKey = utcDateKey(today);

  return (
    <section className="habits-detail">
      <ViewHeader title={c.list} subtitle={c.listSub} />
      <div className="habit-directory-grid">
        {habits.length === 0 && <p className="detail-empty">{c.noHabits}</p>}
        {habits.map((habit) => {
          const habitCheckIns = allCheckIns[habit.id] ?? {};
          const checkedToday = habitCheckIns[todayKey] === true;
          const streak = computeStreak(habitCheckIns, today);
          const monthCount = countForMonth(habitCheckIns, displayedMonth);
          return (
            <article
              key={habit.id}
              className="habit-directory-card panel"
              style={{ "--habit-color": habitColorCss(habit.color) } as React.CSSProperties}
            >
              <button type="button" className="habit-directory-main" onClick={() => onSelect(habit.id)}>
                <HabitAvatar habit={habit} />
                <span>
                  <strong>{titleFor(habit, lang)}</strong>
                  <small>{labelForCategory(habit.category, lang)} · {labelForFrequency(habit.frequency?.type, lang)}</small>
                </span>
              </button>
              <div className="habit-directory-meta">
                <span>{c.startDate}: {habit.startDate ?? habit.createdAt.slice(0, 10)}</span>
                <span>{c.reminder}: {habit.reminder?.enabled ? habit.reminder.time : c.off}</span>
              </div>
              <div className="habit-directory-stats">
                <span><BoltIcon size={12} /> {monthCount}</span>
                <span><FireIcon size={12} /> {streak}</span>
              </div>
              <button
                type="button"
                className={"hb-btn habit-today-btn" + (checkedToday ? " checked" : "")}
                onClick={() => onToggle(habit.id, todayKey)}
              >
                {checkedToday ? c.undoToday : c.checkToday}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HabitStatsView({
  habits,
  allCheckIns,
  displayedMonth,
  today,
  lang,
}: {
  habits: ReadonlyArray<Habit>;
  allCheckIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  displayedMonth: { year: number; month0: number };
  today: Date;
  lang: Lang;
}) {
  const { s } = useI18n(lang);
  const c = COPY[lang];
  const todayKey = utcDateKey(today);
  const completedToday = habits.filter((habit) => allCheckIns[habit.id]?.[todayKey] === true).length;
  const monthChecks = aggregateMonthCount(habits, allCheckIns, displayedMonth);
  const currentStreaks = habits.map((habit) => computeStreak(allCheckIns[habit.id] ?? {}, today));
  const maxStreak = currentStreaks.length > 0 ? Math.max(...currentStreaks) : 0;
  const elapsedDays = today.getFullYear() === displayedMonth.year && today.getMonth() === displayedMonth.month0
    ? today.getDate()
    : new Date(displayedMonth.year, displayedMonth.month0 + 1, 0).getDate();
  const possible = Math.max(1, habits.length * elapsedDays);
  const monthRate = Math.round((monthChecks / possible) * 100);
  const recentDays = buildRecentDays(112, today);
  const ranked = [...habits].sort((a, b) => {
    const bStreak = computeStreak(allCheckIns[b.id] ?? {}, today);
    const aStreak = computeStreak(allCheckIns[a.id] ?? {}, today);
    if (bStreak !== aStreak) return bStreak - aStreak;
    return countForMonth(allCheckIns[b.id] ?? {}, displayedMonth) - countForMonth(allCheckIns[a.id] ?? {}, displayedMonth);
  });

  return (
    <section className="habits-detail">
      <ViewHeader title={c.stats} subtitle={c.statsSub} />
      <div className="stat-grid">
        <StatCard icon="check" color="var(--accent)" label={c.completedToday} value={`${completedToday}/${habits.length}`} unit="" />
        <StatCard icon="bolt" color="var(--blue)" label={c.monthChecks} value={monthChecks} unit={s("common.days")} />
        <StatCard icon="fire" color="var(--red)" label={c.bestStreak} value={maxStreak} unit={s("common.day")} />
        <StatCard icon="target" color="var(--amber)" label={c.monthRate} value={monthRate} unit="%" />
      </div>

      <div className="stats-two-col">
        <section className="stats-panel panel">
          <h3>{c.leaderboard}</h3>
          <div className="habit-rank-list">
            {ranked.map((habit, index) => {
              const habitCheckIns = allCheckIns[habit.id] ?? {};
              return (
                <div key={habit.id} className="habit-rank-row">
                  <span className="rank-num">{index + 1}</span>
                  <HabitAvatar habit={habit} size={16} />
                  <span className="rank-title">{titleFor(habit, lang)}</span>
                  <span className="rank-metric"><FireIcon size={12} /> {computeStreak(habitCheckIns, today)}</span>
                  <span className="rank-metric"><BoltIcon size={12} /> {countForMonth(habitCheckIns, displayedMonth)}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="stats-panel panel">
          <h3>{c.recentHeatmap}</h3>
          <div className="habit-heatmap" aria-label={c.recentHeatmap}>
            {recentDays.map((day) => {
              const dk = utcDateKey(day);
              const done = habits.filter((habit) => allCheckIns[habit.id]?.[dk] === true).length;
              const level = completionLevel(done, habits.length);
              return (
                <span
                  key={dk}
                  className={`heat-cell heat-${level}`}
                  data-tooltip={`${dk}\n${done}/${habits.length} ${c.completed}`}
                />
              );
            })}
          </div>
        </section>
      </div>
    </section>
  );
}

function AllHabitsView({
  habits,
  allCheckIns,
  displayedMonth,
  weekStart,
  today,
  lang,
  onToggle,
  onPrevMonth,
  onNextMonth,
}: {
  habits: ReadonlyArray<Habit>;
  allCheckIns: Readonly<Record<HabitId, Readonly<Record<DateKey, true>>>>;
  displayedMonth: { year: number; month0: number };
  weekStart: WeekStart;
  today: Date;
  lang: Lang;
  onToggle: (habitId: HabitId, dateKey: DateKey) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const { t, s } = useI18n(lang);
  const c = COPY[lang];
  const todayKey = utcDateKey(today);
  const startDow = weekStart === "sun" ? 0 : 1;
  const headerLabels: string[] = [];
  const weekdayLabels = lang === "zh"
    ? ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    headerLabels.push(weekdayLabels[(startDow + i) % 7]!);
  }
  const monthNames = [
    t.common.jan, t.common.feb, t.common.mar, t.common.apr,
    t.common.may, t.common.jun, t.common.jul, t.common.aug,
    t.common.sep, t.common.oct, t.common.nov, t.common.dec,
  ];
  const cells = buildMonthGrid(displayedMonth.year, displayedMonth.month0, weekStart);
  const monthChecks = aggregateMonthCount(habits, allCheckIns, displayedMonth);
  const completedToday = habits.filter((habit) => allCheckIns[habit.id]?.[todayKey] === true).length;
  const currentStreaks = habits.map((habit) => computeStreak(allCheckIns[habit.id] ?? {}, today));
  const maxStreak = currentStreaks.length > 0 ? Math.max(...currentStreaks) : 0;
  const elapsedDays = elapsedDaysForMonth(today, displayedMonth);
  const possible = Math.max(1, habits.length * elapsedDays);
  const monthRate = Math.round((monthChecks / possible) * 100);

  return (
    <section className="habits-detail">
      <header className="detail-head all-view-head">
        <span
          className="habit-icon-wrap"
          style={{ "--habit-color": "var(--accent)" } as React.CSSProperties}
        >
          <TargetIcon size={21} />
        </span>
        <div className="detail-title-stack">
          <h2 className="detail-title">{c.allHabits}</h2>
          <p className="detail-subtitle">{c.allSub}</p>
        </div>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "更多" : "More"}
        >
          <DotsIcon size={16} />
        </button>
      </header>

      <div className="stat-grid all-stat-grid">
        <StatCard icon="check" color="var(--accent)" label={c.completedToday} value={`${completedToday}/${habits.length}`} unit="" />
        <StatCard icon="bolt" color="var(--blue)" label={c.monthChecks} value={monthChecks} unit={s("common.days")} />
        <StatCard icon="fire" color="var(--red)" label={c.bestStreak} value={maxStreak} unit={s("common.day")} />
        <StatCard icon="target" color="var(--amber)" label={c.monthRate} value={monthRate} unit="%" />
      </div>

      <div className="streak-badges all-summary-row" aria-label={c.allHabits}>
        <span className="streak-badge achieved"><CheckIcon size={12} /> {completedToday}/{habits.length} {c.completedToday}</span>
        <span className="streak-badge"><BoltIcon size={12} /> {monthChecks} {c.monthChecks}</span>
        <span className="streak-badge"><span className="legend-dot done" /> {c.legendDone}</span>
        <span className="streak-badge"><span className="legend-dot missed" /> {c.legendMissed}</span>
      </div>

      <div className="progress-card panel all-calendar-card">
        <div className="progress-head">
          <div>
            <div className="progress-num mono">{monthChecks}/{possible}</div>
            <div className="progress-sub">
              {possible - monthChecks} {s("common.days")}
            </div>
          </div>
          <div className="progress-bar" aria-hidden="true">
            <span style={{ width: `${monthRate}%` }} />
          </div>
        </div>
        <div className="month-cal all-month-cal">
          <header>
            <button type="button" className="icon-btn" onClick={onPrevMonth} aria-label={lang === "zh" ? "上个月" : "Previous month"}>
              <ArrowLIcon size={14} />
            </button>
            <h3>{monthLabel(lang, monthNames, displayedMonth)}</h3>
            <button type="button" className="icon-btn" onClick={onNextMonth} aria-label={lang === "zh" ? "下个月" : "Next month"}>
              <ArrowRIcon size={14} />
            </button>
          </header>
          <div className="all-month-grid cal-grid">
            {headerLabels.map((label) => (
              <div key={label} className="cal-h">{label}</div>
            ))}
            {cells.map((cell) => {
              const completed = habits.filter((habit) => cell.inMonth && allCheckIns[habit.id]?.[cell.dateKey] === true);
              const level = completionLevel(completed.length, habits.length);
              const completedNames = completed.map((habit) => titleFor(habit, lang)).join(", ");
              const tooltip = cell.inMonth
                ? `${cell.dateKey}\n${completed.length}/${habits.length} ${c.completed}${completedNames ? `\n${completedNames}` : ""}`
                : undefined;
              return (
                <div
                  key={cell.dateKey}
                  data-completion-level={level}
                  className={
                    "cal-cell all-cal-cell" +
                    (cell.inMonth ? " in" : "") +
                    (cell.dateKey === todayKey ? " today" : "")
                  }
                  data-tooltip={tooltip}
                >
                  <div className="cal-num all-cal-num">{cell.day}</div>
                  {cell.inMonth && (
                    <div className="cal-ring all-cal-ring">
                      <div className="all-habit-dots">
                        {habits.slice(0, MAX_ALL_HABIT_DOTS).map((habit) => {
                          const checked = allCheckIns[habit.id]?.[cell.dateKey] === true;
                          return (
                            <button
                              key={habit.id}
                              type="button"
                              className={"all-habit-dot" + (checked ? " done" : " missed")}
                              style={{ "--habit-color": habitColorCss(habit.color) } as React.CSSProperties}
                              aria-label={`${cell.dateKey} ${titleFor(habit, lang)} ${checked ? c.completed : c.notCompleted}`}
                              data-tooltip={`${cell.dateKey}\n${titleFor(habit, lang)} ${checked ? c.completed : c.notCompleted}`}
                              onClick={() => onToggle(habit.id, cell.dateKey)}
                            />
                          );
                        })}
                        {habits.length > MAX_ALL_HABIT_DOTS && <span className="all-more">+{habits.length - MAX_ALL_HABIT_DOTS}</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function ViewHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="view-head">
      <h2 className="detail-title">{title}</h2>
      <p className="detail-subtitle">{subtitle}</p>
    </div>
  );
}

export default HabitDetail;

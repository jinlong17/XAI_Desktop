/**
 * registrations — the 10-entry WidgetRegistration[] consumed by row #10's
 * DashboardSlotHost (after the P3 host-wiring edit lands).
 *
 * P1 ships ClockWidget + 3 mini stats. P2 fills in MiniCal/WorldClocks/
 * Weather/Stickies. P3 fills in Mail/Upcoming. Until each phase lands, the
 * corresponding widget's render returns null so the array length stays at 10
 * (registration sanity tests rely on this).
 */
import type { WidgetRegistration } from "@repo/plugin-web-dashboard-grid";

import { ClockWidget } from "./widgets/ClockWidget.js";
import { MiniCalWidget } from "./widgets/MiniCalWidget.js";
import { StatPomos } from "./widgets/StatPomos.js";
import { StatStreak } from "./widgets/StatStreak.js";
import { StatTasks } from "./widgets/StatTasks.js";
import { StickiesWidget } from "./widgets/StickiesWidget.js";
import { WeatherWidget } from "./widgets/WeatherWidget.js";
import { WorldClocks } from "./widgets/WorldClocks.js";

import "./styles.css";

export const dashboardWidgetRegistrations: WidgetRegistration[] = [
  {
    id: "clock",
    span: "w-clock",
    ariaLabel: { en: "Clock widget", zh: "时钟组件" },
    render: (ctx) => <ClockWidget lang={ctx.lang} now={ctx.now} />,
  },
  {
    id: "stat-tasks",
    span: "w-stat",
    ariaLabel: { en: "Tasks-done stat", zh: "完成任务统计" },
    render: (ctx) => <StatTasks lang={ctx.lang} />,
  },
  {
    id: "stat-streak",
    span: "w-stat",
    ariaLabel: { en: "Habit-streak stat", zh: "习惯连胜统计" },
    render: (ctx) => <StatStreak lang={ctx.lang} />,
  },
  {
    id: "stat-pomos",
    span: "w-stat",
    ariaLabel: { en: "Pomodoros stat", zh: "番茄数统计" },
    render: (ctx) => <StatPomos lang={ctx.lang} />,
  },
  {
    id: "weather",
    span: "w-weather",
    ariaLabel: { en: "Weather widget", zh: "天气组件" },
    render: (ctx) => <WeatherWidget lang={ctx.lang} />,
  },
  {
    id: "mini-cal",
    span: "w-mini-cal",
    ariaLabel: { en: "Mini calendar", zh: "迷你日历" },
    render: (ctx) => <MiniCalWidget lang={ctx.lang} now={ctx.now} goTo={ctx.goTo} />,
  },
  {
    id: "timezones",
    span: "w-timezones",
    ariaLabel: { en: "World clocks", zh: "世界时钟" },
    render: (ctx) => <WorldClocks lang={ctx.lang} now={ctx.now} />,
  },
  {
    id: "stickies",
    span: "w-stickies",
    ariaLabel: { en: "Sticky notes", zh: "便签" },
    render: (ctx) => <StickiesWidget lang={ctx.lang} />,
  },
  {
    id: "mail",
    span: "w-mail",
    ariaLabel: { en: "Inbox", zh: "收件箱" },
    // Filled in P3.
    render: () => null,
  },
  {
    id: "upcoming",
    span: "w-upcoming",
    ariaLabel: { en: "Upcoming events", zh: "近期事件" },
    // Filled in P3.
    render: () => null,
  },
];

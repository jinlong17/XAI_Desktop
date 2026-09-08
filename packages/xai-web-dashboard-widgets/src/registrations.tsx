/**
 * registrations — the WidgetRegistration[] consumed by row #10's
 * DashboardSlotHost (after the P3 host-wiring edit lands).
 *
 * P1 ships ClockWidget + 3 mini stats. P2 fills in MiniCal/WorldClocks/
 * Weather/Stickies. P3 fills in Mail/Upcoming. Until each phase lands, the
 * corresponding widget's render returns null so the array length stays at 10
 * (registration sanity tests rely on this).
 */
import type { ReactNode } from "react";
import type { Lang } from "@repo/plugin-web-tokens";

type WidgetSpanClass =
  | "w-clock"
  | "w-stat"
  | "w-weather"
  | "w-timetrack"
  | "w-mini-cal"
  | "w-timezones"
  | "w-stickies"
  | "w-mail"
  | "w-upcoming";

interface WidgetRenderContext {
  lang: Lang;
  now: Date;
  goTo: (moduleId: string) => void;
}

interface WidgetRegistration {
  id: string;
  span: WidgetSpanClass;
  render: (ctx: WidgetRenderContext) => ReactNode;
  ariaLabel?: { en: string; zh: string };
}

import { ClockWidget } from "./widgets/ClockWidget.js";
import { MailWidget } from "./widgets/MailWidget.js";
import { MiniCalWidget } from "./widgets/MiniCalWidget.js";
import { StatPomos } from "./widgets/StatPomos.js";
import { StatStreak } from "./widgets/StatStreak.js";
import { StatTasks } from "./widgets/StatTasks.js";
import { StickiesWidget } from "./widgets/StickiesWidget.js";
import { TimeTrackerWidget } from "./widgets/TimeTrackerWidget.js";
import { UpcomingWidget } from "./widgets/UpcomingWidget.js";
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
    id: "timetrack",
    span: "w-timetrack",
    ariaLabel: { en: "Time Tracker widget", zh: "时间追踪组件" },
    render: (ctx) => <TimeTrackerWidget lang={ctx.lang} now={ctx.now} goTo={ctx.goTo} />,
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
    ariaLabel: { en: "Notifications", zh: "通知" },
    render: (ctx) => <MailWidget lang={ctx.lang} now={ctx.now} goTo={ctx.goTo} />,
  },
  {
    id: "upcoming",
    span: "w-upcoming",
    ariaLabel: { en: "Upcoming events", zh: "近期事件" },
    render: (ctx) => <UpcomingWidget lang={ctx.lang} now={ctx.now} goTo={ctx.goTo} />,
  },
];

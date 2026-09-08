/**
 * fixtures — mock data for widgets that don't yet have a live data source.
 *
 * Bilingual structure mirrors `web design/i18n.js` MOCK object. Future:
 * settings-features-panel (row #23) may gate widgets; statistics (row #20)
 * may replace counts with real data; live mail/weather integrations are
 * separate roadmaps. v1 is read-only display.
 *
 * Source: web design/i18n.js lines 509-636 (calEvents + weather + stickies +
 * mails + upcoming sections).
 */
import type { Lang } from "@repo/plugin-web-tokens";

// -- Weather -----------------------------------------------------------------

export interface WeatherForecastDay {
  d: { en: string; zh: string };
  hi: number;
  lo: number;
  ico: "sun" | "cloud" | "rain";
}

export interface WeatherFixture {
  city: { en: string; zh: string };
  temp: number;
  hi: number;
  lo: number;
  condition: { en: string; zh: string };
  icon: "sun" | "cloud" | "rain";
  forecast: WeatherForecastDay[];
}

export const WEATHER: WeatherFixture = {
  city: { en: "Shanghai", zh: "上海" },
  temp: 22,
  hi: 25,
  lo: 18,
  condition: { en: "Partly Cloudy", zh: "多云" },
  icon: "cloud",
  forecast: [
    { d: { en: "Mon", zh: "一" }, hi: 25, lo: 17, ico: "cloud" },
    { d: { en: "Tue", zh: "二" }, hi: 27, lo: 18, ico: "sun" },
    { d: { en: "Wed", zh: "三" }, hi: 24, lo: 18, ico: "rain" },
    { d: { en: "Thu", zh: "四" }, hi: 22, lo: 16, ico: "rain" },
    { d: { en: "Fri", zh: "五" }, hi: 26, lo: 17, ico: "sun" },
  ],
};

// -- Stickies ----------------------------------------------------------------

export interface StickyFixture {
  id: string;
  color: string;
  text: { en: string; zh: string };
}

export const STICKIES: readonly StickyFixture[] = [
  {
    id: "s1",
    color: "#fff7c0",
    text: {
      en: "Buy birthday gift for Lily — bookshop on Maple St.",
      zh: "给 Lily 买生日礼物 — Maple 街的书店",
    },
  },
  {
    id: "s2",
    color: "#cfe7d8",
    text: {
      en: "Idea: integrate weekly review with focus stats.",
      zh: "想法：把周复盘和专注数据打通。",
    },
  },
  {
    id: "s3",
    color: "#fad6c8",
    text: {
      en: "Reply to design feedback from Mia.",
      zh: "回复 Mia 的设计反馈。",
    },
  },
];

// -- Mails -------------------------------------------------------------------

export interface MailFixture {
  id: string;
  from: string;
  subj: { en: string; zh: string };
  time: string;
  unread: boolean;
}

export const MAILS: readonly MailFixture[] = [
  {
    id: "m1",
    from: "Notion",
    subj: { en: "Your weekly digest", zh: "本周摘要" },
    time: "08:42",
    unread: true,
  },
  {
    id: "m2",
    from: "Linear",
    subj: { en: "3 issues need triage", zh: "3 个 issue 待分类" },
    time: "07:11",
    unread: true,
  },
  {
    id: "m3",
    from: "Mia Wang",
    subj: { en: "Re: pet animation review", zh: "回复：桌宠动画评审" },
    time: "Yesterday",
    unread: false,
  },
  {
    id: "m4",
    from: "Stripe",
    subj: { en: "Receipt for May invoice", zh: "5 月发票收据" },
    time: "Mon",
    unread: false,
  },
];

// -- Upcoming events ---------------------------------------------------------

export interface UpcomingFixture {
  id: string;
  date: string;
  month: { en: string; zh: string };
  title: { en: string; zh: string };
  time: string;
}

export const UPCOMING: readonly UpcomingFixture[] = [
  {
    id: "e1",
    date: "22",
    month: { en: "May", zh: "5 月" },
    title: { en: "Data Analysis", zh: "数据分析" },
    time: "11:00",
  },
  {
    id: "e2",
    date: "22",
    month: { en: "May", zh: "5 月" },
    title: { en: "Brainstorm — Pet feature", zh: "头脑风暴 — 桌宠功能" },
    time: "11:30",
  },
  {
    id: "e3",
    date: "23",
    month: { en: "May", zh: "5 月" },
    title: { en: "0–1 Product construction", zh: "0-1 产品搭建" },
    time: "14:00",
  },
  {
    id: "e4",
    date: "23",
    month: { en: "May", zh: "5 月" },
    title: { en: "Video review", zh: "视频复盘" },
    time: "14:30",
  },
];

// -- Mini-Cal events (keyed by day-of-month) --------------------------------

export type CalDotColor = "mint" | "amber" | "blue" | "violet";

export interface CalEventDot {
  c: CalDotColor;
}

/**
 * May 2026 mock calendar event dots. Up to 3 dots per day are rendered by
 * MiniCalWidget.
 */
export const CAL_EVENTS: Readonly<Record<number, readonly CalEventDot[]>> = {
  1: [{ c: "mint" }],
  4: [{ c: "blue" }, { c: "amber" }],
  7: [{ c: "violet" }],
  10: [{ c: "mint" }, { c: "blue" }],
  13: [{ c: "amber" }],
  16: [{ c: "mint" }, { c: "violet" }, { c: "blue" }],
  19: [{ c: "blue" }],
  22: [{ c: "mint" }, { c: "amber" }],
  23: [{ c: "violet" }, { c: "mint" }],
  25: [{ c: "blue" }],
  28: [{ c: "amber" }],
};

// -- Helpers -----------------------------------------------------------------

export function bilingual<T extends { en: string; zh: string }>(value: T, lang: Lang): string {
  return value[lang];
}

import type { TimeTrackerCategory } from "../types.js";

const STAMP = 1767225600000; // 2026-01-01T00:00:00.000Z

export const TIME_TRACKER_CATEGORY_COLORS = [
  "oklch(60% 0.11 165)",
  "oklch(62% 0.13 35)",
  "oklch(60% 0.12 245)",
  "oklch(60% 0.12 295)",
  "oklch(67% 0.13 70)",
  "oklch(60% 0.15 25)",
  "oklch(62% 0.10 200)",
  "oklch(62% 0.12 330)",
  "oklch(58% 0.10 140)",
  "oklch(60% 0.12 265)",
] as const;

export const DEFAULT_TIME_TRACKER_CATEGORIES: readonly TimeTrackerCategory[] = [
  {
    id: "cat_study",
    name: { en: "Study", zh: "学习" },
    color: TIME_TRACKER_CATEGORY_COLORS[2],
    icon: "study",
    goalMin: 120,
    subs: [
      { id: "sub_code", name: { en: "Code", zh: "代码" } },
      { id: "sub_paper", name: { en: "Paper", zh: "论文" } },
      { id: "sub_read", name: { en: "Reading", zh: "阅读" } },
      { id: "sub_course", name: { en: "Course", zh: "课程" } },
    ],
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "cat_work",
    name: { en: "Work", zh: "工作" },
    color: TIME_TRACKER_CATEGORY_COLORS[1],
    icon: "work",
    goalMin: 240,
    subs: [
      { id: "sub_design", name: { en: "Product Design", zh: "产品设计" } },
      { id: "sub_dev", name: { en: "Development", zh: "开发" } },
      { id: "sub_meet", name: { en: "Meeting", zh: "会议" } },
    ],
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "cat_life",
    name: { en: "Life", zh: "生活" },
    color: TIME_TRACKER_CATEGORY_COLORS[0],
    icon: "life",
    goalMin: 90,
    subs: [
      { id: "sub_fit", name: { en: "Fitness", zh: "健身" } },
      { id: "sub_shop", name: { en: "Shopping", zh: "购物" } },
      { id: "sub_commute", name: { en: "Commute", zh: "出行" } },
    ],
    createdAt: STAMP,
    updatedAt: STAMP,
  },
  {
    id: "cat_rest",
    name: { en: "Rest", zh: "休息" },
    color: TIME_TRACKER_CATEGORY_COLORS[3],
    icon: "rest",
    goalMin: 60,
    subs: [],
    createdAt: STAMP,
    updatedAt: STAMP,
  },
];

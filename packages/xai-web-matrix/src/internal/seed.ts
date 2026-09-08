/**
 * @internal — seed.ts
 * Typed initial cards for MatrixModule's first-launch seeding.
 *
 * These correspond to the prototype's window.MOCK overdue + nodate tasks,
 * made bilingual and strongly typed. The seed is applied once on first mount
 * when localStorage has no stored state (all quadrant arrays are empty).
 *
 * Ref: design.md §5.2, api.md §1.1
 */

import type { MatrixCard, MatrixState } from "../types.js";

const OVERDUE_CARDS: readonly MatrixCard[] = [
  {
    id: "seed-1",
    title: { en: "Review project proposal", zh: "审核项目提案" },
    date: "2 days ago",
    dateZh: "2天前",
    tag: "work",
  },
  {
    id: "seed-2",
    title: { en: "Fix critical bug in production", zh: "修复生产环境关键 Bug" },
    date: "Yesterday",
    dateZh: "昨天",
    tag: "work",
  },
];

const NO_DATE_CARDS: readonly MatrixCard[] = [
  {
    id: "seed-3",
    title: { en: "Read 'Deep Work' chapter 3", zh: "阅读《深度工作》第三章" },
    tag: "personal",
  },
  {
    id: "seed-4",
    title: { en: "Update project documentation", zh: "更新项目文档" },
    tag: "work",
  },
  {
    id: "seed-5",
    title: { en: "Plan team retrospective", zh: "计划团队回顾会议" },
    tag: "work",
  },
  {
    id: "seed-6",
    title: { en: "Schedule dentist appointment", zh: "预约牙医" },
    tag: "personal",
  },
  {
    id: "seed-7",
    title: { en: "Organize home office", zh: "整理家庭办公室" },
    tag: "personal",
  },
  {
    id: "seed-8",
    title: { en: "Send thank-you emails", zh: "发送感谢邮件" },
    tag: "work",
  },
];

/**
 * Returns the initial seeded MatrixState used on first launch.
 * Q4 gets overdue + nodate cards; Q1/Q2/Q3 start empty.
 * (Prototype behavior: matrix ships with seed data visible.)
 */
export function buildSeedState(): MatrixState {
  return {
    schemaVersion: 1,
    q1: [],
    q2: [],
    q3: [],
    q4: [...OVERDUE_CARDS, ...NO_DATE_CARDS],
  };
}

/** Total seed card count — used to assert > 0 in tests. */
export const SEED_CARD_COUNT = OVERDUE_CARDS.length + NO_DATE_CARDS.length;

/**
 * Bilingual STR tables for components in this row.
 *
 * Keeps new strings local instead of editing `@repo/plugin-web-tokens`'s
 * global `useI18n` table. Each component re-uses the tables it needs via
 * `import { STR } from "./internal/strings.js"`.
 *
 * Per discovery review R4 / R10: this row produces ~20+ new strings; using
 * a typed STR table is cleaner than scattered ternaries and avoids any
 * coupling to the tokens package.
 */

export type Lang = "en" | "zh";

export const STR_SWITCHER = {
  searchPlaceholder: { en: "Search your boards…", zh: "搜索看板…" },
  all: { en: "All", zh: "全部" },
  newBoard: { en: "New board", zh: "新建看板" },
  cards: { en: "cards", zh: "卡片" },
  noMatching: { en: "No matching boards.", zh: "没有匹配的看板。" },
  deleteTitle: { en: "Delete", zh: "删除" },
  deleteConfirm: { en: "Delete this board?", zh: "删除该看板？" },
} as const;

export const STR_CREATOR = {
  createBoard: { en: "Create board", zh: "新建看板" },
  boardName: { en: "Board name", zh: "看板名称" },
  workspace: { en: "Workspace", zh: "所属工作区" },
  defaultName: { en: "New board", zh: "新看板" },
  cancel: { en: "Cancel", zh: "取消" },
  create: { en: "Create", zh: "创建" },
} as const;

export const STR_STATUS_OVERVIEW = {
  title: { en: "Status Overview", zh: "状态总览" },
  last7Days: { en: "Last 7 days", zh: "近 7 天" },
  description: {
    en: "View your project's overall progress based on your workflow. Click a list below for details.",
    zh: "基于看板列展示项目整体进度。点击下方列查看更多详情。",
  },
  doneLabel: { en: "Done", zh: "已完成" },
  total: { en: "Total", zh: "总计" },
} as const;

export const STR_INBOX = {
  inbox: { en: "Inbox", zh: "收件箱" },
  composerPlaceholder: { en: "Add a card", zh: "添加卡片" },
  empty: { en: "Inbox is empty", zh: "收件箱为空" },
} as const;

export const STR_PLANNER = {
  planner: { en: "Planner", zh: "计划" },
  deepFocus: { en: "Deep focus", zh: "专注" },
  review: { en: "Review", zh: "复盘" },
  walk: { en: "Walk", zh: "散步" },
} as const;

export const STR_BOTTOM_SWITCHER = {
  viewInbox: { en: "Inbox", zh: "收件箱" },
  viewPlanner: { en: "Planner", zh: "计划" },
  viewBoard: { en: "Board", zh: "看板" },
  switchBoards: { en: "Switch boards", zh: "切换看板" },
} as const;

export const STR_HEADER = {
  overview: { en: "Overview", zh: "总览" },
  filter: { en: "Filter", zh: "筛选" },
  archived: { en: "Archived", zh: "已归档" },
  share: { en: "Share", zh: "分享" },
  totalSuffix: { en: "cards", zh: "张卡片" },
  viewBoard: { en: "Board", zh: "看板" },
} as const;

export const STR_ARCHIVED_LISTS = {
  title: { en: "Archived lists", zh: "已归档列" },
  empty: { en: "No archived lists", zh: "暂无已归档列" },
  restore: { en: "Restore", zh: "恢复" },
  deletePermanent: { en: "Delete", zh: "删除" },
  deleteConfirm: {
    en: "Permanently delete this archived list and its cards?",
    zh: "永久删除该归档列及其卡片？",
  },
  cards: { en: "cards", zh: "张卡片" },
} as const;

export const STR_ARCHIVED_CARDS = {
  toolbar: { en: "Archived cards", zh: "已归档卡片" },
  title: { en: "Archived cards", zh: "已归档卡片" },
  empty: { en: "No archived cards", zh: "暂无已归档卡片" },
  restore: { en: "Restore", zh: "恢复" },
  deletePermanent: { en: "Delete", zh: "删除" },
  deleteConfirm: {
    en: "Permanently delete this archived card?",
    zh: "永久删除该归档卡片？",
  },
} as const;

/** Bilingual day-name table (Mon-first localized labels). */
export const PLANNER_WEEKDAYS_ZH: readonly string[] = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

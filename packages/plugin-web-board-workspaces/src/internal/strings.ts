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
  share: { en: "Share", zh: "分享" },
  totalSuffix: { en: "cards", zh: "张卡片" },
  viewBoard: { en: "Board", zh: "看板" },
} as const;

/** Bilingual day-name table (Mon-first localized labels). */
export const PLANNER_WEEKDAYS_ZH: readonly string[] = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/**
 * STR_CARD_DETAIL — bilingual strings for CardDetailDialog.
 *
 * Audit Top-10 #5 fix — B-23/B-29/B-32/B-34/B-36 + Map view.
 * Local STR pattern: no plugin-web-tokens edit.
 */
export const STR_CARD_DETAIL = {
  /** Dialog heading is the card title itself; this is the dialog accessible label. */
  dialogLabel:  { en: "Card detail",  zh: "卡片详情"  },
  listLabel:    { en: "List",         zh: "所属列"     },
  dueLabel:     { en: "Due",          zh: "截止日"     },
  startLabel:   { en: "Start",        zh: "开始日"     },
  lateLabel:    { en: "Late",         zh: "已逾期"     },
  labelsLabel:  { en: "Labels",       zh: "标签"       },
  membersLabel: { en: "Members",      zh: "成员"       },
  checklistLabel: { en: "Checklist",  zh: "核对表"     },
  attachLabel:  { en: "Attachments",  zh: "附件"       },
  close:        { en: "Close",        zh: "关闭"       },
} as const;

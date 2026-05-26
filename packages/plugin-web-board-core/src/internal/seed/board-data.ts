/**
 * Typed seed data — port of `web design/board-data.js` + `web design/i18n.js`
 * §"Board (Trello-style)" `MOCK.boardLists` section.
 *
 * This module is the SOLE source of seed-time defaults for first-run users
 * (when `usePref("xai_boards_v2")` returns the registry default `null`).
 *
 * Per ADR-0007 §S4 line 267 — `board-data.js` window-global becomes a typed
 * package-private module. Row #7 owns the seed; row #9 (workspaces) will
 * consume BOARD_TEMPLATES + DEFAULT_WORKSPACES via `index.ts` re-exports.
 */

import type {
  Board,
  BoardCard,
  BoardList,
  BoardTemplate,
  BoardWorkspace,
} from "../../types.js";

export interface BoardLabel {
  id: string;
  name: { en: string; zh: string };
  /** OKLCH or CSS color string. */
  color: string;
}

/** PM template label palette — DESIGN.md §4.3 + `board-data.js` PM_LABELS. */
export const PM_LABELS: readonly BoardLabel[] = [
  { id: "pm-forms", name: { en: "Forms", zh: "表单" }, color: "oklch(60% 0.16 295)" },
  { id: "pm-accounts", name: { en: "Accounts", zh: "账户" }, color: "oklch(60% 0.12 155)" },
  { id: "pm-feedback", name: { en: "Feedback", zh: "反馈" }, color: "oklch(70% 0.16 85)" },
  { id: "pm-billing", name: { en: "Billing", zh: "账单" }, color: "oklch(60% 0.16 25)" },
  { id: "pm-research", name: { en: "Research", zh: "调研" }, color: "oklch(60% 0.12 245)" },
] as const;

export const DEFAULT_WORKSPACES: readonly BoardWorkspace[] = [
  { id: "ws-personal", name: { en: "Personal", zh: "个人" }, color: "oklch(60% 0.10 165)" },
  { id: "ws-team", name: { en: "Team Workspace", zh: "团队空间" }, color: "oklch(60% 0.14 295)" },
] as const;

/**
 * KANBAN default lists — verbatim port of `web design/i18n.js` §"Board (Trello-style)"
 * `MOCK.boardLists` (lines 556..591). 5 lists × 2..4 cards each.
 */
function makeKanbanDefaultLists(): BoardList[] {
  return [
    {
      id: "b-backlog",
      key: "backlog",
      cards: [
        {
          id: "bc1",
          title: { en: "Onboarding flow concepts", zh: "新人引导流程概念" },
          labels: ["l1", "l3"],
          checklist: { done: 2, total: 5 },
          due: "5/24",
          attach: 1,
          cover: "linear-gradient(135deg, oklch(78% 0.10 295), oklch(62% 0.12 245))",
          members: ["u1", "u2"],
          // codex C3-CHROME-3 (2026-05-26): seed pins for Map view demo.
          // San Francisco, USA — SHIPPED gap-closure row #6 P1 added the
          // optional location? field but no card populated it.
          location: { lat: 37.7749, lng: -122.4194, label: "San Francisco" },
        },
        {
          id: "bc2",
          title: { en: "Pet animation rig", zh: "桌宠动画 rig" },
          labels: ["l1"],
          checklist: { done: 0, total: 3 },
        },
        {
          id: "bc3",
          title: { en: "Audit competitor pricing", zh: "竞品定价调研" },
          labels: ["l3"],
          due: "5/30",
          members: ["u3"],
        },
      ],
    },
    {
      id: "b-today",
      key: "today",
      cards: [
        {
          id: "bc4",
          title: { en: "Ship countdown widgets", zh: "上线倒计时组件" },
          labels: ["l2", "l5"],
          checklist: { done: 6, total: 8 },
          due: "今天",
          dueEn: "Today",
          attach: 2,
          members: ["u1", "u3"],
          // codex C3-CHROME-3 (2026-05-26): seed pin for Map view demo.
          // New York, USA.
          location: { lat: 40.7128, lng: -74.006, label: "New York" },
        },
        {
          id: "bc5",
          title: { en: "Review focus session bug", zh: "复查专注会话 bug" },
          labels: ["l4"],
          checklist: { done: 1, total: 2 },
          members: ["u2"],
          dueLate: true,
          due: "过期",
          dueEn: "Overdue",
        },
        {
          id: "bc6",
          title: { en: "Write release notes", zh: "撰写发版说明" },
          labels: ["l1"],
        },
      ],
    },
    {
      id: "b-week",
      key: "week",
      cards: [
        {
          id: "bc7",
          title: { en: "Dashboard widget API", zh: "工作台组件 API" },
          labels: ["l2"],
          checklist: { done: 3, total: 9 },
          due: "5/26",
          members: ["u2", "u3"],
          // codex C3-CHROME-3 (2026-05-26): seed pin for Map view demo.
          // London, UK — third pin demonstrates multi-continent placement.
          location: { lat: 51.5074, lng: -0.1278, label: "London" },
        },
        {
          id: "bc8",
          title: { en: "Sound library curation", zh: "音效库整理" },
          labels: ["l3", "l5"],
          attach: 4,
        },
        {
          id: "bc9",
          title: { en: "Habit grid hover states", zh: "习惯网格悬停态" },
          labels: ["l1"],
          cover: "linear-gradient(135deg, oklch(80% 0.08 165), oklch(60% 0.10 165))",
        },
        {
          id: "bc10",
          title: { en: "Bilingual copy review", zh: "中英文文案复核" },
          labels: ["l1", "l3"],
          checklist: { done: 4, total: 4 },
          members: ["u1"],
        },
      ],
    },
    {
      id: "b-later",
      key: "later",
      cards: [
        {
          id: "bc11",
          title: { en: "Multi-board switcher", zh: "多看板切换器" },
          labels: ["l1", "l2"],
          checklist: { done: 0, total: 6 },
        },
        {
          id: "bc12",
          title: { en: "Cmd-K command palette", zh: "Cmd-K 命令面板" },
          labels: ["l2", "l5"],
        },
      ],
    },
    {
      id: "b-done",
      key: "done",
      cards: [
        {
          id: "bc13",
          title: { en: "Set up design tokens", zh: "建立设计 tokens" },
          labels: ["l1", "l2"],
          checklist: { done: 7, total: 7 },
          members: ["u1", "u2"],
        },
        {
          id: "bc14",
          title: { en: "App rail interactions", zh: "侧栏交互" },
          labels: ["l1"],
          checklist: { done: 3, total: 3 },
        },
      ],
    },
  ];
}

/** PM template initial lists — DESIGN.md §4.3 + `board-data.js` PM_LISTS_INITIAL. */
function makePmInitialLists(): BoardList[] {
  return [
    {
      id: "pm-todo",
      key: null,
      customName: { en: "To Do", zh: "待办" },
      color: "gray",
      cards: [
        {
          id: "pmc1",
          title: {
            en: "Quick booking for accommodations — website",
            zh: "住宿快速预订 — 网站",
          },
          labels: ["pm-forms"],
          members: ["u1"],
          checklist: { done: 0, total: 3 },
          // codex C3-CHROME-3 cycle 2 (2026-05-26): seed location for Map view.
          // The default board for first-run users is "b-pm" (Project Management)
          // which uses makePmInitialLists; the prior fix only seeded "b-default"
          // (kanban) cards. Paris (France) — fits "accommodations booking" theme.
          location: { lat: 48.8566, lng: 2.3522, label: "Paris" },
        },
        {
          id: "pmc2",
          title: { en: "Adapt web app to new payments provider", zh: "适配新支付服务商" },
          labels: ["pm-forms"],
          members: ["u2"],
          checklist: { done: 0, total: 2 },
        },
        {
          id: "pmc3",
          title: { en: "Fluid booking on tablets", zh: "平板端流畅预订" },
          labels: ["pm-feedback"],
          members: ["u3"],
        },
        {
          id: "pmc4",
          title: { en: "Multi-dest search UI web", zh: "多目的地搜索 UI" },
          labels: ["pm-accounts"],
          members: ["u1"],
        },
      ],
    },
    {
      id: "pm-prog",
      key: null,
      customName: { en: "In Progress", zh: "进行中" },
      color: "blue",
      cards: [
        {
          id: "pmc5",
          title: { en: "BugFix BG Web-store app crashing", zh: "修复 BG 网店应用崩溃" },
          labels: ["pm-forms"],
          members: ["u2"],
          checklist: { done: 2, total: 5 },
          due: "5/26",
          // codex C3-CHROME-3 cycle 2 (2026-05-26): seed pin for Map view.
          // Sofia, Bulgaria — "BG" in the title hints at the store locale.
          location: { lat: 42.6977, lng: 23.3219, label: "Sofia" },
        },
        {
          id: "pmc6",
          title: {
            en: "High outage: Software bug fix — BG store",
            zh: "高严重故障：修复 BG 商店",
          },
          labels: ["pm-billing"],
          members: ["u3"],
          checklist: { done: 1, total: 4 },
          due: "Today",
          dueEn: "Today",
        },
        {
          id: "pmc7",
          title: { en: "Web-store purchasing performance issue", zh: "网店购买性能问题" },
          labels: ["pm-forms"],
          members: ["u1", "u2"],
          // codex C3-CHROME-3 cycle 2 (2026-05-26): seed pin for Map view.
          // Tokyo (Japan) — third continent spread for Map demo.
          location: { lat: 35.6762, lng: 139.6503, label: "Tokyo" },
        },
      ],
    },
    {
      id: "pm-review",
      key: null,
      customName: { en: "In Review", zh: "审核中" },
      color: "yellow",
      cards: [
        {
          id: "pmc8",
          title: {
            en: "Customers reporting shopping cart issues",
            zh: "客户反馈购物车问题",
          },
          labels: ["pm-accounts"],
          members: ["u2"],
          checklist: { done: 4, total: 6 },
        },
        {
          id: "pmc9",
          title: {
            en: "Planet Taxi Device exploration & research",
            zh: "出租车设备探索与调研",
          },
          labels: ["pm-feedback"],
          members: ["u3"],
        },
      ],
    },
    {
      id: "pm-blocked",
      key: null,
      customName: { en: "Blocked", zh: "阻塞" },
      color: "red",
      cards: [
        {
          id: "pmc10",
          title: { en: "Vendor approval pending", zh: "供应商审批待定" },
          labels: ["pm-billing"],
          members: ["u1"],
          dueLate: true,
          due: "5/19",
          dueEn: "Overdue",
        },
      ],
    },
    {
      id: "pm-done",
      key: null,
      customName: { en: "Done", zh: "已完成" },
      color: "green",
      cards: [
        {
          id: "pmc11",
          title: { en: "Quick payment", zh: "快速支付" },
          labels: ["pm-feedback"],
          members: ["u3"],
          checklist: { done: 3, total: 3 },
        },
        {
          id: "pmc12",
          title: { en: "Fast trip search", zh: "快速行程搜索" },
          labels: ["pm-accounts"],
          members: ["u1"],
          checklist: { done: 5, total: 5 },
        },
      ],
    },
  ];
}

/** Marketing kanban seed (b-marketing) — `board-data.js` line 41 onwards. */
function makeMarketingLists(): BoardList[] {
  const ideasCard: BoardCard = {
    id: "mk1",
    title: { en: "Influencer outreach plan", zh: "达人合作方案" },
    labels: ["pm-research"],
  };
  const progCard: BoardCard = {
    id: "mk2",
    title: { en: "Landing page hero refresh", zh: "落地页 hero 翻新" },
    labels: ["pm-forms"],
    checklist: { done: 1, total: 3 },
  };
  return [
    {
      id: "ml-ideas",
      key: null,
      customName: { en: "Ideas", zh: "创意" },
      color: "yellow",
      cards: [ideasCard],
    },
    {
      id: "ml-prog",
      key: null,
      customName: { en: "In Progress", zh: "进行中" },
      color: "blue",
      cards: [progCard],
    },
    {
      id: "ml-launch",
      key: null,
      customName: { en: "Launch", zh: "上线" },
      color: "green",
      cards: [],
    },
  ];
}

/** Default boards for a first-run user. */
export function makeDefaultBoards(): Board[] {
  return [
    {
      id: "b-default",
      workspaceId: "ws-personal",
      name: { en: "My Project Board", zh: "我的项目板" },
      cover: "linear-gradient(135deg, oklch(72% 0.12 295), oklch(78% 0.10 25))",
      template: "kanban",
      lists: makeKanbanDefaultLists(),
    },
    {
      id: "b-pm",
      workspaceId: "ws-team",
      name: { en: "Project Management", zh: "项目管理" },
      cover: "linear-gradient(135deg, oklch(58% 0.14 245), oklch(38% 0.10 250))",
      template: "pm",
      lists: makePmInitialLists(),
    },
    {
      id: "b-marketing",
      workspaceId: "ws-team",
      name: { en: "Q3 Marketing Launch", zh: "Q3 市场启动" },
      cover: "linear-gradient(135deg, oklch(70% 0.15 60), oklch(62% 0.16 35))",
      template: "kanban",
      lists: makeMarketingLists(),
    },
  ];
}

export interface BoardTemplateOption {
  id: BoardTemplate;
  name: { en: string; zh: string };
  desc: { en: string; zh: string };
  cover: string;
  /** Factory to produce a fresh `lists[]` for a new board of this template. */
  lists: () => BoardList[];
}

/** Built-in templates exposed to the "Create board" picker. Row #9 consumes this. */
export const BOARD_TEMPLATES: readonly BoardTemplateOption[] = [
  {
    id: "kanban",
    name: { en: "Basic Kanban", zh: "基础看板" },
    desc: {
      en: "Backlog · Today · Week · Later · Done.",
      zh: "待办池 / 今天 / 本周 / 以后 / 已完成。",
    },
    cover: "linear-gradient(135deg, oklch(72% 0.10 165), oklch(60% 0.10 165))",
    lists: () => [
      { id: "k-b", key: "backlog", cards: [] },
      { id: "k-t", key: "today", cards: [] },
      { id: "k-w", key: "week", cards: [] },
      { id: "k-l", key: "later", cards: [] },
      { id: "k-d", key: "done", cards: [] },
    ],
  },
  {
    id: "pm",
    name: { en: "Project Management for Teams", zh: "团队项目管理" },
    desc: {
      en: "5-stage workflow with status overview & color-coded labels.",
      zh: "5 阶段流程，含状态总览与彩色标签。",
    },
    cover: "linear-gradient(135deg, oklch(58% 0.14 245), oklch(38% 0.10 250))",
    lists: () => {
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      return makePmInitialLists().map((list) => ({
        ...list,
        id: `${list.id}-${stamp}`,
        cards: [],
      }));
    },
  },
  {
    id: "blank",
    name: { en: "Blank Board", zh: "空白看板" },
    desc: {
      en: "Start with no columns. Add what you need.",
      zh: "从零开始，按需添加列。",
    },
    cover: "linear-gradient(135deg, oklch(85% 0.02 220), oklch(70% 0.02 220))",
    lists: () => [],
  },
] as const;

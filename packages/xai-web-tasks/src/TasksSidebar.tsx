/**
 * TasksSidebar — 8-section 2nd-level sidebar.
 *
 * Sections (design.md §1 frozen assumption 2):
 *   1. Smart Lists (智能清单)   — all/today/tomorrow/next7/inbox/summary
 *   2. Custom Lists (自定义清单) — decorative placeholder rows (INERT — Q1 defer)
 *   3. Filters (筛选器)          — decorative hint block
 *   4. Tags (标签)               — decorative tag rows (INERT — Q1 defer)
 *   5. Calendar Subscription (订阅日历) — decorative
 *   6. Completed (已完成)        — sidebar footer
 *   7. Won't Do (不做了)         — sidebar footer
 *   8. Trash (回收站)            — sidebar footer
 *
 * FP1 change (smartlist-filter): `activeList` + `onSelectList` are now PROPS
 * (controlled component). The local useState has been removed. Custom-list and
 * tag rows are INERT (non-selecting) — they highlight nothing and do not drive
 * the board filter (Q1 defer — no list/tag membership model exists on TaskCard).
 *
 * API contract: packages/xai-web-tasks/docs/api.md §9 + §F.3
 * Design: packages/xai-web-tasks/docs/design.md §4 + §F.3
 */

import React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { SmartListId } from "./types.js";

// Decorative custom lists matching prototype MOCK.customLists
// INERT in v1 — no membership model on TaskCard; Q1 deferred.
const CUSTOM_LISTS = [
  { id: "research", en: "Research Papers",  zh: "科研论文",  color: "var(--tag-study)" },
  { id: "personal", en: "Personal Life",    zh: "个人生活",  color: "var(--tag-personal)" },
  { id: "career",   en: "Career Planning",  zh: "职业规划",  color: "var(--tag-work)" },
  { id: "reminders",en: "Reminders",        zh: "提醒",      color: "var(--accent)" },
];

// Decorative tags matching prototype MOCK.tags
// INERT in v1 — no tag membership model; Q1 deferred.
const TAGS = [
  { id: "1", en: "1.Study",     zh: "1.学习",  cls: "study",    count: 5 },
  { id: "2", en: "2.Work",      zh: "2.工作",  cls: "work",     count: 1 },
  { id: "3", en: "3.Personal",  zh: "3.个人",  cls: "personal", count: 4 },
  { id: "4", en: "4.TO-DO",     zh: "4.待办",  cls: "todo",     count: 1 },
  { id: "5", en: "5.OtherTask", zh: "5.其他",  cls: "other",    count: 1 },
];

const SMART_LISTS: Array<{ id: SmartListId; key: string; icon: string; count?: number }> = [
  { id: "all",     key: "tasks.all",          icon: "all",     count: undefined },
  { id: "today",   key: "common.today",       icon: "today",   count: undefined },
  { id: "tomorrow",key: "common.tomorrow",    icon: "tomorrow",count: undefined },
  { id: "next7",   key: "common.next_7_days", icon: "next7",   count: 12 },
  { id: "inbox",   key: "common.inbox",       icon: "inbox",   count: 27 },
  { id: "summary", key: "common.summary",     icon: "summary", count: undefined },
];

export interface TasksSidebarProps {
  lang: Lang;
  /** Active smart-list id — controlled by TasksModule (lifted state). */
  activeList: SmartListId;
  /** Called when the user clicks a smart-list row. */
  onSelectList: (id: SmartListId) => void;
}

export function TasksSidebar({ lang, activeList, onSelectList }: TasksSidebarProps) {
  const { s } = useI18n(lang);

  return (
    <nav className="module-sidebar" aria-label={s("tasks.all")}>
      {/* 1 — Smart Lists */}
      <div className="sidebar-section">
        {SMART_LISTS.map((item) => (
          <div
            key={item.id}
            className="list-row"
            data-active={activeList === item.id}
            onClick={() => onSelectList(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onSelectList(item.id); }}
          >
            {/* icon placeholder — inline SVG slot */}
            <SmartListIcon id={item.id} />
            <span className="grow">{s(item.key)}</span>
            {item.count != null && <span className="count">{item.count}</span>}
          </div>
        ))}
      </div>

      {/* 2 — Custom Lists (自定义清单) — INERT (Q1 defer) */}
      <div className="sec-label">{s("common.lists")}</div>
      <div className="sidebar-section">
        {CUSTOM_LISTS.map((cl) => (
          <div
            key={cl.id}
            className="list-row"
            // INERT: no onClick, no data-active, no keyboard handler.
            // Custom-list rows are decorative fixtures; no membership model exists on TaskCard.
            // Making them non-selecting prevents a half-wired "click → board unchanged" bug.
            // Pre-scoped as a future increment ("tasks-list-membership"). See Q1 + design §F.1 #7.
            tabIndex={-1}
            aria-hidden="true"
          >
            <span className="dot" style={{ color: cl.color }} />
            <span className="grow">{lang === "zh" ? cl.zh : cl.en}</span>
          </div>
        ))}
      </div>

      {/* 3 — Filters (筛选器) */}
      <div className="sec-label">{s("common.filters")}</div>
      <div className="filter-hint">
        {lang === "zh"
          ? "按清单、日期、优先级、标签等筛选任务。"
          : "Display tasks filtered by list, date, priority, tag, and more."}
      </div>

      {/* 4 — Tags (标签) — INERT (Q1 defer) */}
      <div className="sec-label">{s("common.tags")}</div>
      <div className="sidebar-section">
        {TAGS.map((tag) => (
          <div
            key={tag.id}
            className="list-row"
            // INERT: tag rows are decorative; no tag membership model on TaskCard.
            tabIndex={-1}
            aria-hidden="true"
          >
            <span className={"dot tag " + tag.cls} />
            <span className="grow">{lang === "zh" ? tag.zh : tag.en}</span>
            <span className="count">{tag.count}</span>
          </div>
        ))}
      </div>

      {/* 5 — Calendar Subscription (订阅日历) */}
      <div className="sec-label">{s("common.calendar_sub")}</div>
      <div className="sidebar-section">
        <div className="list-row">
          {/* calendar icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M5 1a1 1 0 011 1v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h1V2a1 1 0 011-1zm7 4H4v7h8V5z"/>
          </svg>
          <span className="grow">{lang === "zh" ? "本地日历" : "Local Calendars"}</span>
          <span className="count">8</span>
        </div>
      </div>

      {/* 6-8 — Completed / Won't Do / Trash (sidebar footer) */}
      <div className="sidebar-section sidebar-footer">
        <div className="list-row" role="button" tabIndex={0}>
          {/* check icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M13.78 4.22a.75.75 0 00-1.06 0L6.5 10.44 3.28 7.22a.75.75 0 00-1.06 1.06l3.75 3.75a.75.75 0 001.06 0l6.75-6.75a.75.75 0 000-1.06z"/>
          </svg>
          <span className="grow">{s("common.completed")}</span>
        </div>
        <div className="list-row" role="button" tabIndex={0}>
          <span className="dot" style={{ color: "var(--text-3)" }} />
          <span className="grow">{s("common.wont_do")}</span>
        </div>
        <div className="list-row" role="button" tabIndex={0}>
          {/* trash icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M6 2a1 1 0 00-1 1v1H3a1 1 0 100 2h10a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm1 6a1 1 0 00-1 1v3a1 1 0 102 0V9a1 1 0 00-1-1zm3 0a1 1 0 00-1 1v3a1 1 0 102 0V9a1 1 0 00-1-1z"/>
          </svg>
          <span className="grow">{s("common.trash")}</span>
        </div>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// SmartListIcon — inline SVG icons for smart list rows
// ---------------------------------------------------------------------------

function SmartListIcon({ id }: { id: SmartListId }) {
  switch (id) {
    case "all":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h7v2H2v-2z"/>
        </svg>
      );
    case "today":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M5 1a1 1 0 011 1v1h4V2a1 1 0 112 0v1h1a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2h1V2a1 1 0 011-1zm7 4H4v7h8V5z"/>
        </svg>
      );
    case "tomorrow":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 4a1 1 0 10-2 0v3.586L5.707 10.293a1 1 0 001.414 1.414l2-2A1 1 0 009 9V5z"/>
        </svg>
      );
    case "next7":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M3 3a1 1 0 000 2h9.586L11.293 6.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 1.414L12.586 3H3z"/>
        </svg>
      );
    case "inbox":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v6.586l-1.293-1.293a1 1 0 00-1.414 1.414L14 12.414V14H2v-1.586l2.707-2.707a1 1 0 00-1.414-1.414L2 9.586V3z"/>
        </svg>
      );
    case "summary":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M2 11h12v2H2v-2zm0-4h8v2H2V7zm0-4h12v2H2V3z"/>
        </svg>
      );
    default:
      return null;
  }
}

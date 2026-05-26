/**
 * FilterPopover — Board Filter UI popover.
 *
 * Gap-closure row #6: Board Filter feature (P3).
 * Anchored below the Filter button in BoardWorkspacesModule.
 *
 * Three facets:
 *   1. Labels — checkboxes for deduped labels found in lists
 *   2. Members — checkboxes for deduped members found in lists
 *   3. Due Range — radio group (all / overdue / today / week)
 *
 * HC1: Render-only. No persistence. State held by parent (BoardWorkspacesModule).
 *
 * API contract: packages/xai-web-board-workspaces/docs/api.md §S15.1
 */

import { useEffect, useRef } from "react";
import type { BoardListData } from "@repo/plugin-web-board-core";
import type { FilterState } from "@repo/plugin-web-board-views";
import { EMPTY_FILTER } from "@repo/plugin-web-board-views";
import { toggleLabel, toggleMember, setDueRange } from "./internal/filterState.js";

export interface FilterPopoverProps {
  lists: readonly BoardListData[];
  filter: FilterState;
  onChange: (next: FilterState) => void;
  onClose: () => void;
  lang: "en" | "zh";
}

const STR = {
  heading: { en: "Filter", zh: "筛选" },
  labels: { en: "Labels", zh: "标签" },
  members: { en: "Members", zh: "成员" },
  dueRange: { en: "Due Range", zh: "截止日期" },
  clear: { en: "Clear", zh: "清除" },
  dueAll: { en: "All", zh: "全部" },
  dueOverdue: { en: "Overdue", zh: "已逾期" },
  dueToday: { en: "Today", zh: "今天" },
  dueWeek: { en: "This week", zh: "本周" },
  noLabels: { en: "No labels on cards", zh: "卡片没有标签" },
  noMembers: { en: "No members on cards", zh: "卡片没有成员" },
} as const;

export function FilterPopover({ lists, filter, onChange, onClose, lang }: FilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Collect deduped labels + members across all cards
  const allLabels = [...new Set(
    lists.flatMap((l) => l.cards.flatMap((c) => c.labels ?? [])),
  )].sort();

  const allMembers = [...new Set(
    lists.flatMap((l) => l.cards.flatMap((c) => c.members ?? [])),
  )].sort();

  // ESC closes
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Outside click closes
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  const t = (key: keyof typeof STR) => STR[key][lang];

  return (
    <div
      className="filter-popover"
      data-testid="filter-popover"
      ref={popoverRef}
      role="dialog"
      aria-label={t("heading")}
    >
      <div className="fp-header">
        <span className="fp-title">{t("heading")}</span>
        <button
          type="button"
          className="fp-clear-btn"
          data-testid="fp-clear-btn"
          onClick={() => onChange(EMPTY_FILTER)}
        >
          {t("clear")}
        </button>
      </div>

      {/* Labels facet */}
      <section className="fp-section" data-testid="fp-labels-section">
        <h4 className="fp-section-title">{t("labels")}</h4>
        {allLabels.length === 0 ? (
          <p className="fp-empty-hint" data-testid="fp-labels-empty">{t("noLabels")}</p>
        ) : (
          <ul className="fp-checkbox-list">
            {allLabels.map((labelId) => (
              <li key={labelId}>
                <label className="fp-checkbox-label">
                  <input
                    type="checkbox"
                    data-testid={`fp-label-${labelId}`}
                    checked={filter.labels.has(labelId)}
                    onChange={() => onChange(toggleLabel(filter, labelId))}
                  />
                  <span>{labelId}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Members facet */}
      <section className="fp-section" data-testid="fp-members-section">
        <h4 className="fp-section-title">{t("members")}</h4>
        {allMembers.length === 0 ? (
          <p className="fp-empty-hint" data-testid="fp-members-empty">{t("noMembers")}</p>
        ) : (
          <ul className="fp-checkbox-list">
            {allMembers.map((memberId) => (
              <li key={memberId}>
                <label className="fp-checkbox-label">
                  <input
                    type="checkbox"
                    data-testid={`fp-member-${memberId}`}
                    checked={filter.members.has(memberId)}
                    onChange={() => onChange(toggleMember(filter, memberId))}
                  />
                  <span>{memberId}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Due Range facet */}
      <section className="fp-section" data-testid="fp-due-section">
        <h4 className="fp-section-title">{t("dueRange")}</h4>
        <ul className="fp-radio-list">
          {(["all", "overdue", "today", "week"] as const).map((rangeId) => (
            <li key={rangeId}>
              <label className="fp-radio-label">
                <input
                  type="radio"
                  name="dueRange"
                  data-testid={`fp-due-${rangeId}`}
                  checked={filter.dueRange === rangeId}
                  onChange={() => onChange(setDueRange(filter, rangeId))}
                />
                <span>
                  {rangeId === "all" && t("dueAll")}
                  {rangeId === "overdue" && t("dueOverdue")}
                  {rangeId === "today" && t("dueToday")}
                  {rangeId === "week" && t("dueWeek")}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

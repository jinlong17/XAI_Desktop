/**
 * AddWidgetPicker — native <dialog> modal for selecting a widget to add.
 *
 * INTERNAL — not re-exported from index.ts. Mounted only by DashboardModule.
 *
 * Design: design.md §E3
 * API contract: api.md §S14.2
 * Test strategy: test.md §9
 * HC1: native <dialog> only (no third-party modal library)
 * HC2: reads widget catalog via `widgets` prop (passed from DashboardModule)
 * HC5: grid of widget cards (icon + title + description) with Add / Cancel
 * ADR: docs/adr/0007-xai-web-console-build-form.md §S5 R8 (no DOM globals; typed refs)
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { WidgetRegistration } from "./types.js";

// ---- Props ----------------------------------------------------------------

export interface AddWidgetPickerProps {
  /** Whether the modal is currently open. Controlled by DashboardModule. */
  readonly open: boolean;
  /** Active language for bilingual strings. */
  readonly lang: Lang;
  /** Full widget catalog (passed from DashboardModule, sourced from row #11). */
  readonly widgets: WidgetRegistration[];
  /** Current order — used to filter out already-added ids (hide pattern per C1). */
  readonly currentOrder: readonly string[];
  /** Called when the user picks a widget. DashboardModule calls addWidget + emits + closes. */
  readonly onAdd: (widgetId: string) => void;
  /** Called when the user cancels (ESC, backdrop click, Cancel button). */
  readonly onClose: () => void;
}

// ---- Local bilingual maps (decoupled from ariaLabel to avoid R6 coupling) -

const WIDGET_TITLES: Record<string, { en: string; zh: string }> = {
  clock:        { en: "Clock",        zh: "时钟" },
  "stat-tasks": { en: "Tasks Done",   zh: "完成任务" },
  "stat-streak":{ en: "Habit Streak", zh: "习惯连胜" },
  "stat-pomos": { en: "Pomodoros",    zh: "番茄数" },
  weather:      { en: "Weather",      zh: "天气" },
  "mini-cal":   { en: "Mini Calendar",zh: "小日历" },
  timezones:    { en: "World Clocks", zh: "世界时间" },
  stickies:     { en: "Sticky Notes", zh: "便签" },
  mail:         { en: "Inbox",        zh: "收件箱" },
  upcoming:     { en: "Upcoming",     zh: "近期事件" },
};

const WIDGET_DESCRIPTIONS: Record<string, { en: string; zh: string }> = {
  clock:        { en: "Analog or digital clock for your local time.",   zh: "本地时间的模拟或数字时钟。" },
  "stat-tasks": { en: "Today's completed task count at a glance.",      zh: "一目了然地查看今日完成的任务数。" },
  "stat-streak":{ en: "Keep your longest habit streak visible.",        zh: "随时可见你的最长习惯连胜。" },
  "stat-pomos": { en: "Total Pomodoro sessions for today.",             zh: "今日番茄钟总数。" },
  weather:      { en: "Current conditions and a short forecast.",       zh: "当前天气与简短预报。" },
  "mini-cal":   { en: "Compact monthly calendar with event dots.",      zh: "带事件点的紧凑月历。" },
  timezones:    { en: "Clock faces for multiple time zones.",           zh: "多个时区的时钟。" },
  stickies:     { en: "Quick notes pinned to your dashboard.",          zh: "固定在工作台上的快速便签。" },
  mail:         { en: "Unread email count and recent messages.",        zh: "未读邮件数量和近期消息。" },
  upcoming:     { en: "Next appointments from your calendar.",          zh: "日历中即将到来的日程。" },
};

// Minimal inline SVG icons — one per widget id.
function WidgetIcon({ id }: { id: string }) {
  switch (id) {
    case "clock":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "stat-tasks":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "stat-streak":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case "stat-pomos":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      );
    case "weather":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      );
    case "mini-cal":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "timezones":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "stickies":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "mail":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "upcoming":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      );
  }
}

// ---- Component -------------------------------------------------------------

export function AddWidgetPicker({
  open,
  lang,
  widgets,
  currentOrder,
  onAdd,
  onClose,
}: AddWidgetPickerProps): React.ReactElement {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const { s } = useI18n(lang);

  // Open/close the native <dialog> in response to controlled `open` prop.
  // Per S14.10, showModal() is wrapped in try/catch (already-open safe).
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (typeof dialog.showModal === "function") {
        try {
          dialog.showModal();
        } catch {
          // Already open — safe to ignore.
        }
      } else {
        dialog.setAttribute("open", "");
      }
    } else {
      if (typeof dialog.close === "function") {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    }
  }, [open]);

  // Native cancel event fires on ESC keypress.
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault(); // prevent browser auto-close; we control state
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  // Backdrop click: click on the <dialog> element itself (not inner content).
  // Mirrors DeleteAccountConfirmModal.tsx handleDialogClick pattern (REC-2).
  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>): void {
    if (e.target === dialogRef.current) {
      onClose();
    }
  }

  // Widgets not yet on dashboard (C1 hide pattern).
  const available = widgets.filter((w) => !currentOrder.includes(w.id));
  const allAdded = available.length === 0;

  const titleId = "awp-title";

  return (
    <dialog
      ref={dialogRef}
      className="add-widget-picker"
      onClick={handleDialogClick}
      aria-labelledby={titleId}
    >
      <div className="awp-inner">
        <h2 id={titleId} className="awp-title">
          {s("dashboard.picker.title")}
        </h2>

        {allAdded ? (
          <div className="awp-empty">
            <div className="awp-empty__title">{s("dashboard.picker.all_added_title")}</div>
            <div className="awp-empty__subtitle">{s("dashboard.picker.all_added_subtitle")}</div>
          </div>
        ) : (
          <div className="awp-grid">
            {available.map((w) => {
              const titleText =
                WIDGET_TITLES[w.id]?.[lang] ?? (WIDGET_TITLES[w.id]?.en ?? w.id);
              const descText =
                WIDGET_DESCRIPTIONS[w.id]?.[lang] ?? (WIDGET_DESCRIPTIONS[w.id]?.en ?? "");
              return (
                <button
                  key={w.id}
                  type="button"
                  className="awp-card"
                  onClick={() => onAdd(w.id)}
                >
                  <span className="awp-card__icon">
                    <WidgetIcon id={w.id} />
                  </span>
                  <span className="awp-card__title">{titleText}</span>
                  <span className="awp-card__desc">{descText}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="awp-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={onClose}
            aria-label={s("dashboard.picker.aria_close")}
          >
            {s("dashboard.picker.cancel")}
          </button>
        </div>
      </div>
    </dialog>
  );
}

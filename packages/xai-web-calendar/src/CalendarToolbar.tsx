/**
 * CalendarToolbar — top header strip.
 *
 * Renders the active title, view-segmented switcher (Day/Week/Month/Year), and
 * month-nav buttons (< / today / >). View buttons flip aria-selected per
 * the prototype.
 *
 * Design: docs/design.md §3.
 */

import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import type { Lang, I18NBundle } from "@repo/plugin-web-tokens";
import { CalIcon } from "./internal/icons.js";
import type { CalendarView } from "./types.js";
import { formatMonthTitle } from "./internal/formatMonth.js";

interface CalendarToolbarProps {
  lang: Lang;
  t: I18NBundle;
  view: CalendarView;
  onViewChange: (v: CalendarView) => void;
  displayedMonth: { year: number; month: number };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetToday: () => void;
  weekStart: 0 | 1;
  onWeekStartChange: (weekStart: 0 | 1) => void;
  /**
   * Optional click handler for the `+` button. Added by the 2026-05-27
   * event-create extension (ADR-0010 §D4 carve-out). When absent, the
   * button renders as a no-op (preserves SHIPPED-baseline behavior).
   */
  onAdd?: () => void;
}

export function CalendarToolbar(props: CalendarToolbarProps): JSX.Element {
  const { lang, t, view, onViewChange, displayedMonth, onPrevMonth, onNextMonth, onResetToday, onAdd, weekStart, onWeekStartChange } =
    props;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const title = view === "year"
    ? (lang === "zh" ? `${displayedMonth.year} 年` : `${displayedMonth.year}`)
    : formatMonthTitle(displayedMonth.year, displayedMonth.month, lang, t);
  const yearLabel = lang === "zh" ? "年" : "Year";
  const settingsTitle = lang === "zh" ? "日历设置" : "Calendar settings";
  const weekStartLabel = lang === "zh" ? "一周开始于" : "Week starts on";
  const sundayLabel = lang === "zh" ? "周日" : "Sunday";
  const mondayLabel = lang === "zh" ? "周一" : "Monday";

  useEffect(() => {
    if (!settingsOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (settingsRef.current?.contains(event.target as Node)) return;
      setSettingsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [settingsOpen]);

  const handleWeekStartSelect = (nextWeekStart: 0 | 1) => {
    onWeekStartChange(nextWeekStart);
    setSettingsOpen(false);
  };

  return (
    <header className="cal-toolbar">
      <div className="cal-toolbar__identity">
        <button
          type="button"
          className="icon-btn cal-toolbar__menu"
          data-testid="cal-list-toggle"
          aria-label={lang === "zh" ? "切换日历列表" : "Toggle calendar list"}
        >
          <CalIcon name="list" size={16} />
        </button>
        <h1 className="module-title">{title}</h1>
      </div>
      <div className="cal-toolbar__actions">
        <button
          type="button"
          className="icon-btn cal-toolbar__add"
          data-testid="cal-add"
          onClick={onAdd}
          aria-label="Add event"
        >
          <CalIcon name="plus" size={16} />
        </button>
        <div className="seg cal-toolbar__views" role="tablist" aria-label="calendar-view-switcher">
          <button
            type="button"
            role="tab"
            aria-selected={view === "day"}
            onClick={() => onViewChange("day")}
          >
            {t.cal.day}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "week"}
            onClick={() => onViewChange("week")}
          >
            {t.cal.week}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "month"}
            onClick={() => onViewChange("month")}
          >
            {t.cal.month}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "year"}
            onClick={() => onViewChange("year")}
          >
            {yearLabel}
          </button>
        </div>
        <div className="cal-toolbar__nav" aria-label={lang === "zh" ? "日历导航" : "Calendar navigation"}>
          <button
            type="button"
            className="icon-btn"
            onClick={onPrevMonth}
            data-testid="cal-prev-month"
            aria-label={lang === "zh" ? "上一段时间" : "Previous period"}
          >
            <CalIcon name="arrowL" size={16} />
          </button>
          <button
            type="button"
            className="btn ghost btn-today"
            onClick={onResetToday}
            data-testid="cal-today"
          >
            {t.cal.today}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onNextMonth}
            data-testid="cal-next-month"
            aria-label={lang === "zh" ? "下一段时间" : "Next period"}
          >
            <CalIcon name="arrowR" size={16} />
          </button>
        </div>
        <div className="cal-toolbar__settings" ref={settingsRef}>
          <button
            type="button"
            className="icon-btn cal-toolbar__more"
            data-testid="cal-dots"
            aria-label={settingsTitle}
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <CalIcon name="dots" size={16} />
          </button>
          {settingsOpen ? (
            <div className="cal-toolbar__settings-popover" role="menu" aria-label={settingsTitle}>
              <div className="cal-toolbar__settings-title">{settingsTitle}</div>
              <div className="cal-toolbar__settings-group">
                <div className="cal-toolbar__settings-label">{weekStartLabel}</div>
                <div className="cal-toolbar__week-options" role="group" aria-label={weekStartLabel}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={weekStart === 0}
                    onClick={() => handleWeekStartSelect(0)}
                  >
                    <span>{sundayLabel}</span>
                    <span className="cal-toolbar__option-range">
                      {lang === "zh" ? "周日 - 周六" : "Sun - Sat"}
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={weekStart === 1}
                    onClick={() => handleWeekStartSelect(1)}
                  >
                    <span>{mondayLabel}</span>
                    <span className="cal-toolbar__option-range">
                      {lang === "zh" ? "周一 - 周日" : "Mon - Sun"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

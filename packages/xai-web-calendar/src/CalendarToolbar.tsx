/**
 * CalendarToolbar — top header strip.
 *
 * Renders the month title, view-segmented switcher (Day/Week/Month), and
 * month-nav buttons (< / today / >). View buttons flip aria-selected per
 * the prototype.
 *
 * Design: docs/design.md §3.
 */

import type { JSX } from "react";
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
  /**
   * Optional click handler for the `+` button. Added by the 2026-05-27
   * event-create extension (ADR-0010 §D4 carve-out). When absent, the
   * button renders as a no-op (preserves SHIPPED-baseline behavior).
   */
  onAdd?: () => void;
}

export function CalendarToolbar(props: CalendarToolbarProps): JSX.Element {
  const { lang, t, view, onViewChange, displayedMonth, onPrevMonth, onNextMonth, onResetToday, onAdd } =
    props;
  const title = formatMonthTitle(displayedMonth.year, displayedMonth.month, lang, t);
  return (
    <header className="cal-toolbar">
      <button type="button" className="icon-btn" data-testid="cal-list-toggle">
        <CalIcon name="list" size={16} />
      </button>
      <h1 className="module-title">{title}</h1>
      <span className="grow"></span>
      <button
        type="button"
        className="icon-btn"
        data-testid="cal-add"
        onClick={onAdd}
        aria-label="Add event"
      >
        <CalIcon name="plus" size={16} />
      </button>
      <div className="seg" role="tablist" aria-label="calendar-view-switcher">
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
      </div>
      <button
        type="button"
        className="icon-btn"
        onClick={onPrevMonth}
        data-testid="cal-prev-month"
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
      >
        <CalIcon name="arrowR" size={16} />
      </button>
      <button type="button" className="icon-btn" data-testid="cal-dots">
        <CalIcon name="dots" size={16} />
      </button>
    </header>
  );
}

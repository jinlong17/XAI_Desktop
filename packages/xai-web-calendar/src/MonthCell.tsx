/**
 * MonthCell — one day cell in the month grid.
 *
 * - Shows the day number; wraps it in `.today-pill` when the cell matches
 *   the real UTC today AND `cell.inMonth === true` (AC-TODAY-2).
 * - Shows the ISO week number on the leading column only (cells where
 *   `weekNum` is set).
 * - Shows up to 5 event chips, then a `+N` chip for overflow.
 * - Holiday label is rendered when `cell.holidayKey` is set; the i18n
 *   key is looked up via the bundle (en/zh).
 * - `data-focused="true"` is set when the cell's dateKey matches the
 *   deep-link target.
 */

import type { JSX } from "react";
import type { I18NBundle, Lang } from "@repo/plugin-web-tokens";
import type { MonthCellData } from "./internal/monthGridCells.js";
import type { CalEvent } from "./internal/sampleEvents.js";
import type { MergedCalEvent } from "./internal/eventStore/mergeEventsForViewport.js";
import { SAMPLE_BADGE, s } from "./internal/strings.js";

interface MonthCellProps {
  cell: MonthCellData;
  /** Position of the cell within its row, 0..6. Used to gate week-number display. */
  colIndex: number;
  lang: Lang;
  t: I18NBundle;
  /** "YYYY-MM-DD" string for the real UTC today. */
  todayKey: string;
  /** Deep-link target date key (null when none). */
  focusedDate: string | null;
  events: CalEvent[];
  /**
   * Optional click handler for user-source chips. Wired by CalendarModule
   * (2026-05-27 event-create extension). Fixture chips never call this —
   * they are non-editable per Q9-E.
   */
  onUserEventClick?: (userId: string) => void;
  /** Opens the quick-create composer for this date. */
  onDateClick?: (dateKey: string) => void;
}

/** Look up a "cal.holiday_*" key in the bundle. */
function readHolidayLabel(t: I18NBundle, key: string | undefined): string | undefined {
  if (!key) return undefined;
  // key format: "cal.holiday_mayday"
  const parts = key.split(".");
  if (parts.length !== 2 || parts[0] !== "cal") return undefined;
  const leaf = parts[1] as keyof I18NBundle["cal"];
  const value = (t.cal as Record<string, unknown>)[leaf];
  return typeof value === "string" ? value : undefined;
}

export function MonthCell(props: MonthCellProps): JSX.Element {
  const {
    cell,
    colIndex,
    lang,
    t,
    todayKey,
    focusedDate,
    events,
    onUserEventClick,
    onDateClick,
  } = props;
  const isToday = cell.inMonth && cell.dateKey === todayKey;
  const isFocused = cell.dateKey === focusedDate;
  const cls =
    "cal-day" + (cell.inMonth ? "" : " prev") + (isToday ? " today" : "");
  const holidayLabel = readHolidayLabel(t, cell.holidayKey);
  const visibleEvents = events.slice(0, 5);
  const overflow = events.length > 5 ? events.length - 5 : 0;
  const sampleLabel = s(SAMPLE_BADGE, "label", lang);
  return (
    <div
      className={cls}
      data-date={cell.dateKey}
      data-in-month={cell.inMonth}
      data-focused={isFocused ? "true" : undefined}
      role={cell.inMonth && onDateClick ? "button" : undefined}
      tabIndex={cell.inMonth && onDateClick ? 0 : undefined}
      onClick={cell.inMonth && onDateClick ? () => onDateClick(cell.dateKey) : undefined}
      onKeyDown={
        cell.inMonth && onDateClick
          ? (ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onDateClick(cell.dateKey);
              }
            }
          : undefined
      }
    >
      <div className="cal-day-head">
        {colIndex === 0 && cell.weekNum !== undefined ? (
          <span className="cal-week-num">W{cell.weekNum}</span>
        ) : null}
        <span className="cal-day-num">
          {isToday ? <span className="today-pill">{cell.d}</span> : cell.d}
        </span>
        {holidayLabel ? <span className="cal-holiday">{holidayLabel}</span> : null}
      </div>
      {cell.inMonth ? (
        <div className="cal-events">
          {visibleEvents.map((e, ei) => {
            // MergedCalEvent (with `_source`/`_userId`) narrows from CalEvent.
            // Plain fixture rows from the SHIPPED code path lack the meta —
            // treat them as fixture by default.
            const merged = e as MergedCalEvent;
            const source = merged._source ?? "fixture";
            const userId = merged._userId;
            const tag = merged._tag;
            const isUser = source === "user";
            const handleClick = isUser && userId && onUserEventClick
              ? () => onUserEventClick(userId)
              : undefined;
            return (
              <div
                key={ei}
                className={"cal-event ev-" + e.c}
                data-source={source}
                data-user-id={userId}
                title={e.t[lang]}
                onClick={(ev) => {
                  if (!handleClick) return;
                  ev.stopPropagation();
                  handleClick();
                }}
                role={isUser ? "button" : undefined}
                tabIndex={isUser ? 0 : undefined}
                onKeyDown={isUser && handleClick
                  ? (ev) => {
                      ev.stopPropagation();
                      if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        handleClick();
                      }
                    }
                  : undefined}
              >
                <span className="ev-dot"></span>
                <span className="ev-title">{e.t[lang]}</span>
                {tag ? <span className="cal-event-tag">{tag}</span> : null}
                {e.time ? <span className="ev-time mono">{e.time}</span> : null}
                {source === "fixture" ? (
                  <span
                    className="cal-sample-badge"
                    aria-label={lang === "zh" ? "示例事件 — 不可编辑" : "Sample event — not editable"}
                  >
                    {sampleLabel}
                  </span>
                ) : null}
              </div>
            );
          })}
          {overflow > 0 ? <div className="cal-more">+{overflow}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

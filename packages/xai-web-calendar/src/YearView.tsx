/**
 * YearView — 12 compact month grids for cross-year browsing.
 *
 * The year grid mirrors month-view event density with compact Apple-style
 * color dots: each day shows up to three event-color indicators, including
 * fixture/sample rows and persistent user events.
 */

import type { JSX } from "react";
import { useMemo } from "react";
import type { I18NBundle, Lang } from "@repo/plugin-web-tokens";
import { weekdayLabels } from "./internal/weekdays.js";
import { monthGridCells } from "./internal/monthGridCells.js";
import { formatDateKey, tryParseDateKey } from "./internal/parseDateKey.js";
import { SAMPLE_EVENTS, type CalEventsByDay } from "./internal/sampleEvents.js";
import type { UserCalEvent } from "./internal/eventStore/types.js";
import {
  mergeEventsForMonth,
  type MergedCalEvent,
} from "./internal/eventStore/mergeEventsForViewport.js";

interface YearViewProps {
  year: number;
  weekStart: 0 | 1;
  todayKey: string;
  activeDate: string;
  lang: Lang;
  t: I18NBundle;
  userEvents: Record<string, UserCalEvent>;
  onDateClick: (dateKey: string) => void;
  onUserEventClick: (userId: string) => void;
  onOpenMonth: (dateKey: string) => void;
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MAX_YEAR_EVENT_DOTS = 6;
const EMPTY_EVENTS = {} as CalEventsByDay;
const ZH_WEEKDAYS_NARROW = ["日", "一", "二", "三", "四", "五", "六"] as const;

const EN_MONTH_KEYS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

function monthLabel(month: number, lang: Lang, t: I18NBundle): string {
  if (lang === "zh") return `${month} 月`;
  const key = EN_MONTH_KEYS[Math.min(Math.max(month - 1, 0), 11)] ?? "jan";
  return t.common[key];
}

function eventTitle(event: MergedCalEvent, lang: Lang): string {
  return lang === "zh" ? event.t.zh : event.t.en;
}

export function YearView({
  year,
  weekStart,
  todayKey,
  activeDate,
  lang,
  t,
  userEvents,
  onDateClick,
  onUserEventClick,
  onOpenMonth,
}: YearViewProps): JSX.Element {
  const weekdaySource = lang === "zh" ? ZH_WEEKDAYS_NARROW : t.weekdays_short;
  const weekdayHeaders = weekdayLabels(weekdaySource, weekStart).map((label) => label.slice(0, 1));
  const activeMonth = useMemo(() => tryParseDateKey(activeDate), [activeDate]);
  const eventsByMonth = useMemo(() => {
    const byMonth = new Map<number, Record<number, MergedCalEvent[]>>();
    for (const month of MONTHS) {
      const fixture = activeMonth?.year === year && activeMonth.month === month
        ? SAMPLE_EVENTS
        : EMPTY_EVENTS;
      byMonth.set(month, mergeEventsForMonth(fixture, userEvents, year, month));
    }
    return byMonth;
  }, [activeMonth, userEvents, year]);

  return (
    <div className="cal-year-view panel" data-testid="cal-year-view">
      {MONTHS.map((month) => {
        const cells = monthGridCells(year, month, weekStart);
        const events = eventsByMonth.get(month) ?? {};
        const firstDateKey = formatDateKey(year, month, 1);
        return (
          <section key={month} className="cal-year-month" aria-label={monthLabel(month, lang, t)}>
            <button
              type="button"
              className="cal-year-month-title"
              onClick={() => onOpenMonth(firstDateKey)}
            >
              {monthLabel(month, lang, t)}
            </button>
            <div className="cal-year-weekdays" aria-hidden="true">
              {weekdayHeaders.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
            <div className="cal-year-days" role="grid" aria-label={monthLabel(month, lang, t)}>
              {cells.map((cell) => {
                const dayEvents = cell.inMonth ? (events[cell.d] ?? []) : [];
                const visibleEvents = dayEvents.slice(0, MAX_YEAR_EVENT_DOTS);
                const overflow = Math.max(0, dayEvents.length - visibleEvents.length);
                const isToday = cell.dateKey === todayKey;
                const isActive = cell.dateKey === activeDate;
                return (
                  <div
                    key={cell.dateKey}
                    className={`cal-year-day${cell.inMonth ? "" : " is-pad"}${isToday ? " is-today" : ""}${isActive ? " is-active" : ""}`}
                    data-date={cell.dateKey}
                    data-testid={cell.inMonth ? `cal-year-day-${cell.dateKey}` : undefined}
                    role={cell.inMonth ? "gridcell" : undefined}
                    tabIndex={cell.inMonth ? 0 : undefined}
                    onClick={cell.inMonth ? () => onDateClick(cell.dateKey) : undefined}
                    onKeyDown={
                      cell.inMonth
                        ? (ev) => {
                            if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              onDateClick(cell.dateKey);
                            }
                          }
                        : undefined
                    }
                  >
                    {cell.inMonth ? (
                      <>
                        <span className="cal-year-day-num">{cell.d}</span>
                        {visibleEvents.length > 0 ? (
                          <span className="cal-year-event-dots">
                            {visibleEvents.map((event, index) => {
                              const title = eventTitle(event, lang);
                              const tag = event._tag;
                              const userId = event._userId;
                              const label = tag ? `${title}, ${tag}` : title;
                              if (!userId) {
                                return (
                                  <span
                                    key={`${title}-${index}`}
                                    className={`cal-year-event-dot ev-${event.c}`}
                                    title={tag ? `${title} · ${tag}` : title}
                                    aria-label={label}
                                  >
                                    <span />
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={`${userId}-${index}`}
                                  type="button"
                                  className={`cal-year-event-dot ev-${event.c}`}
                                  title={tag ? `${title} · ${tag}` : title}
                                  aria-label={label}
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    onUserEventClick(userId);
                                  }}
                                  onKeyDown={(ev) => ev.stopPropagation()}
                                >
                                  <span />
                                </button>
                              );
                            })}
                            {overflow > 0 ? <span className="cal-year-more">+{overflow}</span> : null}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export type { YearViewProps };

import { useLocalDayClock, startOfLocalDay } from "@repo/plugin-web-tokens";
/**
 * TimeGrid — shared 24-row scaffold for Week and Day views.
 *
 * Props:
 *   columns      7 (Week) | 1 (Day)
 *   dayKeys      ordered array of "YYYY-MM-DD" strings (length === columns)
 *   dayLabels    header label per column (e.g. "Mon 18")
 *   events       SAMPLE_EVENTS (full CalEventsByDay)
 *   activeDate   "YYYY-MM-DD" — gets data-active="true" on its column
 *   todayKey     "YYYY-MM-DD" of actual today (for now-line)
 *   lang         "en" | "zh"
 *
 * Design ref: design.md §15.4 + §15.2 #6.
 * R3: TimeGrid is i18n-agnostic — callers prepare dayLabels at the parent.
 */

import type { JSX } from "react";
import { useMemo } from "react";
import type { CalEventsByDay } from "./internal/sampleEvents.js";
import type { MergedCalEvent } from "./internal/eventStore/mergeEventsForViewport.js";
import { buildHourLabels, HOUR_HEIGHT_PX } from "./internal/timeGridMath.js";
import { placeEventBlocks } from "./internal/placeEventBlocks.js";
import { parseDateKey } from "./internal/parseDateKey.js";
import { TimeGridAllDayStrip } from "./TimeGridAllDayStrip.js";
import { TimeGridDayColumn } from "./TimeGridDayColumn.js";

export interface TimeGridProps {
  columns: number;
  dayKeys: string[];
  dayLabels: string[];
  /**
   * Legacy fixture by-day source (1..31) used by pre-P4 tests/callers.
   * When `eventsByDateKey` is provided, it takes precedence.
   */
  events?: CalEventsByDay;
  /** P4 source: pre-merged fixture+user rows keyed by YYYY-MM-DD. */
  eventsByDateKey?: Record<string, MergedCalEvent[]>;
  activeDate: string;
  todayKey: string;
  lang: "en" | "zh";
  /** Click handler for user events (fixture events remain non-editable). */
  onUserEventClick?: (userId: string) => void;
}

export function TimeGrid({
  dayKeys,
  dayLabels,
  events,
  eventsByDateKey,
  activeDate,
  todayKey,
  lang,
  onUserEventClick,
}: TimeGridProps): JSX.Element {
  // Each displayed civil day has its own actual local elapsed-hour rows.
  const hourLabelsByDay = useMemo(() => {
    return dayKeys.map((dk) => buildHourLabels(dk));
  }, [dayKeys]);

  // Use the first day's hour labels for the left-hand label column
  const primaryHourLabels = hourLabelsByDay[0] ?? buildHourLabels(dayKeys[0] ?? "2026-05-22");

  // Build event blocks for each day
  const blocksByDay = useMemo(() => {
    const map = new Map<string, ReturnType<typeof placeEventBlocks>>();
    for (const dk of dayKeys) {
      const dayEvents = eventsByDateKey
        ? (eventsByDateKey[dk] ?? [])
        : (() => {
            const { day } = parseDateKey(dk);
            return (events?.[day] ?? []) as MergedCalEvent[];
          })();
      map.set(dk, placeEventBlocks(dayEvents, dk));
    }
    return map;
  }, [dayKeys, events, eventsByDateKey]);

  // Now-line position: current hour + minute offset for today
  const { now } = useLocalDayClock();
  const nowLineTopPx = (now.getTime() - startOfLocalDay(now).getTime()) / 3_600_000 * HOUR_HEIGHT_PX;

  const gridCols = `repeat(${dayKeys.length}, 1fr)`;

  return (
    <div className="cal-time-grid" data-testid="cal-time-grid">
      {/* Day header row */}
      <div
        className="cal-week-day-header"
        style={{ gridTemplateColumns: `48px ${gridCols}` }}
      >
        <div /> {/* gutter spacer */}
        {dayKeys.map((dk, i) => (
          <div
            key={dk}
            data-active={dk === activeDate ? "true" : undefined}
          >
            {dayLabels[i] ?? dk}
          </div>
        ))}
      </div>

      {/* All-day strip */}
      <TimeGridAllDayStrip
        dayKeys={dayKeys}
        blocksByDay={blocksByDay}
        lang={lang}
        onUserEventClick={onUserEventClick}
      />

      {/* Scrollable hour grid */}
      <div className="cal-time-scroll" data-testid="cal-time-scroll">
        <div className="cal-time-grid-body">
          {/* Hour label column */}
          <div className="cal-hour-labels" aria-hidden="true">
            {primaryHourLabels.map((label, i) => (
              <div
                key={i}
                className={`cal-hour-label${label.isDst ? " dst" : ""}`}
                style={{ height: `${HOUR_HEIGHT_PX * (label.durationHours ?? 1)}px` }}
              >
                {label.label}
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div
            className="cal-day-columns"
            style={{ gridTemplateColumns: gridCols }}
          >
            {dayKeys.map((dk, i) => {
              const labels = hourLabelsByDay[i] ?? primaryHourLabels;
              const isToday = dk === todayKey;
              const isActive = dk === activeDate;
              const blocks = blocksByDay.get(dk) ?? [];
              return (
                <TimeGridDayColumn
                  key={dk}
                  dateKey={dk}
                  isActive={isActive}
                  isToday={isToday}
                  blocks={blocks}
                  hourLabels={labels}
                  lang={lang}
                  nowLineTopPx={isToday ? nowLineTopPx : null}
                  onUserEventClick={onUserEventClick}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

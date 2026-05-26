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
import { buildHourLabels, HOUR_HEIGHT_PX } from "./internal/timeGridMath.js";
import { placeEventBlocks } from "./internal/placeEventBlocks.js";
import { parseDateKey } from "./internal/parseDateKey.js";
import { TimeGridAllDayStrip } from "./TimeGridAllDayStrip.js";
import { TimeGridDayColumn } from "./TimeGridDayColumn.js";

export interface TimeGridProps {
  columns: number;
  dayKeys: string[];
  dayLabels: string[];
  events: CalEventsByDay;
  activeDate: string;
  todayKey: string;
  lang: "en" | "zh";
}

export function TimeGrid({
  dayKeys,
  dayLabels,
  events,
  activeDate,
  todayKey,
  lang,
}: TimeGridProps): JSX.Element {
  // Build hour labels for the first column (representative day for DST table)
  // For a week view, each day may technically have different DST, but our table
  // only has 2026-03-08 and 2026-11-01 as special days. We use per-day labels.
  const hourLabelsByDay = useMemo(() => {
    return dayKeys.map((dk) => buildHourLabels(dk));
  }, [dayKeys]);

  // Use the first day's hour labels for the left-hand label column
  const primaryHourLabels = hourLabelsByDay[0] ?? buildHourLabels(dayKeys[0] ?? "2026-05-22");

  // Build event blocks for each day
  const blocksByDay = useMemo(() => {
    const map = new Map<string, ReturnType<typeof placeEventBlocks>>();
    for (const dk of dayKeys) {
      const { day } = parseDateKey(dk);
      const dayEvents = events[day] ?? [];
      map.set(dk, placeEventBlocks(dayEvents, dk));
    }
    return map;
  }, [dayKeys, events]);

  // Now-line position: current hour + minute offset for today
  const nowLineTopPx = useMemo(() => {
    const now = new Date();
    const fractionalRow = now.getHours() + now.getMinutes() / 60;
    return fractionalRow * HOUR_HEIGHT_PX;
  }, []);

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
              >
                {label.isDst ? "" : label.label}
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
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * WeekView — 7-column × 24-row time grid.
 *
 * Computes the 7-day window containing `activeDate` (respecting `weekStart`)
 * and passes it to the shared `<TimeGrid />` component.
 *
 * Design ref: design.md §15.4 (component composition) + §15.2 #8 (activeDate
 * column gets data-active="true").
 */

import { useMemo } from "react";
import type { JSX } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { CalEventsByDay } from "./internal/sampleEvents.js";
import type { UserCalEvent } from "./internal/eventStore/types.js";
import { weekWindowFor } from "./internal/weekWindow.js";
import { parseDateKey } from "./internal/parseDateKey.js";
import { mergeEventsForWindow } from "./internal/eventStore/mergeEventsForViewport.js";
import { TimeGrid } from "./TimeGrid.js";

export interface WeekViewProps {
  activeDate: string;
  weekStart: 0 | 1;
  events: CalEventsByDay;
  todayKey: string;
  lang: Lang;
  /**
   * User-created events to merge with the fixture (event-create extension).
   * P3: accepted but not yet wired into rendering (P4 lands integration).
   */
  userEvents?: Record<string, UserCalEvent>;
  /** Click handler for user-source event blocks (wired in P4). */
  onUserEventClick?: (userId: string) => void;
}

/** Short weekday names (Sun-first). */
const DOW_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DOW_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;

export function WeekView({
  activeDate,
  weekStart,
  events,
  todayKey,
  lang,
  userEvents = {},
  onUserEventClick,
}: WeekViewProps): JSX.Element {
  const dayKeys = weekWindowFor(activeDate, weekStart);
  const isZh = lang === "zh";
  const activeMonth = parseDateKey(activeDate);
  const windowStartKey = dayKeys[0] ?? activeDate;
  const windowEndKey = dayKeys[dayKeys.length - 1] ?? activeDate;

  // Build column headers: e.g. "Mon 18" or "一 18"
  const dayLabels = dayKeys.map((dk) => {
    const parsed = parseDateKey(dk);
    const d = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
    const dow = d.getUTCDay(); // 0=Sun
    const name = isZh ? DOW_NAMES_ZH[dow] : DOW_NAMES_EN[dow];
    return `${name ?? ""} ${parsed.day}`;
  });

  const mergedEventsByDateKey = useMemo(
    () =>
      mergeEventsForWindow(
        events,
        { year: activeMonth.year, month: activeMonth.month },
        userEvents,
        windowStartKey,
        windowEndKey,
      ),
    [events, activeMonth.year, activeMonth.month, userEvents, windowStartKey, windowEndKey],
  );

  return (
    <TimeGrid
      columns={7}
      dayKeys={dayKeys}
      dayLabels={dayLabels}
      eventsByDateKey={mergedEventsByDateKey}
      activeDate={activeDate}
      todayKey={todayKey}
      lang={lang === "zh" ? "zh" : "en"}
      onUserEventClick={onUserEventClick}
    />
  );
}

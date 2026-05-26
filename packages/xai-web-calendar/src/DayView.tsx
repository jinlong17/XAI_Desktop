/**
 * DayView — 1-column × 24-row time grid for a single day.
 *
 * Uses the shared `<TimeGrid columns=1 />` component.
 * Adds scroll-to-current-hour on mount (8 AM fallback when activeDate ≠ today).
 *
 * Design ref: design.md §15.4 + Q7 (scroll-anchor).
 */

import type { JSX } from "react";
import { useEffect, useRef } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { CalEventsByDay } from "./internal/sampleEvents.js";
import { parseDateKey } from "./internal/parseDateKey.js";
import { HOUR_HEIGHT_PX } from "./internal/timeGridMath.js";
import { TimeGrid } from "./TimeGrid.js";

export interface DayViewProps {
  activeDate: string;
  events: CalEventsByDay;
  todayKey: string;
  lang: Lang;
}

/** Short weekday names for the single column header. */
const DOW_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DOW_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;

export function DayView({ activeDate, events, todayKey, lang }: DayViewProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll-to-current-hour on mount.
  // If activeDate === today → scroll to current hour.
  // Else → scroll to 8 AM (default business-hour anchor).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollEl = container.querySelector<HTMLDivElement>('[data-testid="cal-time-scroll"]');
    if (!scrollEl) return;
    const targetHour = activeDate === todayKey ? new Date().getHours() : 8;
    scrollEl.scrollTop = targetHour * HOUR_HEIGHT_PX;
  }, [activeDate, todayKey]);

  const { year, month, day } = parseDateKey(activeDate);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dow = d.getUTCDay();
  const isZh = lang === "zh";
  const dayName = isZh ? DOW_NAMES_ZH[dow] : DOW_NAMES_EN[dow];
  const dayLabel = `${dayName ?? ""} ${day}`;

  return (
    <div ref={containerRef} data-testid="cal-day-view">
      <TimeGrid
        columns={1}
        dayKeys={[activeDate]}
        dayLabels={[dayLabel]}
        events={events}
        activeDate={activeDate}
        todayKey={todayKey}
        lang={lang === "zh" ? "zh" : "en"}
      />
    </div>
  );
}

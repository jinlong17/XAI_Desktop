/**
 * TimeGridDayColumn — a single day column within the time grid.
 *
 * Renders the hour-row grid lines as a background and then absolutely
 * positions timed EventBlocks on top.
 *
 * Also renders the now-line if this column corresponds to today.
 *
 * Design ref: design.md §15.4 + §15.8.
 */

import type { JSX } from "react";
import type { EventBlock as EventBlockData } from "./internal/placeEventBlocks.js";
import type { HourLabel } from "./internal/timeGridMath.js";
import { TimeGridHourRow } from "./TimeGridHourRow.js";
import { EventBlock } from "./EventBlock.js";

interface TimeGridDayColumnProps {
  dateKey: string;
  isActive: boolean;
  isToday: boolean;
  blocks: EventBlockData[];
  hourLabels: HourLabel[];
  lang: "en" | "zh";
  nowLineTopPx: number | null; // null means no now-line for this column
  onUserEventClick?: (userId: string) => void;
}

export function TimeGridDayColumn({
  dateKey,
  isActive,
  isToday,
  blocks,
  hourLabels,
  lang,
  nowLineTopPx,
  onUserEventClick,
}: TimeGridDayColumnProps): JSX.Element {
  const timedBlocks = blocks.filter((b) => !b.allDay);

  return (
    <div
      className="cal-day-column"
      data-active={isActive ? "true" : undefined}
      data-date={dateKey}
      data-testid={`cal-day-col-${dateKey}`}
    >
      {/* Background hour-row grid lines */}
      {hourLabels.map((label, i) => (
        <TimeGridHourRow key={i} label={label} />
      ))}

      {/* Timed event blocks — absolutely positioned */}
      {timedBlocks.map((block, i) => (
        <EventBlock
          key={i}
          block={block}
          lang={lang}
          onUserEventClick={onUserEventClick}
        />
      ))}

      {/* Now-line — only on today's column */}
      {isToday && nowLineTopPx !== null && (
        <div
          className="cal-now-line"
          style={{ top: `${nowLineTopPx}px` }}
          aria-hidden="true"
          data-testid="cal-now-line"
        />
      )}
    </div>
  );
}

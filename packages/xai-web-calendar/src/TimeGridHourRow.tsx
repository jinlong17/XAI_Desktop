/**
 * TimeGridHourRow — a single hour row in the time grid.
 *
 * Used by TimeGridDayColumn to paint the background grid lines.
 * DST rows get a special "(DST)" label.
 *
 * Design ref: design.md §15.8 cal-hour-row.
 */

import type { JSX } from "react";
import type { HourLabel } from "./internal/timeGridMath.js";

interface TimeGridHourRowProps {
  label: HourLabel;
}

export function TimeGridHourRow({ label }: TimeGridHourRowProps): JSX.Element {
  return (
    <div className={`cal-hour-row${label.isDst ? " dst" : ""}`} style={{ height: `${48 * (label.durationHours ?? 1)}px` }}>
      {label.isDst && <span className="cal-dst-label">{label.label}</span>}
    </div>
  );
}

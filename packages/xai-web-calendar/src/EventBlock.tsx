/**
 * EventBlock — renders a single positioned timed event within a day column.
 *
 * Positioning: absolutely placed using top% + height% derived from startRow/rowSpan.
 * Width: (1 / colSpan) fraction of the column, offset by col/colSpan.
 *
 * Design ref: design.md §15.4 + §15.8 cal-event-block styles.
 * R3: EventBlock is i18n-agnostic; callers pass the bilingual title directly.
 */

import type { JSX } from "react";
import type { EventBlock as EventBlockData } from "./internal/placeEventBlocks.js";
import { HOUR_HEIGHT_PX } from "./internal/timeGridMath.js";

interface EventBlockProps {
  block: EventBlockData;
  /** Bilingual preference — caller passes "en" or "zh" title */
  lang: "en" | "zh";
}

export function EventBlock({ block, lang }: EventBlockProps): JSX.Element {
  const { event, startRow, rowSpan, col, colSpan } = block;
  const title = lang === "zh" ? event.t.zh : event.t.en;
  const timeLabel = event.time ?? "";

  // Pixel-exact positioning (matches HOUR_HEIGHT_PX = 48)
  const top = startRow * HOUR_HEIGHT_PX;
  const height = Math.max(rowSpan * HOUR_HEIGHT_PX, 20); // min 20px so text is readable

  // Width fraction: each column gets equal share
  const widthPct = 100 / colSpan;
  const leftPct = (col * 100) / colSpan;

  return (
    <div
      className={`cal-event-block ev-${event.c}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPct}%`,
        width: `calc(${widthPct}% - 8px)`,
      }}
      aria-label={title}
      title={title}
    >
      <div className="ev-title">{title}</div>
      {timeLabel && <div className="ev-time">{timeLabel}</div>}
    </div>
  );
}

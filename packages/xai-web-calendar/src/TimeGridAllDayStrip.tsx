/**
 * TimeGridAllDayStrip — sticky strip above the scrollable hour grid.
 *
 * Renders all-day events (no `time` field) in a fixed-height area.
 * One column per day; each column shows the all-day events for that day.
 *
 * Design ref: design.md §15.4 + Q9 (all-day strip).
 * R3: i18n-agnostic — callers pass the lang prop; event titles resolved here.
 */

import type { JSX } from "react";
import type { EventBlock } from "./internal/placeEventBlocks.js";

interface TimeGridAllDayStripProps {
  /** Date keys for each column (7 for Week, 1 for Day) */
  dayKeys: string[];
  /** Map from dateKey → EventBlock[] for that day */
  blocksByDay: Map<string, EventBlock[]>;
  /** Language preference */
  lang: "en" | "zh";
  /** Called only for user-source events. */
  onUserEventClick?: (userId: string) => void;
}

export function TimeGridAllDayStrip({
  dayKeys,
  blocksByDay,
  lang,
  onUserEventClick,
}: TimeGridAllDayStripProps): JSX.Element {
  const cols = dayKeys.length;
  return (
    <div
      className="cal-allday-strip"
      style={{ gridTemplateColumns: `48px repeat(${cols}, 1fr)` }}
    >
      {/* Left gutter label */}
      <div className="cal-allday-strip-label">all-day</div>
      {dayKeys.map((dk) => {
        const allDayBlocks = (blocksByDay.get(dk) ?? []).filter((b) => b.allDay);
        return (
          <div key={dk} className="cal-allday-cell">
            {allDayBlocks.map((b, i) => {
              const title = lang === "zh" ? b.event.t.zh : b.event.t.en;
              const source = (b.event as { _source?: "fixture" | "user" })._source ?? "fixture";
              const userId = (b.event as { _userId?: string })._userId;
              const tag = (b.event as { _tag?: string })._tag;
              const isUser = source === "user" && !!userId;
              return (
                <div
                  key={i}
                  className={`cal-allday-event ev-${b.event.c}`}
                  data-source={source}
                  data-user-id={userId}
                  role={isUser ? "button" : undefined}
                  tabIndex={isUser ? 0 : undefined}
                  onClick={isUser && onUserEventClick ? () => onUserEventClick(userId) : undefined}
                  onKeyDown={
                    isUser && onUserEventClick
                      ? (ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            onUserEventClick(userId);
                          }
                        }
                      : undefined
                  }
                  aria-label={title}
                  title={title}
                >
                  <span className="ev-title">{title}</span>
                  {tag ? <span className="cal-event-tag">{tag}</span> : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

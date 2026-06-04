/**
 * MonthRow — one row of 7 cells in the month grid.
 */

import type { JSX } from "react";
import type { I18NBundle, Lang } from "@repo/plugin-web-tokens";
import type { MonthCellData } from "./internal/monthGridCells.js";
import type { CalEventsByDay } from "./internal/sampleEvents.js";
import { MonthCell } from "./MonthCell.js";

interface MonthRowProps {
  cells: MonthCellData[];
  lang: Lang;
  t: I18NBundle;
  todayKey: string;
  focusedDate: string | null;
  events: CalEventsByDay;
  displayedMonth: { year: number; month: number };
  /** Forwarded from CalendarModule via MonthGrid for user-event click handling. */
  onUserEventClick?: (userId: string) => void;
  /** Opens the quick-create composer for a concrete date. */
  onDateClick?: (dateKey: string) => void;
}

export function MonthRow(props: MonthRowProps): JSX.Element {
  const {
    cells,
    lang,
    t,
    todayKey,
    focusedDate,
    events,
    displayedMonth,
    onUserEventClick,
    onDateClick,
  } = props;
  return (
    <div className="cal-row">
      {cells.map((cell, ci) => {
        // Only show events for in-month cells; events keyed by day-of-month
        // are taken from the displayed month's fixture.
        const cellEvents =
          cell.inMonth &&
          cell.year === displayedMonth.year &&
          cell.month === displayedMonth.month
            ? (events[cell.d] ?? [])
            : [];
        return (
          <MonthCell
            key={ci}
            cell={cell}
            colIndex={ci}
            lang={lang}
            t={t}
            todayKey={todayKey}
            focusedDate={focusedDate}
            events={cellEvents}
            onUserEventClick={onUserEventClick}
            onDateClick={onDateClick}
          />
        );
      })}
    </div>
  );
}

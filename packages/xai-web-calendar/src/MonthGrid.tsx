/**
 * MonthGrid — weekday header + N rows of cells.
 */

import type { JSX } from "react";
import { useMemo } from "react";
import type { I18NBundle, Lang } from "@repo/plugin-web-tokens";
import { WeekdayHeader } from "./WeekdayHeader.js";
import { MonthRow } from "./MonthRow.js";
import { monthGridCells } from "./internal/monthGridCells.js";
import type { CalEventsByDay } from "./internal/sampleEvents.js";

interface MonthGridProps {
  year: number;
  month: number;
  weekStart: 0 | 1;
  lang: Lang;
  t: I18NBundle;
  todayKey: string;
  focusedDate: string | null;
  events: CalEventsByDay;
}

export function MonthGrid(props: MonthGridProps): JSX.Element {
  const { year, month, weekStart, lang, t, todayKey, focusedDate, events } = props;
  const cells = useMemo(
    () => monthGridCells(year, month, weekStart),
    [year, month, weekStart],
  );
  const rows: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return (
    <div className="cal-grid panel">
      <WeekdayHeader weekStart={weekStart} t={t} lang={lang} />
      <div className="cal-rows" role="rowgroup">
        {rows.map((row, ri) => (
          <MonthRow
            key={ri}
            cells={row}
            lang={lang}
            t={t}
            todayKey={todayKey}
            focusedDate={focusedDate}
            events={events}
            displayedMonth={{ year, month }}
          />
        ))}
      </div>
    </div>
  );
}

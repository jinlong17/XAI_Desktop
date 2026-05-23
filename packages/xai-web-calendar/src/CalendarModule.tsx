/**
 * CalendarModule — top-level calendar surface.
 *
 * Composition: CalendarToolbar (header) + MonthGrid (when view === "month")
 * / ComingSoonPanel (otherwise) + CalendarBanner (footer).
 *
 * State:
 *   - view              local CalendarView
 *   - displayedMonth    { year, month: 1..12 } — defaults to May 2026 anchor
 *   - focusedDate       string | null (set by deep-link)
 *   - weekStart         from usePref("xai_pref_week_start", 0)
 *
 * Deep-link contract: listens on `web:shell:module-change` filtered to
 * `moduleId === "calendar"`. When `focusDate` is present, navigates
 * `displayedMonth` to (y, m) and sets `focusedDate` so the matching cell
 * gets a `data-focused="true"` outline.
 *
 * Listen-only — does NOT emit any web:* event (asserted by AC-EVENT-7).
 *
 * Design: docs/design.md §3 + §7 + §12.
 */

import "./styles.css";

import type { JSX } from "react";
import { useMemo, useState, useCallback } from "react";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { useWebEventListener } from "@repo/xai-web-event-bus";
import type { CalendarModuleProps, CalendarView, DisplayedMonth } from "./types.js";
import { CalendarToolbar } from "./CalendarToolbar.js";
import { MonthGrid } from "./MonthGrid.js";
import { CalendarBanner } from "./CalendarBanner.js";
import { ComingSoonPanel } from "./ComingSoonPanel.js";
import { SAMPLE_EVENTS } from "./internal/sampleEvents.js";
import { utcDateKey } from "./internal/dateKeys.js";

/** Design-source anchor: May 2026 matches the sample-event fixture. */
const DEFAULT_DISPLAYED_MONTH: DisplayedMonth = { year: 2026, month: 5 };

function stepDisplayedMonth(current: DisplayedMonth, delta: number): DisplayedMonth {
  const m = current.month + delta;
  if (m < 1) return { year: current.year - 1, month: 12 };
  if (m > 12) return { year: current.year + 1, month: 1 };
  return { year: current.year, month: m };
}

/** Parse "YYYY-MM-DD" into validated parts; returns null if malformed. */
function parseFocusDate(s: string): { year: number; month: number; day: number } | null {
  const parts = s.split("-");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
}

export function CalendarModule({ lang }: CalendarModuleProps): JSX.Element {
  const { t } = useI18n(lang);
  const [weekStartRaw] = usePref("xai_pref_week_start", 0);
  // Narrow registry value (typed as 0 by `default` inference) to the 0|1 union.
  // The registry `satisfies PrefEntry<0 | 1>` constrains the underlying type,
  // but `WebPrefValue` projects only the `default` literal, hence the cast +
  // runtime guard.
  const weekStart: 0 | 1 = (weekStartRaw as unknown as number) === 1 ? 1 : 0;
  const [view, setView] = useState<CalendarView>("month");
  const [displayedMonth, setDisplayedMonth] = useState<DisplayedMonth>(DEFAULT_DISPLAYED_MONTH);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);

  // Today is captured once per mount per design.md §6 / Q8 = I1.
  const todayKey = useMemo(() => utcDateKey(new Date()), []);

  const handlePrevMonth = useCallback(() => {
    setDisplayedMonth((m) => stepDisplayedMonth(m, -1));
    setFocusedDate(null);
  }, []);

  const handleNextMonth = useCallback(() => {
    setDisplayedMonth((m) => stepDisplayedMonth(m, +1));
    setFocusedDate(null);
  }, []);

  const handleResetToday = useCallback(() => {
    setDisplayedMonth(DEFAULT_DISPLAYED_MONTH);
    setFocusedDate(null);
  }, []);

  // Deep-link receive (web:shell:module-change, moduleId === "calendar").
  useWebEventListener("web:shell:module-change", (payload) => {
    if (payload.moduleId !== "calendar") return;
    if (!payload.focusDate) return;
    const parsed = parseFocusDate(payload.focusDate);
    if (!parsed) {
      console.warn(
        "[xai-web-calendar] malformed focusDate payload",
        payload.focusDate,
      );
      return;
    }
    setDisplayedMonth((cur) => {
      if (cur.year === parsed.year && cur.month === parsed.month) return cur;
      return { year: parsed.year, month: parsed.month };
    });
    setFocusedDate(payload.focusDate);
  });

  return (
    <div className="module module-cal">
      <CalendarToolbar
        lang={lang}
        t={t}
        view={view}
        onViewChange={setView}
        displayedMonth={displayedMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onResetToday={handleResetToday}
      />
      {view === "month" ? (
        <MonthGrid
          year={displayedMonth.year}
          month={displayedMonth.month}
          weekStart={weekStart}
          lang={lang}
          t={t}
          todayKey={todayKey}
          focusedDate={focusedDate}
          events={SAMPLE_EVENTS}
        />
      ) : (
        <ComingSoonPanel t={t} />
      )}
      <CalendarBanner t={t} />
    </div>
  );
}

export default CalendarModule;

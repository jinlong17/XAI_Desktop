/**
 * CalendarModule — top-level calendar surface.
 *
 * Composition: CalendarToolbar (header) + MonthGrid/WeekView/DayView (body)
 * + CalendarBanner (footer).
 *
 * State (post gap-closure row #4 refactor — design.md §15.2 #3):
 *   - view                  CalendarView (persisted via xai_calendar_view usePref — wired in P4)
 *   - activeDate            "YYYY-MM-DD" — single source of truth
 *   - focusedFromDeepLink   string | null (set ONLY by deep-link; cleared on nav)
 *   - weekStart             from usePref("xai_pref_week_start", 0)
 *
 * displayedMonth is DERIVED from activeDate via dateKeyMonth(activeDate).
 * This preserves external behavior (toolbar, deep-link, week-start, today-pill)
 * while enabling Week/Day views to use activeDate directly.
 *
 * Deep-link contract: listens on `web:shell:module-change` filtered to
 * `moduleId === "calendar"`. When `focusDate` is present, sets activeDate and
 * focusedFromDeepLink (Month gets `.cal-day[data-focused]` outline).
 * Deep-link ALSO forces view = "month" per design.md §15.2 #9.
 *
 * Nav arrows step:
 *   view=month → ±1 month (existing behavior, AC-NAV-1..6 preserved)
 *   view=week  → ±7 days  (P4 wires CalendarToolbar)
 *   view=day   → ±1 day   (P4 wires CalendarToolbar)
 *
 * Listen-only — does NOT emit any web:* event (asserted by AC-EVENT-7).
 *
 * Design: docs/design.md §3 + §7 + §12 + §15.
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
import { tryParseDateKey, dateKeyMonth, formatDateKey } from "./internal/parseDateKey.js";

/**
 * Design-source anchor: May 22, 2026 matches the sample-event fixture and the
 * design-anchor month May 2026. Used as the "today" reset target.
 * FIXME-ROW: flip to currentDateKey() once Settings W4 real-current date lands.
 */
const MAY_2026_ANCHOR_TODAY = "2026-05-22";

export function CalendarModule({ lang }: CalendarModuleProps): JSX.Element {
  const { t } = useI18n(lang);
  const [weekStartRaw] = usePref("xai_pref_week_start", 0);
  const weekStart: 0 | 1 = (weekStartRaw as unknown as number) === 1 ? 1 : 0;

  // P1: still local useState; P4 wires view to usePref("xai_calendar_view")
  const [view, setView] = useState<CalendarView>("month");

  // activeDate replaces (displayedMonth, focusedDate) — design.md §15.2 #3
  const [activeDate, setActiveDate] = useState<string>(MAY_2026_ANCHOR_TODAY);
  // focusedFromDeepLink is the renamed focusedDate — set ONLY by deep-link
  const [focusedFromDeepLink, setFocusedFromDeepLink] = useState<string | null>(null);

  // displayedMonth is derived from activeDate (not stored separately).
  const displayedMonth: DisplayedMonth = useMemo(
    () => dateKeyMonth(activeDate),
    [activeDate],
  );

  // Today is captured once per mount per design.md §6 / Q8 = I1.
  const todayKey = useMemo(() => utcDateKey(new Date()), []);

  // --- Navigation handlers ---------------------------------------------------

  const handlePrevMonth = useCallback(() => {
    setActiveDate((cur) => {
      // Step by -1 month: move to the same day in the prior month (clamped to month-end).
      const { year, month, day } = tryParseDateKey(cur) ?? { year: 2026, month: 5, day: 22 };
      let newMonth = month - 1;
      let newYear = year;
      if (newMonth < 1) { newMonth = 12; newYear -= 1; }
      // Clamp day to valid range in the new month
      const maxDay = new Date(newYear, newMonth, 0).getDate();
      const clampedDay = Math.min(day, maxDay);
      return formatDateKey(newYear, newMonth, clampedDay);
    });
    setFocusedFromDeepLink(null);
  }, []);

  const handleNextMonth = useCallback(() => {
    setActiveDate((cur) => {
      const { year, month, day } = tryParseDateKey(cur) ?? { year: 2026, month: 5, day: 22 };
      let newMonth = month + 1;
      let newYear = year;
      if (newMonth > 12) { newMonth = 1; newYear += 1; }
      const maxDay = new Date(newYear, newMonth, 0).getDate();
      const clampedDay = Math.min(day, maxDay);
      return formatDateKey(newYear, newMonth, clampedDay);
    });
    setFocusedFromDeepLink(null);
  }, []);

  const handleResetToday = useCallback(() => {
    setActiveDate(MAY_2026_ANCHOR_TODAY);
    setFocusedFromDeepLink(null);
  }, []);

  // --- Deep-link receive -----------------------------------------------------
  // Deep-link forces view = "month" per design.md §15.2 #9.
  useWebEventListener("web:shell:module-change", (payload) => {
    if (payload.moduleId !== "calendar") return;
    if (!payload.focusDate) return;
    const parsed = tryParseDateKey(payload.focusDate);
    if (!parsed) {
      console.warn(
        "[xai-web-calendar] malformed focusDate payload",
        payload.focusDate,
      );
      return;
    }
    // Deep-link forces month view (AC-DEEPLINK-EXT-1 + design §15.2 #9)
    setView("month");
    setActiveDate(payload.focusDate);
    setFocusedFromDeepLink(payload.focusDate);
  });

  // --- Render ----------------------------------------------------------------

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
          focusedDate={focusedFromDeepLink}
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

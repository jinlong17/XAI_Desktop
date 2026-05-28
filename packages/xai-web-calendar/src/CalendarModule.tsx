/**
 * CalendarModule — top-level calendar surface.
 *
 * Composition: CalendarToolbar (header) + MonthGrid/WeekView/DayView (body)
 * + CalendarBanner (footer).
 *
 * State (gap-closure row #4 — design.md §15.2 #3):
 *   - view                  CalendarView — persisted via xai_calendar_view (P4)
 *   - activeDate            "YYYY-MM-DD" — single source of truth
 *   - focusedFromDeepLink   string | null (set ONLY by deep-link; cleared on nav)
 *   - weekStart             from usePref("xai_pref_week_start", 0)
 *
 * displayedMonth is DERIVED from activeDate via dateKeyMonth(activeDate).
 *
 * Nav arrow step depends on view:
 *   month → ±1 month
 *   week  → ±7 days
 *   day   → ±1 day
 *
 * Deep-link forces view = "month" (design.md §15.2 #9).
 * ComingSoonPanel removed in P4 (all 3 views now functional).
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
import { SAMPLE_EVENTS } from "./internal/sampleEvents.js";
import { utcDateKey } from "./internal/dateKeys.js";
import { tryParseDateKey, dateKeyMonth, formatDateKey, stepDateKey } from "./internal/parseDateKey.js";
import { WeekView } from "./WeekView.js";
import { DayView } from "./DayView.js";
import { EventComposer } from "./EventComposer.js";
import { EmptyStateHint } from "./EmptyStateHint.js";
import { useUserCalEvents } from "./internal/eventStore/useUserCalEvents.js";
import { mergeEventsForMonth } from "./internal/eventStore/mergeEventsForViewport.js";
import type { UserCalEvent } from "./internal/eventStore/types.js";

/**
 * Design-source anchor: May 22, 2026 matches the sample-event fixture and the
 * design-anchor month May 2026. Used as the "today" reset target.
 * FIXME-ROW: flip to currentDateKey() once Settings W4 real-current date lands.
 */
const MAY_2026_ANCHOR_TODAY = "2026-05-22";

/** Narrow the raw registry string to the CalendarView union. */
function toView(raw: string): CalendarView {
  if (raw === "week" || raw === "day") return raw;
  return "month";
}

interface ComposerState {
  open: boolean;
  mode: "create" | "edit";
  editing: UserCalEvent | null;
}

const COMPOSER_CLOSED: ComposerState = { open: false, mode: "create", editing: null };

export function CalendarModule({ lang }: CalendarModuleProps): JSX.Element {
  const { t } = useI18n(lang);
  const [weekStartRaw] = usePref("xai_pref_week_start", 0);
  const weekStart: 0 | 1 = (weekStartRaw as unknown as number) === 1 ? 1 : 0;

  // P4: view is now persisted via xai_calendar_view.
  const [viewRaw, setViewPref] = usePref("xai_calendar_view", "month");
  const view: CalendarView = toView(viewRaw as string);

  // Wrap setViewPref to enforce CalendarView typing.
  const setView = useCallback((v: CalendarView) => {
    setViewPref(v);
  }, [setViewPref]);

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

  // --- Event-create extension (2026-05-27 — HC8 lift) ----------------------
  // User-created events stored via xai_calendar_events; CRUD via the hook.
  const { events: userEvents, list: userEventList, create, update, remove, getById } =
    useUserCalEvents();

  const [composer, setComposer] = useState<ComposerState>(COMPOSER_CLOSED);

  const handleAddClick = useCallback(() => {
    setComposer({ open: true, mode: "create", editing: null });
  }, []);

  const handleUserEventClick = useCallback(
    (userId: string) => {
      const userEvent = getById(userId);
      if (!userEvent) return;
      setComposer({ open: true, mode: "edit", editing: userEvent });
    },
    [getById],
  );

  const handleComposerClose = useCallback(() => {
    setComposer(COMPOSER_CLOSED);
  }, []);

  const handleComposerSave = useCallback(
    (event: UserCalEvent) => {
      if (composer.mode === "edit" && composer.editing) {
        update(composer.editing.id, {
          title: event.title,
          startISO: event.startISO,
          endISO: event.endISO,
          colorPreset: event.colorPreset,
          recurrence: event.recurrence,
        });
      } else {
        create({
          title: event.title,
          startISO: event.startISO,
          endISO: event.endISO,
          colorPreset: event.colorPreset,
          recurrence: event.recurrence,
        });
      }
      setComposer(COMPOSER_CLOSED);
    },
    [composer, create, update],
  );

  const handleComposerDelete = useCallback(
    (id: string) => {
      remove(id);
      // composer.onDelete already calls onClose internally; we still snap
      // state back to ensure no edge case leaves the dialog open.
      setComposer(COMPOSER_CLOSED);
    },
    [remove],
  );

  // Merge fixture + user events for the Month view.
  const monthMergedEvents = useMemo(
    () => mergeEventsForMonth(SAMPLE_EVENTS, userEvents, displayedMonth.year, displayedMonth.month),
    [userEvents, displayedMonth.year, displayedMonth.month],
  );

  const hasUserEvents = userEventList.length > 0;
  const showBanner = !hasUserEvents;

  // --- Navigation handlers (step depends on view) ----------------------------

  const handlePrevMonth = useCallback(() => {
    setActiveDate((cur) => {
      if (view === "week") return stepDateKey(cur, -7);
      if (view === "day") return stepDateKey(cur, -1);
      // Month: step to same day in prior month (clamped to month-end)
      const { year, month, day } = tryParseDateKey(cur) ?? { year: 2026, month: 5, day: 22 };
      let newMonth = month - 1;
      let newYear = year;
      if (newMonth < 1) { newMonth = 12; newYear -= 1; }
      const maxDay = new Date(newYear, newMonth, 0).getDate();
      const clampedDay = Math.min(day, maxDay);
      return formatDateKey(newYear, newMonth, clampedDay);
    });
    setFocusedFromDeepLink(null);
  }, [view]);

  const handleNextMonth = useCallback(() => {
    setActiveDate((cur) => {
      if (view === "week") return stepDateKey(cur, 7);
      if (view === "day") return stepDateKey(cur, 1);
      // Month: step to same day in next month (clamped to month-end)
      const { year, month, day } = tryParseDateKey(cur) ?? { year: 2026, month: 5, day: 22 };
      let newMonth = month + 1;
      let newYear = year;
      if (newMonth > 12) { newMonth = 1; newYear += 1; }
      const maxDay = new Date(newYear, newMonth, 0).getDate();
      const clampedDay = Math.min(day, maxDay);
      return formatDateKey(newYear, newMonth, clampedDay);
    });
    setFocusedFromDeepLink(null);
  }, [view]);

  const handleResetToday = useCallback(() => {
    setActiveDate(MAY_2026_ANCHOR_TODAY);
    setFocusedFromDeepLink(null);
    // view preserved across today reset per design.md §15.6
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
        onAdd={handleAddClick}
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
          events={monthMergedEvents}
          onUserEventClick={handleUserEventClick}
        />
      ) : view === "week" ? (
        <WeekView
          activeDate={activeDate}
          weekStart={weekStart}
          events={SAMPLE_EVENTS}
          todayKey={todayKey}
          lang={lang}
          userEvents={userEvents}
          onUserEventClick={handleUserEventClick}
        />
      ) : (
        <DayView
          activeDate={activeDate}
          events={SAMPLE_EVENTS}
          todayKey={todayKey}
          lang={lang}
          userEvents={userEvents}
          onUserEventClick={handleUserEventClick}
        />
      )}
      {!hasUserEvents ? <EmptyStateHint lang={lang} /> : null}
      {showBanner ? <CalendarBanner t={t} /> : null}
      <EventComposer
        open={composer.open}
        mode={composer.mode}
        event={composer.editing}
        lang={lang}
        defaultDateKey={todayKey}
        onSave={handleComposerSave}
        onDelete={handleComposerDelete}
        onClose={handleComposerClose}
      />
    </div>
  );
}

export default CalendarModule;

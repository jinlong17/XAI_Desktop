import { useLocalDayClock } from "@repo/plugin-web-tokens";
/**
 * CalendarModule — top-level calendar surface.
 *
 * Composition: CalendarToolbar (header) + YearView/MonthGrid/WeekView/DayView (body)
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
 *   year  → ±1 year
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
import {
  boardCalendarEventsByDate,
  mergeEventsForMonth as mergeBoardFeedForMonth,
} from "./internal/boardCalendarFeed.js";
import { tryParseDateKey, dateKeyMonth, formatDateKey, stepDateKey } from "./internal/parseDateKey.js";
import { WeekView } from "./WeekView.js";
import { DayView } from "./DayView.js";
import { YearView } from "./YearView.js";
import { EventComposer } from "./EventComposer.js";
import { DayOverview } from "./DayOverview.js";
import { EmptyStateHint } from "./EmptyStateHint.js";
import { useUserCalEvents } from "./internal/eventStore/useUserCalEvents.js";
import { mergeEventsForMonth } from "./internal/eventStore/mergeEventsForViewport.js";
import type { UserCalEvent } from "./internal/eventStore/types.js";

/** Narrow the raw registry string to the CalendarView union. */
function toView(raw: string): CalendarView {
  if (raw === "year") return raw;
  if (raw === "week" || raw === "day") return raw;
  return "month";
}

interface ComposerState {
  open: boolean;
  mode: "create" | "edit";
  editing: UserCalEvent | null;
  defaultDateKey?: string;
}

const COMPOSER_CLOSED: ComposerState = { open: false, mode: "create", editing: null };

export function CalendarModule({ lang }: CalendarModuleProps): JSX.Element {
  const { t } = useI18n(lang);
  const [weekStartRaw, setWeekStartPref] = usePref("xai_pref_week_start", 0);
  const weekStart: 0 | 1 = (weekStartRaw as unknown as number) === 1 ? 1 : 0;
  const [rawBoards] = usePref("xai_boards_v2");

  // P4: view is now persisted via xai_calendar_view.
  const [viewRaw, setViewPref] = usePref("xai_calendar_view", "month");
  const view: CalendarView = toView(viewRaw as string);
  const { dayKey: todayKey } = useLocalDayClock();

  // Wrap setViewPref to enforce CalendarView typing.
  const setView = useCallback((v: CalendarView) => {
    setViewPref(v);
  }, [setViewPref]);

  const handleWeekStartChange = useCallback((nextWeekStart: 0 | 1) => {
    setWeekStartPref(nextWeekStart as unknown as 0);
  }, [setWeekStartPref]);

  // activeDate replaces (displayedMonth, focusedDate) — design.md §15.2 #3
  const [activeDate, setActiveDate] = useState<string>(() => todayKey);
  // focusedFromDeepLink is the renamed focusedDate — set ONLY by deep-link
  const [focusedFromDeepLink, setFocusedFromDeepLink] = useState<string | null>(null);

  // displayedMonth is derived from activeDate (not stored separately).
  const displayedMonth: DisplayedMonth = useMemo(
    () => dateKeyMonth(activeDate),
    [activeDate],
  );

  // --- Event-create extension (2026-05-27 — HC8 lift) ----------------------
  // User-created events stored via xai_calendar_events; CRUD via the hook.
  const { events: userEvents, list: userEventList, create, update, remove, getById } =
    useUserCalEvents();
  const boardEventsByDate = useMemo(
    () => boardCalendarEventsByDate(rawBoards),
    [rawBoards],
  );

  const [composer, setComposer] = useState<ComposerState>(COMPOSER_CLOSED);
  const [overviewDateKey, setOverviewDateKey] = useState<string | null>(null);

  const handleAddClick = useCallback(() => {
    setOverviewDateKey(null);
    setComposer({ open: true, mode: "create", editing: null, defaultDateKey: todayKey });
  }, [todayKey]);

  const handleDateClick = useCallback((dateKey: string) => {
    setActiveDate(dateKey);
    setFocusedFromDeepLink(null);
    setComposer(COMPOSER_CLOSED);
    setOverviewDateKey(dateKey);
  }, []);

  const handleOverviewClose = useCallback(() => {
    setOverviewDateKey(null);
  }, []);

  const handleOverviewNewEvent = useCallback((dateKey: string) => {
    setOverviewDateKey(null);
    setComposer({ open: true, mode: "create", editing: null, defaultDateKey: dateKey });
  }, []);

  const handleOpenMonth = useCallback((dateKey: string) => {
    setActiveDate(dateKey);
    setFocusedFromDeepLink(null);
    setOverviewDateKey(null);
    setView("month");
  }, [setView]);

  const handleUserEventClick = useCallback(
    (userId: string) => {
      const userEvent = getById(userId);
      if (!userEvent) return;
      setOverviewDateKey(null);
      setComposer({ open: true, mode: "edit", editing: userEvent });
    },
    [getById],
  );

  const handleComposerClose = useCallback(() => {
    setComposer(COMPOSER_CLOSED);
  }, []);

  const handleComposerSave = useCallback(
    async (event: UserCalEvent) => {
      if (composer.mode === "edit" && composer.editing) {
        if (JSON.stringify(getById(composer.editing.id)) !== JSON.stringify(composer.editing)) {
          throw new Error("Calendar event changed; reopen before saving");
        }
        const saved = await update(composer.editing.id, {
          title: event.title,
          startISO: event.startISO,
          endISO: event.endISO,
          colorPreset: event.colorPreset,
          recurrence: event.recurrence,
          allDay: event.allDay,
          tag: event.tag,
          notes: event.notes,
          reminder: event.reminder,
        });
        if (!saved) throw new Error("Calendar changes were not saved");
      } else {
        const saved = await create({
          title: event.title,
          startISO: event.startISO,
          endISO: event.endISO,
          colorPreset: event.colorPreset,
          recurrence: event.recurrence,
          allDay: event.allDay,
          tag: event.tag,
          notes: event.notes,
          reminder: event.reminder,
        });
        if (!saved) throw new Error("Calendar changes were not saved");
      }
      setActiveDate(event.startISO.slice(0, 10));
      setComposer(COMPOSER_CLOSED);
    },
    [composer, create, update, getById],
  );

  const handleComposerDelete = useCallback(
    async (id: string) => {
      if (JSON.stringify(getById(id)) !== JSON.stringify(composer.editing)) {
        throw new Error("Calendar event changed; reopen before deleting");
      }
      if (!await remove(id)) throw new Error("Calendar changes were not saved");
      // composer.onDelete already calls onClose internally; we still snap
      // state back to ensure no edge case leaves the dialog open.
      setComposer(COMPOSER_CLOSED);
    },
    [remove, getById, composer.editing],
  );

  // Merge fixture + user events for the Month view.
  const monthMergedEvents = useMemo(
    () => mergeEventsForMonth(SAMPLE_EVENTS, userEvents, displayedMonth.year, displayedMonth.month),
    [userEvents, displayedMonth.year, displayedMonth.month],
  );
  const monthEventsWithBoardFeed = useMemo(
    () => mergeBoardFeedForMonth(monthMergedEvents, boardEventsByDate, displayedMonth),
    [monthMergedEvents, boardEventsByDate, displayedMonth],
  );

  const overviewEvents = useMemo(() => {
    const parsed = overviewDateKey ? tryParseDateKey(overviewDateKey) : null;
    if (!parsed) return [];
    const byDay = mergeEventsForMonth(SAMPLE_EVENTS, userEvents, parsed.year, parsed.month);
    return byDay[parsed.day] ?? [];
  }, [overviewDateKey, userEvents]);

  const hasUserEvents = userEventList.length > 0;
  const showBanner = !hasUserEvents;

  // --- Navigation handlers (step depends on view) ----------------------------

  const handlePrevMonth = useCallback(() => {
    setActiveDate((cur) => {
      if (view === "year") {
        const { year, month, day } = tryParseDateKey(cur) ?? { year: 2026, month: 5, day: 22 };
        const newYear = year - 1;
        const maxDay = new Date(newYear, month, 0).getDate();
        return formatDateKey(newYear, month, Math.min(day, maxDay));
      }
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
      if (view === "year") {
        const { year, month, day } = tryParseDateKey(cur) ?? { year: 2026, month: 5, day: 22 };
        const newYear = year + 1;
        const maxDay = new Date(newYear, month, 0).getDate();
        return formatDateKey(newYear, month, Math.min(day, maxDay));
      }
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
    setActiveDate(todayKey);
    setFocusedFromDeepLink(null);
    // view preserved across today reset per design.md §15.6
  }, [todayKey]);

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
    setOverviewDateKey(null);
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
        weekStart={weekStart}
        onWeekStartChange={handleWeekStartChange}
      />
      {view === "year" ? (
        <YearView
          year={displayedMonth.year}
          weekStart={weekStart}
          todayKey={todayKey}
          activeDate={activeDate}
          lang={lang}
          t={t}
          userEvents={userEvents}
          onDateClick={handleDateClick}
          onUserEventClick={handleUserEventClick}
          onOpenMonth={handleOpenMonth}
        />
      ) : view === "month" ? (
        <MonthGrid
          year={displayedMonth.year}
          month={displayedMonth.month}
          weekStart={weekStart}
          lang={lang}
          t={t}
          todayKey={todayKey}
          focusedDate={focusedFromDeepLink}
          events={monthEventsWithBoardFeed}
          onUserEventClick={handleUserEventClick}
          onDateClick={handleDateClick}
        />
      ) : view === "week" ? (
        <WeekView
          activeDate={activeDate}
          weekStart={weekStart}
          events={SAMPLE_EVENTS}
          todayKey={todayKey}
          lang={lang}
          userEvents={userEvents}
          feedEventsByDate={boardEventsByDate}
          onUserEventClick={handleUserEventClick}
        />
      ) : (
        <DayView
          activeDate={activeDate}
          events={SAMPLE_EVENTS}
          todayKey={todayKey}
          lang={lang}
          userEvents={userEvents}
          feedEventsByDate={boardEventsByDate}
          onUserEventClick={handleUserEventClick}
        />
      )}
      {!hasUserEvents ? <EmptyStateHint lang={lang} /> : null}
      {showBanner ? <CalendarBanner t={t} /> : null}
      <DayOverview
        open={overviewDateKey !== null}
        dateKey={overviewDateKey}
        events={overviewEvents}
        lang={lang}
        onNewEvent={handleOverviewNewEvent}
        onUserEventClick={handleUserEventClick}
        onClose={handleOverviewClose}
      />
      <EventComposer
        open={composer.open}
        mode={composer.mode}
        event={composer.editing}
        lang={lang}
        defaultDateKey={composer.defaultDateKey ?? todayKey}
        onSave={handleComposerSave}
        onDelete={handleComposerDelete}
        onClose={handleComposerClose}
      />
    </div>
  );
}

export default CalendarModule;

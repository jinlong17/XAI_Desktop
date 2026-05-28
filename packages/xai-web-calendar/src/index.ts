/**
 * @repo/plugin-web-calendar — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/ directly.
 *
 * Side-effect CSS: applied once globally when this package is first imported.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Design: packages/xai-web-calendar/docs/design.md
 */

// Side-effect CSS import
import "./styles.css";

// ---- Components -------------------------------------------------------------
export { CalendarModule, default } from "./CalendarModule.js";

// ---- Slot registration (consumed by apps/web shellRegistrations.tsx) --------
export { calendarSlotRegistration } from "./registration.js";

// ---- Public types -----------------------------------------------------------
export type {
  CalendarModuleProps,
  CalendarView,
  DisplayedMonth,
} from "./types.js";

export type {
  CalEvent,
  CalEventColor,
  CalEventsByDay,
} from "./internal/sampleEvents.js";

export type { MonthCellData } from "./internal/monthGridCells.js";

// ---- Extension exports (gap-closure row #4) ---------------------------------
export type { EventBlock } from "./internal/placeEventBlocks.js";
export type { DstShift } from "./internal/timeGridMath.js";
export type { CalendarViewId } from "@repo/plugin-web-storage";
export { WeekView } from "./WeekView.js";
export type { WeekViewProps } from "./WeekView.js";
export { TimeGrid } from "./TimeGrid.js";
export type { TimeGridProps } from "./TimeGrid.js";
export { DayView } from "./DayView.js";
export type { DayViewProps } from "./DayView.js";

// ---- Event-create extension (2026-05-27 — HC8 lift) -------------------------
// Data-layer types
export type {
  UserCalEvent,
  RecurrenceRule,
  RecurrenceKind,
  EventColorPreset,
} from "./internal/eventStore/types.js";

// React hook (preferred consumer API)
export { useUserCalEvents } from "./internal/eventStore/useUserCalEvents.js";
export type { UserCalEventsApi } from "./internal/eventStore/useUserCalEvents.js";

// Pure helpers (exposed for testability + future-row composition)
export { expandRecurrence } from "./internal/eventStore/expandRecurrence.js";
export {
  mergeEventsForMonth,
  mergeEventsForWindow,
} from "./internal/eventStore/mergeEventsForViewport.js";
export type { MergedCalEvent } from "./internal/eventStore/mergeEventsForViewport.js";
export {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  listEvents,
} from "./internal/eventStore/eventStore.js";

// EventComposer is exported in P2 (component lands then).

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

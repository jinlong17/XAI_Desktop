/**
 * @repo/plugin-web-board-views — public surface
 *
 * This is the ONLY public import surface for consumers. Do NOT import from
 * `@repo/plugin-web-board-views/src/internal/*` — those are package-private.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §0
 */

// ---- Side-effect CSS import ------------------------------------------------
import "./styles.css";

// ---- Types -----------------------------------------------------------------
export type {
  BoardViewId,
  ViewPickerEntry,
  DueShortcutId,
} from "./types.js";

// ---- React components ------------------------------------------------------
export { BoardModule } from "./BoardModule.js";
export type { BoardModuleProps } from "./BoardModule.js";

export { ViewPicker } from "./ViewPicker.js";
export type { ViewPickerProps } from "./ViewPicker.js";

export { TableView } from "./TableView.js";
export type { TableViewProps } from "./TableView.js";

export { BoardCalendarView } from "./BoardCalendarView.js";
export type { BoardCalendarViewProps } from "./BoardCalendarView.js";

export { BoardDashboardView } from "./BoardDashboardView.js";
export type { BoardDashboardViewProps } from "./BoardDashboardView.js";

export { TimelineView } from "./TimelineView.js";
export type { TimelineViewProps } from "./TimelineView.js";

export { MapView } from "./MapView.js";
export type { MapViewProps } from "./MapView.js";

// ---- Shell slot registration -----------------------------------------------
export { boardViewsWebModuleRegistration } from "./registration.js";

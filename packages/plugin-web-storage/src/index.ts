/**
 * @repo/plugin-web-storage — public surface
 *
 * Single import path for all consumers:
 *   import { usePref, setPref, isPrefKey, type WebPrefKey } from "@repo/plugin-web-storage"
 *
 * This file is the ONLY public surface. Never import from src/internal/*.
 *
 * Governing ADR: docs/adr/0007-xai-web-console-build-form.md §S4 + §S8
 * Row: xai-web-persistence-contract (#3)
 */

// ---- Registry types --------------------------------------------------------
export type {
  PrefCodec,
  PrefCategory,
  PrefEntry,
  WebPrefKey,
  WebPrefValue,
  // Per-key value types (consumers may need these for typing their state)
  RailPos,
  BgTone,
  RailItemId,
  PetId,
  ClockStyle,
  PetPos,
  TaskColsState,
  DashWidgetId,
  // Calendar view type (gap-closure row #4)
  CalendarViewId,
} from "./internal/registry.js";

// ---- Registry object -------------------------------------------------------
export { PREF_REGISTRY } from "./internal/registry.js";

// ---- Imperative helpers ----------------------------------------------------
export {
  getPref,
  setPref,
  removePref,
  getDesktopLocalFirstCalendarProviderState,
  getDesktopLocalFirstCalendarProviderStateKey,
  patchDesktopLocalFirstCalendarProviderState,
  mountDesktopLocalFirstRepositoryBridge,
  getDesktopLocalFirstReconnectSyncPreflight,
  runDesktopLocalFirstCalendarProviderReconnect,
  runDesktopLocalFirstWebDataImport,
  runDesktopLocalFirstReconnectSync,
  getDesktopLocalFirstWebDataImportReport,
  getDesktopLocalFirstWebDataImportReportEventName,
  isPrefKey,
  // Open-ended xai_pref_* family — typed read/write/remove (mirrors usePrefAutosave).
  getPrefAutosave,
  setPrefAutosave,
  removePrefAutosave,
} from "./internal/storage.js";
export type {
  GetPrefAutosaveOptions,
  SetPrefAutosaveOptions,
  DesktopCalendarProviderReconnectFailure,
  DesktopCalendarProviderReconnectResult,
} from "./internal/storage.js";
export type { DesktopWebImportReport } from "./internal/desktopWebDataMigration.js";
export type {
  CalendarProviderId,
  CalendarProviderStateEntity,
} from "@repo/core-data";

// ---- usePref hook ----------------------------------------------------------
export { usePref } from "./internal/usePref.js";
export type { PrefMeta } from "./internal/usePref.js";
export { useDesktopLocalFirstCalendarProviderState } from "./internal/useDesktopLocalFirstCalendarProviderState.js";

// ---- usePrefAutosave hook --------------------------------------------------
export { usePrefAutosave } from "./internal/usePrefAutosave.js";
export type { UsePrefAutosaveOptions } from "./internal/usePrefAutosave.js";

// ---- migrate stub (v1 — no registered migrations) -------------------------
export { migrate } from "./internal/migrate.js";

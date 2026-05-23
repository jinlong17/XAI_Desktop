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
} from "./internal/registry.js";

// ---- Registry object -------------------------------------------------------
export { PREF_REGISTRY } from "./internal/registry.js";

// ---- Imperative helpers ----------------------------------------------------
export {
  getPref,
  setPref,
  removePref,
  isPrefKey,
} from "./internal/storage.js";

// ---- usePref hook ----------------------------------------------------------
export { usePref } from "./internal/usePref.js";
export type { PrefMeta } from "./internal/usePref.js";

// ---- usePrefAutosave hook --------------------------------------------------
export { usePrefAutosave } from "./internal/usePrefAutosave.js";
export type { UsePrefAutosaveOptions } from "./internal/usePrefAutosave.js";

// ---- migrate stub (v1 — no registered migrations) -------------------------
export { migrate } from "./internal/migrate.js";

/**
 * @repo/plugin-web-dashboard-grid — public surface.
 *
 * This is the ONLY allowed import path for consumers.
 * Never import from src/internal/ directly.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Design: design.md §3
 * API contract: api.md §S1
 */

// ---- Components ---------------------------------------------------------
export { DashboardModule, default } from "./DashboardModule.js";

// ---- Registration (shell slot) ------------------------------------------
export { dashboardGridSlotRegistration } from "./registration.js";

// ---- Public types (stable contract for row #11) -------------------------
export type {
  WidgetRegistration,
  WidgetSpanClass,
  WidgetRenderContext,
  DashboardModuleProps,
  DashboardHeaderDepartureGuard,
  DashboardHeaderDepartureGuardRegistration,
} from "./types.js";

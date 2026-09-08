/**
 * @repo/plugin-web-dashboard-widgets — public surface.
 *
 * This is the ONLY allowed import path for consumers. Internal modules
 * (src/widgets/*, src/internal/*) MUST NOT be imported directly per api.md §S8.
 *
 * ADR anchor: docs/adr/0007-xai-web-console-build-form.md §S4
 * Design: design.md §3
 * API contract: api.md §S1
 */

export { dashboardWidgetRegistrations } from "./registrations.js";

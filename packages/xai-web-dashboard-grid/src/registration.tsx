/**
 * registration.tsx — dashboardGridSlotRegistration for the Web Console rail.
 *
 * Exports a WebModuleSlotRegistration for the dashboard module. The
 * DashboardSlotHost wrapper reads useWebShell().lang so the module gets
 * the active language without coupling to the host directly.
 *
 * In v1 (this row alone), widgets is hard-wired to [] — row #11
 * (xai-web-dashboard-widgets) will later update DashboardSlotHost to
 * forward dashboardWidgetRegistrations.
 *
 * Design: design.md §3.3
 * API contract: api.md §S10
 */
import { useCallback } from "react";

import { emitWebEvent } from "@repo/xai-web-event-bus";
import { dashboardWidgetRegistrations } from "@repo/plugin-web-dashboard-widgets";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import type { WebModuleId } from "@repo/core/types";

import { DashboardModule } from "./DashboardModule.js";
import type { WidgetRegistration } from "./types.js";

const KNOWN_MODULE_IDS: ReadonlySet<WebModuleId> = new Set<WebModuleId>([
  "tasks",
  "habits",
  "pomodoro",
  "calendar",
  "matrix",
  "countdown",
  "timetrack",
  "settings",
  "board",
  "dashboard",
  "meditation",
  "statistics",
  "ai",
  "search",
]);

// Row #11 (xai-web-dashboard-widgets) supplies the full widget registrations
// array. EMPTY_WIDGETS is no longer used directly but kept as a typed const for
// any future fallback path; current host always passes dashboardWidgetRegistrations.
const EMPTY_WIDGETS: WidgetRegistration[] = [];
void EMPTY_WIDGETS;

/** Inner host wrapper: reads lang from the shell context + supplies goTo. */
export function DashboardSlotHost() {
  const { lang } = useWebShell();

  const goTo = useCallback((moduleId: string) => {
    if (!KNOWN_MODULE_IDS.has(moduleId as WebModuleId)) return;
    emitWebEvent("web:shell:module-change", {
      moduleId: moduleId as WebModuleId,
      source: "mini-cal",
    });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/app/${moduleId}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, []);

  return <DashboardModule lang={lang} widgets={dashboardWidgetRegistrations} goTo={goTo} />;
}

/** Slot registration for the Web Console AppRail. */
export const dashboardGridSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "dashboard",
  label: "Dashboard",
  defaultChildPath: "",
  children: [
    { path: "", render: DashboardSlotHost },
    { path: "*", render: DashboardSlotHost },
  ],
  icon: "layout",
  railOrder: 4,
  i18nKey: "nav.dashboard",
  showInRail: true,
};

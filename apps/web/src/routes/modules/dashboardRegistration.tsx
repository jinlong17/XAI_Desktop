import * as React from "react";
import type { WebModuleId } from "@repo/core/types";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import { dashboardWidgetRegistrations } from "@repo/plugin-web-dashboard-widgets";
import { DashboardModule } from "@repo/plugin-web-dashboard-grid";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { useNavigate } from "react-router";

import { DepartureCoordinator } from "./departureCoordinator.js";
import { registerDepartureDelegate } from "./settingsDeparture.js";

const KNOWN_MODULE_IDS: ReadonlySet<WebModuleId> = new Set<WebModuleId>([
  "tasks", "habits", "pomodoro", "calendar", "matrix", "countdown", "timetrack",
  "settings", "board", "dashboard", "meditation", "statistics", "ai", "search",
]);

/** The app route owns router navigation and the shared departure coordinator. */
function DashboardModuleRoute(): React.ReactElement {
  const { lang } = useWebShell();
  const navigate = useNavigate();
  const isDepartureTarget = React.useCallback((target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest(
      ".app-rail .rail-items .rail-btn, .mc-jump, .topbar-pref-settings, .avatar-menu .avm-item:not(.danger)",
    ));
  }, []);
  const goTo = React.useCallback((moduleId: string) => {
    if (!KNOWN_MODULE_IDS.has(moduleId as WebModuleId)) return;
    emitWebEvent("web:shell:module-change", { moduleId: moduleId as WebModuleId, source: "mini-cal" });
    void navigate(`/app/${moduleId as WebModuleId}`);
  }, [navigate]);
  return (
    <DepartureCoordinator lang={lang} registerSignOutDelegate={registerDepartureDelegate}>
      {({ registerDepartureGuard, isDeparturePending }) => (
        <DashboardModule
          lang={lang}
          widgets={dashboardWidgetRegistrations}
          goTo={goTo}
          registerDepartureGuard={registerDepartureGuard}
          isDeparturePending={isDeparturePending}
          isDepartureTarget={isDepartureTarget}
        />
      )}
    </DepartureCoordinator>
  );
}

export const dashboardRegistration: WebModuleSlotRegistration = {
  moduleId: "dashboard",
  label: "Dashboard",
  defaultChildPath: "",
  children: [
    { path: "", render: DashboardModuleRoute },
    { path: "*", render: DashboardModuleRoute },
  ],
  icon: "layout",
  railOrder: 4,
  i18nKey: "nav.dashboard",
  showInRail: true,
};

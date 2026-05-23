/**
 * Shell module registrations — the concrete WebModuleSlotRegistration[] array.
 *
 * Satisfies @repo/xai-web-shell WebModuleSlotRegistration for each module id
 * in the rail. Populated with placeholder routes for W1; each W2 row
 * (rows #6..#24) replaces its own entry in this file.
 *
 * Design constraints:
 * - The existing todoWebModuleRegistration from @repo/plugin-productivity/web
 *   is preserved for backward compat (B5 review note).
 * - Settings has showInRail: false (reachable via Topbar / Avatar only).
 * - Rail order matches the prototype DEFAULT_ITEMS ordering.
 *
 * Owner: apps/web (host-level concern — not inside xai-web-shell).
 */

import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { ModuleRoutePlaceholderPage } from "../../pages/ModuleRoutePlaceholderPage";
import { matrixSlotRegistration } from "@repo/plugin-web-matrix";
import { countdownWebModuleRegistration } from "@repo/plugin-web-countdown";
import { tasksWebModuleRegistration } from "@repo/plugin-web-tasks";
// xai-web-habits row #15
import { habitsSlotRegistration } from "@repo/plugin-web-habits";
// xai-web-pomodoro row #14
import { pomodoroWebModuleRegistration } from "@repo/plugin-web-pomodoro";
// xai-web-ai-chat row #18
import { aiChatWebModuleRegistration } from "@repo/plugin-web-ai-chat";
// xai-web-meditation row #16
import { meditationSlotRegistration } from "@repo/plugin-web-meditation";
// xai-web-calendar row #12
import { calendarSlotRegistration } from "@repo/plugin-web-calendar";
// xai-web-dashboard-grid row #10
import { dashboardGridSlotRegistration } from "@repo/plugin-web-dashboard-grid";
// xai-web-board-core row #7
import { boardCoreWebModuleRegistration } from "@repo/plugin-web-board-core";
// xai-web-statistics row #20
import { statisticsWebModuleRegistration } from "@repo/plugin-web-statistics";

function placeholder(
  moduleId: string,
  label: string,
  icon: WebModuleSlotRegistration["icon"],
  railOrder: number,
  showInRail = true,
): WebModuleSlotRegistration {
  return {
    moduleId,
    label,
    defaultChildPath: "",
    children: [
      { path: "", render: ModuleRoutePlaceholderPage },
      { path: "*", render: ModuleRoutePlaceholderPage },
    ],
    icon,
    railOrder,
    i18nKey: `nav.${moduleId}`,
    showInRail,
  };
}

export const webShellModuleRegistrations: WebModuleSlotRegistration[] = [
  // Rail-visible modules (railOrder 1..12)
  aiChatWebModuleRegistration,  // xai-web-ai-chat row #18 (railOrder 1)
  tasksWebModuleRegistration,
  boardCoreWebModuleRegistration,  // xai-web-board-core row #7 (railOrder 3)
  dashboardGridSlotRegistration,  // xai-web-dashboard-grid row #10 (railOrder 4)
  calendarSlotRegistration,  // xai-web-calendar row #12 (railOrder 5)
  matrixSlotRegistration,
  pomodoroWebModuleRegistration,
  habitsSlotRegistration,  // xai-web-habits row #15 (railOrder 8)
  meditationSlotRegistration,  // xai-web-meditation row #16 (railOrder 9)
  countdownWebModuleRegistration,
  statisticsWebModuleRegistration,  // xai-web-statistics row #20 (railOrder 11)
  // Settings — not in rail (showInRail: false)
  placeholder("settings",   "Settings",   "sliders",   99, false),
];

/**
 * Full registrations array for use in both the shell (WebShellProvider)
 * and the legacy router seam (webModuleRouteRegistrations).
 *
 * The legacy seam still uses WebModuleRouteRegistration[] — since
 * WebModuleSlotRegistration extends that interface, the same array
 * satisfies both shapes.
 */
export const webModuleSlotRegistrations = webShellModuleRegistrations;

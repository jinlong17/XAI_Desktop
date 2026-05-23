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
  placeholder("ai",         "XAI Chat",   "sparkle",   1),
  tasksWebModuleRegistration,
  placeholder("board",      "Boards",     "kanban",    3),
  placeholder("dashboard",  "Dashboard",  "layout",    4),
  placeholder("calendar",   "Calendar",   "calendar",  5),
  matrixSlotRegistration,
  pomodoroWebModuleRegistration,
  habitsSlotRegistration,  // xai-web-habits row #15 (railOrder 8)
  placeholder("meditation", "Meditation", "leaf",      9),
  countdownWebModuleRegistration,
  placeholder("statistics", "Statistics", "chart",     11),
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

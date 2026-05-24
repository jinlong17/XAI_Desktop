/**
 * Shell module registrations — the concrete WebModuleSlotRegistration[] array.
 *
 * Satisfies @repo/xai-web-shell WebModuleSlotRegistration for each module id
 * in the rail. All 12 modules now ship as real registrations from their
 * owning packages (rows #6..#21); no placeholder entries remain.
 *
 * Design constraints:
 * - The existing todoWebModuleRegistration from @repo/plugin-productivity/web
 *   is preserved for backward compat (B5 review note).
 * - Settings has showInRail: false (reachable via Topbar / Avatar only).
 *   Chassis from xai-web-settings-shell row #21; sibling rows #22/#23/#24
 *   substitute pane content via paneRegistry composition.
 * - Rail order matches the prototype DEFAULT_ITEMS ordering.
 *
 * Owner: apps/web (host-level concern — not inside xai-web-shell).
 */

import type { WebModuleRouteRegistration } from "@repo/core/types";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
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
// xai-web-board-workspaces row #9 (workspace + multi-board layer wrapping row #7 board-core)
import { boardWorkspacesWebModuleRegistration } from "@repo/plugin-web-board-workspaces";
// xai-web-statistics row #20
import { statisticsWebModuleRegistration } from "@repo/plugin-web-statistics";
// xai-web-settings-shell row #21 (W4a · chassis · showInRail:false)
// row #23 (xai-web-settings-features-panel) replaces this registration with a
// composed variant that mounts the substituted paneRegistry — kept imported
// as documentation that the chassis is still the upstream source of truth.
import "@repo/plugin-web-settings-shell";
import { composedSettingsRegistration } from "./composedSettingsRegistration.js";
// xai-web-settings-features-panel row #23 — slot-wrap deep-link guards for the
// 8 user-toggleable modules. Wrapping reads xai_pref_features_<id> and short-
// circuits to <DisabledFeatureFallback> when off.
import { withDisabledFallback } from "@repo/plugin-web-settings-features-panel";
// Legacy productivity todos slice — kept as a transitional route shim until
// the /app/todos -> /app/tasks migration completes. NOT shown in the rail
// (todos has no WebModuleSlotRegistration entry below). Existing observability
// route sanitization, router.integration.test.tsx /app/todos/smart:inbox
// assertions, and any external bookmark to /app/todos continue to resolve.
import { todoWebModuleRegistration } from "@repo/plugin-productivity/web";

export const webShellModuleRegistrations: WebModuleSlotRegistration[] = [
  // Rail-visible modules (railOrder 1..12).
  // The 8 user-toggleable modules are wrapped with withDisabledFallback so any
  // deep link reaching them while `xai_pref_features_<id>` is false renders
  // <DisabledFeatureFallback> instead of the real module shell. ai-chat,
  // countdown, statistics, settings are NOT toggleable per DESIGN.md §4.12 +
  // row #23 scope.
  aiChatWebModuleRegistration,  // xai-web-ai-chat row #18 (railOrder 1) — not toggleable
  withDisabledFallback(tasksWebModuleRegistration, "tasks"),
  withDisabledFallback(boardWorkspacesWebModuleRegistration, "board"),  // row #9 replaces row #7 wrapper
  withDisabledFallback(dashboardGridSlotRegistration, "dashboard"),  // row #10
  withDisabledFallback(calendarSlotRegistration, "calendar"),  // row #12
  withDisabledFallback(matrixSlotRegistration, "matrix"),
  withDisabledFallback(pomodoroWebModuleRegistration, "pomodoro"),
  withDisabledFallback(habitsSlotRegistration, "habits"),  // row #15
  withDisabledFallback(meditationSlotRegistration, "meditation"),  // row #16
  countdownWebModuleRegistration,  // not toggleable
  statisticsWebModuleRegistration,  // row #20 — not toggleable
  // Settings — not in rail (showInRail: false). Chassis from xai-web-settings-shell row #21;
  // row #23 (xai-web-settings-features-panel) replaces the registration with
  // composedSettingsRegistration which mounts the composed paneRegistry. Sibling
  // rows #22 (appearance) / #24 (rest) extend the composition function — not
  // this file.
  composedSettingsRegistration,  // row #23 host-side replacement (uses composeSettingsPaneRegistry)
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

/**
 * Host router seam — consumed by apps/web/src/routes/router.tsx +
 * RouteGateElements.tsx via resolveModuleRouteMatch / resolveDefaultModulePath
 * / assertUniqueModuleRegistrations.
 *
 * Single source of truth: the same array used by <WebShellProvider> (rail) is
 * promoted to the host router so the rail and the URL stay structurally in
 * sync. Replaces the legacy `apps/web/src/routes/modules/registrations.tsx`
 * deleted in this commit (P0 W6 regression fix per bug-diagnose).
 *
 * Transitional shim: `todoWebModuleRegistration` is appended so /app/todos/*
 * deep links continue to resolve while the /todos -> /tasks migration is
 * pending. todos has no slot entry (showInRail false by absence), so the rail
 * is unchanged; the URL keeps backward compat for observability sanitizers,
 * existing router.integration.test.tsx assertions, and external bookmarks.
 *
 * Future cleanup: when /app/todos is fully retired, drop the spread below and
 * any /app/todos test/observability fixtures in one followup commit.
 */
export const webModuleRouteRegistrations: WebModuleRouteRegistration[] = [
  ...webShellModuleRegistrations,
  todoWebModuleRegistration,
];

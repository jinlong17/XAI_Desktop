/**
 * registration.tsx — habitsSlotRegistration for the Web Console rail.
 *
 * Exports a WebModuleSlotRegistration for the habits module.
 * The HabitsSlotHost wrapper reads useWebShell().lang so the module
 * gets the active language without coupling to the host directly.
 *
 * v1: weekStart hard-coded to "sun". Settings W4 (row #24) edits this line
 * to read from a future xai_pref_week_start registry entry.
 *
 * Design: design.md §8
 * API contract: api.md §1.4
 */

import React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { HabitsModule } from "./HabitsModule.js";

/** Inner host wrapper: reads lang from the shell context. */
function HabitsSlotHost() {
  const { lang } = useWebShell();
  // v1: hard-coded weekStart="sun" — Settings W4 (row #24) edits this line
  // to read from a future xai_pref_week_start registry entry.
  return <HabitsModule lang={lang} weekStart="sun" />;
}

/** Slot registration for the Web Console AppRail. */
export const habitsSlotRegistration: WebModuleSlotRegistration = {
  moduleId: "habits",
  label: "Habits",
  defaultChildPath: "",
  children: [
    { path: "", render: HabitsSlotHost },
    { path: "*", render: HabitsSlotHost },
  ],
  icon: "pin",
  railOrder: 8,
  i18nKey: "nav.habits",
  showInRail: true,
};

/**
 * registration.tsx — shell slot registration for the Pomodoro module.
 *
 * Exports `pomodoroWebModuleRegistration` which is consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx` (P3 host wire-up).
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web/src/App.tsx.
 *
 * API contract: packages/xai-web-pomodoro/docs/api.md §3.1
 * Design: packages/xai-web-pomodoro/docs/design.md §2 (Frozen Assumption 2)
 */

import React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { PomodoroModule } from "./PomodoroModule.js";

// --------------------------------------------------------------------------
// PomodoroModuleRoute — thin wrapper that reads lang from shell context
// --------------------------------------------------------------------------

function PomodoroModuleRoute() {
  const { lang } = useWebShell();
  return <PomodoroModule lang={lang} />;
}

// --------------------------------------------------------------------------
// pomodoroWebModuleRegistration
// --------------------------------------------------------------------------

export const pomodoroWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "pomodoro",
  label: "Pomodoro",
  defaultChildPath: "",
  children: [
    { path: "", render: PomodoroModuleRoute },
    { path: "*", render: PomodoroModuleRoute },
  ],
  icon: "timer",
  railOrder: 7,
  i18nKey: "nav.pomodoro",
  showInRail: true,
};

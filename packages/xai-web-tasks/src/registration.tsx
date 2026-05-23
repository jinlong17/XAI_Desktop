/**
 * registration.tsx — shell slot registration for the Tasks module.
 *
 * Exports `tasksWebModuleRegistration` which is consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx` (P2 host wire-up).
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web/src/App.tsx. No outlet
 * context change needed (same pattern as countdownWebModuleRegistration).
 *
 * API contract: packages/xai-web-tasks/docs/api.md §2.2 + §3
 * Design: packages/xai-web-tasks/docs/design.md §5
 */

import React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { TasksModule } from "./TasksModule.js";

// ---------------------------------------------------------------------------
// TasksModuleRoute — thin wrapper that reads lang from shell context
// ---------------------------------------------------------------------------

function TasksModuleRoute() {
  const { lang } = useWebShell();
  return <TasksModule lang={lang} />;
}

// ---------------------------------------------------------------------------
// tasksWebModuleRegistration
// ---------------------------------------------------------------------------

export const tasksWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "tasks",
  label: "Tasks",
  defaultChildPath: "",
  children: [
    { path: "", render: TasksModuleRoute },
    { path: "*", render: TasksModuleRoute },
  ],
  icon: "check",
  railOrder: 2,
  i18nKey: "nav.tasks",
  showInRail: true,
};

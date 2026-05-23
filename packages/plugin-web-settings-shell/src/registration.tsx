/**
 * registration.tsx — shell slot registration for the Settings module.
 *
 * Exports `settingsShellWebModuleRegistration` which is consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx`.
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web/src/App.tsx.
 *
 * API contract: packages/xai-web-settings-shell/docs/api.md §4
 * Design: packages/xai-web-settings-shell/docs/design.md
 */

import * as React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { SettingsModule } from "./SettingsModule.js";

function SettingsModuleRoute(): React.ReactElement {
  const { lang } = useWebShell();
  return <SettingsModule lang={lang} />;
}

export const settingsShellWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "settings",
  label: "Settings",
  defaultChildPath: "",
  children: [
    { path: "",  render: SettingsModuleRoute },
    { path: "*", render: SettingsModuleRoute },
  ],
  icon: "sliders",
  railOrder: 99,
  i18nKey: "nav.settings",
  showInRail: false,
};

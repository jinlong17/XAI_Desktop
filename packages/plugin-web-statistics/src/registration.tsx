/**
 * registration.tsx — shell slot registration for the Statistics module.
 *
 * Exports `statisticsWebModuleRegistration` which is consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx`.
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web/src/App.tsx.
 *
 * API contract: packages/xai-web-statistics/docs/api.md §4
 * Design: packages/xai-web-statistics/docs/design.md
 */

import * as React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { StatisticsModule } from "./StatisticsModule.js";

function StatisticsModuleRoute(): React.ReactElement {
  const { lang } = useWebShell();
  return <StatisticsModule lang={lang} />;
}

export const statisticsWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "statistics",
  label: "Statistics",
  defaultChildPath: "",
  children: [
    { path: "", render: StatisticsModuleRoute },
    { path: "*", render: StatisticsModuleRoute },
  ],
  icon: "chart",
  railOrder: 11,
  i18nKey: "nav.statistics",
  showInRail: true,
};

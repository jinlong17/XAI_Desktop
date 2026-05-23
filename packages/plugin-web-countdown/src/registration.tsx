/**
 * registration.tsx — shell slot registration for the Countdown module.
 *
 * Exports `countdownWebModuleRegistration` which is consumed by
 * `apps/web/src/routes/modules/shellRegistrations.tsx` (P3 host wire-up).
 *
 * The `render` wrapper reads `lang` from `useWebShell()` which is populated
 * by `<WebShellProvider lang={lang}>` in apps/web/src/App.tsx. This avoids
 * any need for outlet context changes.
 *
 * API contract: packages/xai-web-countdown/docs/api.md §3.1
 * Design: packages/xai-web-countdown/docs/design.md §2 (Frozen Assumption 2)
 */

import React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { CountdownModule } from "./CountdownModule.js";

// --------------------------------------------------------------------------
// CountdownModuleRoute — thin wrapper that reads lang from shell context
// --------------------------------------------------------------------------

function CountdownModuleRoute() {
  const { lang } = useWebShell();
  return <CountdownModule lang={lang} />;
}

// --------------------------------------------------------------------------
// countdownWebModuleRegistration
// --------------------------------------------------------------------------

export const countdownWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "countdown",
  label: "Countdown",
  defaultChildPath: "",
  children: [
    { path: "", render: CountdownModuleRoute },
    { path: "*", render: CountdownModuleRoute },
  ],
  icon: "countdown",
  railOrder: 10,
  i18nKey: "nav.countdown",
  showInRail: true,
};

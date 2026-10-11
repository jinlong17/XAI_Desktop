import * as React from "react";
import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { PomodoroModule } from "@repo/plugin-web-pomodoro";
import { DepartureCoordinator } from "./departureCoordinator.js";
import { registerDepartureDelegate } from "./settingsDeparture.js";

/** App-owned route adapter that supplies the shared host departure capability. */
function PomodoroModuleRoute(): React.ReactElement {
  const { lang } = useWebShell();
  return (
    <DepartureCoordinator lang={lang} registerSignOutDelegate={registerDepartureDelegate}>
      {({ registerDepartureGuard }) => (
        <PomodoroModule lang={lang} registerDepartureGuard={registerDepartureGuard} />
      )}
    </DepartureCoordinator>
  );
}

export const pomodoroRegistration: WebModuleSlotRegistration = {
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

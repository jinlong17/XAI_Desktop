import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { TimeTrackerModule } from "./TimeTrackerModule.js";

function TimeTrackerModuleRoute() {
  const { lang } = useWebShell();
  return <TimeTrackerModule lang={lang} />;
}

export const timeTrackerWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "timetrack",
  label: "Time Tracker",
  defaultChildPath: "",
  children: [
    { path: "", render: TimeTrackerModuleRoute },
    { path: "*", render: TimeTrackerModuleRoute },
  ],
  icon: "timer",
  railOrder: 7.5,
  i18nKey: "nav.timetrack",
  showInRail: true,
};

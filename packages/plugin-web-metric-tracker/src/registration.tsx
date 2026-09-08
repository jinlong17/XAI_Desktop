import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { MetricTrackerModule } from "./MetricTrackerModule.js";

function MetricTrackerRoute() {
  const { lang } = useWebShell();
  return <MetricTrackerModule lang={lang} />;
}

export const metricTrackerWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "metrics",
  label: "Metric Tracker",
  defaultChildPath: "",
  children: [
    { path: "", render: MetricTrackerRoute },
    { path: "*", render: MetricTrackerRoute },
  ],
  icon: "target",
  railOrder: 7.7,
  i18nKey: "nav.metrics",
  showInRail: true,
};

/**
 * StatPomos — pomodoro count with 8-dot grid.
 *
 * Mock value (6/8) per `web design/module-dashboard.jsx` lines 390-401.
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { PomoDots } from "../internal/PomoDots.js";

export interface StatPomosProps {
  lang: Lang;
}

export const STAT_POMOS_DONE = 6;
export const STAT_POMOS_TOTAL = 8;

export function StatPomos({ lang }: StatPomosProps) {
  const { s } = useI18n(lang);
  return (
    <div className="widget-content stat-pomos">
      <div className="ws-label">{s("dashboard.pomos")}</div>
      <div className="ws-row">
        <div className="ws-val mono">{STAT_POMOS_DONE}</div>
        <PomoDots count={STAT_POMOS_DONE} total={STAT_POMOS_TOTAL} />
      </div>
    </div>
  );
}

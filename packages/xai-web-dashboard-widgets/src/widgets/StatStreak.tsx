/**
 * StatStreak — habit streak counter with flame icon.
 *
 * Mock value (27 days) per `web design/module-dashboard.jsx` lines 378-389.
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";

export interface StatStreakProps {
  lang: Lang;
}

export const STAT_STREAK_DAYS = 27;

export function StatStreak({ lang }: StatStreakProps) {
  const { s } = useI18n(lang);
  const unit = lang === "zh" ? " 天" : " d";
  return (
    <div className="widget-content stat-streak">
      <div className="ws-label">{s("dashboard.streak")}</div>
      <div className="ws-row">
        <div className="ws-val mono">
          {STAT_STREAK_DAYS}
          <span className="ws-unit">{unit}</span>
        </div>
        <Icon name="flame" size={32} color="var(--red, oklch(60% 0.18 25))" />
      </div>
    </div>
  );
}

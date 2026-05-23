/**
 * StatTasks — completed tasks donut.
 *
 * Mock value (14/22) per `web design/module-dashboard.jsx` lines 366-377.
 * Future: row #20 statistics may inject real counts (currently out of scope).
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Donut } from "../internal/Donut.js";

export interface StatTasksProps {
  lang: Lang;
}

export const STAT_TASKS_DONE = 14;
export const STAT_TASKS_TOTAL = 22;

export function StatTasks({ lang }: StatTasksProps) {
  const { s } = useI18n(lang);
  return (
    <div className="widget-content stat-tasks">
      <div className="ws-label">{s("dashboard.tasks_done")}</div>
      <div className="ws-row">
        <div className="ws-val mono">
          {STAT_TASKS_DONE}
          <span className="ws-unit">/{STAT_TASKS_TOTAL}</span>
        </div>
        <Donut value={STAT_TASKS_DONE / STAT_TASKS_TOTAL} color="var(--accent)" size={48} />
      </div>
    </div>
  );
}

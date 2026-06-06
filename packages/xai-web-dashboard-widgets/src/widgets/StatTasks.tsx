/**
 * StatTasks — completed tasks donut (REAL DATA).
 *
 * §F real-data wiring: reads `xai_task_cols` via `usePref`, selects
 * done/total counts via `dataReads/taskStats.countDone`.
 *
 * Metric: all-bucket `done`/`total` (TaskCard.done === true, T-10 field;
 * absent = false). Renders the SHIPPED donut shape unchanged.
 *
 * Empty state: when total === 0, shows a localized "no tasks yet" label
 * (NOT a 0/0 donut — divide-by-zero + misleading).
 *
 * NO new registry key; zero write path; zero cross-plugin import.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #6
 */
import { usePref } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Donut } from "../internal/Donut.js";
import { countDone } from "../internal/dataReads/taskStats.js";
import { strEmpty } from "../internal/strings.js";

export interface StatTasksProps {
  lang: Lang;
}

export function StatTasks({ lang }: StatTasksProps) {
  const { s } = useI18n(lang);
  const [store] = usePref("xai_task_cols");
  const { done, total } = countDone(store);

  return (
    <div className="widget-content stat-tasks">
      <div className="ws-label">{s("dashboard.tasks_done")}</div>
      {total === 0 ? (
        <div className="ws-empty">{strEmpty("stat_tasks_empty", lang)}</div>
      ) : (
        <div className="ws-row">
          <div className="ws-val mono">
            {done}
            <span className="ws-unit">/{total}</span>
          </div>
          <Donut value={done / total} color="var(--accent)" size={48} />
        </div>
      )}
    </div>
  );
}

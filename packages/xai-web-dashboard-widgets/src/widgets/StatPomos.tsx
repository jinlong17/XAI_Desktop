/**
 * StatPomos — pomodoro count with 8-dot grid (REAL DATA).
 *
 * §F real-data wiring: reads `xai_pomodoro_sessions` via `usePref`, selects
 * today's completed focus count via `dataReads/pomoStats.countTodaysFocus`.
 *
 * Metric: today's completed focus sessions (mode==="focus" && completed===true &&
 * localDay(finishedAt) === todayLocal). Mirrors owner's `countTodaysPomos`.
 * Date basis = LOCAL day (NOT UTC — pomodoro uses `localDateKey`).
 *
 * **Field = `finishedAt`+`completed` (canonical). NOT Cmd-K's stale `completedAt`.**
 *
 * Count=0 is an honest state ("0 pomos today") — renders 0 with dots all off,
 * no extra empty label needed (the 0 + empty dots convey emptiness honestly).
 *
 * NO new registry key; zero write path; zero cross-plugin import.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #7
 */
import { usePref } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { PomoDots } from "../internal/PomoDots.js";
import { countTodaysFocus } from "../internal/dataReads/pomoStats.js";

export interface StatPomosProps {
  lang: Lang;
  /** Injected for testability; falls back to `new Date()` at runtime. */
  now?: Date;
}

export function StatPomos({ lang, now }: StatPomosProps) {
  const { s } = useI18n(lang);
  const [store] = usePref("xai_pomodoro_sessions");

  const effectiveNow = now ?? new Date();
  const count = countTodaysFocus(store, effectiveNow);

  return (
    <div className="widget-content stat-pomos">
      <div className="ws-label">{s("dashboard.pomos")}</div>
      <div className="ws-row">
        <div className="ws-val mono">{count}</div>
        <PomoDots count={count} total={8} />
      </div>
    </div>
  );
}

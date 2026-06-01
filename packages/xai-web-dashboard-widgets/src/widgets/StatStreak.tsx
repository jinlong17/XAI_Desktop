/**
 * StatStreak — habit streak counter with flame icon (REAL DATA).
 *
 * §F real-data wiring: reads `xai_habits_state` via `usePref`, selects
 * the max per-habit strict-consecutive streak via `dataReads/habitStreak.maxStreak`.
 *
 * Metric: max per-habit C1 strict-consecutive streak (today-anchored, UTC day keys).
 * Date basis = UTC (habits store check-in keys as UTC "YYYY-MM-DD").
 *
 * Empty states:
 * - No habits (habits array empty) → localized "no habits yet" label.
 * - Habits exist but streak === 0 → render "0" + flame (honest — streak broke today).
 *
 * NO new registry key; zero write path; zero cross-plugin import.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §F.1 #8
 */
import { usePref } from "@repo/plugin-web-storage";
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { isHabitsState } from "../internal/dataReads/isHabitsState.js";
import { maxStreak } from "../internal/dataReads/habitStreak.js";
import { strEmpty } from "../internal/strings.js";

export interface StatStreakProps {
  lang: Lang;
  /** Injected for testability; falls back to `new Date()` at runtime. */
  now?: Date;
}

export function StatStreak({ lang, now }: StatStreakProps) {
  const { s } = useI18n(lang);
  const [store] = usePref("xai_habits_state");

  const effectiveNow = now ?? new Date();
  const hasHabits = isHabitsState(store) && store.habits.length > 0;
  const streak = maxStreak(store, effectiveNow);
  const unit = lang === "zh" ? " 天" : " d";

  return (
    <div className="widget-content stat-streak">
      <div className="ws-label">{s("dashboard.streak")}</div>
      {!hasHabits ? (
        <div className="ws-empty">{strEmpty("stat_streak_empty", lang)}</div>
      ) : (
        <div className="ws-row">
          <div className="ws-val mono">
            {streak}
            <span className="ws-unit">{unit}</span>
          </div>
          <Icon name="flame" size={32} color="var(--red, oklch(60% 0.18 25))" />
        </div>
      )}
    </div>
  );
}

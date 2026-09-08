/**
 * PomodoroOverview — 4-card stats grid.
 *
 * Cards (per prototype):
 *   1. Today's Pomos  (count)
 *   2. Today's Focus  (minutes, e.g. "75m")
 *   3. Total Pomos    (count)
 *   4. Total Focus    (hours + minutes, e.g. "1h 15m")
 *
 * All counters derive via pure functions from `sessions`.
 * Zero-value cards render as "0".
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §11 (Frozen Assumption 11)
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.2
 */

import React, { useMemo } from "react";
import type { PomodoroSession } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import {
  countTodaysPomos,
  sumTodaysFocusMs,
  countTotalPomos,
  sumTotalFocusMs,
} from "./internal/derivedCounters.js";
import { localDateKey } from "./internal/formatRecordDate.js";

export interface PomodoroOverviewProps {
  sessions: PomodoroSession[];
  lang: Lang;
}

function formatMinutes(ms: number, lang: Lang): string {
  const minutes = Math.round(ms / 60_000);
  return lang === "zh" ? `${minutes}分` : `${minutes}m`;
}

function formatTotalFocus(ms: number, lang: Lang): string {
  const totalMinutes = Math.round(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (lang === "zh") {
    if (hours > 0 && minutes > 0) return `${hours}时${minutes}分`;
    if (hours > 0) return `${hours}时`;
    return `${minutes}分`;
  }
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export function PomodoroOverview({ sessions, lang }: PomodoroOverviewProps) {
  const { t } = useI18n(lang);
  const todayLocal = useMemo(() => localDateKey(new Date()), []);

  const todayPomos = useMemo(
    () => countTodaysPomos(sessions, todayLocal),
    [sessions, todayLocal],
  );
  const todayFocusMs = useMemo(
    () => sumTodaysFocusMs(sessions, todayLocal),
    [sessions, todayLocal],
  );
  const totalPomos = useMemo(() => countTotalPomos(sessions), [sessions]);
  const totalFocusMs = useMemo(() => sumTotalFocusMs(sessions), [sessions]);

  return (
    <div className="pomo-stats" role="list" aria-label={t.pomo.overview}>
      {/* Today's Pomos */}
      <div className="pomo-stat card" role="listitem">
        <div className="ps-label">{t.pomo.todays_pomos}</div>
        <div className="ps-val" aria-label={`${t.pomo.todays_pomos}: ${todayPomos}`}>
          {todayPomos === 0 ? "0" : todayPomos}
        </div>
      </div>

      {/* Today's Focus */}
      <div className="pomo-stat card" role="listitem">
        <div className="ps-label">{t.pomo.todays_focus}</div>
        <div className="ps-val" aria-label={`${t.pomo.todays_focus}: ${formatMinutes(todayFocusMs, lang)}`}>
          {todayFocusMs === 0 ? "0" : (
            <>
              {Math.round(todayFocusMs / 60_000)}
              <span className="ps-unit">{lang === "zh" ? "分" : "m"}</span>
            </>
          )}
        </div>
      </div>

      {/* Total Pomos */}
      <div className="pomo-stat card" role="listitem">
        <div className="ps-label">{t.pomo.total_pomos}</div>
        <div className="ps-val" aria-label={`${t.pomo.total_pomos}: ${totalPomos}`}>
          {totalPomos === 0 ? "0" : totalPomos}
        </div>
      </div>

      {/* Total Focus */}
      <div className="pomo-stat card" role="listitem">
        <div className="ps-label">{t.pomo.total_focus}</div>
        <div className="ps-val" aria-label={`${t.pomo.total_focus}: ${formatTotalFocus(totalFocusMs, lang)}`}>
          {totalFocusMs === 0 ? (
            "0"
          ) : (
            <>
              {Math.floor(Math.round(totalFocusMs / 60_000) / 60) > 0 && (
                <>
                  {Math.floor(Math.round(totalFocusMs / 60_000) / 60)}
                  <span className="ps-unit">{lang === "zh" ? "时" : "h"}</span>
                  {" "}
                </>
              )}
              {Math.round(totalFocusMs / 60_000) % 60 > 0 && (
                <>
                  {Math.round(totalFocusMs / 60_000) % 60}
                  <span className="ps-unit">{lang === "zh" ? "分" : "m"}</span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

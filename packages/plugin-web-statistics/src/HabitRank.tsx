/**
 * HabitRank.tsx — top-5 habit leaderboard with bar + streak flame.
 *
 * api.md §7.
 */

import * as React from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import type { HabitRankingRow } from "./types.js";
import { IconFire } from "./internal/icons.js";

export interface HabitRankProps {
  ranking: HabitRankingRow[];
  lang: Lang;
}

export function HabitRank({ ranking, lang }: HabitRankProps): React.ReactElement {
  if (ranking.length === 0) {
    return (
      <ul className="habit-rank">
        <li className="hrank-row" data-empty="true">
          <span className="hrank-i mono">—</span>
          <span className="hrank-body muted">
            {lang === "zh" ? "暂无习惯数据" : "No habit data yet"}
          </span>
        </li>
      </ul>
    );
  }
  return (
    <ul className="habit-rank">
      {ranking.map((row, i) => (
        <li key={row.id} className="hrank-row">
          <span className="hrank-i mono">{i + 1}</span>
          <span className="hrank-emoji" aria-hidden="true">
            {row.emoji}
          </span>
          <div className="hrank-body">
            <div className="hrank-title">
              {lang === "zh" ? row.titleZh : row.titleEn}
            </div>
            <div className="hrank-bar">
              <div style={{ width: `${row.percent}%` }} />
            </div>
          </div>
          <span className="hrank-streak mono">
            <IconFire size={11} />
            {` ${row.streak}d`}
          </span>
        </li>
      ))}
    </ul>
  );
}

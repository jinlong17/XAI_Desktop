/**
 * FocusRecordList — grouped focus session history (last 7 days).
 *
 * Filter: completed focus sessions only (mode === "focus" && completed === true).
 * Group by local date (YYYY-MM-DD in user's TZ), sorted today-first.
 * Cap: first 7 day-groups.
 * Each row shows local time (HH:MM) + duration (M:SS).
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §10 (L-A)
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.2
 */

import React, { useMemo } from "react";
import type { PomodoroSession } from "./types.js";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { localDateKey, formatRecordDate } from "./internal/formatRecordDate.js";
import { formatLocalTime } from "./internal/formatLocalTime.js";
import { formatDuration } from "./internal/formatDuration.js";
import { IconTimer } from "./internal/icons.js";

export interface FocusRecordListProps {
  sessions: PomodoroSession[];
  lang: Lang;
}

interface DayGroup {
  dateKey: string;
  label: string;
  sessions: PomodoroSession[];
}

export function FocusRecordList({ sessions, lang }: FocusRecordListProps) {
  const { t } = useI18n(lang);

  const groups = useMemo((): DayGroup[] => {
    const todayKey = localDateKey(new Date());

    // Filter: completed focus sessions only
    const focusSessions = sessions.filter((s) => s.mode === "focus" && s.completed);

    // Group by local date
    const byDate = new Map<string, PomodoroSession[]>();
    for (const s of focusSessions) {
      const key = localDateKey(new Date(s.finishedAt));
      if (!byDate.has(key)) byDate.set(key, []);
      byDate.get(key)!.push(s);
    }

    // Sort groups: today first, then descending
    const sortedKeys = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1));

    // Cap at 7 groups
    const cappedKeys = sortedKeys.slice(0, 7);

    return cappedKeys.map((key) => {
      const daySessions = byDate.get(key)!.slice().sort(
        (a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime(),
      );
      return {
        dateKey: key,
        label: formatRecordDate(key, lang, todayKey),
        sessions: daySessions,
      };
    });
  }, [sessions, lang]);

  return (
    <div className="record-list" aria-label={t.pomo.focus_record}>
      {groups.map((group) => (
        <div key={group.dateKey} className="record-group">
          <div className="record-date">{group.label}</div>
          {group.sessions.map((s) => (
            <div key={s.id} className="record-row">
              <span className="rec-dot" aria-hidden="true">
                <IconTimer size={10} />
              </span>
              <span className="rec-time">{formatLocalTime(s.finishedAt)}</span>
              <span className="rec-dur">{formatDuration(s.elapsedMs)}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

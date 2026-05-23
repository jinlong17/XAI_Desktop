/**
 * PomodoroModule — root route component for the Pomodoro module.
 *
 * P1 version: renders idle state only (no timer state machine yet).
 * Sessions = empty array from a local useState stub.
 * P2 will replace useState with usePref + wire useTimerTick.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §5
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.1
 */

import React, { useState } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import type { PomodoroSession } from "./types.js";
import { DEFAULT_DURATIONS_MS } from "./internal/durations.js";
import { formatDuration } from "./internal/formatDuration.js";
import { TimerRing } from "./TimerRing.js";
import { PomodoroOverview } from "./PomodoroOverview.js";
import { FocusRecordList } from "./FocusRecordList.js";
import { IconChevR, IconDots, IconSound, IconSoundOff, IconPlus } from "./internal/icons.js";

export interface PomodoroModuleProps {
  /** Active language. Drives useI18n bundle. */
  lang: Lang;
}

export function PomodoroModule({ lang }: PomodoroModuleProps) {
  const { t } = useI18n(lang);

  // P1: sessions always empty (no persistence yet — replaced in P2)
  const [sessions] = useState<PomodoroSession[]>([]);

  // P1: mute state (UI only — no audio in v1)
  const [muted, setMuted] = useState(false);

  // P1: current mode display (idle — replaced by timer state machine in P2)
  const currentMode = "focus" as const;
  const durationMs = DEFAULT_DURATIONS_MS[currentMode];
  const remainingDisplay = formatDuration(durationMs);

  return (
    <div className="module module-pomo">
      {/* Module header */}
      <header className="module-head">
        <h1 className="module-title">{t.pomo.title}</h1>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label={muted ? (lang === "zh" ? "取消静音" : "Unmute") : (lang === "zh" ? "静音" : "Mute")}
          onClick={() => setMuted((m) => !m)}
          data-testid="mute-btn"
        >
          {muted ? <IconSoundOff /> : <IconSound />}
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={lang === "zh" ? "更多" : "More"}
          data-testid="dots-btn"
        >
          <IconDots />
        </button>
      </header>

      {/* Main column */}
      <section className="pomo-main">
        {/* Focus pill — mode selector stub (no-op in v1) */}
        <div className="pomo-stage">
          <button type="button" className="focus-pill" aria-label={lang === "zh" ? "选择模式" : "Select mode"}>
            <span>
              {currentMode === "focus"
                ? t.pomo.focus
                : currentMode === "short-break"
                  ? (lang === "zh" ? "短休" : "Short Break")
                  : (lang === "zh" ? "长休" : "Long Break")}
            </span>
            <IconChevR size={12} />
          </button>

          {/* Circular timer ring */}
          <div>
            <TimerRing progress={0} running={false} />
            <div className="timer-inner">
              <span className="timer-num">{remainingDisplay}</span>
              <span className="timer-state" data-testid="timer-state">
                {lang === "zh" ? "准备开始" : "Ready"}
              </span>
            </div>
          </div>

          {/* Action buttons — P1: always shows Start (replaced by state machine in P2) */}
          <div className="pomo-actions" data-testid="pomo-actions">
            <button
              type="button"
              className="btn"
              aria-label={t.pomo.start}
              data-testid="start-btn"
            >
              {t.pomo.start}
            </button>
          </div>
        </div>
      </section>

      {/* Right rail / side panel */}
      <aside className="pomo-side">
        {/* Overview header */}
        <h2 className="side-h">{t.pomo.overview}</h2>
        <PomodoroOverview sessions={sessions} lang={lang} />

        {/* Focus record */}
        <div className="record-head">
          <h2 className="side-h" style={{ flex: 1 }}>{t.pomo.focus_record}</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label={lang === "zh" ? "手动添加" : "Add manually"}
            data-testid="add-record-btn"
          >
            <IconPlus size={14} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={lang === "zh" ? "更多" : "More"}
            data-testid="record-dots-btn"
          >
            <IconDots size={14} />
          </button>
        </div>
        <FocusRecordList sessions={sessions} lang={lang} />
      </aside>
    </div>
  );
}

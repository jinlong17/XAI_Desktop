/**
 * PomodoroModule — root route component for the Pomodoro module.
 *
 * P2 version: full timer state machine + usePref persistence + emitWebEvent.
 * Wires useTimerTick, appendSession, isPomodoroSession boundary cast,
 * and the `web:pomodoro:session-finished` emit per design.md §7.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §5+§6+§7
 * API contract: packages/xai-web-pomodoro/docs/api.md §2.1
 */

import React, { useMemo, useState, useRef } from "react";
import type { Lang } from "@repo/plugin-web-tokens";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { PomodoroSession, PomodoroMode } from "./types.js";
import { DEFAULT_DURATIONS_MS } from "./internal/durations.js";
import { isPomodoroSession } from "./internal/validate.js";
import { appendSession } from "./internal/sessionsReducer.js";
import { nextMode } from "./internal/nextMode.js";
import { formatDuration } from "./internal/formatDuration.js";
import { notifySessionEnd } from "./internal/notifications.js";
import { useTimerTick } from "./internal/useTimerTick.js";
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

  // ---- Persistence: usePref with boundary validation ----------------------
  const [rawSessions, setRawSessions] = usePref("xai_pomodoro_sessions");
  const sessions: PomodoroSession[] = useMemo(() => {
    if (!Array.isArray(rawSessions)) return [];
    return (rawSessions as unknown[]).filter((x): x is PomodoroSession => {
      const ok = isPomodoroSession(x);
      if (!ok && process.env.NODE_ENV !== "production") {
        console.warn("[plugin-web-pomodoro] Dropped invalid session record:", x);
      }
      return ok;
    });
  }, [rawSessions]);

  // ---- Mute state (UI only) -----------------------------------------------
  const [muted, setMuted] = useState(false);

  // ---- Emit dedup guard (StrictMode double-mount safe) --------------------
  const emittedSessionIdsRef = useRef<Set<string>>(new Set());

  // Ref to the accent dot for direct DOM transform in rAF loop
  const accentDotRef = useRef<SVGCircleElement | null>(null);

  // ---- Completed focus count (for nextMode) --------------------------------
  const completedFocusCount = useMemo(
    () => sessions.filter((s) => s.mode === "focus" && s.completed).length,
    [sessions],
  );

  // Stable ref to completedFocusCount to avoid stale closure in onTickToZero
  const completedFocusCountRef = useRef(completedFocusCount);
  completedFocusCountRef.current = completedFocusCount;

  // Stable ref for setRawSessions (stable from usePref)
  const setRawSessionsRef = useRef(setRawSessions);
  setRawSessionsRef.current = setRawSessions;

  // Ref to hold timerTick.reset so onTickToZero can call it
  const resetRef = useRef<((nextMode: PomodoroMode) => void) | null>(null);

  // ---- Tick-to-zero handler (injected into useTimerTick) ------------------
  // Stable callback — does not change between renders
  const onTickToZeroRef = useRef<
    ((mode: PomodoroMode, elapsedMs: number, sessionId: string, sessionStartedAt: string) => void) | null
  >(null);

  // Implement the callback (stable, uses refs only)
  onTickToZeroRef.current = (
    mode: PomodoroMode,
    elapsedMs: number,
    sessionId: string,
    sessionStartedAt: string,
  ) => {
    const finishedAt = new Date().toISOString();
    const record: PomodoroSession = {
      id: sessionId,
      mode,
      startedAt: sessionStartedAt,
      finishedAt,
      durationMs: DEFAULT_DURATIONS_MS[mode],
      // For tick-to-zero (completed=true), elapsedMs === durationMs (AC-SCHEMA-6)
      elapsedMs: DEFAULT_DURATIONS_MS[mode],
      completed: true,
    };

    // Persist
    try {
      setRawSessionsRef.current((prev) => {
        const prevArr = Array.isArray(prev)
          ? (prev as unknown[]).filter(isPomodoroSession)
          : [];
        return appendSession(prevArr, record);
      });
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[plugin-web-pomodoro] localStorage quota error:", e);
      }
    }

    // Emit (once per sessionId — StrictMode guard)
    if (!emittedSessionIdsRef.current.has(sessionId)) {
      emittedSessionIdsRef.current.add(sessionId);
      /**
       * Note: durationMs in payload === actual elapsed (=== configured durationMs for
       * tick-to-zero sessions). Statistics consumers should treat this as "actual time spent."
       */
      emitWebEvent("web:pomodoro:session-finished", {
        mode,
        durationMs: elapsedMs,
        finishedAt,
      });
    }

    // Notifications stub (no-op in v1)
    notifySessionEnd(mode, elapsedMs);

    // Advance mode
    const focusCountAfter =
      mode === "focus"
        ? completedFocusCountRef.current + 1
        : completedFocusCountRef.current;
    resetRef.current?.(nextMode(mode, focusCountAfter));
  };

  // Stable wrapper for useTimerTick
  const onTickToZero = useMemo(() => {
    return (mode: PomodoroMode, elapsedMs: number, sessionId: string, sessionStartedAt: string) => {
      onTickToZeroRef.current?.(mode, elapsedMs, sessionId, sessionStartedAt);
    };
  // stable — no deps (uses refs only)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Timer hook ---------------------------------------------------------
  const timerTick = useTimerTick({
    dotRef: accentDotRef,
    onTickToZero,
  });

  // Keep resetRef in sync
  resetRef.current = timerTick.reset;

  const { timerState, displayedRemainingMs, start, pause, resume, end, reset } = timerTick;

  // ---- End button handler -------------------------------------------------
  function handleEnd() {
    if (timerState.kind === "idle") return;

    let elapsedMs: number;
    const mode = timerState.mode;
    const sessionId = timerState.sessionId;
    const sessionStartedAt = timerState.sessionStartedAt;

    if (timerState.kind === "running") {
      const now = Date.now();
      const remaining = Math.max(
        0,
        timerState.remainingAtStartMs - (now - timerState.startedAt),
      );
      const elapsedThisRun = timerState.remainingAtStartMs - remaining;
      elapsedMs = timerState.elapsedBeforePauseMs + elapsedThisRun;
    } else {
      // paused
      elapsedMs = timerState.elapsedSoFarMs;
    }

    // Reset timer
    end();

    const finishedAt = new Date().toISOString();
    const record: PomodoroSession = {
      id: sessionId,
      mode,
      startedAt: sessionStartedAt,
      finishedAt,
      durationMs: DEFAULT_DURATIONS_MS[mode],
      elapsedMs,
      completed: false,
    };

    // Persist
    try {
      setRawSessions((prev) => {
        const prevArr = Array.isArray(prev)
          ? (prev as unknown[]).filter(isPomodoroSession)
          : [];
        return appendSession(prevArr, record);
      });
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[plugin-web-pomodoro] localStorage quota error:", e);
      }
    }

    // Emit (End-early always emits)
    if (!emittedSessionIdsRef.current.has(sessionId)) {
      emittedSessionIdsRef.current.add(sessionId);
      emitWebEvent("web:pomodoro:session-finished", {
        mode,
        durationMs: elapsedMs,
        finishedAt,
      });
    }

    // Advance to next mode (End-early: focus count unchanged)
    reset(nextMode(mode, completedFocusCount));
  }

  // ---- Derived display values ---------------------------------------------
  const currentMode = timerState.mode;
  const isRunning = timerState.kind === "running";
  const isPaused = timerState.kind === "paused";
  const isIdle = timerState.kind === "idle";

  const progress = useMemo(() => {
    const durationMs = DEFAULT_DURATIONS_MS[currentMode];
    const elapsed = durationMs - displayedRemainingMs;
    return Math.min(1, elapsed / durationMs);
  }, [currentMode, displayedRemainingMs]);

  const modeLabelFor = (m: PomodoroMode) => {
    if (m === "focus") return t.pomo.focus;
    if (m === "short-break") return lang === "zh" ? "短休" : "Short Break";
    return lang === "zh" ? "长休" : "Long Break";
  };

  const stateLabel = isRunning
    ? t.pomo.running
    : isPaused
      ? t.pomo.paused
      : lang === "zh"
        ? "准备开始"
        : "Ready";

  return (
    <div className="module module-pomo">
      {/* Module header */}
      <header className="module-head">
        <h1 className="module-title">{t.pomo.title}</h1>
        <span className="grow" />
        <button
          type="button"
          className="icon-btn"
          aria-label={
            muted
              ? lang === "zh"
                ? "取消静音"
                : "Unmute"
              : lang === "zh"
                ? "静音"
                : "Mute"
          }
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
        <div className="pomo-stage">
          {/* Focus pill — mode selector stub (no-op in v1) */}
          <button
            type="button"
            className="focus-pill"
            aria-label={lang === "zh" ? "选择模式" : "Select mode"}
          >
            <span>{modeLabelFor(currentMode)}</span>
            <IconChevR size={12} />
          </button>

          {/* Circular timer ring */}
          <div style={{ position: "relative" }}>
            <TimerRing ref={accentDotRef} progress={progress} running={isRunning} />
            <div className="timer-inner">
              <span className="timer-num">{formatDuration(displayedRemainingMs)}</span>
              <span className="timer-state" data-testid="timer-state">
                {stateLabel}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pomo-actions" data-testid="pomo-actions">
            {isIdle && (
              <button
                type="button"
                className="btn"
                aria-label={t.pomo.start}
                data-testid="start-btn"
                onClick={start}
              >
                {t.pomo.start}
              </button>
            )}
            {isRunning && (
              <>
                <button
                  type="button"
                  className="btn ghost"
                  aria-label={t.pomo.pause}
                  data-testid="pause-btn"
                  onClick={pause}
                >
                  {t.pomo.pause}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  aria-label={t.pomo.end}
                  data-testid="end-btn"
                  onClick={handleEnd}
                >
                  {t.pomo.end}
                </button>
              </>
            )}
            {isPaused && (
              <>
                <button
                  type="button"
                  className="btn"
                  aria-label={t.pomo.continue}
                  data-testid="continue-btn"
                  onClick={resume}
                >
                  {t.pomo.continue}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  aria-label={t.pomo.end}
                  data-testid="end-btn-paused"
                  onClick={handleEnd}
                >
                  {t.pomo.end}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Right rail / side panel */}
      <aside className="pomo-side">
        <h2 className="side-h">{t.pomo.overview}</h2>
        <PomodoroOverview sessions={sessions} lang={lang} />

        <div className="record-head">
          <h2 className="side-h" style={{ flex: 1 }}>
            {t.pomo.focus_record}
          </h2>
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

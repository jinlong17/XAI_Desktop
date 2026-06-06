/**
 * useTimerTick — internal hook managing the Pomodoro timer state machine.
 *
 * Implements T-A (absolute-timestamp) timing strategy per design.md §6:
 *   - `startedAt` (epoch ms via Date.now()) is stored as the absolute reference.
 *   - `requestAnimationFrame` loop recomputes remaining on every frame.
 *   - `setState` is called only when the displayed second changes (1 Hz gate).
 *   - Accent dot position is updated via a direct DOM transform on `dotRef`
 *     (no React re-render for 60 Hz sub-second motion).
 *   - `visibilitychange` + `pageshow` trigger a synchronous recompute on tab return.
 *   - Cleanup cancels rAF + removes listeners on unmount.
 *
 * Design: packages/xai-web-pomodoro/docs/design.md §5+§6
 * API contract: packages/xai-web-pomodoro/docs/api.md §6.1+§6.2+§6.3
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { PomodoroMode } from "../types.js";
import { computeRemainingMs } from "./computeRemainingMs.js";
import { DEFAULT_DURATIONS_MS } from "./durations.js";

// SVG ring geometry (must match TimerRing.tsx constants)
const CX = 160;
const CY = 160;
const R = 140;

/** Compute accent dot position for a given elapsed-progress fraction */
function dotPosition(progress: number): { cx: number; cy: number } {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const dotAngleDeg = clampedProgress * 360;
  const dotAngleRad = ((dotAngleDeg - 90) * Math.PI) / 180;
  return {
    cx: CX + R * Math.cos(dotAngleRad),
    cy: CY + R * Math.sin(dotAngleRad),
  };
}

// --------------------------------------------------------------------------
// TimerState discriminated union (locked per design.md §5)
// --------------------------------------------------------------------------

export type TimerState =
  | { kind: "idle"; mode: PomodoroMode; remainingMs: number; durationMs: number }
  | {
      kind: "running";
      mode: PomodoroMode;
      /** configured duration for this session */
      durationMs: number;
      /** epoch ms of when this run-segment started */
      startedAt: number;
      /** ms remaining when this run-segment started */
      remainingAtStartMs: number;
      /** ISO instant when the session was first started (for PomodoroSession.startedAt) */
      sessionStartedAt: string;
      /** stable session id (for dedup guard) */
      sessionId: string;
      /** ms accumulated during previous pause segments */
      elapsedBeforePauseMs: number;
    }
  | {
      kind: "paused";
      mode: PomodoroMode;
      /** configured duration for this session */
      durationMs: number;
      /** ms remaining at the moment of pause */
      remainingMs: number;
      sessionStartedAt: string;
      sessionId: string;
      /** ms elapsed across all run-segments up to this pause */
      elapsedSoFarMs: number;
    };

// --------------------------------------------------------------------------
// Hook return shape
// --------------------------------------------------------------------------

export interface UseTimerTickReturn {
  /** Current timer state (drives UI rendering). */
  timerState: TimerState;
  /** Displayed remaining ms (1 Hz gate — changes only on second boundary). */
  displayedRemainingMs: number;
  /** Start from idle. Optional duration overrides the idle state's duration. */
  start: (durationMs?: number) => void;
  /** Pause from running. */
  pause: () => void;
  /** Resume from paused. */
  resume: () => void;
  /**
   * End the session early (from running or paused).
   * Returns the elapsed ms for the caller to record.
   */
  end: () => number;
  /** Reset to idle (called after session-end internally). */
  reset: (nextMode: PomodoroMode, durationMs?: number) => void;
}

export interface UseTimerTickOptions {
  /** Ref to the accent dot SVGCircleElement for direct DOM updates (60 Hz). */
  dotRef?: React.RefObject<SVGCircleElement | null>;
  /** Whether the direct-DOM dot follows elapsed progress or remaining progress. */
  dotProgressMode?: "elapsed" | "remaining";
  /**
   * Callback invoked when tick reaches zero.
   * Receives mode, elapsedMs (=== durationMs for completed), sessionId, and sessionStartedAt.
   */
  onTickToZero?: (
    mode: PomodoroMode,
    durationMs: number,
    elapsedMs: number,
    sessionId: string,
    sessionStartedAt: string,
  ) => void;
}

// --------------------------------------------------------------------------
// Hook implementation
// --------------------------------------------------------------------------

export function useTimerTick(
  options: UseTimerTickOptions = {},
): UseTimerTickReturn {
  const { dotRef, dotProgressMode = "elapsed", onTickToZero } = options;

  const [timerState, setTimerState] = useState<TimerState>(() => ({
    kind: "idle",
    mode: "focus",
    remainingMs: DEFAULT_DURATIONS_MS["focus"],
    durationMs: DEFAULT_DURATIONS_MS["focus"],
  }));

  // Displayed remaining ms (1 Hz gate)
  const [displayedRemainingMs, setDisplayedRemainingMs] = useState(
    DEFAULT_DURATIONS_MS["focus"],
  );

  // rAF handle ref
  const rafRef = useRef<number | null>(null);
  // Reference to timerState that the rAF callback can read without stale closure
  const timerStateRef = useRef<TimerState>(timerState);
  timerStateRef.current = timerState;

  // Guard: track which sessionId has already called onTickToZero
  const tickToZeroFiredRef = useRef<Set<string>>(new Set());

  // Sync displayed remaining with timerState whenever state changes to idle/paused
  useEffect(() => {
    if (timerState.kind === "idle") {
      setDisplayedRemainingMs(timerState.remainingMs);
    } else if (timerState.kind === "paused") {
      setDisplayedRemainingMs(timerState.remainingMs);
    }
  }, [timerState]);

  // ---- rAF loop -----------------------------------------------------------

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const scheduleRaf = useCallback(() => {
    stopRaf();
    const tick = () => {
      const state = timerStateRef.current;
      if (state.kind !== "running") return;

      const now = Date.now();
      const remaining = computeRemainingMs(state.startedAt, state.remainingAtStartMs, now);

      // Update accent dot via direct DOM transform (60 Hz, no React re-render)
      if (dotRef?.current) {
        const elapsed = state.remainingAtStartMs - remaining;
        const totalElapsed = state.elapsedBeforePauseMs + elapsed;
        const elapsedProgress = Math.min(1, totalElapsed / state.durationMs);
        const progress =
          dotProgressMode === "remaining" ? 1 - elapsedProgress : elapsedProgress;
        const pos = dotPosition(progress);
        dotRef.current.setAttribute("cx", String(pos.cx));
        dotRef.current.setAttribute("cy", String(pos.cy));
      }

      // 1 Hz gate: only update displayed state when second changes
      const displayedSec = Math.floor(remaining / 1000);
      setDisplayedRemainingMs((prev) => {
        const prevSec = Math.floor(prev / 1000);
        return prevSec !== displayedSec ? remaining : prev;
      });

      // Tick-to-zero detection
      if (remaining <= 0 && !tickToZeroFiredRef.current.has(state.sessionId)) {
        tickToZeroFiredRef.current.add(state.sessionId);
        const elapsedMs = state.durationMs; // completed = elapsedMs === durationMs
        if (onTickToZero) {
          onTickToZero(
            state.mode,
            state.durationMs,
            elapsedMs,
            state.sessionId,
            state.sessionStartedAt,
          );
        }
        return; // caller's onTickToZero handles state transition
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf, dotRef, dotProgressMode, onTickToZero]);

  // ---- visibility recompute -----------------------------------------------

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      const state = timerStateRef.current;
      if (state.kind === "running") {
        const remaining = computeRemainingMs(
          state.startedAt,
          state.remainingAtStartMs,
          Date.now(),
        );
        setDisplayedRemainingMs(remaining);
      }
    }
  }, []);

  const handlePageShow = useCallback(() => {
    const state = timerStateRef.current;
    if (state.kind === "running") {
      const remaining = computeRemainingMs(
        state.startedAt,
        state.remainingAtStartMs,
        Date.now(),
      );
      setDisplayedRemainingMs(remaining);
    }
  }, []);

  // Register / clean up event listeners
  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [handleVisibilityChange, handlePageShow]);

  // Start / stop rAF based on state.kind
  useEffect(() => {
    if (timerState.kind === "running") {
      scheduleRaf();
    } else {
      stopRaf();
    }
    return stopRaf;
  }, [timerState.kind, scheduleRaf, stopRaf]);

  // ---- Actions -------------------------------------------------------------

  const start = useCallback((durationMs?: number) => {
    setTimerState((prev) => {
      if (prev.kind !== "idle") return prev;
      const now = Date.now();
      const configuredDurationMs = durationMs ?? prev.durationMs;
      const sessionId =
        "pomo_" +
        Math.floor(Math.random() * 36 ** 8)
          .toString(36)
          .padStart(8, "0");
      return {
        kind: "running",
        mode: prev.mode,
        durationMs: configuredDurationMs,
        startedAt: now,
        remainingAtStartMs: configuredDurationMs,
        sessionStartedAt: new Date().toISOString(),
        sessionId,
        elapsedBeforePauseMs: 0,
      };
    });
  }, []);

  const pause = useCallback(() => {
    setTimerState((prev) => {
      if (prev.kind !== "running") return prev;
      const now = Date.now();
      const remaining = computeRemainingMs(prev.startedAt, prev.remainingAtStartMs, now);
      const elapsedThisRun = prev.remainingAtStartMs - remaining;
      return {
        kind: "paused",
        mode: prev.mode,
        durationMs: prev.durationMs,
        remainingMs: remaining,
        sessionStartedAt: prev.sessionStartedAt,
        sessionId: prev.sessionId,
        elapsedSoFarMs: prev.elapsedBeforePauseMs + elapsedThisRun,
      };
    });
  }, []);

  const resume = useCallback(() => {
    setTimerState((prev) => {
      if (prev.kind !== "paused") return prev;
      const now = Date.now();
      return {
        kind: "running",
        mode: prev.mode,
        durationMs: prev.durationMs,
        startedAt: now,
        remainingAtStartMs: prev.remainingMs,
        sessionStartedAt: prev.sessionStartedAt,
        sessionId: prev.sessionId,
        elapsedBeforePauseMs: prev.elapsedSoFarMs,
      };
    });
  }, []);

  const end = useCallback((): number => {
    let elapsed = 0;
    setTimerState((prev) => {
      if (prev.kind === "running") {
        const now = Date.now();
        const remaining = computeRemainingMs(prev.startedAt, prev.remainingAtStartMs, now);
        const elapsedThisRun = prev.remainingAtStartMs - remaining;
        elapsed = prev.elapsedBeforePauseMs + elapsedThisRun;
      } else if (prev.kind === "paused") {
        elapsed = prev.elapsedSoFarMs;
      }
      // Return idle — caller handles mode advance and session recording
      return {
        kind: "idle",
        mode: prev.kind !== "idle" ? prev.mode : prev.mode,
        remainingMs: prev.durationMs,
        durationMs: prev.durationMs,
      };
    });
    return elapsed;
  }, []);

  const reset = useCallback((nextMode: PomodoroMode, durationMs?: number) => {
    const nextDurationMs = durationMs ?? DEFAULT_DURATIONS_MS[nextMode];
    setTimerState({
      kind: "idle",
      mode: nextMode,
      remainingMs: nextDurationMs,
      durationMs: nextDurationMs,
    });
    setDisplayedRemainingMs(nextDurationMs);
  }, []);

  return {
    timerState,
    displayedRemainingMs,
    start,
    pause,
    resume,
    end,
    reset,
  };
}

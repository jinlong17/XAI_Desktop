import { accountScope } from "@repo/plugin-web-storage";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { PomodoroMode, PomodoroSession } from "../types.js";
import { DEFAULT_DURATIONS_MS } from "./durations.js";
import { command, exportPomodoroRecovery, getPomodoroSnapshot, retainPomodoroController, retryPomodoro, subscribePomodoro } from "./sessionController.js";
import { elapsedAt } from "./sessionProtocol.js";
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


export interface UseTimerTickOptions {
  dotRef?: React.RefObject<SVGCircleElement | null>;
  dotProgressMode?: "elapsed" | "remaining";
  onTickToZero?: (mode: PomodoroMode, durationMs: number, elapsedMs: number, sessionId: string, sessionStartedAt: string) => void;
  onCommitted?: (session: PomodoroSession) => void;
}
export function useTimerTick(options: UseTimerTickOptions = {}) {
  const scope = useRef(accountScope.capture()).current;
  const snapshot = useSyncExternalStore(subscribePomodoro, getPomodoroSnapshot, getPomodoroSnapshot);
  const visible = snapshot.scope === scope && accountScope.isReady(scope);
  const [idle, setIdle] = useState({ mode: "focus" as PomodoroMode, durationMs: DEFAULT_DURATIONS_MS.focus });
  useEffect(retainPomodoroController, []);
  const seen = useRef(snapshot.lastCommitted?.id);
  const callbacks = useRef(options); callbacks.current = options;
  useEffect(() => {
    const record = snapshot.lastCommitted;
    if (!visible || !accountScope.isReady(scope) || !record || record.id === seen.current) return;
    seen.current = record.id;
    callbacks.current.onCommitted?.(record);
    if (record.completed) callbacks.current.onTickToZero?.(record.mode, record.durationMs, record.elapsedMs, record.id, record.startedAt);
  }, [snapshot.lastCommitted, visible, scope]);
  const active = visible ? snapshot.active : null;
  const timerState = useMemo<TimerState>(() => {
    if (!active) return { kind: "idle", ...idle, remainingMs: idle.durationMs };
    if (active.phase === "running") return { kind: "running", mode: active.mode, durationMs: active.durationMs, startedAt: active.runStartedAt, remainingAtStartMs: active.durationMs - active.accumulatedElapsedMs, sessionStartedAt: active.sessionStartedAt, sessionId: active.sessionId, elapsedBeforePauseMs: active.accumulatedElapsedMs };
    return { kind: "paused", mode: active.mode, durationMs: active.durationMs, remainingMs: active.phase === "settlement-pending" ? 0 : active.durationMs - active.accumulatedElapsedMs, sessionStartedAt: active.sessionStartedAt, sessionId: active.sessionId, elapsedSoFarMs: active.accumulatedElapsedMs };
  }, [active, idle]);
  const remaining = active ? active.phase === "settlement-pending" ? 0 : active.durationMs - elapsedAt(active, snapshot.now) : idle.durationMs;
  useEffect(() => {
    const dot = options.dotRef?.current;
    if (!dot) return;
    let frame = 0;
    const draw = () => {
      const elapsed = active ? elapsedAt(active, Date.now()) / active.durationMs : 0;
      const progress = options.dotProgressMode === "remaining" ? 1 - elapsed : elapsed;
      const angle = (progress * 360 - 90) * Math.PI / 180;
      dot.setAttribute("cx", String(160 + 140 * Math.cos(angle)));
      dot.setAttribute("cy", String(160 + 140 * Math.sin(angle)));
      if (active?.phase === "running") frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [options.dotRef, options.dotProgressMode, active]);

  const start = useCallback((durationMs?: number) => accountScope.isReady(scope) ? command("start", { mode: idle.mode, durationMs: durationMs ?? idle.durationMs }) : Promise.resolve(false), [idle, scope]);
  const pause = useCallback(() => accountScope.isReady(scope) ? command("pause") : Promise.resolve(false), [scope]);
  const resume = useCallback(() => accountScope.isReady(scope) ? command("resume") : Promise.resolve(false), [scope]);
  const end = useCallback(() => { if (!accountScope.isReady(scope)) return 0; const current = getPomodoroSnapshot(); const elapsed = current.active ? elapsedAt(current.active, Date.now()) : 0; void command("end"); return elapsed; }, [scope]);
  const reset = useCallback((mode: PomodoroMode, durationMs?: number) => {
    if (!accountScope.isReady(scope)) return;
    const duration = durationMs ?? DEFAULT_DURATIONS_MS[mode];
    if (getPomodoroSnapshot().active) { void command("discard").then(ok => { if (ok) setIdle({ mode, durationMs: duration }); }); }
    else setIdle(prev => prev.mode === mode && prev.durationMs === duration ? prev : { mode, durationMs: duration });
  }, [scope]);
  return { timerState, displayedRemainingMs: remaining, start, pause, resume, end, reset, error: visible ? snapshot.error : null, conflict: visible && snapshot.conflict, available: visible && snapshot.available, settlementPending: active?.phase === "settlement-pending", retry: () => accountScope.isReady(scope) ? retryPomodoro() : Promise.resolve(false), exportRecovery: () => exportPomodoroRecovery(scope) };
}
export type UseTimerTickReturn = ReturnType<typeof useTimerTick>;

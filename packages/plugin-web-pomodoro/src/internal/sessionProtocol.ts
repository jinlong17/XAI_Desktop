import { isPomodoroSession } from "./validate.js";
import type { PomodoroMode, PomodoroSession } from "../types.js";
export interface SessionOwner { kind: "account" | "demo"; accountId: string; generation: string }
export interface ActiveSession {
  version: 1;
  owner: SessionOwner;
  revision: number;
  sessionId: string;
  mode: PomodoroMode;
  durationMs: number;
  sessionStartedAt: string;
  phase: "running" | "paused" | "settlement-pending";
  accumulatedElapsedMs: number;
  runStartedAt: number;
  deadline: number;
  pausedAt?: number;
  settlement?: Omit<PomodoroSession, "recordedAt">;
}
export function elapsedAt(session: ActiveSession, now: number): number {
  return Math.min(session.durationMs, Math.max(0, session.accumulatedElapsedMs + (session.phase === "running" ? Math.max(0, now - session.runStartedAt) : 0)));
}
export function isActiveSession(value: unknown): value is ActiveSession {
  if (!value || typeof value !== "object") return false;
  const row = value as ActiveSession;
  return row.version === 1 && !!row.owner && ["account", "demo"].includes(row.owner.kind)
    && typeof row.owner.accountId === "string" && !!row.owner.accountId && typeof row.owner.generation === "string" && !!row.owner.generation
    && Number.isSafeInteger(row.revision) && row.revision >= 0 && typeof row.sessionId === "string" && !!row.sessionId
    && ["focus", "short-break", "long-break"].includes(row.mode) && ["running", "paused", "settlement-pending"].includes(row.phase)
    && Number.isFinite(row.durationMs) && row.durationMs > 0 && typeof row.sessionStartedAt === "string" && Number.isFinite(Date.parse(row.sessionStartedAt))
    && Number.isFinite(row.accumulatedElapsedMs) && row.accumulatedElapsedMs >= 0 && row.accumulatedElapsedMs <= row.durationMs
    && Number.isFinite(row.runStartedAt) && Number.isFinite(row.deadline)
    && (row.phase !== "running" || row.deadline === row.runStartedAt + row.durationMs - row.accumulatedElapsedMs)
    && (row.phase !== "paused" || Number.isFinite(row.pausedAt))
    && (row.phase !== "settlement-pending" || isPomodoroSession(row.settlement) && row.settlement.id === row.sessionId && row.settlement.mode === row.mode && row.settlement.durationMs === row.durationMs);
}
export function pendingSettlement(session: ActiveSession, now: number): ActiveSession {
  if (session.phase === "settlement-pending") return session;
  const completed = session.phase === "running" && now >= session.deadline;
  return { ...session, phase: "settlement-pending", revision: session.revision + 1, settlement: {
    id: session.sessionId, mode: session.mode, startedAt: session.sessionStartedAt,
    finishedAt: new Date(completed ? session.deadline : now).toISOString(),
    durationMs: session.durationMs, elapsedMs: completed ? session.durationMs : elapsedAt(session, now),
    completed, deadline: new Date(session.deadline).toISOString(), schemaVersion: 2,
  } };
}

import { accountScope, readGeneration, type AccountScope } from "@repo/plugin-web-storage";
import { emitWebEvent } from "@repo/xai-web-event-bus";
import type { PomodoroMode, PomodoroSession } from "../types.js";
import { isPomodoroSession } from "./validate.js";
import { elapsedAt, isActiveSession, pendingSettlement, type ActiveSession, type SessionOwner } from "./sessionProtocol.js";

export const ACTIVE_KEY = "xai_pomodoro_active";
export const HISTORY_KEY = "xai_pomodoro_sessions";
export interface SessionSnapshot {
  scope: AccountScope | null;
  active: ActiveSession | null;
  now: number;
  error: string | null;
  conflict: boolean;
  available: boolean;
  lastCommitted: PomodoroSession | null;
}
type Command = "start" | "pause" | "resume" | "end" | "discard" | "reconcile";
class SettlementCleanupError extends Error {}
class StaleCommandError extends Error {}
const unavailable = "This browser cannot safely save shared timers because Web Locks is unavailable. Use a browser with Web Locks support.";
const listeners = new Set<() => void>();
let snapshot: SessionSnapshot = { scope: null, active: null, now: 0, error: null, conflict: false, available: false, lastCommitted: null };
let mounted = 0;
let stopScope: (() => void) | undefined;
let interval: ReturnType<typeof setInterval> | undefined;
let inFlight = false;
let pendingDraft: { scope: AccountScope; candidate: ActiveSession } | null = null;
let retryAction: (() => Promise<boolean>) | null = null;
let observedScope: AccountScope | null = null;
function publish(delta: Partial<SessionSnapshot>) {
  snapshot = { ...snapshot, ...delta };
  for (const listener of listeners) listener();
}
function owner(scope: AccountScope): SessionOwner {
  accountScope.assertCurrent(scope);
  if (scope.kind === "locked" || !scope.accountId || !scope.generation) throw Error("Account storage is locked.");
  return { kind: scope.kind, accountId: scope.accountId, generation: scope.generation };
}
function assertScope(scope: AccountScope) {
  const context = owner(scope);
  const marker = readGeneration(localStorage, context.accountId, context.kind === "demo");
  if (marker && marker.generation !== context.generation) throw Error("Account data generation changed. Reopen account storage before continuing.");
  // physicalKey also checks the deletion tombstone; no auth database generation is involved.
  accountScope.physicalKey(ACTIVE_KEY, scope);
}
function activeFor(scope: AccountScope): ActiveSession | null {
  assertScope(scope);
  const raw = localStorage.getItem(accountScope.physicalKey(ACTIVE_KEY, scope));
  if (raw === null || raw === "null") return null;
  const value: unknown = JSON.parse(raw);
  if (!isActiveSession(value)) throw Error("Saved timer is unreadable. Export recovery data before making changes.");
  const expected = owner(scope);
  if (value.owner.kind !== expected.kind || value.owner.accountId !== expected.accountId || value.owner.generation !== expected.generation) throw Error("Saved timer belongs to a different account data generation. Export it for recovery.");
  return value;
}
function historyFor(scope: AccountScope): PomodoroSession[] {
  assertScope(scope);
  const raw = localStorage.getItem(accountScope.physicalKey(HISTORY_KEY, scope));
  const value: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(isPomodoroSession)) throw Error("Saved history contains unreadable records. Export recovery data before making changes.");
  return value;
}
function writeActive(scope: AccountScope, active: ActiveSession | null) {
  assertScope(scope);
  const key = accountScope.physicalKey(ACTIVE_KEY, scope);
  if (active) localStorage.setItem(key, JSON.stringify(active));
  else localStorage.removeItem(key);
}
function changed(scope: AccountScope) {
  const key = accountScope.physicalKey(HISTORY_KEY, scope);
  window.dispatchEvent(new StorageEvent("storage", { key, newValue: localStorage.getItem(key), storageArea: localStorage }));
}
function settle(scope: AccountScope, pending: ActiveSession): void {
  const record = pending.settlement;
  if (!record) throw Error("Settlement is incomplete; recovery is required.");
  const history = historyFor(scope);
  const existing = history.find(row => row.id === pending.sessionId);
  if (existing && (existing.finishedAt !== record.finishedAt || existing.elapsedMs !== record.elapsedMs || existing.mode !== record.mode || existing.completed !== record.completed)) throw Error("Conflicting history for this session. Export recovery data.");
  if (!existing) {
    const committed: PomodoroSession = { ...record, recordedAt: new Date(Date.now()).toISOString() };
    assertScope(scope);
    localStorage.setItem(accountScope.physicalKey(HISTORY_KEY, scope), JSON.stringify([...history, committed]));
    // The record is now durable. Events are a best-effort invalidation, never the ledger.
    publish({ lastCommitted: committed });
    assertScope(scope);
    emitWebEvent("web:pomodoro:session-finished", { sessionId: committed.id, mode: committed.mode, durationMs: committed.elapsedMs, finishedAt: committed.finishedAt, recordedAt: committed.recordedAt });
    changed(scope);
  }
  try { writeActive(scope, null); } catch { throw new SettlementCleanupError("Session was saved, but pending timer cleanup failed. Retry cleanup."); }
}
function refresh() {
  const scope = accountScope.capture();
  if (!accountScope.isReady(scope)) {
    observedScope = scope; retryAction = null; pendingDraft = null;
    publish({ scope, active: null, error: null, conflict: false, lastCommitted: null, now: Date.now(), available: false });
    return;
  }
  if (scope !== observedScope) { observedScope = scope; retryAction = null; pendingDraft = null; publish({ scope, lastCommitted: null, conflict: false, error: null }); }
  const available = typeof navigator !== "undefined" && !!navigator.locks;
  try { publish({ scope, active: activeFor(scope), now: Date.now(), available, ...(available ? {} : { error: unavailable }) }); }
  catch (error) { publish({ active: null, error: String(error), available }); }
}
function notifyStorage(event: StorageEvent) {
  if (event.storageArea !== localStorage) return;
  // Re-read scoped authoritative state; unrelated account events cannot publish their values.
  refresh();
}
export function retainPomodoroController(): () => void {
  if (++mounted === 1) {
    stopScope = accountScope.subscribe(refresh);
    window.addEventListener("storage", notifyStorage);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    refresh();
    interval = setInterval(() => {
      if (Math.floor(snapshot.now / 1000) !== Math.floor(Date.now() / 1000)) publish({ now: Date.now() });
      if (!snapshot.error && snapshot.active && (snapshot.active.phase === "settlement-pending" || snapshot.active.phase === "running" && Date.now() >= snapshot.active.deadline)) void command("reconcile");
    }, 100);
    if (snapshot.active && !snapshot.error) void command("reconcile");
  }
  return () => {
    if (--mounted !== 0) return;
    stopScope?.(); clearInterval(interval);
    window.removeEventListener("storage", notifyStorage);
    window.removeEventListener("pageshow", refresh);
    document.removeEventListener("visibilitychange", refresh);
    // Durable state stays intact when the last observer leaves.
  };
}
export const subscribePomodoro = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getPomodoroSnapshot = () => snapshot;

export async function command(action: Command, options?: { mode: PomodoroMode; durationMs: number }, expectedId = snapshot.active?.sessionId, expectedRevision = snapshot.active?.revision): Promise<boolean> {
  const scope = accountScope.capture();
  const issuedAt = Date.now();
  if (inFlight || retryAction) return false;
  if (!accountScope.isReady(scope)) return false;
  if (!navigator.locks) { publish({ error: unavailable, available: false }); return false; }
  inFlight = true;
  let frozenPending: ActiveSession | undefined;
  const execute = async (): Promise<boolean> => {
    try {
      const identity = owner(scope);
      await navigator.locks.request(`xai:timer:${identity.kind}:${encodeURIComponent(identity.accountId)}:${encodeURIComponent(identity.generation)}:pomodoro`, () => {
        assertScope(scope);
        const current = activeFor(scope);
        const now = Date.now();
        if (!current && expectedId && action !== "start" && historyFor(scope).some(row => row.id === expectedId)) {
          retryAction = null; pendingDraft = null; publish({ scope, active: null, error: null, conflict: false, now }); return;
        }
        if (action !== "start" && action !== "reconcile" && (!current || current.sessionId !== expectedId || current.phase !== "settlement-pending" && current.revision !== expectedRevision)) throw new StaleCommandError("This timer changed in another tab.");
        if (frozenPending && current && current.phase !== "settlement-pending") {
          writeActive(scope, frozenPending); settle(scope, frozenPending);
        } else if (current?.phase === "settlement-pending" || current?.phase === "running" && (action === "end" ? issuedAt : now) >= current.deadline) {
          const pending = current.phase === "settlement-pending" ? current : pendingSettlement(current, now);
          if (current.phase !== "settlement-pending") writeActive(scope, pending);
          settle(scope, pending);
        } else if (action === "start") {
          if (current) throw new StaleCommandError("A timer is already active in this account.");
          if (!options || !Number.isFinite(options.durationMs) || options.durationMs <= 0) throw Error("Invalid timer duration.");
          writeActive(scope, { version: 1, owner: identity, revision: 0, sessionId: `pomo_${crypto.randomUUID()}`, mode: options.mode, durationMs: options.durationMs, sessionStartedAt: new Date(now).toISOString(), phase: "running", accumulatedElapsedMs: 0, runStartedAt: now, deadline: now + options.durationMs });
        } else if (current && action === "pause" && current.phase === "running") {
          writeActive(scope, { ...current, phase: "paused", revision: current.revision + 1, accumulatedElapsedMs: elapsedAt(current, now), pausedAt: now });
        } else if (current && action === "resume" && current.phase === "paused") {
          writeActive(scope, { ...current, phase: "running", revision: current.revision + 1, runStartedAt: now, deadline: now + current.durationMs - current.accumulatedElapsedMs });
        } else if (current && action === "end") {
          frozenPending ??= pendingSettlement(current, issuedAt);
          pendingDraft = { scope, candidate: frozenPending };
          writeActive(scope, frozenPending);
          settle(scope, frozenPending);
        } else if (current && action === "discard") {
          writeActive(scope, null);
        }
        retryAction = null; pendingDraft = null;
        publish({ scope, active: activeFor(scope), now, error: null, conflict: false });
      });
      return true;
    } catch (error) {
      if (accountScope.isReady(scope)) {
        if (error instanceof StaleCommandError) {
          // A revision mismatch is an obsolete intent, not a failed write.
          // Drop its captured revision/settlement; never replay it over the winner.
          retryAction = null; pendingDraft = null; frozenPending = undefined;
          try { publish({ active: activeFor(scope), error: null, conflict: true, now: Date.now() }); }
          catch (readError) { publish({ active: null, error: `Timer recovery required: ${String(readError)}`, conflict: false }); }
          return false;
        }
        retryAction = execute;
        try { publish({ active: activeFor(scope), error: error instanceof SettlementCleanupError ? error.message : `Timer could not be saved: ${String(error)}`, now: Date.now() }); }
        catch { publish({ error: `Timer recovery required: ${String(error)}` }); }
      }
      return false;
    } finally { inFlight = false; }
  };
  return execute();
}
export function retryPomodoro(): Promise<boolean> { if (!retryAction || inFlight) return Promise.resolve(false); inFlight = true; return retryAction(); }
export function exportPomodoroRecovery(scope: AccountScope = accountScope.capture()): string {
  assertScope(scope);
  return JSON.stringify({ version: 1, owner: owner(scope), uncommittedSettlement: pendingDraft?.scope === scope ? pendingDraft.candidate : null, active: localStorage.getItem(accountScope.physicalKey(ACTIVE_KEY, scope)), history: localStorage.getItem(accountScope.physicalKey(HISTORY_KEY, scope)) }, null, 2);
}

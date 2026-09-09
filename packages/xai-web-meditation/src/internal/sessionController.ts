import { accountScope, readGeneration, type AccountScope } from '@repo/plugin-web-storage';
import type { MeditationPrefs } from '../types.js';
import { validatePrefs } from './validate.js';
import { resolveDurationSeconds } from './duration.js';
export const ACTIVE_KEY = 'xai_meditation_active';
export interface MeditationSession {
  version: 1; owner: { kind: 'account' | 'demo'; accountId: string; generation: string };
  sessionId: string; revision: number; phase: 'running' | 'paused' | 'ended';
  durationMs: number | null; accumulatedElapsedMs: number; runStartedAt: number; deadline: number | null;
  endedAt?: number; reason?: 'elapsed' | 'manual'; prefs: MeditationPrefs;
}
export function elapsedAt(row: MeditationSession, now: number): number {
  const elapsed = row.accumulatedElapsedMs + (row.phase === 'running' ? Math.max(0, now - row.runStartedAt) : 0);
  return Math.min(row.durationMs ?? Infinity, elapsed);
}
export function isMeditationSession(value: unknown): value is MeditationSession {
  if (!value || typeof value !== 'object') return false;
  const row = value as MeditationSession;
  return row.version === 1 && !!row.owner && ['account', 'demo'].includes(row.owner.kind)
    && typeof row.owner.accountId === 'string' && !!row.owner.accountId && typeof row.owner.generation === 'string' && !!row.owner.generation
    && typeof row.sessionId === 'string' && !!row.sessionId && Number.isSafeInteger(row.revision) && row.revision >= 0
    && ['running', 'paused', 'ended'].includes(row.phase) && (row.durationMs === null || Number.isFinite(row.durationMs) && row.durationMs > 0)
    && Number.isFinite(row.accumulatedElapsedMs) && row.accumulatedElapsedMs >= 0 && row.accumulatedElapsedMs <= (row.durationMs ?? Infinity)
    && Number.isFinite(row.runStartedAt) && (row.deadline === null ? row.durationMs === null : Number.isFinite(row.deadline) && row.durationMs !== null)
    && (row.phase !== 'running' || row.deadline === (row.durationMs === null ? null : row.runStartedAt + row.durationMs - row.accumulatedElapsedMs))
    && (row.phase !== 'ended' || Number.isFinite(row.endedAt) && row.endedAt! >= row.runStartedAt && ['elapsed', 'manual'].includes(row.reason ?? '') && (row.reason !== 'elapsed' || row.durationMs !== null && row.accumulatedElapsedMs === row.durationMs))
    && !!row.prefs && JSON.stringify(validatePrefs(row.prefs)) === JSON.stringify(row.prefs);
}
type Action = 'start' | 'pause' | 'resume' | 'end' | 'dismiss' | 'reconcile';
export interface MeditationSnapshot { active: MeditationSession | null; now: number; error: string | null; conflict: boolean; busy: boolean }
export function createMeditationController() {
  let snapshot: MeditationSnapshot = { active: null, now: Date.now(), error: null, conflict: false, busy: false };
  let observed = accountScope.capture();
  let operationToken = 0;
  let retryAction: (() => Promise<boolean>) | null = null;
  const listeners = new Set<() => void>();
  const publish = (delta: Partial<MeditationSnapshot>) => { snapshot = { ...snapshot, ...delta }; listeners.forEach(listener => listener()); };
  function key(scope: AccountScope) {
    accountScope.assertCurrent(scope);
    if (scope.kind === 'locked' || !scope.accountId || !scope.generation) throw Error('Account storage is locked.');
    const generation = readGeneration(localStorage, scope.accountId, scope.kind === 'demo');
    if (generation && generation.generation !== scope.generation) throw Error('Account storage changed. Reopen this account.');
    return accountScope.physicalKey(ACTIVE_KEY, scope);
  }
  function read(scope: AccountScope): MeditationSession | null {
    const raw = localStorage.getItem(key(scope));
    if (raw === null || raw === 'null') return null;
    const value: unknown = JSON.parse(raw);
    if (!isMeditationSession(value)) throw Error('Saved meditation is unreadable. Export recovery data before continuing.');
    if (value.owner.kind !== scope.kind || value.owner.accountId !== scope.accountId || value.owner.generation !== scope.generation) throw Error('Saved meditation belongs to another account generation.');
    return value;
  }
  function refresh() {
    const scope = accountScope.capture();
    if (scope !== observed) { observed = scope; operationToken++; retryAction = null; publish({ active: null, error: null, conflict: false, busy: false }); }
    if (!accountScope.isReady(scope)) { publish({ active: null }); return; }
    try { publish({ active: read(scope), now: Date.now() }); }
    catch (error) { publish({ active: null, error: String(error) }); }
  }
  async function command(action: Action, prefs?: MeditationPrefs): Promise<boolean> {
    if (accountScope.capture() !== observed) refresh();
    if (snapshot.busy || retryAction) return false;
    const scope = accountScope.capture(), expected = snapshot.active, issuedAt = Date.now();
    const execute = async (): Promise<boolean> => {
      if (accountScope.capture() !== scope) return false;
      const operation = ++operationToken;
      publish({ busy: true });
      try {
        const physical = key(scope);
        if (!navigator.locks) throw Error('Safe shared timers require browser Web Locks support.');
        let conflict = false;
        await navigator.locks.request('xai:meditation:' + physical, () => {
          const current = read(scope), now = Date.now();
          if (action !== 'reconcile' && (current?.sessionId !== expected?.sessionId || current?.revision !== expected?.revision)) { conflict = true; return; }
          let next = current;
          if (current?.phase === 'running' && current.deadline !== null && (action === 'pause' || action === 'end' ? issuedAt : now) >= current.deadline) {
            next = { ...current, phase: 'ended', revision: current.revision + 1, accumulatedElapsedMs: current.durationMs!, endedAt: current.deadline, reason: 'elapsed' };
          } else if (action === 'start') {
            if (current) { conflict = true; return; }
            if (!prefs || scope.kind === 'locked' || !scope.accountId || !scope.generation) throw Error('Invalid session configuration.');
            const config = validatePrefs(prefs), seconds = resolveDurationSeconds(config.durationMode, config.duration, config.customDuration);
            const durationMs = seconds === null ? null : seconds * 1000;
            next = { version: 1, owner: { kind: scope.kind, accountId: scope.accountId, generation: scope.generation }, sessionId: crypto.randomUUID(), revision: 0, phase: 'running', durationMs, accumulatedElapsedMs: 0, runStartedAt: now, deadline: durationMs === null ? null : now + durationMs, prefs: config };
          } else if (current?.phase === 'running' && action === 'pause') {
            next = { ...current, phase: 'paused', revision: current.revision + 1, accumulatedElapsedMs: elapsedAt(current, Math.max(current.runStartedAt, issuedAt)) };
          } else if (current?.phase === 'paused' && action === 'resume') {
            next = { ...current, phase: 'running', revision: current.revision + 1, runStartedAt: now, deadline: current.durationMs === null ? null : now + current.durationMs - current.accumulatedElapsedMs };
          } else if (current && current.phase !== 'ended' && action === 'end') {
            next = { ...current, phase: 'ended', revision: current.revision + 1, accumulatedElapsedMs: elapsedAt(current, issuedAt), endedAt: Math.max(current.runStartedAt, issuedAt), reason: 'manual' };
          } else if (current?.phase === 'ended' && action === 'dismiss') next = null;
          if (next !== current) {
            const target = key(scope);
            if (next) localStorage.setItem(target, JSON.stringify(next)); else localStorage.removeItem(target);
          }
          publish({ active: next, now, error: null, conflict: false });
        });
        if (accountScope.capture() !== scope || operation !== operationToken) return false;
        retryAction = null;
        if (conflict) { publish({ active: read(scope), error: null, conflict: true, now: Date.now() }); return false; }
        return true;
      } catch (error) {
        if (accountScope.capture() === scope && operation === operationToken) { retryAction = execute; publish({ error: 'Meditation could not be saved: ' + String(error) }); }
        return false;
      } finally { if (accountScope.capture() === scope && operation === operationToken) publish({ busy: false }); }
    };
    return execute();
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    command,
    retry: () => snapshot.busy ? Promise.resolve(false) : retryAction ? retryAction() : (refresh(), command('reconcile')),
    exportRecovery: () => localStorage.getItem(key(accountScope.capture())) ?? 'null',
    retain: () => {
      const stopScope = accountScope.subscribe(refresh);
      const reconcile = () => { refresh(); if (snapshot.active && !snapshot.error) void command('reconcile'); };
      window.addEventListener('storage', reconcile); window.addEventListener('pageshow', reconcile); document.addEventListener('visibilitychange', reconcile);
      reconcile();
      let timer: ReturnType<typeof setInterval> | undefined;
      const syncTimer = () => {
        if (snapshot.active?.phase !== 'running' || snapshot.error) { clearInterval(timer); timer = undefined; return; }
        timer ??= setInterval(() => {
          const row = snapshot.active;
          if (row?.phase !== 'running') return;
          publish({ now: Date.now() });
          if (row.deadline !== null && Date.now() >= row.deadline && !snapshot.error) void command('reconcile');
        }, 250);
      };
      listeners.add(syncTimer); syncTimer();
      return () => { stopScope(); listeners.delete(syncTimer); clearInterval(timer); window.removeEventListener('storage', reconcile); window.removeEventListener('pageshow', reconcile); document.removeEventListener('visibilitychange', reconcile); };
    },
  };
}

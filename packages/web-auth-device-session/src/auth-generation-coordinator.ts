import type { Provider, Session, SupabaseClient } from '@supabase/supabase-js';
import { createAuthGenerationClient, AUTH_GENERATION_SESSION_KEY } from './auth-generation-client';
import { createAuthGenerationStore, type AuthGenerationStore, type ActiveAuthGeneration, type AuthGenerationMutationResult } from './auth-generation-store';
import { createIndexedDbStore } from './storage';
import type { WebSupabaseClientConfig } from './client';
import { resolveSafeNextPath } from './redirects';

type TransientStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type Participant = ReturnType<typeof createAuthGenerationClient>;
export type AuthCoordinatorReason = 'unconfigured' | 'disposed' | 'storage-failed' | 'transient-failed' | 'invalid-session' | 'auth-failed' | 'superseded' | 'legacy-rejected' | 'invalid-attempt' | 'expired-attempt';
export type AuthAttemptKind = 'password' | 'signup' | 'oauth' | 'recovery';
export interface AuthAttemptEnvelope {
  version: 1;
  generation: string;
  kind: AuthAttemptKind;
  expectedActive: string | null;
  nextPath: string;
  createdAt: number;
}
export interface AuthCoordinatorSnapshot {
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'error' | 'unconfigured';
  session: Session | null;
  generation: string | null;
  owner: string | null;
  /** Read-only consumers only. Auth mutations must use coordinator actions. */
  client: SupabaseClient | null;
  error: AuthCoordinatorReason | null;
  revision: number;
}
export interface AuthCoordinatorResult {
  status: 'applied' | 'pending' | 'superseded' | 'failed';
  reason?: AuthCoordinatorReason;
  generation?: string;
  nextPath?: string;
  url?: string;
}
export interface AuthTransientCleanupResult {
  envelope: 'cleared' | 'failed';
  verifier: 'cleared' | 'failed';
  index: 'cleared' | 'failed';
}
export interface AuthSignOutResult extends AuthCoordinatorResult {
  remote: 'succeeded' | 'failed' | 'indeterminate' | 'not-requested';
  local: AuthGenerationMutationResult;
  transient: AuthTransientCleanupResult;
}
export interface AuthGenerationCoordinatorOptions {
  config: WebSupabaseClientConfig | null;
  store?: AuthGenerationStore;
  transientStorage?: TransientStorage | null;
  fetch?: typeof globalThis.fetch;
  legacy?: { key: string; read(key: string): Promise<string | null> };
  now?: () => number;
  createGeneration?: () => string;
}
export class AuthCoordinatorError extends Error {
  constructor(readonly reason: AuthCoordinatorReason) { super(`auth_coordinator_${reason}`); this.name = 'AuthCoordinatorError'; }
}
const failed = (reason: AuthCoordinatorReason): AuthCoordinatorResult => ({ status: 'failed', reason });
const superseded = (): AuthCoordinatorResult => ({ status: 'superseded', reason: 'superseded' });
const reasonOf = (error: unknown): AuthCoordinatorReason => error instanceof AuthCoordinatorError ? error.reason : 'storage-failed';
const sessionOwner = (session: Session | null): string | null => typeof session?.user?.id === 'string' && session.user.id.length > 0 ? session.user.id : null;
const same = (left: ActiveAuthGeneration | null, right: ActiveAuthGeneration | null) => left?.generation === right?.generation && left?.owner === right?.owner;

/** Framework-independent auth lifecycle. All remote calls use public SDK APIs. */
export function createAuthGenerationCoordinator(options: AuthGenerationCoordinatorOptions) {
  const config = options.config;
  const baseKey = config?.storageKey ?? 'xai-web-auth';
  const prefix = `xai.auth-attempt.v1:${encodeURIComponent(baseKey)}:`;
  const indexKey = `${prefix}pending`;
  const envelopeKey = (generation: string) => `${prefix}${encodeURIComponent(generation)}`;
  const verifierKey = (generation: string) => `xai.auth-client.v1:${encodeURIComponent(baseKey)}:${encodeURIComponent(generation)}-code-verifier`;
  const store = options.store ?? createAuthGenerationStore({ storageKey: baseKey });
  const legacy = options.legacy ?? { key: baseKey, read: (key: string) => createIndexedDbStore().getItem(key) };
  const now = options.now ?? Date.now;
  const createGeneration = options.createGeneration ?? (() => crypto.randomUUID());
  const participants = new Map<string, Participant>();
  const listeners = new Set<() => void>();
  const cleaning = new Set<string>();
  const callbacks = new Map<string, { code: string; promise: Promise<AuthCoordinatorResult> }>();
  let disposed = false, intent = 0, reconciliation = 0, actionRevision = 0;
  let errorLatch: { generation: string | null; reason: AuthCoordinatorReason } | null = null;
  let unsubscribe: (() => void) | undefined;
  let selected: Participant | null = null;
  let snapshot: AuthCoordinatorSnapshot = { status: config ? 'loading' : 'unconfigured', session: null, generation: null, owner: null, client: null, error: null, revision: 0 };
  let channel: BroadcastChannel | null = null;
  try { if (typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel(`xai.auth-coordinator.v1:${encodeURIComponent(baseKey)}`); } catch { /* Visibility/manual reconciliation remains available. */ }
  const notify = () => { try { channel?.postMessage({ type: 'changed' }); } catch { /* Persistence has already committed. */ } };
  function emit(next: Omit<AuthCoordinatorSnapshot, 'revision'>) {
    if (disposed) return;
    snapshot = { ...next, revision: snapshot.revision + 1 };
    listeners.forEach(listener => { try { listener(); } catch { /* A consumer cannot undo committed persistence or block other listeners. */ } });
  }
  function storage(): TransientStorage {
    try {
      const result = options.transientStorage === undefined ? (typeof window === 'undefined' ? null : window.sessionStorage) : options.transientStorage;
      if (!result) throw new Error('unavailable');
      return result;
    } catch { throw new AuthCoordinatorError('transient-failed'); }
  }
  function ensureConfigured() {
    if (disposed) throw new AuthCoordinatorError('disposed');
    if (!config) throw new AuthCoordinatorError('unconfigured');
  }
  function participant(generation: string) {
    ensureConfigured();
    let value = participants.get(generation);
    if (!value) {
      value = createAuthGenerationClient({ config: config!, store, lease: { generation }, transientStorage: options.transientStorage, fetch: options.fetch });
      participants.set(generation, value);
    }
    return value;
  }
  function stop(value: Participant | null) {
    if (value) void value.client.auth.stopAutoRefresh().catch(() => undefined);
  }
  function unselect() { unsubscribe?.(); unsubscribe = undefined; stop(selected); selected = null; }
  function setError(reason: AuthCoordinatorReason) {
    ++reconciliation;
    errorLatch = { generation: snapshot.generation, reason };
    emit({ ...snapshot, status: reason === 'unconfigured' ? 'unconfigured' : 'error', error: reason });
  }
  function cleanupTransient(generation: string): AuthTransientCleanupResult {
    const result: AuthTransientCleanupResult = { envelope: 'cleared', verifier: 'cleared', index: 'cleared' };
    for (const [part, key] of [['envelope', envelopeKey(generation)], ['verifier', verifierKey(generation)]] as const) {
      try { storage().removeItem(key); } catch { result[part] = 'failed'; }
    }
    try { const target = storage(); if (target.getItem(indexKey) === generation) target.removeItem(indexKey); }
    catch { result.index = 'failed'; }
    return result;
  }
  const cleanupFailed = (value: AuthTransientCleanupResult) => Object.values(value).includes('failed');
  function readEnvelope(generation?: string): AuthAttemptEnvelope | null {
    try {
      const target = storage(); const id = generation ?? target.getItem(indexKey);
      if (!id) return null;
      const raw = target.getItem(envelopeKey(id));
      if (!raw) throw new AuthCoordinatorError('invalid-attempt');
      const parsed = JSON.parse(raw) as AuthAttemptEnvelope;
      if (parsed.version !== 1 || parsed.generation !== id || !['password', 'signup', 'oauth', 'recovery'].includes(parsed.kind)
        || (parsed.expectedActive !== null && typeof parsed.expectedActive !== 'string') || typeof parsed.nextPath !== 'string'
        || typeof parsed.createdAt !== 'number' || !Number.isFinite(parsed.createdAt)) throw new AuthCoordinatorError('invalid-attempt');
      if (parsed.createdAt > now() + 60_000 || now() - parsed.createdAt > 24 * 60 * 60 * 1000) throw new AuthCoordinatorError('expired-attempt');
      return { ...parsed, nextPath: resolveSafeNextPath(parsed.nextPath).path };
    } catch (error) {
      if (error instanceof AuthCoordinatorError) throw error;
      throw new AuthCoordinatorError('transient-failed');
    }
  }
  async function assertAttempt(envelope: AuthAttemptEnvelope, operation: number) {
    ensureConfigured();
    if (operation !== intent || readEnvelope()?.generation !== envelope.generation) throw new AuthCoordinatorError('superseded');
    if (((await store.readActive())?.generation ?? null) !== envelope.expectedActive) throw new AuthCoordinatorError('superseded');
    if (await store.getItem({ generation: envelope.generation }, 'attempt') !== envelope.generation) throw new AuthCoordinatorError('invalid-attempt');
    if (operation !== intent) throw new AuthCoordinatorError('superseded');
  }
  async function begin(kind: AuthAttemptKind, nextPath = '/app') {
    ensureConfigured(); const operation = ++intent;
    let previousId: string | null;
    try { previousId = storage().getItem(indexKey); } catch { throw new AuthCoordinatorError('transient-failed'); }
    if (previousId) {
      if (previousId.length > 512) throw new AuthCoordinatorError('invalid-attempt');
      const previous = { generation: previousId };
      const cancelled = await store.cancelCandidate(previous);
      if (cancelled.status === 'failed') throw new AuthCoordinatorError('storage-failed');
      if (cleanupFailed(cleanupTransient(previous.generation))) throw new AuthCoordinatorError('transient-failed');
      stop(participants.get(previous.generation) ?? null);
    }
    const active = await store.readActive();
    const envelope: AuthAttemptEnvelope = { version: 1, generation: createGeneration(), kind, expectedActive: active?.generation ?? null, nextPath: resolveSafeNextPath(nextPath).path, createdAt: now() };
    if (operation !== intent) throw new AuthCoordinatorError('superseded');
    if ((await store.createCandidate(envelope)).status !== 'applied' || (await store.setItem(envelope, 'attempt', envelope.generation)).status !== 'applied' || (await store.setItem(envelope, 'attempt-context', JSON.stringify(envelope))).status !== 'applied') throw new AuthCoordinatorError('storage-failed');
    if (operation !== intent || disposed) { await store.cancelCandidate(envelope); throw new AuthCoordinatorError('superseded'); }
    try { const target = storage(); target.setItem(envelopeKey(envelope.generation), JSON.stringify(envelope)); target.setItem(indexKey, envelope.generation); }
    catch { await store.cancelCandidate(envelope); throw new AuthCoordinatorError('transient-failed'); }
    return { envelope, operation, value: participant(envelope.generation) };
  }
  async function adopt(active: ActiveAuthGeneration, value: Participant, session: Session, stillCurrent: () => boolean) {
    if (sessionOwner(session) !== active.owner) throw new AuthCoordinatorError('invalid-session');
    if (!same(await store.readActive(), active) || disposed || !stillCurrent()) return false;
    if (selected !== value) {
      unselect(); selected = value;
      const subscription = value.client.auth.onAuthStateChange(() => {
        // Never await SDK calls inside SDK event callbacks.
        if (!disposed && selected === value && !cleaning.has(active.generation)) queueMicrotask(() => { void reconcile(true); });
      });
      unsubscribe = () => subscription.data.subscription.unsubscribe();
    }
    errorLatch = null;
    emit({ status: 'authenticated', session, generation: active.generation, owner: active.owner, client: value.client, error: null });
    return true;
  }
  async function reconcile(automatic = false): Promise<AuthCoordinatorResult> {
    const revision = ++reconciliation;
    try {
      ensureConfigured(); const active = await store.readActive();
      if (revision !== reconciliation || disposed) return superseded();
      if (automatic && errorLatch && (!active || active.generation === errorLatch.generation)) return failed(errorLatch.reason);
      if (!automatic && errorLatch?.reason === 'transient-failed') {
        for (const row of await store.readRecovery()) if (cleanupFailed(cleanupTransient(row.generation))) throw new AuthCoordinatorError('transient-failed');
        if (active && cleanupFailed(cleanupTransient(active.generation))) throw new AuthCoordinatorError('transient-failed');
      }
      if (!active) {
        errorLatch = null; unselect(); emit({ status: 'unauthenticated', session: null, generation: null, owner: null, client: null, error: null });
        return { status: 'applied' };
      }
      const value = participant(active.generation);
      const result = await value.client.auth.getSession();
      if (revision !== reconciliation || disposed) return superseded();
      if (result.error || !result.data.session || sessionOwner(result.data.session) !== active.owner) throw new AuthCoordinatorError('invalid-session');
      if (!await adopt(active, value, result.data.session, () => revision === reconciliation)) return superseded();
      return { status: 'applied', generation: active.generation };
    } catch (error) { const reason = reasonOf(error); if (revision === reconciliation) setError(reason); return failed(reason); }
  }
  async function finishAttempt(envelope: AuthAttemptEnvelope, operation: number, session: Session | null): Promise<AuthCoordinatorResult> {
    await assertAttempt(envelope, operation);
    if (!session) return { status: 'pending', generation: envelope.generation, nextPath: envelope.nextPath };
    const owner = sessionOwner(session); if (!owner) throw new AuthCoordinatorError('invalid-session');
    const published = await store.publishAndRevokePredecessor({ lease: envelope, owner, expectedActive: envelope.expectedActive });
    if (published.status === 'superseded') return superseded();
    if (published.status !== 'applied') throw new AuthCoordinatorError('storage-failed');
    notify();
    if (operation !== intent) return superseded();
    const cleaned = cleanupTransient(envelope.generation);
    const priorCleanup = envelope.expectedActive ? cleanupTransient(envelope.expectedActive) : null;
    const revision = reconciliation;
    if (!await adopt({ generation: envelope.generation, owner }, participant(envelope.generation), session, () => operation === intent && revision === reconciliation)) return superseded();
    if (cleanupFailed(cleaned) || (priorCleanup && cleanupFailed(priorCleanup))) { setError('transient-failed'); return failed('transient-failed'); }
    return { status: 'applied', generation: envelope.generation, nextPath: envelope.nextPath };
  }
  async function action(run: () => Promise<AuthCoordinatorResult>): Promise<AuthCoordinatorResult> {
    const revision = ++actionRevision;
    ++reconciliation;
    try { return await run(); } catch (error) {
      if (revision !== actionRevision || disposed) return superseded();
      const reason = reasonOf(error); if (reason === 'superseded') return superseded();
      setError(reason); return failed(reason);
    }
  }
  function redirect(url: string, envelope: AuthAttemptEnvelope) {
    const target = new URL(url); target.searchParams.set('xai_auth_attempt', envelope.generation); return target.toString();
  }
  async function bootstrap(): Promise<AuthCoordinatorResult> {
    return action(async () => {
      ensureConfigured(); emit({ ...snapshot, status: 'loading', error: null });
      const recovery = await store.readRecovery();
      for (const row of recovery) if (cleanupFailed(cleanupTransient(row.generation))) throw new AuthCoordinatorError('transient-failed');
      readEnvelope(); // Malformed/denied pending metadata is an explicit recovery error.
      if (await store.readActive()) return reconcile();
      const raw = await legacy.read(legacy.key);
      if (raw !== null) {
        const migrated = await store.readLegacyImport(legacy.key);
        if (migrated) {
          if (recovery.some(row => row.generation === migrated.generation && row.owner === migrated.owner)) return reconcile();
          throw new AuthCoordinatorError('legacy-rejected');
        }
        if (recovery.length > 0) throw new AuthCoordinatorError('legacy-rejected');
        let owner: string | null;
        try { owner = sessionOwner(JSON.parse(raw) as Session); } catch { throw new AuthCoordinatorError('invalid-session'); }
        if (!owner) throw new AuthCoordinatorError('invalid-session');
        const lease = { generation: createGeneration() };
        if ((await store.createCandidate(lease)).status !== 'applied') throw new AuthCoordinatorError('storage-failed');
        const imported = await store.importLegacy({ lease, owner, expectedActive: null, legacyKey: legacy.key, expectedRaw: raw, destinationKey: AUTH_GENERATION_SESSION_KEY });
        if (imported.status !== 'applied') {
          await store.cancelCandidate(lease);
          // Another tab may have completed the same migration. Its validated
          // active generation is authoritative; never re-read legacy as fallback.
          if (await store.readActive()) return reconcile();
          throw new AuthCoordinatorError(imported.status === 'superseded' ? 'legacy-rejected' : 'storage-failed');
        }
        notify();
      }
      return reconcile();
    });
  }
  function capture(): ActiveAuthGeneration | null { return snapshot.generation && snapshot.owner ? Object.freeze({ generation: snapshot.generation, owner: snapshot.owner }) : null; }
  async function assertCurrent(captured: ActiveAuthGeneration, allowErrorCleanup = false) {
    ensureConfigured();
    if (snapshot.status !== 'authenticated' && !(allowErrorCleanup && snapshot.status === 'error')) throw new AuthCoordinatorError(snapshot.error ?? 'superseded');
    if (!same(capture(), captured) || !same(await store.readActive(), captured)) throw new AuthCoordinatorError('superseded');
  }
  const onChannel = () => { if (!disposed) void reconcile(true); };
  try { channel?.addEventListener('message', onChannel); } catch { /* Manual/visibility reconcile remains available. */ }
  const onVisibility = () => { if (typeof document !== 'undefined' && document.visibilityState === 'visible') onChannel(); };
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility);
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    bootstrap, reconcile, capture,
    readPendingAttempt: () => readEnvelope(),
    signInWithPassword(input: { email: string; password: string; nextPath?: string }) {
      return action(async () => {
        const { envelope, operation, value } = await begin('password', input.nextPath); await assertAttempt(envelope, operation);
        const result = await value.client.auth.signInWithPassword({ email: input.email, password: input.password });
        if (result.error) throw new AuthCoordinatorError('auth-failed');
        return finishAttempt(envelope, operation, result.data.session);
      });
    },
    signUp(input: { email: string; password: string; redirectTo: string; nextPath?: string }) {
      return action(async () => {
        const { envelope, operation, value } = await begin('signup', input.nextPath); await assertAttempt(envelope, operation);
        const result = await value.client.auth.signUp({ email: input.email, password: input.password, options: { emailRedirectTo: redirect(input.redirectTo, envelope) } });
        if (result.error) throw new AuthCoordinatorError('auth-failed');
        return finishAttempt(envelope, operation, result.data.session);
      });
    },
    startOAuth(input: { provider: Provider; redirectTo: string; nextPath?: string }) {
      return action(async () => {
        const { envelope, operation, value } = await begin('oauth', input.nextPath); await assertAttempt(envelope, operation);
        const result = await value.client.auth.signInWithOAuth({ provider: input.provider, options: { redirectTo: redirect(input.redirectTo, envelope), skipBrowserRedirect: true } });
        if (result.error) throw new AuthCoordinatorError('auth-failed');
        await assertAttempt(envelope, operation);
        return { status: 'pending', generation: envelope.generation, nextPath: envelope.nextPath, url: result.data.url ?? undefined };
      });
    },
    requestPasswordReset(input: { email: string; redirectTo: string; nextPath?: string }) {
      return action(async () => {
        const { envelope, operation, value } = await begin('recovery', input.nextPath); await assertAttempt(envelope, operation);
        const result = await value.client.auth.resetPasswordForEmail(input.email, { redirectTo: redirect(input.redirectTo, envelope) });
        if (result.error) throw new AuthCoordinatorError('auth-failed');
        return finishAttempt(envelope, operation, null);
      });
    },
    completeCallback(input: { generation: string; code: string }) {
      const running = callbacks.get(input.generation);
      if (running) return running.code === input.code ? running.promise : Promise.resolve(failed('invalid-attempt'));
      const promise = action(async () => {
        ensureConfigured(); const operation = ++intent;
        const active = await store.readActive();
        if (active?.generation === input.generation && await store.getItem(active, 'attempt') === input.generation) {
          // A previous effect already completed publication and removed transient
          // metadata. Reconcile its authenticated owner without redeeming again.
          const context = await store.getItem(active, 'attempt-context');
          if (!context) throw new AuthCoordinatorError('invalid-attempt');
          let nextPath: string;
          try { const saved = JSON.parse(context) as AuthAttemptEnvelope; if (saved.version !== 1 || saved.generation !== input.generation || !['signup', 'oauth', 'recovery'].includes(saved.kind)) throw Error('invalid'); nextPath = resolveSafeNextPath(saved.nextPath).path; }
          catch { throw new AuthCoordinatorError('invalid-attempt'); }
          const result = await reconcile();
          return result.status === 'applied' ? { ...result, nextPath } : result;
        }
        const envelope = readEnvelope();
        if (!envelope || envelope.generation !== input.generation) return superseded();
        if (envelope.kind === 'password') throw new AuthCoordinatorError('invalid-attempt');
        await assertAttempt(envelope, operation);
        const value = participant(envelope.generation);
        if (await store.getItem(envelope, AUTH_GENERATION_SESSION_KEY) !== null) {
          // The SDK may have committed before an effect was disposed. A valid
          // saved session can finish CAS publication; an invalid one fails closed.
          const saved = await value.client.auth.getSession();
          if (saved.error || !saved.data.session) throw new AuthCoordinatorError('invalid-session');
          return finishAttempt(envelope, operation, saved.data.session);
        }
        const result = await value.client.auth.exchangeCodeForSession(input.code);
        if (result.error) throw new AuthCoordinatorError('auth-failed');
        return finishAttempt(envelope, operation, result.data.session);
      });
      callbacks.set(input.generation, { code: input.code, promise });
      void promise.then(() => { if (callbacks.get(input.generation)?.promise === promise) callbacks.delete(input.generation); });
      return promise;
    },
    updatePassword(captured: ActiveAuthGeneration, password: string) {
      captured = { ...captured };
      return action(async () => {
        await assertCurrent(captured); const result = await participant(captured.generation).client.auth.updateUser({ password });
        if (result.error) throw new AuthCoordinatorError('auth-failed');
        await assertCurrent(captured); return reconcile();
      });
    },
    async signOut(captured: ActiveAuthGeneration, settings: { remote?: boolean; scope?: 'global' | 'local' } = {}): Promise<AuthSignOutResult> {
      captured = { ...captured };
      let remote: AuthSignOutResult['remote'] = 'not-requested';
      let local: AuthGenerationMutationResult = { status: 'failed', reason: 'invalid-input' };
      let transient: AuthTransientCleanupResult = { envelope: 'failed', verifier: 'failed', index: 'failed' };
      if (disposed || !config) return { ...failed(disposed ? 'disposed' : 'unconfigured'), remote, local, transient };
      let wasCurrent = false;
      try { await assertCurrent(captured, true); wasCurrent = true; } catch { /* A stale intent may only clean its own local generation. */ }
      const operation = wasCurrent ? ++intent : intent;
      if (wasCurrent) ++reconciliation;
      cleaning.add(captured.generation);
      try {
        if (wasCurrent && settings.remote !== false) {
          try { const result = await participant(captured.generation).client.auth.signOut({ scope: settings.scope ?? 'global' }); remote = result.error ? 'failed' : 'succeeded'; }
          catch { remote = 'indeterminate'; }
        }
        local = await store.revoke(captured);
        transient = cleanupTransient(captured.generation);
        stop(participants.get(captured.generation) ?? null);
        const current = await store.readActive();
        const replaced = !!current && !same(current, captured);
        if (local.status !== 'applied' || cleanupFailed(transient)) {
          if (wasCurrent && operation === intent && !replaced) setError(local.status !== 'applied' ? 'storage-failed' : 'transient-failed');
          return { ...failed(local.status !== 'applied' ? 'storage-failed' : 'transient-failed'), remote, local, transient };
        }
        notify();
        if (wasCurrent && operation === intent && !replaced) await reconcile();
        return { status: !wasCurrent || replaced || operation !== intent ? 'superseded' : 'applied', remote, local, transient };
      } catch {
        if (wasCurrent && operation === intent && snapshot.generation === captured.generation) setError('storage-failed');
        return { ...failed('storage-failed'), remote, local, transient };
      } finally { cleaning.delete(captured.generation); }
    },
    dispose() {
      disposed = true; ++intent; ++reconciliation; unselect(); participants.forEach(stop); callbacks.clear(); listeners.clear(); try { channel?.close(); } catch { /* Disposal must remain idempotent. */ }
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility);
    }
  };
}
export type AuthGenerationCoordinator = ReturnType<typeof createAuthGenerationCoordinator>;

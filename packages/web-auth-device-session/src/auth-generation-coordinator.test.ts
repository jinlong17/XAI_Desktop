// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { createAuthGenerationCoordinator, type AuthGenerationCoordinator } from './auth-generation-coordinator';
import { createAuthGenerationStore } from './auth-generation-store';
import { createIndexedDbStore } from './storage';
const config = { url: 'https://auth-fixture.invalid', anonKey: 'synthetic', autoRefreshToken: false };
let coordinators: AuthGenerationCoordinator[] = [], sequence = 0;
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange); sessionStorage.clear();
  vi.stubGlobal('BroadcastChannel', class { addEventListener() {} postMessage() {} close() {} });
});
afterEach(() => { coordinators.forEach(value => value.dispose()); coordinators = []; vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function gate() { let resolve!: () => void; const promise = new Promise<void>(done => { resolve = done; }); return { promise, resolve }; }
function session(id: string) { return { access_token: `${id}-synthetic-token`, refresh_token: `${id}-synthetic-refresh`, expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: { id, email: `${id}@fixture.invalid`, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } }; }
function network(hook?: (url: string, body: any) => Promise<void>) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input); const body = init?.body ? JSON.parse(String(init.body)) : {};
    await hook?.(url, body);
    if (url.includes('/logout')) return new Response(null, { status: 204 });
    if (url.includes('/recover')) return new Response('{}', { status: 200 });
    if (url.includes('/signup')) return new Response(JSON.stringify({ user: session('new-user').user }), { status: 200 });
    if (url.includes('/token?grant_type=pkce')) return new Response(JSON.stringify(session(body.auth_code)), { status: 200 });
    if (url.includes('/token?grant_type=password')) return new Response(JSON.stringify(session(body.email.split('@')[0])), { status: 200 });
    throw Error('Unexpected synthetic auth path');
  });
}
function coordinator(overrides: Partial<Parameters<typeof createAuthGenerationCoordinator>[0]> = {}) {
  const value = createAuthGenerationCoordinator({ config, transientStorage: sessionStorage, fetch: network(), createGeneration: () => `attempt-${++sequence}`, ...overrides }); coordinators.push(value); return value;
}
const login = (value: AuthGenerationCoordinator, id: string) => value.signInWithPassword({ email: `${id}@fixture.invalid`, password: 'synthetic' });

describe('auth lifecycle coordinator', () => {
  it('bootstraps empty storage and publishes each new password login in a fresh generation', async () => {
    const value = coordinator(); expect(value.getSnapshot().status).toBe('loading');
    expect(await value.bootstrap()).toEqual({ status: 'applied' }); expect(value.getSnapshot().status).toBe('unauthenticated');
    const listener = vi.fn(); const unsubscribe = value.subscribe(listener);
    expect((await login(value, 'A')).status).toBe('applied'); const a = value.capture();
    expect((await login(value, 'A')).status).toBe('applied'); expect(value.capture()?.generation).not.toBe(a?.generation);
    expect(value.getSnapshot().session?.user.id).toBe('A'); expect(listener).toHaveBeenCalled(); unsubscribe();
  });

  it('imports default legacy bytes without modification and refuses revoked legacy fallback on next bootstrap', async () => {
    const raw = `  ${JSON.stringify(session('legacy'))}\n`; const legacy = createIndexedDbStore(); await legacy.setItem('xai-web-auth', raw);
    const value = coordinator(); expect((await value.bootstrap()).status).toBe('applied'); expect(value.capture()?.owner).toBe('legacy');
    expect(await legacy.getItem('xai-web-auth')).toBe(raw);
    expect((await value.signOut(value.capture()!, { remote: false })).local.status).toBe('applied');
    const next = coordinator(); expect(await next.bootstrap()).toMatchObject({ status: 'applied' });
    expect(next.getSnapshot().status).toBe('unauthenticated'); expect(await legacy.getItem('xai-web-auth')).toBe(raw);
  });

  it('does not reinterpret legacy read failure as no session', async () => {
    const value = coordinator({ legacy: { key: 'xai-web-auth', read: async () => { throw Error('denied'); } } });
    expect(await value.bootstrap()).toMatchObject({ status: 'failed', reason: 'storage-failed' }); expect(value.getSnapshot().status).toBe('error');
  });

  it('delayed old login cannot replace B or set an error on its snapshot', async () => {
    const started = gate(), release = gate();
    const value = coordinator({ fetch: network(async (_url, body) => { if (body.email === 'A@fixture.invalid') { started.resolve(); await release.promise; } }) });
    await value.bootstrap(); const old = login(value, 'A'); await started.promise;
    expect((await login(value, 'B')).status).toBe('applied'); const selected = value.capture();
    release.resolve(); expect((await old).status).toBe('superseded');
    expect(value.capture()).toEqual(selected); expect(value.getSnapshot().status).toBe('authenticated'); expect(value.getSnapshot().error).toBeNull();
  });

  it('delayed A logout cleans only captured A and returns superseded while B stays authenticated', async () => {
    const started = gate(), release = gate();
    const value = coordinator({ fetch: network(async url => { if (url.includes('/logout')) { started.resolve(); await release.promise; } }) });
    await value.bootstrap(); await login(value, 'A'); const a = value.capture()!;
    const outgoing = value.signOut(a); await started.promise; await login(value, 'B'); const b = value.capture();
    release.resolve(); const result = await outgoing;
    expect(result.status).toBe('superseded'); expect(result.local.status).toBe('applied'); expect(result.remote).toBe('indeterminate');
    expect(value.capture()).toEqual(b); expect(value.getSnapshot().session?.user.id).toBe('B');
  });

  it('rejects stale updatePassword before network and skips stale remote logout', async () => {
    const fetch = network(); const value = coordinator({ fetch }); await value.bootstrap(); await login(value, 'A'); const a = value.capture()!;
    await login(value, 'B'); const requests = fetch.mock.calls.length;
    expect((await value.updatePassword(a, 'replacement')).status).toBe('superseded');
    expect((await value.signOut(a)).remote).toBe('not-requested'); expect(fetch).toHaveBeenCalledTimes(requests); expect(value.capture()?.owner).toBe('B');
  });

  it('recovers OAuth envelope after coordinator remount and exchanges into the original generation', async () => {
    const first = coordinator(); await first.bootstrap();
    const started = await first.startOAuth({ provider: 'github', redirectTo: 'https://app.fixture.invalid/auth/callback', nextPath: '/app?tab=tasks' });
    expect(started.status).toBe('pending'); expect(started.url).toContain('xai_auth_attempt'); const original = first.readPendingAttempt()!;
    expect(sessionStorage.getItem('xai.web-auth.pkce')).toBeNull(); first.dispose();
    const next = coordinator(); await next.bootstrap(); expect(next.readPendingAttempt()?.generation).toBe(original.generation);
    const result = await next.completeCallback({ generation: original.generation, code: 'OAuthUser' });
    expect(result).toMatchObject({ status: 'applied', generation: original.generation, nextPath: '/app?tab=tasks' });
    expect(next.capture()?.owner).toBe('OAuthUser'); expect(next.readPendingAttempt()).toBeNull();
  });

  it('signup and password reset persist separate callback envelopes without inventing authenticated sessions', async () => {
    const value = coordinator(); await value.bootstrap();
    const signup = await value.signUp({ email: 'new@fixture.invalid', password: 'synthetic', redirectTo: 'https://app.fixture.invalid/auth/callback' });
    expect(signup.status).toBe('pending'); expect(value.readPendingAttempt()?.kind).toBe('signup'); expect(value.capture()).toBeNull();
    const reset = await value.requestPasswordReset({ email: 'new@fixture.invalid', redirectTo: 'https://app.fixture.invalid/auth/reset' });
    expect(reset.status).toBe('pending'); expect(reset.generation).not.toBe(signup.generation); expect(value.readPendingAttempt()?.kind).toBe('recovery');
    expect((await value.completeCallback({ generation: reset.generation!, code: 'reset-owner' })).status).toBe('applied');
  });

  it('stale callback generation cannot enter the network or delete a newer envelope', async () => {
    const fetch = network(); const value = coordinator({ fetch }); await value.bootstrap();
    const old = await value.startOAuth({ provider: 'github', redirectTo: 'https://app.fixture.invalid/callback' });
    const newer = await value.startOAuth({ provider: 'github', redirectTo: 'https://app.fixture.invalid/callback' }); const requests = fetch.mock.calls.length;
    expect((await value.completeCallback({ generation: old.generation!, code: 'old' })).status).toBe('superseded');
    expect(fetch).toHaveBeenCalledTimes(requests); expect(value.readPendingAttempt()?.generation).toBe(newer.generation);
  });

  it('reports independent transient cleanup failure and retries from durable revocation', async () => {
    let deny = false;
    const transient = { getItem: (key: string) => sessionStorage.getItem(key), setItem: (key: string, raw: string) => sessionStorage.setItem(key, raw), removeItem: (key: string) => { if (deny && key.endsWith('-code-verifier')) throw Error('denied'); sessionStorage.removeItem(key); } };
    const value = coordinator({ transientStorage: transient }); await value.bootstrap(); await login(value, 'A'); const captured = value.capture()!; deny = true;
    const result = await value.signOut(captured, { remote: false });
    expect(result.local.status).toBe('applied'); expect(result.transient).toEqual({ envelope: 'cleared', verifier: 'failed', index: 'cleared' }); expect(result.status).toBe('failed');
    expect((await value.reconcile()).status).toBe('failed'); expect(value.getSnapshot().status).toBe('error');
    deny = false; const next = coordinator({ transientStorage: transient }); expect((await next.bootstrap()).status).toBe('applied'); expect(next.getSnapshot().status).toBe('unauthenticated');
  });

  it('keeps local revocation failure visible and does not fake a cleanup receipt', async () => {
    const store = createAuthGenerationStore(); const value = coordinator({ store }); await value.bootstrap(); await login(value, 'A');
    vi.spyOn(store, 'revoke').mockResolvedValue({ status: 'failed', reason: 'transaction-failed' });
    expect((await value.signOut(value.capture()!, { remote: false })).status).toBe('failed');
    expect(value.getSnapshot().status).toBe('error'); expect(await store.readRecovery()).toEqual([]); expect((await store.readActive())?.owner).toBe('A');
  });

  it('reconciles another coordinator publication from durable state and detaches old client', async () => {
    const first = coordinator(), second = coordinator(); await first.bootstrap(); await second.bootstrap(); await login(first, 'A'); await second.reconcile();
    const oldClient = first.getSnapshot().client!; const stop = vi.spyOn(oldClient.auth, 'stopAutoRefresh');
    await login(second, 'B'); expect((await first.reconcile()).status).toBe('applied'); expect(first.capture()?.owner).toBe('B'); expect(stop).toHaveBeenCalled();
  });

  it('represents missing config explicitly and disposal prevents new remote actions', async () => {
    const absent = coordinator({ config: null }); expect(absent.getSnapshot().status).toBe('unconfigured'); expect(await absent.bootstrap()).toMatchObject({ reason: 'unconfigured' });
    const fetch = network(); const value = coordinator({ fetch }); await value.bootstrap(); value.dispose(); expect((await login(value, 'A')).status).toBe('superseded'); expect(fetch).not.toHaveBeenCalled();
  });
});

it.each(['construct', 'post', 'close'])('broadcast %s failure cannot turn committed login/logout into failure', async fault => {
  vi.stubGlobal('BroadcastChannel', class {
    constructor(readonly name: string) { if (name.startsWith('xai.auth-coordinator.') && fault === 'construct') throw Error('denied'); }
    addEventListener() {}
    postMessage() { if (this.name.startsWith('xai.auth-coordinator.') && fault === 'post') throw Error('denied'); }
    close() { if (this.name.startsWith('xai.auth-coordinator.') && fault === 'close') throw Error('denied'); }
  });
  const value = coordinator(); await value.bootstrap();
  expect((await login(value, 'A')).status).toBe('applied');
  const result = await value.signOut(value.capture()!, { remote: false });
  expect(result.status).toBe('applied'); expect(result.local.status).toBe('applied');
  expect(() => value.dispose()).not.toThrow();
});

it('preserves global logout scope by default and permits explicit local scope', async () => {
  const fetch = network(); const value = coordinator({ fetch }); await value.bootstrap(); await login(value, 'A');
  await value.signOut(value.capture()!);
  expect(fetch.mock.calls.some(([input]) => String(input).includes('/logout?scope=global'))).toBe(true);
  await login(value, 'B'); await value.signOut(value.capture()!, { scope: 'local' });
  expect(fetch.mock.calls.some(([input]) => String(input).includes('/logout?scope=local'))).toBe(true);
});

it('deduplicates concurrent StrictMode-like callback redemption', async () => {
  const fetch = network(); const value = coordinator({ fetch }); await value.bootstrap();
  const attempt = await value.startOAuth({ provider: 'github', redirectTo: 'https://app.fixture.invalid/callback' });
  const first = value.completeCallback({ generation: attempt.generation!, code: 'callback-owner' });
  const second = value.completeCallback({ generation: attempt.generation!, code: 'callback-owner' });
  expect(first).toBe(second);
  expect((await first).status).toBe('applied'); expect((await second).status).toBe('applied');
  expect(fetch.mock.calls.filter(([url]) => String(url).includes('grant_type=pkce'))).toHaveLength(1);
  const fresh = coordinator({ fetch }); await fresh.bootstrap();
  expect((await fresh.completeCallback({ generation: attempt.generation!, code: 'callback-owner' })).status).toBe('applied');
  expect(fetch.mock.calls.filter(([url]) => String(url).includes('grant_type=pkce'))).toHaveLength(1);
});

it('resumes committed candidate session after dispose before publish without redeeming consumed code again', async () => {
  const fetch = network(); const store = createAuthGenerationStore(); const first = coordinator({ fetch, store }); await first.bootstrap();
  const attempt = await first.startOAuth({ provider: 'github', redirectTo: 'https://app.fixture.invalid/callback' });
  const write = store.setSessionItem.bind(store);
  const injection = vi.spyOn(store, 'setSessionItem').mockImplementation(async (...args) => {
    const result = await write(...args); first.dispose(); return result;
  });
  expect((await first.completeCallback({ generation: attempt.generation!, code: 'restored-owner' })).status).toBe('superseded');
  injection.mockRestore(); expect(await store.readActive()).toBeNull();
  const fresh = coordinator({ fetch, store }); await fresh.bootstrap();
  expect((await fresh.completeCallback({ generation: attempt.generation!, code: 'restored-owner' })).status).toBe('applied');
  expect(fresh.capture()?.owner).toBe('restored-owner');
  expect(fetch.mock.calls.filter(([url]) => String(url).includes('grant_type=pkce'))).toHaveLength(1);
});

it('does not invent callback recovery when the server consumed code but session persistence failed', async () => {
  let exchanges = 0;
  const baseFetch = network();
  const fetch: typeof globalThis.fetch = async (input, init) => {
    if (String(input).includes('grant_type=pkce') && ++exchanges > 1) return new Response(JSON.stringify({ error: 'invalid_grant', error_description: 'consumed synthetic code' }), { status: 400 });
    return baseFetch(input, init);
  };
  const store = createAuthGenerationStore(); const first = coordinator({ fetch, store }); await first.bootstrap();
  const attempt = await first.startOAuth({ provider: 'github', redirectTo: 'https://app.fixture.invalid/callback' });
  vi.spyOn(store, 'setSessionItem').mockResolvedValueOnce({ status: 'failed', reason: 'transaction-failed' });
  expect((await first.completeCallback({ generation: attempt.generation!, code: 'lost-response' })).status).toBe('failed');
  first.dispose(); const next = coordinator({ fetch, store }); await next.bootstrap();
  expect((await next.completeCallback({ generation: attempt.generation!, code: 'lost-response' })).status).toBe('failed');
  expect(await store.readActive()).toBeNull(); expect(next.getSnapshot().status).toBe('error');
  // The SDK consumed its transient verifier before the failed session write,
  // so a later retry may reject locally without even sending a second request.
  expect(exchanges).toBe(1);
});

it('latches unresolved error against in-flight and same-generation automatic reconcile until explicit retry', async () => {
  const store = createAuthGenerationStore(); const fetch = network(); const value = coordinator({ store, fetch }); await value.bootstrap(); await login(value, 'A');
  await new Promise(resolve => setTimeout(resolve, 25));
  const captured = await store.readActive(); const release = gate();
  vi.spyOn(store, 'readActive').mockImplementationOnce(async () => { await release.promise; return captured; });
  const oldReconcile = value.reconcile(true);
  vi.spyOn(store, 'createCandidate').mockResolvedValueOnce({ status: 'failed', reason: 'transaction-failed' });
  expect((await login(value, 'B')).status).toBe('failed');
  release.resolve(); expect((await oldReconcile).status).toBe('superseded');
  await new Promise(resolve => setTimeout(resolve, 25));
  expect(value.getSnapshot().status).toBe('error'); expect((await value.reconcile(true)).status).toBe('failed');
  expect(value.getSnapshot().status).toBe('error');
  const requests = fetch.mock.calls.length; expect((await value.updatePassword(captured!, 'blocked')).status).toBe('failed'); expect(fetch).toHaveBeenCalledTimes(requests);
  expect((await value.reconcile()).status).toBe('applied'); expect(value.getSnapshot().status).toBe('authenticated');
});

it('automatic reconciliation can recover an error only after a genuinely new durable generation appears', async () => {
  const store = createAuthGenerationStore(); const first = coordinator({ store }); await first.bootstrap(); await login(first, 'A');
  vi.spyOn(store, 'createCandidate').mockResolvedValueOnce({ status: 'failed', reason: 'transaction-failed' });
  expect((await login(first, 'B')).status).toBe('failed'); expect(first.getSnapshot().status).toBe('error');
  const other = coordinator(); await other.bootstrap(); await login(other, 'C');
  expect((await first.reconcile(true)).status).toBe('applied'); expect(first.capture()?.owner).toBe('C'); expect(first.getSnapshot().error).toBeNull();
});

it('does not replay an old completed callback result after B replaces its generation', async () => {
  const value = coordinator(); await value.bootstrap();
  const attempt = await value.startOAuth({ provider: 'github', redirectTo: 'https://app.fixture.invalid/callback' });
  expect((await value.completeCallback({ generation: attempt.generation!, code: 'A' })).status).toBe('applied');
  expect((await login(value, 'B')).status).toBe('applied');
  expect((await value.completeCallback({ generation: attempt.generation!, code: 'A' })).status).toBe('superseded');
  expect(value.capture()?.owner).toBe('B'); expect(value.getSnapshot().status).toBe('authenticated');
});

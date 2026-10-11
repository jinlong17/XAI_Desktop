// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory, IDBKeyRange, IDBObjectStore } from 'fake-indexeddb';
import { createAuthGenerationStore } from './auth-generation-store';
import { createAuthGenerationClient, AUTH_GENERATION_SESSION_KEY } from './auth-generation-client';

const config = { url: 'https://auth-fixture.invalid', anonKey: 'synthetic-public-key', autoRefreshToken: false };
const channelNames: string[] = [];
beforeEach(() => {
  vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  sessionStorage.clear(); channelNames.length = 0;
  vi.stubGlobal('BroadcastChannel', class {
    constructor(name: string) { channelNames.push(name); }
    addEventListener() {} postMessage() {} close() {}
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(yes => { resolve = yes; });
  return { promise, resolve };
}
function session(id: string) {
  return { access_token: `${id}-synthetic-token`, refresh_token: `${id}-synthetic-refresh`,
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer',
    user: { id, email: `${id}@fixture.invalid`, aud: 'authenticated', role: 'authenticated',
      app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } };
}
async function participant(generation = 'A', fetch?: typeof globalThis.fetch) {
  const store = createAuthGenerationStore();
  const lease = { generation };
  expect(await store.createCandidate(lease)).toEqual({ status: 'applied' });
  const result = createAuthGenerationClient({ config, store, lease, transientStorage: sessionStorage, fetch });
  await result.client.auth.initialize();
  return { ...result, store };
}

describe('generation-bound SDK persistence', () => {
  it('separates SDK broadcast names and stores stable logical session keys', async () => {
    const a = await participant('namespace:A'), b = await participant('namespace:B');
    expect(a.storageKey).not.toBe(b.storageKey);
    expect(channelNames).toEqual([a.storageKey, b.storageKey]);
    const rawA = JSON.stringify(session('A')), rawB = JSON.stringify(session('B'));
    await a.storage.setItem(a.storageKey, rawA);
    await b.storage.setItem(b.storageKey, rawB);
    expect(await a.store.getItem(a.lease, AUTH_GENERATION_SESSION_KEY)).toBe(rawA);
    expect(await b.store.getItem(b.lease, AUTH_GENERATION_SESSION_KEY)).toBe(rawB);
    await expect(a.storage.removeItem(b.storageKey)).rejects.toMatchObject({ reason: 'unknown-sdk-key' });
    expect(await b.storage.getItem(b.storageKey)).toBe(rawB);
  });

  it('actual SDK delayed A signOut cannot delete a published B session or its new PKCE', async () => {
    const started = deferred(), response = deferred();
    const fetch: typeof globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (url.includes('/logout')) { started.resolve(); await response.promise; return new Response(null, { status: 204 }); }
      if (!url.includes('/token?grant_type=password')) throw new Error('Unexpected network request');
      const id = String(JSON.parse(String(init?.body)).email).split('@')[0]!;
      return new Response(JSON.stringify(session(id)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    const a = await participant('A', fetch);
    expect((await a.client.auth.signInWithPassword({ email: 'A@fixture.invalid', password: 'synthetic' })).error).toBeNull();
    expect(await a.store.publish({ lease: a.lease, owner: 'A', expectedActive: null })).toEqual({ status: 'applied' });
    // Handle the intentional storage rejection immediately, not as an unhandled rejection.
    const outgoing = a.client.auth.signOut({ scope: 'local' }).then(value => value, error => error);
    await started.promise;
    const b = await participant('B', fetch);
    const events: string[] = [];
    const sub = b.client.auth.onAuthStateChange(event => { events.push(event); });
    expect((await b.client.auth.signInWithPassword({ email: 'B@fixture.invalid', password: 'synthetic' })).error).toBeNull();
    expect(await b.store.publish({ lease: b.lease, owner: 'B', expectedActive: 'A' })).toEqual({ status: 'applied' });
    await b.storage.setItem(`${b.storageKey}-code-verifier`, 'B-new-verifier');
    const raw = await b.storage.getItem(b.storageKey);
    response.resolve();
    expect(await outgoing).toMatchObject({ reason: 'active-changed' });
    expect(await b.storage.getItem(b.storageKey)).toBe(raw);
    expect(await b.storage.getItem(`${b.storageKey}-code-verifier`)).toBe('B-new-verifier');
    expect((await b.client.auth.getSession()).data.session?.user.id).toBe('B');
    expect(events).not.toContain('SIGNED_OUT');
    expect(await b.store.readActive()).toEqual({ generation: 'B', owner: 'B' });
    sub.data.subscription.unsubscribe();
  });

  it('rejects late durable writers and hides transient credentials after revocation', async () => {
    const a = await participant('revocation');
    await a.storage.setItem(`${a.storageKey}-code-verifier`, 'A-verifier');
    expect(await a.store.publish({ lease: a.lease, owner: 'A', expectedActive: null })).toEqual({ status: 'applied' });
    expect(await a.store.revoke({ ...a.lease, owner: 'A' })).toEqual({ status: 'applied' });
    await expect(a.storage.setItem(a.storageKey, JSON.stringify(session('A')))).rejects.toMatchObject({ reason: 'lease-revoked' });
    await expect(a.storage.setItem(`${a.storageKey}-code-verifier`, 'late-pkce')).rejects.toMatchObject({ reason: 'lease-revoked' });
    expect(await a.storage.getItem(`${a.storageKey}-code-verifier`)).toBeNull();
    await a.storage.removeItem(`${a.storageKey}-code-verifier`);
    expect(sessionStorage.getItem(`${a.storageKey}-code-verifier`)).toBeNull();
  });

  it('turns transaction abort into a failed SDK write while retaining committed bytes', async () => {
    const a = await participant('abort');
    const original = JSON.stringify(session('A'));
    await a.storage.setItem(a.storageKey, original);
    const put = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value, key) {
      const request = put.call(this, value, key); this.transaction.abort(); return request;
    });
    await expect(a.storage.setItem(a.storageKey, JSON.stringify({ ...session('A'), refresh_token: 'replacement' }))).rejects.toMatchObject({ reason: 'transaction-failed' });
    expect(await a.storage.getItem(a.storageKey)).toBe(original);
  });

  it('never reports a PKCE write success when transient storage is unavailable', async () => {
    const store = createAuthGenerationStore(), lease = { generation: 'missing-storage' };
    await store.createCandidate(lease);
    const a = createAuthGenerationClient({ config, store, lease, transientStorage: null });
    await a.client.auth.initialize();
    await expect(a.storage.setItem(`${a.storageKey}-code-verifier`, 'verifier')).rejects.toMatchObject({ reason: 'transient-write-failed' });
    expect(await store.getItem(lease, AUTH_GENERATION_SESSION_KEY)).toBeNull();
  });

  it('actual SDK cannot emit SIGNED_IN when its durable session transaction fails', async () => {
    const a = await participant('failed-login', async () => new Response(JSON.stringify(session('A')), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    }));
    const events: string[] = [];
    const sub = a.client.auth.onAuthStateChange(event => { events.push(event); });
    const put = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value, key) {
      const request = put.call(this, value, key); this.transaction.abort(); return request;
    });
    await expect(a.client.auth.signInWithPassword({ email: 'A@fixture.invalid', password: 'synthetic' }))
      .rejects.toMatchObject({ reason: 'transaction-failed' });
    expect(events).not.toContain('SIGNED_IN');
    expect(await a.store.readActive()).toBeNull();
    expect(await a.storage.getItem(a.storageKey)).toBeNull();
    sub.data.subscription.unsubscribe();
  });

  it('actual SDK cannot replace A with B within a published A generation', async () => {
    const a = await participant('owner-guard', async (_input, init) => {
      const id = String(JSON.parse(String(init?.body)).email).split('@')[0]!;
      return new Response(JSON.stringify(session(id)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
    await a.client.auth.signInWithPassword({ email: 'A@fixture.invalid', password: 'synthetic' });
    await a.store.publish({ lease: a.lease, owner: 'A', expectedActive: null });
    const raw = await a.storage.getItem(a.storageKey);
    await expect(a.client.auth.signInWithPassword({ email: 'B@fixture.invalid', password: 'synthetic' }))
      .rejects.toMatchObject({ reason: 'owner-mismatch' });
    expect(await a.storage.getItem(a.storageKey)).toBe(raw);
    expect(await a.store.readActive()).toEqual({ ...a.lease, owner: 'A' });
    expect((await a.client.auth.getSession()).data.session?.user.id).toBe('A');
  });

  it('rejects session bytes without a valid owner without revealing or replacing them', async () => {
    const a = await participant('malformed');
    const original = JSON.stringify(session('A'));
    await a.storage.setItem(a.storageKey, original);
    for (const raw of ['not-json', '{}', '{"user":{"id":""}}']) {
      await expect(a.storage.setItem(a.storageKey, raw)).rejects.toMatchObject({ reason: 'invalid-session-owner' });
    }
    expect(await a.storage.getItem(a.storageKey)).toBe(original);
  });
});

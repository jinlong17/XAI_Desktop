// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { IDBFactory, IDBKeyRange, IDBObjectStore } from 'fake-indexeddb';
import { WebAuthSessionProvider, useWebAuthSession, type WebAuthSessionContextValue } from './session';
import { createAuthGenerationStore } from './auth-generation-store';
import { resolveAppRouteGuard } from './guards';

const config = { url: 'https://auth-fixture.invalid', anonKey: 'synthetic-public', autoRefreshToken: false };
let root: Root;
let current: WebAuthSessionContextValue;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('indexedDB', new IDBFactory()); vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  vi.stubGlobal('BroadcastChannel', class { addEventListener() {} postMessage() {} close() {} });
  sessionStorage.clear();
  vi.stubGlobal('fetch', vi.fn(async (input, init) => {
    const url = String(input);
    if (url.includes('/logout')) return new Response(null, { status: 204 });
    if (!url.includes('/token?grant_type=password')) throw new Error('Unexpected network request');
    const id = String(JSON.parse(String(init?.body)).email).split('@')[0];
    return new Response(JSON.stringify({ access_token: `${id}-synthetic-token`, refresh_token: `${id}-synthetic-refresh`,
      expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer',
      user: { id, email: `${id}@fixture.invalid`, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } });
  }));
});
afterEach(async () => { if (root) await act(async () => root.unmount()); document.body.innerHTML = ''; vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function mount() {
  const identity = vi.fn();
  const holder = document.createElement('div'); document.body.append(holder); root = createRoot(holder);
  function Consumer() { current = useWebAuthSession(); return <output>{current.state}:{current.session?.user.id ?? 'none'}</output>; }
  await act(async () => { root.render(<WebAuthSessionProvider config={config} onIdentityChange={identity}><Consumer /></WebAuthSessionProvider>); });
  await act(async () => { await current.coordinator!.bootstrap(); });
  return { holder, identity };
}
async function login(id: string) {
  await act(async () => { expect((await current.coordinator!.signInWithPassword({ email: `${id}@fixture.invalid`, password: 'synthetic' })).status).toBe('applied'); });
}

it('live provider publishes durable identities and stale A cleanup cannot remove B', async () => {
  const view = await mount();
  expect(current.state).toBe('unauthenticated');
  await login('A');
  const oldClear = current.clearSessionStorage;
  await login('B');
  await act(async () => { await oldClear(); });
  expect(view.holder.textContent).toBe('authenticated:B');
  expect(current.session?.user.id).toBe('B');
  expect((await createAuthGenerationStore().readActive())?.owner).toBe('B');
  expect(view.identity.mock.calls.at(-1)).toEqual(['B']);
});

it('live persistence failure is an error with no protected session or redirect', async () => {
  const view = await mount(); await login('A');
  const put = IDBObjectStore.prototype.put;
  vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (this: IDBObjectStore, value, key) {
    const request = put.call(this, value, key); this.transaction.abort(); return request;
  });
  await act(async () => { expect((await current.coordinator!.signInWithPassword({ email: 'B@fixture.invalid', password: 'synthetic' })).status).toBe('failed'); });
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 25)); });
  expect(current.state).toBe('error'); expect(current.session).toBeNull();
  expect(view.identity.mock.calls.at(-1)).toEqual([null]);
  expect(resolveAppRouteGuard(current.state, '/app/tasks')).toEqual({ allow: false });
  expect((await createAuthGenerationStore().readActive())?.owner).toBe('A');
});

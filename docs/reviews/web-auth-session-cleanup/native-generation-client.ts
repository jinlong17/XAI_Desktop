import { createAuthGenerationStore } from '../../../packages/web-auth-device-session/src/auth-generation-store';
import { createAuthGenerationClient } from '../../../packages/web-auth-device-session/src/auth-generation-client';
const delay = (ms = 50) => new Promise(resolve => setTimeout(resolve, ms));
function gate() { let resolve!: () => void; const promise = new Promise<void>(done => { resolve = done; }); return { promise, resolve }; }
function session(id: string, revision = 0) {
  return { access_token: `${id}-synthetic-token-${revision}`, refresh_token: `${id}-synthetic-refresh`,
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer',
    user: { id, email: `${id}@fixture.invalid`, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } };
}
const startedLogout = gate(), releaseLogout = gate(), startedRefresh = gate(), releaseRefresh = gate();
let networkRequests = 0;
const fixtureFetch: typeof fetch = async (input, init) => {
  networkRequests++;
  const url = String(input);
  if (url.includes('/logout')) { startedLogout.resolve(); await releaseLogout.promise; return new Response(null, { status: 204 }); }
  const payload = JSON.parse(String(init?.body));
  if (url.includes('/token?grant_type=refresh_token')) { startedRefresh.resolve(); await releaseRefresh.promise; return new Response(JSON.stringify(session(String(payload.refresh_token).split('-')[0], 1)), { status: 200, headers: { 'Content-Type': 'application/json' } }); }
  if (!url.includes('/token?grant_type=password')) throw Error('Unexpected synthetic network path');
  return new Response(JSON.stringify(session(String(payload.email).split('@')[0])), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
const assert = (condition: unknown, message: string) => { if (!condition) throw Error('Setup/assertion: ' + message); };
async function make(generation: string, namespace = 'client-native') {
  const store = createAuthGenerationStore({ storageKey: namespace }); const lease = { generation };
  assert((await store.createCandidate(lease)).status === 'applied', 'candidate creation');
  const client = createAuthGenerationClient({ config: { url: 'https://auth-fixture.invalid', anonKey: 'synthetic', storageKey: namespace, autoRefreshToken: false }, store, lease, transientStorage: sessionStorage, fetch: fixtureFetch });
  await client.client.auth.initialize();
  return { ...client, store };
}
async function login(participant: Awaited<ReturnType<typeof make>>, id: string) {
  try {
    const result = await participant.client.auth.signInWithPassword({ email: `${id}@fixture.invalid`, password: 'synthetic' });
    return { failed: !!result.error, reason: result.error ? String(result.error.name) : null };
  } catch (error) { return { failed: true, reason: String((error as any).reason ?? (error as Error).name) }; }
}
async function run() {
  const a = await make('A'); assert(!(await login(a, 'A')).failed, 'A login');
  await a.store.publish({ lease: a.lease, owner: 'A', expectedActive: null });
  const outgoing = a.client.auth.signOut({ scope: 'local' }).then(() => ({ failed: false }), error => ({ failed: true, reason: error.reason }));
  await startedLogout.promise;
  const b = await make('B'); const events: string[] = [];
  const sub = b.client.auth.onAuthStateChange(event => { events.push(event); });
  assert(!(await login(b, 'B')).failed, 'B login'); await b.store.publish({ lease: b.lease, owner: 'B', expectedActive: 'A' });
  await b.client.auth.signInWithOAuth({ provider: 'github', options: { skipBrowserRedirect: true } });
  const beforeB = await b.storage.getItem(b.storageKey), beforePkce = await b.storage.getItem(`${b.storageKey}-code-verifier`);
  assert(!!beforeB && !!beforePkce, 'B native persisted session and actual SDK challenge');
  releaseLogout.resolve(); const oldLogout = await outgoing;
  const delayedSignOutPreserved = await b.storage.getItem(b.storageKey) === beforeB && await b.storage.getItem(`${b.storageKey}-code-verifier`) === beforePkce && (await b.store.readActive())?.owner === 'B' && !events.includes('SIGNED_OUT');
  // Native channel delivery under the old SDK key cannot reach B's SDK subscriber.
  const oldChannel = new BroadcastChannel(a.storageKey); oldChannel.postMessage({ event: 'SIGNED_OUT', session: null }); await delay(100); oldChannel.close();
  const oldBroadcastIgnored = !events.includes('SIGNED_OUT'); sub.data.subscription.unsubscribe();

  const f = await make('F', 'failure-native'); assert(!(await login(f, 'F')).failed, 'F login'); await f.store.publish({ lease: f.lease, owner: 'F', expectedActive: null });
  const original = await f.storage.getItem(f.storageKey); const nativePut = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function(value: any, key?: IDBValidKey) {
    const request = nativePut.call(this, value, key!);
    if (value?.generation === 'F' && value?.entries?.some(([name]: [string]) => name === 'session')) this.transaction.abort();
    return request;
  };
  let failedSave;
  try { failedSave = await login(f, 'F'); } finally { IDBObjectStore.prototype.put = nativePut; }
  const sdkFailureRetained = failedSave.failed && await f.storage.getItem(f.storageKey) === original;

  const r = await make('R', 'refresh-native'); assert(!(await login(r, 'R')).failed, 'R login'); await r.store.publish({ lease: r.lease, owner: 'R', expectedActive: null });
  const refreshing = r.client.auth.refreshSession().then(value => ({ failed: !!value.error }), error => ({ failed: true, reason: error.reason }));
  await startedRefresh.promise;
  const s = await make('S', 'refresh-native'); assert(!(await login(s, 'S')).failed, 'S login'); await s.store.publish({ lease: s.lease, owner: 'S', expectedActive: 'R' });
  const originalS = await s.storage.getItem(s.storageKey); releaseRefresh.resolve(); const oldRefresh = await refreshing;
  const oldRefreshRejected = oldRefresh.failed && await s.storage.getItem(s.storageKey) === originalS && (await s.store.readActive())?.owner === 'S';

  const o = await make('O', 'owner-native'); assert(!(await login(o, 'O')).failed, 'O login'); await o.store.publish({ lease: o.lease, owner: 'O', expectedActive: null });
  const originalO = await o.storage.getItem(o.storageKey);
  const wrongOwnerLogin = await login(o, 'P');
  const boundOwnerPreserved = wrongOwnerLogin.failed && await o.storage.getItem(o.storageKey) === originalO;
  const currentOwner = (await o.store.readActive())?.owner;
  const persistedUser = JSON.parse((await o.storage.getItem(o.storageKey))!).user.id;

  const requestsBefore = networkRequests;
  const lateOldLogin = await login(a, 'Q');
  const oldClientStillCallsNetwork = networkRequests > requestsBefore;
  return { pass: delayedSignOutPreserved && oldBroadcastIgnored && sdkFailureRetained && oldRefreshRejected && boundOwnerPreserved,
    delayedSignOutPreserved, oldLogout, oldBroadcastIgnored, sdkFailureRetained, failedSave, oldRefreshRejected, oldRefresh,
    boundOwnerPreserved, wrongOwnerLogin, currentOwner, persistedUser, oldClientStillCallsNetwork, lateOldLogin,
    boundary: 'Actual installed SDK + native IDB/sessionStorage/BroadcastChannel, synthetic auth HTTP, isolated profile. No coordinator or host UI integration; old client network requests remain possible.' };
}
run().then(result => fetch('/result', { method: 'POST', body: JSON.stringify(result) }))
  .catch(error => fetch('/result', { method: 'POST', body: JSON.stringify({ pass: false, error: String(error), stack: error.stack }) }));

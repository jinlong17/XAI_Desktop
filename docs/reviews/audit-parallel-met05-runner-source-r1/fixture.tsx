/** This entire synthetic public-auth fixture is UNQUALIFIED; never production auth. */
import { useEffect, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { WebAuthSessionProvider, useWebAuthSession } from '@repo/web-auth-device-session/web';
import { MetricTrackerModule, createSeedMetricTrackerState, METRIC_TRACKER_STATE_KEY } from '@repo/plugin-web-metric-tracker';
import { accountScope, generationKey, generationMarkerKey } from '@repo/plugin-web-storage';
import { invalidateAccountIdentity } from '__met_archive_host__/providers/AccountStorageGate.tsx';
import { router } from '__met_archive_host__/routes/router.tsx';
import '@repo/plugin-web-tokens';
import '__met_archive_host__/styles/global.css';

const parameters = new URLSearchParams(location.search);
const lang = parameters.get('__met_lang') === 'zh' ? 'zh' : 'en';
const lane = parameters.get('__met_lane') ?? 'host';
const generation = 'met05-disposable-r1';
const accounts = ['met05-synthetic-A', 'met05-synthetic-B'] as const;
const keyOf = (account: string) => generationKey(account, generation, METRIC_TRACKER_STATE_KEY, false);
const set = Storage.prototype.setItem;
const remove = Storage.prototype.removeItem;
const get = Storage.prototype.getItem;
const instrument = { writes: 0, removes: 0, denyKey: null as string | null, audit: [] as unknown[], ready: false, firstRender: [] as unknown[], events: [] as unknown[], boundary: false };
const owned = (key: string) => accounts.some(account => key === keyOf(account));
Storage.prototype.setItem = function(key, value) {
  if (this === localStorage && owned(key) && instrument.boundary) { instrument.writes++; instrument.events.push({ type: 'set', key, value, denied: key === instrument.denyKey }); if (key === instrument.denyKey) { instrument.denyKey = null; throw new DOMException('MET05 disposable once-denied write', 'QuotaExceededError'); } }
  return set.call(this, key, value);
};
Storage.prototype.removeItem = function(key) { if (this === localStorage && owned(key) && instrument.boundary) { instrument.removes++; instrument.events.push({ type: 'remove', key }); } return remove.call(this, key); };
for (const type of ['keydown', 'keyup', 'keypress', 'mousedown', 'mouseup', 'click', 'input']) document.addEventListener(type, event => {
  instrument.audit.push({ type, isTrusted: event.isTrusted, key: (event as KeyboardEvent).key, code: (event as KeyboardEvent).code, target: (event.target as Element)?.tagName, text: (event.target as Element)?.textContent?.slice(0,100) });
}, true);

// Seed only the disposable namespaces. No forced activate() in the actual-host lane.
for (const [index, account] of accounts.entries()) {
  if (get.call(localStorage, generationMarkerKey(account)) === null) set.call(localStorage, generationMarkerKey(account), JSON.stringify({ generation, migrationId: 'met05-explicit-synthetic-marker', previous: null }));
  if (get.call(localStorage, keyOf(account)) === null) { const state = createSeedMetricTrackerState('2026-10-10T00:00:00.000Z'); set.call(localStorage, keyOf(account), JSON.stringify({ ...state, records: [], profile: { ...state.profile, targetWeightKg: index ? 85 : 70 } })); }
}
set.call(localStorage, 'xai_pref_lang', JSON.stringify(lang));
set.call(localStorage, 'xai_pref_theme', JSON.stringify(parameters.get('__met_theme') ?? 'light'));

const sessionFor = (id: string | null) => id ? { access_token: `synthetic-${id}`, refresh_token: 'synthetic-only', expires_in: 3600, token_type: 'bearer', user: { id, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-10-10T00:00:00.000Z' } } : null;
let current = sessionFor(accounts[0]);
const listeners = new Set<(event: string, session: typeof current) => void>();
const client = { auth: {
  async getSession() { return { data: { session: current }, error: null }; },
  onAuthStateChange(listener: (event: string, session: typeof current) => void) { listeners.add(listener); return { data: { subscription: { unsubscribe() { listeners.delete(listener); } } } }; },
  async signOut() { throw new Error('signOut is outside MET05 seam; refuse'); },
} };
function IdentityObserver() {
  const { state, session } = useWebAuthSession();
  useLayoutEffect(() => { instrument.firstRender.push({ time: performance.now(), authState: state, user: session?.user.id ?? null, scope: { ...accountScope.capture() }, rendered: Boolean(document.querySelector('.module-metrics')), content: document.querySelector('.module-metrics')?.textContent }); });
  useEffect(() => { instrument.ready = state === 'authenticated'; }, [state]);
  return null;
}
const globals = window as unknown as Record<string, unknown>;
globals.__met05 = {
  ...instrument, get ready() { return instrument.ready; }, get audit() { return instrument.audit; },
  settledBoundary() { instrument.writes = 0; instrument.removes = 0; instrument.events = []; instrument.audit.length = 0; instrument.boundary = true; return { time: performance.now(), scope: { ...accountScope.capture() } }; },
  quiescent() { return document.readyState === 'complete' && document.getAnimations().every(a => a.playState !== 'running'); },
  publishIdentity(id: string | null) { if (id !== null && !accounts.includes(id as typeof accounts[number])) throw new Error('outside synthetic account'); current = sessionFor(id); for (const listener of listeners) listener(id ? 'SIGNED_IN' : 'SIGNED_OUT', current); },
  resetEmptyFixture() { const scope = accountScope.capture(); if (scope.kind !== 'account' || !accounts.includes(scope.accountId as typeof accounts[number])) throw new Error('fixture requires synthetic account scope'); const value = JSON.parse(get.call(localStorage, keyOf(scope.accountId!))!); set.call(localStorage, keyOf(scope.accountId!), JSON.stringify({ ...value, activeMetricId: 'weight', records: [] })); },
  mixedSourceFixture() { const scope = accountScope.capture(); if (scope.kind !== 'account' || !accounts.includes(scope.accountId as typeof accounts[number])) throw new Error('fixture scope'); const value = JSON.parse(get.call(localStorage, keyOf(scope.accountId!))!); set.call(localStorage, keyOf(scope.accountId!), JSON.stringify({ ...value, activeMetricId: 'sleep', records: [{ id:'injected-sleep', metricId:'sleep', value:8, unit:'h', measuredAt:'2026-10-10T00:00:00.000Z',createdAt:'2026-10-10T00:00:00.000Z',updatedAt:'2026-10-10T00:00:00.000Z',note:'mixed-source' }] })); },
  denyOnce() { const scope=accountScope.capture(); if(scope.kind!=='account'||!accounts.includes(scope.accountId as typeof accounts[number]))throw new Error('fault scope');instrument.denyKey=keyOf(scope.accountId!); },
  observe() { const scope=accountScope.capture(); const tabs=Array.from(document.querySelectorAll<HTMLButtonElement>('.mt-tabs button')).map((b,index)=>({ id:['weight','sleep','water','exercise','custom'][index], text:b.textContent ?? '', disabled:b.disabled, selected:b.getAttribute('aria-selected')==='true', rect:b.getBoundingClientRect().toJSON() })); return { lang, lane:lane==='host'?'actual-host-synthetic-auth':'actual-module-direct', module:document.querySelector('.module-metrics')?'actual-metrics':'absent', url:location.href, viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio}, scope:{...scope}, key:scope.kind==='account'?keyOf(scope.accountId!):null, bytes:Object.fromEntries(accounts.map(a=>[keyOf(a),get.call(localStorage,keyOf(a))])), writes:instrument.writes,removes:instrument.removes,events:instrument.events, firstRender:instrument.firstRender, tabs, logEnabled:!document.querySelector<HTMLButtonElement>('.mt-primary')?.disabled,content:document.querySelector('.module-metrics')?.textContent,dialogs:document.querySelectorAll('[role="dialog"]').length,failureVisible:Boolean(document.querySelector('.mt-save-failure')) }; },
  dispose() { Storage.prototype.setItem=set;Storage.prototype.removeItem=remove;instrument.denyKey=null; },
};
// Public WebAuthSessionProvider receives a synthetic external client; the real App router,
// AccountStorageGate and AccountDataGate remain in their archived render path.
// This omits AppProviders' Todo/deletion/device bridges: qualification must prove the narrow
// omission is harmless for this matrix before root can adopt the fullhost composition.
const root = createRoot(document.getElementById('root')!);
if (lane === 'host') root.render(<WebAuthSessionProvider client={client as never} config={null} onIdentityChange={invalidateAccountIdentity}><IdentityObserver /><RouterProvider router={router}/></WebAuthSessionProvider>);
else {
  const token=accountScope.lock(accounts[0]);accountScope.activate(token,generation,false);instrument.ready=true;
  root.render(<MetricTrackerModule lang={lang}/>);
}

import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import React, { act } from '../../../../packages/web-auth-device-session/node_modules/react';
import { flushSync } from '../../../../packages/web-auth-device-session/node_modules/react-dom';
import { createRoot, type Root } from '../../../../packages/web-auth-device-session/node_modules/react-dom/client';
const state = vi.hoisted(() => ({ auth: {} as any, delayA: false, resolveA: null as null | ((value: any) => void), fetch: vi.fn() }));
vi.mock('../../../../packages/web-auth-device-session/src/session', () => ({ useWebAuthSession: () => state.auth }));
vi.mock('../../../../packages/web-auth-device-session/src/device-session', () => ({ createDeviceSessionController: () => ({
 ensureRegistered: async () => 'synthetic-device', heartbeat: async () => 'synthetic-device', handleDeviceFailure: async () => undefined,
 buildContext: async (input: any) => state.delayA && input.accessToken === 'synthetic-A' ? new Promise(resolve => { state.resolveA = resolve; }) : { ...input, deviceId: 'synthetic-device' },
}) }));
// A captured before copy makes this reproduction independent of concurrent product edits.
import { DeviceSessionBridge, useDeviceBoundFetch } from '../../../../packages/web-auth-device-session/src/components/DeviceSessionBridge';
let root: Root, latest: ReturnType<typeof useDeviceBoundFetch>;
const transport = {} as any;
const onReady = vi.fn();
function Consumer() { latest = useDeviceBoundFetch(); return <output>{latest ? 'ready' : 'empty'}</output>; }
async function render() { await act(async () => { root.render(<DeviceSessionBridge transport={transport} onReady={onReady}><Consumer/></DeviceSessionBridge>); }); }
beforeEach(() => {
 vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); vi.useFakeTimers();
 state.delayA = false; state.resolveA = null; onReady.mockClear();
 state.auth = { state: 'authenticated', session: { access_token: 'synthetic-A' }, syncVersion: 'test', clearSessionStorage: vi.fn() };
 state.fetch.mockReset().mockResolvedValue(new Response('{}')); vi.stubGlobal('fetch', state.fetch);
 const node = document.createElement('div'); document.body.append(node); root = createRoot(node);
});
afterEach(async () => { await act(async () => root.unmount()); document.body.innerHTML=''; vi.useRealTimers(); vi.unstubAllGlobals(); });
it('auth error immediately removes the ready device fetch capability', async () => {
 await render(); expect(latest).toBeTypeOf('function');
 state.auth = {...state.auth,state:'error',session:null};await render();
 expect(latest).toBeNull();
});
it('a previously captured A fetch cannot send credentials after logout/error', async () => {
 await render();const old = latest!;
 state.auth = {...state.auth,state:'error',session:null};await render();
 await expect(old('/synthetic-private')).rejects.toThrow();
 expect(state.fetch).not.toHaveBeenCalled();
});
it('late A buildContext cannot overwrite an already ready B fetch', async () => {
 state.delayA = true;await render();expect(state.resolveA).toBeTypeOf('function');
 state.auth = {...state.auth,session:{access_token:'synthetic-B'},clearSessionStorage:vi.fn()};await render();
 await act(async()=>{state.resolveA!({accessToken:'synthetic-A',deviceId:'synthetic-device',syncVersion:'test'});});
 expect(onReady).toHaveBeenCalledTimes(1);
 await latest!('/synthetic-private');
 expect(new Headers(state.fetch.mock.calls.at(-1)![1].headers).get('Authorization')).toBe('Bearer synthetic-B');
});

it('an A fetch awaiting context cannot send after the synchronous B render', async () => {
 await render();const old=latest!;
 let outcome: Promise<unknown>;
 await act(async()=>{
   outcome=old('/synthetic-private').then(()=> 'unexpected-success', error=>error);
   state.auth={...state.auth,session:{access_token:'synthetic-B'},clearSessionStorage:vi.fn()};
   flushSync(()=>root.render(<DeviceSessionBridge transport={transport} onReady={onReady}><Consumer/></DeviceSessionBridge>));
 });
 expect(await outcome!).toBeInstanceOf(Error);
 expect(state.fetch).not.toHaveBeenCalled();
});
it('the same token with a replaced auth generation revokes its old capability', async()=>{
 await render();const old=latest!;
 state.auth={...state.auth,clearSessionStorage:vi.fn()};await render();
 await expect(old('/synthetic-private')).rejects.toThrow();
 expect(state.fetch).not.toHaveBeenCalled();
});

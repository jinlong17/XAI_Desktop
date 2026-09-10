import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import { prefMutationLockName } from '../internal/prefMutation.js';
import { accountLifecycleLockName } from '../internal/accountCoordination.js';
import { _clearAllListeners } from '../internal/sameTabBus.js';
import { usePrefAsync } from '../internal/usePrefAsync.js';
import { usePrefAutosaveAsync } from '../internal/usePrefAutosaveAsync.js';
import { createTestLockManager } from './named-lock-fixture.js';
const key='xai_pref_collab_default_share';
const valid=(v:unknown):v is string=>v==='comment'||v==='edit'||v==='view';
let owner=0;
function active(id=`hook-${++owner}`){const scope=accountScope.activate(accountScope.lock(id),'one');localStorage.setItem(generationMarkerKey(id),JSON.stringify({generation:'one',migrationId:'fixture',previous:null}));return scope;}
function physical(){const s=accountScope.capture();return generationKey(s.accountId!,s.generation!,key);}
const mounts:Array<{root:Root,node:HTMLDivElement}>=[];
function mount<T>(hook:()=>T,display:(v:T)=>unknown=()=>null){const node=document.createElement('div');document.body.append(node);const root=createRoot(node);let value!:T;function Probe():ReactNode{value=hook();return createElement('output',null,JSON.stringify(display(value)));}act(()=>root.render(createElement(Probe)));const item={root,node};mounts.push(item);return {get value(){return value;},node,unmount(){act(()=>root.unmount());node.remove();mounts.splice(mounts.indexOf(item),1);}};}
function hold(name:string){let release!:()=>void;const promise=new Promise<void>(r=>release=r);const done=navigator.locks.request(name,{mode:'exclusive'},()=>promise);return {release,done};}
function event(k:string){window.dispatchEvent(new StorageEvent('storage',{key:k,storageArea:localStorage,newValue:'intentionally stale payload'}));}
beforeEach(()=>{localStorage.clear();_clearAllListeners();active();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);vi.stubGlobal('navigator',{locks:createTestLockManager()});});
afterEach(()=>{for(const {root,node}of mounts.splice(0)){act(()=>root.unmount());node.remove();}vi.restoreAllMocks();vi.unstubAllGlobals();});

it('reset failure preserves the latest clean externally projected value rather than resurrecting a stale local draft',async()=>{
 const p=physical();localStorage.setItem(p,'view');const h=mount(()=>usePrefAutosaveAsync(key,{validate:valid}),v=>({value:v.value,status:v.meta.status}));
 localStorage.setItem(p,'edit');act(()=>event(p));expect(h.value.value).toBe('edit');
 const native=Storage.prototype.removeItem;vi.spyOn(Storage.prototype,'removeItem').mockImplementation(function(k){if(k===p)throw Error('remove fault');return native.call(this,k);});
 await act(async()=>{expect(await h.value.reset()).toMatchObject({ok:false,reason:'storage'});});
 expect(localStorage.getItem(p)).toBe('edit');expect(h.value.meta.status).toBe('error');expect(h.value.value).toBe('edit');expect(h.node.textContent).toContain('edit');
});
it('reset then failed save cannot resurrect the discarded draft during the next pending session',async()=>{
 const p=physical();localStorage.setItem(p,'comment');const h=mount(()=>usePrefAutosaveAsync(key,{validate:valid}));await act(async()=>{await h.value.edit('view');await h.value.reset();});expect(h.value.value).toBe('comment');
 // Retry of the clean current value may be used after reset, but it must not redisplay view.
 const barrier=hold(accountLifecycleLockName(accountScope.capture().accountId!));let attempt!:Promise<unknown>;act(()=>{attempt=h.value.retry();});
 const during=h.value.value;barrier.release();await act(async()=>{await barrier.done;await attempt;});expect(during).toBe('comment');expect(h.value.value).toBe('comment');expect(localStorage.getItem(p)).toBe('comment');
});
it('registered hook default projection uses the registered domain guard even when no caller validator is supplied',()=>{
 localStorage.setItem(physical(),'corrupt-permission');const h=mount(()=>usePrefAsync(key));expect(h.value[2].source).toBe('invalid');expect(h.value[2].status).toBe('error');expect(h.value[0]).toBe('comment');
});
it('a validator exception on an edit resolves a typed invalid outcome rather than escaping the hook API',async()=>{
 const p=physical();localStorage.setItem(p,'comment');const validator=(v:unknown):v is string=>{if(v==='view')throw Error('domain validator failed');return valid(v);};const h=mount(()=>usePrefAsync(key,{validate:validator}));
 let promise:Promise<unknown>|undefined;let thrown:unknown;act(()=>{try{promise=h.value[1]('view');}catch(e){thrown=e;}});
 expect(thrown).toBeUndefined();await act(async()=>{await expect(promise).resolves.toMatchObject({ok:false,reason:'invalid'});});expect(localStorage.getItem(p)).toBe('comment');
});
it('device async hook retains its pending operation across account switch without acquiring an account lock',async()=>{
 const k='xai_accent_hue';localStorage.setItem(k,'165');const h=mount(()=>usePrefAsync(k,{validate:(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)}));const barrier=hold(prefMutationLockName(k));let pending!:Promise<unknown>;
 act(()=>{pending=h.value[1](166);});act(()=>{active('different-account');});barrier.release();let result:unknown;await act(async()=>{await barrier.done;result=await pending;});
 expect(result).toMatchObject({ok:true});expect(localStorage.getItem(k)).toBe('166');expect(h.value[0]).toBe(166);
});
it('control: queued owner switch cancels account work and same-key remount remains independent',async()=>{
 const scope=accountScope.capture();const p=physical();localStorage.setItem(p,'comment');const h=mount(()=>usePrefAutosaveAsync(key,{validate:valid}));const barrier=hold(accountLifecycleLockName(scope.accountId!));let old!:Promise<unknown>;act(()=>{old=h.value.edit('view');});h.unmount();const fresh=mount(()=>usePrefAutosaveAsync(key,{validate:valid}));barrier.release();await act(async()=>{await barrier.done;expect(await old).toMatchObject({ok:false});});expect(fresh.value.value).toBe('comment');expect(localStorage.getItem(p)).toBe('comment');
});
it('control: functional hooks update latest persisted data once each and stale storage event payload is not trusted',async()=>{
 const k='xai_accent_hue';localStorage.setItem(k,'165');const a=mount(()=>usePrefAsync(k));const b=mount(()=>usePrefAsync(k));const add=vi.fn((n:number)=>n+1);
 await act(async()=>{await Promise.all([a.value[1](add),b.value[1](add)]);});expect(add).toHaveBeenCalledTimes(2);expect(localStorage.getItem(k)).toBe('167');localStorage.setItem(k,'170');act(()=>event(k));expect(a.value[0]).toBe(170);expect(b.value[0]).toBe(170);
});
it('control: uncertain reset retains its token for duplicate retry and notifies the clean sibling without another remove',async()=>{
 const p=physical();localStorage.setItem(p,'view');const h=mount(()=>usePrefAutosaveAsync(key,{validate:valid}));const sibling=mount(()=>usePrefAutosaveAsync(key,{validate:valid}));const nativeGet=Storage.prototype.getItem;const nativeRemove=Storage.prototype.removeItem;let removed=false;let failed=false;
 const removes=vi.spyOn(Storage.prototype,'removeItem').mockImplementation(function(k){nativeRemove.call(this,k);if(k===p)removed=true;});const reads=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===p&&removed&&!failed){failed=true;throw Error('reset readback');}return nativeGet.call(this,k);});
 await act(async()=>{expect(await h.value.reset()).toMatchObject({ok:false,reason:'readback-uncertain'});});expect(sibling.value.value).toBe('view');reads.mockRestore();await act(async()=>{await Promise.all([h.value.retry(),h.value.retry()]);});expect(removes.mock.calls.filter(([k])=>k===p)).toHaveLength(1);expect(h.value.value).toBe('comment');expect(sibling.value.value).toBe('comment');expect(h.value.meta.status).toBe('saved');
});
it('control: failed draft keeps original baseline through external conflict and explicit reload adopts current bytes',async()=>{
 const p=physical();localStorage.setItem(p,'comment');const h=mount(()=>usePrefAutosaveAsync(key,{validate:valid}));const barrier=hold(accountLifecycleLockName(accountScope.capture().accountId!));let pending!:Promise<unknown>;act(()=>{pending=h.value.edit('view');});localStorage.setItem(p,'edit');act(()=>event(p));barrier.release();await act(async()=>{await barrier.done;expect(await pending).toMatchObject({ok:false,reason:'conflict'});});expect(h.value.value).toBe('view');expect(h.value.meta.status).toBe('conflict');await act(async()=>{expect(await h.value.retry()).toMatchObject({ok:false,reason:'conflict'});});expect(localStorage.getItem(p)).toBe('edit');act(()=>h.value.meta.reload());expect(h.value.value).toBe('edit');expect(h.value.meta.status).toBe('idle');
});

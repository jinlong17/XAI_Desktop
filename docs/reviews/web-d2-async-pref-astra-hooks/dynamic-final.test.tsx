import { act, createElement, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import { prefMutationLockName } from '../internal/prefMutation.js';
import { accountLifecycleLockName } from '../internal/accountCoordination.js';
import { _clearAllListeners } from '../internal/sameTabBus.js';
import { usePrefAsync } from '../internal/usePrefAsync.js';
import { usePrefAutosaveAsync, resolvePrefAutosaveAsyncBinding } from '../internal/usePrefAutosaveAsync.js';
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


it('dynamic configuration rejects malformed suffix, inconsistent registered codec and invalid defaults before writing',()=>{
 const good={codec:'string' as const,defaultValue:'',validate:(v:unknown):v is string=>typeof v==='string'};
 for(const suffix of ['', 'xai_pref_wrong', 'bad/path'])expect(()=>resolvePrefAutosaveAsyncBinding(suffix,good)).toThrow(TypeError);
 expect(()=>resolvePrefAutosaveAsyncBinding('collab_default_share',{...good,codec:'json',defaultValue:'comment'})).toThrow(TypeError);
 expect(()=>resolvePrefAutosaveAsyncBinding('dynamic_invalid',{...good,defaultValue:3} as never)).toThrow(TypeError);
 expect([...Array(localStorage.length)].map((_,i)=>localStorage.key(i)).some(k=>k?.includes('xai_pref_'))).toBe(false);
});
it('dynamic string distinguishes absent, explicit empty and reset without mounting a default write',async()=>{
 const suffix='dynamic_final_string';const s=accountScope.capture();const p=generationKey(s.accountId!,s.generation!,`xai_pref_${suffix}`);
 const h=mount(()=>usePrefAutosaveAsync(suffix,{codec:'string',defaultValue:'',validate:(v:unknown):v is string=>typeof v==='string'}));
 expect(h.value.value).toBe('');expect(h.value.meta.source).toBe('absent');expect(localStorage.getItem(p)).toBeNull();
 await act(async()=>{expect(await h.value.edit('hello')).toMatchObject({ok:true});});expect(localStorage.getItem(p)).toBe('hello');
 await act(async()=>{await h.value.edit('');});expect(localStorage.getItem(p)).toBe('');expect(h.value.meta.source).toBe('valid');
 await act(async()=>{await h.value.reset();});expect(localStorage.getItem(p)).toBeNull();expect(h.value.value).toBe('');expect(h.value.meta.source).toBe('absent');
});
it('dynamic JSON domain rejects physical null and bad output, while explicit reload adopts a valid empty domain',async()=>{
 const suffix='dynamic_final_json';const s=accountScope.capture();const p=generationKey(s.accountId!,s.generation!,`xai_pref_${suffix}`);localStorage.setItem(p,'null');
 const validArray=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==='string');
 const h=mount(()=>usePrefAutosaveAsync(suffix,{codec:'json',defaultValue:[] as string[],validate:validArray}));expect(h.value.meta.source).toBe('invalid');expect(localStorage.getItem(p)).toBe('null');
 await act(async()=>{expect(await h.value.edit({bad:true} as never)).toMatchObject({ok:false,reason:'invalid'});});expect(localStorage.getItem(p)).toBe('null');
 localStorage.setItem(p,'[]');act(()=>h.value.meta.reload());expect(h.value.value).toEqual([]);expect(h.value.meta.source).toBe('valid');await act(async()=>{await h.value.edit(['saved']);});expect(localStorage.getItem(p)).toBe('["saved"]');
});
it('changing a pending dynamic suffix invalidates the old operation and preserves the new binding baseline',async()=>{
 const s=accountScope.capture();let swap!:(suffix:string)=>void;
 const h=mount(()=>{const[suffix,setSuffix]=useState('dynamic_old');swap=setSuffix;return usePrefAutosaveAsync(suffix,{codec:'string',defaultValue:'',validate:(v:unknown):v is string=>typeof v==='string'});});
 const barrier=hold(accountLifecycleLockName(s.accountId!));let old!:Promise<unknown>;act(()=>{old=h.value.edit('old draft');});act(()=>swap('dynamic_new'));expect(h.value.value).toBe('');expect(h.value.meta.source).toBe('absent');
 barrier.release();await act(async()=>{await barrier.done;expect(await old).toMatchObject({ok:false});});expect(localStorage.getItem(generationKey(s.accountId!,s.generation!,'xai_pref_dynamic_old'))).toBeNull();expect(localStorage.getItem(generationKey(s.accountId!,s.generation!,'xai_pref_dynamic_new'))).toBeNull();
 await act(async()=>{await h.value.edit('new draft');});expect(localStorage.getItem(generationKey(s.accountId!,s.generation!,'xai_pref_dynamic_new'))).toBe('new draft');
});
it('dynamic device binding retains a queued operation across account switch and uses the device physical key',async()=>{
 const p='xai_pref_dashboard_header_note_x';localStorage.setItem(p,'0');const h=mount(()=>usePrefAutosaveAsync('dashboard_header_note_x',{codec:'json',defaultValue:0,validate:(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)}));
 const barrier=hold(prefMutationLockName(p));let pending!:Promise<unknown>;act(()=>{pending=h.value.edit(25);});act(()=>active('dynamic-new-owner'));barrier.release();await act(async()=>{await barrier.done;expect(await pending).toMatchObject({ok:true});});expect(localStorage.getItem(p)).toBe('25');expect(h.value.value).toBe(25);
});

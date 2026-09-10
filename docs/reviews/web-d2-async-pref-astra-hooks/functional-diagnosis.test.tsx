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

it('control: functional hooks update latest persisted data once each and stale storage event payload is not trusted',async()=>{
 const k='xai_accent_hue';localStorage.setItem(k,'165');const a=mount(()=>usePrefAsync(k));const b=mount(()=>usePrefAsync(k));const add=vi.fn((n:number)=>n+1);
 await act(async()=>{await Promise.all([a.value[1](add),b.value[1](add)]);});console.info('after-two-successful-functional-writes',JSON.stringify({physical:localStorage.getItem(k),a:{value:a.value[0],status:a.value[2].status,error:a.value[2].error},b:{value:b.value[0],status:b.value[2].status,error:b.value[2].error}}));expect(add).toHaveBeenCalledTimes(2);expect(localStorage.getItem(k)).toBe('167');localStorage.setItem(k,'170');act(()=>event(k));console.info('after-clean-physical-storage-change',JSON.stringify({physical:localStorage.getItem(k),a:{value:a.value[0],status:a.value[2].status},b:{value:b.value[0],status:b.value[2].status}}));expect(a.value[0]).toBe(170);expect(b.value[0]).toBe(170);
});

import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,renderHook} from '@testing-library/react';
import {accountScope,generationMarkerKey,usePrefAsync,usePrefAutosaveAsync} from '@repo/plugin-web-storage';
import {accountLifecycleLockName} from '../../../packages/plugin-web-storage/src/internal/accountCoordination';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const validNumber=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const validShare=(v:unknown):v is 'comment'|'edit'|'view'=>v==='comment'||v==='edit'||v==='view';
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('pref-review-A'),'g1');localStorage.setItem(generationMarkerKey('pref-review-A'),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));vi.stubGlobal('navigator',{locks:createTestLockManager()});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('two hook instances apply each functional updater once to the latest persistent value',async()=>{
 localStorage.setItem('xai_accent_hue','165');
 const a=renderHook(()=>usePrefAsync('xai_accent_hue',{validate:validNumber}));const b=renderHook(()=>usePrefAsync('xai_accent_hue',{validate:validNumber}));
 const first=vi.fn((value:number)=>value+1),second=vi.fn((value:number)=>value+1);
 let results:any[]=[];await act(async()=>{results=await Promise.all([a.result.current[1](first),b.result.current[1](second)]);});
 expect.soft(results.every(r=>r.ok)).toBe(true);expect.soft(first).toHaveBeenCalledTimes(1);expect.soft(second).toHaveBeenCalledTimes(1);
 expect(localStorage.getItem('xai_accent_hue')).toBe('167');
});
it('newer local autosave edit survives pending predecessor and is committed without false conflict',async()=>{
 const key=accountScope.physicalKey('xai_pref_collab_default_share');localStorage.setItem(key,'comment');
 const hook=renderHook(()=>usePrefAutosaveAsync('xai_pref_collab_default_share',{validate:validShare}));
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);const held=navigator.locks.request(accountLifecycleLockName('pref-review-A'),{mode:'exclusive'},()=>gate);
 let first!:Promise<unknown>,second!:Promise<unknown>;
 act(()=>{first=hook.result.current.edit('edit');});act(()=>{second=hook.result.current.edit('view');});
 expect.soft(hook.result.current.value).toBe('view');expect.soft(localStorage.getItem(key)).toBe('comment');
 await act(async()=>{release();await held;await Promise.allSettled([first,second]);});
 expect.soft(localStorage.getItem(key)).toBe('view');expect.soft(hook.result.current.value).toBe('view');expect(hook.result.current.meta.status).toBe('saved');
});

import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,renderHook} from '@testing-library/react';
import {accountScope,generationMarkerKey,usePrefAutosaveAsync} from '@repo/plugin-web-storage';
import {accountLifecycleLockName} from '../../../packages/plugin-web-storage/src/internal/accountCoordination';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const validString=(v:unknown):v is string=>typeof v==='string';
const stringBinding={codec:'string' as const,defaultValue:'',validate:validString};
type Note={text:string};
const validNote=(v:unknown):v is Note=>typeof v==='object'&&v!==null&&typeof (v as Note).text==='string';
const jsonBinding={codec:'json' as const,defaultValue:{text:''},validate:validNote};
beforeEach(()=>{
 localStorage.clear();accountScope.activate(accountScope.lock('dynamic-independent-A'),'g1');
 localStorage.setItem(generationMarkerKey('dynamic-independent-A'),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));
 vi.stubGlobal('navigator',{locks:createTestLockManager()});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('dynamic account note is absent on mount, round trips exact string, and reset removes physical bytes',async()=>{
 const key=accountScope.physicalKey('xai_pref_dashboard_header_note');
 const hook=renderHook(()=>usePrefAutosaveAsync('dashboard_header_note',stringBinding));
 expect(localStorage.getItem(key)).toBeNull();expect(hook.result.current.value).toBe('');
 let result:any;await act(async()=>{result=await hook.result.current.edit('Actual note');});
 expect(result.ok).toBe(true);expect(localStorage.getItem(key)).toBe('Actual note');expect(hook.result.current.value).toBe('Actual note');
 expect(localStorage.getItem('xai_pref_dashboard_header_note')).toBeNull();
 await act(async()=>{result=await hook.result.current.reset();});
 expect(result.ok).toBe(true);expect(localStorage.getItem(key)).toBeNull();expect(hook.result.current.value).toBe('');
});
it('dynamic JSON domain refuses invalid stored shape and adopts explicitly reloaded valid physical data',async()=>{
 const key=accountScope.physicalKey('xai_pref_dynamic_independent_json');
 localStorage.setItem(key,'{"text":123}');
 const hook=renderHook(()=>usePrefAutosaveAsync('dynamic_independent_json',jsonBinding));
 expect(hook.result.current.meta.source).toBe('invalid');
 let result:any;await act(async()=>{result=await hook.result.current.edit({text:'replacement'});});
 expect(result.ok).toBe(false);expect(localStorage.getItem(key)).toBe('{"text":123}');
 localStorage.setItem(key,'{"text":"external"}');act(()=>hook.result.current.meta.reload());
 expect(hook.result.current.value).toEqual({text:'external'});
 await act(async()=>{result=await hook.result.current.edit({text:'latest'});});
 expect(result.ok).toBe(true);expect(JSON.parse(localStorage.getItem(key)!)).toEqual({text:'latest'});
});
it('changing the dynamic suffix while queued invalidates the old write without contaminating the new binding',async()=>{
 const oldKey=accountScope.physicalKey('xai_pref_dynamic_independent_old'),newKey=accountScope.physicalKey('xai_pref_dynamic_independent_new');
 localStorage.setItem(oldKey,'old source');localStorage.setItem(newKey,'new source');
 const hook=renderHook(({suffix})=>usePrefAutosaveAsync(suffix,stringBinding),{initialProps:{suffix:'dynamic_independent_old'}});
 let release!:()=>void,entered!:()=>void;
 const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);
 const held=navigator.locks.request(accountLifecycleLockName('dynamic-independent-A'),{mode:'exclusive'},()=>{entered();return gate;});
 await ready;let pending!:Promise<any>;
 try {
  act(()=>{pending=hook.result.current.edit('old draft');});
  hook.rerender({suffix:'dynamic_independent_new'});
  expect(hook.result.current.value).toBe('new source');
 }finally{await act(async()=>{release();await held;await pending;});}
 expect((await pending).ok).toBe(false);expect(localStorage.getItem(oldKey)).toBe('old source');expect(localStorage.getItem(newKey)).toBe('new source');
 let result:any;await act(async()=>{result=await hook.result.current.edit('new saved');});
 expect(result.ok).toBe(true);expect(localStorage.getItem(newKey)).toBe('new saved');
});

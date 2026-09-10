import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,waitFor} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {smartListsPane} from '../../../packages/plugin-web-settings-rest/src/panes/smartListsPane';
import {prefMutationLockName} from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import {accountLifecycleLockName} from '../../../packages/plugin-web-storage/src/internal/accountCoordination';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const owner='smart-lists-parent';let key:string;
const mount=()=>render(smartListsPane.render({lang:'en'}));
const flush=()=>act(async()=>{for(let i=0;i<20;i++)await Promise.resolve();});
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock(owner),'g1');localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));key=accountScope.physicalKey('xai_pref_smart_lists');vi.stubGlobal('navigator',{locks:createTestLockManager()});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('absent registry map renders all twelve existing show fallbacks without default seeding',async()=>{const ui=mount();await flush();const selects=ui.getAllByRole('combobox') as HTMLSelectElement[];expect(selects).toHaveLength(12);expect(selects.map(s=>s.value)).toEqual(Array(12).fill('show'));expect(localStorage.getItem(key)).toBeNull();});
for(const kind of ['account','key'] as const)it(`actual first row waits for held ${kind} lock and preserves latest choice`,async()=>{
 const before=JSON.stringify({all:'show',extension:'future-value'});localStorage.setItem(key,before);const ui=mount();await flush();
 let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);
 const held=navigator.locks.request(kind==='account'?accountLifecycleLockName(owner):prefMutationLockName(key),{mode:'exclusive'},()=>{entered();return gate});await ready;
 try{fireEvent.change(ui.getAllByRole('combobox')[0],{target:{value:'hide'}});await flush();expect.soft(localStorage.getItem(key)).toBe(before);expect((ui.getAllByRole('combobox')[0] as HTMLSelectElement).value).toBe('hide');}
 finally{await act(async()=>{release();await held;});}
 await waitFor(()=>expect(JSON.parse(localStorage.getItem(key)!)).toEqual({all:'hide',extension:'future-value'}));
});
it('quota keeps latest two row choices recoverable and actual Retry saves the combined map',async()=>{
 const before=JSON.stringify({all:'show',today:'show'});localStorage.setItem(key,before);const ui=mount();await flush();const native=Storage.prototype.setItem;
 const spy=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key)throw Error('quota');native.call(this,k,v);});
 fireEvent.change(ui.getAllByRole('combobox')[0],{target:{value:'hide'}});await flush();fireEvent.change(ui.getAllByRole('combobox')[1],{target:{value:'if-not-empty'}});await flush();
 expect(localStorage.getItem(key)).toBe(before);expect.soft((ui.getAllByRole('combobox')[0] as HTMLSelectElement).value).toBe('hide');expect.soft((ui.getAllByRole('combobox')[1] as HTMLSelectElement).value).toBe('if-not-empty');expect(ui.queryByRole('alert')).not.toBeNull();
 spy.mockRestore();fireEvent.click(ui.getByRole('button',{name:/retry/i}));await waitFor(()=>expect(JSON.parse(localStorage.getItem(key)!)).toEqual({all:'hide',today:'if-not-empty'}));
});

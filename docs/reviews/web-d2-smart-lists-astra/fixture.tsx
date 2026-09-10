import {beforeEach,afterEach,vi} from 'vitest';
import {act,cleanup,fireEvent,render,within} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {smartListsPane} from '../../../packages/plugin-web-settings-rest/src/panes/smartListsPane';
import {prefMutationLockName} from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import {accountLifecycleLockName} from '../../../packages/plugin-web-storage/src/internal/accountCoordination';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
export const ids=['all','today','tomorrow','next7','assigned','inbox','summary','tags','filters','completed','wont_do','trash'];
export const logical='xai_pref_smart_lists',owner='smart-astra-A';
export const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
export let key:string;
export function activate(id=owner){nativeSet.call(localStorage,generationMarkerKey(id),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));accountScope.activate(accountScope.lock(id),'g1');return accountScope.physicalKey(logical);}
export function fixture(){beforeEach(()=>{localStorage.clear();key=activate();vi.stubGlobal('navigator',{locks:createTestLockManager()});});afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});}
export function mount(){const ui=render(smartListsPane.render({lang:'en'}));return {...ui,q:within(ui.container)};}
export type UI=ReturnType<typeof mount>;
export const select=(ui:UI,i=0)=>ui.q.getAllByRole('combobox')[i] as HTMLSelectElement;
export const choose=(ui:UI,i:number,v:string)=>fireEvent.change(select(ui,i),{target:{value:v}});
export const flush=()=>act(async()=>{await new Promise(r=>setTimeout(r,0));});
export function seed(raw:string){nativeSet.call(localStorage,key,raw);}
export function external(raw:string|null,k=key){const oldValue=nativeGet.call(localStorage,k);if(raw===null)localStorage.removeItem(k);else nativeSet.call(localStorage,k,raw);window.dispatchEvent(new StorageEvent('storage',{key:k,oldValue,newValue:raw,storageArea:localStorage}));}
export async function hold(account=false){let release!:()=>void,enter!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>enter=r);const task=navigator.locks.request(account?accountLifecycleLockName(owner):prefMutationLockName(key),{mode:'exclusive'},()=>{enter();return gate;});await ready;return async()=>{await act(async()=>{release();await task;});await flush();};}
export function quota(){return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key)throw Error('quota');nativeSet.call(this,k,v);});}
export function writes(){const spy=vi.spyOn(Storage.prototype,'setItem');return ()=>spy.mock.calls.filter(([k])=>k===key);}
export function retry(ui:UI){fireEvent.click(ui.q.getByRole('button',{name:/^Retry$/i}));}
export function reload(ui:UI){fireEvent.click(ui.q.getByRole('button',{name:/reload/i}));}

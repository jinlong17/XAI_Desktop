import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {transferableAbortController} from 'node:util';
import {createMemoryRouter,RouterProvider} from 'react-router';
import {WebShellProvider,Shell} from '@repo/xai-web-shell';
import {accountScope,generationMarkerKey,prefMutationLockName} from '@repo/plugin-web-storage';
import {webShellModuleRegistrations} from '../../../apps/web/src/routes/modules/shellRegistrations';
import {requestSettingsDeparture} from '../../../apps/web/src/routes/modules/settingsDeparture';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
let noteKey:string;
const path='/app/dashboard',next='/app/tasks';
async function flush(){await act(async()=>{for(let i=0;i<12;i++)await new Promise(r=>setTimeout(r,0));});}
beforeEach(()=>{localStorage.clear();const owner='header-departure-A';nativeSet.call(localStorage,generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));accountScope.activate(accountScope.lock(owner),'g1');noteKey=accountScope.physicalKey('xai_pref_dashboard_header_note');nativeSet.call(localStorage,noteKey,'Original note');nativeSet.call(localStorage,'xai_pref_dashboard_header_note_x','0');nativeSet.call(localStorage,accountScope.physicalKey('xai_dash_order'),'[]');vi.stubGlobal('AbortController',transferableAbortController().constructor);vi.stubGlobal('navigator',{locks:createTestLockManager()});vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>setTimeout(()=>cb(performance.now()),0));vi.stubGlobal('cancelAnimationFrame',clearTimeout);});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function host(initialEntries=[path]){const registration=webShellModuleRegistrations.find(r=>r.moduleId==='dashboard')!;const Module=registration.children.find(r=>r.path==='')!.render;const router=createMemoryRouter([{path:'/app',element:<Shell lang="en" setLang={()=>{}} theme="light" setTheme={()=>{}} density="comfortable" setDensity={()=>{}}/>,children:[{path:'dashboard',element:<Module/>},{path:'tasks',element:<div>Tasks destination</div>}]}],{initialEntries});const ui=render(<WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={()=>{}}><RouterProvider router={router}/></WebShellProvider>);await flush();return {ui,router};}
async function edit(ui:ReturnType<typeof render>,save:boolean){fireEvent.click(ui.getByRole('button',{name:'Edit dashboard note'}));const input=ui.container.querySelector('.dash-note input')!;fireEvent.change(input,{target:{value:'Latest unsaved note'}});if(save){vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===noteKey)throw Error('quota');nativeSet.call(this,k,v)});fireEvent.click(ui.getByRole('button',{name:'Save dashboard note'}));}await flush();expect(nativeGet.call(localStorage,noteKey)).toBe('Original note');expect((ui.container.querySelector('.dash-note input') as HTMLInputElement).value).toBe('Latest unsaved note');}

const unload=()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented};
it('successful latest pending save releases the first actual held route once with committed bytes',async()=>{
 const {ui,router}=await host();let release!:()=>void;let entered!:()=>void;
 const ready=new Promise<void>(r=>entered=r);
 const lock=navigator.locks.request(prefMutationLockName(noteKey),async()=>{entered();await new Promise<void>(r=>release=r)});await ready;
 try {
 fireEvent.click(ui.getByRole('button',{name:'Edit dashboard note'}));
 fireEvent.change(ui.container.querySelector('.dash-note input')!,{target:{value:'Latest submitted note'}});
 fireEvent.click(ui.getByRole('button',{name:'Save dashboard note'}));await flush();
 await act(async()=>{void router.navigate('/app/tasks?first=1')});await flush();
 expect(ui.getByRole('dialog')).toBeTruthy();expect(router.state.location.pathname).toBe(path);
 await act(async()=>{void router.navigate('/app/tasks?later=1')});await flush();
 expect(nativeGet.call(localStorage,noteKey)).toBe('Original note');release();await lock;await flush();
 expect(nativeGet.call(localStorage,noteKey)).toBe('Latest submitted note');
 expect(router.state.location.pathname).toBe(next);expect(router.state.location.search).toBe('?first=1');
 expect(ui.queryByRole('dialog')).toBeNull();expect(unload()).toBe(false);
 }finally{release();await lock;}
});
it('predecessor commit cannot release a held route with newer unsubmitted text',async()=>{
 const {ui,router}=await host();let release!:()=>void;let entered!:()=>void;
 const ready=new Promise<void>(r=>entered=r);
 const lock=navigator.locks.request(prefMutationLockName(noteKey),async()=>{entered();await new Promise<void>(r=>release=r)});
 await ready;
 try {
 fireEvent.click(ui.getByRole('button',{name:'Edit dashboard note'}));
 const input=ui.container.querySelector('.dash-note input')!;
 fireEvent.change(input,{target:{value:'First submitted'}});fireEvent.click(ui.getByRole('button',{name:'Save dashboard note'}));await flush();
 fireEvent.change(input,{target:{value:'Newer unsubmitted'}});await flush();
 await act(async()=>{void router.navigate('/app/tasks?first=1')});await flush();
 expect(ui.getByRole('dialog')).toBeTruthy();expect(nativeGet.call(localStorage,noteKey)).toBe('Original note');
 release();await lock;await flush();
 expect(nativeGet.call(localStorage,noteKey)).toBe('First submitted');expect(router.state.location.pathname).toBe(path);
 expect((ui.container.querySelector('.dash-note input') as HTMLInputElement).value).toBe('Newer unsubmitted');
 expect(ui.getByRole('dialog')).toBeTruthy();expect(unload()).toBe(true);
 fireEvent.click(ui.getByRole('button',{name:/discard.*leave/i}));await flush();
 expect(nativeGet.call(localStorage,noteKey)).toBe('First submitted');expect(router.state.location.pathname).toBe(next);
 expect(router.state.location.search).toBe('?first=1');expect(unload()).toBe(false);
 }finally{release();await lock;}
});

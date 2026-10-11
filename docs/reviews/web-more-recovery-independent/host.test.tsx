import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {act,cleanup,fireEvent,render,within} from '@testing-library/react';
import {transferableAbortController} from 'node:util';
import {createMemoryRouter,RouterProvider} from 'react-router';
import {WebShellProvider,Shell} from '@repo/xai-web-shell';
import {accountScope,generationMarkerKey,generationKey} from '@repo/plugin-web-storage';
import {webShellModuleRegistrations} from '../../../apps/web/src/routes/modules/shellRegistrations';
import {composedSettingsRegistration} from '../../../apps/web/src/routes/modules/composedSettingsRegistration';
import {requestSettingsDeparture} from '../../../apps/web/src/routes/modules/settingsDeparture';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
const owner='more-parent-A',generation='g1';
const fields=[
 {name:'win_type',old:'window',value:'tray',label:'Choose window type when launching',private:false},
 {name:'default_tag',old:'none',value:'work',label:'Default Tag',private:true},
 {name:'default_list',old:'inbox',value:'today',label:'Default List',private:true},
];
const keys=fields.map(f=>f.private?generationKey(owner,generation,'xai_pref_more_'+f.name):'xai_pref_more_'+f.name);
const pane='/app/settings/more',next='/app/settings/date_time';
async function flush(){await act(async()=>{for(let i=0;i<8;i++)await new Promise(r=>setTimeout(r,0));});}
beforeEach(()=>{localStorage.clear();nativeSet.call(localStorage,generationMarkerKey(owner),JSON.stringify({generation,migrationId:'fixture',previous:null}));accountScope.activate(accountScope.lock(owner),generation);fields.forEach((f,i)=>nativeSet.call(localStorage,keys[i],f.old));vi.stubGlobal('AbortController',transferableAbortController().constructor);vi.stubGlobal('navigator',{locks:createTestLockManager()});vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>setTimeout(()=>cb(performance.now()),0));vi.stubGlobal('cancelAnimationFrame',clearTimeout);});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function host(){const Composed=composedSettingsRegistration.children[0]!.render;const router=createMemoryRouter([{path:'/app',element:<Shell lang="en" setLang={()=>{}} theme="light" setTheme={()=>{}} density="comfortable" setDensity={()=>{}}/>,children:[{path:'settings/*',element:<Composed/>},{path:'dashboard',element:<div>Dashboard destination</div>}]}],{initialEntries:[pane]});const ui=render(<WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={()=>{}}><RouterProvider router={router}/></WebShellProvider>);await flush();const element=ui.container.querySelector('.more-pane')!;expect(element).toBeTruthy();const q=within(element as HTMLElement);fields.forEach(f=>expect((q.getByLabelText(f.label) as HTMLSelectElement).value).toBe(f.old));return {ui,q,router};}
function deny(indices:number[]){vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(indices.some(i=>k===keys[i]))throw Error('quota');nativeSet.call(this,k,v);});}
function change(q:ReturnType<typeof within>,index:number){fireEvent.change(q.getByLabelText(fields[index].label),{target:{value:fields[index].value}});}
it.each(fields.map((f,index)=>({...f,index})))('actual More retains failed latest $name',async({index,value})=>{const {q}=await host();deny([index]);change(q,index);await flush();expect(nativeGet.call(localStorage,keys[index])).toBe(fields[index].old);expect((q.getByLabelText(fields[index].label) as HTMLSelectElement).value).toBe(value);});
it.each([0,1,2])('actual route holds failed More work at field %i',async(index)=>{const {ui,q,router}=await host();deny([index]);change(q,index);await flush();await act(async()=>{void router.navigate(next)});await flush();expect(router.state.location.pathname).toBe(pane);expect(ui.getByRole('dialog')).toBeTruthy();});
it('actual signout holds mixed device and private work',async()=>{const {ui,q}=await host();deny([0,1,2]);fields.forEach((_,i)=>change(q,i));await flush();let outcome:unknown='pending';await act(async()=>{void requestSettingsDeparture('sign-out').then(value=>outcome=value)});await flush();expect(outcome).toBe('pending');expect(ui.getByRole('dialog')).toBeTruthy();});
it('clean More permits departure with zero seeded writes',async()=>{const {ui,router}=await host();const writes=vi.spyOn(Storage.prototype,'setItem');expect(await requestSettingsDeparture('sign-out')).toBe(true);await act(async()=>{void router.navigate(next)});await flush();expect(router.state.location.pathname).toBe(next);expect(ui.queryByRole('dialog')).toBeNull();expect(writes.mock.calls.filter(([key])=>key.includes('xai_pref_more_'))).toHaveLength(0);});

it.each([0,1,2])('actual route holds failed physical reset at field %i even when value equals default',async(index)=>{const {ui,router}=await host();const remove=Storage.prototype.removeItem;vi.spyOn(Storage.prototype,'removeItem').mockImplementation(function(this:Storage,key){if(key===keys[index])throw Error('remove denied');remove.call(this,key);});fireEvent.click(ui.getByTestId('more-reset-default'));await flush();expect(nativeGet.call(localStorage,keys[index])).toBe(fields[index].old);await act(async()=>{void router.navigate(next)});await flush();expect(router.state.location.pathname).toBe(pane);expect(ui.getByRole('dialog')).toBeTruthy();});

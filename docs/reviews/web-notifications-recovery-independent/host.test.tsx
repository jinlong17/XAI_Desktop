import React from 'react';
import {it,expect,vi,beforeEach,afterEach} from 'vitest';
import {act,cleanup,fireEvent,render,within} from '@testing-library/react';
import {transferableAbortController} from 'node:util';
import {createMemoryRouter,RouterProvider} from 'react-router';
import {WebShellProvider,Shell} from '@repo/xai-web-shell';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {webShellModuleRegistrations} from '../../../apps/web/src/routes/modules/shellRegistrations';
import {composedSettingsRegistration} from '../../../apps/web/src/routes/modules/composedSettingsRegistration';
import {requestSettingsDeparture} from '../../../apps/web/src/routes/modules/settingsDeparture';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
const fields=[
 {name:'enabled',key:'xai_pref_notif_enabled',old:'true',value:false,label:'Enable notifications',type:'switch'},
 {name:'done_sound',key:'xai_pref_notif_done_sound',old:'subtle',value:'chime',type:'select'},
 {name:'push_task',key:'xai_pref_notif_push_task',old:'true',value:false,type:'switch',index:1},
 {name:'push_pomo',key:'xai_pref_notif_push_pomo',old:'true',value:false,type:'switch',index:2},
 {name:'push_habit',key:'xai_pref_notif_push_habit',old:'false',value:true,type:'switch',index:3},
 {name:'quiet',key:'xai_pref_notif_quiet',old:'true',value:false,type:'switch',index:4},
 {name:'quiet_start',key:'xai_pref_notif_quiet_start',old:'22:00',value:'23:15',type:'time',label:'Quiet hours start'},
 {name:'quiet_end',key:'xai_pref_notif_quiet_end',old:'07:00',value:'06:30',type:'time',label:'Quiet hours end'},
];
const keys=fields.map(f=>f.key);
const pane='/app/settings/notifications',next='/app/settings/date_time';
async function flush(){await act(async()=>{for(let i=0;i<8;i++)await new Promise(r=>setTimeout(r,0));});}
beforeEach(()=>{localStorage.clear();const owner='notifications-parent-A';nativeSet.call(localStorage,generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));accountScope.activate(accountScope.lock(owner),'g1');fields.forEach(f=>nativeSet.call(localStorage,f.key,f.old));vi.stubGlobal('AbortController',transferableAbortController().constructor);vi.stubGlobal('navigator',{locks:createTestLockManager()});vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>setTimeout(()=>cb(performance.now()),0));vi.stubGlobal('cancelAnimationFrame',clearTimeout);});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function host(){const Composed=composedSettingsRegistration.children[0]!.render;const router=createMemoryRouter([{path:'/app',element:<Shell lang="en" setLang={()=>{}} theme="light" setTheme={()=>{}} density="comfortable" setDensity={()=>{}}/>,children:[{path:'settings/*',element:<Composed/>},{path:'dashboard',element:<div>Dashboard destination</div>}]}],{initialEntries:[pane]});const ui=render(<WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={()=>{}}><RouterProvider router={router}/></WebShellProvider>);await flush();const element=ui.container.querySelector('.notif-pane')!;expect(element).toBeTruthy();const q=within(element as HTMLElement);expect((q.getByRole('combobox') as HTMLSelectElement).value).toBe('subtle');expect(q.getAllByRole('switch').map(e=>e.getAttribute('aria-checked'))).toEqual(['true','true','true','false','true']);expect((q.getByLabelText('Quiet hours start') as HTMLInputElement).value).toBe('22:00');return {ui,q,router};}
function deny(indices:number[]){vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(indices.some(i=>k===keys[i]))throw Error('quota');nativeSet.call(this,k,v);});}
function change(q:ReturnType<typeof within>,index:number){const f=fields[index];if(f.type==='select')fireEvent.change(q.getByRole('combobox'),{target:{value:f.value}});else if(f.type==='time')fireEvent.change(q.getByLabelText(f.label!),{target:{value:f.value}});else fireEvent.click(q.getAllByRole('switch')[f.index??0]);}
function displayed(q:ReturnType<typeof within>,index:number){const f=fields[index];if(f.type==='select')return (q.getByRole('combobox') as HTMLSelectElement).value;if(f.type==='time')return (q.getByLabelText(f.label!) as HTMLInputElement).value;return q.getAllByRole('switch')[f.index??0].getAttribute('aria-checked')==='true';}
it.each(fields.map((f,index)=>({...f,index})))('actual pane retains failed latest $name',async({index,value})=>{const {q}=await host();deny([index]);change(q,index);await flush();expect(nativeGet.call(localStorage,keys[index])).toBe(fields[index].old);expect(displayed(q,index)).toBe(value);});
it('actual route holds failed notification work',async()=>{const {ui,q,router}=await host();deny([0]);change(q,0);await flush();await act(async()=>{void router.navigate(next)});await flush();expect(router.state.location.pathname).toBe(pane);expect(ui.getByRole('dialog')).toBeTruthy();});
it('actual signout holds failed hidden times after quiet disabled',async()=>{const {ui,q}=await host();deny([6,7]);change(q,6);change(q,7);await flush();change(q,5);await flush();expect(nativeGet.call(localStorage,keys[5])).toBe('false');expect(q.queryByLabelText('Quiet hours start')).toBeNull();let outcome:unknown='pending';await act(async()=>{void requestSettingsDeparture('sign-out').then(value=>outcome=value)});await flush();expect(outcome).toBe('pending');expect(ui.getByRole('dialog')).toBeTruthy();});
it('reenabling quiet reveals both retained latest failed times',async()=>{const {q}=await host();deny([6,7]);change(q,6);change(q,7);await flush();change(q,5);await flush();change(q,5);await flush();expect(displayed(q,6)).toBe('23:15');expect(displayed(q,7)).toBe('06:30');});
it('clean notifications permits departure with zero seeded writes',async()=>{const {ui,router}=await host();const writes=vi.spyOn(Storage.prototype,'setItem');expect(await requestSettingsDeparture('sign-out')).toBe(true);await act(async()=>{void router.navigate(next)});await flush();expect(router.state.location.pathname).toBe(next);expect(ui.queryByRole('dialog')).toBeNull();expect(writes.mock.calls.filter(([key])=>keys.includes(key))).toHaveLength(0);});

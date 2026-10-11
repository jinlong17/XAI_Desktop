import React from 'react';
import {it,expect,vi,beforeEach} from 'vitest';
import {act,fireEvent,render} from '@testing-library/react';
import {transferableAbortController} from 'node:util';
import {createMemoryRouter,RouterProvider} from 'react-router';
import {WebShellProvider} from '@repo/xai-web-shell';
import {webShellModuleRegistrations} from '../../../apps/web/src/routes/modules/shellRegistrations';
import {requestSettingsDeparture} from '../../../apps/web/src/routes/modules/settingsDeparture';
import {fixture,flush,cases,key,nativeSet,nativeGet,timerBytes} from '../web-d2-pomo-device-astra/fixture';
fixture();beforeEach(()=>{vi.stubGlobal('AbortController',transferableAbortController().constructor)});
const path='/app/pomodoro',next='/app/dashboard';
async function host(){const registration=webShellModuleRegistrations.find(r=>r.moduleId==='pomodoro')!;const Module=registration.children.find(r=>r.path==='')!.render;const router=createMemoryRouter([{path,element:<Module/>},{path:next,element:<div>Dashboard destination</div>}],{initialEntries:[path]});const ui=render(<WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={()=>{}}><RouterProvider router={router}/></WebShellProvider>);await flush();return {ui,router};}
const unload=()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented};
function denyTheme(){vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key('theme'))throw Error('quota');nativeSet.call(this,k,v)})}
for(const row of cases)it(`${row.name} actual failed preference draft warns on browser unload`,async()=>{const {ui}=await host();const timers=timerBytes();vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key(row.name))throw Error('quota');nativeSet.call(this,k,v)});row.act(ui);await flush();expect(row.visible(ui)).toBe(true);expect(timerBytes()).toEqual(timers);expect(unload()).toBe(true);});
it('actual registered Pomodoro route retains failed draft and asks before navigation',async()=>{const {ui,router}=await host();denyTheme();fireEvent.click(ui.getByTestId('theme-blue'));await flush();await act(async()=>{await router.navigate(next)});await flush();expect(router.state.location.pathname).toBe(path);expect(ui.getByTestId('theme-blue').getAttribute('aria-pressed')).toBe('true');expect(ui.getByRole('dialog')).toBeTruthy();expect(nativeGet.call(localStorage,key('theme'))).toBe('"coral"');});
it('App signout preflight remains pending behind actual Pomodoro draft decision',async()=>{const {ui}=await host();denyTheme();fireEvent.click(ui.getByTestId('theme-blue'));await flush();let outcome:unknown='unresolved';await act(async()=>{void requestSettingsDeparture('sign-out').then(value=>outcome=value)});await flush();expect(outcome).toBe('unresolved');expect(ui.getByRole('dialog')).toBeTruthy();});
it('clean Pomodoro neither warns nor blocks normal navigation or signout',async()=>{const {router}=await host();expect(unload()).toBe(false);expect(await requestSettingsDeparture('sign-out')).toBe(true);await act(async()=>{await router.navigate(next)});expect(router.state.location.pathname).toBe(next);});

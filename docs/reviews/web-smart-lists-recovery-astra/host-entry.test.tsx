import React from 'react';
import {it,expect,vi,beforeEach} from 'vitest';
import {transferableAbortController} from 'node:util';
import {act,cleanup,fireEvent,render,within} from '@testing-library/react';
import {createMemoryRouter,RouterProvider} from 'react-router';
import {WebShellProvider} from '@repo/xai-web-shell';
import {composedSettingsRegistration} from '../../../apps/web/src/routes/modules/composedSettingsRegistration';
import {requestSettingsDeparture} from '../../../apps/web/src/routes/modules/settingsDeparture';
import {fixture,key,logical,nativeGet,nativeSet,activate,choose,select,flush,seed,quota,hold} from '../web-d2-smart-lists-astra/fixture';
fixture();
// Match Node Request with a native AbortController; jsdom AbortSignal is a different realm.
beforeEach(()=>{vi.stubGlobal('AbortController',transferableAbortController().constructor);});
const smart='/app/settings/smart_lists',notifications='/app/settings/notifications';
async function host(pending=false){seed('{"extension":"A"}');const Composed=composedSettingsRegistration.children[0]!.render;const router=createMemoryRouter([{path:'/app/settings/*',element:<Composed/>},{path:'/app/dashboard',element:<div>Dashboard route</div>}],{initialEntries:['/app/dashboard',smart],initialIndex:1});const ui0=render(<WebShellProvider modules={[composedSettingsRegistration]} lang="en" railPos="left" petOn={false} setPetOn={()=>{}}><RouterProvider router={router}/></WebShellProvider>);const ui={...ui0,q:within(ui0.container)};await flush();const failure=pending?null:quota();choose(ui,0,'hide');await flush();return{ui,router,failure};}
const navigate=async(router:any,to:any)=>{await act(async()=>{await router.navigate(to);});await flush();};
const click=(ui:any,name:RegExp)=>fireEvent.click(ui.q.getByRole('button',{name}));
it('same-turn route then sign-out retains route priority',async()=>{const {ui,router}=await host();let outcome:unknown;await act(async()=>{void router.navigate(notifications);void requestSettingsDeparture('sign-out').then(x=>outcome=x);});await flush();click(ui,/Discard local changes and leave/);await flush();expect.soft(outcome).toBe(false);expect(router.state.location.pathname).toBe(notifications);});
it('same-turn two programmatic routes retain first destination',async()=>{const {ui,router}=await host();await act(async()=>{void router.navigate(notifications);void router.navigate('/app/settings/date_time');});await flush();click(ui,/Discard local changes and leave/);await flush();expect(router.state.location.pathname).toBe(notifications);});
it('same-turn sign-out then route retains sign-out priority control',async()=>{const {ui,router}=await host();let outcome:unknown;await act(async()=>{void requestSettingsDeparture('sign-out').then(x=>outcome=x);void router.navigate(notifications);});await flush();click(ui,/Discard local changes and leave/);await flush();expect(outcome).toBe(true);expect(router.state.location.pathname).toBe(smart);});

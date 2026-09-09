import { transferableAbortController } from 'node:util';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, it, vi } from 'vitest';
import { WebAuthSessionProvider } from '../../../packages/web-auth-device-session/src/session.js';
import { webHostRouteObjects } from '../../../apps/web/src/routes/router.js';
// Keep the real host route tree and auth gates. App is a deliberately blocking
// data gate: auth must redirect before trying to mount protected children.
vi.mock('../../../apps/web/src/App',()=>({App:()=> <p data-blocked>Waiting for account</p>}));
vi.mock('../../../apps/web/src/pages/AuthPage',()=>({AuthPage:()=> <p data-login>Login</p>}));
vi.mock('../../../apps/web/src/pages/TokensSmokePage.js',()=>({TokensSmokePage:()=>null}));
vi.mock('../../../apps/web/src/routes/modules/shellRegistrations',()=>({webModuleRouteRegistrations:[{moduleId:'ai',defaultChildPath:'',children:[{path:'',render:()=>null}]}]}));
vi.mock('@repo/plugin-web-settings-rest',()=>({CallbackPage:()=>null,CheckoutSuccessPage:()=>null,CheckoutCancelPage:()=>null}));
for (const [entry,next] of [['/app/tasks?filter=active','/app/tasks?filter=active'],['/','/app/ai']]) {
 it(`unauthenticated ${entry} reaches login before the data gate and preserves next`,async()=>{
  (globalThis as unknown as {IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
  vi.stubGlobal('AbortController', class { constructor() { return transferableAbortController(); } });
  const client={auth:{getSession:async()=>({data:{session:null},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})}};
  const deviceStore={get:async()=>null,ensure:async()=>({deviceId:'device'})};
  const router=createMemoryRouter(webHostRouteObjects,{initialEntries:[entry]});
  const div=document.createElement('div');document.body.append(div);const root=createRoot(div);
  try {
   await act(async()=>{root.render(<WebAuthSessionProvider client={client as never} deviceStore={deviceStore as never}><RouterProvider router={router}/></WebAuthSessionProvider>);});
   expect(router.state.location.pathname).toBe('/auth/login');
   expect(new URLSearchParams(router.state.location.search).get('next')).toBe(next);
   expect(div.querySelector('[data-login]')).not.toBeNull();expect(div.querySelector('[data-blocked]')).toBeNull();
  } finally {await act(async()=>root.unmount());router.dispose();div.remove();vi.unstubAllGlobals();}
 });
}

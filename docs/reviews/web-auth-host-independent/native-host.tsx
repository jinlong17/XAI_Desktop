import React,{StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router/dom';
import {AppProviders} from '../../../apps/web/src/providers/AppProviders';
import {router} from '../../../apps/web/src/routes/router';
import {useWebAuthSession} from '../../../packages/web-auth-device-session/src/session';
const originalFetch=window.fetch.bind(window);
const session=(id:string)=>({access_token:id+'-synthetic-token',refresh_token:id+'-synthetic-refresh',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id,email:id+'@fixture.invalid',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'}});
let slowResponseReturned=false;
window.fetch=async(input,init)=>{
 const url=String(input);if(new URL(url,location.origin).origin!==location.origin)throw Error('Fixture blocked external network');if(!url.includes('/auth/v1/')&&!url.includes('/rest/v1/'))return originalFetch(input,init);
 await originalFetch('/probe/request',{method:'POST',body:JSON.stringify({url,method:init?.method??'GET'})});
 const body=init?.body?JSON.parse(String(init.body)):{};
 if(url.includes('/token?grant_type=password')&&body.email==='SlowA@fixture.invalid'){await originalFetch('/probe/slow');slowResponseReturned=true;}
 if(url.includes('/token?grant_type=password'))return new Response(JSON.stringify(session(body.email.split('@')[0])),{status:200});
 if(url.includes('/token?grant_type=pkce'))return new Response(JSON.stringify(session(body.auth_code)),{status:200});
 if(url.includes('/user')){const owner=new Headers(init?.headers).get('Authorization')?.match(/Bearer (.+)-synthetic-token/)?.[1]??'ResetOwner';return new Response(JSON.stringify(session(owner).user),{status:200});}
 if(url.includes('/logout'))return new Response(null,{status:204});
 if(url.includes('/recover')){localStorage.setItem('probe-reset-target',new URL(url).searchParams.get('redirect_to')??'');return new Response('{}',{status:200});}
 if(url.includes('/signup'))return new Response('{}',{status:200});
 if(url.includes('/rest/v1/rpc/device_'))return new Response(null,{status:204});
 return new Response('[]',{status:200});
};
let context:ReturnType<typeof useWebAuthSession>;
function Observe(){context=useWebAuthSession();return <output hidden data-auth={context.state} data-owner={context.session?.user.id??''}/>;}
createRoot(document.getElementById('root')!).render(<StrictMode><AppProviders><Observe/><RouterProvider router={router}/></AppProviders></StrictMode>);
const pause=(ms=40)=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(value:unknown,message:string)=>{if(!value)throw Error(message+' UI='+document.body.innerText.slice(0,500));};
async function waitFor(check:()=>boolean,message:string){for(let i=0;i<250;i++){if(check())return;await pause();}assert(false,message);}
function input(placeholder:string,value:string){const target=document.querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`)!;assert(target,'missing '+placeholder);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(target,value);target.dispatchEvent(new Event('input',{bubbles:true}));}
async function click(text:string){await waitFor(()=>[...document.querySelectorAll('button')].some(node=>node.textContent?.trim()===text),'missing '+text);([...document.querySelectorAll('button')].find(node=>node.textContent?.trim()===text)as HTMLButtonElement).click();await pause();}
async function workspace(){
 await pause(200);
 if(document.body.innerText.includes('Start without importing')){await click('Start without importing');await click('Continue to workspace');}
 await waitFor(()=>!!document.querySelector('.rail-avatar'),'actual host shell');
}
async function logout(){
 await workspace();(document.querySelector('.rail-avatar')as HTMLButtonElement).click();
 await waitFor(()=>!!document.querySelector('.avm-item.danger'),'avatar logout menu');(document.querySelector('.avm-item.danger')as HTMLButtonElement).click();
 await waitFor(()=>!!document.querySelector('.xai-sign-out-dialog__btn--confirm'),'logout confirmation');(document.querySelector('.xai-sign-out-dialog__btn--confirm')as HTMLButtonElement).click();
}
function record(check:string){const list=JSON.parse(localStorage.getItem('probe-checks')??'[]');list.push(check);localStorage.setItem('probe-checks',JSON.stringify(list));}
async function run(){
 await waitFor(()=>!!context&&context.state!=='loading','provider ready');
 if(new URLSearchParams(location.search).has('probe_peer'))sessionStorage.setItem('probe-peer','1');
 if(sessionStorage.getItem('probe-peer')){
  if(context.state==='authenticated'&&context.session?.user.id==='B'){window.opener?.postMessage('peer-B',location.origin);return;}
  await waitFor(()=>!!document.querySelector('input[placeholder="Email"]'),'peer login');window.opener?.postMessage('peer-ready',location.origin);
  window.addEventListener('message',async event=>{if(event.origin===location.origin&&event.data==='login-B'){input('Email','B@fixture.invalid');input('Password','synthetic');await pause();await click('Sign in');}});return;
 }
 const phase=localStorage.getItem('probe-auth-ui-phase')??'login';
 if(phase==='login'){
  await waitFor(()=>!!document.querySelector('input[placeholder="Email"]'),'actual login form');input('Email','A@fixture.invalid');input('Password','synthetic');await pause();localStorage.setItem('probe-auth-ui-phase','after-login');await click('Sign in');return;
 }
 if(phase==='after-login'){
  assert(context.state==='authenticated'&&context.session?.user.id==='A','form login did not restore A');await workspace();record('Actual WebAuthPage form login and full navigation restore A in actual App shell');
  const originalPut=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(value:any,key?:IDBValidKey){const request=originalPut.call(this,value,key!);if(value?.generation&&value?.owner==='A')this.transaction.abort();return request;};
  await logout();await waitFor(()=>context.state==='error','failed logout must be error');await pause(100);
  const explicitFailure=document.body.innerText.includes('Sign-out did not complete.');
  if(!explicitFailure){const failures=JSON.parse(localStorage.getItem('probe-failures')??'[]');failures.push('Actual host sign-out failure notice unmounted by parent AppRouteGate');localStorage.setItem('probe-failures',JSON.stringify(failures));}
  assert(!document.querySelector('.rail-avatar'),'private shell remained mounted after failure');assert(context.session===null&&context.client===null,'error provider leaked auth client/session');
  IDBObjectStore.prototype.put=originalPut;record('Native IDB logout failure stays visible after delay; private shell/client/session locked');
  await click('Retry session recovery');await waitFor(()=>context.state==='authenticated','explicit recovery');await workspace();
  localStorage.setItem('probe-auth-ui-phase','reopened');await originalFetch('/probe/restart',{method:'POST'});return;
 }
 if(phase==='reopened'){
  assert(context.state==='authenticated'&&context.session?.user.id==='A','whole browser reopen did not restore A');await workspace();record('Whole isolated Chrome process close/reopen restores A from native persistence');
  localStorage.setItem('probe-auth-ui-phase','oauth-start');await logout();return;
 }
 if(phase==='oauth-start'){
  await waitFor(()=>context.state==='unauthenticated'&&!!document.querySelector('input[placeholder="Email"]'),'logout reaches auth form');record('Actual host logout clears authenticated state and redirects to auth form');
  localStorage.setItem('probe-auth-ui-phase','oauth-done');await click('Continue with Google');return;
 }
 if(phase==='oauth-done'){
  if(location.pathname.startsWith('/auth/'))return; // Actual callback effect owns this navigation.
  assert(context.state==='authenticated'&&context.session?.user.id==='OAuthOwner','actual OAuth callback failed');
  const counts=await originalFetch('/probe/counts').then(r=>r.json());assert(counts.exchanges===1,'StrictMode OAuth callback exchanged twice');record('Actual OAuth button, authorize redirect and StrictMode callback exchange once');
  await workspace();localStorage.setItem('probe-auth-ui-phase','reset-email');await logout();return;
 }
 if(phase==='reset-email'){
  await waitFor(()=>context.state==='unauthenticated'&&!!document.querySelector('input[placeholder="Email"]'),'reset login form');await click('Reset');input('Email','ResetOwner@fixture.invalid');await pause();await click('Send reset');
  await waitFor(()=>document.body.innerText.includes('password_reset_email_sent'),'actual reset request feedback');const target=localStorage.getItem('probe-reset-target');assert(target,'SDK reset redirect missing');
  const callback=new URL(target!);callback.searchParams.set('code','ResetOwner');localStorage.setItem('probe-auth-ui-phase','reset-form');location.assign(callback.toString());return;
 }
 if(phase==='reset-form'){
  if(location.pathname!=='/auth/reset-password')return;
  assert(context.state==='authenticated'&&context.session?.user.id==='ResetOwner','reset callback owner');input('Password','synthetic-replacement');await pause();localStorage.setItem('probe-auth-ui-phase','reset-done');await click('Set password');return;
 }
 if(phase==='reset-done'){
  if(location.pathname.startsWith('/auth/'))return;
  assert(context.state==='authenticated'&&context.session?.user.id==='ResetOwner','reset-complete lost owner');const counts=await originalFetch('/probe/counts').then(r=>r.json());assert(counts.updates===1,'reset update count');record('Actual reset-email, verify callback, reset-password form and owner-bound update complete');
  localStorage.setItem('probe-auth-ui-phase','stale-start');await logout();return;
 }
 if(phase==='stale-start'){
  await waitFor(()=>context.state==='unauthenticated'&&!!document.querySelector('input[placeholder="Email"]'),'stale form ready');
  let ready=false,peerB=false;window.addEventListener('message',event=>{if(event.origin===location.origin){if(event.data==='peer-ready')ready=true;if(event.data==='peer-B')peerB=true;}});
  const peer=window.open('/auth/login?probe_peer=1');assert(peer,'peer window');await waitFor(()=>ready,'peer ready');
  input('Email','SlowA@fixture.invalid');input('Password','synthetic');await pause();await click('Sign in');
  for(let i=0;i<100;i++){const status=await originalFetch('/probe/slow-status').then(r=>r.json());if(status.pending)break;await pause();assert(i<99,'slow A request missing');}
  peer!.postMessage('login-B',location.origin);await waitFor(()=>peerB,'peer B published');await waitFor(()=>context.state==='authenticated'&&context.session?.user.id==='B','main observes B');
  await originalFetch('/probe/release',{method:'POST'});await waitFor(()=>slowResponseReturned,'A HTTP response actually returned');await pause(400);assert(context.state==='authenticated'&&context.session?.user.id==='B','late A replaced B');assert(!context.authError,'late A exposed error');await workspace();peer!.close();record('Actual two-page form login: delayed A HTTP completes after B publication without replacing B or leaking old error');
  await originalFetch('/probe/result',{method:'POST',body:JSON.stringify({pass:JSON.parse(localStorage.getItem('probe-failures')??'[]').length===0,failures:JSON.parse(localStorage.getItem('probe-failures')??'[]'),checks:JSON.parse(localStorage.getItem('probe-checks')!),owner:context.session?.user.id,path:location.pathname})});return;
 }
}
run().catch(error=>originalFetch('/probe/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error),stack:error.stack,path:location.pathname,phase:localStorage.getItem('probe-auth-ui-phase'),checks:JSON.parse(localStorage.getItem('probe-checks')??'[]')})}));

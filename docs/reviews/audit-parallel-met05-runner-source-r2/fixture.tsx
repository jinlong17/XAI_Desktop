/** UNQUALIFIED SOURCE: real archived host/providers/gates; synthetic remote HTTP only.
 * No private context, module/storage substitution, forced route/focus, or product mutation. */
import { StrictMode, useLayoutEffect, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { createAuthGenerationStore } from '@repo/web-auth-device-session';
import { useWebAuthSession } from '@repo/web-auth-device-session/web';
import { accountScope, generationKey, generationMarkerKey } from '@repo/plugin-web-storage';
import { createSeedMetricTrackerState, readMetricTrackerState, METRIC_TRACKER_STATE_KEY } from '@repo/plugin-web-metric-tracker';
import { AppProviders } from '__met_archive_host__/providers/AppProviders.tsx';
import { router } from '__met_archive_host__/routes/router.tsx';
import '@repo/plugin-web-tokens';
import '__met_archive_host__/styles/global.css';
const query=new URLSearchParams(location.search);
const lang=query.get('__met_lang')==='zh'?'zh':'en';
if(query.get('__met_lane')!=='host')throw new Error('MET05 only actual host lane is authorized');
const generation='met05-disposable-r2';
const accounts=['met05-synthetic-A','met05-synthetic-B'] as const;
const documentId=crypto.randomUUID();
const keyOf=(id:string,gen=generation,demo=false)=>generationKey(id,gen,METRIC_TRACKER_STATE_KEY,demo);
const original={set:Storage.prototype.setItem,remove:Storage.prototype.removeItem,get:Storage.prototype.getItem,clear:Storage.prototype.clear,fetch:window.fetch};
const instrument={events:[] as any[],audit:[] as any[],firstRender:[] as any[],scopeTransitions:[] as any[],errors:[] as string[],pending:0,sequence:0,deny:null as string|null,boundary:0};
const relevant=(key:string)=>key===METRIC_TRACKER_STATE_KEY||key.includes(METRIC_TRACKER_STATE_KEY)||key.includes(encodeURIComponent(METRIC_TRACKER_STATE_KEY));
let auth:ReturnType<typeof useWebAuthSession>|null=null;
const physical=()=>{try{return accountScope.physicalKey(METRIC_TRACKER_STATE_KEY,accountScope.capture());}catch{return null;}};
const bytes=()=>{const keys=new Set([METRIC_TRACKER_STATE_KEY,...accounts.flatMap(id=>[keyOf(id),keyOf(id,'wrong-generation'),keyOf(id,generation,true)]),keyOf('met05-other-account')]);for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&relevant(key))keys.add(key);}return Object.fromEntries([...keys].sort().map(key=>[key,original.get.call(localStorage,key)]));};
// Explicit synthetic source data are installed through original methods BEFORE mount.
for(const [i,id] of accounts.entries()) {
  if(original.get.call(localStorage,generationMarkerKey(id))===null)original.set.call(localStorage,generationMarkerKey(id),JSON.stringify({generation,migrationId:'met05-explicit-synthetic-marker',previous:null}));
  if(original.get.call(localStorage,keyOf(id))===null) {const state=createSeedMetricTrackerState(new Date().toISOString());original.set.call(localStorage,keyOf(id),JSON.stringify({...state,records:[],profile:{...state.profile,targetWeightKg:i?85:70}}));}
  for(const key of [keyOf(id,'wrong-generation'),keyOf(id,generation,true)])if(original.get.call(localStorage,key)===null)original.set.call(localStorage,key,JSON.stringify({sentinel:'untouched-other-generation-demo',key}));
}
for(const key of [METRIC_TRACKER_STATE_KEY,keyOf('met05-other-account')])if(original.get.call(localStorage,key)===null)original.set.call(localStorage,key,JSON.stringify({sentinel:'untouched-legacy-other',key}));
original.set.call(localStorage,'xai_pref_lang',JSON.stringify(lang));
original.set.call(localStorage,'xai_pref_theme',JSON.stringify(query.get('__met_theme')??'light'));
// Counts begin before React mount. A reload cannot hide mount normalization writes.
Storage.prototype.setItem=function(key,value) {
  if(this===localStorage&&relevant(String(key))) {
    const expected=physical(),denied=key===instrument.deny;
    instrument.events.push({type:'set',key:String(key),value:String(value),denied,expected,wrongKey:key!==expected,scope:{...accountScope.capture()},time:performance.now(),documentId});instrument.sequence++;
    if(denied){instrument.deny=null;throw new DOMException('MET05 exact once-denied write','QuotaExceededError');}
  }
  return original.set.call(this,key,value);
};
Storage.prototype.removeItem=function(key) {if(this===localStorage&&relevant(String(key))){instrument.events.push({type:'remove',key:String(key),expected:physical(),wrongKey:key!==physical(),scope:{...accountScope.capture()},time:performance.now(),documentId});instrument.sequence++;}return original.remove.call(this,key);};
Storage.prototype.clear=function(){if(this===localStorage){for(const [key,value] of Object.entries(bytes()))if(value!==null)instrument.events.push({type:'clear',key,expected:physical(),wrongKey:true,scope:{...accountScope.capture()},documentId});instrument.sequence++;}return original.clear.call(this);};
window.fetch=async function(input,init){const raw=input instanceof Request?input.url:String(input);const url=new URL(raw,location.href);if(url.origin!==location.origin){instrument.errors.push(`nonlocal:${url.origin}`);throw new Error('MET05 external request refused');}instrument.pending++;instrument.sequence++;try{return await original.fetch(input,init);}finally{instrument.pending--;instrument.sequence++;}};
for(const type of ['keydown','keyup','keypress','mousedown','mouseup','click','input'])document.addEventListener(type,e=>instrument.audit.push({type,isTrusted:e.isTrusted,key:(e as KeyboardEvent).key,code:(e as KeyboardEvent).code,target:(e.target as Element)?.tagName,text:(e.target as Element)?.textContent?.slice(0,100),documentId}),true);
window.addEventListener('error',e=>instrument.errors.push(String(e.error??e.message)));
window.addEventListener('unhandledrejection',e=>instrument.errors.push(String(e.reason)));
const target=()=>document.querySelector('.mt-current > div:nth-child(2) > strong')?.textContent?.trim()??null;
const nodeIds=new WeakMap<Element,string>();
let lastNode:Element|null=null;
function census() {
  const scope=accountScope.capture(),node=document.querySelector('.module-metrics');
  if(node&&node!==lastNode){let nodeId=nodeIds.get(node);if(!nodeId){nodeId=crypto.randomUUID();nodeIds.set(node,nodeId);}const captured=auth?.coordinator?.capture();instrument.firstRender.push({documentId,nodeId,rendered:true,kind:scope.kind,accountId:scope.accountId,generation:scope.generation,epoch:scope.epoch,key:physical(),authOwner:auth?.session?.user.id??null,authGeneration:captured?.generation??null,managed:Boolean(auth?.coordinator),target:target(),content:node.textContent,time:performance.now()});}
  lastNode=node;
}
// DOM mutations observe the ACTUAL committed gated subtree, unlike the old sibling
// auth-only effect. Every first mounted node identity is retained, never filtered away.
const mutation=new MutationObserver(()=>{instrument.sequence++;census();});mutation.observe(document.getElementById('root')!,{subtree:true,childList:true,attributes:true,characterData:true});
accountScope.subscribe(()=>{instrument.sequence++;instrument.scopeTransitions.push({documentId,time:performance.now(),scope:{...accountScope.capture()},rendered:Boolean(document.querySelector('.module-metrics'))});});
function PublicAuthObserver() {
  const state=useWebAuthSession();const scope=useSyncExternalStore(accountScope.subscribe,accountScope.capture,accountScope.capture);
  useLayoutEffect(()=>{auth=state;instrument.sequence++;census();},[state,scope]);return null;
}
async function withPending<T>(fn:()=>Promise<T>) {instrument.pending++;instrument.sequence++;try{return await fn();}finally{instrument.pending--;instrument.sequence++;}}
function observe() {
  const scope=accountScope.capture(),key=physical(),module=document.querySelector('.module-metrics');const log=document.querySelector<HTMLButtonElement>('.mt-primary');
  const strip=document.querySelector('.mt-tabs')?.getBoundingClientRect();
  const tabs=Array.from(document.querySelectorAll<HTMLButtonElement>('.mt-tabs button')).map((b,i)=>{const r=b.getBoundingClientRect(),style=getComputedStyle(b);const visible=Boolean(strip&&r.left>=Math.max(0,strip.left)&&r.right<=Math.min(innerWidth,strip.right)&&r.top>=0&&r.bottom<=innerHeight&&style.visibility==='visible'&&style.display!=='none');return {id:['weight','sleep','water','exercise','custom'][i],present:true,text:b.textContent??'',disabled:b.disabled,selected:b.getAttribute('aria-selected')==='true',visible,rect:r.toJSON()};});
  const records=Array.from(document.querySelectorAll('.mt-record-row')).map(e=>({weight:e.querySelector('.mt-record-weight')?.textContent?.replace(/\s+/g,' ').trim(),note:e.querySelector('.mt-record-note')?.textContent?.trim()}));
  let normalized=null;try{if(scope.kind==='account')normalized=readMetricTrackerState(scope);}catch(e){instrument.errors.push(String(e));}
  return {documentId,lang,lane:'actual-host-managed-local-http',module:module?'actual-metrics':'absent',url:location.href,route:location.pathname,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},scope:{...scope},key,actualPhysicalKey:key,auth:{state:auth?.state,owner:auth?.session?.user.id,generation:auth?.coordinator?.capture()?.generation,managed:Boolean(auth?.coordinator)},bytes:bytes(),writes:instrument.events.filter(e=>e.type==='set').length,removes:instrument.events.filter(e=>e.type==='remove'||e.type==='clear').length,events:[...instrument.events],wrongKeyAttempts:instrument.events.filter(e=>e.wrongKey),firstRender:[...instrument.firstRender],scopeTransitions:[...instrument.scopeTransitions],tabs,log:{present:!!log,disabled:log?.disabled??null,label:log?.textContent?.trim()??null},content:module?.textContent??null,dialogs:document.querySelectorAll('.mt-modal-card').length,failureVisible:Boolean(document.querySelector('.mt-save-failure')),target:target(),renderedRecords:records,normalized,pending:instrument.pending,errors:[...instrument.errors]};
}
const api={documentId,get ready(){const scope=accountScope.capture();return auth?.state==='authenticated'&&Boolean(auth.coordinator)&&scope.kind==='account'&&scope.accountId===auth.session?.user.id;},get authReady(){return auth!==null&&auth.state!=='loading';},get authState(){return auth?.state;},get audit(){return instrument.audit;},observe,
  settledBoundary(){const result={documentId,priorMountEvents:[...instrument.events],scope:{...accountScope.capture()},key:physical()};instrument.events=[];instrument.audit=[];instrument.boundary++;return result;},
  async settle(){await document.fonts.ready;let previous='';let stable=0;for(let n=0;n<60;n++){await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r())));const s=observe(),signature=JSON.stringify({sequence:instrument.sequence,scope:s.scope,key:s.key,auth:s.auth,content:s.content,events:s.events,pending:s.pending});if(signature===previous&&s.pending===0&&document.getAnimations().every(a=>a.playState!=='running'))stable++;else stable=0;previous=signature;if(stable>=3)return {stable:true,pending:instrument.pending,errors:[...instrument.errors],sequence:instrument.sequence};}return {stable:false,pending:instrument.pending,errors:[...instrument.errors],sequence:instrument.sequence};},
  async publishIdentity(id:string|null){if(!auth?.coordinator)throw new Error('actual managed coordinator absent');return withPending(async()=>{if(id===null){const captured=auth!.coordinator!.capture();if(!captured)throw new Error('captured owner absent');const result=await auth!.coordinator!.signOut(captured,{remote:false});if(result.status!=='applied')throw new Error(`signout:${result.status}`);return result;}if(!accounts.includes(id as typeof accounts[number]))throw new Error('outside synthetic account');const result=await auth!.coordinator!.signInWithPassword({email:`${id}@example.invalid`,password:'disposable-local-only',nextPath:'/app/metrics'});if(result.status!=='applied')throw new Error(`signin:${result.status}`);return result;});},
  resetEmptyFixture(){const scope=accountScope.capture();if(scope.kind!=='account'||!accounts.includes(scope.accountId as typeof accounts[number]))throw new Error('fixture scope');const key=physical()!;const state=JSON.parse(original.get.call(localStorage,key)!);original.set.call(localStorage,key,JSON.stringify({...state,activeMetricId:'weight',records:[]}));},
  mixedSourceFixture(){const key=physical();if(!key)throw new Error('fixture scope');const value=JSON.parse(original.get.call(localStorage,key)!);original.set.call(localStorage,key,JSON.stringify({...value,activeMetricId:'sleep',records:[{id:'injected-sleep',metricId:'sleep',value:8,unit:'h',measuredAt:new Date().toISOString(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),note:'mixed-source'}]}));},
  denyOnce(){const key=physical();if(!key)throw new Error('fault scope');instrument.deny=key;},
  dispose(){mutation.disconnect();Storage.prototype.setItem=original.set;Storage.prototype.removeItem=original.remove;Storage.prototype.clear=original.clear;window.fetch=original.fetch;instrument.deny=null;},
};
(window as unknown as Record<string,unknown>).__met05=api;
// Pre-mount initial auth fixture uses only the source-bound PUBLIC generation store.
// Managed provider and real SDK subsequently bootstrap this disposable persisted session.
const authFixture=createAuthGenerationStore();
if(await authFixture.readActive()===null) {
  const lease={generation:crypto.randomUUID()},id=accounts[0],now=Math.floor(Date.now()/1000);
  const enc=(v:unknown)=>btoa(JSON.stringify(v)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  const session={access_token:`${enc({alg:'none',typ:'JWT'})}.${enc({sub:id,aud:'authenticated',role:'authenticated',exp:now+3600})}.synthetic-local-only`,refresh_token:`synthetic-${id}`,expires_in:3600,expires_at:now+3600,token_type:'bearer',user:{id,aud:'authenticated',role:'authenticated',email:`${id}@example.invalid`,app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-10-10T00:00:00.000Z'}};
  for(const result of [await authFixture.createCandidate(lease),await authFixture.setSessionItem(lease,'session',JSON.stringify(session),id),await authFixture.publish({lease,owner:id,expectedActive:null})])if(result.status!=='applied')throw new Error(`public auth fixture:${result.status}`);
}
createRoot(document.getElementById('root')!).render(<StrictMode><AppProviders><PublicAuthObserver/><RouterProvider router={router}/></AppProviders></StrictMode>);

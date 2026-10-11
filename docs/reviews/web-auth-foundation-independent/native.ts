import { createAuthGenerationStore } from '../../../packages/web-auth-device-session/src/auth-generation-store';
import { createIndexedDbStore } from '../../../packages/web-auth-device-session/src/storage';
import { createAuthGenerationCoordinator } from '../../../packages/web-auth-device-session/src/auth-generation-coordinator';
const pause = (ms=30) => new Promise(resolve => setTimeout(resolve,ms));
function gate(){let resolve!:()=>void;const promise=new Promise<void>(yes=>{resolve=yes;});return {promise,resolve};}
const logoutStarted=gate(),logoutResponse=gate();let requests=0;
const session=(id:string)=>({access_token:id+'-synthetic-token',refresh_token:id+'-synthetic-refresh',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id,email:id+'@fixture.invalid',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'}});
const fixtureFetch:typeof fetch=async(input,init)=>{
 requests++;const url=String(input),body=init?.body?JSON.parse(String(init.body)):{};
 if(url.includes('/logout')){logoutStarted.resolve();await logoutResponse.promise;return new Response(null,{status:204});}
 if(url.includes('/token?grant_type=password'))return new Response(JSON.stringify(session(body.email.split('@')[0])),{status:200});
 if(url.includes('/token?grant_type=refresh_token')){const id=String(body.refresh_token).split('-')[0];return new Response(JSON.stringify({...session(id),access_token:id+'-refreshed-token'}),{status:200});}
 if(url.includes('/token?grant_type=pkce'))return new Response(JSON.stringify(session(body.auth_code)),{status:200});
 throw Error('Unexpected fixture auth request');
};
const make=()=>createAuthGenerationCoordinator({config:{url:'https://auth-fixture.invalid',anonKey:'synthetic',autoRefreshToken:false},fetch:fixtureFetch});
const coordinator=make();
const assert=(value:unknown,message:string)=>{if(!value)throw Error(message);};
async function waitFor(check:()=>boolean,message:string){for(let i=0;i<150;i++){if(check())return;await pause();}throw Error(message);}
if(new URLSearchParams(location.search).has('peer')){
 void coordinator.bootstrap();
 addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==opener)return;
  const {id,command}=event.data;
  let result:unknown;
  if(command==='loginB')result=await coordinator.signInWithPassword({email:'B@fixture.invalid',password:'synthetic'});
  else if(command==='refresh')result=await coordinator.getSnapshot().client!.auth.refreshSession();
  else result={owner:coordinator.capture()?.owner,status:coordinator.getSnapshot().status};
  opener.postMessage({id,result},location.origin);
 });
 opener.postMessage({type:'peer-ready'},location.origin);
}else{
 async function run(){
  if(sessionStorage.getItem('probe-phase')==='postlogout'){
   assert((await coordinator.bootstrap()).status==='applied','postlogout bootstrap');
   assert(coordinator.getSnapshot().status==='unauthenticated','retained legacy restored or blocked logout');
   assert(await createIndexedDbStore().getItem('xai-web-auth')===sessionStorage.getItem('probe-legacy'),'legacy original bytes changed');
   return {pass:true,checks:[...JSON.parse(sessionStorage.getItem('probe-checks')!),'migrated legacy survives replacements and logout reload stays unauthenticated without replay'],boundary:'Pinned source. Two real Chrome pages, native IDB/sessionStorage/BroadcastChannel and SDK. Synthetic responses, coordinator only; no React host or process-kill acceptance.'};
  }
  if(sessionStorage.getItem('probe-phase')==='callback'){
   const generation=sessionStorage.getItem('probe-attempt')!;
   assert((await coordinator.bootstrap()).status==='applied','reload bootstrap');
   assert(coordinator.capture()?.owner==='B','reload must recover B while OAuth pending');
   assert(coordinator.readPendingAttempt()?.generation===generation,'reload lost pending generation');
   const result=await coordinator.completeCallback({generation,code:'C'});
   assert(result.status==='applied'&&coordinator.capture()?.owner==='C','callback must publish C');
   assert(coordinator.capture()?.generation===generation,'callback allocated a new generation');
   assert(coordinator.readPendingAttempt()===null,'callback envelope not cleared');
   const prior=JSON.parse(sessionStorage.getItem('probe-checks')!);
   sessionStorage.setItem('probe-checks',JSON.stringify([...prior,'full-page reload retains original OAuth generation and callback publishes its owner']));
   assert((await coordinator.signOut(coordinator.capture()!,{remote:false})).status==='applied','C local logout');
   sessionStorage.setItem('probe-phase','postlogout');location.reload();return null;
  }
  const legacy='  '+JSON.stringify(session('A'))+'\n'; await createIndexedDbStore().setItem('xai-web-auth',legacy);sessionStorage.setItem('probe-legacy',legacy);
  assert((await coordinator.bootstrap()).status==='applied','initial bootstrap');
  assert((await coordinator.signInWithPassword({email:'A@fixture.invalid',password:'synthetic'})).status==='applied','A login');
  const captured=coordinator.capture()!;
  const peer=window.open('/?peer=1','generation-coordinator-peer');assert(peer,'real second page did not open');
  let sequence=0;
  await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('peer ready timeout')),10000);const receive=(event:MessageEvent)=>{if(event.origin!==location.origin||event.source!==peer||event.data.type!=='peer-ready')return;clearTimeout(timer);removeEventListener('message',receive);resolve();};addEventListener('message',receive);});
  const rpc=(command:string)=>new Promise<any>((resolve,reject)=>{
   const id=++sequence;const timer=setTimeout(()=>{removeEventListener('message',receive);reject(Error('peer timed out: '+command));},5000);
   const receive=(event:MessageEvent)=>{if(event.origin!==location.origin||event.source!==peer||event.data.id!==id)return;clearTimeout(timer);removeEventListener('message',receive);resolve(event.data.result);};
   addEventListener('message',receive);peer!.postMessage({id,command},location.origin);
  });
  let initial;for(let i=0;i<30;i++){initial=await rpc('state');if(initial.owner==='A')break;await pause();}assert(initial.owner==='A','peer bootstrap A');
  const outgoing=coordinator.signOut(captured);await logoutStarted.promise;
  assert((await rpc('loginB')).status==='applied','peer B login');
  await waitFor(()=>coordinator.capture()?.owner==='B','native channel did not reconcile B');
  const refreshed=await rpc('refresh');assert(!refreshed.error,'real SDK refresh failed');await waitFor(()=>coordinator.getSnapshot().session?.access_token==='B-refreshed-token','native SDK/channel refresh failed to reconcile B token');
  logoutResponse.resolve();const logout=await outgoing;
  assert(logout.status==='superseded'&&logout.local.status==='applied','old logout result');
  assert(coordinator.capture()?.owner==='B','old logout cleared B snapshot');
  const before=requests;assert((await coordinator.updatePassword(captured,'synthetic')).status==='superseded','stale action accepted');assert(requests===before,'stale action reached network');
  peer!.close();
  const independent=await independentFaults();
  const checks=[...independent,'real peer SDK refresh persists same-generation token and reconciles first page','real second page bootstraps shared active owner','native coordinator BroadcastChannel reconciles new B generation','delayed A SDK logout preserves B snapshot and returns superseded','stale captured action rejected before network'];
  const oauth=await coordinator.startOAuth({provider:'github',redirectTo:location.origin+'/callback',nextPath:'/app'});
  assert(oauth.status==='pending','OAuth start');sessionStorage.setItem('probe-attempt',oauth.generation!);sessionStorage.setItem('probe-checks',JSON.stringify(checks));sessionStorage.setItem('probe-phase','callback');location.reload();
  return null;
 }
 run().then(result=>{if(result)return fetch('/result',{method:'POST',body:JSON.stringify(result)});})
 .catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error),stack:error.stack})}));
}

async function independentFaults(){
 const checks:string[]=[];
 const makeIsolated=(key:string,extra:Record<string,unknown>={})=>createAuthGenerationCoordinator({config:{url:'https://auth-fixture.invalid',anonKey:'synthetic',autoRefreshToken:false,storageKey:key},fetch:fixtureFetch,...extra});
 const login=(c:ReturnType<typeof makeIsolated>,id:string)=>c.signInWithPassword({email:id+'@fixture.invalid',password:'synthetic'});
 const nativePut=IDBObjectStore.prototype.put;
 // True native IDB transaction abort: the failed revoke must not look like a logout.
 const partial=makeIsolated('independent-partial');await partial.bootstrap();await login(partial,'P');const p=partial.capture()!;
 IDBObjectStore.prototype.put=function(value:any,...rest:any[]){const request=nativePut.apply(this,[value,...rest] as any);if(value?.state==='revoked'&&value?.generation===p.generation)this.transaction.abort();return request;};
 let failed;try{failed=await partial.signOut(p,{remote:false});}finally{IDBObjectStore.prototype.put=nativePut;}
 assert(failed.status==='failed'&&failed.local.status==='failed','failed native revoke falsely successful');
 assert(partial.getSnapshot().status==='error','failed revoke did not lock status');const beforeRequests=requests;assert((await partial.updatePassword(p,'must-not-send')).status==='failed'&&requests===beforeRequests,'error state authorized mutation');
 await pause(100);assert((await partial.reconcile(true)).status==='failed','automatic event resurrected failed same-generation logout');
 assert(partial.getSnapshot().status==='error','error latch vanished');
 assert((await createAuthGenerationStore({storageKey:'independent-partial'}).readActive())?.owner==='P','aborted transaction erased authoritative P');
 assert((await partial.signOut(p,{remote:false})).status==='applied','explicit captured cleanup retry');partial.dispose();
 const reopened=makeIsolated('independent-partial');await reopened.bootstrap();assert(reopened.getSnapshot().status==='unauthenticated','retried logout resurrected after new coordinator');reopened.dispose();checks.push('native revoke abort reports failed/error, blocks automatic resurrection, explicit retry then reopen stays signed out');
 // Delay captured local cleanup while B session and a newer pending verifier are created.
 const store=createAuthGenerationStore({storageKey:'independent-cleanup'});const began=gate(),release=gate();const revoke=store.revoke.bind(store);
 store.revoke=async captured=>{began.resolve();await release.promise;return revoke(captured)};
 const c=makeIsolated('independent-cleanup',{store});await c.bootstrap();await login(c,'Old');const old=c.capture()!;
 const cleaning=c.signOut(old,{remote:false});await began.promise;await login(c,'New');
 const oauth=await c.startOAuth({provider:'github',redirectTo:location.origin+'/callback'});assert(oauth.status==='pending','new verifier setup');
 const before=Object.fromEntries(Object.keys(sessionStorage).map(key=>[key,sessionStorage.getItem(key)]));release.resolve();await cleaning;
 assert(c.capture()?.owner==='New','old local cleanup removed newer session');assert(c.readPendingAttempt()?.generation===oauth.generation,'old cleanup removed newer pending envelope');
 const verifierKeys=Object.keys(before).filter(key=>key.includes(oauth.generation!)&&key.includes('verifier'));assert(verifierKeys.length>0,'no real SDK verifier');for(const key of verifierKeys)assert(sessionStorage.getItem(key)===before[key],'new verifier modified');
 c.dispose();checks.push('delayed captured local cleanup preserves newer session, OAuth envelope and exact SDK verifier');
 // Native transient storage denial after durable revoke is a visible partial failure.
 let denyTransient=false;const transient={getItem:(k:string)=>sessionStorage.getItem(k),setItem:(k:string,v:string)=>sessionStorage.setItem(k,v),removeItem:(k:string)=>{if(denyTransient)throw new DOMException('synthetic denial','SecurityError');sessionStorage.removeItem(k)}};
 const t=makeIsolated('independent-transient',{transientStorage:transient});await t.bootstrap();await login(t,'T');denyTransient=true;
 const gone=await t.signOut(t.capture()!,{remote:false});assert(gone.status==='failed'&&gone.local.status==='applied','partial transient cleanup falsely successful');assert(t.getSnapshot().status==='error','partial cleanup not error');
 assert((await t.reconcile(true)).status==='failed','null active automatically hid unresolved cleanup');t.dispose();denyTransient=false;
 const tReload=makeIsolated('independent-transient');await tReload.bootstrap();assert(tReload.getSnapshot().status==='unauthenticated','revoked transient recovery resurrected T');tReload.dispose();checks.push('successful native revoke with denied transient removal remains partial/error, retry on reopen does not resurrect owner');
 // Consumed server code + failed SDK session write is irrecoverable, never invented.
 let exchanges=0;const callbackFetch:typeof fetch=async(input,init)=>{if(String(input).includes('grant_type=pkce')){exchanges++;if(exchanges>1)return new Response(JSON.stringify({error:'invalid_grant',error_description:'consumed'}),{status:400});}return fixtureFetch(input,init)};
 const cb=makeIsolated('independent-consumed',{fetch:callbackFetch});await cb.bootstrap();const attempt=await cb.startOAuth({provider:'github',redirectTo:location.origin+'/callback'});
 IDBObjectStore.prototype.put=function(value:any,...rest:any[]){const request=nativePut.apply(this,[value,...rest] as any);if(value?.sessionOwner==='Consumed')this.transaction.abort();return request;};
 let result;try{result=await cb.completeCallback({generation:attempt.generation!,code:'Consumed'});}finally{IDBObjectStore.prototype.put=nativePut;}
 assert(result.status==='failed','consumed session write failed but callback applied');assert(exchanges===1,'wrong exchange count');assert(cb.getSnapshot().status==='error','callback persistence failure not error');
 assert(await createAuthGenerationStore({storageKey:'independent-consumed'}).readActive()===null,'invented active after aborted candidate persistence');
 const retry=await cb.completeCallback({generation:attempt.generation!,code:'Consumed'});assert(retry.status==='failed'&&cb.getSnapshot().status==='error','consumed callback fabricated retry success');
 await pause(100);assert((await cb.reconcile(true)).status==='failed','callback error auto-cleared');cb.dispose();const cbReload=makeIsolated('independent-consumed',{fetch:callbackFetch});await cbReload.bootstrap();assert((await cbReload.completeCallback({generation:attempt.generation!,code:'Consumed'})).status==='failed','new coordinator invented consumed callback recovery');assert(cbReload.getSnapshot().status==='error'&&exchanges===1,'new coordinator re-exchanged missing verifier or hid failure');cbReload.dispose();checks.push('server-consumed code plus native session-write abort remains error and never invents authenticated recovery');
 return checks;
}

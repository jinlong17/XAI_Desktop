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
   return {pass:true,checks:[...JSON.parse(sessionStorage.getItem('probe-checks')!),'migrated legacy survives replacements and logout reload stays unauthenticated without replay'],boundary:'Two real Chrome pages, native IDB/sessionStorage/BroadcastChannel, actual SDK and synthetic HTTP. Coordinator only; production host/React UI still unintegrated. Not browser process kill.'};
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
  logoutResponse.resolve();const logout=await outgoing;
  assert(logout.status==='superseded'&&logout.local.status==='applied','old logout result');
  assert(coordinator.capture()?.owner==='B','old logout cleared B snapshot');
  const before=requests;assert((await coordinator.updatePassword(captured,'synthetic')).status==='superseded','stale action accepted');assert(requests===before,'stale action reached network');
  peer!.close();
  const checks=['real second page bootstraps shared active owner','native coordinator BroadcastChannel reconciles new B generation','delayed A SDK logout preserves B snapshot and returns superseded','stale captured action rejected before network'];
  const oauth=await coordinator.startOAuth({provider:'github',redirectTo:location.origin+'/callback',nextPath:'/app'});
  assert(oauth.status==='pending','OAuth start');sessionStorage.setItem('probe-attempt',oauth.generation!);sessionStorage.setItem('probe-checks',JSON.stringify(checks));sessionStorage.setItem('probe-phase','callback');location.reload();
  return null;
 }
 run().then(result=>{if(result)return fetch('/result',{method:'POST',body:JSON.stringify(result)});})
 .catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error),stack:error.stack})}));
}

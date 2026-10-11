import React from '../../../packages/web-auth-device-session/node_modules/react';
import {createRoot} from '../../../packages/web-auth-device-session/node_modules/react-dom/client';
import {createClient, type Session} from '../../../packages/web-auth-device-session/node_modules/@supabase/supabase-js';
import {createAuthSessionStorage} from '../../../packages/web-auth-device-session/src/storage';
import {WebAuthSessionProvider,useWebAuthSession,type WebAuthSessionContextValue} from '../../../packages/web-auth-device-session/src/session';
const authKey='rel06-auth-session';
const config={url:'https://auth-fixture.invalid',anonKey:'synthetic-public-key',storageKey:authKey};
const native=createAuthSessionStorage();
const delay=(ms=50)=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(v:unknown,m:string)=>{if(!v)throw Error('Probe setup: '+m);};
function deferred(){let resolve!:()=>void;const promise=new Promise<void>(yes=>{resolve=yes;});return {promise,resolve};}
function session(id:string):Session{return {access_token:id+'-synthetic-token',refresh_token:id+'-synthetic-refresh',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id,email:id+'@fixture.invalid',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},created_at:'2026-01-01T00:00:00Z'}} as Session;}
let pendingRemove:ReturnType<typeof deferred>|null=null;
let removalStarted:ReturnType<typeof deferred>|null=null;
let failRemoval=false;
let logoutStarted:ReturnType<typeof deferred>|null=null, logoutResponse:ReturnType<typeof deferred>|null=null;
const storage={getItem:(key:string)=>native.getItem(key),setItem:(key:string,value:string)=>native.setItem(key,value),removeItem:async(key:string)=>{if(key===authKey){removalStarted?.resolve();if(failRemoval)throw new DOMException('Synthetic IDB denial','UnknownError');if(pendingRemove)await pendingRemove.promise;}await native.removeItem(key);}};
function client(){return createClient(config.url,config.anonKey,{auth:{storage,storageKey:authKey,flowType:'pkce',persistSession:true,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:async(input,init)=>{const url=String(input);if(url.includes('/logout')){logoutStarted?.resolve();if(logoutResponse)await logoutResponse.promise;return new Response(null,{status:204});}if(!url.includes('/token?grant_type=password'))throw Error('Unexpected network request: '+url);const payload=JSON.parse(String(init?.body));const id=String(payload.email).split('@')[0];return new Response(JSON.stringify({...session(id),user:session(id).user}),{status:200,headers:{'Content-Type':'application/json'}});}}});}
const deviceStore={get:async()=>null,set:async()=>{},clear:async()=>{},ensure:async()=>'synthetic-device'};
let current!:WebAuthSessionContextValue;
function Consumer(){current=useWebAuthSession();return React.createElement('output',{},current.state+':'+(current.session?.user.id??'none'));}
const container=document.createElement('main');document.body.append(container);let root=createRoot(container);
async function mount(sdk:ReturnType<typeof client>){root.render(React.createElement(WebAuthSessionProvider,{client:sdk,config,storage,deviceStore},React.createElement(Consumer)));for(let i=0;i<100;i++){await delay();if(current?.state==='authenticated')return;}throw Error('Provider did not hydrate');}
async function run(){
 await native.setItem(authKey,JSON.stringify(session('A')));const sdk=client();await sdk.auth.initialize();await mount(sdk);assert(current.session?.user.id==='A','initial A');
 // Gate only the async remove entrypoint, delegating all bytes to real IDB/sessionStorage.
 pendingRemove=deferred();removalStarted=deferred();const clearing=current.clearSessionStorage();await removalStarted.promise;
 // Actual SDK password and PKCE writers run while its documented lock name is held.
 const locked=deferred(),releaseLock=deferred();const holding=navigator.locks.request('lock:'+authKey,async()=>{locked.resolve();await releaseLock.promise;});await locked.promise;
 let loginError:unknown;try{const login=await Promise.race([sdk.auth.signInWithPassword({email:'B@fixture.invalid',password:'synthetic'}),delay(3000).then(()=>{throw Error('SDK login unexpectedly waits for lock; revisit contract');})]);loginError=login.error;assert(!loginError,'B synthetic login');await sdk.auth.signInWithOAuth({provider:'github',options:{skipBrowserRedirect:true}});}finally{releaseLock.resolve();await holding;}
 assert(JSON.parse((await native.getItem(authKey))!).user.id==='B','SDK did not persist B');const bVerifier=await native.getItem(authKey+'-code-verifier');assert(!!bVerifier,'SDK did not create new PKCE verifier');await delay();assert(current.session?.user.id==='B','provider did not receive SDK B event');
 pendingRemove.resolve();await clearing;pendingRemove=null;
 const race={sdkWritesWhileSdkLockHeld:true,reactAccount:current.session?.user.id,persistedSession:await native.getItem(authKey),pendingVerifier:await native.getItem(authKey+'-code-verifier')};
 // A failed remove reports success; a fresh SDK/provider instance reloads retained A bytes.
 await sdk.auth.signInWithPassword({email:'A@fixture.invalid',password:'synthetic'});await delay();failRemoval=true;let clearRejected=false;try{await current.clearSessionStorage();}catch{clearRejected=true;}await delay();const afterFailure=current.state;failRemoval=false;root.unmount();root=createRoot(container);const fresh=client();await fresh.auth.initialize();await mount(fresh);
 const reopen={clearRejected,stateImmediatelyAfterClear:afterFailure,restoredAccount:current.session?.user.id};
 // Default SDK signOut also races password login while awaiting its remote response.
 // No delayed storage operation is active in this scenario.
 logoutStarted=deferred();logoutResponse=deferred();const signingOut=fresh.auth.signOut({scope:'local'});await logoutStarted.promise;
 await fresh.auth.signInWithPassword({email:'B@fixture.invalid',password:'synthetic'});await fresh.auth.signInWithOAuth({provider:'github',options:{skipBrowserRedirect:true}});
 assert(JSON.parse((await native.getItem(authKey))!).user.id==='B','SDK signOut fixture did not establish B');logoutResponse.resolve();await signingOut;await delay();
 const sdkSignOutRace={persistedSession:await native.getItem(authKey),pendingVerifier:await native.getItem(authKey+'-code-verifier'),reactAccount:current.session?.user.id??null};

 return {pass:race.persistedSession!==null&&JSON.parse(race.persistedSession).user.id==='B'&&race.pendingVerifier===bVerifier&&clearRejected&&reopen.restoredAccount!=='A'&&sdkSignOutRace.persistedSession!==null,race,reopen,sdkSignOutRace,meaning:'pass=false confirms unresolved correctness defects; network responses are synthetic, storage and SDK are real'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:'FAIL '+error.stack})).finally(()=>root.unmount());

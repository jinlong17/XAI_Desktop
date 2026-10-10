/** Genuine public AuthProvider + production Router/App/Tasks/gates. No private replacements. */
import React,{useEffect,useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router/dom';
import {config,installInstrumentation,seedAccount} from './fixture';
const audit=window.__T06=installInstrumentation();
const {WebAuthSessionProvider,useWebAuthSession}=await import('@repo/web-auth-device-session/web');
const A='t06-account-A',B='t06-account-B';
const session=(id:string)=>({access_token:'synthetic-'+id,refresh_token:'synthetic-refresh-'+id,expires_in:3600,expires_at:2000000000,token_type:'bearer',user:{id,aud:'authenticated',role:'authenticated',email:id+'@invalid.test',app_metadata:{provider:'email'},user_metadata:{},identities:[],created_at:'2026-09-01T00:00:00Z'}});
let current:any=session(A);const listeners=new Set<(event:string,value:any)=>void>();
// Public provider boundary's explicit client prop; actual provider owns auth state and identity invalidation.
const client:any={auth:{getSession:async()=>({data:{session:current},error:null}),onAuthStateChange:(fn:any)=>{listeners.add(fn);return {data:{subscription:{unsubscribe:()=>listeners.delete(fn)}}};},signOut:async()=>{current=null;for(const l of listeners)l('SIGNED_OUT',null);return {error:null};}}};
const storage=await import('@repo/plugin-web-storage');audit.bindScope(storage);
const {invalidateAccountIdentity}=await import('../../../apps/web/src/providers/AccountStorageGate');
for(const id of [A,B]){await seedAccount(id,'g1',id===B||config.variant==='disabled'?'empty':'normal');const prefix='xai:account:v1:'+id+':g1:';for(const [key,value] of Object.entries({xai_pref_lang:config.lang,xai_pref_theme:config.theme??'light',xai_pref_density:config.productDensity??'comfortable',xai_pref_features_tasks:config.variant!=='disabled'}))audit.native.set.call(localStorage,prefix+key,JSON.stringify(value));}
audit.setKey('xai:account:v1:'+A+':g1:xai_task_cols');audit.premount();audit.setPhase('mount');
const {router}=await import('../../../apps/web/src/routes/router');await import('@repo/plugin-web-tokens');await import('../../../apps/web/src/styles/global.css');
function PublicSessionProbe(){const auth=useWebAuthSession();const scope=useSyncExternalStore(storage.accountScope.subscribe,storage.accountScope.capture,storage.accountScope.capture);useEffect(()=>{audit.host={state:auth.state,accountId:auth.session?.user.id??null,scope};audit.publicSetSession=auth.setSession;audit.ready=auth.state!=='loading';},[auth,scope]);return null;}
Object.assign(audit,{hostIdentities:{A,B},switchAccount(id:string|null){if(id!==null&&id!==A&&id!==B)throw Error('Only declared synthetic accounts');current=id?session(id):null;for(const l of listeners)l(id?'SIGNED_IN':'SIGNED_OUT',current);},async revokeGeneration(){const key=storage.generationMarkerKey(A);audit.native.set.call(localStorage,key,JSON.stringify({generation:'g2',migrationId:'t06-revocation',previous:'g1'}));window.dispatchEvent(new StorageEvent('storage',{key,newValue:audit.native.get.call(localStorage,key),storageArea:localStorage,url:location.href}));},oldAction:null,captureOldActions(){const retry=[...document.querySelectorAll('button')].find(e=>e.textContent==='Retry save'||e.textContent==='重试保存');const exp=[...document.querySelectorAll('button')].find(e=>e.textContent==='Export draft'||e.textContent==='导出草稿');this.oldAction={retry,exp};},staleActions(){/* Inspect detached handles; the driver attempts their old coordinates only with trusted CDP input. */return {retryConnected:this.oldAction?.retry?.isConnected??false,exportConnected:this.oldAction?.exp?.isConnected??false};}});
// Production App owns AccountStorageGate; production route objects own route gates and real task registration.
createRoot(document.getElementById('root')!).render(<WebAuthSessionProvider client={client} config={null} onIdentityChange={invalidateAccountIdentity}><PublicSessionProbe/><RouterProvider router={router}/></WebAuthSessionProvider>);

import React from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserRouter,RouterProvider} from 'react-router';
import {accountScope,generationMarkerKey,prefMutationLockName} from './packages/plugin-web-storage/src/index';
import {WebShellProvider,Shell} from './packages/xai-web-shell/src/index';
import {webShellModuleRegistrations} from './apps/web/src/routes/modules/shellRegistrations';
import {composedSettingsRegistration} from './apps/web/src/routes/modules/composedSettingsRegistration';
import {requestSettingsDeparture} from './apps/web/src/routes/modules/settingsDeparture';
import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
const keys=['xai_pref_notif_enabled','xai_pref_notif_done_sound','xai_pref_notif_push_task','xai_pref_notif_push_pomo','xai_pref_notif_push_habit','xai_pref_notif_quiet','xai_pref_notif_quiet_start','xai_pref_notif_quiet_end'];
const activate=(owner:string)=>{nativeSet.call(localStorage,generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));accountScope.activate(accountScope.lock(owner),'g1')};activate('notifications-native-A');
if(nativeGet.call(localStorage,'notif-native-seeded')===null){keys.forEach((k,i)=>nativeSet.call(localStorage,k,['true','subtle','true','true','false','true','22:00','07:00'][i]));nativeSet.call(localStorage,'notif-native-seeded','yes');}
if('__NATIVE_MODE__'==='source'){nativeSet.call(localStorage,keys[6],'25:99');nativeSet.call(localStorage,keys[5],'false');}
const attempts=new Map<string,number>(),failNth=new Map<string,number>();
const writes:Array<{key:string,value:string}>=[],reads:string[]=[];let denied=new Set<string>(),readsDenied=new Set<string>(),denyEverything=false,uncertain:string|null=null,readbackArmed=false;
Storage.prototype.setItem=function(k,v){if(keys.includes(k))attempts.set(k,(attempts.get(k)??0)+1);if(failNth.get(k)===attempts.get(k)&&failNth.has(k))throw new DOMException('quota nth','QuotaExceededError');if(denyEverything||denied.has(k))throw new DOMException('quota','QuotaExceededError');nativeSet.call(this,k,v);if(keys.includes(k))writes.push({key:k,value:v});if(k===uncertain)readbackArmed=true};
Storage.prototype.getItem=function(k){reads.push(k);if(denyEverything||readsDenied.has(k))throw new DOMException('denied','SecurityError');if(k===uncertain&&readbackArmed){readbackArmed=false;throw new DOMException('readback denied','SecurityError')}return nativeGet.call(this,k)};
const Composed=composedSettingsRegistration.children[0]!.render;history.replaceState(null,'','/app/settings/notifications');
const router=createBrowserRouter([{path:'/app',element:<Shell lang="en" setLang={()=>{}} theme="light" setTheme={()=>{}} density="comfortable" setDensity={()=>{}}/>,children:[{path:'settings/*',element:<Composed/>},{path:'dashboard',element:<div>Dashboard destination</div>},{path:'tasks',element:<div>Tasks destination</div>}]}]);
const held=new Map<number,{release:()=>void,done:Promise<unknown>}>();
const app=createRoot(document.getElementById('app')!);
(window as any).verify={instance:crypto.randomUUID(),keys,router,seed:(i:number,value:string)=>nativeSet.call(localStorage,keys[i],value),failWriteNth:(i:number,n:number)=>failNth.set(keys[i],n),attempts:()=>Object.fromEntries(attempts),read:()=>keys.map(k=>nativeGet.call(localStorage,k)),writes:()=>writes.slice(),reads:()=>reads.slice(),deny:(indices=keys.map((_,i)=>i))=>{denied=new Set(indices.map((i:number)=>keys[i]))},denyAll:()=>{denyEverything=true},denyRead:(i:number)=>{readsDenied.add(keys[i])},restore:()=>{denied.clear();readsDenied.clear();denyEverything=false;uncertain=null;readbackArmed=false},uncertain:(i:number)=>{uncertain=keys[i]},activateB:()=>activate('notifications-native-B'),lock:()=>accountScope.lock('notifications-native-locked'),external(i:number,value:string){const oldValue=nativeGet.call(localStorage,keys[i]);nativeSet.call(localStorage,keys[i],value);window.dispatchEvent(new StorageEvent('storage',{key:keys[i],oldValue,newValue:value,storageArea:localStorage}))},async hold(i:number){let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);const done=navigator.locks.request(prefMutationLockName(keys[i]),{mode:'exclusive'},()=>{entered();return gate});held.set(i,{release,done});await ready},async release(i:number){const lock=held.get(i);lock?.release();await lock?.done;held.delete(i)},unmount:()=>app.unmount(),signoutResult:'pending',signout(){void requestSettingsDeparture('sign-out').then(x=>(window as any).verify.signoutResult=x)}};
app.render(<WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={()=>{}}><RouterProvider router={router}/></WebShellProvider>);

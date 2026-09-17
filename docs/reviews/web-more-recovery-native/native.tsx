import React from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserRouter,RouterProvider} from 'react-router';
import {accountScope,generationKey,generationMarkerKey} from './packages/plugin-web-storage/src/index';
import {WebShellProvider,Shell} from './packages/xai-web-shell/src/index';
import {webShellModuleRegistrations} from './apps/web/src/routes/modules/shellRegistrations';
import {composedSettingsRegistration} from './apps/web/src/routes/modules/composedSettingsRegistration';
import {requestSettingsDeparture} from './apps/web/src/routes/modules/settingsDeparture';
import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';

const owner='more-native-A',generation='g1';
const names=['win_type','launch_at_login','minimize_on_launch','date_recognition','remove_date_text','remove_tags','url_parse','default_date','default_rem_due','default_rem_all','default_pri','default_tag','default_list','add_to','overdue_at'];
const accountIndices=new Set([11,12]);
const logicalKeys=names.map(name=>'xai_pref_more_'+name);
const keys=logicalKeys.map((key,index)=>accountIndices.has(index)?generationKey(owner,generation,key):key);
const defaults=['window','false','false','true','false','true','true','none','on_time','none','none','none','inbox','top','top'];
const initial=defaults.slice();
const expected=['tray','true','true','false','true','false','false','today','5min','day_before','high','work','today','bottom','bottom'];
const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem,nativeRemove=Storage.prototype.removeItem;

nativeSet.call(localStorage,generationMarkerKey(owner),JSON.stringify({generation,migrationId:'fixture',previous:null}));
accountScope.activate(accountScope.lock(owner),generation);
if(nativeGet.call(localStorage,'more-native-seeded')===null){
  keys.forEach((key,index)=>nativeSet.call(localStorage,key,initial[index]));
  nativeSet.call(localStorage,'more-native-unrelated','preserve-me');
  nativeSet.call(localStorage,'more-native-seeded','yes');
}

const writes:Array<{key:string,value:string}>=[],removes:string[]=[],reads:string[]=[];
Storage.prototype.setItem=function(key,value){nativeSet.call(this,key,value);if(keys.includes(key))writes.push({key,value});};
Storage.prototype.removeItem=function(key){nativeRemove.call(this,key);if(keys.includes(key))removes.push(key);};
Storage.prototype.getItem=function(key){reads.push(key);return nativeGet.call(this,key);};

history.replaceState(null,'','/app/settings/more');
const Composed=composedSettingsRegistration.children[0]!.render;
const router=createBrowserRouter([{path:'/app',element:<Shell lang="en" setLang={()=>{}} theme="light" setTheme={()=>{}} density="comfortable" setDensity={()=>{}}/>,children:[{path:'settings/*',element:<Composed/>},{path:'dashboard',element:<div>Dashboard destination</div>},{path:'tasks',element:<div>Tasks destination</div>}]}]);
const app=createRoot(document.getElementById('app')!);
(window as any).verify={
  instance:crypto.randomUUID(),names,keys,defaults,initial,expected,router,
  read:()=>keys.map(key=>nativeGet.call(localStorage,key)),
  writes:()=>writes.slice(),removes:()=>removes.slice(),reads:()=>reads.slice(),
  unrelated:()=>nativeGet.call(localStorage,'more-native-unrelated'),
  signoutResult:'pending',
  signout(){void requestSettingsDeparture('sign-out').then(value=>(window as any).verify.signoutResult=value);},
  unmount:()=>app.unmount(),
};
app.render(<WebShellProvider modules={webShellModuleRegistrations} lang="en" railPos="left" petOn={false} setPetOn={()=>{}}><RouterProvider router={router}/></WebShellProvider>);

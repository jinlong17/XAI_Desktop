import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope,generationMarkerKey} from './packages/plugin-web-storage/src/index.ts';
import {prefMutationLockName} from './packages/plugin-web-storage/src/internal/prefMutation.ts';
import {accountLifecycleLockName} from './packages/plugin-web-storage/src/internal/accountCoordination.ts';
import {smartListsPane} from './packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx';
const owner='smart-native';const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function assert(v:unknown,m:string):asserts v{if(!v)throw Error(m);}
async function mount(){const host=document.createElement('main');document.body.append(host);const root=createRoot(host);root.render(smartListsPane.render({lang:'en'}));for(let i=0;i<100&&host.querySelectorAll('select').length!==12;i++)await delay(20);await delay(50);assert(host.querySelectorAll('select').length===12,'12 actual rows missing');return{host,root,selects:()=>[...host.querySelectorAll('select')]};}
function choose(select:HTMLSelectElement,value:string){Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')!.set!.call(select,value);select.dispatchEvent(new Event('change',{bubbles:true}));}
async function run(){
 const initial=new URLSearchParams(location.search).get('phase')==='initial';
 if(initial)localStorage.clear();accountScope.activate(accountScope.lock(owner),'g1');
 if(initial)localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
 const key=accountScope.physicalKey('xai_pref_smart_lists');
 if(!initial){const expected=(window as any).__checkpoint,ui=await mount();try{assert(localStorage.getItem(key)===expected.raw,'Saved map changed after process reopen');assert(ui.selects()[0].value==='hide'&&ui.selects()[1].value==='if-not-empty','Saved map not projected after process reopen');return{pass:true,cases:[{name:'saved-map-and-actual-selects-after-process-reopen',pass:true}],scope:'One saved final account map plus actual re-rendered selections; not durable unsaved drafts'};}finally{ui.root.unmount();ui.host.remove();}}
 const cases:any[]=[];
 for(const name of ['absent-map','held-account','held-key','quota-latest-retry']){
  localStorage.removeItem(key);const before=JSON.stringify({all:'show',today:'show',extension:'future-value'});if(name!=='absent-map')localStorage.setItem(key,before);
  const ui=await mount();let release:(()=>void)|undefined,held:Promise<unknown>|undefined;const native=Storage.prototype.setItem;
  try{
   if(name==='absent-map'){assert(localStorage.getItem(key)===null,'Mount seeded map');assert(ui.selects().every(s=>s.value==='show'),'Sparse missing-row fallback changed');cases.push({name,pass:true});continue;}
   if(name==='quota-latest-retry'){
    Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('quota','QuotaExceededError');native.call(this,k,v)};
    choose(ui.selects()[0],'hide');await delay(60);choose(ui.selects()[1],'if-not-empty');await delay(80);
    assert(localStorage.getItem(key)===before,'Quota changed physical map');assert(ui.selects()[0].value==='hide'&&ui.selects()[1].value==='if-not-empty','Latest failed selections were lost');assert(ui.host.querySelector('[role=alert]'),'Failure recovery alert missing');
    Storage.prototype.setItem=native;const retry=[...ui.host.querySelectorAll('button')].find(b=>/retry/i.test(b.textContent??''));assert(retry,'Actual Retry missing');retry.click();
    for(let i=0;i<100&&localStorage.getItem(key)===before;i++)await delay(20);
    assert(localStorage.getItem(key)===JSON.stringify({all:'hide',today:'if-not-empty',extension:'future-value'}),'Retry did not retain combined choices and extension');cases.push({name,pass:true});continue;
   }
   let entered!:()=>void;const ready=new Promise<void>(r=>entered=r),gate=new Promise<void>(r=>release=r);held=navigator.locks.request(name==='held-account'?accountLifecycleLockName(owner):prefMutationLockName(key),{mode:'exclusive'},async()=>{entered();await gate});await ready;
   choose(ui.selects()[0],'hide');await delay(80);assert(localStorage.getItem(key)===before,'Actual choice wrote before '+name+' release');assert(ui.selects()[0].value==='hide','Pending choice missing');release!();await held;for(let i=0;i<100&&localStorage.getItem(key)===before;i++)await delay(20);
   assert(JSON.parse(localStorage.getItem(key)!).all==='hide','Choice did not save after release');cases.push({name,pass:true});
  }catch(e){cases.push({name,pass:false,error:String(e)});}finally{Storage.prototype.setItem=native;release?.();await held;ui.root.unmount();ui.host.remove();}
 }
 return{pass:cases.every(c=>c.pass),cases,checkpoint:{raw:localStorage.getItem(key)},scope:'Actual Smart Lists pane handlers, native Web Locks, isolated complete synthetic account; CSS omitted; four representative controls not full12 producer acceptance'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

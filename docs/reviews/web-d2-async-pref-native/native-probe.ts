import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope,generationMarkerKey} from './packages/plugin-web-storage/src/index.ts';
import {accountLifecycleLockName} from './packages/plugin-web-storage/src/internal/accountCoordination.ts';
import {collaboratePane} from './packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx';
const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function assert(v:unknown,message:string):asserts v{if(!v)throw Error(message);}
async function run(){
 const cases:any[]=[];const checkpoint:Record<string,any>={};const initial=new URLSearchParams(location.search).get('phase')==='initial';
 if(initial)localStorage.clear();
 for(const name of ['held-account-lock','quota-retains-latest-draft']){
  const owner='async-pref-native-'+name,key=accountScope.physicalKey('xai_pref_collab_default_share',accountScope.activate(accountScope.lock(owner),'g1'));
  if(!initial){try{assert(localStorage.getItem(key)===(window as any).__checkpoint[name].raw,'Reopened preference changed');cases.push({name,pass:true});}catch(e){cases.push({name,pass:false,error:String(e)});}continue;}
  localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));localStorage.setItem(key,'comment');
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);let release:(()=>void)|undefined,held:Promise<unknown>|undefined;
  const native=Storage.prototype.setItem;let rejected=0;
  try{
   root.render(collaboratePane.render({lang:'en'} as any));for(let i=0;i<100&&!host.querySelector('select');i++)await delay(20);
   const select=host.querySelector('select')!;assert(select,'Actual Collaborate select missing');
   if(name==='held-account-lock'){let entered!:()=>void;const started=new Promise<void>(r=>entered=r),gate=new Promise<void>(r=>release=r);held=navigator.locks.request(accountLifecycleLockName(owner),{mode:'exclusive'},async()=>{entered();await gate;});await started;}
   else Storage.prototype.setItem=function(k,v){if(k===key){rejected++;throw new DOMException('native quota','QuotaExceededError');}native.call(this,k,v);};
   Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')!.set!.call(select,'edit');select.dispatchEvent(new Event('change',{bubbles:true}));await delay(100);
   assert(localStorage.getItem(key)==='comment','UI write bypassed an actually held account lifecycle lock or fault');
   if(name==='quota-retains-latest-draft')assert(rejected>0,'Quota probe did not reach actual preference write');
   assert(select.value==='edit','Latest selection was lost instead of retained for recovery');
   if(name==='held-account-lock'){
    assert(/saving/i.test(host.textContent||''),'Pending save has no visible Saving state');release!();await held;
    for(let i=0;i<100&&localStorage.getItem(key)!=='edit';i++)await delay(20);
   }else{
    assert(rejected>0,'Quota probe did not reach actual preference write');assert(/not saved/i.test(host.textContent||''),'Failed save has no visible Not saved state');
    Storage.prototype.setItem=native;const retry=[...host.querySelectorAll('button')].find(b=>/retry/i.test(b.textContent||''));assert(retry,'Retry action unavailable');retry.click();
    for(let i=0;i<100&&localStorage.getItem(key)!=='edit';i++)await delay(20);
   }
   assert(localStorage.getItem(key)==='edit'&&select.value==='edit','Save/retry did not commit latest physical string');checkpoint[name]={raw:'edit'};cases.push({name,pass:true});
  }catch(e){cases.push({name,pass:false,error:String(e)});}finally{Storage.prototype.setItem=native;release?.();await held;root.unmount();host.remove();}
 }
 return {pass:cases.every(c=>c.pass),cases,...(initial?{checkpoint}:{}),scope:'Actual Collaborate select, native account WebLocks and physical preference string in isolated synthetic profile; no other settings or full writer activation claim'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

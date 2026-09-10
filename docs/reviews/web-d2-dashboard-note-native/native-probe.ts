import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope,generationMarkerKey} from './packages/plugin-web-storage/src/index.ts';
import {accountLifecycleLockName} from './packages/plugin-web-storage/src/internal/accountCoordination.ts';
import {DashHeader} from './packages/xai-web-dashboard-grid/src/DashHeader.tsx';
const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function assert(value:unknown,message:string):asserts value{if(!value)throw Error(message);}
async function until(check:()=>boolean,message:string){for(let i=0;i<100;i++){if(check())return;await delay(20);}throw Error(message);}
function button(host:HTMLElement,name:string){const b=[...host.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===name||b.textContent?.trim()===name);assert(b,'Missing button: '+name);return b;}
function type(host:HTMLElement,value:string){const input=host.querySelector('input');assert(input,'Missing note editor');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));}
async function run(){
 const initial=new URLSearchParams(location.search).get('phase')==='initial';
 if(initial)localStorage.clear();
 const cases:any[]=[],checkpoint:Record<string,{raw:string|null}>={};
 for(const name of ['held-account-lock','absent-no-mount-write','quota-latest-retry','readback-uncertain']){
  const owner='dashboard-note-native-'+name;
  accountScope.activate(accountScope.lock(owner),'g1');
  const key=accountScope.physicalKey('xai_pref_dashboard_header_note');
  if(!initial){try{assert(localStorage.getItem(key)===(window as any).__checkpoint[name].raw,'Saved account note differs after process reopen');cases.push({name,pass:true});}catch(error){cases.push({name,pass:false,error:String(error)});}continue;}
  localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
  if(name!=='absent-no-mount-write')localStorage.setItem(key,'Original note');
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
  const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;let writes=0,armed=false;let failures=0,release:(()=>void)|undefined,held:Promise<unknown>|undefined;
  try{
   root.render(<DashHeader lang="en" now={new Date('2026-09-09T10:00:00Z')}/>);
   await until(()=>Boolean(host.querySelector('[aria-label="Edit dashboard note"]')),'Header failed to render');
   if(name==='absent-no-mount-write'){
    await delay(80);assert(localStorage.getItem(key)===null,'Mount wrote absent account note');
    button(host,'Edit dashboard note').click();await delay(30);type(host,'Only a draft');await delay(30);
    assert(localStorage.getItem(key)===null,'Typing persisted without explicit submission');
    checkpoint[name]={raw:null};cases.push({name,pass:true});continue;
   }
   if(name==='held-account-lock'){
    let entered!:()=>void;const ready=new Promise<void>(r=>entered=r),gate=new Promise<void>(r=>release=r);
    held=navigator.locks.request(accountLifecycleLockName(owner),{mode:'exclusive'},async()=>{entered();await gate;});await ready;
   }else if(name==='readback-uncertain'){Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(k===key){writes++;armed=true;}};Storage.prototype.getItem=function(k){if(k===key&&armed){armed=false;failures++;throw new DOMException('probe readback fault','SecurityError');}return nativeGet.call(this,k);};}else Storage.prototype.setItem=function(k,v){if(k===key){failures++;throw new DOMException('probe quota','QuotaExceededError');}nativeSet.call(this,k,v);};
   button(host,'Edit dashboard note').click();await delay(30);type(host,'Submitted note');await delay(30);button(host,'Save dashboard note').click();await delay(80);
   if(name==='readback-uncertain'){
    assert(failures>0&&nativeGet.call(localStorage,key)==='Submitted note','Uncertain probe did not fail after physical write');
    assert(host.querySelector('input')?.value==='Submitted note','Uncertain write closed editor or lost draft');
    Storage.prototype.getItem=nativeGet;button(host,'Retry note save').click();
    await until(()=>!host.querySelector('input'),'Uncertain unchanged retry did not reconcile and close editor');
    assert(writes===1,'Uncertain retry wrote the note again');assert(nativeGet.call(localStorage,key)==='Submitted note','Retry changed physical intent');
    checkpoint[name]={raw:'Submitted note'};cases.push({name,pass:true});continue;
   }
   assert(localStorage.getItem(key)==='Original note','Save wrote before lock release or despite fault');
   assert(host.querySelector('input')?.value==='Submitted note','Pending/failed save lost editable draft');
   if(name==='held-account-lock'){
    release!();await held;await until(()=>localStorage.getItem(key)==='Submitted note','Save did not commit after lock release');
    await until(()=>!host.querySelector('input'),'Successful unchanged submission did not close editor');
    checkpoint[name]={raw:'Submitted note'};
   }else{
    assert(failures>0,'Quota fault never reached actual note write');type(host,'Latest recovery note');await delay(30);
    assert(host.querySelector('input')?.value==='Latest recovery note','Latest failed draft was replaced');
    Storage.prototype.setItem=nativeSet;button(host,'Retry note save').click();
    await until(()=>localStorage.getItem(key)==='Latest recovery note','Retry failed to save latest draft');
    await until(()=>!host.querySelector('input'),'Verified latest retry did not close editor');
    checkpoint[name]={raw:'Latest recovery note'};
   }
   cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}finally{Storage.prototype.setItem=nativeSet;Storage.prototype.getItem=nativeGet;release?.();await held;root.unmount();host.remove();}
 }
 return {pass:cases.every(c=>c.pass),cases,...(initial?{checkpoint}:{}),scope:'Actual DashHeader, native account WebLocks and synthetic physical account notes; device offset protocol unchanged; CSS omitted, not visual acceptance'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

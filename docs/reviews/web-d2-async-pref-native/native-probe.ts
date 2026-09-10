import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope,generationMarkerKey,generationKey,mutatePref} from './packages/plugin-web-storage/src/index.ts';
import {prefMutationLockName} from './packages/plugin-web-storage/src/internal/prefMutation.ts';
import {accountLifecycleLockName} from './packages/plugin-web-storage/src/internal/accountCoordination.ts';
import {collaboratePane} from './packages/plugin-web-settings-rest/src/panes/collaboratePane.tsx';
const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function assert(v:unknown,message:string):asserts v{if(!v)throw Error(message);}
async function run(){
 const cases:any[]=[];const checkpoint:Record<string,any>={};const initial=new URLSearchParams(location.search).get('phase')==='initial';
 if(initial)localStorage.clear();
 for(const name of ['held-account-lock','quota-retains-latest-draft','two-document-functional','account-switch-pending','readback-uncertain']){
  const owner='async-pref-native-'+name,key=accountScope.physicalKey(name==='two-document-functional'?'xai_pref_native_counter':'xai_pref_collab_default_share',accountScope.activate(accountScope.lock(owner),'g1'));
  if(!initial){try{assert(localStorage.getItem(key)===(window as any).__checkpoint[name].raw,'Reopened preference changed');const extra=(window as any).__checkpoint[name];if(extra.extraKey)assert(localStorage.getItem(extra.extraKey)===extra.extraRaw,'Other account changed after reopen');cases.push({name,pass:true});}catch(e){cases.push({name,pass:false,error:String(e)});}continue;}
  localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));localStorage.setItem(key,'comment');
  if(name==='two-document-functional'){
   localStorage.setItem(key,'0');let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),started=new Promise<void>(r=>entered=r);
   const held=navigator.locks.request(prefMutationLockName(key),{mode:'exclusive'},async()=>{entered();await gate;});await started;
   const frame=document.createElement('iframe');frame.src='/?phase=worker';let ready!:()=>void,childStarted!:()=>void,done!:(v:any)=>void;const readyP=new Promise<void>(r=>ready=r),childStartedP=new Promise<void>(r=>childStarted=r),doneP=new Promise<any>(r=>done=r);
   const listener=(event:MessageEvent)=>{if(event.source!==frame.contentWindow)return;if(event.data.type==='ready')ready();if(event.data.type==='started')childStarted();if(event.data.type==='done')done(event.data);};window.addEventListener('message',listener);document.body.append(frame);
   try{await readyP;let calls=0;const first=mutatePref({key:'xai_pref_native_counter',codec:'json',defaultValue:0,validate:(v:unknown):v is number=>typeof v==='number',scope:accountScope.capture(),next:(v:number)=>{calls++;return v+1;}});
    frame.contentWindow!.postMessage({type:'increment',owner},location.origin);await childStartedP;await delay(100);assert(localStorage.getItem(key)==='0','Native key lock did not hold both document writes');release();await held;
    const [a,b]=await Promise.all([first,doneP]);assert(a.ok&&b.result?.ok,'A participating document failed');assert(calls===1&&b.calls===1,'Functional updater repeated');assert(localStorage.getItem(key)==='2','Two document increments lost an update');checkpoint[name]={raw:'2'};cases.push({name,pass:true});
   }catch(e){cases.push({name,pass:false,error:String(e)});}finally{release();await held;window.removeEventListener('message',listener);frame.remove();}continue;
  }
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);let release:(()=>void)|undefined,held:Promise<unknown>|undefined;
  const native=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;let rejected=0,writes=0;
  try{
   root.render(collaboratePane.render({lang:'en'} as any));for(let i=0;i<100&&!host.querySelector('select');i++)await delay(20);
   const select=host.querySelector('select')!;assert(select,'Actual Collaborate select missing');
   if(name==='held-account-lock'||name==='account-switch-pending'){let entered!:()=>void;const started=new Promise<void>(r=>entered=r),gate=new Promise<void>(r=>release=r);held=navigator.locks.request(accountLifecycleLockName(owner),{mode:'exclusive'},async()=>{entered();await gate;});await started;}
   else if(name==='readback-uncertain'){let armed=false;Storage.prototype.setItem=function(k,v){native.call(this,k,v);if(k===key){writes++;armed=true;}};Storage.prototype.getItem=function(k){if(k===key&&armed){armed=false;rejected++;throw new DOMException('native readback unavailable','SecurityError');}return nativeGet.call(this,k);};}
   else Storage.prototype.setItem=function(k,v){if(k===key){rejected++;throw new DOMException('native quota','QuotaExceededError');}native.call(this,k,v);};
   Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')!.set!.call(select,'edit');select.dispatchEvent(new Event('change',{bubbles:true}));await delay(100);
   if(name==='readback-uncertain'){
    assert(rejected>0&&nativeGet.call(localStorage,key)==='edit','Uncertain probe did not fail after a physical write');assert(select.value==='edit','Uncertain write lost latest draft');assert(/not saved/i.test(host.textContent||''),'Uncertain write claimed success');
    Storage.prototype.getItem=nativeGet;const retry=[...host.querySelectorAll('button')].find(b=>/retry/i.test(b.textContent||''));assert(retry,'Uncertain write has no Retry');retry.click();
    for(let i=0;i<100&&host.querySelector('[role=status]')?.textContent?.trim()!=='Saved';i++)await delay(20);
    assert(host.querySelector('[role=status]')?.textContent?.trim()==='Saved','Retry did not reconcile already-written value into Saved');assert(writes===1,'Uncertain retry duplicated the physical write');assert(nativeGet.call(localStorage,key)==='edit','Retry altered intended persisted value');checkpoint[name]={raw:'edit'};cases.push({name,pass:true});continue;
   }
   assert(localStorage.getItem(key)==='comment','UI write bypassed an actually held account lifecycle lock or fault');
   if(name==='quota-retains-latest-draft')assert(rejected>0,'Quota probe did not reach actual preference write');
   assert(select.value==='edit','Latest selection was lost instead of retained for recovery');
   if(name==='account-switch-pending'){
    const b=owner+'-B';localStorage.setItem(generationMarkerKey(b),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
    const actualBKey=generationKey(b,'g1','xai_pref_collab_default_share');localStorage.setItem(actualBKey,'view');
    accountScope.activate(accountScope.lock(b),'g1');await delay(100);
    assert(select.value==='view','Pending A draft remained visible after switching to B');
    const device=host.querySelector('button[role="switch"]') as HTMLButtonElement|null;assert(device,'Device toggle unavailable');const old=device.getAttribute('aria-checked');device.click();await delay(50);assert(device.getAttribute('aria-checked')!==old,'Device toggle blocked by A account lock');
    release!();await held;await delay(100);
    assert(localStorage.getItem(key)==='comment'&&localStorage.getItem(actualBKey)==='view','Old save crossed account boundary');assert(select.value==='view','Old completion changed B selection');checkpoint[name]={raw:'comment',extraKey:actualBKey,extraRaw:'view'};cases.push({name,pass:true});continue;
   }
   if(name==='held-account-lock'){
    assert(/saving/i.test(host.textContent||''),'Pending save has no visible Saving state');release!();await held;
    for(let i=0;i<100&&localStorage.getItem(key)!=='edit';i++)await delay(20);
   }else{
    assert(rejected>0,'Quota probe did not reach actual preference write');assert(/not saved/i.test(host.textContent||''),'Failed save has no visible Not saved state');
    Storage.prototype.setItem=native;const retry=[...host.querySelectorAll('button')].find(b=>/retry/i.test(b.textContent||''));assert(retry,'Retry action unavailable');retry.click();
    for(let i=0;i<100&&localStorage.getItem(key)!=='edit';i++)await delay(20);
   }
   assert(localStorage.getItem(key)==='edit'&&select.value==='edit','Save/retry did not commit latest physical string');checkpoint[name]={raw:'edit'};cases.push({name,pass:true});
  }catch(e){cases.push({name,pass:false,error:String(e)});}finally{Storage.prototype.setItem=native;Storage.prototype.getItem=nativeGet;release?.();await held;root.unmount();host.remove();}
 }
 return {pass:cases.every(c=>c.pass),cases,...(initial?{checkpoint}:{}),scope:'Actual Collaborate select, native account WebLocks and physical preference string in isolated synthetic profile; no other settings or full writer activation claim'};
}
if(new URLSearchParams(location.search).get('phase')==='worker'){
 window.addEventListener('message',async event=>{if(event.source!==parent||event.origin!==location.origin||event.data.type!=='increment')return;const scope=accountScope.activate(accountScope.lock(event.data.owner),'g1');let calls=0;parent.postMessage({type:'started'},location.origin);
 try{const result=await mutatePref({key:'xai_pref_native_counter',codec:'json',defaultValue:0,validate:(v:unknown):v is number=>typeof v==='number',scope,next:(v:number)=>{calls++;return v+1;}});parent.postMessage({type:'done',result,calls},location.origin);}catch(error){parent.postMessage({type:'done',error:String(error),calls},location.origin);}
 });parent.postMessage({type:'ready'},location.origin);
}else run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

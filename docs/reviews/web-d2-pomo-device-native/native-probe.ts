import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope,generationMarkerKey} from './packages/plugin-web-storage/src/index.ts';
import {prefMutationLockName} from './packages/plugin-web-storage/src/internal/prefMutation.ts';
import {PomodoroModule} from './packages/plugin-web-pomodoro/src/PomodoroModule.tsx';
const defaults={pomodoro_preset:'focus-25',pomodoro_custom_minutes:45,pomodoro_display_style:'apple',pomodoro_theme:'coral',pomodoro_sound:'soft-chime',pomodoro_muted:false};
const keys=Object.keys(defaults).map(k=>'xai_pref_'+k);
const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function assert(value:unknown,message:string):asserts value{if(!value)throw Error(message);}
const snapshot=()=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));
async function run(){
 const initial=new URLSearchParams(location.search).get('phase')==='initial';
 if(!initial){const actual=snapshot(),expected=(window as any).__checkpoint.snapshot;return {pass:JSON.stringify(actual)===JSON.stringify(expected),cases:[{name:'six-device-keys-after-process-reopen',pass:JSON.stringify(actual)===JSON.stringify(expected),actual,expected}],scope:'Final saved six-key device checkpoint after process reopen; not six independent cases or unsaved draft recovery'};}
 localStorage.clear();const owner='pomo-native-device';accountScope.activate(accountScope.lock(owner),'g1');localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
 const cases:any[]=[];
 for(const name of ['absent-six-keys','held-device-mute']){
  for(const key of keys)localStorage.removeItem(key);
  if(name==='held-device-mute')for(const [suffix,value] of Object.entries(defaults))localStorage.setItem('xai_pref_'+suffix,JSON.stringify(value));
  const host=document.createElement('div');document.body.append(host);const root=createRoot(host);let release:(()=>void)|undefined,held:Promise<unknown>|undefined;
  try{
   root.render(<PomodoroModule lang="en"/>);for(let i=0;i<100&&!host.querySelector('[data-testid="mute-btn"]');i++)await delay(20);await delay(50);
   const mute=host.querySelector('[data-testid="mute-btn"]') as HTMLButtonElement|null;assert(mute,'Actual Pomodoro mute control missing');
   if(name==='absent-six-keys'){const values=snapshot();assert(Object.values(values).every(v=>v===null),'Mount seeded device preferences: '+JSON.stringify(values));cases.push({name,pass:true});continue;}
   const key='xai_pref_pomodoro_muted';let entered!:()=>void;const ready=new Promise<void>(r=>entered=r),gate=new Promise<void>(r=>release=r);held=navigator.locks.request(prefMutationLockName(key),{mode:'exclusive'},async()=>{entered();await gate;});await ready;
   const sessionKey=accountScope.physicalKey('xai_pomodoro_sessions'),activeKey=accountScope.physicalKey('xai_pomodoro_active');const sessionRaw=localStorage.getItem(sessionKey),activeRaw=localStorage.getItem(activeKey);
   mute.click();await delay(80);assert(localStorage.getItem(key)==='false','Mute wrote while native device lock was held');release!();await held;
   for(let i=0;i<100&&localStorage.getItem(key)!=='true';i++)await delay(20);
   assert(localStorage.getItem(key)==='true','Mute did not save after native lock release');assert(localStorage.getItem(sessionKey)===sessionRaw&&localStorage.getItem(activeKey)===activeRaw,'Idle account timer bytes changed during device toggle');cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}finally{release?.();await held;root.unmount();host.remove();}
 }
 return {pass:cases.every(c=>c.pass),cases,checkpoint:{snapshot:snapshot()},scope:'Actual Pomodoro preferences, real native Web Locks, isolated synthetic account, idle timer byte controls only; CSS omitted'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

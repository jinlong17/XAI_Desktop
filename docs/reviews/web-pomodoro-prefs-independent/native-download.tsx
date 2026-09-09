import React from 'react';import{createRoot}from'react-dom/client';
import{accountScope}from'../../../packages/plugin-web-storage/src/index';
import{PomodoroModule}from'../../../packages/plugin-web-pomodoro/src/PomodoroModule';
accountScope.activate(accountScope.lock('fixture-A'),'A');
const suffixes=['preset','custom_minutes','display_style','theme','sound','muted'];
const keys=suffixes.map(s=>accountScope.physicalKey('xai_pref_pomodoro_'+s));
const original=Storage.prototype.setItem;let denied:string[]=[],writes:string[]=[];let blocked=false;
Storage.prototype.setItem=function(k,v){if(keys.includes(k)){writes.push(k);if(blocked){denied.push(k);throw new DOMException('Synthetic quota','QuotaExceededError');}}return original.call(this,k,v);};
const delay=(ms=100)=>new Promise(r=>setTimeout(r,ms));const assert=(v:unknown,m:string)=>{if(!v)throw Error(m);};
const el=(id:string)=>document.querySelector('[data-testid="'+id+'"]')as HTMLElement;
async function click(id:string){assert(el(id),'missing '+id);el(id).click();await delay();}
async function button(name:string){const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.trim()===name);assert(b,'missing '+name);b!.click();await delay();}
async function fill(id:string,v:string){const n=el(id);Object.getOwnPropertyDescriptor(n instanceof HTMLSelectElement?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value')!.set!.call(n,v);n.dispatchEvent(new Event(n instanceof HTMLSelectElement?'change':'input',{bubbles:true}));await delay();}
const raw=()=>keys.map(k=>localStorage.getItem(k));const alert=()=>document.body.innerText.includes('Some preferences were not saved');
async function run(){createRoot(document.getElementById('root')!).render(<PomodoroModule lang="en"/>);await delay(600);assert(raw().every(x=>x!==null),'defaults not persisted');const before=raw();blocked=true;
await click('preset-custom');await fill('custom-minutes-input','52');await click('style-ring');await click('theme-blue');await fill('sound-select','bell');await click('mute-btn');
const initial={sixFailurePaths:new Set(denied).size===6,originalBytesPreserved:JSON.stringify(raw())===JSON.stringify(before),visibleFailure:alert(),retryVisible:document.body.innerText.includes('Retry preferences'),exportVisible:document.body.innerText.includes('Export current preferences')};
if(!Object.values(initial).every(Boolean))return{pass:false,initial};
await fill('custom-minutes-input','61');await click('style-digital');await click('theme-violet');await fill('sound-select','digital');
const originalURL=URL.createObjectURL;URL.createObjectURL=()=>{throw new Error('Synthetic export creation failure');};
await button('Export current preferences');assert(document.body.innerText.includes('Preference export failed. Please retry.'),'export failure invisible');
URL.createObjectURL=originalURL;await button('Export current preferences');assert(!document.body.innerText.includes('Preference export failed. Please retry.'),'export failure not cleared');
const download=await(await fetch('/download-check')).json();assert(download.pass,'actual downloaded JSON mismatch '+JSON.stringify(download));return{pass:true,initial,exportFailureVisible:true,...download};}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error),denied})}));

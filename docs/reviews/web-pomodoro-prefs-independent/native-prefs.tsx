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
let blob:Blob|undefined;const oldURL=URL.createObjectURL;URL.createObjectURL=v=>{blob=v as Blob;return oldURL(v);};HTMLAnchorElement.prototype.click=function(){};
await button('Export current preferences');const exported=JSON.parse(await blob!.text());assert(JSON.stringify(exported.values)===JSON.stringify({preset:'custom',customMinutes:61,displayStyle:'digital',theme:'violet',sound:'digital',muted:true}),'latest export mismatch '+JSON.stringify(exported));
blocked=false;await button('Retry preferences');assert(!alert(),'retry failure remains');const stored=raw().map(x=>JSON.parse(x!));assert(JSON.stringify(stored)===JSON.stringify(['custom',61,'digital','violet','digital',true]),'latest retry mismatch '+JSON.stringify(stored));
await click('start-btn');await delay(300);const activeKey=accountScope.physicalKey('xai_pomodoro_active'),historyKey=accountScope.physicalKey('xai_pomodoro_sessions');const active=localStorage.getItem(activeKey),history=localStorage.getItem(historyKey);assert(active&&JSON.parse(active).status!=='idle','active session missing');
blocked=true;await click('theme-rose');assert(alert(),'active pref failure invisible');assert(localStorage.getItem(activeKey)===active&&localStorage.getItem(historyKey)===history,'pref failure changed timer bytes');
blocked=false;writes=[];await button('Retry preferences');assert(writes.length===1&&writes[0]===keys[3],'retry rewrote successful preferences '+JSON.stringify(writes));assert(localStorage.getItem(activeKey)===active&&localStorage.getItem(historyKey)===history,'pref retry changed timer bytes');
return{pass:true,initial,exported,checks:['Six native quota paths preserve original preference bytes','Latest six values exported through actual Blob and retried to native Storage','Running timer active/history bytes unchanged by preference failure and retry','Single failed theme retry writes only theme']};}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error),denied})}));

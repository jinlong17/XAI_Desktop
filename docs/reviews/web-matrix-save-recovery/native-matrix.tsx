import React from 'react';
import { createRoot } from 'react-dom/client';
import { accountScope } from '../../../packages/plugin-web-storage/src/index';
import { MatrixModule } from '../../../packages/xai-web-matrix/src/MatrixModule';
import { onWebEvent } from '../../../packages/xai-web-event-bus/src/index';
accountScope.activate(accountScope.lock('fixture-A'),'A');const physical=accountScope.physicalKey('xai_matrix_state');
const original={schemaVersion:1,q1:[{id:'original',title:{en:'Original A',zh:'Original A'}}],q2:[],q3:[],q4:[]};localStorage.setItem(physical,JSON.stringify(original));
let events=0;onWebEvent('web:matrix:priority-tagged',()=>events++);
createRoot(document.getElementById('root')!).render(<MatrixModule lang="en"/>);
const delay=(ms=30)=>new Promise(resolve=>setTimeout(resolve,ms));async function waitFor(check:()=>boolean){for(let i=0;i<200;i++){if(check())return;await delay();}throw Error('UI timeout '+document.body.innerText.slice(0,150));}
async function run(){
 await waitFor(()=>!!document.querySelector('.module-head button'));(document.querySelector('.module-head button')as HTMLButtonElement).click();await waitFor(()=>!!document.querySelector('dialog[open]'));
 const input=document.querySelector('.matrix-composer__input')as HTMLInputElement;Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'Unsaved Matrix draft');input.dispatchEvent(new Event('input',{bubbles:true}));await delay();
 const set=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key===physical)throw new DOMException('Synthetic quota','QuotaExceededError');return set.call(this,key,value);};
 (document.querySelector('.matrix-composer__btn--primary')as HTMLButtonElement).click();await delay();
 const result={dialogRetained:!!document.querySelector('dialog[open]'),draftRetained:input.value==='Unsaved Matrix draft',errorVisible:!!document.querySelector('[role=alert]'),originalBytesPreserved:localStorage.getItem(physical)===JSON.stringify(original),falseEvents:0};
 const card=document.querySelector('[data-card-id=original]')!;card.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',ctrlKey:true,bubbles:true}));await delay();result.falseEvents=events;
 Storage.prototype.setItem=set;
 const originalOracle=result.dialogRetained&&result.draftRetained&&result.errorVisible&&result.originalBytesPreserved&&result.falseEvents===0;
 if(!originalOracle){await fetch('/result',{method:'POST',body:JSON.stringify({pass:false,...result})});return;}
 const assert=(value:unknown,message:string)=>{if(!value)throw Error(message);};
 const click=async(name:string)=>{const node=[...document.querySelectorAll('button')].find(button=>button.textContent?.trim()===name)!;assert(node,'missing '+name);node.click();await delay();};
 Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'Latest Matrix draft');input.dispatchEvent(new Event('input',{bubbles:true}));await delay();
 HTMLAnchorElement.prototype.click=function(){}; // Inspect generated export bytes without writing user Downloads.
 let exported:Blob|undefined;const makeUrl=URL.createObjectURL;URL.createObjectURL=value=>{exported=value as Blob;return makeUrl(value);};await click('Export draft');
 assert(JSON.parse(await exported!.text()).latestDraft.title==='Latest Matrix draft','export missed latest editor text');
 await click('Retry save');assert(!document.querySelector('dialog[open]'),'retry did not close');const created=JSON.parse(localStorage.getItem(physical)!);assert(created.q1.length===2&&created.q1[1].title.en==='Latest Matrix draft','latest draft not saved exactly once');
 Storage.prototype.setItem=function(key,value){if(key===physical)throw new DOMException('Synthetic quota','QuotaExceededError');return set.call(this,key,value);};
 card.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',ctrlKey:true,bubbles:true}));await delay();assert(events===0,'failed move emitted');assert(JSON.parse(localStorage.getItem(physical)!).q1[0].id==='original','failed move changed data');
 Storage.prototype.setItem=set;await click('Retry save');assert(events===1&&JSON.parse(localStorage.getItem(physical)!).q2[0].id==='original','move retry did not save and emit once');
 (document.querySelector('.module-head button')as HTMLButtonElement).click();await waitFor(()=>!!document.querySelector('dialog[open]'));
 Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'Private A draft');input.dispatchEvent(new Event('input',{bubbles:true}));await delay();
 Storage.prototype.setItem=function(key,value){if(key===physical)throw new DOMException('Synthetic quota','QuotaExceededError');return set.call(this,key,value);};(document.querySelector('.matrix-composer__btn--primary')as HTMLButtonElement).click();await delay();Storage.prototype.setItem=set;
 const aBytes=localStorage.getItem(physical);accountScope.activate(accountScope.lock('fixture-B'),'B');const bKey=accountScope.physicalKey('xai_matrix_state'),bBytes=localStorage.getItem(bKey);exported=undefined;
 await click('Retry save');await click('Export draft');assert(!exported&&localStorage.getItem(physical)===aBytes&&localStorage.getItem(bKey)===bBytes,'old A draft crossed account');assert(document.body.innerText.includes('Export failed'),'blocked export invisible');
 await fetch('/result',{method:'POST',body:JSON.stringify({pass:true,...result,checks:['Original native quota retains dialog/draft and shows failure','Latest edited draft exported and saved once on retry','Failed native keyboard move emits zero events; confirmed retry emits once','Old A draft retry/export cannot write or leak into B']})});
}
run().catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

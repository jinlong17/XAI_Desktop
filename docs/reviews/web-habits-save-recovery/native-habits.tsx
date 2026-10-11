import React from 'react';
import {createRoot} from 'react-dom/client';
import {accountScope} from '../../../packages/plugin-web-storage/src/index';
import {HabitsModule} from '../../../packages/xai-web-habits/src/HabitsModule';
import {onWebEvent} from '../../../packages/xai-web-event-bus/src/index';
accountScope.activate(accountScope.lock('fixture-A'),'A');const key=accountScope.physicalKey('xai_habits_state');
const initial={schemaVersion:1,habits:['First','Second'].map((name,i)=>({id:'h'+i,emoji:'🌱',title:{en:name,zh:name},createdAt:'2026-01-01T00:00:00.000Z'})),checkIns:{},diaries:{}};
localStorage.setItem(key,JSON.stringify(initial));const originalSet=Storage.prototype.setItem;
const root=createRoot(document.getElementById('root')!);let events=0;onWebEvent('web:habits:checkin-recorded',()=>events++);
const delay=(ms=40)=>new Promise(resolve=>setTimeout(resolve,ms));async function waitFor(check:()=>boolean){for(let i=0;i<150;i++){if(check())return;await delay();}throw Error('UI timeout');}
function deny(){Storage.prototype.setItem=function(name,value){if(name===key)throw new DOMException('Synthetic quota','QuotaExceededError');return originalSet.call(this,name,value);};}
function fill(selector:string,text:string){const node=document.querySelector(selector)as HTMLInputElement;Object.getOwnPropertyDescriptor(node instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value')!.set!.call(node,text);node.dispatchEvent(new Event('input',{bubbles:true}));}
async function mount(id:string){root.render(<HabitsModule key={id} lang="en"/>);await delay();await waitFor(()=>!!document.querySelector('.log-textarea'));}
async function run(){
 await mount('diary');deny();fill('.log-textarea','Uncommitted diary');await delay();document.querySelector('.log-textarea')!.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));await delay();const diaryError=!!document.querySelector('[role=alert]');
 (document.querySelectorAll('.habit-row')[1]as HTMLElement).click();await delay();(document.querySelectorAll('.habit-row')[0]as HTMLElement).click();await delay();const diaryRetained=(document.querySelector('.log-textarea')as HTMLTextAreaElement).value==='Uncommitted diary';
 Storage.prototype.setItem=originalSet;await mount('toggle');deny();(document.querySelector('.hcell.today')as HTMLElement).click();await delay();const falseEvents=events;
 Storage.prototype.setItem=originalSet;await mount('add');(document.querySelector('[aria-label="Add habit"]')as HTMLElement).click();await waitFor(()=>!!document.querySelector('dialog[open]'));fill('#hb-title','Unsaved habit');await delay();deny();(document.querySelector('.hb-btn.primary')as HTMLElement).click();await delay();
 const result={diaryError,diaryRetained,falseEvents,dialogRetained:!!document.querySelector('dialog[open]'),draftRetained:(document.querySelector('#hb-title')as HTMLInputElement)?.value==='Unsaved habit',originalBytesPreserved:localStorage.getItem(key)===JSON.stringify(initial)};Storage.prototype.setItem=originalSet;
 const beforeOracle=result.diaryError&&result.diaryRetained&&result.falseEvents===0&&result.dialogRetained&&result.draftRetained&&result.originalBytesPreserved;
 if(!beforeOracle){await fetch('/result',{method:'POST',body:JSON.stringify({pass:false,...result})});return;}
 const assert=(value:unknown,message:string)=>{if(!value)throw Error(message);};
 const click=async(name:string)=>{const node=[...document.querySelectorAll('button')].find(button=>button.textContent?.trim()===name)!;assert(node,'button '+name);node.click();await delay();};
 let exported:Blob|undefined;const makeURL=URL.createObjectURL;URL.createObjectURL=value=>{exported=value as Blob;return makeURL(value);};HTMLAnchorElement.prototype.click=function(){};
 fill('#hb-title','Latest habit');fill('#hb-title-alt','最新习惯');await delay();await click('Export draft');assert(JSON.parse(await exported!.text()).latestHabitDraft.title.en==='Latest habit','habit export stale');
 await click('Retry save');assert(!document.querySelector('dialog[open]'),'habit retry kept dialog');const added=JSON.parse(localStorage.getItem(key)!);assert(added.habits.length===3&&added.habits[0].title.en==='Latest habit','habit retry duplicated/lost draft');const id=added.habits[0].id;
 fill('.log-textarea','Diary first');await delay();deny();document.querySelector('.log-textarea')!.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));await delay();fill('.log-textarea','Diary latest');await delay();await click('Export draft');assert(JSON.parse(await exported!.text()).latestDiaryDraft.text==='Diary latest','diary export stale');
 Storage.prototype.setItem=originalSet;await click('Retry save');assert(Object.values(JSON.parse(localStorage.getItem(key)!).diaries[id]).includes('Diary latest'),'diary retry stale');
 const bytes=localStorage.getItem(key);deny();(document.querySelector('.hcell.today')as HTMLElement).click();await delay();assert(events===0&&localStorage.getItem(key)===bytes,'checkin failed but emitted/wrote');Storage.prototype.setItem=originalSet;await click('Retry save');assert(events===1,'checkin retry must emit once');
 fill('.log-textarea','Local pending conflict');await delay();deny();document.querySelector('.log-textarea')!.dispatchEvent(new FocusEvent('focusout',{bubbles:true}));await delay();Storage.prototype.setItem=originalSet;
 const external=JSON.parse(localStorage.getItem(key)!);const month=Object.keys(external.diaries[id])[0];external.diaries[id][month]='External saved';const externalBytes=JSON.stringify(external);localStorage.setItem(key,externalBytes);window.dispatchEvent(new StorageEvent('storage',{key,newValue:externalBytes,storageArea:localStorage}));await delay();assert((document.querySelector('.log-textarea')as HTMLTextAreaElement).value==='Local pending conflict','external update erased dirty text');await click('Retry save');assert(localStorage.getItem(key)===externalBytes,'stale diary overwrote external value');
 accountScope.activate(accountScope.lock('fixture-B'),'B');const bKey=accountScope.physicalKey('xai_habits_state'),bBytes=localStorage.getItem(bKey);exported=undefined;await click('Retry save');await click('Export draft');assert(!exported&&localStorage.getItem(key)===externalBytes&&localStorage.getItem(bKey)===bBytes,'A draft crossed B');assert(document.body.innerText.includes('Export failed'),'export denial invisible');
 await fetch('/result',{method:'POST',body:JSON.stringify({pass:true,...result,checks:['Original add/checkin/diary quota business oracles pass','Latest habit fields exported and retried exactly once','Latest diary typing exported and retried without switching away','Checkin retry emits only after confirmed persistence','External update preserves dirty text and newer bytes','Old A diary retry/export cannot mutate or leak to B']})});
}
run().catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

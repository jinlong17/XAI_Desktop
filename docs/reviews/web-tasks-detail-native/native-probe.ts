import React from './packages/plugin-web-ai-chat/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-ai-chat/node_modules/react-dom/client.js';
import {TasksModule} from './packages/xai-web-tasks/src/TasksModule.tsx';
import {accountScope,generationMarkerKey,setCanonicalCommandActivationForTests,mutateCanonicalDataset,canonicalDatasetLockName} from './packages/plugin-web-storage/src/index.ts';
import {isTaskColsArray} from './packages/xai-web-tasks/src/internal/validate.ts';
const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function assert(v:unknown,m:string):asserts v{if(!v)throw Error(m);}
async function until(check:()=>unknown,message:string){const start=Date.now();while(!check()){assert(Date.now()-start<5000,message);await delay(20);}}
const panel=()=>document.querySelector('.task-detail-panel');
const input=()=>panel()?.querySelector('input') as HTMLInputElement|null;
function save(){const b=Array.from(panel()?.querySelectorAll('button')??[]).find(b=>b.textContent==='Save');assert(b,'Missing detail Save');b.click();}
const nativeSet=Storage.prototype.setItem;let denied:string|null=null;
Storage.prototype.setItem=function(key,value){if(key===denied)throw new DOMException('Review quota','QuotaExceededError');nativeSet.call(this,key,value);};
async function run(){
 const initial=new URLSearchParams(location.search).get('phase')==='initial';const cases:any[]=[];const checkpoint:Record<string,any>={};
 if(initial)localStorage.clear();setCanonicalCommandActivationForTests(true);
 for(const name of ['detail-conflict','detail-quota-conflict','detail-missing']){
  let root:ReturnType<typeof createRoot>|undefined;
  try{
   const account='native-'+name;if(initial)localStorage.setItem(generationMarkerKey(account),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
   const scope=accountScope.activate(accountScope.lock(account),'g1'),key=accountScope.physicalKey('xai_task_cols',scope),old=(window as any).__checkpoint?.[name];
   if(initial){const data=[{id:'overdue',key:'overdue',count:0,tasks:[]},{id:'next7',key:'next_7_days',count:0,tasks:[]},{id:'later',key:'later',count:0,tasks:[]},{id:'nodate',key:'no_date',count:1,tasks:[{id:'existing',title:{en:'Original task',zh:'Original task'},tag:'work',tags:['work'],priority:'normal',listId:'inbox'}]}];localStorage.setItem(key,JSON.stringify({format:'xai-command-state',version:1,revision:1,data,receipts:{prior:{operationVersion:1,signature:'existing',result:{ok:true,targetId:'existing'},committedAt:'2026-09-09T00:00:00Z'}}}));}
   else assert(old&&localStorage.getItem(key)===old.raw,'Persisted bytes changed across Chrome exit');
   root=createRoot(document.getElementById('app')!);root.render(React.createElement(TasksModule,{lang:'en'}));await until(()=>document.querySelector('.module-tasks'),'Module missing');await delay(80);
   if(initial){
    const card=document.querySelector('.task-card') as HTMLElement;assert(card,'Initial task missing');card.click();await until(()=>input(),'Detail missing');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input(),'My latest unsaved detail');input()!.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:'My latest unsaved detail'}));await delay(30);
    if(name==='detail-quota-conflict'){const before=localStorage.getItem(key);denied=key;save();await until(()=>panel()?.querySelector('[role="alert"]'),'Quota recovery absent');assert(localStorage.getItem(key)===before,'Quota altered bytes');denied=null;}
    const result=await mutateCanonicalDataset({key:'xai_task_cols',scope,validate:isTaskColsArray,mutate:data=>({ok:true,data:data.map(col=>({...col,tasks:name==='detail-missing'?col.tasks.filter(t=>t.id!=='existing'):col.tasks.map(t=>t.id==='existing'?{...t,title:{en:'External newer task',zh:'External newer task'}}:t)}))})});assert(result.ok,'Public ordinary mutation refused');await delay(50);const expected=localStorage.getItem(key);
    assert(input()?.value==='My latest unsaved detail','External mutation hid or replaced the unsaved detail');save();await navigator.locks.request(canonicalDatasetLockName(scope,'xai_task_cols'),async()=>{});await delay(40);
    assert(localStorage.getItem(key)===expected,'Detail save overwrote or recreated the external target');assert(panel()?.querySelector('[role="alert"]'),'Conflict has no visible recovery');assert(input()?.value==='My latest unsaved detail','Conflict lost latest draft');checkpoint[name]={raw:expected};
   }else{
    assert(localStorage.getItem(key)===old.raw,'Reopened UI rewrote stored data');
    if(name==='detail-missing')assert(!document.querySelector('.task-card'),'Deleted target reappeared');else assert(document.body.textContent?.includes('External newer task'),'External title not restored');
   }
   cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}finally{denied=null;root?.unmount();}
 }
 return {pass:cases.every(c=>c.pass),cases,...(initial?{checkpoint}:{}),scope:'Actual Tasks detail UI, public canonical competing writer, native WebLocks and storage; reopened persisted data only, no unsaved draft durability or production claim'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

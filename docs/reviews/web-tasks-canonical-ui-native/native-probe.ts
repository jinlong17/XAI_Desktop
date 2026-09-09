import React from './packages/plugin-web-ai-chat/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-ai-chat/node_modules/react-dom/client.js';
import {TasksModule} from './packages/xai-web-tasks/src/TasksModule.tsx';
import {accountScope,generationMarkerKey,setCanonicalCommandActivationForTests,mutateCanonicalDataset,canonicalDatasetLockName} from './packages/plugin-web-storage/src/index.ts';
import {isTaskColsArray} from './packages/xai-web-tasks/src/internal/validate.ts';
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
function assert(value:unknown,message:string):asserts value{if(!value)throw Error(message);}
async function until(check:()=>unknown,message:string){const start=Date.now();while(!check()){assert(Date.now()-start<5000,message);await delay(20);}}
function click(selector:string){const button=document.querySelector(selector) as HTMLElement;assert(button,'Missing '+selector);button.click();}
function enter(selector:string,value:string){const input=document.querySelector(selector) as HTMLInputElement;assert(input,'Missing '+selector);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,value);input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:value}));}
const columns=(withTask:boolean)=>[{id:'overdue',key:'overdue',count:0,tasks:[]},{id:'next7',key:'next_7_days',count:0,tasks:[]},{id:'later',key:'later',count:0,tasks:[]},{id:'nodate',key:'no_date',count:withTask?1:0,tasks:withTask?[{id:'existing',title:{en:'Original task',zh:'Original task'},tag:'work',tags:['work'],priority:'normal',listId:'inbox'}]:[]}];
const receipt={operationVersion:1,signature:'existing',result:{ok:true,targetId:'existing'},committedAt:'2026-09-09T00:00:00Z'};
const rows=(data:any)=>data.flatMap((col:any)=>[...col.tasks,...(col.completed??[])]);
const nativeSet=Storage.prototype.setItem;let denied:string|null=null;
Storage.prototype.setItem=function(key,value){if(key===denied)throw new DOMException('Native review quota','QuotaExceededError');nativeSet.call(this,key,value);};
async function run(){
 const initial=new URLSearchParams(location.search).get('phase')==='initial';const cases:any[]=[];const checkpoint:Record<string,any>={};
 if(initial)localStorage.clear();setCanonicalCommandActivationForTests(true);
 for(const name of ['startup','retry-conflict','composer-retry']){
  let root:ReturnType<typeof createRoot>|undefined;
  try{
   const account='native-tasks-ui-'+name;
   if(initial)localStorage.setItem(generationMarkerKey(account),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
   const scope=accountScope.activate(accountScope.lock(account),'g1');const key=accountScope.physicalKey('xai_task_cols',scope);
   const old=(window as any).__checkpoint?.[name];
   if(initial&&name!=='startup')localStorage.setItem(key,JSON.stringify({format:'xai-command-state',version:1,revision:1,data:columns(name==='retry-conflict'),receipts:{prior:receipt}}));
   if(!initial){assert(old,'Missing external checkpoint');assert(localStorage.getItem(key)===old.raw,'Lost persisted bytes after whole Chrome restart');}
   root=createRoot(document.getElementById('app')!);root.render(React.createElement(TasksModule,{lang:'en'}));await until(()=>document.querySelector('.module-tasks'),'TasksModule did not mount');await delay(60);
   if(initial){
    if(name==='startup'){
     await until(()=>localStorage.getItem(key)!==null,'Absent Tasks failed to initialize');const stored=JSON.parse(localStorage.getItem(key)!);assert(stored.format==='xai-command-state'&&isTaskColsArray(stored.data),'Invalid canonical initial data');assert(!document.querySelector('[role="alert"]'),'False recovery on legitimate startup');
    }else if(name==='retry-conflict'){
     const before=localStorage.getItem(key);denied=key;click('.task-card .cbx');await until(()=>document.querySelector('[role="alert"]'),'Quota failure did not show recovery');assert(localStorage.getItem(key)===before,'Quota mutated bytes');denied=null;
     const human=await mutateCanonicalDataset({key:'xai_task_cols',scope,validate:isTaskColsArray,mutate:data=>({ok:true,data:data.map(col=>({...col,tasks:col.tasks.map(task=>task.id==='existing'?{...task,title:{en:'External newer task',zh:'External newer task'}}:task)}))})});assert(human.ok,'Supported external edit failed');await until(()=>document.body.textContent?.includes('External newer task'),'Published human edit not visible');
     const newer=localStorage.getItem(key);const retry=Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Retry save');assert(retry,'Retry save missing');retry.click();await navigator.locks.request(canonicalDatasetLockName(scope,'xai_task_cols'),async()=>{});await delay(30);assert(localStorage.getItem(key)===newer,'Retry overwrote newer human data');assert(document.querySelector('[role="alert"]'),'Conflicting retry falsely cleared recovery');
    }else{
     click('.task-primary-action');await until(()=>document.querySelector<HTMLDialogElement>('dialog.task-composer')?.open,'Composer did not open');enter('#task-composer-title-input','First unsaved');await delay(30);denied=key;click('.task-composer__btn--primary');await until(()=>document.querySelector('dialog [role="alert"]'),'Composer quota error missing');assert(document.querySelector<HTMLDialogElement>('dialog.task-composer')?.open,'Failed composer closed');
     enter('#task-composer-title-input','Latest preserved draft');await delay(30);denied=null;click('.task-composer__btn--primary');click('.task-composer__btn--primary');await until(()=>!document.querySelector<HTMLDialogElement>('dialog.task-composer')?.open,'Composer retry did not complete');
     const stored=JSON.parse(localStorage.getItem(key)!);assert(rows(stored.data).length===1&&rows(stored.data)[0].title.en==='Latest preserved draft','Retry lost latest draft or created duplicate');assert(JSON.stringify(stored.receipts)===JSON.stringify({prior:receipt}),'Ordinary composer changed AI receipts');
    }
    checkpoint[name]={raw:localStorage.getItem(key)};
   }else{
    await delay(100);assert(localStorage.getItem(key)===old.raw,'Reopened Module rewrote persisted dataset');
    const stored=JSON.parse(old.raw);assert(stored.format==='xai-command-state'&&isTaskColsArray(stored.data),'Reopened data invalid');
    if(name==='retry-conflict')assert(document.body.textContent?.includes('External newer task'),'Recovered UI lost newer task');
    if(name==='composer-retry')assert(document.body.textContent?.includes('Latest preserved draft')&&rows(stored.data).length===1,'Recovered UI lost or duplicated saved draft');
   }
   cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}finally{denied=null;root?.unmount();}
 }
 return {pass:cases.every(item=>item.pass),cases,...(initial?{checkpoint}:{}),scope:'Actual TasksModule/native storage, isolated account/profile, explicit activation; no production or visual-style acceptance'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

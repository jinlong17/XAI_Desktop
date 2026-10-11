import React, {useEffect} from './packages/plugin-web-ai-chat/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-ai-chat/node_modules/react-dom/client.js';
import {accountScope,generationMarkerKey,mutateCanonicalDataset,setCanonicalCommandActivationForTests} from './packages/plugin-web-storage/src/index.ts';
import {emitWebEvent,onWebEvent} from './packages/xai-web-event-bus/src/index.ts';
import {useTaskCreateRequestSubscriber} from './packages/xai-web-tasks/src/internal/aiCreateSubscriber.ts';
import {useTaskMutateRequestSubscriber} from './packages/xai-web-tasks/src/internal/aiMutateSubscriber.ts';
import {isTaskColsArray} from './packages/xai-web-tasks/src/internal/validate.ts';
import {useCalendarCreateRequestSubscriber} from './packages/xai-web-calendar/src/internal/aiCreateSubscriber.ts';
import {useCalendarMutateRequestSubscriber} from './packages/xai-web-calendar/src/internal/aiMutateSubscriber.ts';
import {isCalendarEventStore} from './packages/xai-web-calendar/src/internal/aiCommandDomain.ts';
const names=['tasks:create','tasks:update','tasks:delete','calendar:create','calendar:update','calendar:delete'];
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
function assert(ok:unknown,message:string):asserts ok{if(!ok)throw Error(message);}
let mounted=false;
function Subscribers(){useTaskCreateRequestSubscriber();useTaskMutateRequestSubscriber();useCalendarCreateRequestSubscriber();useCalendarMutateRequestSubscriber();useEffect(()=>{mounted=true;},[]);return null;}
function seed(task:boolean){return task?[
 {id:'overdue',key:'overdue',count:0,tasks:[]},{id:'next7',key:'next_7_days',count:0,tasks:[]},{id:'later',key:'later',count:0,tasks:[]},
 {id:'nodate',key:'no_date',count:1,tasks:[{id:'existing',title:{en:'Initial',zh:'Initial'},tag:'study'}]},
]:{existing:{id:'existing',title:'Initial',startISO:'2026-09-09T09:00',endISO:'2026-09-09T10:00',colorPreset:'mint',recurrence:null,createdAt:'2026-09-09T00:00:00.000Z',updatedAt:'2026-09-09T00:00:00.000Z'}};}
function request(channel:string,payload:any){return new Promise<any>((resolve,reject)=>{
 const timer=setTimeout(()=>{off();reject(Error('No correlated receipt: '+channel));},5000);
 const off=onWebEvent('web:ai:tool-write-receipt',(receipt:any)=>{if(receipt.requestChannel===channel&&receipt.requestId===payload.requestId&&receipt.attemptId===payload.attemptId){clearTimeout(timer);off();resolve(receipt);}});
 emitWebEvent(channel as never,payload);
});}
function rows(data:any,task:boolean):any[]{return task?data.flatMap((col:any)=>col.tasks):Object.values(data);}
function title(row:any,task:boolean){return task?row.title.en:row.title;}
async function run(){
 const initial=new URLSearchParams(location.search).get('phase')==='initial';
 const checkpoints:Record<string,any>={};const cases:any[]=[];
 if(initial)localStorage.clear();
 setCanonicalCommandActivationForTests(true);
 for(const name of names){
  let root:ReturnType<typeof createRoot>|undefined;
  try{
   const task=name.startsWith('tasks'),account='native-six-'+name.replace(':','-'),generation='stable';
   if(initial)localStorage.setItem(generationMarkerKey(account),JSON.stringify({generation,migrationId:'native-review',previous:null}));
   const scope=accountScope.activate(accountScope.lock(account),generation);
   const key=accountScope.physicalKey(task?'xai_task_cols':'xai_calendar_events',scope);
   if(initial)localStorage.setItem(key,JSON.stringify(seed(task)));
   const channel='web:'+name+'-requested';
   const payload:any={requestId:'original-'+name,attemptId:initial?'first':'reopened',owner:scope,requestedAt:initial?'2026-09-09T00:00:00Z':'2026-09-10T00:00:00Z',
    ...(name.endsWith('create')?task?{title:'Created once',bucket:'nodate',tag:'work'}:{title:'Created once',date:'2026-09-09',startTime:'11:00',durationMin:30}:{id:'existing',...(name.endsWith('update')?{patch:task?{title:'Tool committed',tag:'work'}:{title:'Tool committed',durationMin:30}}:{})}),
   };
   mounted=false;root=createRoot(document.getElementById('app')!);root.render(React.createElement(Subscribers));
   const start=Date.now();while(!mounted){assert(Date.now()-start<4000,'Subscribers did not mount');await delay(10);}
   const old=(window as any).__checkpoint?.[name];
   if(!initial){assert(old,'Missing pre-close checkpoint');assert(localStorage.getItem(key)===old.raw,'Process reopen lost exact stored bytes');if(payload.patch)payload.patch=Object.fromEntries(Object.entries(payload.patch).reverse());}
   const receipt=await request(channel,payload);
   assert(receipt.ok===true,'Expected success: '+JSON.stringify(receipt));
   assert(receipt.owner.accountId===account&&receipt.owner.generation===generation&&receipt.owner.epoch===scope.epoch,'Wrong receipt transport owner');
   if(initial){
    assert(typeof receipt.targetId==='string'&&receipt.targetId,'Missing committed target');
    if(name.endsWith('update')){
     const human=await mutateCanonicalDataset<any>({key:task?'xai_task_cols':'xai_calendar_events',scope,validate:task?isTaskColsArray:isCalendarEventStore,
      mutate:data=>({ok:true,data:task?data.map((col:any)=>({...col,tasks:col.tasks.map((row:any)=>row.id==='existing'?{...row,title:{en:'Later human value',zh:'Later human value'}}:row)})):{...data,existing:{...data.existing,title:'Later human value',updatedAt:'2026-09-09T12:00:00Z'}}}),
     });assert(human.ok,'Supported public human edit failed');
    }
    const raw=localStorage.getItem(key)!;const stored=JSON.parse(raw);
    assert(stored.format==='xai-command-state'&&Object.keys(stored.receipts).length===1,'Business operation did not persist exactly one durable receipt');
    const items=rows(stored.data,task);
    if(name.endsWith('create'))assert(items.filter(row=>row.id===receipt.targetId&&title(row,task)==='Created once').length===1&&items.length===2,'Create receipt disagrees with business data');
    else if(name.endsWith('delete'))assert(items.length===0,'Delete receipt disagrees with business data');
    else assert(items.length===1&&title(items[0],task)==='Later human value','Later human edit was not persisted');
    checkpoints[name]={raw,targetId:receipt.targetId};
   }else{
    assert(receipt.targetId===old.targetId,'Replay returned different target');assert(localStorage.getItem(key)===old.raw,'Replay changed bytes or overwrote later human edit');
    const changed={...payload,attemptId:'conflict',...(name.endsWith('create')?{title:'Different'}:{id:'different-target'})};
    const conflict=await request(channel,changed);assert(conflict.ok===false&&conflict.reason==='request-conflict','Changed semantic identity did not conflict');assert(localStorage.getItem(key)===old.raw,'Conflict changed persisted bytes');
    const fresh={...payload,requestId:'fresh-'+name,attemptId:'continue'};const continued=await request(channel,fresh);
    assert(name.endsWith('delete')?continued.ok===false&&continued.reason==='not-found':continued.ok===true,'Fresh business operation could not continue correctly');
    const currentRaw=localStorage.getItem(key)!;
    if(name.endsWith('delete'))assert(currentRaw===old.raw,'Fresh missing delete mutated storage');
    else{
     const current=JSON.parse(currentRaw),items=rows(current.data,task);
     assert(Object.keys(current.receipts).length===2,'Fresh operation did not retain old receipt and append new receipt');
     if(name.endsWith('create'))assert(continued.targetId!==old.targetId&&items.length===3&&items.filter(row=>title(row,task)==='Created once').length===2,'Fresh create was suppressed or duplicated');
     else assert(items.length===1&&title(items[0],task)==='Tool committed','Fresh update receipt disagrees with business data');
    }
   }
   cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}finally{root?.unmount();}
 }
 return {pass:cases.every(x=>x.pass),cases,...(initial?{checkpoint:checkpoints}:{})};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,act,cleanup,waitFor} from '@testing-library/react';
import {accountScope,generationMarkerKey,canonicalCommandReceiptId,mutateCanonicalDataset,setCanonicalCommandActivationForTests} from '@repo/plugin-web-storage';
import {emitWebEvent,onWebEvent,type ToolWriteChannel} from '@repo/xai-web-event-bus';
import {useTaskCreateRequestSubscriber} from '../../../packages/xai-web-tasks/src/internal/aiCreateSubscriber.js';
import {useTaskMutateRequestSubscriber} from '../../../packages/xai-web-tasks/src/internal/aiMutateSubscriber.js';
import {useCalendarCreateRequestSubscriber} from '../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.js';
import {useCalendarMutateRequestSubscriber} from '../../../packages/xai-web-calendar/src/internal/aiMutateSubscriber.js';
import {isTaskColsArray} from '../../../packages/xai-web-tasks/src/internal/validate.js';
import {isCalendarEventStore} from '../../../packages/xai-web-calendar/src/internal/aiCommandDomain.js';
function Subscribers(){useTaskCreateRequestSubscriber();useTaskMutateRequestSubscriber();useCalendarCreateRequestSubscriber();useCalendarMutateRequestSubscriber();return null;}
const tasks=()=>['overdue','next7','later','nodate'].map((id,i)=>({id,key:['overdue','next_7_days','later','no_date'][i],count:i===3?1:0,tasks:i===3?[{id:'target',title:{en:'Original',zh:'Original'},tag:'study'}]:[]}));
const calendar=()=>({target:{id:'target',title:'Original',startISO:'2026-09-09T09:00',endISO:'2026-09-09T10:00',colorPreset:'mint',recurrence:null,createdAt:'2026-09-09T00:00:00.000Z',updatedAt:'2026-09-09T00:00:00.000Z'}});
const activate=()=>{const scope=accountScope.activate(accountScope.lock('astra-six'),'g1');localStorage.setItem(generationMarkerKey('astra-six'),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));return scope;};
beforeEach(()=>{localStorage.clear();activate();setCanonicalCommandActivationForTests(true);let tail=Promise.resolve();vi.stubGlobal('navigator',{locks:{request:(_name:string,run:()=>Promise<unknown>)=>{const p=tail.then(run);tail=p.then(()=>{},()=>{});return p;}}});});
afterEach(()=>{cleanup();setCanonicalCommandActivationForTests(false);vi.restoreAllMocks();vi.unstubAllGlobals();});
async function send(channel:ToolWriteChannel,payload:any){const seen:any[]=[];const off=onWebEvent('web:ai:tool-write-receipt',r=>{if(r.requestChannel===channel&&r.requestId===payload.requestId&&r.attemptId===payload.attemptId)seen.push(r);});try{act(()=>emitWebEvent(channel,payload));await waitFor(()=>expect(seen).toHaveLength(1));return seen[0];}finally{off();}}
function setup(name:string){const task=name.startsWith('tasks'),key=accountScope.physicalKey(task?'xai_task_cols':'xai_calendar_events');localStorage.setItem(key,JSON.stringify(task?tasks():calendar()));const channel=`web:${name}-requested` as ToolWriteChannel;const common={owner:accountScope.capture(),attemptId:'first',requestId:name,requestedAt:'2026-09-09T00:00:00Z'};const payload=name.endsWith('create')?{...common,title:'Created',...(task?{bucket:'nodate'}:{date:'2026-09-09',startTime:'11:00',durationMin:30})}:{...common,id:'target',...(name.endsWith('update')?{patch:{title:'Tool edit'}}:{})};return{task,key,channel,payload};}

it.each(['tasks:create','tasks:update','tasks:delete','calendar:create','calendar:update','calendar:delete'])('%s retains original business oracle after remount and real ordinary human edit',async name=>{
 const {task,key,channel,payload}=setup(name);const mounted=render(<Subscribers/>);const write=vi.spyOn(Storage.prototype,'setItem');const first=await send(channel,payload);expect(first.ok).toBe(true);expect(write.mock.calls.filter(([k])=>k===key)).toHaveLength(1);
 const initial=JSON.parse(localStorage.getItem(key)!);expect(initial.receipts[canonicalCommandReceiptId(channel,payload.requestId)!].result.targetId).toBe(first.targetId);
 mounted.unmount();if(name.endsWith('update')){
 const outcome=task?await mutateCanonicalDataset({key:'xai_task_cols',scope:accountScope.capture(),validate:isTaskColsArray,mutate:data=>({ok:true,data:data.map(col=>({...col,tasks:col.tasks.map(t=>t.id==='target'?{...t,title:{en:'Later human',zh:'Later human'}}:t)}))})}):await mutateCanonicalDataset({key:'xai_calendar_events',scope:accountScope.capture(),validate:isCalendarEventStore,mutate:data=>({ok:true,data:{...data,target:{...data.target!,title:'Later human'}}})});expect(outcome.ok).toBe(true);
 }
 const raw=localStorage.getItem(key);const owner=activate();render(<Subscribers/>);write.mockClear();
 const replay=await send(channel,{...payload,owner,attemptId:'second',requestedAt:'2026-09-10T00:00:00Z'});expect(replay).toMatchObject({ok:true,targetId:first.targetId,owner,attemptId:'second'});expect(localStorage.getItem(key)).toBe(raw);expect(write.mock.calls.filter(([k])=>k===key)).toHaveLength(0);
 const conflict=await send(channel,{...payload,...(name.endsWith('create')?{title:'Changed'}:{id:'other'}),owner,attemptId:'conflict'});expect(conflict).toMatchObject({ok:false,reason:'request-conflict'});expect(localStorage.getItem(key)).toBe(raw);
 if(name.endsWith('delete')){expect(await send(channel,{...payload,requestId:'fresh-delete',owner,attemptId:'fresh'})).toMatchObject({ok:false,reason:'not-found'});expect(localStorage.getItem(key)).toBe(raw);}
});
it.each(['tasks:create','calendar:create'])('%s waits for the lock without an early receipt; queued owner invalidation refuses',async name=>{
 const {key,channel,payload}=setup(name);const raw=localStorage.getItem(key);let release!:()=>void;const gate=new Promise<void>(r=>release=r);vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});render(<Subscribers/>);const receipts:any[]=[];const off=onWebEvent('web:ai:tool-write-receipt',r=>receipts.push(r));const p=send(channel,payload);await Promise.resolve();expect(receipts).toHaveLength(0);accountScope.activate(accountScope.lock('other'),'g2');release();expect(await p).toMatchObject({ok:false,reason:'account-changed'});expect(localStorage.getItem(key)).toBe(raw);off();
});
it.each(['tasks:create','calendar:create'])('%s quota refusal commits no receipt and corrected retry writes once',async name=>{
 const {key,channel,payload}=setup(name);const raw=localStorage.getItem(key);const native=Storage.prototype.setItem;const fail=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(k===key)throw new DOMException('quota','QuotaExceededError');native.call(this,k,v);});render(<Subscribers/>);expect(await send(channel,payload)).toMatchObject({ok:false,reason:'storage'});expect(localStorage.getItem(key)).toBe(raw);fail.mockRestore();expect(await send(channel,{...payload,attemptId:'retry'})).toMatchObject({ok:true});
});
it('Tasks queued mutation must use the validated semantic snapshot recorded in its receipt',async()=>{
 const {key,channel,payload}=setup('tasks:update');let release!:()=>void;const gate=new Promise<void>(r=>release=r);vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});render(<Subscribers/>);
 const patch={title:'Tool edit',tag:'work',bucket:'later'};const queued={...payload,patch};const pending=send(channel,queued);patch.tag='personal';patch.bucket='nodate';release();const reply=await pending;expect(reply.ok).toBe(true);
 const state=JSON.parse(localStorage.getItem(key)!);const col=state.data.find((c:any)=>c.tasks.some((t:any)=>t.id==='target'));const target=col.tasks.find((t:any)=>t.id==='target');const receipt=state.receipts[canonicalCommandReceiptId(channel,payload.requestId)!];console.log('queued-payload',JSON.stringify({signature:receipt.signature,actualBucket:col.id,actualTag:target.tag}));
 expect.soft(col.id).toBe('later');expect(target.tag).toBe('work');
});

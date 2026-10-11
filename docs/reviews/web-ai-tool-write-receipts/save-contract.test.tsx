import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useTaskCreateRequestSubscriber } from '../../../packages/xai-web-tasks/src/internal/aiCreateSubscriber.js';
import { useCalendarCreateRequestSubscriber } from '../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.js';
import { emitWebEvent } from '../../../packages/xai-web-event-bus/src/index.js';
import { accountScope } from '../../../packages/plugin-web-storage/src/index.js';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
for(const kind of ['tasks','calendar'] as const) it(`${kind}: a failed request can be retried with the same id after storage recovers`,()=>{
 const logical=kind==='tasks'?'xai_task_cols':'xai_calendar_events';
 const key=accountScope.physicalKey(logical);
 const seed=kind==='tasks'?['overdue','next7','later','nodate'].map(id=>({id,key:id,count:0,tasks:[]})):{};
 localStorage.setItem(key,JSON.stringify(seed));
 const original=localStorage.getItem(key);
 renderHook(()=>kind==='tasks'?useTaskCreateRequestSubscriber():useCalendarCreateRequestSubscriber());
 const originalSet=Storage.prototype.setItem;let attempts=0;
 const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,name,value){
  if(name===key){attempts++;throw new DOMException('quota','QuotaExceededError');}
  originalSet.call(this,name,value);
 });
 const dispatch=()=>act(()=>{
  if(kind==='tasks')emitWebEvent('web:tasks:create-requested',{requestId:'retry-same-id',title:'Durable task',bucket:'nodate',requestedAt:'2026-09-09T10:00:00Z'});
  else emitWebEvent('web:calendar:create-requested',{requestId:'retry-same-id',title:'Durable event',date:'2026-09-10',startTime:'09:00',durationMin:30,requestedAt:'2026-09-09T10:00:00Z'});
 });
 dispatch();expect(attempts).toBe(1);expect(localStorage.getItem(key)).toBe(original);
 fault.mockRestore();dispatch();
 const persisted=JSON.parse(localStorage.getItem(key)!);
 const records=kind==='tasks'?persisted.flatMap((col:{tasks:unknown[]})=>col.tasks):Object.values(persisted);
 expect(records).toHaveLength(1);
 dispatch();expect(localStorage.getItem(key)).toBe(JSON.stringify(persisted));
});

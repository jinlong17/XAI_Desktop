import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { accountScope } from '../../../packages/plugin-web-storage/src/index.js';
import { emitWebEvent, onWebEvent, type WebEventMap } from '../../../packages/xai-web-event-bus/src/index.js';
import { useCalendarCreateRequestSubscriber } from '../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.js';
import { useCalendarMutateRequestSubscriber } from '../../../packages/xai-web-calendar/src/internal/aiMutateSubscriber.js';
afterEach(cleanup);
for(const action of ['create','update'] as const) it(`${action} rejects a nonexistent civil date without writing a success receipt`,()=>{
 const key=accountScope.physicalKey('xai_calendar_events');
 const source={event:{id:'event',title:'Existing',startISO:'2026-02-20T09:00',endISO:'2026-02-20T10:00',createdAt:'2026-02-20T00:00:00Z',updatedAt:'2026-02-20T00:00:00Z',colorPreset:'mint',recurrence:null}};
 localStorage.setItem(key,JSON.stringify(source));const before=localStorage.getItem(key);
 renderHook(()=>{useCalendarCreateRequestSubscriber();useCalendarMutateRequestSubscriber();});
 const receipts: WebEventMap['web:ai:tool-write-receipt'][]=[];
 const off=onWebEvent('web:ai:tool-write-receipt',r=>receipts.push(r));
 try {
 const common={requestId:'invalid-date-'+action,attemptId:'1',owner:accountScope.capture(),requestedAt:'2026-09-09T00:00:00Z'};
 if(action==='create')emitWebEvent('web:calendar:create-requested',{...common,title:'Impossible February',date:'2026-02-31',startTime:'09:00',durationMin:30});
 else emitWebEvent('web:calendar:update-requested',{...common,id:'event',patch:{date:'2026-02-31'}});
 expect(receipts).toHaveLength(1);
 expect(receipts[0]?.ok).toBe(false);
 expect(localStorage.getItem(key)).toBe(before);
 } finally {off();}
});

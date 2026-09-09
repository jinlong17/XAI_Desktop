import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { accountScope } from '../../../packages/plugin-web-storage/src/index.js';
import { emitWebEvent, onWebEvent, type ToolWriteChannel, type WebEventMap } from '../../../packages/xai-web-event-bus/src/index.js';
import { useTaskCreateRequestSubscriber } from '../../../packages/xai-web-tasks/src/internal/aiCreateSubscriber.js';
import { useTaskMutateRequestSubscriber } from '../../../packages/xai-web-tasks/src/internal/aiMutateSubscriber.js';
import { useCalendarCreateRequestSubscriber } from '../../../packages/xai-web-calendar/src/internal/aiCreateSubscriber.js';
import { useCalendarMutateRequestSubscriber } from '../../../packages/xai-web-calendar/src/internal/aiMutateSubscriber.js';
import { AiChatModule } from '../../../packages/plugin-web-ai-chat/src/AiChatModule.js';
import * as stream from '../../../packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.js';
function Subscribers() { useTaskCreateRequestSubscriber(); useTaskMutateRequestSubscriber(); useCalendarCreateRequestSubscriber(); useCalendarMutateRequestSubscriber(); return null; }
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const cases = ['tasks:create','tasks:update','tasks:delete','calendar:create','calendar:update','calendar:delete'];
function fixture(name: string) {
  const task = name.startsWith('tasks');
  const key = accountScope.physicalKey(task ? 'xai_task_cols' : 'xai_calendar_events');
  localStorage.setItem(key, JSON.stringify(task ? [{ id: 'nodate', tasks: [{ id: 'existing', title: { en: 'Existing', zh: 'Existing' } }] }] : { existing: { id: 'existing', title: 'Existing', startISO: '2026-09-09T09:00', endISO: '2026-09-09T10:00', createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z', colorPreset: 'mint', recurrence: null } }));
  const channel = ('web:' + name.replace(':', ':') + '-requested') as ToolWriteChannel;
  const payload = { requestId: 'same-' + name, attemptId: '1', owner: accountScope.capture(), requestedAt: new Date().toISOString(), ...(name.endsWith('create') ? task ? { title: 'Created', bucket: 'nodate' } : { title: 'Created', date: '2026-09-09', startTime: '11:00', durationMin: 30 } : { id: 'existing', ...(name.endsWith('update') ? { patch: { title: 'Updated' } } : {}) }) };
  return { key, channel, payload };
}
it.each(cases)('%s confirms only committed writes, retries quota and survives subscriber remount', name => {
  const f = fixture(name); let mounted = render(<Subscribers/>); const receipts: WebEventMap['web:ai:tool-write-receipt'][] = [];
  const off = onWebEvent('web:ai:tool-write-receipt', r => receipts.push(r));
  const before = localStorage.getItem(f.key); const set = Storage.prototype.setItem;
  const fault = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage,k,v){ if(k===f.key)throw new DOMException('quota','QuotaExceededError');set.call(this,k,v); });
  emitWebEvent(f.channel,f.payload as never); expect(receipts.at(-1)?.ok).toBe(false); expect(receipts.at(-1)?.reason).toBe('storage'); expect(localStorage.getItem(f.key)).toBe(before);
  fault.mockRestore(); emitWebEvent(f.channel,{...f.payload,attemptId:'2'} as never); expect(receipts.at(-1)?.ok).toBe(true); const committed = localStorage.getItem(f.key); expect(committed).not.toBe(before);
  mounted.unmount(); mounted = render(<Subscribers/>); emitWebEvent(f.channel,{...f.payload,attemptId:'3'} as never);
  expect(receipts.at(-1)?.ok).toBe(true); expect(receipts.at(-1)?.attemptId).toBe('3'); expect(localStorage.getItem(f.key)).toBe(committed);
  mounted.unmount(); off();
});
it.each(cases.filter(n=>!n.endsWith('create')))('%s rejects invalid and nonexistent ids without success', name => {
  const f=fixture(name);render(<Subscribers/>);const before=localStorage.getItem(f.key);const receipts: WebEventMap['web:ai:tool-write-receipt'][]=[];const off=onWebEvent('web:ai:tool-write-receipt',r=>receipts.push(r));
  emitWebEvent(f.channel,{...f.payload,id:'',requestId:'invalid'} as never);expect(receipts.at(-1)?.reason).toBe('invalid');
  emitWebEvent(f.channel,{...f.payload,id:'missing',requestId:'missing'} as never);expect(receipts.at(-1)?.reason).toBe('not-found');expect(localStorage.getItem(f.key)).toBe(before);off();
});
it.each(cases)('%s old owner cannot execute after account replacement', name => {
  const f=fixture(name);render(<Subscribers/>);const before=localStorage.getItem(f.key);accountScope.activate(accountScope.lock('B'),'b1');const bKey=accountScope.physicalKey(name.startsWith('tasks')?'xai_task_cols':'xai_calendar_events');const beforeB=localStorage.getItem(bKey);let reason:string|undefined;const off=onWebEvent('web:ai:tool-write-receipt',r=>{reason=r.reason});emitWebEvent(f.channel,f.payload as never);expect(reason).toBe('account-changed');expect(localStorage.getItem(f.key)).toBe(before);expect(localStorage.getItem(bKey)).toBe(beforeB);off();
});

it.each(cases)('%s actual confirmation sends model success only after committed retry', async name => {
  const f=fixture(name); const calls: unknown[]=[];
  const toolName = name.split(':')[1] + (name.startsWith('tasks') ? '_task' : '_calendar_event');
  vi.spyOn(stream,'streamCompleteChat').mockImplementation(async function* (r) {
    calls.push(r);
    if (!r.priorMessages) yield { accumulated:'Proposed operation',done:true,toolUse:{id:'confirm-'+name,name:toolName,input:name.endsWith('create')?{title:'New confirmed',bucket:'nodate',date:'2026-09-09',startTime:'11:00',durationMin:30}:{id:'existing',title:'Updated confirmed'}} };
    else yield {accumulated:'Confirmed persisted',done:true};
  });
  const {container}=render(<><Subscribers/><AiChatModule lang="en"/></>);
  await act(async()=>{fireEvent.change(container.querySelector('.ai-input')!,{target:{value:'Execute'}});fireEvent.keyDown(container.querySelector('.ai-input')!,{key:'Enter'});});
  const before=localStorage.getItem(f.key);const set=Storage.prototype.setItem;const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===f.key)throw new DOMException('quota','QuotaExceededError');set.call(this,k,v)});
  await act(async()=>{fireEvent.click(container.querySelector('.ai-confirmation-confirm')!)});
  expect(calls).toHaveLength(1);expect(localStorage.getItem(f.key)).toBe(before);expect(screen.getByRole('alert').textContent).toContain('Tool not saved');
  fault.mockRestore();await act(async()=>{fireEvent.click(container.querySelector('.ai-confirmation-confirm')!)});
  expect(calls).toHaveLength(2);expect(localStorage.getItem(f.key)).not.toBe(before);expect(container.querySelector('.ai-confirmation-card')).toBeNull();
});

import React from './packages/plugin-web-ai-chat/node_modules/react/index.js';
import { createRoot } from './packages/plugin-web-ai-chat/node_modules/react-dom/client.js';
import { accountScope, generationMarkerKey, setCanonicalCommandActivationForTests } from './packages/plugin-web-storage/src/index.ts';
import {
  emitWebEvent,
  onWebEvent,
} from './packages/xai-web-event-bus/src/index.ts';
import { useTaskCreateRequestSubscriber } from './packages/xai-web-tasks/src/internal/aiCreateSubscriber.ts';
import { useTaskMutateRequestSubscriber } from './packages/xai-web-tasks/src/internal/aiMutateSubscriber.ts';
import { useCalendarCreateRequestSubscriber } from './packages/xai-web-calendar/src/internal/aiCreateSubscriber.ts';
import { useCalendarMutateRequestSubscriber } from './packages/xai-web-calendar/src/internal/aiMutateSubscriber.ts';
import { AiChatModule } from './packages/plugin-web-ai-chat/src/AiChatModule.tsx';

type CaseName = 'tasks:create' | 'tasks:update' | 'tasks:delete' | 'calendar:create' | 'calendar:update' | 'calendar:delete';
type Receipt = {
  requestId: string;
  requestChannel: string;
  attemptId?: string;
  owner: ReturnType<typeof accountScope.capture>;
  ok: boolean;
  reason?: string;
  targetId?: string;
};

declare global {
  interface Window {
    __receiptStream: {
      scenario: { requestId: string; toolName: string; input: Record<string, unknown> };
      calls: Array<Record<string, unknown>>;
    };
  }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const assert = (value: unknown, message: string): asserts value => {
  if (!value) throw new Error(message);
};
const same = (actual: unknown, expected: unknown, message: string) => {
  if (actual !== expected) throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
};
const waitFor = async (check: () => boolean, message: string, timeout = 4000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (check()) return;
    await delay(20);
  }
  throw new Error(message);
};

const rawSet = Storage.prototype.setItem;
const rawGet = Storage.prototype.getItem;
let deniedKey: string | null = null;
let deniedGetKey: string | null = null;
let deniedWriteName = 'QuotaExceededError';
let deniedWrites = 0;
let observedWriteKey: string | null = null;
let successfulObservedWrites = 0;
Storage.prototype.getItem = function (key: string) {
  if (key === deniedGetKey) throw new DOMException('synthetic exact-key read denial', 'SecurityError');
  return rawGet.call(this, key);
};
Storage.prototype.setItem = function (key: string, value: string) {
  if (key === deniedKey) {
    deniedWrites += 1;
    throw new DOMException('synthetic exact-key write denial', deniedWriteName);
  }
  if (key === observedWriteKey) successfulObservedWrites += 1;
  return rawSet.call(this, key, value);
};

function Subscribers() {
  useTaskCreateRequestSubscriber();
  useTaskMutateRequestSubscriber();
  useCalendarCreateRequestSubscriber();
  useCalendarMutateRequestSubscriber();
  return null;
}

function WithSubscribers({ caseKey }: { caseKey: string }) {
  return <><Subscribers/><AiChatModule key={caseKey} lang="en"/></>;
}

const root = createRoot(document.getElementById('app')!);
const activate = (account: string) => { localStorage.setItem(generationMarkerKey(account), JSON.stringify({generation:'native-generation',migrationId:'native-review',previous:null})); return accountScope.activate(accountScope.lock(account), 'native-generation'); };
const taskSeed = () => [{id:'overdue',key:'overdue',count:0,tasks:[]},{id:'next7',key:'next_7_days',count:0,tasks:[]},{id:'later',key:'later',count:0,tasks:[]},{ id: 'nodate',key:'no_date', count: 1, tasks: [{ id: 'existing', title: { en: 'Existing', zh: 'Existing' },tag:'study' }] }];
const calendarSeed = () => ({
  existing: {
    id: 'existing', title: 'Existing', startISO: '2026-09-09T09:00', endISO: '2026-09-09T10:00',
    createdAt: '2026-09-09T00:00:00.000Z', updatedAt: '2026-09-09T00:00:00.000Z', colorPreset: 'mint', recurrence: null,
  },
});

const definitions: Record<CaseName, {
  channel: string;
  toolName: string;
  input: Record<string, unknown>;
  operation: Record<string, unknown>;
  changedOperation: Record<string, unknown>;
  pref: 'xai_task_cols' | 'xai_calendar_events';
}> = {
  'tasks:create': {
    channel: 'web:tasks:create-requested', toolName: 'create_task', input: { title: 'Native Created Task', bucket: 'nodate', tag: 'work' },
    operation: { title: 'Native Created Task', bucket: 'nodate', tag: 'work' }, changedOperation: { title: 'Conflicting Task', bucket: 'nodate', tag: 'work' }, pref: 'xai_task_cols',
  },
  'tasks:update': {
    channel: 'web:tasks:update-requested', toolName: 'update_task', input: { id: 'existing', title: 'Native Updated Task' },
    operation: { id: 'existing', patch: { title: 'Native Updated Task' } }, changedOperation: { id: 'existing', patch: { title: 'Conflicting Task' } }, pref: 'xai_task_cols',
  },
  'tasks:delete': {
    channel: 'web:tasks:delete-requested', toolName: 'delete_task', input: { id: 'existing' },
    operation: { id: 'existing' }, changedOperation: { id: 'other' }, pref: 'xai_task_cols',
  },
  'calendar:create': {
    channel: 'web:calendar:create-requested', toolName: 'create_calendar_event', input: { title: 'Native Created Event', date: '2026-09-10', startTime: '11:00', durationMin: 30 },
    operation: { title: 'Native Created Event', date: '2026-09-10', startTime: '11:00', durationMin: 30 }, changedOperation: { title: 'Conflicting Event', date: '2026-09-10', startTime: '11:00', durationMin: 30 }, pref: 'xai_calendar_events',
  },
  'calendar:update': {
    channel: 'web:calendar:update-requested', toolName: 'update_calendar_event', input: { id: 'existing', title: 'Native Updated Event' },
    operation: { id: 'existing', patch: { title: 'Native Updated Event' } }, changedOperation: { id: 'existing', patch: { title: 'Conflicting Event' } }, pref: 'xai_calendar_events',
  },
  'calendar:delete': {
    channel: 'web:calendar:delete-requested', toolName: 'delete_calendar_event', input: { id: 'existing' },
    operation: { id: 'existing' }, changedOperation: { id: 'other' }, pref: 'xai_calendar_events',
  },
};

function seed(definition: (typeof definitions)[CaseName]) {
  const key = accountScope.physicalKey(definition.pref);
  rawSet.call(localStorage, key, JSON.stringify(definition.pref === 'xai_task_cols' ? taskSeed() : calendarSeed()));
  return key;
}

function assertBusinessResult(name: CaseName, key: string, previous: string, targetId?: string) {
  const raw = localStorage.getItem(key);
  assert(raw !== null && raw !== previous, `${name}: canonical bytes did not change`);
  const envelope = JSON.parse(raw);
  assert(envelope.format === "xai-command-state" && Object.keys(envelope.receipts).length === 1,"Expected exactly one durable receipt");
  const data = envelope.data;
  if (name === 'tasks:create') {
    const tasks = data.flatMap((column: { tasks: unknown[] }) => column.tasks);
    const created = tasks.find((task: { title?: { en?: string } }) => task.title?.en === 'Native Created Task');
    assert(created && (targetId === undefined || created.id === targetId), `${name}: receipt target is not the persisted created task`);
  } else if (name === 'tasks:update') {
    const task = data.flatMap((column: { tasks: unknown[] }) => column.tasks).find((item: { id: string }) => item.id === 'existing');
    assert(task?.title?.en === 'Native Updated Task' && task?.title?.zh === 'Native Updated Task' && (targetId === undefined || targetId === 'existing'), `${name}: final task state/target mismatch`);
  } else if (name === 'tasks:delete') {
    assert(data.flatMap((column: { tasks: unknown[] }) => column.tasks).every((item: { id: string }) => item.id !== 'existing') && (targetId === undefined || targetId === 'existing'), `${name}: deleted task remains or target mismatch`);
  } else if (name === 'calendar:create') {
    const created = Object.values(data).find((event: any) => event.title === 'Native Created Event') as any;
    assert(created && (targetId === undefined || created.id === targetId) && created.startISO === '2026-09-10T11:00' && created.endISO === '2026-09-10T11:30', `${name}: persisted created event/target mismatch`);
  } else if (name === 'calendar:update') {
    assert(data.existing?.title === 'Native Updated Event' && (targetId === undefined || targetId === 'existing'), `${name}: final event state/target mismatch`);
  } else {
    assert(Object.keys(data).length === 0 && (targetId === undefined || targetId === 'existing'), `${name}: deleting the final event did not persist an empty canonical object`);
  }
}

async function renderNode(node: React.ReactNode) {
  root.render(node);
  await delay(80);
}

function sendPrompt(text: string) {
  const input = document.querySelector('.ai-input') as HTMLInputElement | null;
  assert(input, 'AI composer missing');
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  try { setter.call(input, text); } catch (error) { throw new Error(`native setter failed: ${String(error)}`); }
  try { input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text })); } catch (error) { throw new Error(`input event failed: ${String(error)}`); }
  try { input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' })); } catch (error) { throw new Error(`keydown failed: ${String(error)}`); }
}

async function openConfirmation(scenario: { requestId: string; toolName: string; input: Record<string, unknown> }) {
  window.__receiptStream = { scenario, calls: [] };
  sendPrompt('Execute the synthetic local operation');
  await waitFor(() => !!document.querySelector('.ai-confirmation-card'), `${scenario.toolName}: confirmation did not render`);
}

async function clickConfirm() {
  const button = document.querySelector('.ai-confirmation-confirm') as HTMLButtonElement | null;
  assert(button, 'Confirm button missing');
  button.click();
  await delay(40);
}

async function clickConfirmTwiceSynchronously() {
  const button = document.querySelector('.ai-confirmation-confirm') as HTMLButtonElement | null;
  assert(button, 'Confirm button missing');
  button.click();
  button.click();
  await delay(40);
}

async function run() {
 const cases:any[]=[];
 localStorage.clear();setCanonicalCommandActivationForTests(true);
 for(const name of Object.keys(definitions) as CaseName[]){
  try{
   const def=definitions[name];activate('canonical-ui-'+name);const key=seed(def);
   await renderNode(<WithSubscribers caseKey={name}/>);
   await openConfirmation({requestId:'canonical-ui-'+name,toolName:def.toolName,input:def.input});
   const state=window.__receiptStream as any;state.snapshot=()=>rawGet.call(localStorage,key);
   const before=localStorage.getItem(key)!;deniedWrites=0;deniedKey=key;
   await clickConfirmTwiceSynchronously();
   await waitFor(()=>!!document.querySelector('[role="alert"]'),name+': quota error missing');
   same(state.calls.length,1,name+': continuation before persistence');
   same(localStorage.getItem(key),before,name+': quota changed business bytes');
   assert(document.querySelector('.ai-confirmation-card'),name+': failed confirmation removed');
   same(deniedWrites,1,name+': double confirm attempted multiple writes');
   deniedKey=null;
   await clickConfirmTwiceSynchronously();
   await waitFor(()=>state.calls.length===2&&!document.querySelector('.ai-confirmation-card'),name+': retry continuation missing');
   assertBusinessResult(name,key,before);
   same(state.atContinuation,localStorage.getItem(key),name+': continuation occurred before final storage commit');
   const blocks=state.calls[1].priorMessages.flatMap((message:any)=>Array.isArray(message.content)?message.content:[]).filter((block:any)=>block.type==='tool_result');
   same(blocks.length,1,name+': continuation must contain exactly one tool result');
   same(blocks[0].tool_use_id,'canonical-ui-'+name,name+': incorrect tool use id');
   assert(!blocks[0].is_error&&/executed successfully/.test(blocks[0].content),name+': no successful tool result');
   await delay(150);same(state.calls.length,2,name+': duplicate model continuation');
   cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}finally{deniedKey=null;await renderNode(null);}
 }
 return {pass:cases.every(item=>item.pass),cases,scope:'Real AiChat UI/subscribers/native storage; synthetic stream adapter, no provider network'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

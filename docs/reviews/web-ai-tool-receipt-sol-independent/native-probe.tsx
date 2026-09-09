import React from './packages/plugin-web-ai-chat/node_modules/react/index.js';
import { createRoot } from './packages/plugin-web-ai-chat/node_modules/react-dom/client.js';
import { accountScope } from './packages/plugin-web-storage/src/index.ts';
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
const activate = (account: string) => accountScope.activate(accountScope.lock(account), 'native-generation');
const taskSeed = () => [{ id: 'nodate', count: 1, tasks: [{ id: 'existing', title: { en: 'Existing', zh: 'Existing' } }] }];
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
  const data = JSON.parse(raw);
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
  const checks: string[] = [];
  const observations: string[] = [];
  const names = Object.keys(definitions) as CaseName[];

  // Event-level contract through real React subscribers and native localStorage.
  for (const name of names) {
    const definition = definitions[name];
    const owner = activate(`sol-direct-${name}`);
    const key = seed(definition);
    await renderNode(<Subscribers/>);
    const receipts: Receipt[] = [];
    const off = onWebEvent('web:ai:tool-write-receipt', receipt => receipts.push(receipt as Receipt));
    const requestId = `sol-direct-${name}`;
    const payload = { requestId, attemptId: 'attempt-1', owner, requestedAt: new Date().toISOString(), ...definition.operation };
    const before = localStorage.getItem(key)!;
    deniedWrites = 0;
    deniedKey = key;
    emitWebEvent(definition.channel as any, payload as any);
    same(receipts.at(-1)?.ok, false, `${name}: quota receipt must fail`);
    same(receipts.at(-1)?.reason, 'storage', `${name}: quota failure reason`);
    same(localStorage.getItem(key), before, `${name}: quota changed canonical bytes`);
    same(deniedWrites, 1, `${name}: expected one exact-key failed native write`);

    deniedKey = null;
    emitWebEvent(definition.channel as any, { ...payload, attemptId: 'attempt-2' } as any);
    const success = receipts.at(-1)!;
    same(success.ok, true, `${name}: retry did not return success receipt`);
    assertBusinessResult(name, key, before, success.targetId);
    const committed = localStorage.getItem(key)!;

    await renderNode(null);
    await renderNode(<Subscribers/>);
    emitWebEvent(definition.channel as any, { ...payload, attemptId: 'attempt-3' } as any);
    same(receipts.at(-1)?.ok, true, `${name}: subscriber remount replay did not succeed`);
    same(receipts.at(-1)?.attemptId, 'attempt-3', `${name}: remount replay receipt used wrong attempt`);
    same(localStorage.getItem(key), committed, `${name}: remount replay executed the business write twice`);

    emitWebEvent(definition.channel as any, { ...payload, ...definition.changedOperation, attemptId: 'attempt-4' } as any);
    same(receipts.at(-1)?.reason, 'request-conflict', `${name}: same id/different payload was not rejected`);
    same(localStorage.getItem(key), committed, `${name}: conflicting payload changed canonical bytes`);

    if (name.endsWith('update') || name.endsWith('delete')) {
      const invalidBefore = localStorage.getItem(key);
      emitWebEvent(definition.channel as any, { ...payload, requestId: `${requestId}-invalid`, attemptId: 'invalid', id: '' } as any);
      same(receipts.at(-1)?.reason, 'invalid', `${name}: blank id not invalid`);
      emitWebEvent(definition.channel as any, { ...payload, requestId: `${requestId}-missing`, attemptId: 'missing', id: 'missing' } as any);
      same(receipts.at(-1)?.reason, 'not-found', `${name}: missing id not not-found`);
      same(localStorage.getItem(key), invalidBefore, `${name}: invalid/missing id changed canonical bytes`);
    }

    const oldOwner = owner;
    const oldABytes = localStorage.getItem(key);
    activate(`sol-direct-B-${name}`);
    const bKey = accountScope.physicalKey(definition.pref);
    const beforeB = localStorage.getItem(bKey);
    emitWebEvent(definition.channel as any, { ...payload, requestId: `${requestId}-old-owner`, attemptId: 'old-owner', owner: oldOwner } as any);
    same(receipts.at(-1)?.reason, 'account-changed', `${name}: A owner request executed in B`);
    same(localStorage.getItem(key), oldABytes, `${name}: old A bytes changed after B activation`);
    same(localStorage.getItem(bKey), beforeB, `${name}: B bytes changed by old A request`);
    off();
    checks.push(`${name}: native quota/retry/remount/conflict/owner business contract${name.endsWith('create') ? '' : ' plus blank/missing id rejection'}`);
  }

  // SecurityError on either canonical read or write must not become model success.
  for (const name of names) {
    const definition = definitions[name];
    for (const boundary of ['read', 'write'] as const) {
      activate(`sol-security-${boundary}-${name}`);
      const key = seed(definition);
      const before = rawGet.call(localStorage, key);
      await renderNode(<WithSubscribers caseKey={`security-${boundary}-${name}`}/>);
      await openConfirmation({ requestId: `sol-security-${boundary}-${name}`, toolName: definition.toolName, input: definition.input });
      deniedWrites = 0;
      deniedWriteName = 'SecurityError';
      if (boundary === 'read') deniedGetKey = key;
      else deniedKey = key;
      await clickConfirm();
      await waitFor(() => !!document.querySelector('[role="alert"]'), `${name}/${boundary} SecurityError did not render failure`);
      same(window.__receiptStream.calls.length, 1, `${name}/${boundary} SecurityError triggered model success`);
      same(rawGet.call(localStorage, key), before, `${name}/${boundary} SecurityError changed canonical bytes`);
      assert(document.querySelector('.ai-confirmation-card'), `${name}/${boundary} SecurityError removed confirmation`);
      if (boundary === 'write') same(deniedWrites, 1, `${name}: write SecurityError did not reach exact canonical write once`);
      deniedGetKey = null;
      deniedKey = null;
      deniedWriteName = 'QuotaExceededError';
    }
    checks.push(`${name}: canonical get/write SecurityError cannot report model success`);
  }

  // Characterize the non-canonical signature without failing the bounded receipt phase.
  const orderOwner = activate('sol-property-order-observation');
  const orderDefinition = definitions['tasks:update'];
  const orderKey = seed(orderDefinition);
  await renderNode(<Subscribers/>);
  const orderReceipts: Receipt[] = [];
  const offOrder = onWebEvent('web:ai:tool-write-receipt', receipt => orderReceipts.push(receipt as Receipt));
  emitWebEvent(orderDefinition.channel as any, { requestId: 'sol-property-order', attemptId: 'one', owner: orderOwner, requestedAt: new Date().toISOString(), id: 'existing', patch: { title: 'Ordered Update', tag: 'work' } } as any);
  same(orderReceipts.at(-1)?.ok, true, 'property-order characterization setup did not persist');
  const orderedBytes = localStorage.getItem(orderKey);
  emitWebEvent(orderDefinition.channel as any, { requestId: 'sol-property-order', attemptId: 'two', owner: orderOwner, requestedAt: new Date().toISOString(), id: 'existing', patch: { tag: 'work', title: 'Ordered Update' } } as any);
  same(orderReceipts.at(-1)?.reason, 'request-conflict', 'property-order characterization changed unexpectedly');
  same(localStorage.getItem(orderKey), orderedBytes, 'property-order replay changed bytes');
  offOrder();
  observations.push('JSON.stringify signature treats semantically identical object properties in a different insertion order as request-conflict; current tool registry emits stable order, but the shared helper is not canonical');

  // Actual AiChat UI: each tool must withhold the success continuation until persistence succeeds.
  for (const name of names) {
    const definition = definitions[name];
    activate(`sol-ui-${name}`);
    const key = seed(definition);
    await renderNode(<WithSubscribers caseKey={name}/>);
    await openConfirmation({ requestId: `sol-ui-${name}`, toolName: definition.toolName, input: definition.input });
    const before = localStorage.getItem(key)!;
    deniedWrites = 0;
    deniedKey = key;
    await clickConfirm();
    await waitFor(() => !!document.querySelector('[role="alert"]'), `${name}: quota error did not render`);
    same(window.__receiptStream.calls.length, 1, `${name}: model received success before persistence`);
    same(localStorage.getItem(key), before, `${name}: UI quota changed canonical bytes`);
    assert(document.querySelector('.ai-confirmation-card'), `${name}: failed confirmation was removed`);
    same(deniedWrites, 1, `${name}: UI path did not attempt exactly one business write`);

    deniedKey = null;
    await clickConfirm();
    await waitFor(() => window.__receiptStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), `${name}: success continuation did not finish`);
    assertBusinessResult(name, key, before);
    const second = window.__receiptStream.calls[1] as any;
    const toolResult = second.priorMessages?.[2]?.content?.[0];
    assert(toolResult?.type === 'tool_result' && toolResult?.tool_use_id === `sol-ui-${name}` && /executed successfully/.test(toolResult?.content), `${name}: second stream lacks the matching success tool_result`);
    checks.push(`${name}: actual AI UI reports success only after persisted retry`);
  }

  // Invalid and missing ids: actual AI UI must retain confirmation and withhold success.
  for (const name of names.filter(value => value.endsWith('update') || value.endsWith('delete'))) {
    const definition = definitions[name];
    for (const [variant, id] of [['blank', ''], ['missing', 'missing']] as const) {
      activate(`sol-ui-${variant}-${name}`);
      const key = seed(definition);
      const before = localStorage.getItem(key);
      await renderNode(<WithSubscribers caseKey={`${variant}-${name}`}/>);
      await openConfirmation({ requestId: `sol-ui-${variant}-${name}`, toolName: definition.toolName, input: { ...definition.input, id } });
      await clickConfirm();
      await waitFor(() => !!document.querySelector('[role="alert"]'), `${name}/${variant}: failure did not render`);
      same(window.__receiptStream.calls.length, 1, `${name}/${variant}: invalid target triggered model success`);
      same(localStorage.getItem(key), before, `${name}/${variant}: invalid target changed canonical bytes`);
      assert(document.querySelector('.ai-confirmation-card'), `${name}/${variant}: invalid target removed confirmation`);
    }
    checks.push(`${name}: actual AI UI withholds model success for blank and missing ids`);
  }

  // No subscriber: every tool must time out without a model success continuation.
  deniedKey = null;
  for (const name of names) {
    const definition = definitions[name];
    activate(`sol-no-subscriber-${name}`);
    await renderNode(<AiChatModule key={`no-subscriber-${name}`} lang="en"/>);
    await openConfirmation({ requestId: `sol-no-subscriber-${name}`, toolName: definition.toolName, input: definition.input });
    await clickConfirm();
    await waitFor(() => !!document.querySelector('[role="alert"]'), `${name}: no subscriber did not time out visibly`, 2500);
    same(window.__receiptStream.calls.length, 1, `${name}: no subscriber triggered model success continuation`);
    assert(document.querySelector('.ai-confirmation-card'), `${name}: no subscriber removed the confirmation`);
  }
  checks.push('all six tools without subscribers: visible failure, retained confirmation, no model success');

  // A matching attempt must still reject receipts with the wrong request id, channel, or owner.
  const correlationOwner = activate('sol-correlation');
  await renderNode(<AiChatModule key="correlation" lang="en"/>);
  const correlationRequests: any[] = [];
  const offCorrelation = onWebEvent('web:tasks:create-requested', request => correlationRequests.push(request));
  await openConfirmation({ requestId: 'sol-correlation', toolName: 'create_task', input: { title: 'Correlation gate', bucket: 'nodate' } });
  await clickConfirm();
  await waitFor(() => correlationRequests.length === 1 && !!document.querySelector('[role="status"]'), 'correlation request did not enter waiting state');
  const correlationRequest = correlationRequests[0];
  const emitCorrelation = (overrides: Record<string, unknown>) => emitWebEvent('web:ai:tool-write-receipt', {
    requestId: 'sol-correlation', requestChannel: 'web:tasks:create-requested', attemptId: correlationRequest.attemptId,
    owner: correlationOwner, ok: true, targetId: 'correlation-target', ...overrides,
  } as any);
  emitCorrelation({ requestId: 'wrong-request-id' });
  emitCorrelation({ requestChannel: 'web:calendar:create-requested' });
  emitCorrelation({ owner: { ...correlationOwner, accountId: 'wrong-owner' } });
  await delay(120);
  same(window.__receiptStream.calls.length, 1, 'wrong request/channel/owner receipt advanced model');
  assert(document.querySelector('.ai-confirmation-card') && document.querySelector('[role="status"]'), 'wrong correlation receipt released waiting confirmation');
  emitCorrelation({});
  await waitFor(() => window.__receiptStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), 'matching correlation receipt was not accepted');
  offCorrelation();
  checks.push('wrong requestId/channel/owner receipts ignored while matching receipt advances once');

  // Two Confirm events in the same turn must execute one business write and one continuation.
  activate('sol-double-confirm');
  const doubleDefinition = definitions['tasks:update'];
  const doubleKey = seed(doubleDefinition);
  await renderNode(<WithSubscribers caseKey="double-confirm"/>);
  await openConfirmation({ requestId: 'sol-double-confirm', toolName: doubleDefinition.toolName, input: doubleDefinition.input });
  observedWriteKey = doubleKey;
  successfulObservedWrites = 0;
  await clickConfirmTwiceSynchronously();
  await waitFor(() => window.__receiptStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), 'double Confirm did not finish one continuation');
  same(successfulObservedWrites, 1, 'double Confirm executed the canonical business write more than once');
  same(window.__receiptStream.calls.length, 2, 'double Confirm emitted duplicate model continuations');
  observedWriteKey = null;
  checks.push('same-turn double Confirm produces one business write and one model continuation');

  // Unmount while waiting: a later matching receipt cannot continue the disposed component.
  const unmountOwner = activate('sol-unmount-waiting');
  await renderNode(<AiChatModule key="unmount-waiting" lang="en"/>);
  const unmountRequests: any[] = [];
  const offUnmount = onWebEvent('web:tasks:create-requested', request => unmountRequests.push(request));
  await openConfirmation({ requestId: 'sol-unmount-waiting', toolName: 'create_task', input: { title: 'Unmount gate', bucket: 'nodate' } });
  await clickConfirm();
  await waitFor(() => unmountRequests.length === 1, 'unmount scenario did not emit request');
  const unmountRequest = unmountRequests[0];
  await renderNode(null);
  emitWebEvent('web:ai:tool-write-receipt', { requestId: 'sol-unmount-waiting', requestChannel: 'web:tasks:create-requested', attemptId: unmountRequest.attemptId, owner: unmountOwner, ok: true, targetId: 'late-after-unmount' });
  await delay(160);
  same(window.__receiptStream.calls.length, 1, 'receipt after component unmount triggered model continuation');
  offUnmount();
  checks.push('component unmount while waiting rejects later matching success');

  // Real A-to-B transition while waiting: old A success cannot advance or mutate B.
  const waitingA = activate('sol-waiting-A');
  await renderNode(<AiChatModule key="waiting-account" lang="en"/>);
  const switchRequests: any[] = [];
  const offSwitch = onWebEvent('web:tasks:create-requested', request => switchRequests.push(request));
  await openConfirmation({ requestId: 'sol-waiting-switch', toolName: 'create_task', input: { title: 'Account switch gate', bucket: 'nodate' } });
  await clickConfirm();
  await waitFor(() => switchRequests.length === 1, 'account-switch scenario did not emit A request');
  const switchRequest = switchRequests[0];
  activate('sol-waiting-B');
  const waitingBKey = accountScope.physicalKey('xai_task_cols');
  const waitingBBefore = rawGet.call(localStorage, waitingBKey);
  emitWebEvent('web:ai:tool-write-receipt', { requestId: 'sol-waiting-switch', requestChannel: 'web:tasks:create-requested', attemptId: switchRequest.attemptId, owner: waitingA, ok: true, targetId: 'late-A-success' });
  await delay(160);
  same(window.__receiptStream.calls.length, 1, 'old A success after A-to-B transition triggered model continuation');
  same(rawGet.call(localStorage, waitingBKey), waitingBBefore, 'old A success after switch changed B business bytes');
  offSwitch();
  checks.push('A-to-B transition while waiting rejects later old-A success and preserves B');

  // Late success from attempt 1 must not satisfy attempt 2.
  const lateOwner = activate('sol-late-attempt');
  await renderNode(<AiChatModule key="late-attempt" lang="en"/>);
  const requests: any[] = [];
  const offRequests = onWebEvent('web:tasks:create-requested', request => requests.push(request));
  await openConfirmation({ requestId: 'sol-late-attempt', toolName: 'create_task', input: { title: 'Late receipt gate', bucket: 'nodate' } });
  await clickConfirm();
  await waitFor(() => !!document.querySelector('[role="alert"]') && requests.length === 1, 'attempt 1 did not time out', 2500);
  const attempt1 = requests[0];
  await clickConfirm();
  await waitFor(() => requests.length === 2, 'attempt 2 request not emitted');
  const attempt2 = requests[1];
  assert(attempt1.attemptId !== attempt2.attemptId, 'retry reused attempt id');
  emitWebEvent('web:ai:tool-write-receipt', { requestId: 'sol-late-attempt', requestChannel: 'web:tasks:create-requested', attemptId: attempt1.attemptId, owner: lateOwner, ok: true, targetId: 'wrong-attempt' });
  await delay(120);
  same(window.__receiptStream.calls.length, 1, 'late attempt-1 success advanced the model during attempt 2');
  assert(document.querySelector('.ai-confirmation-card') && document.querySelector('[role="status"]'), 'late attempt-1 success released attempt-2 confirmation');
  emitWebEvent('web:ai:tool-write-receipt', { requestId: 'sol-late-attempt', requestChannel: 'web:tasks:create-requested', attemptId: attempt2.attemptId, owner: lateOwner, ok: true, targetId: 'matching-attempt' });
  await waitFor(() => window.__receiptStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), 'matching attempt-2 receipt was not accepted');
  offRequests();
  checks.push('late wrong attempt ignored; matching retry attempt alone advances model');

  // Unfaulted control through actual UI and subscriber.
  activate('sol-normal-control');
  const controlDef = definitions['calendar:delete'];
  const controlKey = seed(controlDef);
  await renderNode(<WithSubscribers caseKey="normal-control"/>);
  await openConfirmation({ requestId: 'sol-normal-control', toolName: controlDef.toolName, input: controlDef.input });
  await clickConfirm();
  await waitFor(() => window.__receiptStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), 'normal success control did not complete');
  const controlData = JSON.parse(localStorage.getItem(controlKey)!);
  same(Object.keys(controlData).length, 0, 'normal control did not delete final event');
  checks.push('unfaulted normal control persists final-event deletion before model success');

  return { pass: true, checks, observations, browser: navigator.userAgent, syntheticOnly: true };
}

run().then(
  result => fetch('/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) }),
  error => fetch('/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pass: false, error: error instanceof Error ? `${error.message}\n${error.stack}` : String(error) }) }),
);

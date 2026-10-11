import React from './packages/plugin-web-ai-chat/node_modules/react/index.js';
import { createRoot } from './packages/plugin-web-ai-chat/node_modules/react-dom/client.js';
import { accountScope } from './packages/plugin-web-storage/src/index.ts';
import { onWebEvent } from './packages/xai-web-event-bus/src/index.ts';
import { useCalendarCreateRequestSubscriber } from './packages/xai-web-calendar/src/internal/aiCreateSubscriber.ts';
import { useCalendarMutateRequestSubscriber } from './packages/xai-web-calendar/src/internal/aiMutateSubscriber.ts';
import { AiChatModule } from './packages/plugin-web-ai-chat/src/AiChatModule.tsx';

declare global {
  interface Window {
    __calendarStream: {
      scenario: { requestId: string; toolName: string; input: Record<string, unknown> };
      calls: Array<Record<string, unknown>>;
    };
  }
}

type InvalidCase = {
  name: string;
  toolName: 'create_calendar_event' | 'update_calendar_event';
  input: Record<string, unknown>;
  marker: string;
};
type Receipt = { ok: boolean; reason?: string; requestId: string; targetId?: string };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const root = createRoot(document.getElementById('app')!);
const rawSet = Storage.prototype.setItem;
let watchedKey: string | null = null;
let canonicalWrites = 0;
Storage.prototype.setItem = function (key: string, value: string) {
  if (key === watchedKey) canonicalWrites += 1;
  return rawSet.call(this, key, value);
};

const seedValue = () => ({
  event: {
    id: 'event', title: 'Existing', startISO: '2026-02-20T09:00', endISO: '2026-02-20T10:00',
    createdAt: '2026-02-20T00:00:00.000Z', updatedAt: '2026-02-20T00:00:00.000Z', colorPreset: 'mint', recurrence: null,
  },
});

function Subscribers() {
  useCalendarCreateRequestSubscriber();
  useCalendarMutateRequestSubscriber();
  return null;
}
function Harness({ instance }: { instance: string }) {
  return <><Subscribers/><AiChatModule key={instance} lang="en"/></>;
}
const activate = (account: string) => accountScope.activate(accountScope.lock(account), 'native-generation');
const seed = () => {
  const key = accountScope.physicalKey('xai_calendar_events');
  rawSet.call(localStorage, key, JSON.stringify(seedValue()));
  return key;
};
const renderHarness = async (instance: string) => {
  root.render(<Harness instance={instance}/>);
  await delay(80);
};
const waitFor = async (check: () => boolean, message: string, timeout = 3500) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (check()) return;
    await delay(20);
  }
  throw new Error(message);
};
const sendPrompt = (text: string) => {
  const input = document.querySelector('.ai-input') as HTMLInputElement | null;
  if (!input) throw new Error('AI input missing');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, text);
  input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter' }));
};
const openConfirmation = async (scenario: Window['__calendarStream']['scenario']) => {
  window.__calendarStream = { scenario, calls: [] };
  sendPrompt('Validate this exact synthetic calendar operation');
  await waitFor(() => !!document.querySelector('.ai-confirmation-card'), `${scenario.requestId}: confirmation missing`);
};
const confirm = async () => {
  const button = document.querySelector('.ai-confirmation-confirm') as HTMLButtonElement | null;
  if (!button) throw new Error('Confirm button missing');
  button.click();
  await delay(60);
};
const equalRaw = (actual: unknown, expected: unknown) => JSON.stringify(actual) === JSON.stringify(expected);

const invalidCases: InvalidCase[] = [
  { name: 'create impossible civil date', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-31', startTime: '09:00', durationMin: 30 }, marker: '2026-02-31' },
  { name: 'create non-leap February 29', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2025-02-29', startTime: '09:00', durationMin: 30 }, marker: '2025-02-29' },
  { name: 'create null date', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: null, startTime: '09:00', durationMin: 30 }, marker: 'null' },
  { name: 'create array date', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: ['2026-02-20'], startTime: '09:00', durationMin: 30 }, marker: '2026-02-20' },
  { name: 'create null time', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-20', startTime: null, durationMin: 30 }, marker: 'null' },
  { name: 'create array time', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-20', startTime: ['09:00'], durationMin: 30 }, marker: '09:00' },
  { name: 'create string duration', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-20', startTime: '09:00', durationMin: '30' }, marker: '30 min' },
  { name: 'create decimal duration', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-20', startTime: '09:00', durationMin: 7.5 }, marker: '7.5 min' },
  { name: 'create null duration', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-20', startTime: '09:00', durationMin: null }, marker: 'null min' },
  { name: 'create array duration', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-20', startTime: '09:00', durationMin: [30] }, marker: '30 min' },
  { name: 'create crosses day boundary', toolName: 'create_calendar_event', input: { title: 'Invalid create', date: '2026-02-20', startTime: '23:50', durationMin: 6 }, marker: '23:50' },
  { name: 'update impossible date rejects whole title patch', toolName: 'update_calendar_event', input: { id: 'event', title: 'Must not persist', date: '2026-02-31' }, marker: '2026-02-31' },
  { name: 'update null date', toolName: 'update_calendar_event', input: { id: 'event', date: null }, marker: 'null' },
  { name: 'update array date', toolName: 'update_calendar_event', input: { id: 'event', date: ['2026-02-20'] }, marker: '2026-02-20' },
  { name: 'update null time', toolName: 'update_calendar_event', input: { id: 'event', startTime: null }, marker: 'null' },
  { name: 'update array time that string-coerces valid', toolName: 'update_calendar_event', input: { id: 'event', startTime: ['09:00'] }, marker: '09:00' },
  { name: 'update empty array time', toolName: 'update_calendar_event', input: { id: 'event', startTime: [] }, marker: 'at:' },
  { name: 'update string duration', toolName: 'update_calendar_event', input: { id: 'event', durationMin: '30' }, marker: '30 min' },
  { name: 'update decimal duration', toolName: 'update_calendar_event', input: { id: 'event', durationMin: 7.5 }, marker: '7.5 min' },
  { name: 'update null duration', toolName: 'update_calendar_event', input: { id: 'event', durationMin: null }, marker: 'null min' },
  { name: 'update array duration', toolName: 'update_calendar_event', input: { id: 'event', durationMin: [30] }, marker: '30 min' },
  { name: 'update crosses day boundary', toolName: 'update_calendar_event', input: { id: 'event', startTime: '23:50', durationMin: 6 }, marker: '23:50' },
];

async function runInvalid(test: InvalidCase, index: number) {
  activate(`sol-calendar-invalid-${index}`);
  const key = seed();
  const before = localStorage.getItem(key);
  canonicalWrites = 0;
  watchedKey = key;
  await renderHarness(`invalid-${index}`);
  const requests: any[] = [];
  const receipts: Receipt[] = [];
  const requestChannel = test.toolName === 'create_calendar_event' ? 'web:calendar:create-requested' : 'web:calendar:update-requested';
  const offRequest = onWebEvent(requestChannel as any, request => requests.push(request));
  const offReceipt = onWebEvent('web:ai:tool-write-receipt', receipt => receipts.push(receipt as Receipt));
  const requestId = `sol-invalid-${index}`;
  await openConfirmation({ requestId, toolName: test.toolName, input: test.input });
  const confirmation = document.querySelector('.ai-confirmation-description')?.textContent ?? '';
  await confirm();
  await waitFor(() => receipts.some(receipt => receipt.requestId === requestId), `${test.name}: receipt missing`);
  const receipt = receipts.find(item => item.requestId === requestId)!;
  const request = requests[0];
  const failures: string[] = [];
  if (!confirmation.includes(test.marker)) failures.push(`confirmation omitted raw marker ${JSON.stringify(test.marker)}: ${confirmation}`);
  if (!request) failures.push('typed write request missing');
  else if (test.toolName === 'create_calendar_event') {
    for (const field of ['title', 'date', 'startTime', 'durationMin']) {
      if (!equalRaw(request[field], test.input[field])) failures.push(`create request altered ${field}`);
    }
  } else {
    for (const field of ['title', 'date', 'startTime', 'durationMin']) {
      if (Object.hasOwn(test.input, field) && !equalRaw(request.patch?.[field], test.input[field])) failures.push(`update request altered ${field}`);
    }
  }
  if (receipt.ok !== false || receipt.reason !== 'invalid') failures.push(`expected invalid receipt, got ${JSON.stringify(receipt)}`);
  if (canonicalWrites !== 0) failures.push(`invalid operation attempted ${canonicalWrites} canonical writes`);
  if (localStorage.getItem(key) !== before) failures.push('invalid operation changed canonical bytes');
  if (window.__calendarStream.calls.length !== 1) failures.push(`invalid operation triggered ${window.__calendarStream.calls.length - 1} model continuations`);
  const alert = document.querySelector('[role="alert"]')?.textContent ?? '';
  if (!alert.includes('invalid') || alert.includes(' storage')) failures.push(`failure UI did not preserve invalid classification: ${alert}`);
  offRequest();
  offReceipt();
  watchedKey = null;
  return { name: test.name, pass: failures.length === 0, confirmation, request, receipt, canonicalWrites, modelCalls: window.__calendarStream.calls.length, failures };
}

async function runValid(name: string, toolName: 'create_calendar_event' | 'update_calendar_event', input: Record<string, unknown>, assertStore: (store: Record<string, any>) => boolean) {
  activate(`sol-calendar-valid-${name}`);
  const key = seed();
  const before = localStorage.getItem(key);
  canonicalWrites = 0;
  watchedKey = key;
  await renderHarness(`valid-${name}`);
  const receipts: Receipt[] = [];
  const offReceipt = onWebEvent('web:ai:tool-write-receipt', receipt => receipts.push(receipt as Receipt));
  const requestId = `sol-valid-${name}`;
  await openConfirmation({ requestId, toolName, input });
  const confirmation = document.querySelector('.ai-confirmation-description')?.textContent ?? '';
  await confirm();
  await waitFor(() => window.__calendarStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), `${name}: success continuation missing`);
  const store = JSON.parse(localStorage.getItem(key) ?? '{}');
  const receipt = receipts.find(item => item.requestId === requestId);
  const second = window.__calendarStream.calls[1] as any;
  const toolResult = second.priorMessages?.[2]?.content?.[0];
  const failures: string[] = [];
  if (localStorage.getItem(key) === before || canonicalWrites !== 1) failures.push(`expected one canonical commit, got ${canonicalWrites}`);
  if (!receipt?.ok) failures.push(`success receipt missing: ${JSON.stringify(receipt)}`);
  if (!assertStore(store)) failures.push(`final store mismatch: ${JSON.stringify(store)}`);
  if (toolResult?.type !== 'tool_result' || toolResult?.tool_use_id !== requestId || !/executed successfully/.test(toolResult?.content)) failures.push('matching success tool_result missing');
  offReceipt();
  watchedKey = null;
  return { name, pass: failures.length === 0, confirmation, receipt, canonicalWrites, failures };
}

async function runCorrectionReplay() {
  activate('sol-calendar-correction-replay');
  const key = seed();
  watchedKey = key;
  canonicalWrites = 0;
  const requestId = 'sol-same-id-correction';
  const receipts: Receipt[] = [];
  const offReceipt = onWebEvent('web:ai:tool-write-receipt', receipt => receipts.push(receipt as Receipt));

  await renderHarness('correction-invalid');
  await openConfirmation({ requestId, toolName: 'update_calendar_event', input: { id: 'event', date: '2026-02-31', title: 'Corrected once' } });
  await confirm();
  await waitFor(() => receipts.some(receipt => receipt.requestId === requestId), 'correction invalid receipt missing');
  const beforeCorrection = localStorage.getItem(key);

  await renderHarness('correction-valid');
  await openConfirmation({ requestId, toolName: 'update_calendar_event', input: { id: 'event', date: '2024-02-29', title: 'Corrected once' } });
  await confirm();
  await waitFor(() => window.__calendarStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), 'corrected same-id operation did not succeed');
  const committed = localStorage.getItem(key);

  await renderHarness('correction-replay');
  await openConfirmation({ requestId, toolName: 'update_calendar_event', input: { id: 'event', date: '2024-02-29', title: 'Corrected once' } });
  await confirm();
  await waitFor(() => window.__calendarStream.calls.length === 2 && !document.querySelector('.ai-confirmation-card'), 'successful same-id replay did not return success');
  const store = JSON.parse(localStorage.getItem(key) ?? '{}');
  const relevant = receipts.filter(receipt => receipt.requestId === requestId);
  const failures: string[] = [];
  if (relevant[0]?.reason !== 'invalid') failures.push(`first receipt not invalid: ${JSON.stringify(relevant[0])}`);
  if (!relevant[1]?.ok || !relevant[2]?.ok) failures.push(`corrected/replay receipts not successful: ${JSON.stringify(relevant)}`);
  if (beforeCorrection === committed || canonicalWrites !== 1) failures.push(`same-id correction committed ${canonicalWrites} times`);
  if (localStorage.getItem(key) !== committed) failures.push('successful replay changed canonical bytes');
  if (store.event?.title !== 'Corrected once' || store.event?.startISO !== '2024-02-29T09:00' || store.event?.endISO !== '2024-02-29T10:00') failures.push(`corrected final data mismatch: ${JSON.stringify(store.event)}`);
  offReceipt();
  watchedKey = null;
  return { name: 'same requestId invalid then corrected then replayed', pass: failures.length === 0, receipts: relevant, canonicalWrites, failures };
}

async function run() {
  const invalid = [];
  for (let index = 0; index < invalidCases.length; index += 1) invalid.push(await runInvalid(invalidCases[index]!, index));
  const valid = [
    await runValid('leap-create', 'create_calendar_event', { title: 'Leap create', date: '2024-02-29', startTime: '10:15', durationMin: 30 }, store => Object.values(store).some((event: any) => event.title === 'Leap create' && event.startISO === '2024-02-29T10:15' && event.endISO === '2024-02-29T10:45')),
    await runValid('omitted-create-defaults', 'create_calendar_event', { title: 'Default create', date: '2026-02-20' }, store => Object.values(store).some((event: any) => event.title === 'Default create' && event.startISO === '2026-02-20T09:00' && event.endISO === '2026-02-20T10:00')),
    await runValid('2350-plus-5-create', 'create_calendar_event', { title: 'Boundary create', date: '2026-02-20', startTime: '23:50', durationMin: 5 }, store => Object.values(store).some((event: any) => event.title === 'Boundary create' && event.startISO === '2026-02-20T23:50' && event.endISO === '2026-02-20T23:55')),
    await runValid('leap-update', 'update_calendar_event', { id: 'event', date: '2024-02-29', title: 'Leap update' }, store => store.event?.title === 'Leap update' && store.event?.startISO === '2024-02-29T09:00' && store.event?.endISO === '2024-02-29T10:00'),
    await runValid('2350-plus-5-update', 'update_calendar_event', { id: 'event', startTime: '23:50', durationMin: 5 }, store => store.event?.startISO === '2026-02-20T23:50' && store.event?.endISO === '2026-02-20T23:55'),
  ];
  const correction = await runCorrectionReplay();
  const failures = [...invalid, ...valid, correction].filter(result => !result.pass).map(result => ({ name: result.name, failures: result.failures, receipt: (result as any).receipt }));
  return { pass: failures.length === 0, invalid, valid, correction, failures, browser: navigator.userAgent, syntheticOnly: true };
}

run().then(
  result => fetch('/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) }),
  error => fetch('/result', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pass: false, harnessError: error instanceof Error ? `${error.message}\n${error.stack}` : String(error) }) }),
);

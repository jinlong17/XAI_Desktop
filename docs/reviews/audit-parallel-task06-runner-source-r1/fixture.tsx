/** Component/store controls only. The actual host uses archived apps/web/src/main.tsx. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TasksModule } from '@repo/plugin-web-tasks';
import { TasksSidebar } from '../../../packages/xai-web-tasks/src/TasksSidebar';
import { accountScope, generationMarkerKey, canonicalDatasetLockName, setCanonicalCommandActivationForTests, mutateCanonicalDataset } from '@repo/plugin-web-storage';
import { isTaskColsArray } from '../../../packages/xai-web-tasks/src/internal/validate';
import { DEFAULT_TASK_LISTS, DEFAULT_TASK_TAGS } from '../../../packages/xai-web-tasks/src/internal/taskMeta';
import '@repo/plugin-web-tokens';
import '../../../packages/xai-web-tasks/src/styles.css';

type Config = { id: string; lane: string; variant: string; lang: 'en' | 'zh' };
declare global { interface Window { __T06_CONFIG: Config; __T06: ReturnType<typeof install>; } }
const config = window.__T06_CONFIG;
const events: unknown[] = [], writes: unknown[] = [], reads: unknown[] = [], keys: unknown[] = [];
const callbacks: unknown[] = [];
const nativeGet = Storage.prototype.getItem, nativeSet = Storage.prototype.setItem, nativeRemove = Storage.prototype.removeItem;
let fault = '', taskKey = '', releaseLock: (() => void) | null = null;
Storage.prototype.getItem = function (key) { reads.push({ key, fault }); if (key === taskKey && fault === 'read') throw Error('T06 induced read failure'); return nativeGet.call(this, key); };
Storage.prototype.setItem = function (key, value) {
  writes.push({ type: 'set', key, value, fault, phase: document.querySelector('.module-tasks') ? 'mounted' : 'setup' });
  if (key === taskKey && ['quota','throw'].includes(fault)) throw fault === 'quota' ? new DOMException('T06 quota', 'QuotaExceededError') : Error('T06 throwing write');
  nativeSet.call(this, key, value);
};
Storage.prototype.removeItem = function (key) { writes.push({ type: 'remove', key }); nativeRemove.call(this, key); };
for (const type of ['keydown','keypress','keyup']) document.addEventListener(type, (event) => {
  const e = event as KeyboardEvent; keys.push({ type, key: e.key, shift: e.shiftKey, trusted: e.isTrusted });
}, true);
for (const type of ['click','pointerdown','dragstart','drop']) document.addEventListener(type, event => events.push({ type, trusted: event.isTrusted }), true);
const originalFetch = window.fetch.bind(window);
window.fetch = (...args) => { events.push({ type: 'fetch', url: String(args[0]) }); return originalFetch(...args); };
const task = (id: string, extra = {}) => ({ id, title: { en: id, zh: id }, priority: 'normal', listId: 'inbox', tag: 'work', tags: ['work'], notes: 'preserve notes', source: { type: 'board-card', boardId: 'b1', listId: 'bl1', cardId: 'bc1' }, ...extra });
function data(variant: string) {
  const cols: any[] = ['overdue','next7','later','nodate'].map((id, i) => ({ id, key: ['overdue','next_7_days','later','no_date'][i], count: 0, tasks: [] }));
  if (variant === 'empty') return cols;
  const extra = variant === 'dated' ? { done: true, completedAt: '2026-09-01T00:00:00Z', dueDate: '2026-09-01' }
    : variant === 'stale-date' ? { dueDate: '1999-01-01' }
    : variant === 'unknown-date' ? { dueDate: 'not-a-date' }
    : { done: variant === 'normal', ...(variant === 'normal' ? { completedAt: '2026-09-01T00:00:00Z' } : {}) };
  if (['legacy-missing','legacy-false','undated'].includes(variant)) cols[3].completed = [task('t06-target', variant === 'legacy-false' ? { done: false } : {})];
  else { cols[3].tasks = [task('t06-target', extra)]; cols[3].count = 1; }
  return cols;
}
const receipt = { operationVersion: 1, signature: 'prior', result: { ok: true, targetId: 'prior' }, committedAt: '2026-09-01T00:00:00Z' };
const rawFor = (variant: string) => variant === 'corrupt' ? '{broken' : variant === 'unsupported' ? JSON.stringify({ format: 'xai-command-state', version: 999, data: data('empty') })
  : variant === 'legacy' ? JSON.stringify(data(variant)) : JSON.stringify({ format: 'xai-command-state', version: 1, revision: 7, data: data(variant), receipts: { prior: receipt } });
const callbacksFor = ['SelectSmart','SelectList','SelectTag','CreateList','CreateTag','EditList','EditTag','DeleteList','DeleteTag','ReorderList','ReorderTag','TaskDropToList','TaskDropToTag'];
let updateCounts = (_n: number) => {};
function SidebarControl() {
  const [count, setCount] = useState(0), [activeView, setActiveView] = useState<any>({ kind: 'smart', id: 'all' });
  updateCounts = setCount;
  const props: any = Object.fromEntries(callbacksFor.map(name => ['on'+name, (...args: unknown[]) => {
    callbacks.push({ name, args });
    if (name.startsWith('Select')) setActiveView({ kind: name.slice(6).toLowerCase(), id: args[0] });
  }]));
  return <TasksSidebar {...props} lang={config.lang} activeView={activeView} lists={DEFAULT_TASK_LISTS} tags={DEFAULT_TASK_TAGS}
    smartCounts={Object.fromEntries(['all','today','tomorrow','next7','inbox','summary'].map(k => [k,count])) as any}
    listCounts={Object.fromEntries(DEFAULT_TASK_LISTS.map(x => [x.id,count]))} tagCounts={Object.fromEntries(DEFAULT_TASK_TAGS.map(x => [x.id,count]))} />;
}
function install() {
  return {
    provenance: 'actual TasksModule/store under explicit synthetic scope, or controlled Sidebar callbacks; never actual host identity',
    ready: false, key: taskKey, keys, events, writes, reads, callbacks,
    raw: () => nativeGet.call(localStorage, taskKey),
    snapshot: () => ({ raw: nativeGet.call(localStorage, taskKey), writes: [...writes], reads: [...reads], keys: [...keys], events: [...events], callbacks: [...callbacks], text: document.body.textContent, scope: accountScope.capture() }),
    setFault(value: string) { fault = value; },
    counts(value: number) { updateCounts(value); },
    async newer() { return mutateCanonicalDataset({ key: 'xai_task_cols', scope: accountScope.capture(), validate: isTaskColsArray, mutate: (cols: any) => ({ ok: true, data: cols.map((col: any) => ({ ...col, tasks: col.tasks.map((t: any) => ({ ...t, title: { en: 'newer-source', zh: 'newer-source' } })) })) }) }); },
    async hold() { let entered!: () => void; const acquired = new Promise<void>(r => { entered = r; });
      const held = new Promise<void>(r => { releaseLock = r; });
      void navigator.locks.request(canonicalDatasetLockName(accountScope.capture(), 'xai_task_cols'), async () => { entered(); await held; }); await acquired; },
    release() { releaseLock?.(); releaseLock = null; },
    revoke() { accountScope.lock('t06-other-component-account'); },
  };
}
if (config.lane === 'module') {
  const id = 't06-source-control-'+config.id;
  const marker = generationMarkerKey(id);
  if (nativeGet.call(localStorage, marker) === null) nativeSet.call(localStorage, marker, JSON.stringify({ generation: 'g1', migrationId: 't06-control', previous: null }));
  setCanonicalCommandActivationForTests(true);
  const scope = accountScope.activate(accountScope.lock(id), 'g1'); taskKey = accountScope.physicalKey('xai_task_cols', scope);
  if (nativeGet.call(localStorage, taskKey) === null) nativeSet.call(localStorage, taskKey, rawFor(config.variant));
  if (config.variant === 'read') fault = 'read';
}
window.__T06 = install();
createRoot(document.getElementById('root')!).render(config.lane === 'sidebar' ? <SidebarControl/> : <TasksModule lang={config.lang}/>);
requestAnimationFrame(() => { window.__T06.ready = true; });

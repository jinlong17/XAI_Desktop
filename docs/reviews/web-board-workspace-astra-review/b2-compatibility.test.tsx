import { beforeEach, afterEach, expect, it } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { accountScope, accountMigrationIssue, migrateAccount, createAccountScopeController, generationKey, generationMarkerKey, exportAccountLocalData, deleteAccountLocalData } from '@repo/plugin-web-storage';
import '../../../packages/xai-web-calendar/src/internal/accountMigration.js';
import '../../../packages/xai-web-tasks/src/internal/accountMigration.js';
import { useUserCalEvents } from '../../../packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.js';
import { ensureBoardTaskLink } from '../../../packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.js';
import { makeDefaultBoards } from '@repo/plugin-web-board-core';
import { loadTaskColsOrSeed } from '@repo/plugin-web-tasks';
const receipt = { operationVersion: 1, signature: 'tasks:create:v1', result: { ok: true, targetId: 't1' }, committedAt: '2026-09-09T12:00:00.000Z' };
const envelope = (data: unknown) => ({ format: 'xai-command-state', version: 1, revision: 4, data, receipts: { r1: receipt } });
const event = (date = '2026-09-09') => ({ id: 'e1', title: 'Persisted', startISO: `${date}T09:00`, endISO: `${date}T10:00`, colorPreset: 'mint' as const, recurrence: null, createdAt: '2026-09-09T12:00:00.000Z', updatedAt: '2026-09-09T12:00:00.000Z' });
const key = (logical: string) => accountScope.physicalKey(logical);
beforeEach(() => { localStorage.clear(); accountScope.activate(accountScope.lock('astra-b2'), 'g1'); });
afterEach(cleanup);

it.each(['0001-01-01','0004-02-29','0099-12-31','0100-02-28','2000-02-29','2024-02-29'])('migration accepts real low/leap date %s identically in legacy and envelope', date => {
  const data = { e1: event(date) };
  for (const value of [data, envelope(data)]) expect(accountMigrationIssue('xai_calendar_events', JSON.stringify(value))).toBeNull();
});
it.each(['0000-01-01','0100-02-29','1900-02-29','2026-04-31','2026-02-29'])('migration rejects impossible date %s without normalizing it', date => {
  const data = { e1: event(date) };
  for (const value of [data, envelope(data)]) expect(accountMigrationIssue('xai_calendar_events', JSON.stringify(value))).not.toBeNull();
});
it('owner validators distinguish empty datasets from legacy null, wrong shapes and mismatched identities', () => {
  const emptyTasks = loadTaskColsOrSeed(null).map(col => ({ ...col, tasks: [], completed: [], count: 0 }));
  for (const [name, data] of [['xai_calendar_events', {}], ['xai_task_cols', emptyTasks]] as const) {
    for (const value of [data, envelope(data)]) expect(accountMigrationIssue(name, JSON.stringify(value))).toBeNull();
    for (const value of [null, [], 1, false]) {
      expect(accountMigrationIssue(name, JSON.stringify(value))).not.toBeNull();
      expect(accountMigrationIssue(name, JSON.stringify(envelope(value)))).not.toBeNull();
    }
  }
  expect(accountMigrationIssue('xai_calendar_events', JSON.stringify(envelope({ wrong: event() })))).not.toBeNull();
});

it('actual selected import and raw export retain both envelopes byte-for-byte; account deletion removes only captured owner', async () => {
  const raws = { xai_task_cols: JSON.stringify(envelope(loadTaskColsOrSeed(null)), null, 2), xai_calendar_events: JSON.stringify(envelope({ e1: event('0004-02-29') }), null, 2) };
  for (const [name, raw] of Object.entries(raws)) localStorage.setItem(name, raw);
  const controller = createAccountScopeController(); const transition = controller.lock('imported');
  const marker = await migrateAccount({ storage: localStorage, controller, transition, choice: 'import', selectedKeys: Object.keys(raws), lock: async (_name, run) => run(), newId: () => 'b2-import' });
  const scope = controller.activate(transition, marker.generation);
  for (const [name, raw] of Object.entries(raws)) expect(localStorage.getItem(generationKey('imported', marker.generation, name))).toBe(raw);
  expect(exportAccountLocalData(scope).records).toEqual(raws);
  localStorage.setItem(generationKey('other', 'g1', 'xai_calendar_events'), 'other-bytes');
  deleteAccountLocalData(scope);
  for (const [name, raw] of Object.entries(raws)) { expect(localStorage.getItem(generationKey('imported', marker.generation, name))).toBeNull(); expect(localStorage.getItem(name)).toBe(raw); }
  expect(localStorage.getItem(generationKey('other', 'g1', 'xai_calendar_events'))).toBe('other-bytes');
});
it('actual selected import refuses domain-invalid envelope before committing a generation and keeps source bytes', async () => {
  const raw = JSON.stringify(envelope({ e1: event('1900-02-29') })); localStorage.setItem('xai_calendar_events', raw);
  const controller = createAccountScopeController();
  await expect(migrateAccount({ storage: localStorage, controller, transition: controller.lock('invalid'), choice: 'import', selectedKeys: ['xai_calendar_events'], lock: async (_name, run) => run(), newId: () => 'b2-invalid' })).rejects.toThrow(/invalid/);
  expect(localStorage.getItem('xai_calendar_events')).toBe(raw); expect(localStorage.getItem(generationMarkerKey('invalid'))).toBeNull();
});

it('calendar nonempty envelope projects valid data and reaches protected writer refusal instead of false baseline mismatch', () => {
  const data = { e1: event('0004-02-29') }; const raw = JSON.stringify(envelope(data)); localStorage.setItem(key('xai_calendar_events'), raw);
  const { result } = renderHook(() => useUserCalEvents()); expect(result.current.events).toEqual(data);
  expect(() => act(() => result.current.update('e1', { title: 'Change' }))).toThrow('Calendar changes were not saved');
  expect(result.current.events).toEqual(data); expect(localStorage.getItem(key('xai_calendar_events'))).toBe(raw);
});
it('calendar stale projected baseline and post-mount corruption reject without changing bytes or local data', () => {
  const data = { e1: event() }; localStorage.setItem(key('xai_calendar_events'), JSON.stringify(data));
  const { result } = renderHook(() => useUserCalEvents());
  for (const [raw, message] of [[JSON.stringify(envelope({ e1: { ...event(), title: 'External' } })), 'changed'], ['{broken', 'recovery']] as const) {
    localStorage.setItem(key('xai_calendar_events'), raw);
    expect(() => act(() => result.current.update('e1', { title: 'Local' }))).toThrow(message);
    expect(result.current.events).toEqual(data); expect(localStorage.getItem(key('xai_calendar_events'))).toBe(raw);
  }
});

it.each(['json-null','envelope-null'])('Board link refuses %s task source before publishing intent', mode => {
  const boards = JSON.stringify(makeDefaultBoards()); localStorage.setItem(key('xai_boards_v2'), boards);
  const raw = mode === 'json-null' ? 'null' : JSON.stringify(envelope(null)); localStorage.setItem(key('xai_task_cols'), raw);
  const result = ensureBoardTaskLink('b-default','bc1',accountScope.capture());
  const after = localStorage.getItem(key('xai_boards_v2'));
  console.log(mode, JSON.stringify({ result, taskBytesPreserved: localStorage.getItem(key('xai_task_cols')) === raw, boardBytesPreserved: after === boards }));
  expect(localStorage.getItem(key('xai_task_cols'))).toBe(raw);
  expect.soft(result).toMatchObject({ ok: false, phase: 'intent' });
  expect(after).toBe(boards);
});
it('Board link can acknowledge an existing linked task inside an envelope without writing task bytes', () => {
  localStorage.setItem(key('xai_boards_v2'), JSON.stringify(makeDefaultBoards()));
  expect(ensureBoardTaskLink('b-default','bc1',accountScope.capture())).toEqual({ ok: true });
  const raw = JSON.stringify(envelope(JSON.parse(localStorage.getItem(key('xai_task_cols'))!))); localStorage.setItem(key('xai_task_cols'),raw);
  expect(ensureBoardTaskLink('b-default','bc1',accountScope.capture())).toEqual({ ok: true });
  expect(localStorage.getItem(key('xai_task_cols'))).toBe(raw);
});

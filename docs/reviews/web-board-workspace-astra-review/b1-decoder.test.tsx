import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { accountScope } from '../../../packages/plugin-web-storage/src/internal/accountScope.js';
import { readCanonicalCommandSnapshot, readCanonicalCommandState, findCanonicalCommandReceipt } from '../../../packages/plugin-web-storage/src/internal/canonicalCommandState.js';
import { getPref, setPref, removePref, publishSameTab, _clearAllListeners } from '../../../packages/plugin-web-storage/src/internal/storage.js';
import { usePref } from '../../../packages/plugin-web-storage/src/internal/usePref.js';
import { accountMigrationIssue, registerAccountMigrationValidator } from '../../../packages/plugin-web-storage/src/internal/accountMigrationValidation.js';

const key = 'xai_task_cols';
const receipt = { operationVersion: 1, signature: 'task-create:v1:semantic-input', result: { ok: true, targetId: 't1' }, committedAt: '2026-09-09T12:00:00.000Z' };
const envelope = (data: unknown = { todo: [] }) => ({ format: 'xai-command-state', version: 1, revision: 0, data, receipts: { r1: receipt } });
const physical = () => accountScope.physicalKey(key);
beforeEach(() => { localStorage.clear(); accountScope.activate(accountScope.lock('astra-b1'), 'g1'); _clearAllListeners(); vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true); });
afterEach(() => { vi.restoreAllMocks(); });

it('physical missing is distinct from every decoded legacy JSON value and empty datasets; reads never write', () => {
  const writer = vi.spyOn(Storage.prototype, 'setItem');
  expect(readCanonicalCommandSnapshot(key).status).toBe('absent');
  for (const data of [null, [], {}, false, 0, '', { todo: [] }]) {
    const raw = JSON.stringify(data);
    localStorage.setItem(physical(), raw); writer.mockClear();
    expect(readCanonicalCommandSnapshot(key)).toEqual({ status: 'legacy', data });
    expect(writer).not.toHaveBeenCalled();
    expect(localStorage.getItem(physical())).toBe(raw);
  }
});

it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1, null, '1'])('rejects malformed envelope revision %s without rewriting', revision => {
  const raw = JSON.stringify({ ...envelope(), revision }); localStorage.setItem(physical(), raw);
  expect(readCanonicalCommandSnapshot(key).status).toBe('corrupt');
  expect(setPref(key, {})).toBe(false); removePref(key);
  expect(localStorage.getItem(physical())).toBe(raw);
});

it('accepts maximum safe revision and exact receipt count/id bounds; rejects overflow', () => {
  expect(readCanonicalCommandState({ ...envelope(), revision: Number.MAX_SAFE_INTEGER }).status).toBe('envelope');
  const receipts = Object.fromEntries(Array.from({ length: 512 }, (_, i) => [`r${i}`, receipt]));
  expect(readCanonicalCommandState({ ...envelope(), receipts }).status).toBe('envelope');
  expect(readCanonicalCommandState({ ...envelope(), receipts: { ...receipts, extra: receipt } }).status).toBe('corrupt');
  for (const [id, expected] of [['x'.repeat(192), 'envelope'], ['x'.repeat(193), 'corrupt'], ['', 'corrupt'], ['x\u007f', 'corrupt']]) {
    expect(readCanonicalCommandState({ ...envelope(), receipts: { [id]: receipt } }).status).toBe(expected);
  }
});

it('rejects invalid receipt shape and prevents inherited receipt hits', () => {
  for (const invalid of [null, [], { ...receipt, operationVersion: 2 }, { ...receipt, result: { ok: false, targetId: 't1' } }, { ...receipt, result: { ok: true, targetId: '' } }]) {
    expect(readCanonicalCommandState({ ...envelope(), receipts: { r1: invalid } }).status).toBe('corrupt');
  }
  const state = readCanonicalCommandState(envelope());
  if (state.status !== 'envelope') throw Error('expected valid envelope');
  expect(findCanonicalCommandReceipt(state.envelope, 'constructor')).toBeNull();
  expect(findCanonicalCommandReceipt(state.envelope, 'toString')).toBeNull();
  expect(findCanonicalCommandReceipt(state.envelope, 'r1')).toEqual(receipt);
});

it('preserves unsupported, invalid JSON, and JSON null bytes against legacy writes/removals', () => {
  for (const raw of [JSON.stringify({ ...envelope(), version: 2 }), '{bad', 'null']) {
    localStorage.setItem(physical(), raw);
    expect(setPref(key, {})).toBe(false); removePref(key);
    expect(localStorage.getItem(physical())).toBe(raw);
  }
});

it('classifies stale or locked owner as unavailable, without reading another account dataset', () => {
  const a = accountScope.capture(); localStorage.setItem(physical(), JSON.stringify(envelope()));
  accountScope.activate(accountScope.lock('astra-b1-b'), 'g2');
  expect(readCanonicalCommandSnapshot(key, a).status).toBe('unavailable');
  expect(readCanonicalCommandSnapshot(key).status).toBe('absent');
  accountScope.lock(); expect(readCanonicalCommandSnapshot(key).status).toBe('unavailable');
});

it('retains ordinary legacy write/read/removal behavior for absent and old data', () => {
  for (const data of [{ todo: [] }, []]) {
    expect(setPref(key, data)).toBe(true); expect(getPref(key)).toEqual(data);
    expect(readCanonicalCommandSnapshot(key)).toEqual({ status: 'legacy', data });
    removePref(key); expect(localStorage.getItem(physical())).toBeNull();
  }
});

it('unwraps migration only for domain validation and retains original envelope bytes', () => {
  const seen: unknown[] = [];
  const unregister = registerAccountMigrationValidator(key, value => { seen.push(value); return !!value && typeof value === 'object' && Object.hasOwn(value, 'todo'); });
  try {
    const data = { todo: [] }; const raw = JSON.stringify(envelope(data)); localStorage.setItem(physical(), raw);
    expect(accountMigrationIssue(key, raw)).toBeNull(); expect(seen).toEqual([data]);
    expect(accountMigrationIssue(key, JSON.stringify(data))).toBeNull();
    expect(accountMigrationIssue(key, JSON.stringify(envelope(null)))).not.toBeNull();
    expect(accountMigrationIssue(key, JSON.stringify({ ...envelope(), version: 2 }))).toContain('unsupported');
    expect(localStorage.getItem(physical())).toBe(raw);
  } finally { unregister(); }
});

it('projects initial mount, remount and domain-valued same-tab publications without leaking receipt metadata', async () => {
  const data = { todo: [] }; const raw = JSON.stringify(envelope(data)); localStorage.setItem(physical(), raw);
  let observed: unknown; let setter: (next: unknown) => boolean;
  function Probe() { const [value, set] = usePref(key); observed = value; setter = set; return null; }
  for (let i = 0; i < 2; i++) {
    const root = createRoot(document.createElement('div'));
    await act(async () => root.render(createElement(Probe)));
    expect(observed).toEqual(data);
    await act(async () => { expect(setter!({ changed: [] })).toBe(false); });
    expect(observed).toEqual(data); expect(localStorage.getItem(physical())).toBe(raw);
    await act(async () => publishSameTab(key, data)); expect(observed).toEqual(data);
    await act(async () => root.unmount());
  }
});

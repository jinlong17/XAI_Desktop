import { it, expect, vi } from 'vitest';
import { act, fireEvent } from '@testing-library/react';
import { accountScope } from '@repo/plugin-web-storage';
import { onWebEvent } from '@repo/xai-web-event-bus';
import { prefMutationLockName } from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import { fixture, cases, key, defaults, nativeGet, nativeSet, flush, hold, activate, timerBytes, withGuard, unload, deny, clickRetry, invoke, type Name } from './fixture';
fixture();

for (const row of cases) it(`${row.name}: discard clears only its actual failed draft, preserving successful siblings and timer bytes`, async () => {
  const { ui, guard } = withGuard(); await flush();
  const timers = timerBytes();
  deny([row.name]); row.act(ui); await flush();
  expect(row.visible(ui)).toBe(true);
  expect(nativeGet.call(localStorage, key(row.name))).toBe(JSON.stringify(defaults[row.name]));
  expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
  const before = Object.fromEntries(Object.keys(defaults).map(name => [name, nativeGet.call(localStorage, key(name as Name))]));
  const reads = vi.spyOn(Storage.prototype, 'getItem');
  const writes = vi.spyOn(Storage.prototype, 'setItem');
  await invoke(() => guard().discardDraft()); await flush();
  expect(guard().isBlocking()).toBe(false); expect(unload()).toBe(false);
  expect(row.visible(ui)).toBe(false);
  for (const name of Object.keys(defaults) as Name[]) {
    expect(nativeGet.call(localStorage, key(name))).toBe(before[name]);
    if (name !== row.name) expect(reads.mock.calls.filter(([k]) => k === key(name))).toHaveLength(0);
  }
  expect(writes.mock.calls.filter(([k]) => k.startsWith('xai_pref_pomodoro_'))).toHaveLength(0);
  expect(timerBytes()).toEqual(timers);
});

it('same-value successor failure stays a real draft after an earlier matching value committed', async () => {
  const { ui, guard } = withGuard(); await flush(); const release = await hold('theme');
  const manager = navigator.locks; let admissions = 0;
  vi.stubGlobal('navigator', { locks: { request: (name: string, options: unknown, callback: unknown) => {
    if (name === prefMutationLockName(key('theme')) && ++admissions === 2) return Promise.reject(Error('successor rejected'));
    return (manager.request as any)(name, options, callback);
  } } });
  fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  fireEvent.click(ui.getByTestId('theme-violet')); fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  await release();
  expect(admissions).toBe(2); expect(nativeGet.call(localStorage, key('theme'))).toBe('"blue"');
  expect(ui.getByTestId('theme-blue').getAttribute('aria-pressed')).toBe('true');
  expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
  vi.stubGlobal('navigator', { locks: manager });
  clickRetry(ui); await flush(); expect(guard().isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it('Retry during a predecessor pending save cannot attribute its success to a newer failed choice', async () => {
  const { ui, guard } = withGuard(); await flush(); const release = await hold('theme');
  fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  fireEvent.click(ui.getByTestId('theme-violet')); await flush();
  const fault = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, k: string, value: string) {
    if (k === key('theme') && value === '"violet"') throw new DOMException('quota', 'QuotaExceededError');
    nativeSet.call(this, k, value);
  });
  clickRetry(ui); await flush(); await release(); await flush();
  expect(nativeGet.call(localStorage, key('theme'))).toBe('"blue"');
  expect(ui.getByTestId('theme-violet').getAttribute('aria-pressed')).toBe('true');
  expect(guard().isBlocking(), 'the newer violet choice failed and is still a real unsaved draft').toBe(true);
  expect(unload()).toBe(true);
  fault.mockRestore(); clickRetry(ui); await flush();
  expect(nativeGet.call(localStorage, key('theme'))).toBe('"violet"'); expect(guard().isBlocking()).toBe(false);
});

for (const mode of ['unchanged', 'changed'] as const) it(`readback uncertainty ${mode}: departure tracks the actual token outcome without duplicate settlement`, async () => {
  const { ui, guard } = withGuard(); await flush(); let armed = false, count = 0;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, k: string, value: string) { nativeSet.call(this, k, value); if (k === key('theme')) { armed = true; count++; } });
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function(this: Storage, k: string) { if (k === key('theme') && armed) { armed = false; throw Error('readback denied'); } return nativeGet.call(this, k); });
  fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  expect(count).toBe(1); expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
  if (mode === 'changed') { fireEvent.click(ui.getByTestId('theme-violet')); await flush(); }
  clickRetry(ui); await flush();
  expect(count).toBe(1); expect(nativeGet.call(localStorage, key('theme'))).toBe('"blue"');
  expect(guard().isBlocking()).toBe(mode === 'changed'); expect(unload()).toBe(mode === 'changed');
  expect(ui.getByTestId(mode === 'changed' ? 'theme-violet' : 'theme-blue').getAttribute('aria-pressed')).toBe('true');
});

it('source-only repair is clean while repairing one source leaves another actual failed draft guarded', async () => {
  nativeSet.call(localStorage, key('sound'), 'null');
  const { ui, guard } = withGuard(); await flush();
  expect(guard().isBlocking()).toBe(false); expect(unload()).toBe(false);
  const fault = deny(['theme']); fireEvent.click(ui.getByTestId('theme-violet')); await flush();
  nativeSet.call(localStorage, key('sound'), '"bell"');
  fireEvent.click(ui.getByRole('button', { name: 'Reload preferences' })); await flush();
  expect((ui.getByTestId('sound-select') as HTMLSelectElement).value).toBe('bell');
  expect(ui.getByTestId('theme-violet').getAttribute('aria-pressed')).toBe('true');
  expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
  fault.mockRestore(); clickRetry(ui); await flush();
  expect(nativeGet.call(localStorage, key('sound'))).toBe('"bell"'); expect(guard().isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it('old epoch and disposed discard capabilities cannot clear surviving or successor device choices', async () => {
  const { ui, guard } = withGuard(); await flush(); deny(['theme']);
  fireEvent.click(ui.getByTestId('theme-blue')); await flush(); const old = guard();
  await invoke(() => activate('pomo-device-successor')); await flush();
  expect(old.isCurrent()).toBe(false); await invoke(() => old.discardDraft());
  expect(ui.getByTestId('theme-blue').getAttribute('aria-pressed')).toBe('true'); expect(unload()).toBe(true);
  const fresh = guard(); expect(fresh.isCurrent()).toBe(true); expect(fresh.isBlocking()).toBe(true);
  await invoke(() => accountScope.lock('locked')); await flush();
  expect(fresh.isCurrent()).toBe(false); await invoke(() => fresh.discardDraft());
  expect(guard().isBlocking()).toBe(true); const disposed = guard(); ui.unmount();
  expect(disposed.isCurrent()).toBe(false); disposed.discardDraft(); expect(unload()).toBe(false);
  expect(nativeGet.call(localStorage, key('theme'))).toBe('"coral"');
});

it('running timer is not a preference draft and preference discard leaves its actual active record untouched', async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-09T10:00:00Z'));
  const { ui, guard } = withGuard(); await flush(); fireEvent.click(ui.getByTestId('start-btn')); await flush();
  const timers = timerBytes(); expect(JSON.parse(timers.active!).phase).toBe('running');
  expect(guard().isBlocking()).toBe(false); expect(unload()).toBe(false);
  deny(['theme']); fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  expect(guard().isBlocking()).toBe(true); await invoke(() => guard().discardDraft()); await flush();
  expect(guard().isBlocking()).toBe(false); expect(unload()).toBe(false); expect(timerBytes()).toEqual(timers);
});

it('completion-driven failed next preset is a draft; successful retry releases it without replaying history or event', async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-09T10:00:00Z')); nativeSet.call(localStorage, key('muted'), 'true');
  const events: unknown[] = []; const off = onWebEvent('web:pomodoro:session-finished', event => events.push(event));
  try {
    const { ui, guard } = withGuard(); await flush(); fireEvent.click(ui.getByTestId('preset-custom'));
    fireEvent.change(ui.getByTestId('custom-minutes-input'), { target: { value: '1' } }); await flush();
    fireEvent.click(ui.getByTestId('start-btn')); await flush(); const active = JSON.parse(timerBytes().active!);
    const fault = deny(['preset']); await act(async () => { await vi.advanceTimersByTimeAsync(61000); }); await flush();
    const before = timerBytes(); const history = JSON.parse(before.history!);
    expect(history).toHaveLength(1); expect(history[0]).toMatchObject({ id: active.sessionId, completed: true, durationMs: 60000, elapsedMs: 60000 }); expect(events).toHaveLength(1);
    expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
    fault.mockRestore(); clickRetry(ui); await flush();
    expect(nativeGet.call(localStorage, key('preset'))).toBe('"break-5"'); expect(guard().isBlocking()).toBe(false); expect(unload()).toBe(false);
    expect(timerBytes()).toEqual(before); expect(events).toHaveLength(1);
  } finally { off(); }
});

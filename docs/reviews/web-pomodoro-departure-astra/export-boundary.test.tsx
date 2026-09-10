import { it, expect, vi } from 'vitest';
import { act, fireEvent } from '@testing-library/react';
import { fixture, cases, key, defaults, nativeGet, nativeSet, flush, activate, withGuard, unload, deny, exportCapture, invoke, type Name } from './fixture';
fixture();
const exportButton = (ui: ReturnType<typeof withGuard>['ui']) => ui.getByRole('button', { name: 'Export current preferences' });
const expected = { version: 1, kind: 'pomodoro-preference-draft', values: { preset: 'custom', customMinutes: 47, displayStyle: 'minimal', theme: 'blue', sound: 'bell', muted: true } };

it('all six latest choices export from memory under full storage denial, retaining the complete schema and draft guard', async () => {
  const { ui, guard } = withGuard(); await flush(); deny(Object.keys(defaults) as Name[]);
  for (const row of cases) row.act(ui); await flush();
  const before = Object.keys(defaults).map(name => nativeGet.call(localStorage, key(name as Name)));
  const capture = exportCapture();
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
  fireEvent.click(exportButton(ui)); await flush();
  expect(capture.clicks).toEqual(['pomodoro-preferences.json']); expect(await capture.json()).toEqual(expected);
  expect(Object.keys(defaults).map(name => nativeGet.call(localStorage, key(name as Name)))).toEqual(before);
  expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
  expect(document.querySelector('a[download="pomodoro-preferences.json"]')).toBeNull();
});

for (const stage of ['url', 'append', 'click'] as const) it(`export ${stage} failure preserves current choices, original save failure and guard; cleans temporary resources`, async () => {
  const { ui, guard } = withGuard(); await flush(); deny(['theme']); fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  const capture = exportCapture();
  if (stage === 'url') vi.spyOn(URL, 'createObjectURL').mockImplementation(() => { throw Error('URL failed'); });
  if (stage === 'append') {
    const append = document.body.appendChild.bind(document.body);
    vi.spyOn(document.body, 'appendChild').mockImplementation(node => { if (node instanceof HTMLAnchorElement) throw Error('append failed'); return append(node); });
  }
  if (stage === 'click') vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { throw Error('click failed'); });
  fireEvent.click(exportButton(ui));
  expect(ui.getByText('Preference export failed. Please retry.')).toBeTruthy();
  expect(ui.getByRole('button', { name: 'Retry preferences' })).toBeTruthy();
  expect(ui.getByTestId('theme-blue').getAttribute('aria-pressed')).toBe('true');
  expect(nativeGet.call(localStorage, key('theme'))).toBe('"coral"');
  expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 1100)); });
  expect(document.querySelector('a[download="pomodoro-preferences.json"]')).toBeNull();
  if (stage !== 'url') expect(capture.revoke).toHaveBeenCalledWith('blob:astra-pomo');
});

it('old export capability refuses after owner change while a fresh device-only capability exports the same six-value snapshot', async () => {
  const { ui, guard } = withGuard(); await flush(); deny(['theme']); fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  const old = guard(); const capture = exportCapture(); await invoke(() => activate('pomo-export-next')); await flush();
  expect(old.isCurrent()).toBe(false); old.exportDraft(); expect(capture.clicks).toHaveLength(0);
  const fresh = guard(); expect(fresh.isCurrent()).toBe(true); expect(fresh.isBlocking()).toBe(true);
  await invoke(() => fresh.exportDraft());
  expect(capture.clicks).toEqual(['pomodoro-preferences.json']);
  expect(await capture.json()).toEqual({ version: 1, kind: 'pomodoro-preference-draft', values: { preset: 'focus-25', customMinutes: 45, displayStyle: 'apple', theme: 'blue', sound: 'soft-chime', muted: false } });
  expect(unload()).toBe(true); ui.unmount(); const before = capture.clicks.length;
  fresh.exportDraft(); expect(capture.clicks).toHaveLength(before); expect(fresh.isCurrent()).toBe(false);
});

it('owner change during actual URL setup revokes the export before click and leaves surviving device work guarded', async () => {
  const { ui, guard } = withGuard(); await flush(); deny(['theme']); fireEvent.click(ui.getByTestId('theme-blue')); await flush();
  const capture = exportCapture();
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => { activate('pomo-url-boundary'); return 'blob:astra-pomo'; });
  await invoke(() => fireEvent.click(exportButton(ui))); await flush();
  expect(capture.clicks).toHaveLength(0);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 1100)); });
  expect(capture.revoke).toHaveBeenCalledWith('blob:astra-pomo');
  expect(document.querySelector('a[download="pomodoro-preferences.json"]')).toBeNull();
  expect(ui.getByTestId('theme-blue').getAttribute('aria-pressed')).toBe('true');
  expect(guard().isBlocking()).toBe(true); expect(unload()).toBe(true);
  expect(nativeGet.call(localStorage, key('theme'))).toBe('"coral"');
});

it('partial success exports complete current values without turning saved siblings into discard targets', async () => {
  const { ui, guard } = withGuard(); await flush(); deny(['theme']);
  fireEvent.click(ui.getByTestId('theme-blue')); fireEvent.change(ui.getByTestId('sound-select'), { target: { value: 'bell' } }); await flush();
  expect(nativeGet.call(localStorage, key('sound'))).toBe('"bell"');
  const capture = exportCapture(); fireEvent.click(exportButton(ui));
  expect(await capture.json()).toEqual({ version: 1, kind: 'pomodoro-preference-draft', values: { preset: 'focus-25', customMinutes: 45, displayStyle: 'apple', theme: 'blue', sound: 'bell', muted: false } });
  const writes = vi.spyOn(Storage.prototype, 'setItem'); const reads = vi.spyOn(Storage.prototype, 'getItem');
  await invoke(() => guard().discardDraft()); await flush();
  expect(reads.mock.calls.filter(([k]) => k === key('sound'))).toHaveLength(0);
  expect(writes.mock.calls.filter(([k]) => k.startsWith('xai_pref_pomodoro_'))).toHaveLength(0);
  expect(nativeGet.call(localStorage, key('sound'))).toBe('"bell"'); expect(unload()).toBe(false);
});

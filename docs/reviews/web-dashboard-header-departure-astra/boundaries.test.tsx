import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent } from '@testing-library/react';
import { accountScope } from '@repo/plugin-web-storage';
import { activate, beginMove, captureDownload, changeNote, finishMove, flush, guard, mount, move, nativeGet, nativeSet, noteKey, offsetKey, setup, unload } from '../web-dashboard-header-departure-sol/fixture';
beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('a moved offset rejected by caller raw preflight remains guarded and exportable', async () => {
  const ui = mount(); await flush(); beginMove(ui.note); move(ui.note, 60);
  nativeSet.call(localStorage, offsetKey, '95'); // Actual external write after gesture baseline; no event is required for raw validation.
  finishMove(ui.note, 60); await flush();
  expect(nativeGet.call(localStorage, offsetKey)).toBe('95');
  expect(ui.note.style.getPropertyValue('--dash-note-x')).toBe('60px');
  expect(unload()).toBe(true);
  expect(guard()?.isBlocking(), 'real rejected moved intent must not disappear from host protection').toBe(true);
  const download = captureDownload(); await act(async () => { guard()?.exportDraft(); });
  expect(await download.read()).toEqual({version:1,kind:'dashboard-note-draft',note:'Original A',noteOffset:60});
  expect(guard()?.isBlocking()).toBe(true);
  await act(async () => { guard()?.discardDraft(); }); await flush();
  expect(ui.note.style.getPropertyValue('--dash-note-x')).toBe('95px'); expect(guard()?.isBlocking()).toBe(false);
  expect(nativeGet.call(localStorage, offsetKey)).toBe('95');
});

it('unavailable source plus an unmoved pointer press does not fabricate an unload draft', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function(this: Storage, key: string) {
    if (key === offsetKey) throw Error('source read denied'); return nativeGet.call(this, key);
  });
  const ui = mount(); await flush(); expect(unload()).toBe(false);
  beginMove(ui.note); finishMove(ui.note, 0); await flush();
  expect(ui.getByRole('button', { name:'Reload note position' })).toBeTruthy();
  expect(nativeGet.call(localStorage, offsetKey)).toBe('0');
  expect(guard()?.isBlocking()).toBe(false);
  expect(unload(), 'no movement or submitted value exists').toBe(false);
});

it('a retained inline export action cannot adopt a new scope before its account projection renders', async () => {
  const ui = mount(); await flush(); beginMove(ui.note); move(ui.note, 40);
  const oldButton = ui.getByRole('button', { name:'Export note draft' });
  const download = captureDownload();
  await act(async () => { activate('inline-B'); fireEvent.click(oldButton); });
  if (download.click.mock.calls.length) expect.soft((await download.read()).note, 'old A projection must never be disclosed by a newly captured B decision').not.toBe('Original A');
  expect(download.click, 'the previous rendered action has no current B projection/decision authority yet').not.toHaveBeenCalled();
  expect(nativeGet.call(localStorage, noteKey)).toBe('Original A');
});

it('after the owner projection renders, fresh current device export contains B rather than A', async () => {
  const ui = mount(); await flush(); beginMove(ui.note); move(ui.note, 40);
  await act(async () => { activate('inline-B'); nativeSet.call(localStorage, accountScope.physicalKey('xai_pref_dashboard_header_note'), 'Current B'); });
  await flush();
  const download = captureDownload(); await act(async () => { guard()?.exportDraft(); });
  expect(download.click).toHaveBeenCalledOnce();
  expect(await download.read()).toEqual({version:1,kind:'dashboard-note-draft',note:'Current B',noteOffset:40});
  expect(guard()?.isBlocking()).toBe(true); expect(nativeGet.call(localStorage, noteKey)).toBe('Original A');
});

it('successful Same predecessor cannot clear a new failed Same submission after intervening edits', async () => {
  const ui = mount(); await flush();
  changeNote(ui, 'Same'); ui.save(); await flush(30);
  expect(ui.queryByRole('textbox')).toBeNull();
  expect(nativeGet.call(localStorage, noteKey)).toBe('Same'); expect(guard()?.isBlocking()).toBe(false);
  ui.edit(); fireEvent.change(ui.input(), {target:{value:'Intervening'}});
  fireEvent.change(ui.input(), {target:{value:'Same'}});
  const fault = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function(this: Storage, key: string) {
    if (key === noteKey) throw Error('new explicit Same submission cannot verify its baseline');
    return nativeGet.call(this, key);
  });
  ui.save(); await flush();
  expect(fault.mock.calls.filter(([key]) => key === noteKey).length).toBeGreaterThan(0);
  expect(ui.getByText(/account or saved content changed/i)).toBeTruthy();
  expect(nativeGet.call(localStorage, noteKey)).toBe('Same'); expect(ui.input().value).toBe('Same');
  expect(guard()?.isBlocking(), 'equal persisted text cannot erase a newer refused explicit Save').toBe(true);
  expect(unload()).toBe(true);
  fault.mockRestore(); await act(async () => { guard()?.discardDraft(); }); await flush();
  expect(nativeGet.call(localStorage, noteKey)).toBe('Same'); expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

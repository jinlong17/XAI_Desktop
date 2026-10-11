import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent } from '@testing-library/react';
import { accountScope } from '@repo/plugin-web-storage';
import { prefMutationLockName } from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import { activate, beginMove, captureDownload, changeNote, finishMove, flush, guard, mount, move, nativeGet, nativeSet, noteKey, offsetKey, setup, unload } from '../web-dashboard-header-departure-sol/fixture';
beforeEach(setup);
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const isKey = (key: string) => key === noteKey || key === offsetKey;
const enter = (ui: ReturnType<typeof mount>, value: string) => {
  if (!ui.queryByRole('textbox')) ui.edit();
  if (!ui.queryByRole('textbox')) ui.edit(); // The first post-drag click is deliberately suppressed.
  fireEvent.change(ui.input(), {target:{value}});
};
const drag = (ui: ReturnType<typeof mount>, delta: number, id = 7) => { beginMove(ui.note,id); move(ui.note,delta,id); finishMove(ui.note,delta,id); };

for (const failed of ['note','offset'] as const) it(`discard failed ${failed} neither reads nor writes its saved sibling`, async () => {
  const ui = mount(); await flush();
  if (failed === 'note') { drag(ui,40); await flush(30); }
  else { changeNote(ui,'Saved current note'); ui.save(); await flush(30); }
  const failedKey = failed === 'note' ? noteKey : offsetKey;
  const sibling = failed === 'note' ? offsetKey : noteKey;
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this: Storage,key:string,value:string){ if(key===failedKey) throw Error('quota'); nativeSet.call(this,key,value); });
  if (failed === 'note') { enter(ui,'Failed latest note'); ui.save(); }
  else drag(ui,60);
  await flush(30); expect(guard()?.isBlocking()).toBe(true);
  const savedBytes = nativeGet.call(localStorage,sibling);
  const reads = vi.spyOn(Storage.prototype,'getItem'); const writes = vi.spyOn(Storage.prototype,'setItem'); const removes = vi.spyOn(Storage.prototype,'removeItem');
  writes.mockClear(); await act(async()=>{ guard()?.discardDraft(); }); await flush(30);
  expect(reads.mock.calls.filter(([key])=>key===sibling)).toHaveLength(0);
  expect(writes.mock.calls.filter(([key])=>isKey(key))).toHaveLength(0);
  expect(removes.mock.calls.filter(([key])=>isKey(key))).toHaveLength(0);
  expect(nativeGet.call(localStorage,sibling)).toBe(savedBytes);
  expect(nativeGet.call(localStorage,noteKey)).toBe(failed==='note'?'Original A':'Saved current note');
  expect(nativeGet.call(localStorage,offsetKey)).toBe(failed==='note'?'40':'0');
  expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

it('source-only offset Reload cannot reread or discard a failed note and its original Retry',async()=>{
  nativeSet.call(localStorage,offsetKey,'null'); const ui=mount(); await flush();
  const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===noteKey)throw Error('note quota');nativeSet.call(this,key,value);});
  changeNote(ui,'Keep note recovery');ui.save();await flush(30);
  nativeSet.call(localStorage,offsetKey,'80'); const reads=vi.spyOn(Storage.prototype,'getItem'); fault.mockClear();
  fireEvent.click(ui.getByRole('button',{name:'Reload note position'}));await flush(30);
  expect(reads.mock.calls.filter(([key])=>key===noteKey)).toHaveLength(0);
  expect(fault.mock.calls.filter(([key])=>isKey(key))).toHaveLength(0);
  expect(ui.note.style.getPropertyValue('--dash-note-x')).toBe('80px');expect(ui.input().value).toBe('Keep note recovery');
  expect(guard()?.isBlocking()).toBe(true);expect(unload()).toBe(true);
  fault.mockRestore();fireEvent.click(ui.getByRole('button',{name:'Retry note save'}));await flush(30);
  expect(nativeGet.call(localStorage,noteKey)).toBe('Keep note recovery');expect(nativeGet.call(localStorage,offsetKey)).toBe('80');expect(guard()?.isBlocking()).toBe(false);
});

for(const stage of ['blob','url','append'] as const) it(`${stage} export failure cleans resources without changing draft or sources`,async()=>{
  const ui=mount();await flush();changeNote(ui,'Latest unsaved memory');
  const download=captureDownload();const before=[nativeGet.call(localStorage,noteKey),nativeGet.call(localStorage,offsetKey)];
  if(stage==='blob')vi.stubGlobal('Blob',class {constructor(){throw Error('Blob setup failed');}});
  if(stage==='url')vi.spyOn(URL,'createObjectURL').mockImplementation(()=>{throw Error('URL failed');});
  if(stage==='append'){const original=document.body.appendChild.bind(document.body);vi.spyOn(document.body,'appendChild').mockImplementation(node=>{if(node instanceof HTMLAnchorElement)throw Error('append failed');return original(node);});}
  const writes=vi.spyOn(Storage.prototype,'setItem');const removes=vi.spyOn(Storage.prototype,'removeItem');
  fireEvent.click(ui.getByRole('button',{name:'Export note draft'}));await flush();
  expect(download.click).not.toHaveBeenCalled();expect(ui.getByText('Export failed. Please retry.')).toBeTruthy();
  expect(ui.input().value).toBe('Latest unsaved memory');expect(guard()?.isBlocking()).toBe(true);expect(unload()).toBe(true);
  expect([nativeGet.call(localStorage,noteKey),nativeGet.call(localStorage,offsetKey)]).toEqual(before);
  expect(writes.mock.calls.filter(([key])=>isKey(key))).toHaveLength(0);expect(removes.mock.calls.filter(([key])=>isKey(key))).toHaveLength(0);
  expect(document.querySelector('a[download="dashboard-note-draft.json"]')).toBeNull();
  if(stage==='append')expect(download.revoke).toHaveBeenCalledWith('blob:header-sol');
});

it('inline append-time epoch change cancels download and preserves current device recovery',async()=>{
  const ui=mount();await flush();beginMove(ui.note);move(ui.note,40);
  const download=captureDownload();const original=document.body.appendChild.bind(document.body);
  const append=vi.spyOn(document.body,'appendChild').mockImplementation(node=>{const result=original(node);if(node instanceof HTMLAnchorElement)activate('append-B');return result;});
  fireEvent.click(ui.getByRole('button',{name:'Export note draft'}));await flush();
  expect(download.click).not.toHaveBeenCalled();expect(download.revoke).toHaveBeenCalledWith('blob:header-sol');
  expect(document.querySelector('a[download="dashboard-note-draft.json"]')).toBeNull();expect(guard()?.isBlocking()).toBe(true);
  expect(nativeGet.call(localStorage,noteKey)).toBe('Original A');append.mockRestore();
});

it('fresh locked device export reads no account or device storage and emits empty note',async()=>{
  const ui=mount();await flush();beginMove(ui.note);move(ui.note,40);act(()=>accountScope.lock('locked'));await flush();
  const download=captureDownload();const reads=vi.spyOn(Storage.prototype,'getItem');const writes=vi.spyOn(Storage.prototype,'setItem');const removes=vi.spyOn(Storage.prototype,'removeItem');
  await act(async()=>{guard()?.exportDraft();});
  expect(await download.read()).toEqual({version:1,kind:'dashboard-note-draft',note:'',noteOffset:40});
  expect(reads).not.toHaveBeenCalled();expect(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();expect(guard()?.isBlocking()).toBe(true);
});

for(const retry of ['none','success','quota'] as const) it(`preflight-failed newer gesture settles according to its own Retry=${retry} outcome`,async()=>{
  const ui=mount();await flush();let release!:()=>void;let entered!:()=>void;
  const ready=new Promise<void>(resolve=>{entered=resolve;});const gate=new Promise<void>(resolve=>{release=resolve;});
  const held=navigator.locks.request(prefMutationLockName(offsetKey),{mode:'exclusive'},()=>{entered();return gate;});await ready;
  try{
    drag(ui,40);await flush();beginMove(ui.note,8);move(ui.note,30,8);
    let armed=true;const read=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,key:string){if(key===offsetKey&&armed){armed=false;throw Error('transient newer preflight read failure');}return nativeGet.call(this,key);});
    finishMove(ui.note,30,8);await flush();read.mockRestore();
    expect(ui.note.style.getPropertyValue('--dash-note-x')).toBe('70px');expect(guard()?.isBlocking()).toBe(true);
    if(retry==='quota')vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===offsetKey&&value==='70')throw Error('actual new70 retry quota');nativeSet.call(this,key,value);});
    if(retry!=='none'){fireEvent.click(ui.getByRole('button',{name:'Retry note save'}));await flush();}
  }finally{await act(async()=>{release();await held;});}
  await flush(30);
  // An explicit Retry may legitimately save the newer value after the transient
  // read error clears. Only its own physical success can release that draft.
  expect.soft(nativeGet.call(localStorage,offsetKey)).toBe(retry==='success'?'70':'40');
  expect.soft(ui.note.style.getPropertyValue('--dash-note-x'),'the failed newer70 is not the verified predecessor40').toBe('70px');
  expect.soft(guard()?.isBlocking()).toBe(retry!=='success');expect(unload()).toBe(retry!=='success');
});


it('unchanged uncertain Retry retains its original verification token across a transient Retry preflight read denial', async () => {
  const ui = mount(); await flush();
  let failReadback = false;
  let failRetryPreflight = false;
  let writes = 0;
  let preflightDenials = 0;
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, key: string, value: string) {
    nativeSet.call(this, key, value);
    if (key === offsetKey) { writes += 1; failReadback = true; }
  });
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function(this: Storage, key: string) {
    if (key === offsetKey && failReadback) { failReadback = false; throw Error('uncertain physical commit readback'); }
    if (key === offsetKey && failRetryPreflight) { failRetryPreflight = false; preflightDenials += 1; throw Error('Retry preflight temporarily unavailable'); }
    return nativeGet.call(this, key);
  });
  drag(ui, 40); await flush(30);
  expect(nativeGet.call(localStorage, offsetKey)).toBe('40');
  expect(writes).toBe(1); expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true);
  failRetryPreflight = true;
  fireEvent.click(ui.getByRole('button', {name: 'Retry note save'})); await flush(30);
  expect(preflightDenials).toBe(1); expect(writes).toBe(1);
  expect(guard()?.isBlocking()).toBe(true); expect(unload()).toBe(true);
  fireEvent.click(ui.getByRole('button', {name: 'Retry note save'})); await flush(30);
  expect(writes, 'retry verifies the already committed operation without writing its equal value again').toBe(1);
  expect(nativeGet.call(localStorage, offsetKey)).toBe('40');
  expect(nativeGet.call(localStorage, noteKey)).toBe('Original A');
  expect(ui.note.style.getPropertyValue('--dash-note-x')).toBe('40px');
  expect(guard()?.isBlocking()).toBe(false); expect(unload()).toBe(false);
});

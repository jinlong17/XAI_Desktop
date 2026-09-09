import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { accountScope, generationKey } from '../internal/accountScope.js';
import { usePref } from '../internal/usePref.js';
import { usePrefAutosave } from '../internal/usePrefAutosave.js';
import { setPref } from '../internal/storage.js';
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => { localStorage.clear(); accountScope.activate(accountScope.lock('A'),'one'); container=document.createElement('div');document.body.appendChild(container);root=createRoot(container); });
afterEach(() => { act(()=>root.unmount()); container.remove(); });
it('hides the previous account value and prevents a captured hook setter writing to B', async () => {
  setPref('xai_ai_convos',[{id:'A'}]);
  let setter: (value: unknown[])=>void = ()=>{};
  function Consumer() { const [value,setValue]=usePref('xai_ai_convos');setter=setValue;return createElement('div',null,JSON.stringify(value)); }
  await act(async()=>root.render(createElement(Consumer)));
  expect(container.textContent).toContain('A');
  const oldSetter=setter;
  await act(async()=> { accountScope.activate(accountScope.lock('B'),'one'); });
  expect(container.textContent).toBe('[]');
  await act(async()=>oldSetter([{id:'late A'}]));
  expect(localStorage.getItem(generationKey('B','one','xai_ai_convos'))).toBeNull();
  expect(localStorage.getItem(generationKey('A','one','xai_ai_convos'))).toBe('[{"id":"A"}]');
});
it('ignores storage events for another account and legacy unscoped keys', async () => {
  function Consumer() { const [value]=usePref('xai_ai_convos'); return createElement('div',null,JSON.stringify(value)); }
  await act(async()=>root.render(createElement(Consumer)));
  for(const key of [generationKey('B','one','xai_ai_convos'),'xai_ai_convos']) {
    await act(async()=>window.dispatchEvent(new StorageEvent('storage',{key,newValue:'[{"id":"foreign"}]',storageArea:localStorage})));
    expect(container.textContent).toBe('[]');
  }
  await act(async()=>window.dispatchEvent(new StorageEvent('storage',{key:generationKey('A','one','xai_ai_convos'),newValue:'[{"id":"owned"}]',storageArea:localStorage})));
  expect(container.textContent).toContain('owned');
});
it('cancels an old mounted autosave after identity changes', async () => {
  function Consumer({note}:{note:string}) { usePrefAutosave('dashboard_header_note',note,{codec:'string'});return null; }
  await act(async()=>root.render(createElement(Consumer,{note:'A note'})));
  accountScope.activate(accountScope.lock('B'),'one');
  await act(async()=>root.render(createElement(Consumer,{note:'delayed A note'})));
  expect(localStorage.getItem(generationKey('B','one','xai_pref_dashboard_header_note'))).toBeNull();
  expect(localStorage.getItem(generationKey('A','one','xai_pref_dashboard_header_note'))).toBe('A note');
});

import { beforeEach, expect, it } from 'vitest';
import { accountScope, accountPrefix, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import { readGeneration } from '../internal/accountMigration.js';
import { deleteAccountLocalData, exportAccountLocalData } from '../internal/accountDataLifecycle.js';
import { lifecycleForKey } from '../internal/lifecycleDeclaration.js';
beforeEach(()=>localStorage.clear());
it.each(['xai_pomodoro_active', 'xai_meditation_active'])('exports and erases durable timer %s without erasing another owner or unassigned recovery data', (key)=>{
  const a=accountScope.activate(accountScope.lock('A'),'current');
  // Recovery exports must retain raw bytes, even when a timer record is damaged.
  const raw=' {"phase":"running","deadline":1234, "damaged":';
  localStorage.setItem(generationKey('A','current',key),raw);
  localStorage.setItem(generationKey('A','prior',key),'prior generation');
  localStorage.setItem(generationKey('B','current',key),'B timer');
  localStorage.setItem(key,'unassigned timer');
  localStorage.setItem('xai_pref_pomodoro_muted','true');
  const b=accountScope.activate(accountScope.lock('B'),'current');
  expect(lifecycleForKey(key)).toMatchObject({ownership:'account',exportScope:'account-current-generation',accountDeletion:'erase-owned-generations'});
  expect(exportAccountLocalData(a).records).toEqual({[key]:raw});
  deleteAccountLocalData(a);
  expect(localStorage.getItem(generationKey('A','current',key))).toBeNull();
  expect(localStorage.getItem(generationKey('A','prior',key))).toBeNull();
  expect(localStorage.getItem(generationKey('B','current',key))).toBe('B timer');
  expect(localStorage.getItem(key)).toBe('unassigned timer');
  expect(localStorage.getItem('xai_pref_pomodoro_muted')).toBe('true');
  expect(accountScope.isReady(b)).toBe(true);
  expect(()=>accountScope.physicalKey(key,a)).toThrow();
});
it('cleans captured A after a switch without removing B, preferences or unowned records',()=>{
  const a=accountScope.activate(accountScope.lock('A'),'one');
  localStorage.setItem(generationKey('A','one','xai_ai_convos'),'A');
  localStorage.setItem(generationMarkerKey('A'),'{"generation":"one"}');
  localStorage.setItem('xai_ai_convos','unowned');
  localStorage.setItem('xai_pref_theme','dark');
  const b=accountScope.activate(accountScope.lock('B'),'one');
  localStorage.setItem(generationKey('B','one','xai_ai_convos'),'B');
  deleteAccountLocalData(a);
  expect(localStorage.getItem(generationKey('A','one','xai_ai_convos'))).toBeNull();
  expect(localStorage.getItem(generationKey('B','one','xai_ai_convos'))).toBe('B');
  expect(localStorage.getItem('xai_ai_convos')).toBe('unowned');
  expect(localStorage.getItem('xai_pref_theme')).toBe('dark');
  expect(accountScope.isReady(b)).toBe(true);
});
it('exports only the captured account generation including private open-ended preferences',()=>{
  const a=accountScope.activate(accountScope.lock('A'),'one');
  localStorage.setItem(generationKey('A','one','xai_pref_custom'),'A private');
  localStorage.setItem(generationKey('B','one','xai_ai_convos'),'B');
  localStorage.setItem('xai_ai_convos','legacy');
  accountScope.activate(accountScope.lock('B'),'one');
  expect(exportAccountLocalData(a).records).toEqual({xai_pref_custom:'A private'});
});
it('tombstones prevent an old account from re-creating removed data',()=>{
  const a=accountScope.activate(accountScope.lock('A'),'one');
  deleteAccountLocalData(a);
  expect(()=>accountScope.physicalKey('xai_ai_convos',a)).toThrow();
  expect(accountScope.physicalKey('xai_pref_theme',a)).toBe('xai_pref_theme');
});

it('preserves a deletion recovery receipt and enforces the tombstone while cleanup retries',()=>{
  const a=accountScope.activate(accountScope.lock('A'),'one');
  const key=accountPrefix('A')+'deleted';
  const receipt=JSON.stringify({version:1,accountId:'A',kind:'account',generation:'one',phase:'pending',updatedAt:123});
  localStorage.setItem(key,receipt);
  localStorage.setItem(generationKey('A','one','xai_ai_convos'),'private');
  deleteAccountLocalData(a);
  expect(localStorage.getItem(key)).toBe(receipt);
  expect(()=>accountScope.physicalKey('xai_ai_convos',a)).toThrow();
  expect(()=>readGeneration(localStorage,'A')).toThrow(/deleted/);
});

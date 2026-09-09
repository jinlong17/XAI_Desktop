import { beforeEach, expect, it } from 'vitest';
import { accountScope, accountPrefix, ACCOUNT_LOCAL_KEYS, generationKey, exportAccountLocalData, deleteAccountLocalData, inspectLegacy } from '../../../packages/plugin-web-storage/src/index.js';
import { createSeedBookkeepingState, readBookkeepingState, BOOKKEEPING_STATE_KEY, BOOKKEEPING_DASH_ORDER_KEY } from '../../../packages/plugin-web-bookkeeping/src/index.js';
beforeEach(()=>localStorage.clear());
it('exports all 38 declared account keys byte-for-byte and deletes all owned generations only',()=>{
 const scope=accountScope.activate(accountScope.lock('A'),'current');
 for (const key of ACCOUNT_LOCAL_KEYS) localStorage.setItem(generationKey('A','current',key), 'raw:'+key);
 localStorage.setItem(generationKey('A','prior','xai_tt_entries_v2'),'previous');
 localStorage.setItem(generationKey('B','current','xai_tt_entries_v2'),'other account');
 const records=exportAccountLocalData(scope).records;
 expect(Object.keys(records)).toHaveLength(38);
 for (const key of ACCOUNT_LOCAL_KEYS) expect(records[key]).toBe('raw:'+key);
 deleteAccountLocalData(scope);
 expect(localStorage.getItem(generationKey('A','prior','xai_tt_entries_v2'))).toBeNull();
 expect(localStorage.getItem(generationKey('B','current','xai_tt_entries_v2'))).toBe('other account');
 expect(localStorage.getItem(accountPrefix('A')+'deleted')).toBe('1');
});
it('account export and erasure deliberately omit device layout, unowned bytes and global recovery archives',()=>{
 const scope=accountScope.activate(accountScope.lock('A'),'current');
 localStorage.setItem('xai_bk_dash_order','quick-first');
 localStorage.setItem('xai_tt_entries_v2','unowned legacy');
 localStorage.setItem('xai:legacy:v1:archive:old','raw recovery archive');
 expect(exportAccountLocalData(scope).records).toEqual({});
 expect(inspectLegacy(localStorage)).toEqual({xai_tt_entries_v2:'unowned legacy'});
 deleteAccountLocalData(scope);
 expect(localStorage.getItem('xai_bk_dash_order')).toBe('quick-first');
 expect(localStorage.getItem('xai_tt_entries_v2')).toBe('unowned legacy');
 expect(localStorage.getItem('xai:legacy:v1:archive:old')).toBe('raw recovery archive');
});
it('record-only reconstruction cannot reproduce bookkeeping layout overridden by device preferences',()=>{
 const scope=accountScope.activate(accountScope.lock('A'),'current');
 const seed=createSeedBookkeepingState();
 seed.prefs.dashboardOrder='bills-first';
 localStorage.setItem(generationKey('A','current',BOOKKEEPING_STATE_KEY),JSON.stringify(seed));
 localStorage.setItem(BOOKKEEPING_DASH_ORDER_KEY,'quick-first');
 expect(readBookkeepingState(scope).prefs.dashboardOrder).toBe('quick-first');
 const exported=exportAccountLocalData(scope);
 // This reconstructs raw records in an isolated empty browser-like store. No restore UI exists.
 localStorage.clear();
 for (const [key,value] of Object.entries(exported.records)) localStorage.setItem(generationKey('A','current',key),value);
 expect(readBookkeepingState(scope).prefs.dashboardOrder).toBe('bills-first');
});

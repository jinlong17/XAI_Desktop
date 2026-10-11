import { beforeEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey } from '../internal/accountScope.js';
import { LOCAL_KEY_OWNERSHIP, ACCOUNT_LOCAL_KEYS } from '../internal/accountOwnership.js';
import { LOCAL_DATA_LIFECYCLE, lifecycleForKey } from '../internal/lifecycleDeclaration.js';
import { exportAccountLocalData } from '../internal/accountDataLifecycle.js';
import { exportDeviceRecoveryData } from '../internal/dataExport.js';
beforeEach(()=>{ localStorage.clear(); vi.restoreAllMocks(); });
it('derives the complete lifecycle declaration from ownership without another key list',()=>{
 expect(LOCAL_DATA_LIFECYCLE.map(row=>row.key)).toEqual(Object.keys(LOCAL_KEY_OWNERSHIP));
 for (const row of LOCAL_DATA_LIFECYCLE) {
  expect(row.ownership).toBe(LOCAL_KEY_OWNERSHIP[row.key]);
  expect(row.exportScope).toBe(row.ownership==='account'?'account-current-generation':'device-recovery');
 }
 expect(lifecycleForKey('xai_pref_custom')).toMatchObject({ownership:'account',feature:'custom-preferences'});
 expect(lifecycleForKey('xai_tt_entries_v2').feature).toBe('time-tracker');
 expect(lifecycleForKey('xai_bk_dash_order').feature).toBe('bookkeeping');
 expect(lifecycleForKey('xai_metric_tracker_state_v1').feature).toBe('metric-tracker');
});
it('keeps compatible account fields and accounts for every declared record in the manifest',()=>{
 const scope=accountScope.activate(accountScope.lock('A'),'one');
 for(const key of ACCOUNT_LOCAL_KEYS) localStorage.setItem(generationKey('A','one',key),'raw:'+key);
 localStorage.setItem(generationKey('B','one','xai_task_cols'),'B');
 localStorage.setItem('xai_bk_dash_order','quick-first');
 const data=exportAccountLocalData(scope);
 expect(data).toMatchObject({version:1,accountId:'A',generation:'one',manifest:{scope:'account-current-generation',restoreSupported:false,counts:{account:40,device:0}}});
 expect(Object.keys(data.records)).toHaveLength(40);
 expect(data.manifest.categories.flatMap(category=>category.keys).sort()).toEqual(Object.keys(data.records).sort());
 expect(data.manifest.excluded).toContain('unassigned-originals-and-archives');
});
it('exports only declared device prefs by default, with all other sections empty',()=>{
 for(const [key,owner] of Object.entries(LOCAL_KEY_OWNERSHIP)) if(owner==='device') localStorage.setItem(key,'raw:'+key);
 localStorage.setItem('xai_task_cols','legacy');
 localStorage.setItem('xai:legacy:v1:archive:a','archive');
 localStorage.setItem('xai_auth_session','auth secret');
 localStorage.setItem(generationKey('A','one','xai_task_cols'),'account A');
 const data=exportDeviceRecoveryData();
 expect(Object.keys(data.device.records)).toHaveLength(76);
 expect(data.legacy.records).toEqual({});expect(data.archives.records).toEqual({});
 expect(data.manifest.counts).toEqual({account:0,device:76,legacy:0,archives:0});
 expect(data.manifest.restoreSupported).toBe(false);
 expect(JSON.stringify(data)).not.toContain('auth secret');
});
it('requires independent historical choices and preserves malformed business values as raw bytes',()=>{
 localStorage.setItem('xai_task_cols',' { broken business JSON ');
 localStorage.setItem('xai_pref_custom',' original unknown preference ');
 const raw='  '+JSON.stringify({version:1,owner:'unassigned',source:{xai_task_cols:' { broken business JSON '}})+'\n';
 localStorage.setItem('xai:legacy:v1:archive:a',raw);
 const legacy=exportDeviceRecoveryData({includeLegacy:true});
 expect(legacy.legacy.records.xai_task_cols).toBe(' { broken business JSON ');
 expect(legacy.legacy.records.xai_pref_custom).toBe(' original unknown preference ');
 expect(legacy.archives.records).toEqual({});
 const archive=exportDeviceRecoveryData({includeArchives:true});
 expect(archive.legacy.records).toEqual({});
 expect(archive.archives.records['xai:legacy:v1:archive:a']).toBe(raw);
});
it('excludes auth/key names, unsafe archive envelopes and unclassified names without deleting originals',()=>{
 for(const key of ['xai_auth_session','xai_pref_api_key','xai_pref_byok','xai_pref_refresh_token','xai_pref_accessToken','xai_unknown_payload']) localStorage.setItem(key,'excluded-material');
 const unsafe=JSON.stringify({version:1,owner:'unassigned',source:{xai_pref_api_key:'excluded-material'}});
 localStorage.setItem('xai:legacy:v1:archive:unsafe',unsafe);
 localStorage.setItem('xai:legacy:v1:archive:broken','broken archive');
 localStorage.setItem('xai:legacy:v1:archive:duplicate','{"version":1,"owner":"unassigned","source":{"xai_pref_api_key":"excluded-material"},"source":{}}');
 const data=exportDeviceRecoveryData({includeLegacy:true,includeArchives:true});
 expect(data.legacy.records).toEqual({});expect(data.archives.records).toEqual({});
 expect(data.manifest.omitted).toHaveLength(9);
 expect(JSON.stringify(data)).not.toContain('excluded-material');
 expect(localStorage.getItem('xai:legacy:v1:archive:unsafe')).toBe(unsafe);
});
it('keeps unknown credential-named account preferences out of ordinary JSON with explicit omission',()=>{
 const scope=accountScope.activate(accountScope.lock('A'),'one');
 localStorage.setItem(generationKey('A','one','xai_pref_api_key'),'secret');
 localStorage.setItem(generationKey('A','one','xai_pref_custom'),'safe');
 const data=exportAccountLocalData(scope);
 expect(data.records).toEqual({xai_pref_custom:'safe'});
 expect(data.manifest.omitted).toEqual([{section:'account',key:'xai_pref_api_key',reason:'credential-named-key'}]);
});
it('device export is independent of current account and retains authoritative bookkeeping layouts',()=>{
 localStorage.setItem('xai_bk_dash_order','quick-first');localStorage.setItem('xai_bk_dash_split','67');
 localStorage.setItem('xai_bk_view','overview');localStorage.setItem('xai_bk_calendar_mode','year');
 localStorage.setItem('xai_tt_mode','multi');
 accountScope.lock('A');const a=exportDeviceRecoveryData();
 accountScope.activate(accountScope.lock('B'),'one');const b=exportDeviceRecoveryData();
 expect(a.device.records).toEqual(b.device.records);
 expect(a.device.records).toEqual({xai_bk_dash_order:'quick-first',xai_bk_dash_split:'67',xai_bk_view:'overview',xai_bk_calendar_mode:'year',xai_tt_mode:'multi'});
});
it('propagates inaccessible storage instead of returning a misleading partial success',()=>{
 const store={length:1,key:()=> 'xai_bk_dash_order',getItem:()=>{throw new DOMException('denied','SecurityError');}};
 expect(()=>exportDeviceRecoveryData({},store)).toThrow('denied');
});

import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import { mutatePref } from '../internal/prefMutation.js';
import { setPrefAccount, setPrefAutosaveAccount, removePrefAutosaveAccount } from '../internal/storage.js';
import { subscribeSameTab, _clearAllListeners } from '../internal/sameTabBus.js';
const lock = async <T>(_n:string,_m:'shared'|'exclusive',run:()=>Promise<T>)=>run();
const key='xai_pref_collab_default_share';
const validate=(v:unknown):v is string=>v==='comment'||v==='edit'||v==='view';
function binding(){const scope=accountScope.activate(accountScope.lock('repair-A'),'one');localStorage.setItem(generationMarkerKey('repair-A'),JSON.stringify({generation:'one',migrationId:'fixture',previous:null}));return {key,codec:'string' as const,defaultValue:'comment',validate,scope,accountLock:lock,keyLock:lock};}
function physical(k=key){return generationKey('repair-A','one',k);}
beforeEach(()=>{localStorage.clear();_clearAllListeners();}); afterEach(()=>vi.restoreAllMocks());
it('registered default validation cannot be bypassed by the new dynamic-absence flag',async()=>{
 const b=binding();const observer=vi.fn();subscribeSameTab(key,observer,b.scope);
 expect(await mutatePref({...b,reset:true,allowAbsentDefault:true,defaultValue:'invalid'})).toMatchObject({ok:false,reason:'invalid'});
 expect(observer).not.toHaveBeenCalled();expect(localStorage.getItem(physical())).toBeNull();
});
it('throwing default validator resolves typed refusal instead of escaping the new prevalidation boundary',async()=>{
 const b=binding();await expect(mutatePref({...b,validate:(_v:unknown):_v is string=>{throw Error('validator fault');},next:'edit'})).resolves.toMatchObject({ok:false});
 expect(localStorage.getItem(physical())).toBeNull();
});
it('registered same-codec autosave reset publishes its validated registry default to the same-key subscriber',async()=>{
 const b=binding();const observer=vi.fn();subscribeSameTab(key,observer,b.scope);
 expect(await setPrefAutosaveAccount('collab_default_share','edit',{scope:b.scope,codec:'string',validate,lock})).toEqual({ok:true});observer.mockClear();
 expect(await removePrefAutosaveAccount('collab_default_share',{scope:b.scope,codec:'string',validate,lock})).toEqual({ok:true});
 expect(localStorage.getItem(physical())).toBeNull();expect(observer).toHaveBeenCalledExactlyOnceWith('comment');
});
it('open-ended string codec refuses object input rather than coercing the public generic value',async()=>{
 const b=binding();expect(await setPrefAutosaveAccount('repair_dynamic_string',{bad:true},{scope:b.scope,codec:'string',lock})).toMatchObject({ok:false,reason:'invalid'});
 expect(localStorage.getItem(physical('xai_pref_repair_dynamic_string'))).toBeNull();
});
it('control: legitimate registered string/boolean and dynamic JSON create/reset still work',async()=>{
 const b=binding();expect(await setPrefAccount(key,'view',{scope:b.scope,lock})).toEqual({ok:true});expect(localStorage.getItem(physical())).toBe('view');
 expect(await setPrefAccount('xai_pref_collab_show_avatars',false,{scope:b.scope,lock})).toEqual({ok:true});expect(localStorage.getItem('xai_pref_collab_show_avatars')).toBe('false');
 expect(await setPrefAutosaveAccount('repair_dynamic_json',[],{scope:b.scope,codec:'json',lock,validate:Array.isArray})).toEqual({ok:true});expect(localStorage.getItem(physical('xai_pref_repair_dynamic_json'))).toBe('[]');
 expect(await removePrefAutosaveAccount('repair_dynamic_json',{scope:b.scope,codec:'json',lock,validate:Array.isArray})).toEqual({ok:true});expect(localStorage.getItem(physical('xai_pref_repair_dynamic_json'))).toBeNull();
});
it('control: observed external replacement clears uncertain attribution and stale raw-baseline retry refuses',async()=>{
 const b=binding();const notice=vi.fn();subscribeSameTab(key,notice,b.scope);const native=Storage.prototype.getItem;let reads=0;
 const fault=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical()&&++reads===2)throw Error('readback fault');return native.call(this,k);});
 expect(await mutatePref({...b,next:'edit',expectedRaw:null})).toMatchObject({ok:false,reason:'readback-uncertain'});fault.mockRestore();
 localStorage.setItem(physical(),'view');expect(await mutatePref({...b,next:'edit',expectedRaw:null})).toMatchObject({ok:false,reason:'conflict'});expect(localStorage.getItem(physical())).toBe('view');expect(notice).not.toHaveBeenCalled();
 // A later observed equal value is an ordinary no-op, not a revived old receipt.
 localStorage.setItem(physical(),'edit');expect(await mutatePref({...b,next:'edit',expectedRaw:'edit'})).toMatchObject({ok:true,changed:false});expect(notice).not.toHaveBeenCalled();
});
it('control: uncertain reconciliation checks generation admission and publishes only once on valid same-owner retry',async()=>{
 const b=binding();const notice=vi.fn();subscribeSameTab(key,notice,b.scope);const native=Storage.prototype.getItem;let reads=0;
 const fault=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical()&&++reads===2)throw Error('readback fault');return native.call(this,k);});
 expect(await mutatePref({...b,next:'edit'})).toMatchObject({ok:false,reason:'readback-uncertain'});fault.mockRestore();
 const marker=localStorage.getItem(generationMarkerKey('repair-A'))!;localStorage.setItem(generationMarkerKey('repair-A'),JSON.stringify({generation:'two',migrationId:'new',previous:'one'}));
 expect(await mutatePref({...b,next:'edit'})).toMatchObject({ok:false,reason:'recovery-required'});expect(notice).not.toHaveBeenCalled();localStorage.setItem(generationMarkerKey('repair-A'),marker);
 expect(await mutatePref({...b,next:'edit'})).toMatchObject({ok:true});expect(notice).toHaveBeenCalledExactlyOnceWith('edit');expect(await mutatePref({...b,next:'edit'})).toMatchObject({ok:true,changed:false});expect(notice).toHaveBeenCalledTimes(1);
});

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import { mutatePref } from '../internal/prefMutation.js';
import { setPrefAccount, removePrefAccount } from '../internal/storage.js';
import { subscribeSameTab, _clearAllListeners } from '../internal/sameTabBus.js';
const lock=async<T>(_name:string,_mode:'shared'|'exclusive',run:()=>Promise<T>)=>run();
const key='xai_pref_collab_default_share';
const validate=(v:unknown):v is string=>v==='comment'||v==='edit'||v==='view';
let sequence=0;
function active(id:string,generation='one'){const scope=accountScope.activate(accountScope.lock(id),generation);localStorage.setItem(generationMarkerKey(id),JSON.stringify({generation,migrationId:'fixture',previous:null}));return scope;}
function binding(){const id=`token-${++sequence}`;return {key,codec:'string' as const,defaultValue:'comment',validate,scope:active(id),accountLock:lock,keyLock:lock};}
type Binding=ReturnType<typeof binding>;
function physical(b:Binding){return generationKey(b.scope.accountId!,b.scope.generation!,b.key);}
async function issue(b:Binding,reset=false){
 const raw=reset?'edit':'comment';localStorage.setItem(physical(b),raw);
 const native=Storage.prototype.getItem;let reads=0;
 const fault=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical(b)&&++reads===2)throw Error('exact post-write readback fault');return native.call(this,k);});
 const result=await mutatePref({...b,expectedRaw:raw,...(reset?{reset:true}:{next:'edit'})});fault.mockRestore();
 expect(result).toMatchObject({ok:false,reason:'readback-uncertain'});
 if(result.ok||!result.retryToken)throw Error('missing engine-issued retry token');
 expect(localStorage.getItem(physical(b))).toBe(reset?null:'edit');
 return {token:result.retryToken,original:raw,retry:{...b,expectedRaw:raw,reconcileToken:result.retryToken,...(reset?{reset:true}:{next:'edit'})}};
}
beforeEach(()=>{localStorage.clear();_clearAllListeners();});afterEach(()=>vi.restoreAllMocks());
for(const reset of [false,true])it(`${reset?'reset':'set'} token reconciles original baseline exactly once without another physical mutation`,async()=>{
 const b=binding();const notice=vi.fn();subscribeSameTab(key,notice,b.scope);const {retry}=await issue(b,reset);expect(notice).not.toHaveBeenCalled();
 const set=vi.spyOn(Storage.prototype,'setItem');const remove=vi.spyOn(Storage.prototype,'removeItem');
 expect(await mutatePref(retry)).toMatchObject({ok:true,changed:false,raw:reset?null:'edit',value:reset?'comment':'edit'});
 expect(set).not.toHaveBeenCalled();expect(remove).not.toHaveBeenCalled();expect(notice).toHaveBeenCalledExactlyOnceWith(reset?'comment':'edit');
 expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});expect(notice).toHaveBeenCalledTimes(1);
});
for(const mode of ['wrong-token','original-raw','different-key','different-intent','operation-kind'] as const)it(`token refuses ${mode} without consuming the valid original grant`,async()=>{
 const b=binding();const notice=vi.fn();subscribeSameTab(key,notice,b.scope);const {retry}=await issue(b);
 const changed={...retry};
 if(mode==='wrong-token')changed.reconcileToken='not-issued';
 if(mode==='original-raw')changed.expectedRaw='view';
 if(mode==='different-key'){changed.key='xai_pref_token_other';localStorage.setItem(generationKey(b.scope.accountId!,'one',changed.key),'edit');}
 if(mode==='different-intent')changed.next='view';
 if(mode==='operation-kind')Object.assign(changed,{reset:true});
 const before=localStorage.getItem(physical(b));expect(await mutatePref(changed)).toMatchObject({ok:false,reason:'conflict'});expect(localStorage.getItem(physical(b))).toBe(before);expect(notice).not.toHaveBeenCalled();
 expect(await mutatePref(retry)).toMatchObject({ok:true,changed:false});expect(notice).toHaveBeenCalledExactlyOnceWith('edit');
});
it('token cannot cross account identity even when current raw/intended/original values otherwise match',async()=>{
 const b=binding();const {retry}=await issue(b);const other=active('token-other-account');const otherPhysical=generationKey('token-other-account','one',key);localStorage.setItem(otherPhysical,'edit');
 expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'account-changed'});
 expect(await mutatePref({...retry,scope:other})).toMatchObject({ok:false,reason:'conflict'});expect(localStorage.getItem(otherPhysical)).toBe('edit');expect(localStorage.getItem(physical(b))).toBe('edit');
});
it('token cannot cross generation or bypass its full persistent marker/tombstone admission',async()=>{
 const b=binding();const {retry}=await issue(b);const marker=localStorage.getItem(generationMarkerKey(b.scope.accountId!))!;
 localStorage.setItem(generationMarkerKey(b.scope.accountId!),JSON.stringify({generation:'one'}));expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'recovery-required'});
 localStorage.setItem(generationMarkerKey(b.scope.accountId!),marker);const deleted=`xai:account:v1:${encodeURIComponent(b.scope.accountId!)}:deleted`;localStorage.setItem(deleted,'tombstone');expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'deleted'});localStorage.removeItem(deleted);
 const newer=active(b.scope.accountId!,'two');localStorage.setItem(generationKey(b.scope.accountId!,'two',key),'edit');expect(await mutatePref({...retry,scope:newer})).toMatchObject({ok:false,reason:'conflict'});
});
it('observed external replacement irrevocably invalidates a token even if intended bytes later reappear',async()=>{
 const b=binding();const notice=vi.fn();subscribeSameTab(key,notice,b.scope);const {retry}=await issue(b);localStorage.setItem(physical(b),'view');
 expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});expect(localStorage.getItem(physical(b))).toBe('view');localStorage.setItem(physical(b),'edit');expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});expect(notice).not.toHaveBeenCalled();
});
for(const reset of [false,true])it(`public ${reset?'remove':'set'} no-token reconciliation remains supported and consumes its original token`,async()=>{
 const b=binding();const notice=vi.fn();subscribeSameTab(key,notice,b.scope);const {retry}=await issue(b,reset);
 expect(await(reset?removePrefAccount(key,{scope:b.scope,lock}):setPrefAccount(key,'edit',{scope:b.scope,lock}))).toEqual({ok:true});expect(notice).toHaveBeenCalledExactlyOnceWith(reset?'comment':'edit');
 expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});expect(notice).toHaveBeenCalledTimes(1);
});
it('pre-write quota failure issues no reconciliation grant and cannot waive a later baseline conflict',async()=>{
 const b=binding();localStorage.setItem(physical(b),'comment');const native=Storage.prototype.setItem;
 const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(k===physical(b))throw new DOMException('quota','QuotaExceededError');return native.call(this,k,v);});
 const failed=await mutatePref({...b,next:'edit',expectedRaw:'comment'});expect(failed).toMatchObject({ok:false,reason:'storage'});expect(failed).not.toHaveProperty('retryToken');fault.mockRestore();
 localStorage.setItem(physical(b),'edit');expect(await mutatePref({...b,next:'edit',expectedRaw:'comment',reconcileToken:'invented'})).toMatchObject({ok:false,reason:'conflict'});
});

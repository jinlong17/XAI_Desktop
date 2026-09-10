import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { usePrefAsync, accountScope } from '@repo/plugin-web-storage';
import { mutatePref } from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import { subscribeSameTab } from '../../../packages/plugin-web-storage/src/internal/sameTabBus';
import { createTestLockManager } from '../web-board-workspace-astra-review/named-lock-fixture';
const key = 'xai_pref_dt_timezone';
const nativeGet = Storage.prototype.getItem, nativeSet = Storage.prototype.setItem;
const options = {key, codec:'boolean' as const, defaultValue:true, validate:(v:unknown):v is boolean=>typeof v==='boolean'};
beforeEach(()=>{localStorage.clear();nativeSet.call(localStorage,key,'true');vi.stubGlobal('navigator',{locks:createTestLockManager()});});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function issue(reset=false) {
  let reads=0;
  const fault=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,k:string){if(k===key&&++reads===2)throw Error('exact committed readback fault');return nativeGet.call(this,k);});
  const result=await mutatePref({...options,expectedRaw:'true',...(reset?{reset:true}:{next:false})});fault.mockRestore();
  expect(result).toMatchObject({ok:false,reason:'readback-uncertain'});
  if(result.ok||!result.retryToken)throw Error('No engine-issued token');
  expect(nativeGet.call(localStorage,key)).toBe(reset?null:'false');
  return {...options,expectedRaw:'true',reconcileToken:result.retryToken,...(reset?{reset:true}:{next:false})};
}
for(const reset of [false,true])it(`${reset?'reset':'set'} uncertain token refuses externally restored original baseline without another write/remove/notice`,async()=>{
  const retry=await issue(reset);nativeSet.call(localStorage,key,'true');
  const writes=vi.spyOn(Storage.prototype,'setItem'), removes=vi.spyOn(Storage.prototype,'removeItem'), notice=vi.fn();
  const stop=subscribeSameTab(key,notice,accountScope.capture());
  try {
    expect.soft(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});
    expect.soft(nativeGet.call(localStorage,key)).toBe('true');
    expect.soft(writes).not.toHaveBeenCalled();expect.soft(removes).not.toHaveBeenCalled();expect.soft(notice).not.toHaveBeenCalled();
  } finally {stop();}
});
for(const reset of [false,true])it(`${reset?'reset':'set'} unchanged token verifies once with zero further mutations and one reconciliation notice`,async()=>{
  const retry=await issue(reset);const writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem'),notice=vi.fn();
  const stop=subscribeSameTab(key,notice,accountScope.capture());
  try{expect(await mutatePref(retry)).toMatchObject({ok:true,changed:false,raw:reset?null:'false'});expect(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();expect(notice).toHaveBeenCalledTimes(1);expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});}finally{stop();}
});
it('unknown token cannot degrade into a normal set when expected baseline matches',async()=>{
  const writes=vi.spyOn(Storage.prototype,'setItem');expect.soft(await mutatePref({...options,next:false,expectedRaw:'true',reconcileToken:'not-issued'})).toMatchObject({ok:false,reason:'conflict'});expect.soft(nativeGet.call(localStorage,key)).toBe('true');expect(writes).not.toHaveBeenCalled();
});
it('public hook retains an issued uncertainty token across a transient read-denied Retry',async()=>{
  const h=renderHook(()=>usePrefAsync(key));let armed=false,writes=0;
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k:string,v:string){nativeSet.call(this,k,v);if(k===key){armed=true;writes++;}});
  const read=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,k:string){if(k===key&&armed){armed=false;throw Error('readback');}return nativeGet.call(this,k);});
  await act(async()=>{expect(await h.result.current[1](false)).toMatchObject({ok:false,reason:'readback-uncertain'});});
  expect(writes).toBe(1);read.mockImplementation(function(this:Storage,k:string){if(k===key)throw Error('Retry read unavailable');return nativeGet.call(this,k);});
  await act(async()=>{expect((await h.result.current[2].retry()).ok).toBe(false);});
  read.mockRestore();await act(async()=>{expect.soft((await h.result.current[2].retry()).ok).toBe(true);});
  expect(writes).toBe(1);expect(nativeGet.call(localStorage,key)).toBe('false');expect(h.result.current[2].status).toBe('saved');
});

for(const reset of [false,true])it(`${reset?'reset':'set'} consumed token cannot mutate a restored original baseline`,async()=>{
  const retry=await issue(reset);expect(await mutatePref(retry)).toMatchObject({ok:true});nativeSet.call(localStorage,key,'true');
  const writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem');
  expect.soft(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});expect.soft(nativeGet.call(localStorage,key)).toBe('true');expect.soft(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();
});
for(const reset of [false,true])it(`${reset?'reset':'set'} observed-invalid external source revokes token through intended and original restoration`,async()=>{
  const retry=await issue(reset);nativeSet.call(localStorage,key,'invalid-boolean');expect(await mutatePref(retry)).toMatchObject({ok:false});
  if(reset)localStorage.removeItem(key);else nativeSet.call(localStorage,key,'false');
  expect(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});
  nativeSet.call(localStorage,key,'true');const writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem');
  expect.soft(await mutatePref(retry)).toMatchObject({ok:false,reason:'conflict'});expect.soft(nativeGet.call(localStorage,key)).toBe('true');expect.soft(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();
});
for(const reset of [false,true])for(const fault of ['read','lock'] as const)it(`${reset?'reset':'set'} temporary ${fault} denial preserves token verification without a second mutation`,async()=>{
  const retry=await issue(reset);const read=fault==='read'?vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,k:string){if(k===key)throw Error('temporary read unavailable');return nativeGet.call(this,k);}):null;
  expect(await mutatePref({...retry,...(fault==='lock'?{keyLock:async()=>{throw Error('temporary lock rejection');}}:{})})).toMatchObject({ok:false});read?.mockRestore();
  const writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem');expect(await mutatePref(retry)).toMatchObject({ok:true,changed:false});expect(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();
});
it('public hook repeated Retry cannot lose an invalidated grant and overwrite the external original',async()=>{
  const h=renderHook(()=>usePrefAsync(key));let armed=false;vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k:string,v:string){nativeSet.call(this,k,v);if(k===key)armed=true;});const read=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,k:string){if(k===key&&armed){armed=false;throw Error('readback');}return nativeGet.call(this,k);});
  await act(async()=>{expect(await h.result.current[1](false)).toMatchObject({ok:false,reason:'readback-uncertain'});});vi.restoreAllMocks();
  nativeSet.call(localStorage,key,'invalid-boolean');await act(async()=>{expect((await h.result.current[2].retry()).ok).toBe(false);});nativeSet.call(localStorage,key,'true');
  const writes=vi.spyOn(Storage.prototype,'setItem');for(let i=0;i<2;i++)await act(async()=>{expect.soft(await h.result.current[2].retry()).toMatchObject({ok:false,reason:'conflict'});});
  expect.soft(nativeGet.call(localStorage,key)).toBe('true');expect.soft(writes).not.toHaveBeenCalled();expect(h.result.current[0]).toBe(false);expect(h.result.current[2].status).not.toBe('saved');
});
it('an absolute token cannot invoke a functional updater while authenticating its grant',async()=>{
  const retry=await issue();const updater=vi.fn((value:boolean)=>!value);expect(await mutatePref({...retry,next:updater})).toMatchObject({ok:false,reason:'conflict'});expect(updater).not.toHaveBeenCalled();expect(await mutatePref(retry)).toMatchObject({ok:true,changed:false});
});
it('public functional uncertainty Retry remains a new updater attempt on current data',async()=>{
  const h=renderHook(()=>usePrefAsync(key));let armed=false,writes=0;
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k:string,v:string){nativeSet.call(this,k,v);if(k===key){armed=true;writes++;}});
  const read=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,k:string){if(k===key&&armed){armed=false;throw Error('functional readback');}return nativeGet.call(this,k);});
  const updater=vi.fn((value:boolean)=>!value);await act(async()=>{expect(await h.result.current[1](updater)).toMatchObject({ok:false,reason:'readback-uncertain'});});expect(nativeGet.call(localStorage,key)).toBe('false');read.mockRestore();
  await act(async()=>{expect((await h.result.current[2].retry()).ok).toBe(true);});expect(updater.mock.calls).toEqual([[true],[false]]);expect(writes).toBe(2);expect(nativeGet.call(localStorage,key)).toBe('true');expect(h.result.current[2].status).toBe('saved');
});
for(const reset of [false,true])it(`${reset?'reset':'set'} explicitly supplied empty token is invalid authority, not an ordinary mutation`,async()=>{
  const writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem');
  expect.soft(await mutatePref({...options,expectedRaw:'true',reconcileToken:'',...(reset?{reset:true}:{next:false})})).toMatchObject({ok:false,reason:'conflict'});
  expect.soft(nativeGet.call(localStorage,key)).toBe('true');expect.soft(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();
});

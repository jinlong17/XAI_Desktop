import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { accountScope, createAccountScopeController, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import { mutatePref, prefMutationLockName } from '../internal/prefMutation.js';
import { accountLifecycleLockName, type AccountCoordinationLock } from '../internal/accountCoordination.js';
import { setPrefAccount, removePrefAccount, setPrefAutosaveAccount, removePrefAutosaveAccount } from '../internal/storage.js';
import { subscribeSameTab, _clearAllListeners } from '../internal/sameTabBus.js';
import { migrateAccount, readGeneration } from '../internal/accountMigration.js';

const key = 'xai_pref_collab_default_share';
const valid = (v: unknown): v is string => v === 'comment' || v === 'edit' || v === 'view';
const direct: AccountCoordinationLock = async (_n, _m, run) => run();
function deferred() { let resolve!: () => void; const promise = new Promise<void>(r => resolve = r); return { promise, resolve }; }
function active(id = 'A') { const scope = accountScope.activate(accountScope.lock(id), 'one'); localStorage.setItem(generationMarkerKey(id), JSON.stringify({generation:'one',migrationId:'fixture',previous:null})); return scope; }
function binding() { const scope = active(); return { key, codec:'string' as const, defaultValue:'comment',validate:valid,scope,accountLock:direct,keyLock:direct }; }
function physical(k = key) { return generationKey('A','one',k); }
// Named shared/exclusive lock simulator, not a global promise tail. Separate contexts
// share this manager; native held/shared semantics are independently parent-owned.
function locks() {
  const queues = new Map<string, any[]>(); const held = new Map<string, {mode:string,count:number}>();
  const calls: string[] = [];
  function drain(name:string) {
    const q = queues.get(name) ?? []; const h = held.get(name);
    if (!q.length || h?.mode === 'exclusive' || (h && q[0].mode === 'exclusive')) return;
    const item = q.shift(); const entry = h ?? {mode:item.mode,count:0}; entry.count++; held.set(name,entry);
    Promise.resolve().then(item.run).then(item.resolve,item.reject).finally(() => { entry.count--; if (!entry.count) held.delete(name); drain(name); });
    if (item.mode === 'shared') drain(name);
  }
  const lock: AccountCoordinationLock = (name,mode,run) => { calls.push(`${mode}:${name}`); return new Promise((resolve,reject) => { const q=queues.get(name)??[]; q.push({mode,run,resolve,reject}); queues.set(name,q); drain(name); }); };
  return {lock,calls};
}
beforeEach(() => { localStorage.clear(); _clearAllListeners(); });
afterEach(() => vi.restoreAllMocks());

it('control: absent create, raw baseline conflict, valid reset and no-op have truthful bytes/publication', async () => {
  const b=binding(); const notice=vi.fn(); subscribeSameTab(key,notice,b.scope);
  expect(await mutatePref({...b,next:'edit',expectedRaw:null})).toMatchObject({ok:true,raw:'edit',changed:true});
  expect(await mutatePref({...b,next:'view',expectedRaw:null})).toMatchObject({ok:false,reason:'conflict'});
  expect(await mutatePref({...b,next:'edit',expectedRaw:'edit'})).toMatchObject({ok:true,changed:false});
  expect(notice).toHaveBeenCalledTimes(1);
  expect(await mutatePref({...b,reset:true,expectedRaw:'edit'})).toMatchObject({ok:true,raw:null,source:'absent'});
  expect(localStorage.getItem(physical())).toBeNull(); expect(notice).toHaveBeenCalledTimes(2);
});
it('registered key codec cannot be replaced by a JSON codec through public mutatePref', async () => {
  const b=binding();
  expect(await mutatePref({...b,codec:'json',next:'edit'})).toMatchObject({ok:false,reason:'invalid'});
  expect(localStorage.getItem(physical())).toBeNull();
});
it('registered autosave codec cannot disagree with the registry on an absent key', async () => {
  const b=binding();
  expect(await setPrefAutosaveAccount('collab_default_share','edit',{scope:b.scope,codec:'json',lock:direct})).toMatchObject({ok:false});
  expect(localStorage.getItem(physical())).toBeNull();
});
it('typed public Account setter must not coerce an object into a registered boolean', async () => {
  const b=binding(); const device='xai_pref_collab_show_avatars';
  expect(await setPrefAccount(device, {} as never,{scope:b.scope,lock:direct})).toMatchObject({ok:false,reason:'invalid'});
  expect(localStorage.getItem(device)).toBeNull();
});
it('typed public Account setter must not turn an invalid domain source into a replacement default', async () => {
  const b=binding(); localStorage.setItem(physical(),'corrupt-permission');
  expect(await setPrefAccount(key,'edit',{scope:b.scope,lock:direct})).toMatchObject({ok:false,reason:'invalid'});
  expect(localStorage.getItem(physical())).toBe('corrupt-permission');
});
it('typed public Account reset must not authorize deletion of an invalid domain source', async () => {
  const b=binding(); localStorage.setItem(physical(),'corrupt-permission');
  expect(await removePrefAccount(key,{scope:b.scope,lock:direct})).toMatchObject({ok:false,reason:'invalid'});
  expect(localStorage.getItem(physical())).toBe('corrupt-permission');
});
it('invalid absent default is rejected before invoking a functional updater', async () => {
  const b=binding(); const next=vi.fn(()=> 'edit');
  expect(await mutatePref({...b,defaultValue:'invalid',next})).toMatchObject({ok:false,reason:'invalid'});
  expect(next).not.toHaveBeenCalled(); expect(localStorage.getItem(physical())).toBeNull();
});
it('invalid absent reset default cannot be returned as a successful validated snapshot', async () => {
  const b=binding();
  expect(await mutatePref({...b,defaultValue:'invalid',reset:true})).toMatchObject({ok:false,reason:'invalid'});
});
it('unclassified key resolves to typed invalid refusal rather than rejecting its Promise', async () => {
  const b=binding();
  await expect(mutatePref({...b,key:'xai_unclassified_engine_probe',next:'edit'})).resolves.toMatchObject({ok:false,reason:'invalid'});
});
it('control: validator/updater failure, physical null and failed exact read never write', async () => {
  const b=binding(); localStorage.setItem(physical(),'null');
  expect(await mutatePref({...b,next:'edit'})).toMatchObject({ok:false,reason:'invalid'});
  localStorage.removeItem(physical());
  expect(await mutatePref({...b,next:()=>{throw Error('bad updater');}})).toMatchObject({ok:false});
  expect(await mutatePref({...b,next:'bad'})).toMatchObject({ok:false,reason:'invalid'});
  const native=Storage.prototype.getItem; vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical())throw Error('read');return native.call(this,k);});
  expect(await mutatePref({...b,next:'edit'})).toMatchObject({ok:false,reason:'unavailable'});
  expect(native.call(localStorage,physical())).toBeNull();
});
it('control: generic and both registered public canonical set/reset preserve original bytes', async () => {
  const b=binding(); const p=physical('xai_task_cols'); const raw='{"preserve":"canonical"}'; localStorage.setItem(p,raw);
  expect(await mutatePref({...b,key:'xai_task_cols',next:'edit'})).toMatchObject({ok:false,reason:'canonical'});
  expect(await setPrefAccount('xai_task_cols',[] as never,{scope:b.scope,lock:direct})).toMatchObject({ok:false});
  expect(await removePrefAccount('xai_task_cols',{scope:b.scope,lock:direct})).toMatchObject({ok:false}); expect(localStorage.getItem(p)).toBe(raw);
});
it('control: all four public pref/autosave APIs wait for the same full physical key lock', async () => {
  const b=binding(); const {lock,calls}=locks(); const gate=deferred(); const entered=deferred();
  const holder=lock(prefMutationLockName(physical()),'exclusive',async()=>{entered.resolve();await gate.promise;}); await entered.promise;
  const results=[setPrefAccount(key,'edit',{scope:b.scope,lock}),removePrefAccount(key,{scope:b.scope,lock}),setPrefAutosaveAccount('collab_default_share','view',{scope:b.scope,lock,codec:'string',validate:valid}),removePrefAutosaveAccount('collab_default_share',{scope:b.scope,lock,codec:'string',validate:valid})];
  await Promise.resolve(); await Promise.resolve(); expect(localStorage.getItem(physical())).toBeNull();
  expect(calls.filter(x=>x===`shared:${accountLifecycleLockName('A')}`)).toHaveLength(4);
  expect(calls.filter(x=>x===`exclusive:${prefMutationLockName(physical())}`)).toHaveLength(5);
  gate.resolve(); await holder; expect(await Promise.all(results)).toEqual([{ok:true},{ok:true},{ok:true},{ok:true}]); expect(localStorage.getItem(physical())).toBeNull();
});
it('control: independent functional callers update latest persisted value, not stale snapshots', async () => {
  const b=binding(); const {lock}=locks(); const k='xai_pref_engine_counter';
  const spec={...b,key:k,codec:'number' as const,defaultValue:0,validate:(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v),accountLock:lock,keyLock:lock,next:(v:number)=>v+1};
  expect((await Promise.all([mutatePref(spec),mutatePref(spec)])).every(r=>r.ok)).toBe(true); expect(localStorage.getItem(physical(k))).toBe('2');
});
for (const scenario of ['owner','marker','tombstone'] as const) it(`control: queued key-lock ${scenario} change refuses before writing`, async () => {
  const b=binding(); const gate=deferred(); const entered=deferred();
  const delayed:AccountCoordinationLock=async(_n,_m,run)=>{entered.resolve();await gate.promise;return run();};
  const write=mutatePref({...b,next:'edit',keyLock:delayed}); await entered.promise;
  if(scenario==='owner') active('B'); else if(scenario==='marker') localStorage.setItem(generationMarkerKey('A'),JSON.stringify({generation:'two',migrationId:'new',previous:'one'})); else localStorage.setItem('xai:account:v1:A:deleted','tombstone');
  gate.resolve(); expect(await write).toMatchObject({ok:false}); expect(localStorage.getItem(physical())).toBeNull();
});
it('control: unavailable/rejected account or key lock never falls back to a physical write', async () => {
  const b=binding(); const deny:AccountCoordinationLock=async()=>{throw Error('lock unavailable');};
  expect(await mutatePref({...b,next:'edit',accountLock:deny})).toMatchObject({ok:false,reason:'lock-unavailable'});
  expect(await mutatePref({...b,next:'edit',keyLock:deny})).toMatchObject({ok:false,reason:'lock-unavailable'}); expect(localStorage.getItem(physical())).toBeNull();
});
it('control: device branch takes only a key lock and observer exceptions cannot turn commit into failure', async () => {
  const b=binding(); accountScope.lock('B'); const k='xai_pref_collab_show_avatars'; const names:string[]=[];
  subscribeSameTab(k,()=>{throw Error('observer');},b.scope); const sibling=vi.fn(); subscribeSameTab(k,sibling,b.scope);
  const lock:AccountCoordinationLock=async(n,m,run)=>{names.push(`${m}:${n}`);return run();};
  expect(await setPrefAccount(k,false,{scope:b.scope,lock})).toEqual({ok:true}); expect(names).toEqual([`exclusive:${prefMutationLockName(k)}`]); expect(localStorage.getItem(k)).toBe('false'); expect(sibling).toHaveBeenCalledWith(false);
});
it('public write retry reconciles a physically committed but unpublished readback-uncertain save', async () => {
  const b=binding(); const notice=vi.fn(); subscribeSameTab(key,notice,b.scope); const native=Storage.prototype.getItem; let reads=0;
  const fault=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical()&&++reads===2)throw Error('readback');return native.call(this,k);});
  expect(await setPrefAccount(key,'edit',{scope:b.scope,lock:direct})).toMatchObject({ok:false}); expect(native.call(localStorage,physical())).toBe('edit'); expect(notice).not.toHaveBeenCalled(); fault.mockRestore();
  expect(await setPrefAccount(key,'edit',{scope:b.scope,lock:direct})).toEqual({ok:true}); expect(notice).toHaveBeenCalledTimes(1); expect(notice).toHaveBeenCalledWith('edit');
});
it('public reset retry reconciles a physically removed but unpublished readback-uncertain reset', async () => {
  const b=binding(); localStorage.setItem(physical(),'edit'); const notice=vi.fn(); subscribeSameTab(key,notice,b.scope); const native=Storage.prototype.getItem; let reads=0;
  const fault=vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical()&&++reads===2)throw Error('readback');return native.call(this,k);});
  expect(await removePrefAccount(key,{scope:b.scope,lock:direct})).toMatchObject({ok:false}); expect(native.call(localStorage,physical())).toBeNull(); fault.mockRestore();
  expect(await removePrefAccount(key,{scope:b.scope,lock:direct})).toEqual({ok:true}); expect(notice).toHaveBeenCalledTimes(1); expect(notice).toHaveBeenCalledWith('comment');
});
it('control: before-migration async write is copied; independently queued writer waits then refuses stale generation', async () => {
  const b=binding(); const {lock}=locks(); expect(await setPrefAccount(key,'edit',{scope:b.scope,lock})).toEqual({ok:true});
  const controller=createAccountScopeController(); const entered=deferred(); const gate=deferred();
  const migration=migrateAccount({storage:localStorage,controller,transition:controller.lock('A'),choice:'empty',newId:()=> 'next',lock:(name,run)=>lock(name,'exclusive',run),secrets:{stage:async()=>{entered.resolve();await gate.promise;},verify:async()=>{}}});
  await entered.promise; let settled=false;
  const write=setPrefAccount(key,'view',{scope:b.scope,lock}).then(r=>{settled=true;return r;}); await Promise.resolve(); expect(settled).toBe(false); expect(localStorage.getItem(physical())).toBe('edit');
  gate.resolve(); await migration; expect(await write).toMatchObject({ok:false,reason:'recovery-required'});
  const generation=readGeneration(localStorage,'A')!.generation; expect(localStorage.getItem(generationKey('A',generation,key))).toBe('edit');
});

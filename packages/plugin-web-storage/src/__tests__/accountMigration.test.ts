import { registerAccountMigrationValidator } from "../internal/accountMigrationValidation.js";
import { beforeEach, expect, it, vi } from 'vitest';
import { createAccountScopeController, generationKey, generationMarkerKey } from '../internal/accountScope.js';
import { inspectLegacy, listAccountMigrations, migrateAccount, readGeneration, rollbackAccount, type MigrationLock } from '../internal/accountMigration.js';
const lock: MigrationLock=async (_name,run)=>run();
beforeEach(() => { localStorage.clear(); registerAccountMigrationValidator("xai_ai_convos", value => Array.isArray(value) && value.every(item => item && typeof item === "object")); });
const prepare=()=> { const controller=createAccountScopeController(); return {storage:localStorage,controller,transition:controller.lock('A'),lock,newId:()=> 'test-id'}; };
it('preserves exact unowned bytes and imports only explicitly selected account keys', async () => {
  localStorage.setItem('xai_ai_convos','[ { "raw": true } ]');
  localStorage.setItem('xai_pref_unknown','legacy unknown');
  localStorage.setItem('xai_pref_theme','dark');
  const input=prepare();
  const marker=await migrateAccount({...input,choice:'import',selectedKeys:['xai_ai_convos']});
  expect(localStorage.getItem(generationKey('A',marker.generation,'xai_ai_convos'))).toBe('[ { "raw": true } ]');
  expect(inspectLegacy(localStorage)).toEqual({xai_ai_convos:'[ { "raw": true } ]',xai_pref_unknown:'legacy unknown'});
  expect(localStorage.getItem('xai_pref_theme')).toBe('dark');
  expect(readGeneration(localStorage,'A')).toEqual(marker);
});
it('start empty does not adopt legacy and rollback keeps imported archives', async () => {
  localStorage.setItem('xai_ai_convos','[]');
  const input=prepare();
  const marker=await migrateAccount({...input,choice:'empty'});
  expect(localStorage.getItem(generationKey('A',marker.generation,'xai_ai_convos'))).toBeNull();
  expect(await rollbackAccount(input)).toBeNull();
  expect(localStorage.getItem('xai_ai_convos')).toBe('[]');
  expect(localStorage.getItem('xai:legacy:v1:archive:test-id')).toContain('[]');
});
it('does not publish partial content when a secret stage fails', async () => {
  localStorage.setItem('xai_ai_convos','[]');
  const input=prepare();
  const secrets={stage:vi.fn().mockRejectedValue(new Error('IDB blocked')),verify:vi.fn()};
  await expect(migrateAccount({...input,choice:'import',selectedKeys:['xai_ai_convos'],secrets,adoptLegacySecrets:true})).rejects.toThrow('IDB blocked');
  expect(readGeneration(localStorage,'A')).toBeNull();
  expect(localStorage.getItem('xai_ai_convos')).toBe('[]');
  expect(secrets.verify).not.toHaveBeenCalled();
});
it('rejects stale identity after asynchronous secret work', async () => {
  const input=prepare();
  const secrets={stage:async()=> {input.controller.lock('B');},verify:vi.fn()};
  await expect(migrateAccount({...input,choice:'empty',secrets})).rejects.toThrow(/locked/);
  expect(readGeneration(localStorage,'A')).toBeNull();
});
it('keeps existing generation visible when quota prevents the commit marker', async () => {
  const input=prepare();
  const first=await migrateAccount({...input,choice:'empty'});
  const set=localStorage.setItem.bind(localStorage);
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(key,value) {
    if(key===generationMarkerKey('A')) throw new DOMException('quota','QuotaExceededError');
    set(key,value);
  });
  await expect(migrateAccount({...input,choice:'empty',newId:()=> 'second'})).rejects.toThrow('quota');
  expect(readGeneration(localStorage,'A')).toEqual(first);
});
it('rejects overwrite conflicts and requires a working exclusive migration lock', async () => {
  const input=prepare();
  localStorage.setItem('xai_ai_convos','[]');
  await migrateAccount({...input,choice:'import',selectedKeys:['xai_ai_convos']});
  await expect(migrateAccount({...input,choice:'import',selectedKeys:['xai_ai_convos'],newId:()=> 'second'})).rejects.toThrow(/conflict/);
  await expect(migrateAccount({...input,choice:'empty',lock:async()=>{throw new Error('lock unavailable');}})).rejects.toThrow(/lock unavailable/);
});
it('rejects demo import and device or unknown key adoption', async () => {
  const input=prepare();
  await expect(migrateAccount({...input,choice:'import',demo:true})).rejects.toThrow(/Demo/);
  await expect(migrateAccount({...input,choice:'import',selectedKeys:['xai_pref_theme']})).rejects.toThrow(/device/);
  await expect(migrateAccount({...input,choice:'import',selectedKeys:['xai_pref_unknown']})).rejects.toThrow(/unclassified/);
});

it('refuses malformed content and leaves original bytes untouched', async () => {
  localStorage.setItem('xai_ai_convos','{bad-json');
  const input=prepare();
  await expect(migrateAccount({...input,choice:'import',selectedKeys:['xai_ai_convos']})).rejects.toThrow(/cannot be decoded/);
  expect(localStorage.getItem('xai_ai_convos')).toBe('{bad-json');
  expect(readGeneration(localStorage,'A')).toBeNull();
});

it('preserves an already owned open-ended preference across later generation commits', async () => {
  const input=prepare();
  const first=await migrateAccount({...input,choice:'empty'});
  localStorage.setItem(generationKey('A',first.generation,'xai_pref_custom_private'),'owned private preference');
  const second=await migrateAccount({...input,choice:'empty',newId:()=> 'second'});
  expect(localStorage.getItem(generationKey('A',second.generation,'xai_pref_custom_private'))).toBe('owned private preference');
  expect(await rollbackAccount(input)).toEqual(first);
});

it('exposes a failed candidate as recoverable metadata while keeping its content invisible', async () => {
  const input=prepare();
  await expect(migrateAccount({...input,choice:'empty',secrets:{stage:async()=>{throw new Error('interrupted');},verify:async()=>{}}})).rejects.toThrow('interrupted');
  expect(listAccountMigrations(localStorage,'A')).toEqual([expect.objectContaining({migrationId:'test-id',status:'prepared',generation:'migration-test-id'})]);
  expect(readGeneration(localStorage,'A')).toBeNull();
  const next=await migrateAccount({...input,choice:'empty',newId:()=> 'retry'});
  expect(readGeneration(localStorage,'A')).toEqual(next);
  expect(listAccountMigrations(localStorage,'A').find(item=>item.migrationId==='retry')?.status).toBe('active');
});

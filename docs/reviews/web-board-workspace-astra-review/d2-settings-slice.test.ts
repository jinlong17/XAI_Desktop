import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {accountScope,accountPrefix,generationKey,generationMarkerKey,accountDeletionReceiptKey,decodeAccountDeletionReceipt,resumeAccountLocalDataDeletion,completeAccountLocalDataDeletion} from '@repo/plugin-web-storage';
import {createTestLockManager} from './named-lock-fixture.js';
const secrets=vi.hoisted(()=>({clear:vi.fn()}));
vi.mock('@repo/plugin-web-ai-chat',()=>({clearAccountAiSecrets:secrets.clear}));
const account='slice-A';
const key=()=>accountDeletionReceiptKey(account);
const receipt=()=>({version:2 as const,accountId:account,kind:'account' as const,generation:'g1',phase:'pending' as const,updatedAt:'2026-09-09T00:00:00.000Z',authGeneration:'auth-A'});
const lock=async<T>(_name:string,_mode:'shared'|'exclusive',run:()=>Promise<T>)=>run();
function seed(){const value=receipt(),raw=JSON.stringify(value);localStorage.setItem(key(),raw);return {value,raw};}
function gate(){let release!:()=>void;const promise=new Promise<void>(resolve=>release=resolve);return {promise,release};}
beforeEach(()=>{localStorage.clear();secrets.clear.mockReset().mockResolvedValue(undefined);accountScope.activate(accountScope.lock(account),'g1');localStorage.setItem(generationMarkerKey(account),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));vi.stubGlobal('navigator',{locks:createTestLockManager()});});
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});
it('strict shared receipt decoder rejects truthy non-string auth generations',()=>{
 for(const authGeneration of [7,{},[]]) expect.soft(decodeAccountDeletionReceipt(JSON.stringify({...receipt(),authGeneration}),account)).toBeNull();
});
it('local account deletion removes prior and candidate records before declaring local-data-cleared',async()=>{
 const {value,raw}=seed();const owned=['g1','prior','candidate'].map(g=>generationKey(account,g,'xai_ai_convos'));
 for(const record of owned)localStorage.setItem(record,'private');const other=generationKey('B','g2','xai_ai_convos');localStorage.setItem(other,'B keep');
 const result=await resumeAccountLocalDataDeletion(value,raw,localStorage,lock);
 console.log('all-account-cleanup',JSON.stringify({result,remaining:owned.filter(record=>localStorage.getItem(record)!==null)}));
 expect(result.ok).toBe(true);expect(owned.filter(record=>localStorage.getItem(record)!==null)).toEqual([]);expect(localStorage.getItem(other)).toBe('B keep');
});
it('complete transition refuses a pending receipt whose local data has not been cleared',async()=>{
 const {value,raw}=seed();const record=generationKey(account,'g1','xai_ai_convos');localStorage.setItem(record,'not cleared');
 const result=await completeAccountLocalDataDeletion(value,raw,localStorage,lock);
 console.log('premature-complete',JSON.stringify({result,remaining:localStorage.getItem(record)}));
 expect.soft(result.ok).toBe(false);expect(localStorage.getItem(key())).toBe(raw);expect(localStorage.getItem(record)).toBe('not cleared');
});
it('same-page in-flight recovery cannot return success for a different requested auth identity',async()=>{
 const api=await import('../../../packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.js');const {value}=seed(),waiting=gate();
 secrets.clear.mockImplementation(()=>waiting.promise);const first=api.resumeAccountLocalDeletion(value,vi.fn().mockResolvedValue(undefined));
 await vi.waitFor(()=>expect(secrets.clear).toHaveBeenCalledTimes(1));
 const second=api.resumeAccountLocalDeletion({...value,authGeneration:'different-auth'},vi.fn().mockResolvedValue(undefined));
 const results=Promise.allSettled([first,second]);waiting.release();const settled=await results;
 console.log('samepage-identity',JSON.stringify(settled));expect(settled[0].status).toBe('fulfilled');expect(settled[1].status).toBe('rejected');
});
it('independent Settings module instances serialize recovery participants across their shared origin locks',async()=>{
 const one=await import('../../../packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.js');vi.resetModules();
 const two=await import('../../../packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.js');const {value}=seed(),waiting=gate();
 secrets.clear.mockImplementation(()=>waiting.promise);const auth=vi.fn().mockResolvedValue(undefined);
 const first=one.resumeAccountLocalDeletion(value,auth);await vi.waitFor(()=>expect(secrets.clear).toHaveBeenCalledTimes(1));
 const second=two.resumeAccountLocalDeletion(value,auth);const results=Promise.allSettled([first,second]);
 await new Promise(resolve=>setTimeout(resolve,30));const concurrent=secrets.clear.mock.calls.length;
 waiting.release();const settled=await results;
 console.log('independent-coordinators',JSON.stringify({concurrent,authCalls:auth.mock.calls.length,settled}));
 expect.soft(concurrent).toBe(1);expect(auth).toHaveBeenCalledTimes(1);expect(settled.map(item=>item.status)).toEqual(['fulfilled','fulfilled']);
});
it('replacement after local cleanup but before its await resumes prevents the next secret participant',async()=>{
 const api=await import('../../../packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.js');const {value}=seed();const replacement=JSON.stringify({...value,authGeneration:'replacement'});
 const manager=createTestLockManager();let changed=false;
 vi.stubGlobal('navigator',{locks:{request:async(name:string,options:any,callback?:any)=>{const result=await manager.request(name,options,callback);if(!changed&&name===accountPrefix(account)+'lifecycle'){changed=true;localStorage.setItem(key(),replacement);}return result;}}});
 const auth=vi.fn();await expect(api.resumeAccountLocalDeletion(value,auth)).rejects.toThrow();
 expect.soft(secrets.clear).not.toHaveBeenCalled();expect(auth).not.toHaveBeenCalled();expect(localStorage.getItem(key())).toBe(replacement);
});

it('current-owner delete cannot override a newer complete marker with an old valid structured receipt',async()=>{
 seed();const record=generationKey(account,'g2','xai_ai_convos');localStorage.setItem(record,'newer generation');
 const marker=JSON.stringify({generation:'g2',migrationId:'replacement',previous:'g1'});localStorage.setItem(generationMarkerKey(account),marker);
 // Use the actual singleton of the reloaded public module, so current-owner
 // identity is a passing precondition even after the multi-instance test.
 const current=await import('@repo/plugin-web-storage');current.accountScope.activate(current.accountScope.lock(account),'g1');
 const outcome=await current.deleteAccountLocalDataAccount(current.accountScope.capture(),localStorage,lock);
 console.log('structured-receipt-marker',JSON.stringify({outcome,bytes:localStorage.getItem(record)}));
 expect.soft(outcome.ok).toBe(false);expect(localStorage.getItem(record)).toBe('newer generation');expect(localStorage.getItem(generationMarkerKey(account))).toBe(marker);
});

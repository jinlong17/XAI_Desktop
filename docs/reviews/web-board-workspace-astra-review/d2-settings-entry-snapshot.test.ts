import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {accountScope,accountPrefix,generationKey,generationMarkerKey,accountDeletionReceiptKey} from '@repo/plugin-web-storage';
import {createTestLockManager} from './named-lock-fixture.js';
import {resumeAccountLocalDeletion} from '../../../packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.js';
const secret=vi.hoisted(()=>vi.fn());
vi.mock('@repo/plugin-web-ai-chat',()=>({clearAccountAiSecrets:secret}));
beforeEach(()=>{localStorage.clear();secret.mockReset().mockResolvedValue(undefined);accountScope.activate(accountScope.lock('snapshot-A'),'g1');localStorage.setItem(generationMarkerKey('snapshot-A'),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));});
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});
it.each([false,true])('queued recovery keeps the entry receipt authority; same-identity raw replacement=%s',async replace=>{
 const receipt={version:2 as const,kind:'account' as const,accountId:'snapshot-A',generation:'g1',authGeneration:'auth-A',phase:'pending' as const,updatedAt:'2026-09-09T00:00:00.000Z'};
 const receiptKey=accountDeletionReceiptKey(receipt.accountId),record=generationKey(receipt.accountId,'g1','xai_ai_convos');
 localStorage.setItem(receiptKey,JSON.stringify(receipt));localStorage.setItem(record,'retained account bytes');
 const locks=createTestLockManager();vi.stubGlobal('navigator',{locks});let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
 const held=locks.request(accountPrefix(receipt.accountId)+'lifecycle:deletion-recovery',{mode:'exclusive'},()=>gate);
 const auth=vi.fn().mockResolvedValue(undefined);const pending=resumeAccountLocalDeletion(receipt,auth);const settled=Promise.allSettled([pending]);
 expect(secret).not.toHaveBeenCalled();expect(localStorage.getItem(record)).toBe('retained account bytes');
 const replacement=JSON.stringify({...receipt,updatedAt:'2026-09-10T00:00:00.000Z'});
 if(replace)localStorage.setItem(receiptKey,replacement);
 release();await held;const [outcome]=await settled;
 console.log('entry-snapshot',JSON.stringify({replace,outcome,receipt:localStorage.getItem(receiptKey),record:localStorage.getItem(record),secret:secret.mock.calls.length,auth:auth.mock.calls.length}));
 if(replace){expect.soft(outcome.status).toBe('rejected');expect.soft(localStorage.getItem(receiptKey)).toBe(replacement);expect.soft(localStorage.getItem(record)).toBe('retained account bytes');expect.soft(secret).not.toHaveBeenCalled();expect(auth).not.toHaveBeenCalled();}
 else{expect(outcome.status).toBe('fulfilled');expect(JSON.parse(localStorage.getItem(receiptKey)!).phase).toBe('complete');expect(localStorage.getItem(record)).toBeNull();expect(secret).toHaveBeenCalledTimes(1);expect(auth).toHaveBeenCalledTimes(1);}
});

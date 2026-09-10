import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {accountScope,generationKey,generationMarkerKey} from '@repo/plugin-web-storage';
import {beginAccountLocalDeletion,readAccountDeletionReceipt,resumeAccountLocalDeletion} from '../../../packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.js';
const secret=vi.hoisted(()=>vi.fn(async()=>{}));
vi.mock('@repo/plugin-web-ai-chat',()=>({clearAccountAiSecrets:secret}));
function prepare(){
 localStorage.setItem(generationMarkerKey('A'),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
 const scope=accountScope.activate(accountScope.lock('A'),'g1');
 const key=generationKey('A','g1','xai_ai_convos');localStorage.setItem(key,'["retain until cleanup"]');
 return {key,receipt:beginAccountLocalDeletion(scope,'auth-A')};
}
beforeEach(()=>{localStorage.clear();secret.mockReset().mockResolvedValue(undefined);});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();accountScope.lock();});
it('queued account cleanup retains data and pending receipt until the exclusive operation actually completes',async()=>{
 const {key,receipt}=prepare();let release!:()=>void;const gate=new Promise<void>(r=>release=r);const modes:string[]=[];
 vi.stubGlobal('navigator',{locks:{request:async(_name:string,options:LockOptions,run:()=>Promise<unknown>)=>{modes.push(options.mode!);await gate;return run();}}});
 const auth=vi.fn(async()=>{});const operation=resumeAccountLocalDeletion(receipt,auth);
 await Promise.resolve();await Promise.resolve();
 expect.soft(localStorage.getItem(key)).toBe('["retain until cleanup"]');
 expect.soft(readAccountDeletionReceipt('A')?.phase).toBe('pending');
 expect.soft(secret).not.toHaveBeenCalled();expect.soft(auth).not.toHaveBeenCalled();
 release();const result=await operation;
 expect(modes).toEqual(['exclusive']);expect(result.phase).toBe('complete');expect(localStorage.getItem(key)).toBeNull();
 expect(auth).toHaveBeenCalledWith({owner:'A',generation:'auth-A'});
});
it('unavailable account lock refuses cleanup without advancing its receipt or clearing secrets',async()=>{
 const {key,receipt}=prepare();vi.stubGlobal('navigator',{locks:{request:async()=>{throw Error('Unavailable lock');}}});
 let rejected=false;try{await resumeAccountLocalDeletion(receipt,async()=>{});}catch{rejected=true;}
 expect.soft(rejected).toBe(true);expect.soft(localStorage.getItem(key)).toBe('["retain until cleanup"]');expect.soft(readAccountDeletionReceipt('A')?.phase).toBe('pending');expect(secret).not.toHaveBeenCalled();
});
it('partial local cleanup can retry after marker removal while preserving the active B account',async()=>{
 const {key,receipt}=prepare();const b=generationKey('B','g2','xai_ai_convos');localStorage.setItem(generationMarkerKey('B'),JSON.stringify({generation:'g2',migrationId:'fixture-B',previous:null}));localStorage.setItem(b,'["B private"]');accountScope.activate(accountScope.lock('B'),'g2');
 vi.stubGlobal('navigator',{locks:{request:async(_name:string,_options:LockOptions,run:()=>Promise<unknown>)=>run()}});
 const original=Storage.prototype.removeItem;let fail=true;vi.spyOn(Storage.prototype,'removeItem').mockImplementation(function(k){if(k===key&&fail){fail=false;throw new DOMException('Fault','UnknownError');}return original.call(this,k);});
 await expect(resumeAccountLocalDeletion(receipt,async()=>{})).rejects.toThrow();expect(readAccountDeletionReceipt('A')?.phase).toBe('pending');expect(localStorage.getItem(generationMarkerKey('A'))).toBeNull();expect(secret).not.toHaveBeenCalled();
 const auth=vi.fn(async()=>{});const result=await resumeAccountLocalDeletion(receipt,auth);expect(result.phase).toBe('complete');expect(localStorage.getItem(key)).toBeNull();expect(localStorage.getItem(b)).toBe('["B private"]');expect(auth).toHaveBeenCalledWith({owner:'A',generation:'auth-A'});
 expect((await resumeAccountLocalDeletion(receipt,auth)).phase).toBe('complete');expect(auth).toHaveBeenCalledTimes(1);
});

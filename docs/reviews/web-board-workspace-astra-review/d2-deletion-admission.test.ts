import {beforeEach,it,expect} from 'vitest';
import {accountScope,accountPrefix,generationKey,generationMarkerKey,deleteAccountLocalDataAccount} from '@repo/plugin-web-storage';
const lock=async<T>(_name:string,_mode:'shared'|'exclusive',run:()=>Promise<T>)=>run();
const prefix=accountPrefix('delete-admission');
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('delete-admission'),'g1');});
it.each(['corrupt-tombstone-missing-marker','legacy-tombstone-conflicting-marker'])('deletion refuses unproven generation recovery: %s',async scenario=>{
 const oldKey=generationKey('delete-admission','g1','xai_ai_convos'),newKey=generationKey('delete-admission','g2','xai_ai_convos');
 localStorage.setItem(oldKey,'["old retained"]');localStorage.setItem(newKey,'["new retained"]');
 localStorage.setItem(prefix+'deleted',scenario.startsWith('corrupt')?'not a deletion receipt':'1');
 if(scenario.startsWith('legacy')) localStorage.setItem(generationMarkerKey('delete-admission'),JSON.stringify({generation:'g2',migrationId:'newer-migration',previous:'g1'}));
 const before=Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)]));
 const result=await deleteAccountLocalDataAccount(accountScope.capture(),localStorage,lock);
 const after=Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)]));
 console.log('deletion-admission',JSON.stringify({scenario,result,before,after}));
 expect.soft(result.ok).toBe(false);expect(after).toEqual(before);
});

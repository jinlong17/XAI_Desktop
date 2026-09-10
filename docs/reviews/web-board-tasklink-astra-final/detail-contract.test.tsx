import {it,expect} from 'vitest';
import {createTestLockManager} from '../../../packages/plugin-web-board-workspaces/src/__tests__/webLocksHarness.js';
const deferred=()=>{let resolve!:()=>void;const promise=new Promise<void>(r=>resolve=r);return {promise,resolve};};
it('shared cohort overlaps; queued exclusive precedes later shared; independent names progress',async()=>{
 const locks=createTestLockManager(),a=deferred(),b=deferred(),writer=deferred(),seen:string[]=[];
 const one=locks.request('same',{mode:'shared'},async()=>{seen.push('reader1');await a.promise;});
 const two=locks.request('same',{mode:'shared'},async()=>{seen.push('reader2');await b.promise;});
 const three=locks.request('same',async()=>{seen.push('writer');await writer.promise;});
 const four=locks.request('same',{mode:'shared'},()=>{seen.push('late reader');});
 await locks.request('other',()=>seen.push('other'));
 expect(seen).toEqual(['reader1','reader2','other']);a.resolve();await one;expect(seen).toEqual(['reader1','reader2','other']);
 b.resolve();await two;expect(seen).toEqual(['reader1','reader2','other','writer']);writer.resolve();await Promise.all([three,four]);expect(seen).toEqual(['reader1','reader2','other','writer','late reader']);
});
it('throw and rejected promise release named exclusive queue and preserve errors',async()=>{
 const locks=createTestLockManager();await expect(locks.request('x',()=>{throw Error('sync');})).rejects.toThrow('sync');
 const gate=deferred();const failure=locks.request('x',async()=>{await gate.promise;throw Error('async');});const checked=expect(failure).rejects.toThrow('async');
 let entered=false;const next=locks.request('x',()=>{entered=true;return 42;});expect(entered).toBe(false);gate.resolve();await checked;expect(await next).toBe(42);
});
it('three-argument overload defaults to exclusive and serializes with two-argument overload',async()=>{
 const locks=createTestLockManager(),gate=deferred();let count=0;
 const first=locks.request('x',{},async()=>{count++;await gate.promise;});const second=locks.request('x',()=>++count);expect(count).toBe(1);gate.resolve();await first;expect(await second).toBe(2);expect(locks.calls).toEqual([{name:'x',mode:'exclusive'},{name:'x',mode:'exclusive'}]);
});

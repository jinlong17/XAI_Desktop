import {vi} from 'vitest';
import {createTestLockManager} from '../../../packages/plugin-web-board-workspaces/src/__tests__/webLocksHarness.js';
export {createTestLockManager};
/** Explicit test-only delay before lifecycle admission; nested dataset locks use the same named scheduler. */
export function controlledLocks(){
 const manager=createTestLockManager();
 const callbacks:Array<()=>Promise<unknown>>=[];
 const request=vi.fn((name:string,optionsOrCallback:any,callback?:any):Promise<any>=>{
  const enter=()=>manager.request(name,optionsOrCallback,callback);
  if(!name.endsWith(':lifecycle'))return enter();
  return new Promise((resolve,reject)=>{callbacks.push(async()=>{try{resolve(await enter());}catch(error){reject(error);}});});
 });
 return {request,callbacks};
}
export function deferredLocks(){
 const manager=createTestLockManager();let release!:()=>void;
 const gate=new Promise<void>(resolve=>release=resolve);
 const request=vi.fn(async(name:string,optionsOrCallback:any,callback?:any)=>{
  if(name.endsWith(':lifecycle'))await gate;
  return manager.request(name,optionsOrCallback,callback);
 });
 return {request,release};
}

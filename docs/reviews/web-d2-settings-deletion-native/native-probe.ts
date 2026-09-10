import {accountScope,generationMarkerKey,generationKey,accountPrefix} from './packages/plugin-web-storage/src/index.ts';
import {accountLifecycleLockName} from './packages/plugin-web-storage/src/internal/accountCoordination.ts';
import {beginAccountLocalDeletion,readAccountDeletionReceipt,resumeAccountLocalDeletion} from './packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts';
import {createIndexedDbStore} from './packages/web-auth-device-session/src/index.ts';
const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
function assert(v:unknown,message:string):asserts v{if(!v)throw Error(message);}
const secrets=createIndexedDbStore({dbName:'xai-web-ai-secrets',storeName:'secrets'});
const secretKey=(owner:string)=>'scoped:v2:'+encodeURIComponent(JSON.stringify(['account',owner,'g1','anthropic']));
async function run(){
 const initial=new URLSearchParams(location.search).get('phase')==='initial';const cases:any[]=[];const checkpoint:Record<string,any>={};
 if(initial)localStorage.clear();
 for(const name of ['held-account-lock','concurrent-cross-account-recovery']){
  let release:(()=>void)|undefined;let holder:Promise<unknown>|undefined;
  try{
   const a='native-delete-'+name,b=a+'-B',aKey=generationKey(a,'g1','xai_ai_convos'),bKey=generationKey(b,'g1','xai_ai_convos');
   const receiptKey=accountPrefix(a)+'deleted';
   if(!initial){const old=(window as any).__checkpoint?.[name];assert(old&&localStorage.getItem(receiptKey)===old.receipt,'Receipt changed across process exit');assert(localStorage.getItem(aKey)===null&&localStorage.getItem(bKey)==='B private','Account bytes changed after reopen');assert(await secrets.getItem(secretKey(a))===null&&await secrets.getItem(secretKey(b))==='opaque synthetic B','IndexedDB account separation lost after reopen');cases.push({name,pass:true});continue;}
   for(const owner of [a,b])localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
   localStorage.setItem(aKey,'A private');localStorage.setItem(bKey,'B private');await secrets.setItem(secretKey(a),'opaque synthetic A');await secrets.setItem(secretKey(b),'opaque synthetic B');
   const scope=accountScope.activate(accountScope.lock(a),'g1'),receipt=await beginAccountLocalDeletion(scope,'auth-'+a);
   accountScope.activate(accountScope.lock(b),'g1');
   let authCalls=0,accountHeldDuringAuth=false;
   const auth=async(owner:{owner:string;generation:string})=>{authCalls++;assert(owner.owner===a&&owner.generation==='auth-'+a,'Wrong captured auth cleanup');const state=await navigator.locks.query();accountHeldDuringAuth ||= state.held?.some(lock=>lock.name===accountLifecycleLockName(a))===true;await delay(40);};
   if(name==='held-account-lock'){
    let entered!:()=>void;const started=new Promise<void>(r=>entered=r),gate=new Promise<void>(r=>release=r);
    holder=navigator.locks.request(accountLifecycleLockName(a),{mode:'shared'},async()=>{entered();await gate;});await started;
    const operation=resumeAccountLocalDeletion(receipt,auth);await delay(80);
    const remainedPending=localStorage.getItem(aKey)==='A private'&&readAccountDeletionReceipt(a)?.phase==='pending'&&authCalls===0;
    release!();await holder;await operation;assert(remainedPending,'Cleanup bypassed an actually held native account lock');
   }else await Promise.all([resumeAccountLocalDeletion(receipt,auth),resumeAccountLocalDeletion(receipt,auth)]);
   assert(authCalls===1,'Concurrent recovery repeated auth participant: '+authCalls);assert(!accountHeldDuringAuth,'Account lifecycle lock held during async auth participant');
   assert(readAccountDeletionReceipt(a)?.phase==='complete','Cleanup not durably complete');assert(localStorage.getItem(aKey)===null&&localStorage.getItem(bKey)==='B private','Wrong account local cleanup');assert(accountScope.capture().accountId===b,'Recovery changed current B account');
   assert(await secrets.getItem(secretKey(a))===null&&await secrets.getItem(secretKey(b))==='opaque synthetic B','Wrong actual IndexedDB secret cleanup');
   await resumeAccountLocalDeletion(receipt,auth);assert(authCalls===1,'Completed retry repeated auth cleanup');checkpoint[name]={receipt:localStorage.getItem(receiptKey)};cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}finally{release?.();await holder;}
 }
 return {pass:cases.every(c=>c.pass),cases,...(initial?{checkpoint}:{}),scope:'Actual Settings recovery, native WebLocks and IndexedDB secrets in isolated profile; synthetic auth cleanup callback, no real provider/server deletion, no full UI or old-client claim'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

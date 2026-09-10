import {browserAccountLock,accountLifecycleLockName} from './packages/plugin-web-storage/src/internal/accountCoordination.ts';
import {accountScope,createAccountScopeController,generationMarkerKey,generationKey} from './packages/plugin-web-storage/src/internal/accountScope.ts';
import {setPrefAutosaveAccount} from './packages/plugin-web-storage/src/internal/storage.ts';
import {migrateAccount} from './packages/plugin-web-storage/src/internal/accountMigration.ts';
function assert(value:unknown,message:string):asserts value{if(!value)throw Error(message);}
async function run(){
 const cases:any[]=[];
 const initial=new URLSearchParams(location.search).get('phase')==='initial';
 if(!initial){const pass=localStorage.getItem(generationKey('native-autosave','g1','xai_pref_native_lock'))===JSON.stringify({text:'Committed'});return {pass,cases:[{name:'committed autosave retained after restart',pass}],scope:'Persisted autosave only'};}
 localStorage.clear();
 for(const name of ['native shared adapter','public account autosave','public account migration']){
  try{
   if(name==='native shared adapter'){
    const lockName='native-account-adapter';let observed=false;
    await browserAccountLock(lockName,'shared',async()=>{const state=await navigator.locks.query();observed=state.held?.some(lock=>lock.name===lockName&&lock.mode==='shared')===true;});
    assert(observed,'Requested shared mode was not held as shared');
   }else if(name==='public account autosave'){
    const account='native-autosave';localStorage.setItem(generationMarkerKey(account),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));
    const scope=accountScope.activate(accountScope.lock(account),'g1');
    const result=await setPrefAutosaveAccount('native_lock',{text:'Committed'},{scope});
    assert(result.ok,'Public async autosave refused with native available lock: '+JSON.stringify(result));
    assert(localStorage.getItem(generationKey(account,'g1','xai_pref_native_lock'))===JSON.stringify({text:'Committed'}),'Autosave acknowledgement without physical data');
   }else{
    const account='native-migration',controller=createAccountScopeController();let observed=false;
    const result=await migrateAccount({storage:localStorage,controller,transition:controller.lock(account),choice:'empty',newId:()=> 'native',secrets:{stage:async()=>{const state=await navigator.locks.query();observed=state.held?.some(lock=>lock.name===accountLifecycleLockName(account)&&lock.mode==='exclusive')===true;},verify:async()=>{}}});
    assert(result.generation==='migration-native'&&observed,'Migration did not hold account exclusive lock and publish');
   }
   cases.push({name,pass:true});
  }catch(error){cases.push({name,pass:false,error:String(error)});}
 }
 return {pass:cases.every(c=>c.pass),cases,checkpoint:{},nativeRequestArity:navigator.locks.request.length,scope:'Native Chrome public adapter and account APIs; no mocked navigator, no activation or product UI acceptance'};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error)})}));

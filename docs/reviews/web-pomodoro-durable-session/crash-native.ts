import { accountScope } from '../../../packages/plugin-web-storage/src/index';
import { command, retainPomodoroController, ACTIVE_KEY, HISTORY_KEY } from '../../../packages/plugin-web-pomodoro/src/internal/sessionController';
accountScope.activate(accountScope.lock('crash-A'),'fixture');retainPomodoroController();
const wait=()=>new Promise(resolve=>setTimeout(resolve,250));
const key=(logical:string)=>accountScope.physicalKey(logical);
const read=(logical:string)=>JSON.parse(localStorage.getItem(key(logical))??'null');
(async()=>{
 await wait();
 const phase=localStorage.getItem('diagnostic-phase')??'history';
 const checks=JSON.parse(localStorage.getItem('diagnostic-checks')??'[]');
 if(phase==='recover-history'||phase==='recover-clear'){
  const id=localStorage.getItem('diagnostic-id');const history=read(HISTORY_KEY);
  checks.push({name:phase,pass:read(ACTIVE_KEY)===null&&history.filter((row:any)=>row.id===id).length===1});
  if(phase==='recover-clear'){
   checks.push({name:'cleanup replay preserves first recordedAt',pass:history.find((row:any)=>row.id===id).recordedAt===localStorage.getItem('diagnostic-recordedAt')});
   await fetch('/result',{method:'POST',body:JSON.stringify({diagnosis:true,pass:checks.every((c:any)=>c.pass),checks})});return;
  }
 }
 const fail=phase==='history'?'history':'clear';
 await command('start',{mode:'focus',durationMs:60000});const active=read(ACTIVE_KEY);
 localStorage.setItem('diagnostic-id',active.sessionId);
 const originalSet=Storage.prototype.setItem,originalRemove=Storage.prototype.removeItem;
 Storage.prototype.setItem=function(k:string,v:string){if(fail==='history'&&k===key(HISTORY_KEY))throw new DOMException('full','QuotaExceededError');return originalSet.call(this,k,v);};
 Storage.prototype.removeItem=function(k:string){if(fail==='clear'&&k===key(ACTIVE_KEY))throw new DOMException('full','QuotaExceededError');return originalRemove.call(this,k);};
 const ok=await command('end');
 checks.push({name:fail+' failure leaves durable pending',pass:!ok&&read(ACTIVE_KEY)?.phase==='settlement-pending'});
 if(fail==='clear')localStorage.setItem('diagnostic-recordedAt',read(HISTORY_KEY).find((row:any)=>row.id===active.sessionId).recordedAt);
 localStorage.setItem('diagnostic-checks',JSON.stringify(checks));localStorage.setItem('diagnostic-phase','recover-'+fail);location.reload();
})().catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({error:String(error)})}));

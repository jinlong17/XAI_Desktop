import { accountScope } from '../../../packages/plugin-web-storage/src/index';
import { command, getPomodoroSnapshot, retainPomodoroController, ACTIVE_KEY, HISTORY_KEY } from '../../../packages/plugin-web-pomodoro/src/internal/sessionController';
accountScope.activate(accountScope.lock('native-durable-A'),'fixture');
const release = retainPomodoroController();
const read=(key:string)=>JSON.parse(localStorage.getItem(accountScope.physicalKey(key))??'null');
const wait=()=>new Promise(resolve=>setTimeout(resolve,150));
async function run(){
 if(location.pathname==='/observer'){
  window.opener.postMessage({probe:'ready'},location.origin);
  window.addEventListener('message',async event=>{if(event.origin!==location.origin||event.data.command!=='end')return; const result=await command('end');window.opener.postMessage({probe:'ended',result},location.origin);});return;
 }
 const checks:any[]=[];
 const check=(name:string,pass:boolean,details?:unknown)=>{checks.push({name,pass,details});if(!pass)throw Error(name);};
 await command('start',{mode:'focus',durationMs:60000}); const original=read(ACTIVE_KEY);
 const ready=new Promise(resolve=>window.addEventListener('message',event=>{if(event.origin===location.origin&&event.data.probe==='ready')resolve(true);}));
 const child=window.open('/observer');await ready;
 const ended=new Promise(resolve=>window.addEventListener('message',event=>{if(event.origin===location.origin&&event.data.probe==='ended')resolve(event.data.result);}));
 child!.postMessage({command:'end'},location.origin);await command('end');await ended;child?.close();await wait();
 check('two real windows end one shared session once',read(HISTORY_KEY).filter((row:any)=>row.id===original.sessionId).length===1,read(HISTORY_KEY));
 const realNow=Date.now;let offset=0;Date.now=()=>realNow()+offset;
 await command('start',{mode:'focus',durationMs:60000});const late=read(ACTIVE_KEY);offset=120000;await command('reconcile');
 const completed=read(HISTORY_KEY).find((row:any)=>row.id===late.sessionId);
 check('late completion uses deadline and later recordedAt',Date.parse(completed.finishedAt)===late.deadline&&Date.parse(completed.recordedAt)>late.deadline,completed);
 Date.now=realNow;
 const sourceA=accountScope.capture();accountScope.activate(accountScope.lock('native-durable-B'),'fixture');
 check('B does not read A history or active session',read(HISTORY_KEY)===null&&getPomodoroSnapshot().active===null);
 await command('start',{mode:'focus',durationMs:60000});const b=read(ACTIVE_KEY);await command('end');
 accountScope.activate(accountScope.lock('native-durable-A'),'fixture');
 check('A remains isolated after B settlement',!read(HISTORY_KEY).some((row:any)=>row.id===b.sessionId));
 release();await fetch('/result',{method:'POST',body:JSON.stringify({diagnosis:true,checks,pass:checks.every(row=>row.pass),sourceGeneration:sourceA.generation})});
}
run().catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({error:String(error)})}));

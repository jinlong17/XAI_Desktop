import { accountScope } from '../../../packages/plugin-web-storage/src/index';
import { command, retainPomodoroController, ACTIVE_KEY, HISTORY_KEY } from '../../../packages/plugin-web-pomodoro/src/internal/sessionController';
accountScope.activate(accountScope.lock('closed-A'),'fixture');retainPomodoroController();
const wait=()=>new Promise(resolve=>setTimeout(resolve,300));
(async()=>{
 await wait();
 const saved=localStorage.getItem('diagnostic-closed-session');
 if(!saved){
  await command('start',{mode:'focus',durationMs:1500});
  const active=JSON.parse(localStorage.getItem(accountScope.physicalKey(ACTIVE_KEY))!);
  localStorage.setItem('diagnostic-closed-session',JSON.stringify(active));
  await fetch('/checkpoint',{method:'POST',body:'ready'});return;
 }
 const source=JSON.parse(saved);await command('reconcile');await command('reconcile');
 const history=JSON.parse(localStorage.getItem(accountScope.physicalKey(HISTORY_KEY))??'[]');
 const records=history.filter((record:any)=>record.id===source.sessionId);
 const pass=records.length===1&&Date.parse(records[0].finishedAt)===source.deadline&&Date.parse(records[0].recordedAt)>source.deadline&&localStorage.getItem(accountScope.physicalKey(ACTIVE_KEY))===null;
 await fetch('/result',{method:'POST',body:JSON.stringify({pass,case:'whole browser process closed across deadline then reopened same profile',records,deadline:source.deadline})});
})().catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({error:String(error)})}));

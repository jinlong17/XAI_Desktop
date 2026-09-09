import React from '../../../packages/plugin-web-pomodoro/node_modules/react';
import { createRoot } from '../../../packages/plugin-web-pomodoro/node_modules/react-dom/client';
import { accountScope } from '../../../packages/plugin-web-storage/src/index';
import { useTimerTick } from '../../../packages/plugin-web-pomodoro/src/internal/useTimerTick';
accountScope.activate(accountScope.lock('native-pomo-A'),'fixture');
let timer: ReturnType<typeof useTimerTick>;
function Host(){timer=useTimerTick();return <div>{timer.timerState.kind}</div>;}
const node=document.createElement('div');document.body.append(node);const root=createRoot(node);root.render(<Host/>);
const wait=()=>new Promise(resolve=>setTimeout(resolve,100));
(async()=>{
 await wait();
 if(location.pathname==='/observer') {window.opener.postMessage({probe:'observer',kind:timer.timerState.kind},location.origin);return;}
 const phase=localStorage.getItem('diagnostic-phase');
 if(!phase){
  timer.start(60000);await wait();localStorage.setItem('diagnostic-phase','running');location.reload();return;
 }
 const results=JSON.parse(localStorage.getItem('diagnostic-results')??'[]');
 if(phase==='running'){
  results.push({case:'real page reload running session',expected:'running',actual:timer.timerState.kind});
  timer.start(60000);await wait();timer.pause();await wait();
  localStorage.setItem('diagnostic-results',JSON.stringify(results));localStorage.setItem('diagnostic-phase','paused');location.reload();return;
 }
 results.push({case:'real page reload paused session',expected:'paused',actual:timer.timerState.kind});
 timer.start(60000);await wait();
 const observer=new Promise(resolve=>window.addEventListener('message',event=>{if(event.origin===location.origin&&event.data.probe==='observer')resolve(event.data.kind);}));
 const child=window.open('/observer');const kind=await observer;child?.close();
 results.push({case:'second browser window same account observes active session',expected:'running',actual:kind});
 await fetch('/result',{method:'POST',body:JSON.stringify({diagnosis:true,results,expectationFailures:results.filter((row:any)=>row.expected!==row.actual).length})});
})().catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({error:String(error)})}));

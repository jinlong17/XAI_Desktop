import {accountScope} from './packages/plugin-web-storage/src/index.ts';
import {command,retainPomodoroController,getPomodoroSnapshot} from './packages/plugin-web-pomodoro/src/internal/sessionController.ts';
accountScope.activate(accountScope.lock('independent-closed'),'g1');retainPomodoroController();
const active=()=>JSON.parse(localStorage.getItem(accountScope.physicalKey('xai_pomodoro_active'))??'null');
const history=()=>JSON.parse(localStorage.getItem(accountScope.physicalKey('xai_pomodoro_sessions'))??'[]');
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const stage=(window as any).stage;await wait(200);if(stage===0){await command('start',{mode:'focus',durationMs:1500});if((window as any).pauseFixture){await wait(100);await command('pause')}const running=active();await fetch('/result',{method:'POST',body:JSON.stringify({stage,source:running})});return;}
await command('reconcile');await wait(150);await fetch('/result',{method:'POST',body:JSON.stringify({stage,active:active(),history:history(),error:getPomodoroSnapshot().error})});})().catch(e=>fetch('/result',{method:'POST',body:JSON.stringify({error:String(e)})}));

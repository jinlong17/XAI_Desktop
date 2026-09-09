import React from './packages/plugin-web-pomodoro/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-pomodoro/node_modules/react-dom/client.js';
import {PomodoroModule} from './packages/plugin-web-pomodoro/src/PomodoroModule.tsx';
import {PomodoroSessionHost} from './packages/plugin-web-pomodoro/src/session-host.tsx';
import {accountScope,generationKey} from './packages/plugin-web-storage/src/index.ts';
import {command,retainPomodoroController,getPomodoroSnapshot,retryPomodoro,exportPomodoroRecovery} from './packages/plugin-web-pomodoro/src/internal/sessionController.ts';
accountScope.activate(accountScope.lock('independent-POMO-A'),'g1');
const activeKey=generationKey('independent-POMO-A','g1','xai_pomodoro_active'),historyKey=generationKey('independent-POMO-A','g1','xai_pomodoro_sessions');
(window as any).probe={command,retry:retryPomodoro,snapshot:getPomodoroSnapshot,recovery:()=>exportPomodoroRecovery(),active:()=>JSON.parse(localStorage.getItem(activeKey)??'null'),history:()=>JSON.parse(localStorage.getItem(historyKey)??'[]')};
document.body.dataset.ready='true';
const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,realNow=Date.now;
let offset=0;Date.now=()=>realNow()+offset;
Object.assign((window as any).probe,{
 reset:()=>{Storage.prototype.setItem=nativeSet;Storage.prototype.removeItem=nativeRemove;offset=0;localStorage.removeItem(activeKey);localStorage.removeItem(historyKey);accountScope.activate(accountScope.lock('independent-POMO-A'),'g1')},
 offset:(ms:number)=>{offset=ms},
 fault:(cut:string)=>{Storage.prototype.setItem=function(k,v){if(cut==='history'&&k===historyKey||cut==='pending'&&k===activeKey&&JSON.parse(v).phase==='settlement-pending')throw new DOMException('Independent cut','QuotaExceededError');nativeSet.call(this,k,v)};Storage.prototype.removeItem=function(k){if(cut==='clear'&&k===activeKey)throw new DOMException('Independent clear cut','QuotaExceededError');nativeRemove.call(this,k)}},
 restore:()=>{Storage.prototype.setItem=nativeSet;Storage.prototype.removeItem=nativeRemove},
 switchB:()=>accountScope.activate(accountScope.lock('independent-POMO-B'),'g1'),
 bRaw:()=>localStorage.getItem(generationKey('independent-POMO-B','g1','xai_pomodoro_active')),
 captureExport:()=>{const captured=accountScope.capture();(window as any).oldExport=()=>exportPomodoroRecovery(captured)},
});

const root=createRoot(document.getElementById('app')!);function route(away=false){root.render(React.createElement(React.Fragment,null,React.createElement(PomodoroSessionHost),away?React.createElement('div',{id:'away-route'},'Other route'):React.createElement(PomodoroModule,{lang:'en'})))};(window as any).probe.route=route;route();

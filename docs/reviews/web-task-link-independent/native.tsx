import React from './packages/plugin-web-board-workspaces/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-board-workspaces/node_modules/react-dom/client.js';
import {BoardWorkspacesModule} from './packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.tsx';
import {TasksModule} from './packages/xai-web-tasks/src/TasksModule.tsx';
import {makeDefaultBoards} from './packages/plugin-web-board-core/src/internal/seed/board-data.ts';
import {SEED_TASK_COLS} from './packages/xai-web-tasks/src/internal/seed/tasksMock.ts';
import {ensureBoardTaskLink} from './packages/plugin-web-board-workspaces/src/internal/taskLinkCommand.ts';
import {accountScope} from './packages/plugin-web-storage/src/index.ts';
import './packages/plugin-web-tokens/src/tokens.css';import './packages/plugin-web-tokens/src/layout.css';
import './packages/plugin-web-board-workspaces/src/styles.css';import './packages/xai-web-tasks/src/styles.css';
const NativeDate=Date;let now=NativeDate.parse('2026-05-23T12:00:00');
(globalThis as any).Date=class extends NativeDate{constructor(...args:any[]){super(...(args.length?args:[now]) as [any]);}static now(){return now}};
accountScope.activate(accountScope.lock('task02-native'),'one');
const boardKey=accountScope.physicalKey('xai_boards_v2'),taskKey=accountScope.physicalKey('xai_task_cols');
if(!localStorage.getItem(boardKey))localStorage.setItem(boardKey,JSON.stringify(makeDefaultBoards()));
if(!localStorage.getItem(taskKey))localStorage.setItem(taskKey,JSON.stringify(SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0}))));
const root=createRoot(document.getElementById('app')!);let view=0;
const show=(tasks=false)=>root.render(tasks?<TasksModule key={++view} lang="en"/>:<BoardWorkspacesModule key={++view} lang="en"/>);
const nativeSet=Storage.prototype.setItem;
(window as any).verify={show,boardKey,taskKey,boards:()=>JSON.parse(localStorage.getItem(boardKey)!),tasks:()=>JSON.parse(localStorage.getItem(taskKey)!).flatMap((c:any)=>[...c.tasks,...(c.completed??[])]),failTask:()=>{Storage.prototype.setItem=function(k,v){if(k===taskKey)throw new DOMException('synthetic quota','QuotaExceededError');nativeSet.call(this,k,v)}},restore:()=>{Storage.prototype.setItem=nativeSet},advance:()=>now+=86400000};show();

function resetCut(){Storage.prototype.setItem=nativeSet;accountScope.activate(accountScope.lock('task02-native'),'one');localStorage.setItem(boardKey,JSON.stringify(makeDefaultBoards()));localStorage.setItem(taskKey,JSON.stringify(SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0}))));}
(window as any).verify.cut=(phase:string)=>{resetCut();const scope=accountScope.capture();let writes=0;const before={board:localStorage.getItem(boardKey),task:localStorage.getItem(taskKey)};Storage.prototype.setItem=function(k,v){if(k===boardKey)writes++;if(phase==='intent'&&k===boardKey||phase==='task'&&k===taskKey||phase==='acknowledgement'&&k===boardKey&&writes===2)throw new DOMException('independent cut','QuotaExceededError');nativeSet.call(this,k,v)};const result=ensureBoardTaskLink('b-default','bc1',scope);Storage.prototype.setItem=nativeSet;return {result,before,after:{board:localStorage.getItem(boardKey),task:localStorage.getItem(taskKey)}}};
(window as any).verify.retry=()=>ensureBoardTaskLink('b-default','bc1',accountScope.capture());
(window as any).verify.editExisting=()=>{const cols=JSON.parse(localStorage.getItem(taskKey)!);for(const c of cols)for(const t of c.tasks)if(t.source?.cardId==='bc1'){t.done=true;t.completedAt='2026-05-23T19:00:00.123Z';t.notes='independent user edit';t.title={en:'Latest task edit',zh:'最新任务'}}localStorage.setItem(taskKey,JSON.stringify(cols));return localStorage.getItem(taskKey)};
(window as any).verify.accountCut=()=>{resetCut();const a=accountScope.capture();let switched=false;Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(!switched&&k===boardKey){switched=true;accountScope.activate(accountScope.lock('task02-B'),'B');}};const result=ensureBoardTaskLink('b-default','bc1',a);Storage.prototype.setItem=nativeSet;const aRaw=localStorage.getItem(boardKey);const bKey=accountScope.physicalKey('xai_boards_v2');const bTask=accountScope.physicalKey('xai_task_cols');const stale=ensureBoardTaskLink('b-default','bc1',a);return {result,stale,switched,aRaw,aRawAfter:localStorage.getItem(boardKey),bBoard:localStorage.getItem(bKey),bTask:localStorage.getItem(bTask),aTasks:JSON.parse(localStorage.getItem(taskKey)!).flatMap((c:any)=>c.tasks)}};

import React from './packages/xai-web-tasks/node_modules/react/index.js';
import {createRoot} from './packages/xai-web-tasks/node_modules/react-dom/client.js';
import {TasksModule} from './packages/xai-web-tasks/src/TasksModule.tsx';
import {BookkeepingModule} from './packages/plugin-web-bookkeeping/src/BookkeepingModule.tsx';
import {BookkeepingSaveFailure} from './packages/plugin-web-bookkeeping/src/BookkeepingSaveFailure.tsx';
import {useBookkeepingState} from './packages/plugin-web-bookkeeping/src/internal/storage.ts';
import {createSeedBookkeepingState} from './packages/plugin-web-bookkeeping/src/internal/defaults.ts';
import {accountScope,generationKey,generationMarkerKey} from './packages/plugin-web-storage/src/index.ts';
import './packages/plugin-web-tokens/src/tokens.css';import './packages/plugin-web-tokens/src/layout.css';import './packages/xai-web-tasks/src/styles.css';import './packages/plugin-web-bookkeeping/src/styles.css';
const seed=createSeedBookkeepingState();seed.budgetTotal=111;
const a=(logical:string)=>generationKey('native-A','g1',logical),b=(logical:string)=>generationKey('native-B','g2',logical);
localStorage.setItem(a('xai_bk_state_v2'),JSON.stringify(seed));localStorage.setItem(b('xai_task_cols'),'B-tasks');localStorage.setItem(b('xai_bk_state_v2'),'B-bookkeeping');localStorage.setItem('xai_bk_view','detail');localStorage.setItem('xai_bk_calendar_mode','month');
const locked=accountScope.lock('native-A');localStorage.setItem(generationMarkerKey('native-A'),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));accountScope.activate(locked,'g1');
let root=createRoot(document.getElementById('app')!);let hook:ReturnType<typeof useBookkeepingState>;
function HookProbe(){hook=useBookkeepingState();return <><p>Committed budget: {hook[0].budgetTotal}</p><BookkeepingSaveFailure recovery={hook[2]} lang="en" onRecovered={()=>{}}/></>;}
const original=Storage.prototype.setItem;const writes:string[]=[];
function deny(keys:string[]){Storage.prototype.setItem=function(k,v){writes.push(k);if(keys.includes(k))throw new DOMException('Independent native quota fault','QuotaExceededError');original.call(this,k,v);};}
function render(feature:string){root.unmount();root=createRoot(document.getElementById('app')!);root.render(feature==='tasks'?<TasksModule lang="en"/>:feature==='bookkeeping'?<BookkeepingModule lang="zh"/>:<HookProbe/>);}
(window as any).verify={a,b,render,deny,restore:()=>{Storage.prototype.setItem=original},writes,clearWrites:()=>{writes.length=0},stored:(logical:string)=>localStorage.getItem(a(logical)),switchB:()=>accountScope.activate(accountScope.lock('native-B'),'g2'),Bsafe:()=>localStorage.getItem(b('xai_task_cols'))==='B-tasks'&&localStorage.getItem(b('xai_bk_state_v2'))==='B-bookkeeping',partial:()=>hook[1](s=>({...s,budgetTotal:222,prefs:{...s.prefs,billsView:'overview',calendarMode:'year',dashboardOrder:'quick-first'}})),retryTwice:()=>{hook[2].retry();hook[2].retry()},pending:()=>hook[2].pending};
root.render(<TasksModule lang="en"/>);

import React from './packages/xai-web-tasks/node_modules/react/index.js';
import {createRoot} from './packages/xai-web-tasks/node_modules/react-dom/client.js';
import {TasksModule} from './packages/xai-web-tasks/src/TasksModule.tsx';
import {SEED_TASK_COLS} from './packages/xai-web-tasks/src/internal/seed/tasksMock.ts';
import {accountScope} from './packages/plugin-web-storage/src/index.ts';
import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
import './packages/xai-web-tasks/src/styles.css';
const OriginalDate=Date;let base=OriginalDate.now(),anchor=performance.now();
(globalThis as any).Date=class extends OriginalDate{constructor(...args:any[]){super(...(args.length?args:[base+performance.now()-anchor]) as [any]);}static now(){return base+performance.now()-anchor}};
accountScope.activate(accountScope.lock('tasks-date-independent'),'one');
const key=accountScope.physicalKey('xai_task_cols');let mounts=0;const root=createRoot(document.getElementById('app')!);
function shift(value:string){base=OriginalDate.parse(value);anchor=performance.now();}
function setup(now:string,entries:[string,string|null][]){shift(now);const cols=SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0}));cols[3].tasks=entries.map(([id,dueDate])=>({id,title:{en:id,zh:id},...(dueDate?{dueDate}:{date:'1/1',dateZh:'1月1日'})})) as any;localStorage.setItem(key,JSON.stringify(cols));root.render(<TasksModule key={++mounts} lang="en"/>);}
(window as any).verify={setup,shift,rows:()=>JSON.parse(localStorage.getItem(key)!),get mounts(){return mounts}};
setup('2026-12-31T12:00:00',[['initial','2026-12-31']]);

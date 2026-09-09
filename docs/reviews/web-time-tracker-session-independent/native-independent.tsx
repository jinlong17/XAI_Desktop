import React from './packages/plugin-web-time-tracker/node_modules/react/index.js';import {createRoot} from './packages/plugin-web-time-tracker/node_modules/react-dom/client.js';
import {TimeTrackerModule} from './packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx';
import {commitTimeTrackerEntries,useTimeTrackerEntries,writeTimeTrackerEntries,readTimeTrackerEntries,resumeTimeTrackerEntry,finishTimeTrackerEntry} from './packages/plugin-web-time-tracker/src/internal/storage.ts';
import {entryDuration} from './packages/plugin-web-time-tracker/src/internal/time.ts';
import {accountScope,generationKey} from './packages/plugin-web-storage/src/index.ts';
import './packages/plugin-web-tokens/src/tokens.css';import './packages/plugin-web-tokens/src/layout.css';import './packages/plugin-web-time-tracker/src/styles.css';
const NativeDate=Date;const now=NativeDate.parse('2026-06-01T12:00:00');(globalThis as any).Date=class extends NativeDate{constructor(...args:any[]){super(...(args.length?args:[now]) as [any]);}static now(){return now}};
accountScope.activate(accountScope.lock('session-A'),'one');const key=generationKey('session-A','one','xai_tt_entries_v2');
function seed(done=false){const row={id:'session-one',categoryId:'cat_work',subId:null,note:{en:'source multi',zh:'source multi'},segments:[{start:now-7200000+125,end:now-6600000+875},{start:now-3600000+250,end:now-3000000+750}],done,createdAt:now-7200000,updatedAt:now};writeTimeTrackerEntries([row]);return row;}
if(!localStorage.getItem(key))seed();
function Harness(){const [rows,setRows,recovery]=useTimeTrackerEntries();(window as any).recovery=recovery;(window as any).resume=(at:number)=>setRows(prev=>prev.map(e=>resumeTimeTrackerEntry(e,at)));(window as any).end=(at:number)=>setRows(prev=>prev.map(e=>finishTimeTrackerEntry(e,at)));(window as any).cached=()=>rows;return <TimeTrackerModule lang="en"/>;}
(window as any).verify={seed,raw:()=>localStorage.getItem(key),rows:()=>readTimeTrackerEntries(),now,total:(at:number)=>readTimeTrackerEntries().reduce((n,e)=>n+entryDuration(e,at),0)};
createRoot(document.getElementById('app')!).render(<Harness/>);

(window as any).commands={commit:commitTimeTrackerEntries,capture:()=>accountScope.capture(),switchB:()=>accountScope.activate(accountScope.lock("session-B"),"one"),physical:()=>accountScope.physicalKey("xai_tt_entries_v2")};

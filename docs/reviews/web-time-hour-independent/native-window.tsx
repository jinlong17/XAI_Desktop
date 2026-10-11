import React from './packages/plugin-web-time-tracker/node_modules/react/index.js';import {createRoot} from './packages/plugin-web-time-tracker/node_modules/react-dom/client.js';
import {TimeTrackerModule} from './packages/plugin-web-time-tracker/src/TimeTrackerModule.tsx';
import {TimeTrackerWidget} from './packages/xai-web-dashboard-widgets/src/widgets/TimeTrackerWidget.tsx';
import {createTimeTrackerEntry,writeTimeTrackerEntries,getTimeTrackerSnapshot,readTimeTrackerEntries} from './packages/plugin-web-time-tracker/src/internal/storage.ts';
import {entriesOnDay,entryHourTotals,entryDayTotals,entryDuration} from './packages/plugin-web-time-tracker/src/internal/time.ts';
import {accountScope,generationKey,generationMarkerKey} from './packages/plugin-web-storage/src/index.ts';
import './packages/plugin-web-tokens/src/tokens.css';import './packages/plugin-web-tokens/src/layout.css';import './packages/plugin-web-time-tracker/src/styles.css';
const NativeDate=Date;let clock=NativeDate.parse('2026-06-01T12:00:00');
(globalThis as any).Date=class extends NativeDate{constructor(...args:any[]){super(...(args.length?args:[clock]) as [any]);}static now(){return clock;}};
const at=(s:string)=>new NativeDate(s).getTime();const make=(id:string,cat:string,start:string,end:string|null,sub:string|null=null)=>({...createTimeTrackerEntry(cat,sub,at(start),end===null?null:at(end),{en:id,zh:id}),id});
const types=['today-total','current','week-total','month-total','avg-day','days-tracked','donut-today','donut-range','cat-ranking','goal-progress','sub-split','by-weekday','trend-7d','by-hour','trend-30d','heatmap','range-summary','category-mosaic','focus-rhythm','recent-sessions'];
let root=createRoot(document.getElementById('app')!);let source:any[]=[];const key=generationKey('window-A','one','xai_tt_entries_v2');
function setup(kind='rich'){
 root.unmount();root=createRoot(document.getElementById('app')!);const transition=accountScope.lock('window-A');localStorage.setItem(generationMarkerKey('window-A'),JSON.stringify({generation:'one',migrationId:'test',previous:null}));accountScope.activate(transition,'one');
 if(kind==='rich'){
 clock=at('2026-06-01T12:00:00');source=[make('cross-work','cat_work','2026-05-31T23:30:00','2026-06-01T00:30:00','sub_design'),{...make('paused-study','cat_study','2026-05-31T23:40:00','2026-05-31T23:50:00','sub_code'),segments:[{start:at('2026-05-31T23:40:00'),end:at('2026-05-31T23:50:00')},{start:at('2026-06-01T01:00:00'),end:at('2026-06-01T02:00:00')}]},make('running-work','cat_work','2026-06-01T11:50:00',null,'sub_dev'),make('future-work','cat_work','2026-06-02T13:00:00','2026-06-02T14:00:00'),make('precise-work','cat_work','2026-06-01T02:59:30.125','2026-06-01T03:00:40.875','sub_meet'),make('boundary-end','cat_work','2026-05-31T23:30:00','2026-06-01T00:00:00')];
 }else{
 const dates:any={spring:['2026-03-07T23:50:00','2026-03-09T00:10:00','2026-03-09T12:00:00'],fall:['2026-10-31T23:50:00','2026-11-02T00:10:00','2026-11-02T12:00:00'],halfFall:['2026-04-04T23:50:00','2026-04-06T00:10:00','2026-04-06T12:00:00'],halfSpring:['2026-10-03T23:50:00','2026-10-05T00:10:00','2026-10-05T12:00:00']};const d=dates[kind];clock=at(d[2]);source=[make('dst-source','cat_work',d[0],d[1])];
 }
 writeTimeTrackerEntries(source);localStorage.setItem(accountScope.physicalKey('xai_tt_insights_v1'),JSON.stringify(types.map(type=>({iid:type,type,catId:'cat_work'}))));
 root.render(<><aside id="widget"><TimeTrackerWidget lang="en" now={new Date(clock)} goTo={()=>{}}/></aside><TimeTrackerModule lang="en"/></>);
}
(window as any).verify={setup,source:()=>source,raw:()=>localStorage.getItem(key),entries:()=>readTimeTrackerEntries(),snapshot:()=>getTimeTrackerSnapshot(clock),types,cardEvidence:()=>[...document.querySelectorAll('.tt-ins-card')].map((c,i)=>({type:types[i],text:c.textContent,tips:[...c.querySelectorAll('[data-tip]')].map(x=>x.getAttribute('data-tip')),number:c.querySelector('.tt-ins-num strong')?.textContent})),day:(key:string)=>{const rows=entriesOnDay(source,key,clock);return {count:rows.length,total:rows.reduce((a,e)=>a+entryDuration(e,clock),0),hours:rows.reduce((a,e)=>entryHourTotals(e,clock).map((v,i)=>v+a[i]),Array(24).fill(0)),days:rows.flatMap(e=>[...entryDayTotals(e,clock)])}}};setup();

/** Isolated real Chromium verification: no user profile, credentials, or network. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-rel01-browser-'));
const source = `
import React from './packages/xai-web-tasks/node_modules/react/index.js';
import {createRoot} from './packages/xai-web-tasks/node_modules/react-dom/client.js';
import {CalendarModule} from './packages/xai-web-calendar/src/CalendarModule.tsx';
import {utcDateKey} from './packages/xai-web-habits/src/internal/dateKeys.ts';
import {utcDay} from './packages/plugin-web-statistics/src/internal/rangeWindow.ts';
import {rangeWindow} from './packages/plugin-web-metric-tracker/src/internal/date.ts';
import {dayKey} from './packages/plugin-web-time-tracker/src/internal/time.ts';
import {filterCardsByList} from './packages/xai-web-tasks/src/internal/filterCardsByList.ts';
import {dstHoursForDay,hourToRow,buildHourLabels} from './packages/xai-web-calendar/src/internal/timeGridMath.ts';
const NativeDate=Date;let instant=Date.parse('2026-09-09T06:30:00Z');
class ClockDate extends NativeDate {constructor(...args){super(...(args.length?args:[instant]));}static now(){return instant;}}
window.Date=ClockDate;
const assert=(c,m)=>{if(!c)throw Error(m);}; const delay=()=>new Promise(r=>setTimeout(r,100));
(async()=>{
 const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
 const values={
  'America/Los_Angeles':['2026-09-08','2026-09-08T07:00:00.000Z','2026-09-09T06:59:59.999Z',[23,25,24,24]],
  'UTC':['2026-09-09','2026-09-09T00:00:00.000Z','2026-09-09T23:59:59.999Z',[24,24,24,24]],
  'Asia/Shanghai':['2026-09-09','2026-09-08T16:00:00.000Z','2026-09-09T15:59:59.999Z',[24,24,24,24]],
  'Australia/Lord_Howe':['2026-09-09','2026-09-08T13:30:00.000Z','2026-09-09T13:29:59.999Z',[24,24,24.5,23.5]],
 };
 const [expected,start,end,hours]=values[zone];const now=new Date();
 assert(utcDateKey(now)===expected,'Habits day');assert(dayKey(instant)===expected,'TT day');assert(utcDay(now).toISOString()===start,'Statistics day boundary');assert(rangeWindow('7d',now).end.toISOString()===end,'Metrics day end');
 const cards=[{id:'overdue',tasks:[{id:'8',title:{en:'8',zh:'8'},dueDate:'2026-09-08'},{id:'9',title:{en:'9',zh:'9'},dueDate:'2026-09-09'}]}];
 const result=filterCardsByList(cards,'today',now)[0].tasks.map(t=>t.id).join(',');assert(result===(expected.endsWith('08')?'8':'8,9'),'Tasks local today');
 const keys=['2026-03-08','2026-11-01','2026-04-05','2026-10-04'];
 for(let i=0;i<keys.length;i++){const dst=dstHoursForDay(keys[i]);assert(dst.hours===hours[i],keys[i]+' DST');assert(buildHourLabels(keys[i]).reduce((n,r)=>n+r.durationHours,0)===hours[i],'row extent');}
 assert(hourToRow(1,30,{kind:'fall-back',atRow:1,deltaHours:-1,transitionHour:1})===1.5,'earlier fold');assert(hourToRow(2,30,{kind:'spring-forward',atRow:1,deltaHours:0.5,transitionHour:2.5})===2,'half hour mapping');
 const container=document.createElement('main');document.body.append(container);const root=createRoot(container);root.render(React.createElement(CalendarModule,{lang:'en'}));await delay();
 assert(container.querySelector('.cal-day.today')?.dataset.date===expected,'Calendar rendered local today');
 instant= new NativeDate(2026,11,31,23,59,59).getTime();window.dispatchEvent(new Event('focus'));await delay();container.querySelector('[data-testid="cal-today"]').click();await delay();assert(container.querySelector('.cal-day.today')?.dataset.date==='2026-12-31','Calendar December');
 instant=new NativeDate(2027,0,1,8).getTime();window.dispatchEvent(new Event('pageshow'));await delay();assert(container.querySelector('[data-date="2026-12-15"]'),'Calendar preserved selected month');container.querySelector('[data-testid="cal-today"]').click();await delay();assert(container.querySelector('.cal-day.today')?.dataset.date==='2027-01-01','Calendar today after resume');
 root.unmount();await fetch('/result',{method:'POST',body:JSON.stringify({status:'PASS',zone,expected,features:['Habits','TT','Statistics','Metrics','Tasks','Calendar actual UI'],dstHours:hours,calendarResume:'PASS'})});
})().catch(e=>fetch('/result',{method:'POST',body:'FAIL '+e.stack}));
`;
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:root,loader:'tsx'},plugins:[{name:'pin-storage-reviewed-baseline',setup(b){b.onLoad({filter:/plugin-web-storage\/.*\.tsx?$/},args=>({contents:execFileSync('git',['show','a81b1f9:'+relative(root,args.path)],{cwd:root,encoding:'utf8'}),loader:args.path.endsWith('.tsx')?'tsx':'ts',resolveDir:dirname(args.path)}));}}],bundle:true,format:'iife',platform:'browser',write:false,define:{'import.meta.env':'{}'},loader:{'.css':'empty','.svg':'dataurl'}});
 let receive;
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('Browser verification timed out after 20s')),20000);});
 server=createServer((req,res)=>{
  if(req.url==='/result'){let text='';req.on('data',chunk=>text+=chunk);req.on('end',()=>{res.end('ok');receive(text);});}
  else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><body>Test<script>'+bundle.outputFiles[0].text+'</script>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 browser=spawn(process.env.CHROME_BINARY || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
 browser.on('error',error=>receive('FAIL '+error.message));
 const result=await finished;
 console.log(result);if(typeof result!=='string'||result.startsWith('FAIL'))throw Error(String(result));

} finally {
 clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();
 await new Promise(resolve=>setTimeout(resolve,500));
 if(browser && browser.exitCode===null) browser.kill('SIGKILL');
 rmSync(directory,{recursive:true,force:true});
}

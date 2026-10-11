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
import {TasksModule} from './packages/xai-web-tasks/src/TasksModule.tsx';
import {SEED_TASK_COLS} from './packages/xai-web-tasks/src/internal/seed/tasksMock.ts';
import {useLocalDayClock} from './packages/plugin-web-tokens/src/useLocalDayClock.ts';
const NativeDate=Date;let instant=new NativeDate(2026,11,31,23,59,59).getTime();
class ClockDate extends NativeDate {constructor(...args){super(...(args.length?args:[instant]));} static now(){return instant;}}
window.Date=ClockDate;
const delay=()=>new Promise(r=>setTimeout(r,100));const assert=(c,m)=>{if(!c)throw Error(m);};
function Watch(){const clock=useLocalDayClock();return React.createElement('output',{'data-clock':true},clock.dayKey);}
(async()=>{
 const cols=SEED_TASK_COLS.map(c=>({...c,tasks:[],completed:[],count:0}));
 cols[2].tasks=[{id:'known',title:{en:'Civil boundary probe',zh:'Civil boundary probe'},dueDate:'2027-01-01',source:{type:'board-card',boardId:'b',listId:'l',cardId:'c'}},{id:'legacy',title:{en:'Legacy identity probe',zh:'Legacy identity probe'},date:'1/1',dateZh:'1 月 1 日'}];
 localStorage.setItem('xai_task_cols',JSON.stringify(cols));
 const container=document.createElement('main');document.body.append(container);let root=createRoot(container);
 const mount=()=>root.render(React.createElement(React.Fragment,null,React.createElement(Watch),React.createElement(TasksModule,{lang:'en'})));
 const sidebarClick=text=>{const e=[...container.querySelectorAll('.module-sidebar [role="button"]')].find(b=>b.textContent.includes(text));assert(e,'sidebar '+text);e.click();};
 mount();await delay();sidebarClick('Tomorrow');await delay();
 assert(container.textContent.includes('Civil boundary probe'),'before midnight Tomorrow');assert(!container.textContent.includes('Legacy identity probe'),'legacy excluded from exact date');
 instant=new NativeDate(2027,0,1,8).getTime();window.dispatchEvent(new Event('focus'));await delay();
 assert(container.querySelector('[data-clock]').textContent==='2027-01-01','focus clock');assert(!container.textContent.includes('Civil boundary probe'),'after midnight no longer Tomorrow');
 sidebarClick('Today');await delay();assert(container.textContent.includes('Civil boundary probe'),'after midnight Today');
 let stored=JSON.parse(localStorage.getItem('xai_task_cols'));assert(stored[0].tasks.some(t=>t.id==='known'&&t.dueDate==='2027-01-01'&&t.source.cardId==='c'),'known regroup and metadata');assert(stored[2].tasks.some(t=>t.id==='legacy'&&t.date==='1/1'&&!t.dueDate),'legacy retained');
 root.unmount();root=createRoot(container);mount();await delay();sidebarClick('Today');await delay();assert(container.textContent.includes('Civil boundary probe'),'remount persisted date');
 instant=new NativeDate(2027,0,4,8).getTime();window.dispatchEvent(new Event('pageshow'));await delay();assert(container.querySelector('[data-clock]').textContent==='2027-01-04','pageshow clock');
 root.unmount();await fetch('/result',{method:'POST',body:JSON.stringify({status:'PASS',zone:Intl.DateTimeFormat().resolvedOptions().timeZone,checks:['Tasks tomorrow to today after focus','date/source/legacy persistence','remount recovery','pageshow resample']})});
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

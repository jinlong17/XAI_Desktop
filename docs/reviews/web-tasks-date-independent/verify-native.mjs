/** Real Chrome, isolated profile/download directory. Synthetic fixtures only. No server auth. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, readdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const output=fileURLToPath(new URL('./',import.meta.url));
const directory=mkdtempSync(join(tmpdir(),'xai-metrics-save-'));
const sourceCommit='2b1759ba6cb5e017d62f3fd38ab4866dad2c06c0';
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};
const downloads=join(directory,'downloads');mkdirSync(downloads);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const source=readFileSync(new URL('./native.tsx',import.meta.url),'utf8');
let server,browser,socket;
const log=[];const record=(name,data)=>{log.push({name,...data});console.log(name,JSON.stringify(data??{}));};
try{
 const bundle=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},bundle:true,plugins:[pinnedPackages],format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),loader:{'.svg':'dataurl'},define:{'import.meta.env':'{}'}});
 const js=bundle.outputFiles.find(f=>f.path.endsWith('.js')).text,css=bundle.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
 server=createServer((req,res)=>{if(req.url==='/?peer=1'){res.end('<!doctype html><title>Visibility peer</title>');return;}res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><main id="app"></main><script type="module">'+js+'</script>');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
 let port;for(let i=0;i<100;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);break;}catch{await delay(100);}}
 assert(port,'Chrome debugging port');
 const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let next=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const clickText=async text=>{await evaluate(`(()=>{const el=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(text)});if(!el)throw Error('button missing');el.click();})()`);await delay(150);};
 const download=async(text,label)=>{const before=new Set(readdirSync(downloads));await clickText(text);let filename;for(let i=0;i<100;i++){filename=readdirSync(downloads).find(f=>!before.has(f)&&f.endsWith('.json'));if(filename)break;await delay(100);}assert(filename,label+' real download');const data=JSON.parse(readFileSync(join(downloads,filename),'utf8'));rmSync(join(downloads,filename));record(label,{filename,manifest:data.manifest});return data;};
 await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
 for(let i=0;i<100;i++){if(await evaluate("!!window.verify"))break;await delay(100);}
 assert(await evaluate("!!window.verify"),'mounted actual Tasks');
 record('baseline',{head:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:1440});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 const target=await(await fetch('http://127.0.0.1:'+port+'/json/new?'+encodeURIComponent('http://127.0.0.1:'+server.address().port+'/?peer=1'),{method:'PUT'})).json();const second=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>second.addEventListener('open',r,{once:true}));let secondId=0;const secondPending=new Map();second.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){secondPending.get(m.id)?.(m);secondPending.delete(m.id)}});const evalB=expression=>new Promise((resolve,reject)=>{const id=++secondId;secondPending.set(id,m=>m.result?.exceptionDetails?reject(Error(JSON.stringify(m))):resolve(m.result?.result?.value));second.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression,returnByValue:true}}))});

 const names=async()=>await evaluate("[...document.querySelectorAll('.tasks-main .task-card .task-title')].map(e=>e.textContent.trim()).sort()");
 const select=async(label)=>{await evaluate(`(()=>{const row=[...document.querySelectorAll('.module-sidebar .sidebar-section:first-child .list-row')].find(e=>e.querySelector('.grow').textContent.trim()===${JSON.stringify(label)});if(!row)throw Error('missing smart '+${JSON.stringify(label)});row.click()})()`);await delay(60);};
 const counts=async()=>await evaluate("Object.fromEntries([...document.querySelectorAll('.module-sidebar .sidebar-section:first-child .list-row')].map(e=>[e.querySelector('.grow').textContent.trim(),Number(e.querySelector('.count').textContent)]))");
 const verifyList=async(label,expected)=>{await select(label);assert.deepEqual(await names(),[...expected].sort(),label+' actual list');assert.equal((await counts())[label],expected.length,label+' sidebar count');const chip=await evaluate(`(()=>{const e=[...document.querySelectorAll('.task-smart-chip')].find(e=>e.dataset.active==='true');return Number(e.querySelector('.count').textContent)})()`);assert.equal(chip,expected.length,label+' chip count');};
 const setup=async(now,dates)=>{await evaluate(`window.verify.setup(${JSON.stringify(now)},${JSON.stringify(dates)})`);await delay(150);};
 const fixture=[['overdue','2026-12-30'],['today','2026-12-31'],['tomorrow','2027-01-01'],['plus6','2027-01-06'],['plus7','2027-01-07'],['plus8','2027-01-08'],['legacy',null]];
 await cdp('Emulation.setTimezoneOverride',{timezoneId:'America/Los_Angeles'});
 await setup('2026-12-31T12:00:00',fixture);
 await verifyList('Today',['overdue','today']);await verifyList('Tomorrow',['tomorrow']);await verifyList('Next 7 Days',['tomorrow','plus6','plus7']);
 const raw=await evaluate('window.verify.rows()');assert.equal(raw.flatMap(c=>c.tasks).find(t=>t.id==='legacy').dueDate,undefined);assert.equal(raw.flatMap(c=>c.tasks).find(t=>t.id==='legacy').date,'1/1');record('year-boundary-selectors-counts',{today:2,tomorrow:1,next7:3,legacyDateNotInferred:true,pass:true});
 for(const [zone,now,dates] of [['America/Los_Angeles','2026-03-07T12:00:00',[['today','2026-03-07'],['tomorrow','2026-03-08'],['plus7','2026-03-14'],['plus8','2026-03-15']]],['America/Los_Angeles','2026-10-31T12:00:00',[['today','2026-10-31'],['tomorrow','2026-11-01'],['plus7','2026-11-07'],['plus8','2026-11-08']]],['Australia/Lord_Howe','2026-04-04T12:00:00',[['today','2026-04-04'],['tomorrow','2026-04-05'],['plus7','2026-04-11'],['plus8','2026-04-12']]]]){
  await cdp('Emulation.setTimezoneOverride',{timezoneId:zone});await setup(now,dates);await verifyList('Today',['today']);await verifyList('Tomorrow',['tomorrow']);await verifyList('Next 7 Days',['tomorrow','plus7']);record('native-DST-civil-window',{zone,now,pass:true});
 }
 await cdp('Emulation.setTimezoneOverride',{timezoneId:'America/Los_Angeles'});await cdp('Page.bringToFront');
 await setup('2026-12-31T23:59:59.500',[['cross-midnight','2027-01-01'],['following','2027-01-02']]);await select('Tomorrow');assert.deepEqual(await names(),['cross-midnight']);
 await delay(1000);assert.deepEqual(await names(),['following']);assert.equal((await counts()).Today,1);assert.equal((await counts()).Tomorrow,1);await verifyList('Today',['cross-midnight']);record('native-midnight-without-reload',{pageMounts:await evaluate('window.verify.mounts'),pass:true});
 await setup('2027-01-01T12:00:00',[['old-today','2027-01-01'],['new-today','2027-01-02'],['next','2027-01-03']]);await select('Tomorrow');assert.deepEqual(await names(),['new-today']);
 await cdp('Target.activateTarget',{targetId:target.id});await delay(100);const hidden=await evaluate('document.visibilityState');assert.equal(hidden,'hidden','actual browser page hidden');
 await evaluate("window.verify.shift('2027-01-02T12:00:00')");assert.deepEqual(await names(),['new-today']);
 await cdp('Page.bringToFront');await delay(150);assert.equal(await evaluate('document.visibilityState'),'visible');assert.deepEqual(await names(),['next']);assert.equal((await counts()).Today,2);assert.equal((await counts()).Tomorrow,1);record('actual-hidden-page-return',{hidden,nowVisible:true,pass:true});
 record('PASS',{checks:6,scope:'real Tasks Module/sidebar/chip/list; year+DST+native midnight+visibility; TASK01 only'});
 second.close();
}finally{writeFileSync(join(output,'native-after.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

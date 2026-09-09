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
const sourceCommit='2b1759b';
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
const source=readFileSync(new URL('./native-stat.ts',import.meta.url),'utf8');
let server,browser,socket;
const log=[];const record=(name,data)=>{log.push({name,...data});console.log(name,JSON.stringify(data??{}));};
try{
 const bundle=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},bundle:true,plugins:[pinnedPackages],format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),loader:{'.svg':'dataurl'},define:{'import.meta.env':'{}'}});
 const js=bundle.outputFiles.find(f=>f.path.endsWith('.js')).text,css=bundle.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
 server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><main id="app"></main><script type="module">'+js+'</script>');});
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
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
 for(let i=0;i<100;i++){if(await evaluate("!!window.probe&&!!document.querySelector('.module-pomo')"))break;await delay(100);}
 assert(await evaluate("!!window.probe&&!!document.querySelector('.module-pomo')"),'mounted actual Settings');
 record('baseline',{head:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:390});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 await evaluate("window.probe.command('start',{mode:'focus',durationMs:1500000})");await evaluate("window.probe.tick(25000);window.probe.command('pause')");await evaluate("window.probe.tick(300000);window.probe.command('resume')");await evaluate("window.probe.tick(35000);window.probe.command('end')");await delay(200);const row=(await evaluate('window.probe.rows()'))[0];assert.equal(row.durationMs,1500000);assert.equal(row.elapsedMs,60000);assert.equal(row.completed,false);const list=await evaluate("[...document.querySelectorAll('.record-row')].map(x=>x.textContent)");record('pomo-list-after-early-end',{persisted:row,list,expectedOneMinuteIncompleteRow:true,pass:list.length===1});
 await evaluate("window.probe.route('stats')");await delay(250);const kpi=await evaluate("document.querySelector('[data-cell-id=focus] .kpi-val').textContent");assert.equal(kpi,'0h 1m');record('actual-statistics-route',{kpi});await cdp('Page.reload');await delay(500);assert.equal(await evaluate("document.querySelector('[data-cell-id=focus] .kpi-val').textContent"),'0h 1m');
 await evaluate('window.probe.fixture()');await delay(200);const raw=await evaluate('window.probe.raw()');const agg=await evaluate('window.probe.aggregate()');assert.equal(agg.kpis.focusMinutesTotal,1.5);assert.equal(agg.focusBuckets.reduce((a,b)=>a+b,0),1.5);assert.equal(agg.hourDistribution.reduce((a,b)=>a+b,0),1.5);assert.equal(agg.unmeasuredFocusSessions,5);const cell=(await evaluate('window.probe.heat()')).find(c=>c.date==='2026-09-09');assert.equal(cell.minutes,1.5);assert.equal(await evaluate("document.querySelector('[data-cell-id=focus] .kpi-val').textContent"),'0h 1.5m');const notice=await evaluate("document.querySelector('[data-testid=stats-unmeasured-focus]').textContent");assert(notice.includes('5 focus records'));record('legacy-short-zero',{minutes:1.5,unknown:5,notice,rawPreserved:raw===await evaluate('window.probe.raw()')});
 for(const range of ['month','all']){await click('[data-testid=stats-range-'+range+']');const a=await evaluate(`window.probe.aggregate('${range}')`);assert.equal(a.kpis.focusMinutesTotal,1.5);assert.equal(a.unmeasuredFocusSessions,5)}
 await evaluate("window.probe.route('stats','zh')");await delay(200);const zh=await evaluate("document.querySelector('[data-testid=stats-unmeasured-focus]').textContent");assert(zh.includes('5 条'));const geometry=await evaluate("(()=>{const e=document.querySelector('[data-testid=stats-unmeasured-focus]'),r=e.getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth,scroll:document.documentElement.scrollWidth}})()");record('390px-zh',{notice:zh,geometry});writeFileSync(join(output,'390px-statistics-zh.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));assert.equal(await evaluate('window.probe.raw()'),raw);
 record('PARTIAL',{statisticsElapsedPass:true,pomoIncompleteListPass:list.length===1});
}finally{writeFileSync(join(output,'20260909-native-stat-before.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

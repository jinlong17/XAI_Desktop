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
const sourceCommit='64caa5a678ce9943a0e7aa03609095153c5131e2';
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
const source=readFileSync(new URL('./native-independent.tsx',import.meta.url),'utf8');
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
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
 for(let i=0;i<100;i++){if(await evaluate("!!window.resume"))break;await delay(100);}
 assert(await evaluate("!!window.resume"),'mounted actual TT');
 record('baseline',{head:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:1440});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 const target=await(await fetch('http://127.0.0.1:'+port+'/json/new?'+encodeURIComponent('http://127.0.0.1:'+server.address().port),{method:'PUT'})).json();const second=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>second.addEventListener('open',r,{once:true}));let secondId=0;const secondPending=new Map();second.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){secondPending.get(m.id)?.(m);secondPending.delete(m.id)}});const evalB=expression=>new Promise((resolve,reject)=>{const id=++secondId;secondPending.set(id,m=>m.result?.exceptionDetails?reject(Error(JSON.stringify(m))):resolve(m.result?.result?.value));second.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression,returnByValue:true}}))});
 for(let i=0;i<100;i++){if(await evalB('!!window.resume'))break;await delay(100)}
 const stamp=await evaluate('window.verify.now');await evaluate('window.resume(window.verify.now)');await delay(200);assert.equal((await evalB('window.cached()'))[0].segments.filter(s=>s.end===null).length,1);await evalB('window.resume(window.verify.now+1000)');await delay(200);const resumed=await evaluate('window.verify.rows()');const opens=resumed[0].segments.filter(s=>s.end===null).length;record('two-tab-replayed-resume',{expectedOpenCount:1,actualOpenCount:opens,pass:opens===1});
 await evaluate('window.end(window.verify.now+2000)');await delay(150);await evalB('window.end(window.verify.now+3000)');await delay(150);const ended=(await evaluate('window.verify.rows()'))[0];const before=await evaluate('window.verify.total(window.verify.now+4000)'),after=await evaluate('window.verify.total(window.verify.now+5000)');record('two-tab-end',{done:ended.done,remainingOpen:ended.segments.filter(s=>s.end===null).length,before,after,expectedGrowth:0,actualGrowth:after-before,pass:before===after});
 await evaluate('window.verify.seed(true)');await delay(200);const originalEntry=(await evaluate('window.verify.rows()'))[0];await evaluate("(()=>{const row=[...document.querySelectorAll('.tt-record-row')].find(x=>x.textContent.includes('source multi'));if(!row)throw Error('row missing');[...row.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')?.includes('Edit')).click()})()");await delay(100);await input('#tt-entry-form input[placeholder]','note only edit');await click('button[form="tt-entry-form"]');const edited=(await evaluate('window.verify.rows()'))[0];record('note-only-source-edit',{before:originalEntry.segments,after:edited.segments,pass:JSON.stringify(originalEntry.segments)===JSON.stringify(edited.segments),durationBefore:originalEntry.segments.reduce((n,s)=>n+s.end-s.start,0),durationAfter:await evaluate('window.verify.total(window.verify.now)')});
 await evaluate("localStorage.setItem('xai_tt_mode','single')");await click('.tt-category-start');await delay(150);await evalB("document.querySelectorAll('.tt-category-start')[1].click()");await delay(150);const active=(await evaluate('window.verify.rows()')).filter(e=>!e.done&&e.segments.at(-1).end===null);record('single-mode-two-tab-start-buttons',{expectedRunning:1,actualRunning:active.length,pass:active.length===1});
 
 await evaluate('window.verify.seed(true)');await delay(150);
 await Promise.all([evaluate("document.querySelectorAll('.tt-category-start')[0].click()"),evalB("document.querySelectorAll('.tt-category-start')[1].click()")]);await delay(250);
 assert.equal((await evaluate('window.verify.rows()')).filter(e=>!e.done&&e.segments.at(-1).end===null).length,1);record('simultaneous-two-tab-single-start',{pass:true});
 await evaluate('window.verify.seed(true)');await delay(150);
 const noLocks=await evaluate(`(async()=>{const before=window.verify.raw();const locks=navigator.locks;Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});const result=await window.resume(window.verify.now);Object.defineProperty(navigator,'locks',{configurable:true,value:locks});return {result,unchanged:before===window.verify.raw()};})()`);
 assert.equal(noLocks.result,false);assert.equal(noLocks.unchanged,true);record('native-lock-unavailable',{...noLocks,pass:true});
 const revision=await evaluate(`(async()=>{const expected=window.verify.rows(),scope=window.commands.capture();const outcomes=await Promise.allSettled([window.commands.commit(r=>r.map(e=>({...e,note:{en:'first',zh:'first'}})),expected,scope),window.commands.commit(r=>r.map(e=>({...e,note:{en:'obsolete',zh:'obsolete'}})),expected,scope)]);return outcomes.map(x=>x.status);})()`);
 assert.deepEqual(revision,['fulfilled','rejected']);record('native-lock-revision',{outcomes:revision,pass:true});
 await evaluate('window.verify.seed(true)');await delay(150);
 await evaluate("(()=>{const row=document.querySelector('.tt-record-row');[...row.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')?.includes('Edit')).click()})()");await delay(100);await input('#tt-entry-form input[placeholder]','unsaved native draft');
 await evaluate(`(()=>{window.savedLocks=navigator.locks;Object.defineProperty(navigator,'locks',{configurable:true,value:undefined});})()`);await click('button[form="tt-entry-form"]');
 assert.equal(await evaluate(`document.querySelector('#tt-entry-form input[placeholder]')?.value`),'unsaved native draft');assert((await evaluate('document.body.innerText')).includes('Web Locks'));record('native-failed-editor-preserves-draft',{pass:true});
 await evaluate(`Object.defineProperty(navigator,'locks',{configurable:true,value:window.savedLocks})`);
 const malformed=await evaluate(`(async()=>{const row=window.verify.rows()[0];row.done=false;row.segments=[{start:1,end:null},{start:2,end:null}];const raw=' '+JSON.stringify([row])+' ';localStorage.setItem(window.commands.physical(),raw);window.dispatchEvent(new StorageEvent('storage'));await Promise.resolve();const ok=await window.end(window.verify.now);return {ok,raw,after:window.verify.raw(),exported:window.recovery.exportSource()};})()`);
 assert.equal(malformed.ok,false);assert.equal(malformed.after,malformed.raw);assert.equal(malformed.exported,malformed.raw);record('native-malformed-byte-preservation-export',{pass:true});
 await delay(100);await clickText('Export original sessions');let originalFile;for(let i=0;i<50;i++){originalFile=readdirSync(downloads).find(f=>f.endsWith('.json'));if(originalFile)break;await delay(100)}assert(originalFile,'actual recovery download');assert.equal(readFileSync(join(downloads,originalFile),'utf8'),malformed.raw);record('native-raw-download',{byteExact:true,pass:true});
 await evaluate('window.verify.seed(true)');await delay(150);
 const owner=await evaluate(`(async()=>{const scope=window.commands.capture(),expected=window.verify.rows(),aKey=window.commands.physical(),before=localStorage.getItem(aKey);let release;let ready;const held=new Promise(r=>ready=r);const lock=navigator.locks.request('xai-tt:'+aKey,async()=>{ready();await new Promise(r=>release=r)});await held;const pending=window.commands.commit([],expected,scope).then(()=>false,()=>true);window.commands.switchB();release();await lock;return {rejected:await pending,aUnchanged:localStorage.getItem(aKey)===before,bEmpty:localStorage.getItem(window.commands.physical())===null};})()`);
 assert.deepEqual(owner,{rejected:true,aUnchanged:true,bEmpty:true});record('native-waiting-A-B-isolation',{...owner,pass:true});
 for(const check of log.filter(row=>'pass' in row))assert.equal(check.pass,true,check.name);record('PASS',{checks:11});second.close();
}finally{writeFileSync(join(output,'native-after.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

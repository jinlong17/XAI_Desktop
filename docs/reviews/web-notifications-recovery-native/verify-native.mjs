/** Real Chrome, isolated profile/download directory. Synthetic fixtures only. No server auth. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { existsSync, mkdtempSync, mkdirSync, rmSync, readFileSync, readdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const output=fileURLToPath(new URL('./',import.meta.url));
const directory=mkdtempSync(join(tmpdir(),'xai-notifications-native-'));
const sourceCommit=process.argv[2];const mode=process.argv[3]??'controls';if(!['controls','route','signout','unload','clean','hidden-export'].includes(mode))throw Error('mode');if(!sourceCommit)throw Error('Fixed revision required');
const evidenceTag=sourceCommit+(process.argv[4]?'-'+process.argv[4]:'');
if(existsSync(join(output,`native-${evidenceTag}-${mode}.log`)))throw Error('Evidence exists; use a distinct fixed revision');
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));symlinkSync(join(root,'apps/web/node_modules'),join(snapshot,'apps/web/node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};
const downloads=join(directory,'downloads');mkdirSync(downloads);const delay=ms=>new Promise(r=>setTimeout(r,ms));let server,browser,socket;const records=[];const runtimeErrors=[];const record=(name,value)=>{records.push({name,...value});console.log(name,JSON.stringify(value));};
try{
const built=await build({stdin:{contents:readFileSync(join(output,'native.tsx'),'utf8').replaceAll('__NATIVE_MODE__',mode).replaceAll('lang="en"',(mode.endsWith('-zh')||mode==='visual-zh')?'lang="zh"':'lang="en"'),resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],nodePaths:[join(root,'apps/web/node_modules')],loader:{'.png':'dataurl','.svg':'dataurl','.woff2':'dataurl','.woff':'dataurl'},bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
const js=built.outputFiles.find(f=>f.path.endsWith('.js')).text,css=built.outputFiles.find(f=>f.path.endsWith('.css')).text;
server=createServer((req,res)=>{if(req.url==='/external'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Independent same-origin writer</title>');return}res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
let port;const portDiagnostics=[];for(let i=0;i<300;i++){try{const raw=readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0],candidate=Number(raw);if(candidate>0){port=candidate;break}if(portDiagnostics.length<5)portDiagnostics.push(raw)}catch(error){if(portDiagnostics.length<5)portDiagnostics.push(error.code??String(error))}await delay(50)}assert(port,'Chrome DevToolsActivePort never became positive: '+JSON.stringify(portDiagnostics));
const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(JSON.stringify(m.params));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')runtimeErrors.push(m.params.args.map(a=>a.value??a.description??'').join(' '));if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await cdp('Runtime.enable');await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});for(let i=0;i<100;i++){if(await ev("!!document.querySelector('.notif-pane')"))break;await delay(50)}


await cdp('Page.bringToFront');await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product});
try{
 assert.equal(runtimeErrors.length,0,'Runtime mount error '+runtimeErrors.slice(0,3).join(' | '));
 const actualClick=async(selector,index=0)=>{const r=await ev(`(()=>{const e=document.querySelectorAll(${JSON.stringify(selector)})[${index}];if(!e)throw Error('Missing actual control');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})()`);assert(r.hit,'Covered actual control '+selector);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x,y:r.y,button:'left',clickCount:1});await delay(200)};
 const key=async(key,code='',n=0,text='')=>{await cdp('Input.dispatchKeyEvent',{type:text?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:n,...(text?{text,unmodifiedText:text}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n});await delay(30)};
 const selected=()=>ev('({sound:document.querySelector(".notif-pane select")?.value,toggles:[...document.querySelectorAll(".notif-pane [role=switch]")].map(e=>e.getAttribute("aria-checked")),times:[...document.querySelectorAll(".notif-pane input[type=time]")].map(e=>e.value)})');
 const change=async i=>{if(i===1){await ev('document.querySelector(".notif-pane select").focus()');await key('c','KeyC',67,'c')}else if(i>=6){await ev(`document.querySelectorAll('.notif-pane input[type=time]')[${i-6}].focus()`);await key(i===6?'ArrowUp':'ArrowDown','',i===6?38:40);await key('ArrowRight','',39);for(let n=0;n<(i===6?15:30);n++)await key('ArrowUp','',38);await key('Tab','Tab',9)}else await actualClick('.notif-pane [role=switch]',{0:0,2:1,3:2,4:3,5:4}[i]);await delay(180)};
 const original=['true','subtle','true','true','false','true','22:00','07:00'];
 assert.deepEqual(await ev('verify.read()'),original);assert.equal((await ev('verify.writes()')).length,0);
 await ev('window.nativeInputs=[];document.addEventListener("input",e=>window.nativeInputs.push({value:e.target.value,trusted:e.isTrusted,type:e.target.type,label:e.target.getAttribute("aria-label")}),true)');
 if(mode==='clean'||mode==='controls'){
  if(mode==='controls')await ev('verify.deny()');
  const failures=[];
  for(const i of [0,1,2,3,4,6,7,5]){await change(i);const state=await selected();record('field-'+i,{state,raw:await ev('verify.read()')});try{if(i===1)assert.equal(state.sound,'chime');else if(i>=6){const events=await ev('window.nativeInputs');const last=events.filter(e=>e.label===(i===6?'Quiet hours start':'Quiet hours end')).at(-1);assert(last?.trusted,'No trusted time edit');assert.notEqual(last.value,original[i],'Time edit did not change source');assert.equal(state.times[i-6],last.value,'Latest trusted time intent lost');if(mode==='clean')assert.equal(state.times[i-6],i===6?'23:15':'06:30');}else assert.equal(state.toggles[{0:0,2:1,3:2,4:3,5:4}[i]],i===4?'true':'false')}catch(e){failures.push({i,error:String(e)})}}
  record('trusted-inputs',{events:await ev('window.nativeInputs')});record('field-failures',{failures});assert.equal(failures.length,0,'Latest native values lost');
  if(mode==='clean'){assert.deepEqual(await ev('verify.read()'),['false','chime','false','false','true','false','23:15','06:30']);const previous=await ev('verify.instance');await cdp('Page.reload');for(let i=0;i<100;i++){if(await ev('window.verify?.instance && verify.instance !== '+JSON.stringify(previous)))break;await delay(50)}assert.notEqual(await ev('verify.instance'),previous);assert.deepEqual(await ev('verify.read()'),['false','chime','false','false','true','false','23:15','06:30']);}
 }else if(mode==='hidden-export'){
  await ev('verify.deny([6,7])');await change(6);await change(7);const intents=await ev('window.nativeInputs');const start=intents.filter(e=>e.label==='Quiet hours start').at(-1).value,end=intents.filter(e=>e.label==='Quiet hours end').at(-1).value;
  await change(5);assert.deepEqual((await selected()).times,[]);assert.equal((await ev('verify.read()'))[5],'false');await ev('verify.signout()');await delay(200);assert.equal(await ev('verify.signoutResult'),'pending','Hidden failed times did not hold signout');
  await ev('(()=>{const b=[...document.querySelectorAll("[role=dialog] button")].find(e=>e.textContent.trim()==="Stay");if(!b)throw Error("Missing Stay");b.dataset.stay="yes"})()');await actualClick('[data-stay=yes]');
  await ev('verify.denyAll()');const before=await ev('({reads:verify.reads().length,writes:verify.writes().length})');
  await ev('(()=>{const b=[...document.querySelectorAll(".notif-pane button")].find(e=>e.textContent.trim()==="Export Notifications draft");if(!b)throw Error("Missing export");b.dataset.export="yes"})()');await actualClick('[data-export=yes]');
  const file=join(downloads,'notifications-draft.json');for(let i=0;i<100&&!existsSync(file);i++)await delay(50);assert(existsSync(file),'Actual download missing');const payload=JSON.parse(readFileSync(file,'utf8'));assert.deepEqual(payload,{version:1,kind:'notifications-draft',values:{device:{quiet_start:start,quiet_end:end}}});assert.deepEqual(await ev('({reads:verify.reads().length,writes:verify.writes().length})'),before,'Export accessed storage');record('hidden-disk-export',{payload,storageUnchanged:true});
  await ev('verify.restore()');await change(5);assert.deepEqual((await selected()).times,[start,end]);
 }else if(mode==='route'||mode==='signout'||mode==='unload'){
  await ev('verify.deny([0])');await change(0);
  if(mode==='route')await ev('verify.router.navigate("/app/settings/date_time")');
  if(mode==='signout')await ev('verify.signout()');await delay(200);
  const state=await ev('({path:location.pathname,dialog:!!document.querySelector("[role=dialog]"),signout:verify.signoutResult,warning:(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()})');record('departure',state);
  if(mode==='unload')assert(state.warning);else{assert.equal(state.path,'/app/settings/notifications');assert(state.dialog);if(mode==='signout')assert.equal(state.signout,'pending');}
 }else throw Error('Notifications mode not implemented');
 assert.equal(runtimeErrors.length,0);record('native',{pass:true,mode,runtimeErrors:0});
}catch(error){record('native',{pass:false,mode,error:String(error),runtimeErrors});process.exitCode=1;}
}finally{writeFileSync(join(output,`native-${evidenceTag}-${mode}.log`),records.map(r=>JSON.stringify(r)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

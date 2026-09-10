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
const directory=mkdtempSync(join(tmpdir(),'xai-date-time-native-'));
const sourceCommit=process.argv[2];const mode=process.argv[3]??'controls';if(!['controls','route','rail','signout','unload','clean'].includes(mode))throw Error('mode');if(!sourceCommit)throw Error('Fixed revision required');
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
server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
let port;const portDiagnostics=[];for(let i=0;i<300;i++){try{const raw=readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0],candidate=Number(raw);if(candidate>0){port=candidate;break}if(portDiagnostics.length<5)portDiagnostics.push(raw)}catch(error){if(portDiagnostics.length<5)portDiagnostics.push(error.code??String(error))}await delay(50)}assert(port,'Chrome DevToolsActivePort never became positive: '+JSON.stringify(portDiagnostics));
const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(JSON.stringify(m.params));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')runtimeErrors.push(m.params.args.map(a=>a.value??a.description??'').join(' '));if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await cdp('Runtime.enable');await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});for(let i=0;i<100;i++){if(await ev("!!document.querySelector('.dt-pane')"))break;await delay(50)}


await cdp('Page.bringToFront');await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product});
try{
 assert.equal(runtimeErrors.length,0,'Runtime mount error '+runtimeErrors.slice(0,3).join(' | '));
 const actualClick=async(selector,index=0)=>{const r=await ev(`(()=>{const e=document.querySelectorAll(${JSON.stringify(selector)})[${index}];if(!e)throw Error('Missing actual control');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})()`);assert(r.hit,'Covered actual control '+selector);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x,y:r.y,button:'left',clickCount:1});await delay(200)};
 const change=async index=>{if(index===0){await ev('(()=>{window.selectTrace=[];for(const name of ["keydown","keyup","input","change"])document.addEventListener(name,e=>window.selectTrace.push({name,key:e.key,value:e.target.value,trusted:e.isTrusted,prevented:e.defaultPrevented}),true)})()');await ev('document.querySelector(".dt-pane select").focus()');for(const [key,code,n,text] of [['s','KeyS',83,'s']]){await cdp('Input.dispatchKeyEvent',{type:text?'keyDown':'rawKeyDown',key,code,windowsVirtualKeyCode:n,nativeVirtualKeyCode:key==='s'?1:36,...(text?{text,unmodifiedText:text}:{})});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:n})}await delay(200);record('select-input',await ev('({events:window.selectTrace,value:document.querySelector(".dt-pane select").value,raw:verify.read()})'))}else await actualClick('.dt-pane [role=switch]',index-1)};

 const selected=()=>ev('({week:document.querySelector(".dt-pane select")?.value,toggles:[...document.querySelectorAll(".dt-pane [role=switch]")].map(e=>e.getAttribute("aria-checked"))})');
 assert.deepEqual(await ev('verify.read()'),['monday','true','true','true','true']);assert.deepEqual(await selected(),{week:'monday',toggles:['true','true','true','true']});assert.equal((await ev('verify.writes()')).length,0,'Mount wrote defaults');
 if(mode==='controls'){
  await ev('verify.deny()');let failures=0;
  for(let i=0;i<5;i++){await change(i);const state=await selected();const raw=await ev('verify.read()');let error=null;try{assert.deepEqual(raw,['monday','true','true','true','true']);assert.equal(i===0?state.week:state.toggles[i-1],i===0?'sunday':'false')}catch(e){error=String(e);failures++}record('field-'+i,{pass:!error,state,raw,error});}
  assert.equal(failures,0,'Native controls lost latest draft');
 }else if(mode==='clean'){
  await change(0);assert.equal((await selected()).week,'sunday');assert.equal((await ev('verify.read()'))[0],'sunday');for(let i=1;i<5;i++)await change(i);assert.deepEqual(await selected(),{week:'sunday',toggles:['false','false','false','false']});assert.deepEqual(await ev('verify.read()'),['sunday','false','false','false','false']);const previous=await ev('verify.instance');await cdp('Page.reload');for(let i=0;i<100;i++){if(await ev('!!document.querySelector(".dt-pane select") && window.verify?.instance !== '+JSON.stringify(previous)))break;await delay(50)}assert.notEqual(await ev('verify.instance'),previous,'Reload never reached a new document');assert.equal((await selected()).week,'sunday');assert.deepEqual(await ev('verify.read()'),['sunday','false','false','false','false']);assert.deepEqual(await selected(),{week:'sunday',toggles:['false','false','false','false']});assert.equal((await ev('verify.writes()')).length,0,'Reload seeded source');await ev('verify.signout()');await delay(100);assert.equal(await ev('verify.signoutResult'),true);record('saved-reload',{pass:true});
 }else{
  await ev('verify.deny([1])');await change(1);record('failed-choice-observation',{state:await selected(),raw:await ev('verify.read()')});
  if(mode==='route')await ev('verify.router.navigate("/app/settings/notifications")');
  if(mode==='rail')await actualClick('.app-rail [aria-label="Tasks"]');
  if(mode==='signout')await ev('verify.signout()');
  await delay(180);
  if(mode==='unload'){const warning=await ev('(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()');record('unload-observation',{warning});assert(warning)}
  else {const state=await ev('({path:location.pathname,dialog:!!document.querySelector("[role=dialog]"),signout:verify.signoutResult})');record(mode+'-observation',state);assert.equal(state.path,'/app/settings/date_time');assert(state.dialog);if(mode==='signout')assert.equal(state.signout,'pending')}
 }
 assert.equal(runtimeErrors.length,0,'Runtime interaction error '+runtimeErrors.slice(0,3).join(' | '));record('native',{pass:true,mode,runtimeErrors:0});
}catch(error){record('native',{pass:false,mode,error:String(error),runtimeErrors});process.exitCode=1;}
}finally{writeFileSync(join(output,`native-${evidenceTag}-${mode}.log`),records.map(r=>JSON.stringify(r)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

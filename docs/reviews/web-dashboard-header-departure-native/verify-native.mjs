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
const directory=mkdtempSync(join(tmpdir(),'xai-metrics-save-'));
const sourceCommit=process.argv[2];const mode=process.argv[3]??'route';if(!['route','rail','signout','widget','unload','pointer-entry'].includes(mode))throw Error('mode');if(!sourceCommit)throw Error('Fixed revision required');
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
const built=await build({stdin:{contents:readFileSync(join(output,'native.tsx'),'utf8'),resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],nodePaths:[join(root,'apps/web/node_modules')],loader:{'.png':'dataurl','.svg':'dataurl','.woff2':'dataurl','.woff':'dataurl'},bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
const js=built.outputFiles.find(f=>f.path.endsWith('.js')).text,css=built.outputFiles.find(f=>f.path.endsWith('.css')).text;
server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
let port;for(let i=0;i<300;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);break}catch{await delay(50)}}assert(port);
const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(JSON.stringify(m.params));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')runtimeErrors.push(m.params.args.map(a=>a.value??a.description??'').join(' '));if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await cdp('Runtime.enable');await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});for(let i=0;i<100;i++){if(await ev("!!document.querySelector('.dash-note__display')"))break;await delay(50)}

const click=async selector=>{await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(180)};const text=async label=>{await ev(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!e)throw Error('missing '+${JSON.stringify(label)});e.click()})()`);await delay(180)};const input=async value=>{await ev(`(()=>{const e=document.querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await delay(180)};const bytes=()=>ev('localStorage.getItem(verify.key)');
record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product});
try{
 assert.equal(runtimeErrors.length,0,'Runtime mount error '+runtimeErrors.slice(0,3).join(' | '));
 const actualClick=async selector=>{const r=await ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}})()`);assert(r.hit,'Covered actual control '+selector);await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x,y:r.y,button:'left',clickCount:1});await delay(180)};
 await ev('verify.deny()');
 if(mode==='pointer-entry'){
 await ev(`(()=>{window.pointerEvidence=[];for(const name of ['pointerdown','pointerup','gotpointercapture','lostpointercapture','click'])document.addEventListener(name,e=>window.pointerEvidence.push({name,target:e.target.className,pointerId:e.pointerId}),true)})()`);
 await actualClick('.dash-note__display');const observation=await ev('({editor:!!document.querySelector(".dash-note input"),events:window.pointerEvidence,note:verify.readNote(),offset:localStorage.getItem("xai_pref_dashboard_header_note_x")})');record('pointer-entry-observation',observation);const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(join(output,`header-${evidenceTag}-pointer-entry.png`),Buffer.from(shot.data,'base64'));assert(observation.editor,'Actual no-movement pointer click did not open Header editor');
 }else{
 await ev('(()=>{window.keyboardEvidence=[];for(const name of ["keydown","keyup","keypress","click"])document.addEventListener(name,e=>window.keyboardEvidence.push({name,key:e.key,target:e.target.className}),true);document.querySelector(".dash-note__display").focus()})()');await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r',unmodifiedText:'\r'});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await delay(180);
 }
 if(mode!=='pointer-entry')record('keyboard-entry-observation',await ev('({editor:!!document.querySelector(".dash-note input"),active:document.activeElement?.className,events:window.keyboardEvidence,text:document.querySelector(".dash-header")?.textContent})'));
 assert(await ev('!!document.querySelector(".dash-note input")'),'Keyboard activation did not open Header editor');
 await ev('document.querySelector(".dash-note input").select()');await cdp('Input.insertText',{text:'Latest native unsaved note'});await actualClick('[aria-label="Save dashboard note"]');
 assert.equal(await ev('verify.readNote()'),'Original note');assert.equal(await ev('document.querySelector(".dash-note input").value'),'Latest native unsaved note');
 if(mode==='pointer-entry'){assert.equal(await ev('location.pathname'),'/app/dashboard');}
 else if(mode==='unload'){const warning=await ev('(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()');record('unload-observation',{warning});assert(warning);}
 else if(mode==='signout'){await ev('verify.signout()');await delay(180);const observation=await ev('({outcome:verify.signoutResult,dialog:!!document.querySelector("[role=dialog]")})');record('signout-observation',observation);assert.equal(observation.outcome,'pending');assert(observation.dialog);}
 else{
 if(mode==='route')await ev('verify.router.navigate("/app/tasks")');
 if(mode==='rail')await actualClick('.app-rail [aria-label="Tasks"]');
 if(mode==='widget')await actualClick('.mc-jump');
 await delay(180);const observation=await ev('({path:location.pathname,dialog:!!document.querySelector("[role=dialog]"),note:verify.readNote()})');record(mode+'-observation',observation);assert.equal(observation.path,'/app/dashboard');assert(observation.dialog);
 }
 assert.equal(runtimeErrors.length,0,'Runtime interaction error '+runtimeErrors.slice(0,3).join(' | '));record('departure',{pass:true,mode,runtimeErrors:0});
}catch(error){record('departure',{pass:false,error:String(error)});process.exitCode=1;}
}finally{writeFileSync(join(output,`native-${evidenceTag}-${mode}.log`),records.map(r=>JSON.stringify(r)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

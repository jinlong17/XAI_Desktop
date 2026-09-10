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
const mode=process.argv[3]??'baseline';if(!['baseline','journey','intent','focus'].includes(mode))throw Error('Invalid mode');const evidenceSuffix=mode==='baseline'?'':'-'+mode;
const sourceCommit=process.argv[2];if(!sourceCommit)throw Error('Fixed revision required');
if(existsSync(join(output,`native-${sourceCommit}${evidenceSuffix}.log`)))throw Error('Evidence exists; use a distinct fixed revision');
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
symlinkSync(join(root,'apps/web/node_modules'),join(snapshot,'apps/web/node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};
const downloads=join(directory,'downloads');mkdirSync(downloads);const delay=ms=>new Promise(r=>setTimeout(r,ms));let server,browser,socket;const records=[];const record=(name,value)=>{records.push({name,...value});console.log(name,JSON.stringify(value));};
try{
const built=await build({stdin:{contents:readFileSync(join(output,'native.tsx'),'utf8'),resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],nodePaths:[join(root,'apps/web/node_modules')],bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
const js=built.outputFiles.find(f=>f.path.endsWith('.js')).text,css=built.outputFiles.find(f=>f.path.endsWith('.css')).text;
server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
let port;for(let i=0;i<300;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);break}catch{await delay(50)}}assert(port);
const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});for(let i=0;i<100;i++){if(await ev("document.querySelectorAll('.sl-select').length===12"))break;await delay(50)}

const click=async selector=>{await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(180)};const text=async label=>{await ev(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!e)throw Error('missing '+${JSON.stringify(label)});e.click()})()`);await delay(180)};const input=async value=>{await ev(`(()=>{const e=document.querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await delay(180)};const bytes=()=>ev('localStorage.getItem(verify.key)');
record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product});
try{
 const choose=async(index,value)=>{await ev(`(()=>{const e=document.querySelectorAll('.sl-select')[${index}];Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('change',{bubbles:true}))})()`);await delay(150)};
 await ev('verify.deny()');await choose(0,'hide');await choose(1,'if-not-empty');
 assert.equal(await ev('localStorage.getItem(verify.key)'),JSON.stringify({extension:'future-value'}));
 assert(await ev('!!document.querySelector("[role=alert]")'),'Actual unsaved feedback missing');
 const sidebar=async label=>{await ev(`(()=>{const e=[...document.querySelectorAll('.settings-sidebar [role=button]')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!e)throw Error('missing actual sidebar '+${JSON.stringify(label)});e.focus();e.click()})()`);await delay(180)};
 await sidebar('Notifications');
 const pane=await ev('document.querySelector(".settings-detail").dataset.pane');
 if(pane!=='smart_lists'){
  await sidebar('Smart Lists');const restored=await ev('document.querySelectorAll(".sl-select")[0].value');
  throw Error('Actual host sidebar unmounted dirty pane without a guard; return selection='+restored);
 }
 assert(await ev('!!document.querySelector("dialog[open], [role=dialog], [role=alertdialog]")'),'Blocked departure dialog missing');
 if(mode==='journey'){
  await text('Export current draft');
  let filename;for(let i=0;i<60;i++){filename=readdirSync(downloads).find(f=>f.endsWith('.json'));if(filename)break;await delay(50)}
  assert.equal(filename,'smart-lists-draft.json');assert.deepEqual(JSON.parse(readFileSync(join(downloads,filename),'utf8')),{version:1,kind:'smart-lists-draft',values:{extension:'future-value',all:'hide',today:'if-not-empty'}});
  assert.equal(await ev('location.pathname'),'/app/settings/smart_lists');
  assert(await ev('!!document.querySelector("[role=dialog]")'),'Export closed the decision');
  await text('Stay');assert(!await ev('!!document.querySelector("[role=dialog]")'),'Stay did not close decision');
  assert.equal(await ev('document.querySelectorAll(".sl-select")[0].value'),'hide');
  await sidebar('Notifications');
  await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await delay(180);
  assert(!await ev('!!document.querySelector("[role=dialog]")'),'Actual Escape key did not choose Stay');
  await sidebar('Notifications');await text('Discard local changes and leave');
  assert.equal(await ev('location.pathname'),'/app/settings/notifications');
  assert.equal(await bytes(),JSON.stringify({extension:'future-value'}),'Discard wrote draft/defaults');
  record('real-host-journey',{pass:true,scope:'Actual dialog disk export, Stay, keyboard Escape and explicit discard through composed data router'});
 }
 if(mode==='intent'){
  await sidebar('Appearance');await text('Discard local changes and leave');
  assert.equal(await ev('location.pathname'),'/app/settings/notifications','Repeated departure replaced original Notifications intent');
  assert.equal(await bytes(),JSON.stringify({extension:'future-value'}));
  record('original-navigation-intent',{pass:true});
 }
 if(mode==='focus'){
  assert(await ev('document.querySelector("[role=dialog]").contains(document.activeElement)'),'Dialog did not receive focus');
  await text('Stay');
  assert(await ev('document.activeElement?.textContent.trim()==="Notifications"'),'Stay did not return focus to departure trigger');
  record('dialog-focus',{pass:true});
 }
 record('actual-host-departure',{pass:true,scope:'Actual composedSettingsRegistration with data router and WebShellProvider, real sidebar; initial departure blocked. Full Stay/Export/Discard flows require their separate final contract checks'});
}catch(error){record('actual-host-departure',{pass:false,error:String(error)});process.exitCode=1;}
}finally{writeFileSync(join(output,`native-${sourceCommit}${evidenceSuffix}.log`),records.map(r=>JSON.stringify(r)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

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
const mode=process.argv[3]??'device-controls';if(!['device-controls','export-all','export-denied','export-device-after-owner','partial-export','host-departure','pending-export','host-visual','host-visual-zh'].includes(mode))throw Error('Unknown mode');
const sourceCommit=process.argv[2];const visualZh=mode==='host-visual-zh';const artifactTag=sourceCommit+(visualZh?'-zh':'');if(!sourceCommit)throw Error('Fixed revision required');
if(existsSync(join(output,`native-${sourceCommit}-${mode}.log`)))throw Error('Evidence exists; use a distinct fixed revision');
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
if(['host-departure','host-visual','host-visual-zh'].includes(mode))symlinkSync(join(root,'apps/web/node_modules'),join(snapshot,'apps/web/node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};
const downloads=join(directory,'downloads');mkdirSync(downloads);const delay=ms=>new Promise(r=>setTimeout(r,ms));let server,browser,socket;const records=[];const runtimeErrors=[];const record=(name,value)=>{records.push({name,...value});console.log(name,JSON.stringify(value));};
try{
const built=await build({stdin:{contents:readFileSync(join(output,['host-departure','host-visual','host-visual-zh'].includes(mode)?'native-host.tsx':'native.tsx'),'utf8').replace('lang="en"',visualZh?'lang="zh"':'lang="en"'),resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],nodePaths:[join(root,'apps/web/node_modules')],bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
const js=built.outputFiles.find(f=>f.path.endsWith('.js')).text,css=built.outputFiles.find(f=>f.path.endsWith('.css')).text;
server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
let port;for(let i=0;i<300;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);break}catch{await delay(50)}}assert(port);
const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(JSON.stringify(m.params));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')runtimeErrors.push(m.params.args.map(a=>a.value??a.description??'').join(' '));if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await cdp('Runtime.enable');await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});for(let i=0;i<100;i++){if(await ev("document.querySelectorAll('[role=switch]').length===2"))break;await delay(50)}

const click=async selector=>{await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(180)};const text=async label=>{await ev(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!e)throw Error('missing '+${JSON.stringify(label)});e.click()})()`);await delay(180)};const input=async value=>{await ev(`(()=>{const e=document.querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await delay(180)};const bytes=()=>ev('localStorage.getItem(verify.key)');
record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product});
try{
 assert.equal(runtimeErrors.length,0,'Runtime errors during mount: '+runtimeErrors.slice(0,3).join(' | '));
 if(mode==='host-visual'||mode==='host-visual-zh'){
 await ev('verify.denyThree()');await ev(`(()=>{const e=document.querySelector('select');Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(e,'edit');e.dispatchEvent(new Event('change',{bubbles:true}));document.querySelectorAll('[role=switch]').forEach(e=>e.click())})()`);await delay(200);
 for(const width of [375,414,768,1024,1440]){
 await cdp('Emulation.setDeviceMetricsOverride',{width,height:812,deviceScaleFactor:1,mobile:false});await delay(180);
 const geometry=await ev(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};return {viewport:innerWidth,scroll:document.documentElement.scrollWidth,recovery:rect(document.querySelector('.collab-recovery')),buttons:[...document.querySelectorAll('.collab-recovery button')].map(rect)}})()`);
 record('visual-'+width,geometry);const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(join(output,`collaborate-${artifactTag}-${width}.png`),Buffer.from(shot.data,'base64'));
 assert(geometry.scroll<=width,'Horizontal document overflow');assert(geometry.recovery.y>=0&&geometry.recovery.bottom<=812,'Recovery not visible in first viewport');for(const b of geometry.buttons){assert(b.width>=44&&b.height>=44,'Undersized recovery target '+b.text);assert(b.x>=0&&b.right<=width,'Recovery target horizontal clipping '+b.text)}
 }await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:false});await delay(180);await ev(`(()=>{const e=[...document.querySelectorAll('.settings-sidebar [role=button]')].find(e=>e.textContent.trim()===${JSON.stringify(visualZh?'通知':'Notifications')});e.focus();e.click()})()`);await delay(180);const dialogGeometry=await ev(`(()=>{const e=document.querySelector('[role=dialog]');const r=e.getBoundingClientRect();return {text:e.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom,focus:e.contains(document.activeElement),buttons:[...e.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return {text:b.textContent,width:q.width,height:q.height}})}})()`);record('dialog-375',dialogGeometry);const dialogShot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(join(output,`collaborate-${artifactTag}-375-dialog.png`),Buffer.from(dialogShot.data,'base64'));assert(dialogGeometry.x>=0&&dialogGeometry.right<=375&&dialogGeometry.y>=0&&dialogGeometry.bottom<=812);assert(dialogGeometry.focus,'Focus not in actual dialog');assert(dialogGeometry.text.includes(visualZh?'协作':'Collaborate'));for(const b of dialogGeometry.buttons)assert(b.width>=44&&b.height>=44,'Small dialog target '+b.text);record('full-css-recovery',{pass:true});
 }else if(mode==='device-controls'){
 assert.deepEqual(await ev('[...document.querySelectorAll("[role=switch]")].map(e=>e.getAttribute("aria-checked"))'),['true','true']);
 assert.deepEqual(await ev('verify.keys.map(k=>localStorage.getItem(k))'),[null,null],'Mount seeded device preferences');
 await ev('verify.deny()');
 await ev('document.querySelectorAll("[role=switch]")[0].click()');await delay(180);
 await ev('document.querySelectorAll("[role=switch]")[1].click()');await delay(180);
 const observation=await ev('({checked:[...document.querySelectorAll("[role=switch]")].map(e=>e.getAttribute("aria-checked")),raw:verify.keys.map(k=>localStorage.getItem(k)),attempts:verify.attempts,text:document.body.innerText})');
 record('actual-device-controls',observation);
 assert.deepEqual(observation.attempts,['xai_pref_collab_show_avatars','xai_pref_collab_mention_notify'],'Both actual producers must attempt their device keys');
 assert.deepEqual(observation.raw,[null,null],'Quota changed persisted bytes');
 assert.deepEqual(observation.checked,['false','false'],'Latest failed device choices not retained');
 assert(/not saved|were not saved/i.test(observation.text),'No visible failure for either device choice');
 assert(await ev('[...document.querySelectorAll("button")].some(e=>/retry/i.test(e.textContent))'),'Device draft Retry missing');
 assert(await ev('[...document.querySelectorAll("button")].some(e=>/export/i.test(e.textContent))'),'Device draft Export missing');
 record('device-failure-recovery',{pass:true,scope:'Two actual device controls under quota; account default-share and full mixed-scope contract are separate'});
 }else if(mode==='pending-export'){
  await ev('verify.holdDevice()');await ev('document.querySelectorAll("[role=switch]")[0].click()');await delay(180);
  assert.equal(await ev('verify.readAll()[0]'),null,'Pending preference wrote before lock');
  assert.equal(await ev('document.querySelector("[role=switch]").getAttribute("aria-checked")'),'false');
  const label=await ev('[...document.querySelectorAll("button")].find(e=>/export/i.test(e.textContent))?.textContent.trim()');assert(label,'Pending actual draft has no Export control');await text(label);
  let filename;for(let i=0;i<60;i++){filename=readdirSync(downloads).find(f=>f.endsWith('.json'));if(filename)break;await delay(50)}assert.equal(filename,'collaborate-draft.json');
  const data=JSON.parse(readFileSync(join(downloads,filename),'utf8'));assert.deepEqual(data,{version:1,kind:'collaborate-draft',values:{account:{},device:{show_avatars:false}}});
  const warn=()=>ev('(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()');assert(await warn(),'Pending export cleared unload');
  await ev('verify.releaseDevice()');await delay(250);assert.equal(await ev('verify.readAll()[0]'),'false');assert.equal(await warn(),false);record('pending-draft-download',{pass:true,data,scope:'Actual native held device key, pending disk export, release and verified save'});
 }else{
  await ev(mode==='partial-export'?'verify.deny()':'verify.denyThree()');
  await ev('(()=>{const e=document.querySelector("select");Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,"value").set.call(e,"edit");e.dispatchEvent(new Event("change",{bubbles:true}))})()');await delay(180);
  for(const index of [0,1]){await ev(`document.querySelectorAll('[role=switch]')[${index}].click()`);await delay(180)}
  if(mode==='export-device-after-owner'){await ev('verify.switchOwner()');await delay(200);assert.equal(await ev('document.querySelector("select").value'),'comment','Old account selection leaked into B');}
  if(mode==='export-denied')await ev('verify.denyAll()');
  const sidebar=async()=>{await ev('(()=>{const e=[...document.querySelectorAll(".settings-sidebar [role=button]")].find(e=>e.textContent.trim()==="Notifications");e.focus();e.click()})()');await delay(180)};
  if(['host-departure','host-visual','host-visual-zh'].includes(mode)){await sidebar();assert.equal(await ev('document.querySelector(".settings-detail").dataset.pane'),'collaborate','Actual host left unsaved Collaborate');assert(await ev('!!document.querySelector("[role=dialog]")'),'Departure dialog missing');assert(!await ev('document.querySelector("[role=dialog]").textContent.includes("Smart Lists")'),'Collaborate decision mislabeled Smart Lists');}
  const label=await ev('[...document.querySelectorAll("button")].find(e=>/export/i.test(e.textContent))?.textContent.trim()');assert(label,'Actual current-draft export missing');if(mode==='host-departure'){await ev('[...document.querySelectorAll("[role=dialog] button")].find(e=>/export/i.test(e.textContent)).click()');await delay(180)}else await text(label);
  let filename;for(let i=0;i<60;i++){filename=readdirSync(downloads).find(f=>f.endsWith('.json'));if(filename)break;await delay(50)}
  assert.equal(filename,'collaborate-draft.json');const data=JSON.parse(readFileSync(join(downloads,filename),'utf8'));
  const expected={version:1,kind:'collaborate-draft',values:{account:['partial-export','export-device-after-owner'].includes(mode)?{}:{default_share:'edit'},device:{show_avatars:false,mention_notify:false}}};assert.deepEqual(data,expected);
  assert.deepEqual(await ev('[...document.querySelectorAll("[role=switch]")].map(e=>e.getAttribute("aria-checked"))'),['false','false'],'Device draft lost on export/owner change');
  const raw=await ev('verify.readAll()');assert.deepEqual(raw.slice(0,2),[null,null]);if(mode==='partial-export')assert.notEqual(raw[2],null,'Successful account sibling did not persist');else assert.equal(raw[2],null,'Failed/unmodified current account source changed');
  assert(await ev('(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()'),'Export cleared remaining drafts unload guard');
  if(mode==='host-departure'){await text('Stay');assert.equal(await ev('location.pathname'),'/app/settings/collaborate');await sidebar();await text('Discard local changes and leave');assert.equal(await ev('location.pathname'),'/app/settings/notifications');assert.deepEqual(await ev('verify.readAll()'),[null,null,null],'Leave wrote defaults/drafts');}
  record('actual-mixed-scope-download',{pass:true,mode,data,scope:'Actual disk JSON of current unsaved fields; account owner transition controlled, no provider or durable crash claim'});
 }

assert.equal(runtimeErrors.length,0,'Runtime errors during interaction: '+runtimeErrors.slice(0,3).join(' | '));record('runtime-errors',{pass:true,count:runtimeErrors.length});
}catch(error){record('device-failure-recovery',{pass:false,error:String(error)});process.exitCode=1;}
}finally{writeFileSync(join(output,`native-${sourceCommit}-${mode}.log`),records.map(r=>JSON.stringify(r)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

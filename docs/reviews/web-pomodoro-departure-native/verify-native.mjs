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
const sourceCommit=process.argv[2];const mode=process.argv[3]??'unload';if(!['unload','route','signout','rail','export','export-denied','owner','pending','visual','visual-zh'].includes(mode))throw Error('mode');if(!sourceCommit)throw Error('Fixed revision required');
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
const built=await build({stdin:{contents:readFileSync(join(output,['rail','visual','visual-zh'].includes(mode)?'native-shell.tsx':'native.tsx'),'utf8').replaceAll('lang="en"',mode==='visual-zh'?'lang="zh"':'lang="en"'),resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],nodePaths:[join(root,'apps/web/node_modules')],loader:{'.png':'dataurl','.svg':'dataurl','.woff2':'dataurl','.woff':'dataurl'},bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
const js=built.outputFiles.find(f=>f.path.endsWith('.js')).text,css=built.outputFiles.find(f=>f.path.endsWith('.css')).text;
server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
let port;for(let i=0;i<300;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);break}catch{await delay(50)}}assert(port);
const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(JSON.stringify(m.params));if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')runtimeErrors.push(m.params.args.map(a=>a.value??a.description??'').join(' '));if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await cdp('Runtime.enable');await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});for(let i=0;i<100;i++){if(await ev("!!document.querySelector('[data-testid=theme-violet]')"))break;await delay(50)}

const click=async selector=>{await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(180)};const text=async label=>{await ev(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!e)throw Error('missing '+${JSON.stringify(label)});e.click()})()`);await delay(180)};const input=async value=>{await ev(`(()=>{const e=document.querySelector('input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await delay(180)};const bytes=()=>ev('localStorage.getItem(verify.key)');
record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product});
try{
 assert.equal(runtimeErrors.length,0,'Runtime mount error '+runtimeErrors.slice(0,3).join(' | '));
 await ev(mode==='pending'?'verify.holdTheme()':'verify.deny()');await click('[data-testid="theme-blue"]');await click('[data-testid="theme-violet"]');
 assert.equal(await ev('localStorage.getItem("xai_pref_pomodoro_theme")'),'"coral"');assert.equal(await ev('document.querySelector("[data-testid=theme-violet]").getAttribute("aria-pressed")'),'true');
 if(mode==='visual'||mode==='visual-zh'){
 for(const width of [375,414,768,1024,1440]){
 await cdp('Emulation.setDeviceMetricsOverride',{width,height:812,deviceScaleFactor:1,mobile:false});await delay(180);
 const geometry=await ev(`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {text:e.textContent.trim(),x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right,hit:e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}};return {viewport:innerWidth,scroll:document.documentElement.scrollWidth,recovery:rect(document.querySelector('.pomo-recovery')),buttons:[...document.querySelectorAll('.pomo-recovery button')].map(rect)}})()`);
 record('visual-'+width,geometry);const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(join(output,`pomodoro-${evidenceTag}-${mode}-${width}.png`),Buffer.from(shot.data,'base64'));
 assert(geometry.scroll<=width,'Horizontal document overflow');assert(geometry.recovery.y>=0&&geometry.recovery.bottom<=812,'Recovery not visible in first viewport');for(const b of geometry.buttons){assert(b.width>=44&&b.height>=44,'Undersized recovery target '+b.text);assert(b.x>=0&&b.right<=width,'Recovery target horizontal clipping '+b.text);assert(b.y>=geometry.recovery.y&&b.bottom<=geometry.recovery.bottom,'Recovery target outside its container '+b.text);assert(b.hit,'Recovery target covered '+b.text)}
 }
 await cdp('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:false});await delay(180);await ev('verify.router.navigate("/app/dashboard")');await delay(180);
 const dialogGeometry=await ev(`(()=>{const e=document.querySelector('[role=dialog]');const r=e.getBoundingClientRect();return {text:e.textContent,x:r.x,y:r.y,right:r.right,bottom:r.bottom,focus:e.contains(document.activeElement),buttons:[...e.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return {text:b.textContent,width:q.width,height:q.height}})}})()`);
 record('dialog-375',dialogGeometry);const shot=await cdp('Page.captureScreenshot',{format:'png'});writeFileSync(join(output,`pomodoro-${evidenceTag}-${mode}-375-dialog.png`),Buffer.from(shot.data,'base64'));
 assert(dialogGeometry.x>=0&&dialogGeometry.right<=375&&dialogGeometry.y>=0&&dialogGeometry.bottom<=812,'Dialog outside viewport');assert(dialogGeometry.focus,'Focus not in actual dialog');assert(dialogGeometry.text.includes(mode==='visual-zh'?'番茄钟偏好':'Pomodoro preferences'),'Incorrect participant label');for(const b of dialogGeometry.buttons)assert(b.width>=44&&b.height>=44,'Small dialog target '+b.text);
 record('full-shell-css-recovery',{pass:true});
 }
 if(mode==='unload'){const warning=await ev('(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()');record('unload-observation',{warning});assert(warning,'Actual failed preference draft lacks browser unload warning');}
 if(mode==='route'){await ev('verify.router.navigate("/app/dashboard")');await delay(200);const observation=await ev('({path:location.pathname,dialog:!!document.querySelector("[role=dialog]")})');record('route-observation',observation);assert.equal(observation.path,'/app/pomodoro','Actual registration left the failed preference draft');assert(observation.dialog,'Missing current draft decision');}
 if(mode==='rail'){await click('.app-rail [aria-label="Dashboard"],.rail [aria-label="Dashboard"]');const observation=await ev('({path:location.pathname,dialog:!!document.querySelector("[role=dialog]")})');record('rail-observation',observation);assert.equal(observation.path,'/app/pomodoro');assert(observation.dialog);}
 if(['export','export-denied','owner','pending'].includes(mode)){
 await ev('verify.router.navigate("/app/dashboard")');await delay(180);assert.equal(await ev('location.pathname'),'/app/pomodoro');assert(await ev('!!document.querySelector("[role=dialog]")'));
 if(mode==='owner'){await ev('verify.switchOwner()');await delay(180);assert.equal(await ev('!!document.querySelector("[role=dialog]")'),false,'Old decision survived owner change');assert.equal(await ev('document.querySelector("[data-testid=theme-violet]").getAttribute("aria-pressed")'),'true');await ev('verify.router.navigate("/app/dashboard")');await delay(180);assert(await ev('!!document.querySelector("[role=dialog]")'));}
 if(mode==='export-denied')await ev('verify.denyAll()');
 await ev('[...document.querySelectorAll("[role=dialog] button")].find(e=>/export/i.test(e.textContent)).click()');await delay(180);
 let filename;for(let i=0;i<80;i++){filename=readdirSync(downloads).find(f=>f.endsWith('.json'));if(filename)break;await delay(50)}assert.equal(filename,'pomodoro-preferences.json');const data=JSON.parse(readFileSync(join(downloads,filename),'utf8'));assert.deepEqual(data,{version:1,kind:'pomodoro-preference-draft',values:{preset:'focus-25',customMinutes:45,displayStyle:'apple',theme:'violet',sound:'soft-chime',muted:false}});
 assert.equal(await ev('location.pathname'),'/app/pomodoro','Export navigated');assert(await ev('(()=>{const e=new Event("beforeunload",{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented})()'),'Export cleared draft warning');
 if(mode==='pending'){await ev('verify.releaseTheme()');for(let i=0;i<80;i++){if(await ev('location.pathname')==='/app/dashboard')break;await delay(50)}assert.equal(await ev('location.pathname'),'/app/dashboard');assert.equal(await ev('verify.readTheme()'),'"violet"');}else{assert.equal(await ev('verify.readTheme()'),'"coral"');}
 record('actual-six-value-departure-export',{pass:true,mode,data});
 }
 if(mode==='signout'){await ev('verify.signout()');await delay(200);const observation=await ev('({outcome:verify.signoutResult,dialog:!!document.querySelector("[role=dialog]")})');record('signout-observation',observation);assert.equal(observation.outcome,'unresolved');assert(observation.dialog);}
 assert.equal(runtimeErrors.length,0,'Runtime interaction error '+runtimeErrors.slice(0,3).join(' | '));record('departure',{pass:true,mode,runtimeErrors:0});
}catch(error){record('departure',{pass:false,error:String(error)});process.exitCode=1;}
}finally{writeFileSync(join(output,`native-${evidenceTag}-${mode}.log`),records.map(r=>JSON.stringify(r)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

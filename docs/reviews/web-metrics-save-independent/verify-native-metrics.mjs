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
const sourceCommit=process.env.METRICS_VERIFY_REF??'15be421d5c467fbdda2c52e94322917795cad79c';
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
const source=readFileSync(new URL('./native-metrics.tsx',import.meta.url),'utf8');
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
 for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.module-metrics')"))break;await delay(100);}
 assert(await evaluate("!!document.querySelector('.module-metrics')"),'mounted actual Settings');
 record('baseline',{head:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:390});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 const checks=[];const check=(name,pass,data={})=>{checks.push(pass);record(name,{pass,...data});};
 await input('.mt-profile label:nth-child(2) input','63');await evaluate('window.verify.deny()');await click('button[aria-label="Save goal settings"]');await input('.mt-profile label:nth-child(2) input','64');
 const profile=await download('Export unsaved draft','profile-real-export');assert.equal(profile.profileDraft.targetWeightKg,'64');assert.equal(profile.snapshot.profile.targetWeightKg,63);
 await evaluate('window.verify.restore()');await clickText('Retry save');const profileSaved=JSON.parse(await evaluate('window.verify.raw()')).profile.targetWeightKg;
 check('latest-profile-retry',profileSaved===64,{visible:await evaluate("document.querySelector('.mt-profile label:nth-child(2) input').value"),persisted:profileSaved,alert:await evaluate("!!document.querySelector('[role=alert]')")});
 await reset();await input('.mt-profile label:nth-child(2) input','63');await evaluate('window.verify.deny()');await click('button[aria-label="Save goal settings"]');await evaluate('window.verify.restore()');await clickText('Log');
 if(await evaluate("!!document.querySelector('input[aria-label=\"Weight value\"]')")){await input('input[aria-label="Weight value"]','81');await clickText('Save record');}
 const p=JSON.parse(await evaluate('window.verify.raw()')).profile.targetWeightKg,alert=await evaluate("!!document.querySelector('[role=alert]')");check('cross-operation-retention',p===63||alert,{persisted:p,alert});
 await reset();await clickText('Log');await input('input[aria-label="Weight value"]','81');await input('.mt-entry textarea','native metric note');const before=JSON.parse(await evaluate('window.verify.raw()')).records.length;await evaluate('window.verify.deny()');await clickText('Save record');await input('input[aria-label="Weight value"]','82');await click('button[aria-label="Close"]');
 const closed=await download('Export unsaved draft','closed-record-real-export');check('latest-closed-record-export',closed.recordDraft?.weight==='82',{recordDraft:closed.recordDraft,snapshotWeight:closed.snapshot?.records[0]?.value});
 await evaluate('window.verify.restore()');await clickText('Retry save');const records=JSON.parse(await evaluate('window.verify.raw()')).records;check('latest-closed-record-retry',records.length===before+1&&records.filter(r=>r.value===82&&r.note==='native metric note').length===1,{count:records.length,before,latest:records[0]});
 await reset();await clickText('Log');await input('input[aria-label="Weight value"]','84');await evaluate('window.verify.deny()');await clickText('Save record');await evaluate('window.verify.restore()');const newer=await evaluate('window.verify.external()');await clickText('Retry save');assert.equal(await evaluate('window.verify.raw()'),newer);assert((await evaluate("document.querySelector('[role=alert]').textContent")).includes('Newer data'));
 const conflict=await download('Export unsaved draft','conflict-real-export');assert.equal(conflict.recordDraft.weight,'84');record('conflict',{newerRawRetained:true,failedDraftExported:true});
 const geometry=await evaluate("(()=>{const p=document.querySelector('[role=alert]'),r=p.getBoundingClientRect();return {left:r.left,right:r.right,viewport:innerWidth,height:r.height}})()");record('390px-recovery',geometry);writeFileSync(join(output,process.env.METRICS_SCREENSHOT??'390px-metrics-before.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate('window.verify.switchB()');await clickText('Retry save');await clickText('Export unsaved draft');assert.equal(readdirSync(downloads).length,0);assert(await evaluate('window.verify.Bsafe()'));assert.equal(await evaluate('window.verify.raw()'),newer);assert((await evaluate("document.querySelector('[role=alert]').textContent")).includes('Could not export'));record('account-boundary',{BPreserved:true,staleExportRejected:true});
 record(checks.every(Boolean)?'PASS':'FAIL',{downloads:3,checks,scope:'profile latest retry, operation retention, latest closed record draft, conflict/B boundary, actual native downloads'});if(!checks.every(Boolean))process.exitCode=1;
}finally{writeFileSync(join(output,process.env.METRICS_VERIFY_LOG??'20260909-native-before.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

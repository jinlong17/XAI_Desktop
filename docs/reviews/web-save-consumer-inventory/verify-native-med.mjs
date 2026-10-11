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
const sourceCommit='da35b3b8175565f5e99ab9f88da2a788889494d4';
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
const source=readFileSync(new URL('./native-med.tsx',import.meta.url),'utf8');
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
 for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.module-meditation')"))break;await delay(100);}
 assert(await evaluate("!!document.querySelector('.module-meditation')"),'mounted actual Settings');
 record('baseline',{head:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:390});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 const name=async value=>input('.field-row input[type=text]',value);
 await name('First rejected');await evaluate('window.verify.deny()');await click('.save-scene');assert.equal(await evaluate('window.verify.raw()'),null);assert(await evaluate("!!document.querySelector('[role=alert]')"));await name('Latest native draft');
 const payload=await download('Export draft','actual-latest-draft-download');assert.equal(payload.sceneDraft.name,'Latest native draft');assert.equal(payload.snapshot.customScenes[0].name,'First rejected');
 await evaluate('window.verify.restore()');await clickText('Retry save');await click('.save-scene');let saved=JSON.parse(await evaluate('window.verify.raw()'));assert.equal(saved.customScenes.length,1);assert.equal(saved.customScenes[0].name,'Latest native draft');assert.equal(saved.scene,saved.customScenes[0].id);record('latest-new-retry',{exactlyOne:true,latestName:saved.customScenes[0].name});
 await name('Unsubmitted delete edit');const original=await evaluate('window.verify.raw()');await evaluate('window.verify.deny()');await click('button[aria-label="Delete scene"]');assert.equal(await evaluate('window.verify.raw()'),original);assert.equal(await evaluate("document.querySelector('.field-row input[type=text]').value"),'Unsubmitted delete edit');
 const deleted=await download('Export draft','failed-delete-draft-download');assert.equal(deleted.sceneDraft.name,'Unsubmitted delete edit');assert.equal(deleted.snapshot.customScenes.length,0);await evaluate('window.verify.restore()');await clickText('Retry save');assert.equal(JSON.parse(await evaluate('window.verify.raw()')).customScenes.length,0);record('failed-delete',{editorRetained:true,retryRemoved:true});
 await reset();await name('Conflict proposal');await evaluate('window.verify.deny()');await click('.save-scene');await evaluate('window.verify.restore()');const newer=await evaluate('window.verify.external()');await clickText('Retry save');assert.equal(await evaluate('window.verify.raw()'),newer);assert((await evaluate("document.querySelector('[role=alert]').textContent")).includes('Newer stored data'));
 const geometry=await evaluate("(()=>{const p=document.querySelector('[role=alert]'),r=p.getBoundingClientRect();return {left:r.left,right:r.right,viewport:innerWidth,buttons:[...p.querySelectorAll('button')].map(b=>b.getBoundingClientRect().height)}})()");assert(geometry.left>=0&&geometry.right<=390);assert(geometry.buttons.every(h=>h>=44));record('390px-recovery',geometry);writeFileSync(join(output,'390px-med-recovery.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate('window.verify.switchB()');await clickText('Retry save');await clickText('Export draft');assert.equal(readdirSync(downloads).length,0);assert(await evaluate('window.verify.Bsafe()'));assert.equal(await evaluate('window.verify.raw()'),newer);assert((await evaluate("document.querySelector('[role=alert]').textContent")).includes('Export failed'));record('conflict-account',{newerRawPreserved:true,oldAExportRetryRejected:true,BPreserved:true});
 await reset();await evaluate('window.verify.deny()');await input('input[type=range]','0.2');assert(await evaluate("!!document.querySelector('[role=alert]')"));assert.equal(await evaluate('window.verify.raw()'),null);record('configuration-volume-failure',{visible:true});
 await reset();await click('.med-start');await click('[data-control=settings]');await evaluate('window.verify.deny()');await input('.mp-volume input[type=range]','0.2');assert(await evaluate("!!document.querySelector('[role=alert]')"));record('player-volume-failure',{visible:true,geometry:await evaluate("(()=>{const r=document.querySelector('[role=alert]').getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}})()")});writeFileSync(join(output,'390px-med-player-failure.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));const hit=await evaluate("(()=>{const b=document.querySelector('[role=alert] button'),r=b.getBoundingClientRect();return b.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))})()");assert(hit);await evaluate('window.verify.restore()');await clickText('Retry save');assert.equal(JSON.parse(await evaluate('window.verify.raw()')).volume,0.2);assert(await evaluate("!!document.querySelector('.med-player')&&!document.querySelector('[role=alert]')"));record('player-retry',{buttonHitTest:true,persistedVolume:0.2,playerContinues:true});
 record('PASS',{downloads:2,scope:'actual module latest scene, delete, conflict, B isolation, configuration/player volume and 390px recovery panel'});
}finally{writeFileSync(join(output,'20260909-native-med-after.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

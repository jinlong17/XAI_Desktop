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
const directory=mkdtempSync(join(tmpdir(),'xai-task-link-independent-'));
const sourceCommit='f3a75f1';
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
const source=readFileSync(new URL('./native.tsx',import.meta.url),'utf8');
let server,browser,socket;
const log=[];const record=(name,data)=>{log.push({name,...data});console.log(name,JSON.stringify(data??{}));};
try{
 const bundle=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},bundle:true,plugins:[pinnedPackages],format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),loader:{'.svg':'dataurl','.png':'dataurl'},define:{'import.meta.env':'{}'}});
 const js=bundle.outputFiles.find(f=>f.path.endsWith('.js')).text,css=bundle.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
 server=createServer((req,res)=>{if(req.url==='/?peer=1'){res.end('<!doctype html><title>Visibility peer</title>');return;}res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><main id="app"></main><script type="module">'+js+'</script>');});
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
 for(let i=0;i<100;i++){if(await evaluate("!!window.verify"))break;await delay(100);}
 assert(await evaluate("!!window.verify"),'mounted actual Board and Tasks');
 record('baseline',{head:execFileSync('git',['rev-parse',sourceCommit],{cwd:root,encoding:'utf8'}).trim(),source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:1440});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 const target=await(await fetch('http://127.0.0.1:'+port+'/json/new?'+encodeURIComponent('http://127.0.0.1:'+server.address().port+'/?peer=1'),{method:'PUT'})).json();const second=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>second.addEventListener('open',r,{once:true}));let secondId=0;const secondPending=new Map();second.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){secondPending.get(m.id)?.(m);secondPending.delete(m.id)}});const evalB=expression=>new Promise((resolve,reject)=>{const id=++secondId;secondPending.set(id,m=>m.result?.exceptionDetails?reject(Error(JSON.stringify(m))):resolve(m.result?.result?.value));second.send(JSON.stringify({id,method:'Runtime.evaluate',params:{expression,returnByValue:true}}))});

 await cdp('Page.bringToFront');
 const card=()=>evaluate("window.verify.boards()[0].lists.flatMap(l=>l.cards).find(c=>c.id==='bc1')");
 const task=()=>evaluate("window.verify.tasks().find(t=>t.source?.cardId==='bc1')");
 const openCard=async()=>{await evaluate(`(()=>{const card=[...document.querySelectorAll('[data-testid=board-card]')].find(e=>e.textContent.includes('Onboarding flow concepts'));if(!card)throw Error('source card absent');card.click()})()`);await delay(100);};
 const show=async tasks=>{await evaluate(`window.verify.show(${tasks})`);await delay(200);};
 const drag=async(from,to)=>{await evaluate(`(()=>{window.transfer=new DataTransfer();const el=document.querySelector(${JSON.stringify(from)});el.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:window.transfer}))})()`);await delay(60);await evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(to)});el.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:window.transfer}));el.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:window.transfer}))})()`);await delay(200);};
 const before=await evaluate('localStorage.getItem(window.verify.taskKey)');await openCard();await evaluate('window.verify.failTask()');await click('[data-testid=card-detail-create-task]');
 assert((await card()).taskLink.pending);assert.equal(await evaluate('localStorage.getItem(window.verify.taskKey)'),before);assert((await evaluate('document.body.innerText')).includes('task creation failed'));await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});const retryHeight=await evaluate("document.querySelector('[data-testid=card-detail-retry-task]').getBoundingClientRect().height");assert(retryHeight>=44);await evaluate("document.querySelector('[data-testid=card-detail-retry-task]').scrollIntoView({block:'center'})");await delay(100);writeFileSync(join(output,'390px-link-recovery.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:true});record('actual-create-failure-retains-intent',{retryHeight,pass:true});
 await cdp('Page.reload');for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('[data-testid=board-card]')"))break;await delay(100)}await openCard();await click('[data-testid=card-detail-retry-task]');
 const original=await task();assert(original);assert.equal((await card()).taskLink.pending,undefined);assert.equal((await evaluate('window.verify.tasks()')).length,1);record('reload-retry-one-task',{taskId:original.id,pass:true});
 await show(true);await click('.task-card .cbx');const completed=await task();assert.equal(completed.done,true);assert(Number.isFinite(Date.parse(completed.completedAt)));await drag('.task-card','.task-col:nth-child(3)');const movedTask=await task();assert.deepEqual(movedTask.source,original.source);assert.equal(movedTask.completedAt,completed.completedAt);record('actual-completion-and-task-move',{completedAt:completed.completedAt,sourceRetained:true,pass:true});
 await show(false);await openCard();assert.equal(await evaluate("document.querySelector('[data-testid=card-detail-task-status]').textContent.trim()"),'Completed');await click('[data-testid=card-detail-close]');
 await drag('[data-list-id="b-backlog"] [data-testid=board-card]','[data-list-id="b-today"]');
 const location=await evaluate("window.verify.boards()[0].lists.find(l=>l.cards.some(c=>c.id==='bc1')).id");assert.notEqual(location,'b-backlog');await openCard();assert.equal(await evaluate("document.querySelector('[data-testid=card-detail-task-status]').textContent.trim()"),'Completed');await click('[data-testid=card-detail-close]');record('actual-board-column-move-status',{location,pass:true});
 await evaluate(`(()=>{const e=[...document.querySelectorAll('[data-testid=board-card]')].find(e=>e.textContent.includes('Onboarding flow concepts'));e.querySelector('[data-testid=card-menu-open]').click()})()`);await delay(100);await click('[data-testid=card-archive]');assert.equal((await card()).archived,true);await click('[data-testid=archive-cards-toggle]');await click('[data-testid="archive-card-restore-'+location+'-bc1"]');assert.notEqual((await card()).archived,true);await openCard();assert.equal(await evaluate("document.querySelector('[data-testid=card-detail-task-status]').textContent.trim()"),'Completed');record('actual-card-archive-restore',{sourceAndDoneRetained:true,pass:true});
 await click('[data-testid=card-detail-close]');await click('[data-list-id="'+location+'"] [data-testid=bl-menu-open]');await click('[data-testid=list-archive]');assert.equal(await evaluate('window.verify.boards()[0].lists.find(l=>l.id==='+JSON.stringify(location)+').archived'),true);await click('[data-testid=archive-toggle]');await click('[data-testid="archive-restore-'+location+'"]');await openCard();assert.equal(await evaluate("document.querySelector('[data-testid=card-detail-task-status]').textContent.trim()"),'Completed');record('actual-list-archive-restore',{pass:true});
 await show(true);await click('.task-card .cbx');assert.equal((await task()).done,false);assert.equal((await task()).completedAt,undefined);await evaluate('window.verify.advance()');await click('.task-card .cbx');const again=await task();assert.notEqual(again.completedAt,completed.completedAt);await show(false);await openCard();assert.equal(await evaluate("document.querySelector('[data-testid=card-detail-task-status]').textContent.trim()"),'Completed');record('actual-undo-recomplete',{newCompletedAt:again.completedAt,pass:true});
 const finalTask=await task();await cdp('Page.reload');for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('[data-testid=board-card]')"))break;await delay(100)}await openCard();assert.equal((await task()).completedAt,finalTask.completedAt);assert.equal(await evaluate("document.querySelector('[data-testid=card-detail-task-status]').textContent.trim()"),'Completed');record('final-reload-link-completion',{pass:true});
 record('original-native-chain-PASS',{checks:8,scope:'actual Board/Tasks UI, native persistence failure/reload/retry, two-sided move, completion and archive recovery'});
 for(const phase of ['intent','task','acknowledgement']){
 const cut=await evaluate(`window.verify.cut(${JSON.stringify(phase)})`);assert.equal(cut.result.ok,false);assert.equal(cut.result.phase,phase);
 const getCard=raw=>JSON.parse(raw)[0].lists.flatMap(l=>l.cards).find(c=>c.id==='bc1');const getTasks=raw=>JSON.parse(raw).flatMap(c=>[...c.tasks,...(c.completed??[])]);
 if(phase==='intent'){assert.equal(cut.after.board,cut.before.board);assert.equal(cut.after.task,cut.before.task);}
 else {assert(getCard(cut.after.board).taskLink.pending);if(phase==='task')assert.equal(cut.after.task,cut.before.task);else assert.equal(getTasks(cut.after.task).length,1);}
 let edited;if(phase==='acknowledgement')edited=await evaluate('window.verify.editExisting()');
 assert.deepEqual(await evaluate('window.verify.retry()'),{ok:true});assert.equal((await card()).taskLink.pending,undefined);assert.equal((await evaluate('window.verify.tasks()')).length,1);if(edited)assert.equal(await evaluate('localStorage.getItem(window.verify.taskKey)'),edited);
 assert.deepEqual(await evaluate('window.verify.retry()'),{ok:true});assert.equal((await evaluate('window.verify.tasks()')).length,1);record('independent-native-cut-'+phase,{pass:true,retryIdempotent:true,userEditsPreserved:!!edited});
 }
 const ownerCut=await evaluate('window.verify.accountCut()');assert(ownerCut.switched);assert.equal(ownerCut.result.ok,false);assert.equal(ownerCut.stale.ok,false);assert.equal(ownerCut.bBoard,null);assert.equal(ownerCut.bTask,null);assert.equal(ownerCut.aRawAfter,ownerCut.aRaw);assert.equal(ownerCut.aTasks.length,0);assert(JSON.parse(ownerCut.aRaw)[0].lists.flatMap(l=>l.cards).find(c=>c.id==='bc1').taskLink.pending);record('independent-mid-command-owner-switch',{pass:true,AIntentPreserved:true,BUnwritten:true,staleCallbackRejected:true});
 second.close();
}finally{writeFileSync(join(output,'20260909-native.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

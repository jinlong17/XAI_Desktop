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
const directory=mkdtempSync(join(tmpdir(),'xai-rel05-save-'));
const sourceCommit=process.env.REL05_VERIFY_REF??'9222519f52c1292a4556268803612e0a04da3b7c';
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
const source=readFileSync(new URL('./native-save.tsx',import.meta.url),'utf8');
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
 for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.module-tasks')"))break;await delay(100);}
 assert(await evaluate("!!document.querySelector('.module-tasks')"),'mounted actual Settings');
 record('baseline',{head:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:390});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const stored=logical=>evaluate(`window.verify.stored(${JSON.stringify(logical)})`);
 await click('.icon-btn[aria-label="Add"]');await input('#task-composer-title-input','first unsaved title');
 const tasksBefore=await stored('xai_task_cols');await evaluate("window.verify.deny([window.verify.a('xai_task_cols')])");await click('.task-composer__btn--primary');
 assert(await evaluate("document.querySelector('dialog.task-composer').open"));assert.equal(await stored('xai_task_cols'),tasksBefore);
 await input('#task-composer-title-input','latest native task draft');
 const taskDraft=await download('Export draft','tasks-actual-draft');assert.equal(taskDraft.draft.title,'latest native task draft');
 await evaluate('window.verify.restore()');await click('dialog.task-composer .task-composer__btn--primary');
 const taskRows=JSON.parse(await stored('xai_task_cols')).flatMap(c=>c.tasks);assert.equal(taskRows.filter(t=>t.title.en==='latest native task draft').length,1);assert(!(await evaluate("document.querySelector('dialog.task-composer').open")));
 record('tasks-retry',{latestDraftSavedOnce:true});
 await evaluate("window.verify.render('bookkeeping')");await delay(200);await clickText('记一笔');await clickText('1');await clickText('2');await input('input[placeholder="点下方模板或手动输入"]','native bookkeeping retained note');
 const bookBefore=await stored('xai_bk_state_v2');await evaluate("window.verify.deny([window.verify.a('xai_bk_state_v2')])");await clickText('保存');
 assert.equal(await stored('xai_bk_state_v2'),bookBefore);assert(await evaluate("document.querySelector('.bk-workspace').inert"));assert(await evaluate("document.querySelector('[role=alertdialog]')===document.activeElement"));
 const bookDraft=await download('导出草稿','bookkeeping-actual-draft');assert.equal(bookDraft.canonicalCommitted,false);assert.equal(bookDraft.state.tx.filter(t=>t.note==='native bookkeeping retained note').length,1);
 const geometry=await evaluate("(()=>{const p=document.querySelector('[role=alertdialog]'),r=p.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,viewport:innerWidth,buttons:[...p.querySelectorAll('button')].map(b=>({text:b.textContent,height:b.getBoundingClientRect().height}))}})()");assert(geometry.left>=0&&geometry.right<=390&&geometry.top>=0);record('bookkeeping-390px',geometry);
 writeFileSync(join(output,'390px-bookkeeping-recovery.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate('window.verify.restore()');await clickText('重试保存');const savedBook=JSON.parse(await stored('xai_bk_state_v2'));assert.equal(savedBook.tx.filter(t=>t.note==='native bookkeeping retained note').length,1);assert.equal(savedBook.tx.length,JSON.parse(bookBefore).tx.length+1);assert(!(await evaluate("!!document.querySelector('[role=alertdialog]')")));
 record('bookkeeping-retry',{draftSavedOnce:true});
 await evaluate("window.verify.render('hook')");await delay(200);await evaluate("window.verify.deny(['xai_bk_view','xai_bk_calendar_mode']);window.verify.partial()");await delay(150);
 const canonical=await stored('xai_bk_state_v2');assert.equal(JSON.parse(canonical).budgetTotal,222);assert.equal(await evaluate("localStorage.getItem('xai_bk_view')"),'detail');assert.equal(await evaluate("localStorage.getItem('xai_bk_calendar_mode')"),'month');assert(await evaluate('window.verify.pending().canonicalCommitted'));
 const partialDraft=await download('Export draft','bookkeeping-partial-draft');assert.equal(partialDraft.canonicalCommitted,true);assert.equal(partialDraft.state.budgetTotal,222);
 await evaluate("window.verify.clearWrites();window.verify.deny([]);window.verify.retryTwice()");await delay(150);assert.equal(await stored('xai_bk_state_v2'),canonical);assert.equal(await evaluate("window.verify.writes.filter(k=>k===window.verify.a('xai_bk_state_v2')).length"),0);assert.equal(await evaluate("localStorage.getItem('xai_bk_view')"),'overview');assert.equal(await evaluate("localStorage.getItem('xai_bk_calendar_mode')"),'year');
 record('partial-mirror-retry',{twoFailures:true,businessNotRewritten:true,twoRetriesIdempotent:true});
 await evaluate("window.verify.deny([window.verify.a('xai_bk_state_v2')]);window.verify.partial()");await delay(150);const aBeforeB=await stored('xai_bk_state_v2');await evaluate('window.verify.restore();window.verify.switchB()');await clickText('Retry save');await clickText('Export draft');assert.equal(readdirSync(downloads).length,0);assert.equal(await stored('xai_bk_state_v2'),aBeforeB);assert(await evaluate('window.verify.Bsafe()'));assert((await evaluate("document.querySelector('[role=alertdialog]').textContent")).includes('Draft export failed'));
 record('PASS',{downloads:3,scope:'native Tasks latest draft export/retry; Bookkeeping record export/retry, two failed mirrors, repeated retry, stale A/B actions, 390px alert'});
}finally{writeFileSync(join(output,'20260909-native-save.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

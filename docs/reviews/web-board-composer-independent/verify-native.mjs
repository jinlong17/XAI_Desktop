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
const directory=mkdtempSync(join(tmpdir(),'xai-composer-fix-'));
const sourceCommit=process.argv[2];if(!sourceCommit)throw Error('fixed revision required');
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};
const downloads=join(directory,'downloads');mkdirSync(downloads);const delay=ms=>new Promise(r=>setTimeout(r,ms));let server,browser,socket;const records=[];const record=(name,value)=>{records.push({name,...value});console.log(name,JSON.stringify(value));};
try{
const built=await build({stdin:{contents:readFileSync(join(output,'native.tsx'),'utf8'),resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],loader:{'.png':'dataurl','.svg':'dataurl'},nodePaths:[join(root,'apps/web/node_modules')],bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
const js=built.outputFiles.find(f=>f.path.endsWith('.js')).text,css=built.outputFiles.find(f=>f.path.endsWith('.css')).text;
server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>')});await new Promise(r=>server.listen(0,'127.0.0.1',r));
browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
let port;for(let i=0;i<100;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);break}catch{await delay(50)}}assert(port);
const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result)}});const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}))});const ev=async expression=>{const r=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};
await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});for(let i=0;i<100;i++){if(await ev("!!document.querySelector('[data-testid=bv-switch]')"))break;await delay(50)}

const click=async selector=>{await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100)};
const text=async label=>{await ev(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(label)});if(!e)throw Error('missing action');e.click()})()`);await delay(100)};
const input=async(kind,value)=>{await ev(`(()=>{const e=document.querySelector(${JSON.stringify(kind==='card'?'[data-testid=card-composer-input]':'[data-testid=list-name-input]')});Object.getOwnPropertyDescriptor(${kind==='card'?'HTMLTextAreaElement':'HTMLInputElement'}.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await delay(100)};
const bytes=()=>ev('localStorage.getItem(verify.key)');const reload=async()=>{await cdp('Page.reload');await delay(600)};
record('baseline',{commit:sourceCommit,chromePid:browser.pid});
for(const kind of ['card','list']){
 if(kind==='list')await reload();await click(kind==='card'?'[data-testid=add-card-btn]':'[data-testid=add-list-btn]');await input(kind,'First failed '+kind);const original=await bytes();await ev('verify.deny()');await click(kind==='card'?'[data-testid=card-composer-add]':'[data-testid=list-composer-add]');
 const inputSelector=kind==='card'?'[data-testid=card-composer-input]':'[data-testid=list-name-input]';const result={retained:await ev(`!!document.querySelector(${JSON.stringify(inputSelector)})`),error:await ev("!!document.querySelector('[role=alert]')"),originalBytes:await bytes()===original,rejectedWrites:await ev('verify.boardWrites()')};record(kind+'-correct-oracle',result);assert(result.retained&&result.error&&result.originalBytes&&result.rejectedWrites>0);
 await input(kind,'Latest native '+kind);await text('Retry save');const proposed=await ev('verify.proposals()');const entity=raw=>{const b=JSON.parse(raw)[0];return kind==='card'?b.lists[0].cards.at(-1):b.lists.at(-1)};assert.equal(entity(proposed[0]).id,entity(proposed[1]).id);
 await text('Export draft');let filename;for(let i=0;i<100;i++){filename=readdirSync(downloads).find(f=>f.endsWith('.json'));if(filename)break;await delay(50)}assert(filename);assert.equal(readdirSync(downloads).length,1);const downloaded=JSON.parse(readFileSync(join(downloads,filename),'utf8'));assert.equal(downloaded.text,'Latest native '+kind);assert.equal(downloaded.proposal.id,entity(proposed[0]).id);assert.equal(downloaded.stored,original);assert.equal(downloaded.proposal.baseline,original);rmSync(join(downloads,filename));
 await ev('verify.restore()');await text('Retry save');assert.equal(entity(await bytes()).id,downloaded.proposal.id);assert.equal(await ev(`!!document.querySelector(${JSON.stringify(inputSelector)})`),false);const b=JSON.parse(await bytes())[0];assert.equal(kind==='card'?b.lists[0].cards.filter(c=>c.title.en==='Latest native card').length:b.lists.filter(l=>l.customName?.en==='Latest native list').length,1);record(kind+'-actual-download-stable-id-latest-retry',{pass:true});
}
await reload();await click('[data-testid=add-card-btn]');await input('card','After removal');await ev('localStorage.removeItem(verify.key)');await click('[data-testid=card-composer-add]');assert.equal(await bytes(),null,'first submission resurrected removed canonical data');assert((await ev('document.body.innerText')).includes('Newer board data'));record('first-submit-external-removal-rejected',{pass:true});
await reload();await click('[data-testid=add-list-btn]');await input('list','Removed list destination');await ev('localStorage.removeItem(verify.key)');await click('[data-testid=list-composer-add]');assert.equal(await bytes(),null);assert((await ev('document.body.innerText')).includes('Newer board data'));record('list-first-submit-external-removal-rejected',{pass:true});
await reload();await click('[data-testid=add-card-btn]');await input('card','Conflict draft');await ev('verify.deny()');await click('[data-testid=card-composer-add]');await ev('verify.restore()');const newer=JSON.parse(await bytes());newer[0].name.en='External winner';const newerRaw=JSON.stringify(newer);await ev(`localStorage.setItem(verify.key,${JSON.stringify(newerRaw)})`);await text('Retry save');assert.equal(await bytes(),newerRaw);assert.equal(await ev("document.querySelector('[data-testid=card-composer-input]').value"),'Conflict draft');record('newer-raw-retains-draft',{pass:true});
const bKey=await ev('verify.switch()');const bBytes=await ev(`localStorage.getItem(${JSON.stringify(bKey)})`);await text('Retry save');await text('Export draft');assert.equal(await bytes(),newerRaw);assert.equal(await ev(`localStorage.getItem(${JSON.stringify(bKey)})`),bBytes);assert.equal(readdirSync(downloads).length,0);assert((await ev('document.body.innerText')).includes('Export failed'));record('old-account-retry-export-denied',{pass:true});record('PASS',{scope:'card and list composer only'});

}finally{writeFileSync(join(output,'native-results.log'),records.map(r=>JSON.stringify(r)).join('\n')+'\n');socket?.close();server?.closeAllConnections();server?.close();if(browser&&browser.exitCode===null)await new Promise(resolve=>{browser.once('exit',resolve);browser.kill('SIGTERM');setTimeout(()=>{if(browser.exitCode===null)browser.kill('SIGKILL')},1500).unref()});rmSync(directory,{recursive:true,force:true,maxRetries:8,retryDelay:150});}

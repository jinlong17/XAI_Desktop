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
const directory=mkdtempSync(join(tmpdir(),'xai-auth-receipt-'));
const sourceCommit=process.env.AI_REF??'HEAD';
const viewportWidth=Number(process.env.AI_WIDTH??390);
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
let server,browser,socket;let serverDeletes=0;
const log=[];const record=(name,data)=>{log.push({name,...data});console.log(name,JSON.stringify(data??{}));};
try{
 const bundle=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},bundle:true,plugins:[pinnedPackages,{name:'synthetic-stream-only',setup(build){build.onLoad({filter:/claudeStreamAdapter\.ts$/},()=>({contents:'export async function* streamCompleteChat(r) { yield {accumulated: \"answer \" + r.text, done: true}; }',loader:'js'}));}}],format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),loader:{'.svg':'dataurl','.png':'dataurl'},define:{'import.meta.env':'{}'}});
 const js=bundle.outputFiles.find(f=>f.path.endsWith('.js')).text,css=bundle.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
 server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>#app{position:absolute;inset:0;}'+css+'</style><main id="app"></main><script type="module">'+js+'</script>');});
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
 await cdp('Emulation.setTimezoneOverride',{timezoneId:'America/Los_Angeles'});
 await cdp('Emulation.setDeviceMetricsOverride',{width:viewportWidth,height:844,deviceScaleFactor:1,mobile:viewportWidth<=1024});
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
 for(let i=0;i<100;i++){if(await evaluate("!!window.probe&&!!document.querySelector('.ai-input')"))break;await delay(100);}
 assert(await evaluate("!!window.probe&&!!document.querySelector('.ai-input')"),'mounted actual AI Chat');
 record('baseline',{head:execFileSync('git',['rev-parse',sourceCommit],{cwd:root,encoding:'utf8'}).trim(),requestedRef:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:viewportWidth});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 await input('.ai-input','First unsaved');await click('[aria-label="Send"]');await delay(100);
 assert.equal(await evaluate('window.probe.raw()'),null);assert((await evaluate("document.querySelector('[role=alert]').textContent")).includes('Unsaved'));
 await input('.ai-input','Second unsaved');await click('[aria-label="Send"]');await delay(100);
 await input('.ai-input','Newest unsent input');await click('.ai-new-corner');
 assert.equal(await evaluate("document.querySelector('.ai-input').value"),'Newest unsent input');
 const file=await download('Export draft','actual-json-download');assert.equal(file.input,'Newest unsent input');assert.equal(file.records.length,1);assert.deepEqual(file.records[0].messages.map(m=>m.text),['First unsaved','answer First unsaved','Second unsaved','answer Second unsaved']);const id=file.records[0].id;
 const layout=await evaluate("(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height}};return {recovery:box('.ai-save-recovery'),composer:box('.ai-composer-wrap'),buttons:[...document.querySelectorAll('.ai-save-recovery button')].map(e=>e.getBoundingClientRect().height)}})()");
 assert(layout.buttons.every(h=>h>=44));assert(layout.composer.top>=layout.recovery.bottom-1);record('layout',layout);writeFileSync(join(output,process.env.AI_SCREENSHOT??'390px.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await evaluate('window.probe.deny(false)');await clickText('Retry save');let rows=JSON.parse(await evaluate('window.probe.raw()'));assert.equal(rows.length,1);assert.equal(rows[0].id,id);assert.equal(rows[0].messages.length,4);
 await input('.ai-input','Third recovered send');await click('[aria-label="Send"]');await delay(100);rows=JSON.parse(await evaluate('window.probe.raw()'));assert.equal(rows.length,1);assert.equal(rows[0].id,id);assert.equal(rows[0].messages.length,6);record('seed-latest-stable-retry-and-send',{pass:true});
 await evaluate('window.probe.deny(true)');await input('.ai-input','Conflict draft');await click('[aria-label="Send"]');await delay(100);await evaluate('window.probe.deny(false)');const external=await evaluate('window.probe.external()');await clickText('Retry save');assert.equal(await evaluate('window.probe.raw()'),external);assert((await evaluate("document.querySelector('[role=alert]').textContent")).includes('newer stored data'));
 const conflict=await download('Export draft','actual-conflict-download');assert.equal(conflict.records[0].messages.at(-1).text,'answer Conflict draft');
 const b=await evaluate('window.probe.switchB()');await delay(100);const files=readdirSync(downloads);await clickText('Retry save');await clickText('Export draft');assert.deepEqual(readdirSync(downloads),files);assert.equal(await evaluate('window.probe.raw()'),external);assert.equal(await evaluate('window.probe.bRaw()'),b);assert((await evaluate("document.querySelector('[role=alert]').textContent")).includes('Export failed'));record('conflict-and-owner',{pass:true});
 record('PASS',{scope:'author verification, actual module/native Storage/downloaded JSON; synthetic stream only'});
}finally{writeFileSync(join(output,process.env.AI_LOG??'native.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

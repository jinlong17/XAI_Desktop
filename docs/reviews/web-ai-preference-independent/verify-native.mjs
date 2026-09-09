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
const sourceCommit=process.env.AI_REF??'24da17d';
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
 for (const pref of ['insights','voice']) {
  await evaluate(`window.probe.reset()`);await delay(150);
  const selector=pref==='insights'?'.ai-insights-toggle':'button[aria-label="Voice off"]';
  const state=()=>evaluate(`window.probe.state(${JSON.stringify(pref)})`);
  await evaluate(`window.probe.deny(true)`);await click(selector);
  assert.equal((await state()).raw,pref==='insights'?'true':'false');
  assert.equal((await state()).on,pref==='insights');
  assert(await evaluate("!!document.querySelector('[role=alert]')"));
  const file=await download('Export draft',pref+'-pending-json');
  assert.deepEqual(file.preferences[pref],{value:pref!=='insights',baseline:pref==='insights'?'true':'false'});
  await evaluate('window.probe.deny(false)');await clickText('Retry save');
  assert.equal((await state()).raw,pref==='insights'?'false':'true');
  assert.equal((await state()).on,pref!=='insights');
  assert.equal((await state()).writes,1);record(pref+'-quota-exact-desired-retry',{pass:true});
 }
 for(const pref of ['insights','voice']) {
  await evaluate('window.probe.reset()');await delay(150);
  await evaluate(`window.probe.external(${JSON.stringify(pref)})`);
  await click(pref==='insights'?'.ai-insights-toggle':'button[aria-label="Voice off"]');
  assert(await evaluate("!!document.querySelector('[role=alert]')"));
  await clickText('Retry save');
  assert.equal((await evaluate(`window.probe.state(${JSON.stringify(pref)})`)).writes,0);
  await clickText('Discard unsaved content');
  const state=await evaluate(`window.probe.state(${JSON.stringify(pref)})`);
  record(pref+'-discard-observation',state);
  assert.equal(state.on,pref!=='insights','Discard must display current stored preference');
  assert.equal(state.raw,pref==='insights'?'false':'true');assert.equal(state.writes,0);
  assert.equal(await evaluate("!!document.querySelector('[role=alert]')"),false);
  record(pref+'-first-external-conflict-discard',{pass:true});
 }
 await evaluate('window.probe.reset()');await delay(150);
 await evaluate('window.probe.deny(true)');await click('.ai-insights-toggle');await click('button[aria-label="Voice off"]');
 await evaluate('window.probe.deny(false);window.probe.switchB()');await delay(100);
 const files=readdirSync(downloads);
 await clickText('Retry save');await clickText('Export draft');await clickText('Discard unsaved content');
 await click('.ai-insights-toggle');await click('button[aria-label="Voice off"]');
 assert.deepEqual(readdirSync(downloads),files);
 assert.deepEqual(await evaluate('window.probe.deviceValues()'),['true','false']);
 assert.equal(await evaluate('window.probe.writes()'),0);
 assert(await evaluate("!!document.querySelector('[role=alert]')"));
 record('old-owner-retry-export-discard-toggle-rejected',{pass:true});
 record('PASS',{scope:'actual AI Module + native Storage; 2 exact downloaded pending preference JSON files; device keys remain device-owned'});

}finally{writeFileSync(join(output,process.env.AI_LOG??'native.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

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
const sourceCommit=process.env.AUTH_VERIFY_REF??'ab8c35a';
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
const host=readFileSync(join(snapshot,'apps/web/src/providers/AppProviders.tsx'),'utf8');const bridge=host.match(/function AccountDeletionRecoveryBridge\(\) \{[\s\S]*?\n\}/)?.[0]??'function AccountDeletionRecoveryBridge(){return <AccountDeletionRecoveryNotice/>}';
const source=readFileSync(new URL('./native-auth.tsx',import.meta.url),'utf8').replace('/* HOST_BRIDGE */',bridge);
let server,browser,socket;let serverDeletes=0;
const log=[];const record=(name,data)=>{log.push({name,...data});console.log(name,JSON.stringify(data??{}));};
try{
 const bundle=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},bundle:true,plugins:[pinnedPackages],format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),loader:{'.svg':'dataurl'},define:{'import.meta.env':'{}'}});
 const js=bundle.outputFiles.find(f=>f.path.endsWith('.js')).text,css=bundle.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
 server=createServer((req,res)=>{if(req.url==='/functions/v1/account-delete'){serverDeletes++;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true}));return;}if(req.url.startsWith('/auth/v1/token')){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({access_token:'synthetic-B',refresh_token:'synthetic-refresh-B',token_type:'bearer',expires_in:86400,user:{id:'B',aud:'authenticated',role:'authenticated',email:'B@example.invalid',app_metadata:{},user_metadata:{},created_at:new Date().toISOString()}}));return;}res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><main id="app"></main><script type="module">'+js+'</script>');});
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
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
 for(let i=0;i<100;i++){if(await evaluate("!!window.probe&&!!document.querySelector('#auth')"))break;await delay(100);}
 assert(await evaluate("!!window.probe&&!!document.querySelector('#auth')"),'mounted managed provider');
 record('baseline',{head:execFileSync('git',['rev-parse',sourceCommit],{cwd:root,encoding:'utf8'}).trim(),requestedRef:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:390});
 const input=async(selector,value)=>{await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('missing input');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await delay(100);};
 const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await delay(100);};
 const reset=async()=>{await evaluate('window.verify.reset()');await delay(150);};
 const waitFor=async expr=>{for(let i=0;i<100;i++){if(await evaluate(expr))return;await delay(100);}throw Error('timeout '+expr+' '+await evaluate('document.body.textContent'))};
 await waitFor("document.querySelector('#auth')?.textContent==='authenticated:A'");
 const captured=await evaluate('window.probe.auth()');await evaluate("window.probe.seedBusiness();window.probe.fault('revoke')");await click('#delete');await waitFor("document.querySelector('#delete-state')?.textContent==='failure'");
 const receipt=await evaluate('window.probe.receipt()');const active=await evaluate('window.probe.active()');assert.equal(active.owner,'A');assert.equal(serverDeletes,1);record('native-revoke-failure',{receipt,active,serverDeletes});writeFileSync(join(output,process.env.AUTH_EXPECT_FIXED==='1'?'390px-auth-failure-after.png':'390px-auth-failure-before.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await cdp('Page.reload');await delay(800);await waitFor('!!window.probe');const receipts=await evaluate('window.probe.pending()');
 if(process.env.AUTH_EXPECT_FIXED!=='1'){assert.equal(receipt.phase,'complete');assert.equal(receipts.length,0);record('before-defect',{pass:true,problem:'auth revoke aborted but receipt complete; reload has no retry'});}
 else {
 assert.equal(receipt.version,2);assert.equal(receipt.authGeneration,captured.generation);assert.notEqual(receipt.phase,'complete');assert.equal(receipts.length,1);assert(await evaluate("!!document.querySelector('.account-deletion-recovery button')"));
 const login=await evaluate('window.probe.loginB()');assert.equal(login.status,'applied');await waitFor("document.querySelector('#auth')?.textContent==='authenticated:B'");const b=await evaluate('window.probe.active()');await evaluate('window.probe.seedBusiness()');const bRaw=await evaluate('window.probe.businessRaw()');assert(bRaw);const bSession=await evaluate('window.probe.sessionRaw()');assert(bSession);
 await click('.account-deletion-recovery button');await waitFor("window.probe.receipt().phase==='complete'");assert.deepEqual(await evaluate('window.probe.active()'),b);assert.equal(await evaluate('window.probe.owner()'),'B');assert.equal(await evaluate('window.probe.businessRaw()'),bRaw);assert.equal(await evaluate('window.probe.sessionRaw()'),bSession);assert((await evaluate('window.probe.rows()')).some(r=>r.owner==='A'&&r.state==='revoked')); assert.equal(serverDeletes,1);record('reload-B-retry',{pass:true,businessAndSdkSessionBytePreserved:true,capturedA:captured.generation,B:b,serverDeletes});
 await evaluate("window.probe.fault('complete')");await click('#delete');await waitFor("document.querySelector('#delete-state')?.textContent==='failure'");const rb=await evaluate("window.probe.receipt('B')");assert.notEqual(rb.phase,'complete');assert.equal(await evaluate('window.probe.active()'),null);assert.equal(serverDeletes,2);
 await cdp('Page.reload');await delay(800);await waitFor('!!window.probe');await click('.account-deletion-recovery button');await waitFor("window.probe.receipt('B').phase==='complete'");assert.equal(await evaluate('window.probe.active()'),null);assert.equal(serverDeletes,2);record('final-receipt-quota-reload',{pass:true,serverDeletes,phaseBeforeReload:rb.phase});
 const v1=await evaluate('window.probe.v1()');assert.equal(v1.calls,0);assert.equal(v1.receipt.version,1);assert.equal(v1.receipt.phase,'complete');assert.equal(v1.receipt.authGeneration,undefined);
 const missing=await evaluate('window.probe.missing()');assert.equal(missing.version,2);assert.equal(missing.phase,'pending');await evaluate('window.probe.clearMissing()');record('v1-v2-boundaries',{pass:true,legacyNoInventedAuth:true,v2MissingParticipantRemainsPending:true});
 }
}finally{writeFileSync(join(output,process.env.AUTH_VERIFY_LOG??'native.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

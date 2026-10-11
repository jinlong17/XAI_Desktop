/** Independent native Chrome intent fault probe. All account/session/server fixtures synthetic. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync,mkdirSync,readFileSync,readdirSync,writeFileSync,symlinkSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';import {join} from 'node:path';import {fileURLToPath} from 'node:url';
import {spawn,execFileSync} from 'node:child_process';import {createServer} from 'node:http';
const root=fileURLToPath(new URL('../../../',import.meta.url));const output=fileURLToPath(new URL('./',import.meta.url));
const commit=process.env.REL06_VERIFY_REF??'762778c33226b072c2ca2030aa0a7051a7dbe952';
const directory=mkdtempSync(join(tmpdir(),'xai-rel06-intent-')),snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',commit],{cwd:root,maxBuffer:100*1024*1024})});symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();for(const name of readdirSync(join(snapshot,'packages'))){try{const folder=join(snapshot,'packages',name),pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}}
const pinned={name:'pinned',setup(build){build.onResolve({filter:/^@repo\//},args=>{const p=args.path.split('/'),entry=aliases.get(p.slice(0,2).join('/'));if(!entry)return;let target=entry.pkg.exports?.[p.length>2?'./'+p.slice(2).join('/'):'.'];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error(args.path);return {path:join(entry.folder,target)};});}};
const source=`
import React from './packages/plugin-web-settings-rest/node_modules/react/index.js';import {createRoot} from './packages/plugin-web-settings-rest/node_modules/react-dom/client.js';
import {WebAuthSessionProvider} from './packages/web-auth-device-session/src/session.tsx';
import {accountScope,generationKey} from './packages/plugin-web-storage/src/index.ts';
import {useAccountDeleteOrchestrator} from './packages/plugin-web-settings-rest/src/internal/useAccountDeleteOrchestrator.ts';
import {AccountDeletionRecoveryNotice} from './packages/plugin-web-settings-rest/src/AccountDeletionRecoveryNotice.tsx';
import {hasUnconfirmedAccountDeletion} from './packages/plugin-web-settings-rest/src/internal/accountDeletionIntent.ts';
import {FunctionsHttpError} from './packages/web-auth-device-session/node_modules/@supabase/supabase-js';
const scenario=new URL(location.href).searchParams.get('case'),assert=(c,m)=>{if(!c)throw Error(m)},wait=()=>new Promise(r=>setTimeout(r,75));
const aKey=generationKey('A-fixture','g1','xai_task_cols'),bKey=generationKey('B-fixture','g2','xai_task_cols');
const intentKey='xai:account:v1:A-fixture:deletion-intent',receiptKey='xai:account:v1:A-fixture:deleted';
const serverCount=()=>Number(localStorage.getItem('probe-server-count')??0);const set=Storage.prototype.setItem;
const finish=(ok,details)=>fetch('/result',{method:'POST',body:JSON.stringify({scenario,ok,...details})});
let orchestrator;const Probe=()=>{orchestrator=useAccountDeleteOrchestrator();return React.createElement('p',null,orchestrator.state);};
(async()=>{
 if(localStorage.getItem('probe-reloaded')){
  assert(accountScope.capture().kind==='locked','fresh authless scope');accountScope.activate(accountScope.lock('B-fixture'),'g2');
  createRoot(document.getElementById('app')).render(React.createElement(AccountDeletionRecoveryNotice));await wait();
  const text=document.getElementById('app').textContent;
  assert(text.includes('no confirmed server outcome'),'unknown notice after reload');assert(!text.includes('A-fixture')&&!text.includes('A-private'),'no owner/content exposure');assert(!document.querySelector('button'),'unknown notice cannot retry local erasure');
  assert(localStorage.getItem(aKey)==='A-private'&&localStorage.getItem(bKey)==='B-private','both account data retained');assert(localStorage.getItem(receiptKey)===null,'no tombstone from unknown result');
  const raw=localStorage.getItem(intentKey);assert(raw&&!raw.includes('fixture-token'),'metadata contains no bearer token');const count=serverCount();await wait();assert(serverCount()===count,'reload notice does not retry server');
  await finish(true,{serverCalls:count,unknownAfterReload:true,BPreserved:true,tokenAbsent:true});return;
 }
 localStorage.setItem(aKey,'A-private');localStorage.setItem(bKey,'B-private');accountScope.activate(accountScope.lock('A-fixture'),'g1');
 if(scenario==='first-write-denied'||scenario==='receipt-write-denied')Storage.prototype.setItem=function(k,v){if(k===(scenario==='first-write-denied'?intentKey:receiptKey))throw new DOMException('Synthetic storage failure','QuotaExceededError');return set.call(this,k,v);};
 const session={user:{id:'A-fixture'},access_token:'fixture-token-A'};
 const client={auth:{getSession:async()=>({data:{session},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>{throw Error('unexpected signOut')}},functions:{invoke:async()=>{
  const raw=localStorage.getItem(intentKey);assert(raw&&JSON.parse(raw).phase==='server-outcome-unknown','durable intent before server');assert(!raw.includes('fixture-token'),'intent excludes token');set.call(localStorage,'probe-server-count',String(serverCount()+1));
  if(scenario==='receipt-write-denied')return {error:null,data:{success:true}};
  if(scenario==='retry-unauthorized'&&serverCount()===2)return {error:new FunctionsHttpError(new Response('{}',{status:401})),data:null};
  throw new TypeError('Synthetic response lost after possible mutation');
 }}};
 createRoot(document.getElementById('app')).render(React.createElement(WebAuthSessionProvider,{client,deviceStore:{get:async()=>null,ensure:async()=>'device'}},React.createElement(Probe)));
 await wait();await orchestrator.submit();await wait();assert(orchestrator.state==='failure','visible failure');assert(localStorage.getItem(aKey)==='A-private'&&localStorage.getItem(bKey)==='B-private','data retained');assert(!localStorage.getItem(receiptKey),'no destructive receipt');
 if(scenario==='first-write-denied'){assert(serverCount()===0,'no server invocation if first intent write denied');await finish(true,{serverCalls:0,dataRetained:true});return;}
 assert(hasUnconfirmedAccountDeletion(),'first failed result remains unknown');
 if(scenario==='retry-unauthorized'){
  const first=localStorage.getItem(intentKey);await orchestrator.submit();await wait();
  const second=localStorage.getItem(intentKey);assert(hasUnconfirmedAccountDeletion(),'first uncertain deletion must survive subsequent unauthorized retry');assert(second===first,'original uncertain intent retained byte-for-byte');assert(serverCount()===1,'retry blocked before second server request');
  await finish(true,{serverCalls:serverCount(),unknownRetained:true,firstIntent:first,finalIntent:second});return;
 }
 Storage.prototype.setItem=set;localStorage.setItem('probe-reloaded','yes');location.reload();
})().catch(error=>finish(false,{error:String(error.stack),serverCalls:serverCount(),remainingIntent:localStorage.getItem(intentKey)}));
`;
let server,browser,timer,receive;const results=[];
try{
 const bundled=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},plugins:[pinned],bundle:true,format:'esm',platform:'browser',write:false,loader:{'.css':'empty','.svg':'dataurl'},define:{'import.meta.env':'{}'}});
 server=createServer((req,res)=>{if(req.url==='/result'){let body='';req.on('data',c=>body+=c);req.on('end',()=>{res.end('ok');receive(JSON.parse(body));});}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><div id="app"></div><script type="module">'+bundled.outputFiles[0].text+'</script>');}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 for(const scenario of ['first-write-denied','response-lost','receipt-write-denied','retry-unauthorized']){
  const completed=new Promise((resolve,reject)=>{receive=resolve;timer=setTimeout(()=>reject(Error('Timeout '+scenario)),15000);});
  browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,scenario),'http://127.0.0.1:'+server.address().port+'/?case='+scenario],{stdio:'ignore'});
  const result=await completed;clearTimeout(timer);results.push(result);console.log(JSON.stringify({commit,...result}));browser.kill('SIGTERM');await new Promise(r=>setTimeout(r,350));browser.kill('SIGKILL');
 }
 if(results.some(r=>!r.ok))process.exitCode=1;
}finally{clearTimeout(timer);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();writeFileSync(join(output,process.env.REL06_VERIFY_LOG??'20260909-intent-before.log'),results.map(r=>JSON.stringify({commit,...r})).join('\n')+'\n');await new Promise(r=>setTimeout(r,350));browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

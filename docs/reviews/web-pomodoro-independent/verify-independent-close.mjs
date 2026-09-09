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
const sourceCommit=process.env.POMO_VERIFY_REF??'ce4b767';
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};
const delay=ms=>new Promise(r=>setTimeout(r,ms));let browser,server;let stage=0,receive;const paused=process.env.POMO_CLOSE_PAUSED==='1';const logs=[];
try{
 const source=readFileSync(new URL('./close-independent.ts',import.meta.url),'utf8');const bundle=await build({stdin:{contents:source,resolveDir:snapshot,loader:'ts'},bundle:true,plugins:[pinnedPackages],format:'iife',platform:'browser',write:false,define:{'import.meta.env':'{}'},loader:{'.css':'empty'}});
 server=createServer((req,res)=>{if(req.url==='/result'){let body='';req.on('data',x=>body+=x);req.on('end',()=>{res.end('ok');receive(JSON.parse(body))})}else{res.setHeader('Content-Type','text/html');res.end('<script>window.stage='+stage+';window.pauseFixture='+paused+';'+bundle.outputFiles[0].text+'</script>')}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const launch=()=>spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--disable-background-networking','--user-data-dir='+join(directory,'profile'),'http://127.0.0.1:'+server.address().port],{stdio:'ignore'});
 let original,firstHistory;
 for(stage=0;stage<3;stage++){let timer;const result=new Promise((resolve,reject)=>{receive=x=>{clearTimeout(timer);resolve(x)};timer=setTimeout(()=>reject(Error('native close timeout')),15000)});browser=launch();const row=await result;assert(!row.error,JSON.stringify(row));if(stage===0){original=row.source;assert(original.sessionId);assert.equal(original.phase,paused?'paused':'running')}else if(paused){assert.deepEqual(row.active,original);assert.deepEqual(row.history,[])}else{assert.equal(row.active,null);assert.equal(row.history.length,1);const record=row.history[0];assert.equal(record.id,original.sessionId);assert.equal(record.startedAt,original.sessionStartedAt);assert.equal(Date.parse(record.finishedAt),original.deadline);assert.equal(Date.parse(record.deadline),original.deadline);assert.equal(record.elapsedMs,1500);assert.equal(record.durationMs,1500);assert.equal(record.completed,true);assert(Date.parse(record.recordedAt)>original.deadline);if(firstHistory)assert.deepEqual(row.history,firstHistory);firstHistory=row.history}logs.push(row);await new Promise(r=>{browser.once('exit',r);browser.kill('SIGTERM')});if(stage===0)await delay(2200)}
 logs.push({pass:true,sourceCommit,realClosedMs:2200,repeatFullProcessReopen:true});console.log(JSON.stringify(logs));
}finally{writeFileSync(join(output,process.env.POMO_CLOSE_LOG??(paused?'20260909-independent-paused-close.log':'20260909-independent-whole-close.log')),logs.map(x=>JSON.stringify(x)).join('\n')+'\n');browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);rmSync(directory,{recursive:true,force:true})}

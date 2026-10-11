/** Isolated real Chromium verification: no user profile, credentials, or network. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-settings-rel03-recovery-'));
const source = `
import React from './packages/plugin-web-settings-rest/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-settings-rest/node_modules/react-dom/client.js';
import {accountScope,generationKey} from './packages/plugin-web-storage/src/index.ts';
import {AccountDeletionRecoveryNotice} from './packages/plugin-web-settings-rest/src/AccountDeletionRecoveryNotice.tsx';
import {beginAccountLocalDeletion,readAccountDeletionReceipt} from './packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts';
import {createIndexedDbStore} from './packages/web-auth-device-session/src/storage.ts';
const assert=(c,m)=>{if(!c)throw Error(m);};const wait=()=>new Promise(r=>setTimeout(r,100));
const aKey=generationKey('A-fixture','g1','xai_task_cols');const bKey=generationKey('B-fixture','g2','xai_task_cols');
const secretKey=(id)=>'scoped:v2:'+encodeURIComponent(JSON.stringify(['account',id,'g1','openai']));
(async()=>{
 const secrets=createIndexedDbStore({dbName:'xai-web-ai-secrets',storeName:'secrets'});
 if(!localStorage.getItem('verification-reloaded')){
  localStorage.setItem(aKey,'A data');localStorage.setItem(bKey,'B data');localStorage.setItem('xai_task_cols','unowned');localStorage.setItem('xai_lang','zh');
  await secrets.setItem(secretKey('A-fixture'),'A opaque ciphertext');await secrets.setItem(secretKey('B-fixture'),'B opaque ciphertext');await secrets.setItem('openai','unowned opaque ciphertext');
  beginAccountLocalDeletion(accountScope.activate(accountScope.lock('A-fixture'),'g1'));
  localStorage.setItem('verification-reloaded','yes');location.reload();return;
 }
 assert(accountScope.capture().kind==='locked','fresh page starts unauthenticated');
 const container=document.createElement('main');document.body.append(container);const root=createRoot(container);root.render(React.createElement(AccountDeletionRecoveryNotice,{lang:'en'}));await wait();
 assert(container.textContent.includes('previous account removal'),'notice survived full page reload');assert(!container.textContent.includes('A-fixture')&&!container.textContent.includes('A data'),'notice exposes no owner/content');
 accountScope.activate(accountScope.lock('B-fixture'),'g2');
 container.querySelector('button').click();
 for(let i=0;i<100&&readAccountDeletionReceipt('A-fixture')?.phase!=='complete';i++)await wait();
 assert(readAccountDeletionReceipt('A-fixture')?.phase==='complete','native cleanup completed');
 assert(localStorage.getItem(aKey)===null,'A content removed');assert(localStorage.getItem(bKey)==='B data','B content preserved');assert(localStorage.getItem('xai_task_cols')==='unowned'&&localStorage.getItem('xai_lang')==='zh','archive/device preserved');
 assert(await secrets.getItem(secretKey('A-fixture'))===null,'A native IDB ciphertext removed');assert(await secrets.getItem(secretKey('B-fixture'))==='B opaque ciphertext','B native IDB preserved');assert(await secrets.getItem('openai')==='unowned opaque ciphertext','unowned IDB preserved');
 assert(accountScope.capture().accountId==='B-fixture','B remains current');await wait();assert(!container.querySelector('button'),'notice cleared after actual completion');root.unmount();
 await fetch('/result',{method:'POST',body:'PASS real Chromium full-page reload and native IndexedDB/LS deletion recovery; signed-out notice, later B preserved, legacy/device preserved, metadata complete only after cleanup'});
})().catch(e=>fetch('/result',{method:'POST',body:'FAIL '+e.stack}));
`;
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:root,loader:'tsx'},bundle:true,format:'iife',platform:'browser',write:false,loader:{'.css':'empty','.svg':'dataurl'},define:{'import.meta.env':'{}'}});
 let receive;
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('Browser verification timed out after 20s')),20000);});
 server=createServer((req,res)=>{
  if(req.url==='/result'){let text='';req.on('data',chunk=>text+=chunk);req.on('end',()=>{res.end('ok');receive(text);});}
  else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><body>Test<script>'+bundle.outputFiles[0].text+'</script>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
 browser.on('error',error=>receive('FAIL '+error.message));
 const result=await finished;
 console.log(result);if(typeof result!=='string'||!result.startsWith('PASS '))throw Error(String(result));
} finally {
 clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();
 await new Promise(resolve=>setTimeout(resolve,500));
 if(browser && browser.exitCode===null) browser.kill('SIGKILL');
 rmSync(directory,{recursive:true,force:true});
}

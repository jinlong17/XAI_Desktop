/** Isolated real Chromium verification: no user profile, credentials, or network. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-rel02-browser-'));
const source = `
import { createIndexedDbStore } from './packages/web-auth-device-session/src/storage.ts';
const assert = (condition, message) => { if (!condition) throw Error(message); };
const open = (version, store) => new Promise((resolve,reject) => {
 const r = indexedDB.open('xai-web-auth', version);
 r.onupgradeneeded = () => { if(store) r.result.createObjectStore(store); };
 r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
 r.onblocked = () => reject(Error('unexpected open block'));
});
const clear = () => new Promise((resolve,reject) => {
 const r=indexedDB.deleteDatabase('xai-web-auth');
 r.onsuccess=resolve; r.onerror=()=>reject(r.error); r.onblocked=()=>reject(Error('leaked connection'));
});
(async () => {
 let count=0;
 for(const order of ['session-first','device-first','concurrent']) {
  await clear();
  const s=createIndexedDbStore(); const d=createIndexedDbStore({storeName:'device'});
  if(order==='session-first'){await s.setItem('token','A');await d.setItem('id','B');}
  if(order==='device-first'){await d.setItem('id','B');await s.setItem('token','A');}
  if(order==='concurrent')await Promise.all([s.setItem('token','A'),d.setItem('id','B')]);
  assert(await s.getItem('token')==='A',order+' session');assert(await d.getItem('id')==='B',order+' device');
  const db=await open();assert(db.version===2 && db.objectStoreNames.length===2,order+' schema');db.close();count++;
 }
 for(const name of ['session','device']) {
  await clear();const db=await open(1,name);
  await new Promise((resolve,reject)=>{const tx=db.transaction(name,'readwrite');tx.objectStore(name).put('old','legacy');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
  const store=createIndexedDbStore({storeName:name});assert(await store.getItem('legacy')==='old',name+' migration');
  const other=createIndexedDbStore({storeName:name==='session'?'device':'session'});await other.setItem('new','new');
  assert(await store.getItem('legacy')==='old',name+' preserve');count++;
 }
 await clear();await fetch('/result',{method:'POST',body:'PASS '+count});
})().catch(e=>{fetch('/result',{method:'POST',body:'FAIL '+e.stack});});
`;
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:root,loader:'ts'},bundle:true,format:'iife',platform:'browser',write:false});
 let receive;
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('Browser verification timed out after 20s')),20000);});
 server=createServer((req,res)=>{
  if(req.url==='/result'){let text='';req.on('data',chunk=>text+=chunk);req.on('end',()=>{res.end('ok');receive(text);});}
  else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><body>Test<script>'+bundle.outputFiles[0].text+'</script>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 browser=spawn(process.env.CHROME_BINARY || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
 browser.on('error',error=>receive('FAIL '+error.message));
 const result=await finished;
 if(result!=='PASS 5')throw Error(String(result));
 console.log('PASS 5 real Chromium IndexedDB scenarios: both orders, concurrent initialization, both v1 migrations; real native IndexedDB; isolated temporary profile.');
} finally {
 clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();
 await new Promise(resolve=>setTimeout(resolve,500));
 if(browser && browser.exitCode===null) browser.kill('SIGKILL');
 rmSync(directory,{recursive:true,force:true});
}

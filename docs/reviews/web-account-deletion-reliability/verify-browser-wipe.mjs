/** Isolated real Chromium verification: no user profile, credentials, or network. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-rel06-wipe-'));
const source = `
import {wipeRegisteredIDB,ACCOUNT_LOCAL_WIPE_IDB_NAMES} from './packages/web-auth-device-session/src/wipe.ts';
const assert=(value,message)=>{if(!value)throw Error(message)};
(async()=>{
 const frame=document.createElement('iframe');
 const held=new Promise(resolve=>window.addEventListener('message',function ready(event){if(event.data==='held'){window.removeEventListener('message',ready);resolve();}}));
 frame.src='/holder';document.body.append(frame);await held;
 let failure;try{await wipeRegisteredIDB();}catch(error){failure=error;}
 assert(failure instanceof AggregateError,'blocked deletion must reject');
 assert(failure.errors.some(error=>error.message.includes('xai-web-ai-secrets')&&error.message.includes('blocked')),'blocked store must be identified');
 frame.contentWindow.postMessage('release','*');
 await wipeRegisteredIDB();
 for(const name of ACCOUNT_LOCAL_WIPE_IDB_NAMES){
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(name);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  assert(db.objectStoreNames.length===0,'store still exists after confirmed wipe');db.close();
 }
 await fetch('/result',{method:'POST',body:'PASS'});
})().catch(error=>fetch('/result',{method:'POST',body:'FAIL '+error.stack}));
`;
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:root,loader:'ts'},bundle:true,format:'iife',platform:'browser',write:false});
 let receive;
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('Browser verification timed out after 20s')),20000);});
 server=createServer((req,res)=>{
  if(req.url==='/result'){let text='';req.on('data',chunk=>text+=chunk);req.on('end',()=>{res.end('ok');receive(text);});}
  else if(req.url==='/holder'){res.setHeader('Content-Type','text/html');res.end(`<script>const r=indexedDB.open('xai-web-ai-secrets',1);let db;r.onupgradeneeded=()=>r.result.createObjectStore('held');r.onsuccess=()=>{db=r.result;parent.postMessage('held','*')};addEventListener('message',event=>{if(event.data==='release')db.close()});</script>`);}
  else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><body>Test<script>'+bundle.outputFiles[0].text+'</script>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 browser=spawn(process.env.CHROME_BINARY || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
 browser.on('error',error=>receive('FAIL '+error.message));
 const result=await finished;
 if(result!=='PASS')throw Error(String(result));
 console.log('PASS native Chromium blocked legacy wipe rejects; second page context releases its connection; retry confirms every named database empty. Isolated profile only, not account cleanup acceptance.');
} finally {
 clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();
 await new Promise(resolve=>setTimeout(resolve,500));
 if(browser && browser.exitCode===null) browser.kill('SIGKILL');
 rmSync(directory,{recursive:true,force:true});
}

/** Isolated real Chromium verification: no user profile, credentials, or network. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-rel02-browser-'));
const source = "\nimport React from './packages/plugin-web-storage/node_modules/react/index.js';\nimport {createRoot} from './packages/plugin-web-storage/node_modules/react-dom/client.js';\nimport {AccountDataGate} from './packages/plugin-web-storage/src/AccountDataGate.tsx';\nimport {accountScope,createScopedStorage} from './packages/plugin-web-storage/src/internal/accountScope.ts';\nimport {aiKeyStorage,aiSecretMigrationParticipant} from './packages/plugin-web-ai-chat/src/internal/secretStore.ts';\nconst delay=()=>new Promise(r=>setTimeout(r,70));\nconst assert=(condition,message)=>{if(!condition)throw Error(message);};\nconst container=document.createElement('div');document.body.append(container);const root=createRoot(container);\nconst privateReads=[];\nfunction Content(){const text=createScopedStorage(localStorage).getItem('xai_task_cols');privateReads.push(text);return React.createElement('p',{'data-private':true},text||'empty workspace');}\nasync function show(id){root.render(React.createElement(AccountDataGate,{authenticated:true,accountId:id,secrets:aiSecretMigrationParticipant},React.createElement(Content)));await delay();}\nasync function click(text){let button;for(let i=0;i<70;i++){button=[...container.querySelectorAll('button')].find(b=>b.textContent===text&&!b.disabled);if(button)break;await delay();}assert(button,'Missing '+text+'; UI: '+container.textContent);button.click();await delay();}\n(async()=>{\n localStorage.setItem('xai_task_cols','PRIVATE UNOWNED FIXTURE');accountScope.lock();await show('account-A');\n assert(!container.textContent.includes('PRIVATE UNOWNED FIXTURE'),'legacy data displayed');assert(privateReads.length===0,'business mounted before choice');\n const layout={viewport:innerWidth,scroll:document.documentElement.scrollWidth,buttonHeights:[...container.querySelectorAll('button')].map(b=>b.getBoundingClientRect().height)};\n assert(layout.scroll<=layout.viewport,'horizontal overflow');assert(layout.buttonHeights.every(h=>h>=44),'small tap target');\n await click('Start without importing');await click('Continue to workspace');\n const a=createScopedStorage(localStorage);a.setItem('xai_task_cols','A PRIVATE DATA');await aiKeyStorage.saveKey('openai','synthetic-key-A');\n await show('account-B');assert(!container.querySelector('[data-private]'),'old workspace stayed mounted');\n let staleBlocked=false;try{a.setItem('xai_task_cols','late write');}catch{staleBlocked=true;}assert(staleBlocked,'old setter not revoked');\n await click('Start without importing');await click('Continue to workspace');\n assert(privateReads.at(-1)===null,'B read A data');assert(await aiKeyStorage.loadKey('openai')===null,'B read A secret');\n createScopedStorage(localStorage).setItem('xai_task_cols','B PRIVATE DATA');\n await show('account-A');assert(privateReads.at(-1)==='A PRIVATE DATA','A data did not restore');assert(await aiKeyStorage.loadKey('openai')==='synthetic-key-A','A secret did not restore');\n assert(localStorage.getItem('xai_task_cols')==='PRIVATE UNOWNED FIXTURE','legacy destroyed');\n await fetch('/result',{method:'POST',body:JSON.stringify({pass:true,layout,checks:['legacy hidden','explicit empty','epoch revocation','A/B content isolation','A/B encrypted key isolation','A restore','legacy retained']})});\n})().catch(e=>fetch('/result',{method:'POST',body:'FAIL '+e.stack}));\n";
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:root,loader:'tsx'},bundle:true,format:'iife',platform:'browser',write:false,define:{'import.meta.env':'{}'},loader:{'.css':'empty','.svg':'dataurl'}});
 let receive;
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('Browser verification timed out after 20s')),20000);});
 server=createServer((req,res)=>{
  if(req.url==='/result'){let text='';req.on('data',chunk=>text+=chunk);req.on('end',()=>{res.end('ok');receive(text);});}
  else if(req.url==='/frame'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><style>body{margin:0}*{box-sizing:border-box}'+readFileSync(join(root,'packages/plugin-web-storage/src/AccountDataGate.css'),'utf8')+'</style><body><script>'+bundle.outputFiles[0].text+'</script>');}
  else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><body style="margin:0"><iframe src="/frame" style="width:390px;height:844px;border:0"></iframe>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 browser=spawn(process.env.CHROME_BINARY || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--window-size=390,844','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
 browser.on('error',error=>receive('FAIL '+error.message));
 const result=await finished;
 if(typeof result!=='string'||!result.startsWith('{')||!JSON.parse(result).pass)throw Error(String(result));
 console.log(result);
} finally {
 clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();
 await new Promise(resolve=>setTimeout(resolve,500));
 if(browser && browser.exitCode===null) browser.kill('SIGKILL');
 rmSync(directory,{recursive:true,force:true});
}

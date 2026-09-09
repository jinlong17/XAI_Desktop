/** Isolated real Chromium verification: no user profile, credentials, or network. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-rel03-joint-browser-'));
const source = readFileSync(join(root,'docs/reviews/web-account-data-isolation/joint-browser-probe.ts'),'utf8');
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:join(root,'docs/reviews/web-account-data-isolation'),loader:'tsx'},bundle:true,format:'iife',platform:'browser',write:false,define:{'import.meta.env':'{}'},loader:{'.css':'empty','.svg':'dataurl'}});
 let receive;
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('Browser verification timed out after 60s')),60000);});
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

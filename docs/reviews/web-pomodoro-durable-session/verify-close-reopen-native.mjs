import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
const root=fileURLToPath(new URL('../../../',import.meta.url)), directory=mkdtempSync(join(tmpdir(),'pomo-closed-proof-'));
let browser,server,timeout;
try{
 const bundle=await build({stdin:{contents:readFileSync(join(root,'docs/reviews/web-pomodoro-durable-session/close-reopen-native.ts'),'utf8'),resolveDir:join(root,'docs/reviews/web-pomodoro-durable-session'),loader:'tsx'},bundle:true,format:'iife',platform:'browser',write:false,define:{'import.meta.env':'{}'},loader:{'.css':'empty'}});
 let checkpoint,receive;
 const ready=new Promise(resolve=>checkpoint=resolve);
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('close/reopen timeout')),45000);});
 server=createServer((req,res)=>{if(req.url==='/checkpoint'){req.resume();res.end('ok');checkpoint();}else if(req.url==='/result'){let value='';req.on('data',chunk=>value+=chunk);req.on('end',()=>{res.end('ok');receive(value);});}else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><body><script>'+bundle.outputFiles[0].text+'</script>');}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 const launch=()=>spawn(process.env.CHROME_BINARY||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
 browser=launch();await Promise.race([ready,finished]);
 await new Promise(resolve=>{browser.once('exit',resolve);browser.kill('SIGTERM');});
 // No browser process exists while the deadline passes.
 await new Promise(resolve=>setTimeout(resolve,2200));
 browser=launch();const result=await finished;if(!JSON.parse(result).pass)throw Error(result);console.log(result);
}finally{clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await new Promise(resolve=>setTimeout(resolve,500));if(browser&&browser.exitCode===null)browser.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

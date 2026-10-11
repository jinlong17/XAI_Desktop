import {build} from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import{fileURLToPath}from'node:url';import{spawn}from'node:child_process';import{createServer}from'node:http';
const root=fileURLToPath(new URL('../../../',import.meta.url)),dir=mkdtempSync(join(tmpdir(),'xai-habits-native-'));let browser,server,timer,origin;const pids=[];
function launch(){browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--window-size=390,844','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(dir,'profile'),origin],{stdio:'ignore'});pids.push(browser.pid);}
try{
 const built=await build({entryPoints:[join(root,'docs/reviews/web-habits-save-recovery/native-habits.tsx')],bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',nodePaths:[join(root,'apps/web/node_modules')],define:{'process.env.NODE_ENV':'"development"'},loader:{'.css':'empty'}});const bundle=built.outputFiles[0].text;const css=['packages/plugin-web-tokens/src/tokens.css','packages/plugin-web-tokens/src/layout.css','packages/xai-web-habits/src/styles.css'].map(path=>readFileSync(join(root,path),'utf8')).join('\n');
 let receive;const result=new Promise((resolve,reject)=>{receive=resolve;timer=setTimeout(()=>reject(Error('native Habits timed out')),60000);});
 server=createServer((req,res)=>{
  if(req.url==='/result'){let raw='';req.on('data',chunk=>raw+=chunk);req.on('end',()=>{res.end('ok');receive(JSON.parse(raw));});}
  else if(req.url==='/restart'){res.end('ok');setTimeout(async()=>{const old=browser;await new Promise(resolve=>{old.once('exit',resolve);old.kill('SIGTERM');setTimeout(()=>{if(old.exitCode===null)old.kill('SIGKILL');},1500);});launch();},100);}
  else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style><body><div id="root"></div><script>'+bundle+'</script>');}
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;launch();const outcome=await result;console.log(JSON.stringify({...outcome,pids},null,2));if(!outcome.pass)process.exitCode=1;
}finally{
 clearTimeout(timer);server?.closeAllConnections();server?.close();
 if(browser&&browser.exitCode===null)await new Promise(resolve=>{browser.once('exit',resolve);browser.kill('SIGTERM');setTimeout(()=>{if(browser.exitCode===null)browser.kill('SIGKILL');},1500).unref();});
 rmSync(dir,{recursive:true,force:true,maxRetries:8,retryDelay:150});
}

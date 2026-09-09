import {build} from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import{join}from'node:path';import{fileURLToPath}from'node:url';import{spawn}from'node:child_process';import{createServer}from'node:http';
const root=fileURLToPath(new URL('../../../',import.meta.url)),directory=mkdtempSync(join(tmpdir(),'xai-host-independent-'));
let browser,server,timeout,bundle,origin,slowResponse;const launches=[];
function launch(path){browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-popup-blocking','--user-data-dir='+join(directory,'profile'),origin+path],{stdio:'ignore'});launches.push(browser.pid);}const requests=[];
try{
 let receive;const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('native host timed out')),60000);});
 server=createServer((req,res)=>{
  if(req.url==='/probe/result'||req.url==='/probe/request'){let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{res.end('ok');if(req.url==='/probe/result')receive(body);else requests.push(JSON.parse(body));});}
  else if(req.url==='/probe/slow'){slowResponse=res;}
  else if(req.url==='/probe/slow-status'){res.end(JSON.stringify({pending:!!slowResponse}));}
  else if(req.url==='/probe/release'){slowResponse?.end('released');res.end('ok');}
  else if(req.url==='/probe/counts'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({exchanges:requests.filter(x=>x.url.includes('grant_type=pkce')).length,updates:requests.filter(x=>x.url.includes('/auth/v1/user')&&x.method==='PUT').length}));}
  else if(req.url==='/probe/restart'){res.end('restarting');setTimeout(async()=>{const old=browser;await new Promise(resolve=>{old.once('exit',resolve);old.kill('SIGTERM');setTimeout(()=>{if(old.exitCode===null)old.kill('SIGKILL');},2000);});launch('/app');},250);}
  else if(req.url.startsWith('/auth/v1/authorize')){const target=new URL(req.url,'http://127.0.0.1').searchParams.get('redirect_to');const url=new URL(target);url.searchParams.set('code','OAuthOwner');res.writeHead(302,{Location:url.toString()});res.end();}
  else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><body><div id="root"></div><script>'+bundle+'</script>');}
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 origin='http://127.0.0.1:'+server.address().port;
 const result=await build({entryPoints:[join(root,'docs/reviews/web-auth-host-independent/native-host.tsx')],nodePaths:[join(root,'apps/web/node_modules')],bundle:true,write:false,format:'iife',platform:'browser',define:{'import.meta.env':JSON.stringify({VITE_SUPABASE_URL:origin,VITE_SUPABASE_ANON_KEY:'synthetic',VITE_WEB_AUTH_MODE:'live',DEV:false,PROD:false,BASE_URL:'/'}),'process.env.NODE_ENV':'"development"'},loader:{'.css':'empty','.svg':'dataurl','.png':'dataurl','.woff2':'dataurl'},jsx:'automatic'});bundle=result.outputFiles[0].text;
 launch('/auth/login');
 const raw=await finished;const parsed=JSON.parse(raw);console.log(JSON.stringify({...parsed,launches,requests},null,2));if(!parsed.pass)process.exitCode=1;
}finally{clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await new Promise(resolve=>setTimeout(resolve,500));if(browser&&browser.exitCode===null)browser.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

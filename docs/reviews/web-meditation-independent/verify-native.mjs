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
const sourceCommit='6887879';
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};

const delay=ms=>new Promise(r=>setTimeout(r,ms));let server,browser,timer,origin;const pids=[];const sockets=[];
async function connect(peer=false){let port;for(let i=0;i<100;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();const target=targets.find(t=>t.type==='page'&&t.url.startsWith(origin)&&t.url.includes('?peer')===peer);if(!target){await delay(50);continue;}const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));sockets.push(ws);let id=0;const pending=new Map();ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});return (method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});ws.send(JSON.stringify({id:next,method,params}));});}catch{await delay(50);}}throw Error('CDP unavailable');}
function launch(){browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--window-size=390,844','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),origin],{stdio:'ignore'});pids.push(browser.pid);}
try{
const source=readFileSync(join(output,'native.tsx'),'utf8');const built=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic',nodePaths:[join(root,'apps/web/node_modules')],define:{'process.env.NODE_ENV':'"development"'},loader:{'.css':'empty'}});const bundle=built.outputFiles[0].text;const css=['packages/plugin-web-tokens/src/tokens.css','packages/plugin-web-tokens/src/layout.css','packages/xai-web-meditation/src/styles.css'].map(p=>readFileSync(join(snapshot,p),'utf8')).join('\n');
let receive;const result=new Promise((resolve,reject)=>{receive=resolve;timer=setTimeout(()=>reject(Error('timeout')),90000);});
server=createServer((req,res)=>{
 if(req.url==='/click'){let raw='';req.on('data',c=>raw+=c);req.on('end',async()=>{try{const {name}=JSON.parse(raw),cdp=await connect();await cdp('Page.bringToFront');const r=await cdp('Runtime.evaluate',{expression:`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(name)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`,returnByValue:true});const {x,y}=r.result.value;await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});res.end('ok');}catch(e){res.statusCode=500;res.end(String(e));receive({pass:false,error:String(e)});}});}

 else if(req.url==='/dualtab'){(async()=>{try{
 const port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);
 await fetch('http://127.0.0.1:'+port+'/json/new?'+encodeURIComponent(origin+'/?peer'),{method:'PUT'});
 const a=await connect(),b=await connect(true);
 const ev=async(cdp,expression)=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 for(let i=0;i<100;i++){if(await ev(b,'!!window.peer'))break;await delay(30);}
 // Isolate two controller-only views, preserving the real page / native lock boundary.
 const init=`(()=>{peer.scope.activate(peer.scope.lock('double'),'double');return true})()`;
 await ev(a,init);await ev(b,init);
 const prefs=await ev(a,"JSON.parse(localStorage.getItem([...Object.keys(localStorage)].find(k=>k.endsWith('xai_meditation_active')))).prefs");
 assert(await ev(a,`peer.controller.command('start',${JSON.stringify(prefs)})`));
 await ev(b,"peer.controller.command('reconcile')");
 assert(await ev(a,"peer.controller.command('pause')"));
 assert.equal(await ev(b,"peer.controller.command('pause')"),false);
 assert.equal(await ev(b,"peer.controller.getSnapshot().conflict"),true);
 assert(await ev(b,"peer.controller.command('resume')"));
 await ev(a,"peer.controller.command('reconcile')");
 assert.equal(await ev(a,`peer.controller.command('start',${JSON.stringify(prefs)})`),false);
 assert(await ev(a,"peer.controller.command('pause')"));
 await ev(b,"peer.controller.command('reconcile')");
 const before=await ev(a,'peer.row().revision');
 await Promise.all([ev(a,"peer.controller.command('end')"),ev(b,"peer.controller.command('end')")]);
 assert.equal(await ev(a,'peer.row().phase'),'ended');assert.equal(await ev(a,'peer.row().revision'),before+1);
 // Corrupt original bytes cannot seed a new session; no Web Locks cannot pretend save.
 await ev(a,"peer.scope.activate(peer.scope.lock('corrupt'),'corrupt');localStorage.setItem(peer.physical(),' { broken bytes ')");
 assert.equal(await ev(a,`peer.controller.command('start',${JSON.stringify(prefs)})`),false);
 assert.equal(await ev(a,'peer.controller.exportRecovery()'),' { broken bytes ');
 await ev(b,"peer.scope.activate(peer.scope.lock('no-lock'),'no-lock');Object.defineProperty(navigator,'locks',{value:undefined,configurable:true})");
 assert.equal(await ev(b,`peer.controller.command('start',${JSON.stringify(prefs)})`),false);assert.equal(await ev(b,'localStorage.getItem(peer.physical())'),null);
 res.end('ok');
 }catch(e){res.statusCode=500;res.end(String(e));}})();}
 else if(req.url==='/result'){let raw='';req.on('data',c=>raw+=c);req.on('end',()=>{res.end('ok');receive(JSON.parse(raw));});}
 else if(req.url==='/restart'){res.end('ok');setTimeout(async()=>{const old=browser;await new Promise(resolve=>{old.once('exit',resolve);old.kill('SIGTERM');setTimeout(()=>{if(old.exitCode===null)old.kill('SIGKILL');},1500);});launch();},100);}
 else{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>'+css+'</style><body><div id="root"></div><script>'+bundle+'</script>');}
});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;launch();const outcome=await result;const log={commit:sourceCommit,autoplayBypass:false,...outcome,pids};writeFileSync(join(output,'native.log'),JSON.stringify(log,null,2)+'\n');console.log(JSON.stringify(log,null,2));assert(outcome.pass);
}finally{clearTimeout(timer);for(const s of sockets)s.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

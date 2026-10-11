/** Isolated real Chromium: native IDB across two JS contexts; synthetic data only. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync, readFileSync, mkdirSync, readdirSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-rel06-coordinator-'));
const before=process.env.AUTH_VERIFY_BEFORE==='1';
const ref=before?'c0af11ba065b0eb3ca28f0c9f9a3970cce237baf':'cfc2d6da8f2650da490004c9bec1b3c96c665a77';
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',ref],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();for(const name of readdirSync(join(snapshot,'packages'))){const folder=join(snapshot,'packages',name);try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}}
const pin={name:'pin',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/'),entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;let target=entry.pkg.exports?.[parts.length>2?'./'+parts.slice(2).join('/') : '.'];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('unresolved '+args.path);return{path:join(entry.folder,target)}})}};
const source = before?readFileSync(join(snapshot,'docs/reviews/web-auth-session-cleanup/native-cleanup-races.ts'),'utf8'):readFileSync(join(root,'docs/reviews/web-auth-foundation-independent/native.ts'),'utf8');
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:join(snapshot,'docs/reviews/web-auth-session-cleanup'),loader:'tsx'},bundle:true,plugins:[pin],format:'iife',platform:'browser',write:false,define:{'import.meta.env':'{}'},loader:{'.css':'empty','.svg':'dataurl'}});
 let receive;
 const finished=new Promise((resolve,reject)=>{receive=resolve;timeout=setTimeout(()=>reject(Error('Browser verification timed out after 60s')),60000);});
 server=createServer((req,res)=>{
  if(req.url==='/result'){let text='';req.on('data',chunk=>text+=chunk);req.on('end',()=>{res.end('ok');receive(text);});}
  else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><body><script>'+bundle.outputFiles[0].text+'</script>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 browser=spawn(process.env.CHROME_BINARY || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--window-size=390,844','--disable-gpu','--disable-popup-blocking','--no-first-run','--no-default-browser-check','--disable-background-networking','--user-data-dir='+join(directory,'profile'),url],{stdio:'ignore'});
 browser.on('error',error=>receive('FAIL '+error.message));
 const result=await finished;
 writeFileSync(join(root,'docs/reviews/web-auth-foundation-independent/'+(before?'original-before.log':'native-after.log')),JSON.stringify({ref,result:typeof result==='string'&&result.startsWith('{')?JSON.parse(result):result},null,2)+'\n');
 if(typeof result!=='string'||!result.startsWith('{')||!JSON.parse(result).pass)throw Error(String(result));
 console.log(result);
} finally {
 clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();
 await new Promise(resolve=>setTimeout(resolve,500));
 if(browser && browser.exitCode===null) browser.kill('SIGKILL');
 rmSync(directory,{recursive:true,force:true});
}

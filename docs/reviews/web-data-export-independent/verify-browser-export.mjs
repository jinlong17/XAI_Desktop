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
const directory=mkdtempSync(join(tmpdir(),'xai-rel04-export-'));
const sourceCommit=process.env.REL04_VERIFY_REF??'62f7bfc855acd5ef9e0d5b1de57c00ded896b7ab';
const snapshot=join(directory,'source');mkdirSync(snapshot);
execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
const aliases=new Map();
for(const name of readdirSync(join(snapshot,'packages'))){
 const folder=join(snapshot,'packages',name);
 try{const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));aliases.set(pkg.name,{folder,pkg});symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));}catch{}
}
const pinnedPackages={name:'pinned-workspace-packages',setup(build){build.onResolve({filter:/^@repo\//},args=>{const parts=args.path.split('/');const entry=aliases.get(parts.slice(0,2).join('/'));if(!entry)return;const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';let target=entry.pkg.exports?.[sub];if(typeof target==='object')target=target.import??target.default;if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);return {path:join(entry.folder,target)};});}};
const downloads=join(directory,'downloads');mkdirSync(downloads);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const rawA=' { "entries": [{"id":"A-only","amount":12.3400,"note":"原始\\n字节"}] }\n';
const legacy='  [ { "id": "unowned-history" } ]\n';
const safeArchive=JSON.stringify({version:1,owner:'unassigned',source:{xai_task_cols:legacy}},null,2);
const source=`
import React from './packages/plugin-web-settings-rest/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-settings-rest/node_modules/react-dom/client.js';
import {MemoryRouter} from './packages/plugin-web-settings-shell/node_modules/react-router/dist/development/index.mjs';
import {SettingsModule,paneRegistry} from './packages/plugin-web-settings-shell/src/index.ts';
import {accountPane} from './packages/plugin-web-settings-rest/src/panes/accountPane.tsx';
import {WebAuthSessionProvider} from './packages/web-auth-device-session/src/session.tsx';
import {accountScope,generationKey} from './packages/plugin-web-storage/src/index.ts';
import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
import './packages/plugin-web-settings-rest/src/styles.css';
const fixture={rawA:${JSON.stringify(rawA)},legacy:${JSON.stringify(legacy)},safeArchive:${JSON.stringify(safeArchive)}};
const put=(k,v)=>localStorage.setItem(k,v);
put(generationKey('A-fixture','current','xai_tt_entries_v2'),fixture.rawA);
put(generationKey('A-fixture','current','xai_bk_state_v2'),'A-bookkeeping');
put(generationKey('A-fixture','current','xai_metric_tracker_state_v1'),'A-metrics');
put(generationKey('A-fixture','current','xai_pref_access_token'),'DO-NOT-EXPORT-A-CREDENTIAL');
put(generationKey('A-fixture','previous','xai_task_cols'),'A-old-generation');
put(generationKey('B-fixture','current','xai_task_cols'),'B-private');
put('xai_bk_dash_order',' ["summary", "calendar"] ');
put('xai_tt_mode','"timer"');put('xai_lang','"en"');
put('xai_task_cols',fixture.legacy);put('xai_pref_access_token','DO-NOT-EXPORT-LEGACY-CREDENTIAL');
put('xai:legacy:v1:archive:safe',fixture.safeArchive);
put('xai:legacy:v1:archive:secret',JSON.stringify({version:1,owner:'unassigned',source:{xai_pref_access_token:'ARCHIVE-CREDENTIAL'}}));
put('xai:legacy:v1:archive:malformed','{bad');
put('xai:legacy:v1:archive:ambiguous','{"version":1,"owner":"unassigned","source":{"xai_task_cols":"hidden","xai_task_cols":"visible"}}');
const initial=JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()));
Object.assign(paneRegistry.find(p=>p.id==='account'),accountPane);
let root=createRoot(document.getElementById('app'));
const render=(lang='en')=>root.render(React.createElement(WebAuthSessionProvider,{config:null},React.createElement(MemoryRouter,null,React.createElement(SettingsModule,{lang}))));
accountScope.activate(accountScope.lock('A-fixture'),'current');render();
window.verify={switchB:()=>accountScope.activate(accountScope.lock('B-fixture'),'current'),remount:(lang='en')=>{root.unmount();root=createRoot(document.getElementById('app'));render(lang);},unchanged:()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage).sort()))===initial};
`;
let server,browser,socket;
const log=[];const record=(name,data)=>{log.push({name,...data});console.log(name,JSON.stringify(data??{}));};
try{
 const bundle=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},bundle:true,plugins:[pinnedPackages],format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),loader:{'.svg':'dataurl'},define:{'import.meta.env':'{}'}});
 const js=bundle.outputFiles.find(f=>f.path.endsWith('.js')).text,css=bundle.outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
 server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><main id="app"></main><script type="module">'+js+'</script>');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
 let port;for(let i=0;i<100;i++){try{port=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);break;}catch{await delay(100);}}
 assert(port,'Chrome debugging port');
 const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let next=0;const pending=new Map();socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const clickText=async text=>{await evaluate(`(()=>{const el=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(text)});if(!el)throw Error('button missing');el.click();})()`);await delay(150);};
 const download=async(text,label)=>{const before=new Set(readdirSync(downloads));await clickText(text);let filename;for(let i=0;i<100;i++){filename=readdirSync(downloads).find(f=>!before.has(f)&&f.endsWith('.json'));if(filename)break;await delay(100);}assert(filename,label+' real download');const data=JSON.parse(readFileSync(join(downloads,filename),'utf8'));rmSync(join(downloads,filename));record(label,{filename,manifest:data.manifest});return data;};
 await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
 for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('.device-recovery-export')"))break;await delay(100);}
 assert(await evaluate("!!document.querySelector('.device-recovery-export')"),'mounted actual Settings');
 record('baseline',{head:sourceCommit,source:'isolated git archive; every @repo import pinned',browser:(await cdp('Browser.getVersion')).product,viewport:390});
 assert.deepEqual(await evaluate("[...document.querySelectorAll('.device-recovery-export input')].map(e=>e.checked)"),[false,false]);
 const a=await download("Export this account's local data",'account-A');
 assert.equal(a.records.xai_tt_entries_v2,rawA);assert.equal(a.records.xai_bk_state_v2,'A-bookkeeping');assert.equal(a.records.xai_metric_tracker_state_v1,'A-metrics');assert.equal(Object.keys(a.records).length,3);assert.equal(a.accountId,'A-fixture');assert.equal(a.manifest.omitted.length,1);assert(!JSON.stringify(a).includes('DO-NOT-EXPORT'));assert(!JSON.stringify(a).includes('B-private'));
 assert((await evaluate("document.querySelector('[role=status]').textContent")).includes('credential-related'));
 // Open disclosure using the keyboard, not a patched click handler.
 await evaluate("document.querySelector('.device-recovery-export summary').focus()");await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13});await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await delay(100);
 assert(await evaluate("document.querySelector('.device-recovery-export').open"));
 const def=await download('Download device data file','device-default');assert.equal(def.device.records.xai_bk_dash_order,' ["summary", "calendar"] ');assert.deepEqual(def.legacy.records,{});assert.deepEqual(def.archives.records,{});assert(!JSON.stringify(def).includes('B-private'));
 await evaluate("document.querySelectorAll('.device-recovery-export input')[0].click()");await delay(100);
 const old=await download('Download device data file','device-legacy-only');assert.equal(old.legacy.records.xai_task_cols,legacy);assert.deepEqual(old.archives.records,{});assert(!JSON.stringify(old).includes('DO-NOT-EXPORT'));
 await evaluate("document.querySelectorAll('.device-recovery-export input')[0].click();document.querySelectorAll('.device-recovery-export input')[1].click()");await delay(100);
 const archives=await download('Download device data file','device-archives-only');assert.deepEqual(archives.legacy.records,{});assert.equal(archives.archives.records['xai:legacy:v1:archive:safe'],safeArchive);assert.equal(Object.keys(archives.archives.records).length,1);assert.equal(archives.manifest.omitted.length,3);assert(!JSON.stringify(archives).includes('ARCHIVE-CREDENTIAL'));
 await evaluate("document.querySelectorAll('.device-recovery-export input')[0].click()");await delay(100);
 const all=await download('Download device data file','device-both');assert.equal(all.legacy.records.xai_task_cols,legacy);assert.equal(all.archives.records['xai:legacy:v1:archive:safe'],safeArchive);assert.equal(all.manifest.omitted.length,5);
 assert((await evaluate("document.querySelector('.device-recovery-export [role=status]').textContent")).includes('excluded'));
 const geometry=await evaluate("({viewport:innerWidth,width:document.documentElement.scrollWidth,summary:document.querySelector('.device-recovery-export summary').getBoundingClientRect().height,labels:[...document.querySelectorAll('.device-recovery-export label')].map(e=>e.getBoundingClientRect().height),buttons:[...document.querySelectorAll('.account-pane section button,.device-recovery-export button')].map(e=>({text:e.textContent.trim(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))})");
 record('390px-geometry',geometry);assert(geometry.width<=geometry.viewport,'no horizontal overflow');assert(geometry.summary>=44);assert(geometry.labels.every(h=>h>=44));
 await evaluate("document.querySelector('.device-recovery-export summary').scrollIntoView({block:'start'})");await delay(100);
 const screen=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});writeFileSync(join(output,'390px-export-en.png'),Buffer.from(screen.data,'base64'));
 const count=readdirSync(downloads).length;await evaluate('window.verify.switchB()');await clickText("Export this account's local data");await clickText('Download device data file');assert.equal(readdirSync(downloads).length,count,'stale A handlers cannot download after B switch');assert.equal(await evaluate("document.querySelectorAll('[role=alert]').length"),2);
 await evaluate('window.verify.remount()');await delay(150);const b=await download("Export this account's local data",'account-B');assert.deepEqual(b.records,{xai_task_cols:'B-private'});assert(!JSON.stringify(b).includes('A-only'));assert(await evaluate('window.verify.unchanged()'),'all source bytes unchanged');
 await evaluate("window.verify.remount('zh')");await delay(150);await evaluate("document.querySelector('.device-recovery-export').open=true");await delay(100);assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Chinese no horizontal overflow');
 await evaluate("document.querySelector('.device-recovery-export summary').scrollIntoView({block:'start'})");await delay(100);
 writeFileSync(join(output,'390px-export-zh.png'),Buffer.from((await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true})).data,'base64'));
 record('PASS',{downloads:6,scope:'real actual Settings shell/account pane, isolated native Chrome downloads; account/device/opt-in bytes, exclusions, stale owner, B, English/Chinese 390px'});
}finally{writeFileSync(join(output,'20260909-browser-export.log'),log.map(x=>JSON.stringify(x)).join('\n')+'\n');socket?.close();browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();await delay(500);browser?.kill('SIGKILL');rmSync(directory,{recursive:true,force:true});}

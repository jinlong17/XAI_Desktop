/** Isolated real Chromium verification: no user profile, credentials, or network. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = mkdtempSync(join(tmpdir(), 'xai-rel01-browser-'));
const source = `
import React from './packages/plugin-web-metric-tracker/node_modules/react/index.js';
import {createRoot} from './packages/plugin-web-metric-tracker/node_modules/react-dom/client.js';
import {MetricTrackerModule} from './packages/plugin-web-metric-tracker/src/MetricTrackerModule.tsx';
import {createSeedMetricTrackerState, METRIC_TRACKER_STATE_KEY} from './packages/plugin-web-metric-tracker/src/internal/seed.ts';
const delay = () => new Promise(r=>setTimeout(r,70));
(async()=>{
 const results=[];
 for(const original of ['2026-11-01T09:30:00.000Z','2026-09-09T18:30:45.123Z']) {
  const seed=createSeedMetricTrackerState();
  const record={id:'verify-absolute',metricId:'weight',value:71,unit:'kg',measuredAt:original,note:'keep instant',createdAt:original,updatedAt:original};
  localStorage.setItem(METRIC_TRACKER_STATE_KEY,JSON.stringify({...seed,records:[record]}));
  const container=document.createElement('div');document.body.append(container);const root=createRoot(container);
  root.render(React.createElement(MetricTrackerModule,{lang:'en'}));await delay();
  [...container.querySelectorAll('[aria-label="Record range"] button')].find(b=>b.textContent==='All time').click();await delay();
  container.querySelector('[aria-label="Edit record"]').click();await delay();
  const displayed= [...container.querySelectorAll('[role="dialog"] input')].map(i=>({type:i.type,value:i.value}));
  container.querySelector('form').requestSubmit();await delay();
  const saved=JSON.parse(localStorage.getItem(METRIC_TRACKER_STATE_KEY)).records[0].measuredAt;
  if(original!==saved)throw Error('Unchanged time mutated: '+original+' -> '+saved);
  container.querySelector('[aria-label="Edit record"]').click();await delay();
  const input=container.querySelector('input[type="time"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'03:15');
  input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));await delay();
  container.querySelector('form').requestSubmit();await delay();
  const changed=JSON.parse(localStorage.getItem(METRIC_TRACKER_STATE_KEY)).records[0].measuredAt;
  const expected=original.includes('11-01')?'2026-11-01T11:15:00.000Z':'2026-09-09T10:15:00.000Z';
  if(changed!==expected)throw Error('Explicit time edit incorrect '+changed+' expected '+expected);
  results.push({original,saved,unchanged:original===saved,deltaMs:Date.parse(saved)-Date.parse(original),explicitEdit:changed,expected,displayed});
  root.unmount();container.remove();await delay();
 }
 await fetch('/result',{method:'POST',body:JSON.stringify({zone:Intl.DateTimeFormat().resolvedOptions().timeZone,results})});
})().catch(e=>fetch('/result',{method:'POST',body:'FAIL '+e.stack}));
`;
let browser; let server; let timeout;
try {
 const bundle=await build({stdin:{contents:source,resolveDir:root,loader:'tsx'},bundle:true,format:'iife',platform:'browser',write:false,define:{'import.meta.env':'{}'},loader:{'.css':'empty','.svg':'dataurl'}});
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
 console.log(result); if(typeof result!=='string'||result.startsWith('FAIL'))throw Error(String(result));

} finally {
 clearTimeout(timeout);browser?.kill('SIGTERM');server?.closeAllConnections();server?.close();
 await new Promise(resolve=>setTimeout(resolve,500));
 if(browser && browser.exitCode===null) browser.kill('SIGKILL');
 rmSync(directory,{recursive:true,force:true});
}

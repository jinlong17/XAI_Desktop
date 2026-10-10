import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { entry } from './host-adapter.mjs';
import { Refusal, requireThat, plannedOracle, noEffect, loggedOracle, firstRenderOracle, assertTrust, PipeCDP, Observer } from './driver.mjs';
/** Isolated synthetic HTTP control documents. Never injected into archived product. */
export const browserCases=['missing-sleep','missing-water','missing-exercise','enabled-sideeffect','suppressed-log','untrusted-dom','missing-weight','missing-log','selected-after','wrong-key','wrong-first-render','stale-document','noop-route','missing-rendered-record','normalization-write'];
export function controlHTML(fault='none') {
  const labels=['Weight','Sleep','Water','Exercise','Custom'];const config=JSON.stringify(fault);
  return `<!doctype html><meta charset="UTF-8"><title>MET05 ISOLATED synthetic qualification control</title><style>button{margin:10px;padding:10px}.module-metrics{min-height:200px}</style><div class="module-metrics"><button class="mt-primary">Log</button><div class="mt-tabs">${labels.map((label,i)=>`<button aria-selected="${i===0}" ${i&&!(fault==='enabled-sideeffect'&&i===1)?'disabled':''}>${label}${i&&fault!==`missing-${label.toLowerCase()}`?' Planned':''}</button>`).join('')}</div></div><script>
  const fault=${config},key='control-account-key',scope={kind:'account',accountId:'met05-synthetic-A',generation:'control-generation',epoch:2};let documentId=fault==='stale-document'?'invalid-fixed-document':crypto.randomUUID();const events=[],audit=[];let bytes=JSON.stringify({activeMetricId:'weight',profile:{targetWeightKg:70},records:[]});
  if(fault==='missing-weight')document.querySelector('.mt-tabs button').remove();if(fault==='missing-log')document.querySelector('.mt-primary').remove();
  for(const type of ['click','mousedown','mouseup','keydown','keyup'])document.addEventListener(type,e=>audit.push({type,key:e.key,isTrusted:e.isTrusted}),true);
  document.querySelector('.mt-primary')?.addEventListener('click',()=>{if(fault==='suppressed-log')return;const modal=document.createElement('div');modal.className='mt-modal-card';modal.innerHTML='<input inputmode="decimal"><textarea></textarea><button class="mt-save">Save</button>';document.body.append(modal);modal.querySelector('.mt-save').addEventListener('click',()=>{const value=Number(modal.querySelector('input').value),note=modal.querySelector('textarea').value;bytes=JSON.stringify({activeMetricId:'weight',profile:{targetWeightKg:70},records:[{metricId:'weight',value,unit:'kg',note}]});events.push({type:'set',key,value:bytes,denied:false,wrongKey:false});if(fault!=='missing-rendered-record'){const record=document.createElement('div');record.className='mt-record-row';const weight=document.createElement('strong');weight.className='mt-record-weight';weight.textContent=value.toFixed(1)+' kg';const text=document.createElement('span');text.className='mt-record-note';text.textContent=note;record.append(weight,text);document.querySelector('.module-metrics').append(record);}modal.remove();});});
  document.querySelector('.mt-tabs button:nth-child(2)')?.addEventListener('click',()=>{if(fault==='enabled-sideeffect')events.push({type:'set',key,value:'side-effect',denied:false,wrongKey:false});});
  document.querySelector('.mt-tabs button')?.addEventListener('click',()=>{if(fault==='selected-after')document.querySelector('.mt-tabs button').setAttribute('aria-selected','false');if(fault==='wrong-key')events.push({type:'set',key:'other-account',expected:key,wrongKey:true});});
  if(fault==='noop-route'||fault==='route-positive'){const metrics=document.querySelector('.module-metrics');metrics.remove();const rail=document.createElement('div');rail.className='app-rail';rail.innerHTML='<button aria-label="Metrics">Metrics</button>';document.body.append(rail);rail.querySelector('button').addEventListener('click',()=>{document.body.append(metrics);if(fault==='route-positive')history.pushState({},'', '/app/metrics');});}
  const observe=()=>({lang:'en',documentId,module:document.querySelector('.module-metrics')?'actual-metrics':'absent',lane:'ISOLATED_SYNTHETIC_QUALIFICATION_ONLY',url:location.href,route:location.pathname,scope,key,actualPhysicalKey:key,auth:{managed:true,owner:scope.accountId,generation:'synthetic-auth'},tabs:Array.from(document.querySelectorAll('.mt-tabs button')).map((b,i)=>({id:['weight','sleep','water','exercise','custom'][i],present:true,text:b.textContent,disabled:b.disabled,selected:b.getAttribute('aria-selected')==='true'})),log:{present:!!document.querySelector('.mt-primary'),disabled:document.querySelector('.mt-primary')?.disabled,label:document.querySelector('.mt-primary')?.textContent},bytes:{[key]:bytes},events:[...events],writes:events.filter(e=>e.type==='set').length,removes:0,wrongKeyAttempts:events.filter(e=>e.wrongKey),target:'70.0kg',firstRender:[{rendered:true,kind:'account',accountId:scope.accountId,generation:scope.generation,epoch:scope.epoch,key,authOwner:fault==='wrong-first-render'?'met05-synthetic-B':scope.accountId,target:'70.0kg'}],renderedRecords:Array.from(document.querySelectorAll('.mt-record-row')).map(e=>({weight:e.querySelector('.mt-record-weight')?.textContent,note:e.querySelector('.mt-record-note')?.textContent})),content:document.querySelector('.module-metrics')?.textContent,dialogs:document.querySelectorAll('.mt-modal-card').length});
  if(fault==='normalization-write')events.push({type:'set',key,value:bytes,wrongKey:false,denied:false});
  window.__met05={documentId,audit,observe,ready:true,authReady:true,authState:'authenticated',settle:async()=>({stable:true,pending:0,errors:[]})};
  </script>`;
}
export async function serveControls(port) {
  const server=createServer((req,res)=>{const url=new URL(req.url,`http://127.0.0.1:${port}`);res.setHeader('Content-Type','text/html');res.end(controlHTML(url.searchParams.get('fault')??'none'));});await new Promise((r,j)=>{server.once('error',j);server.listen(port,'127.0.0.1',r);});process.on('SIGTERM',()=>{server.close(e=>{if(e){process.stderr.write(String(e));process.exitCode=1;}});});return server;
}
/** Exact predicates and transport are the product machinery, causal fixture is isolated. */
export async function browserQualification(context,paired) {
  const {owner,admission,output,journal,artifacts}=context;const port=admission.resources.controlPort;requireThat(port&&port!==admission.resources.port,'CONTROL_PORT','independently registered control localhost');
  const server=owner.spawn(admission.tools.node.path,[fileURLToPath(import.meta.url),'--serve-controls',String(port)],{cwd:context.root,env:admission.tools.env,name:'controls-server'});owner.stream(server,server.child.stdout,join(output,'control-valid.stdout.log'));owner.stream(server,server.child.stderr,join(output,'control-valid.stderr.log'));
  await owner.task('control-server-ready',async signal=>{for(let i=0;i<100;i++){try{const r=await fetch(`http://127.0.0.1:${port}/`,{signal});if(r.ok)return;}catch{}requireThat(!server.closed,'CONTROL_SERVER','early exit');await new Promise(r=>setTimeout(r,30));}throw new Refusal('CONTROL_SERVER','ready deadline');});
  const browser=owner.spawn(admission.chrome.path,['--headless=new','--remote-debugging-pipe',`--user-data-dir=${join(output,'chrome-profile')}`,'--no-first-run','--no-default-browser-check','about:blank'],{cwd:context.root,env:admission.tools.env,stdio:['ignore','pipe','pipe','pipe','pipe'],name:'control-chrome'});owner.stream(browser,browser.child.stdout,join(output,'chrome.stdout.log'));owner.stream(browser,browser.child.stderr,join(output,'chrome.stderr.log'));const cdp=new PipeCDP(browser.child,journal,owner);
  const page=async fault=>{const target=await cdp.send('Target.createTarget',{url:'about:blank'});const attach=await cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:true});const o=new Observer(cdp,attach.sessionId,artifacts,journal,owner);for(const method of ['Page.enable','Runtime.enable','Accessibility.enable'])await o.command(method);await o.command('Page.navigate',{url:`http://127.0.0.1:${port}/control?fault=${fault}`});await o.wait('!!window.__met05');return {o,targetId:target.targetId,dispose:()=>cdp.send('Target.closeTarget',{targetId:target.targetId})};};
  for(const id of browserCases) {
    const expected={code:'BUSINESS',stage:'observation',faultId:id};
    if(id==='untrusted-dom')Object.assign(expected,{code:'TRUST',stage:'passive-audit'});
    if(id==='stale-document')Object.assign(expected,{code:'STALE_DOCUMENT',stage:'document-barrier'});
    if(id==='noop-route')Object.assign(expected,{code:'NOOP_ROUTE',stage:'route-transition'});
    await paired(id,expected,async negative=>{const p=await page(negative?id:id==='noop-route'?'route-positive':'none');try{const o=p.o,before=await o.snapshot();
      if((id.startsWith('missing-')&&id!=='missing-rendered-record')||['missing-weight','missing-log'].includes(id))plannedOracle(before);
      else if(id==='enabled-sideeffect'){if(!negative)plannedOracle(before);await o.pointer('.mt-tabs button:nth-child(2)');noEffect(before,await o.snapshot());}
      else if(id==='suppressed-log'){await o.pointer('.mt-primary');const value=(await o.snapshot()).dialogs;requireThat(value===1,'BUSINESS','Log dialog absent',{stage:'observation',faultId:id,value,counter:1});}
      else if(id==='untrusted-dom'){const start=await o.evaluate('window.__met05.audit.length');if(negative)await o.evaluate('document.querySelector(".mt-primary").click()');else await o.pointer('.mt-primary');const events=await o.evaluate(`window.__met05.audit.slice(${start})`);assertTrust({transport:'cdp-pipe',hitVerified:true},events);}
      else if(id==='selected-after'||id==='wrong-key'){await o.pointer('.mt-tabs button:first-child');noEffect(before,await o.snapshot());}
      else if(id==='wrong-first-render')firstRenderOracle(before,'met05-synthetic-A',70);
      else if(id==='stale-document')await o.reload();
      else if(id==='noop-route')await entry({entry:'rail',lang:'en'},o,`http://127.0.0.1:${port}`);
      else if(id==='missing-rendered-record'){await o.log('en',71.25,'control');loggedOracle(before,await o.snapshot(),71.25,'control');}
      else if(id==='normalization-write')requireThat(before.events.length===0,'BUSINESS','mount wrote identical bytes',{stage:'observation',faultId:id,value:before.events,counter:1});
      return {observation:await o.snapshot(),dispatches:o.dispatches};
    }finally{await p.dispose();}});
  }
  cdp.terminal();cdp.closing=true;
  return {implemented:browserCases,missing:[]};
}
if(process.argv[2]==='--serve-controls'&&resolve(process.argv[1])===fileURLToPath(import.meta.url))serveControls(Number(process.argv[3])).catch(e=>{process.stderr.write(`${e.stack}\n`);process.exitCode=1;});

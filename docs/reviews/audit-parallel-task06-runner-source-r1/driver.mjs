/** TASK-06 versioned, UNQUALIFIED evidence source. Importing performs no run. */
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { openSync, writeSync, closeSync, fsyncSync, readFileSync, mkdirSync, mkdtempSync, readdirSync, realpathSync, symlinkSync, existsSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { archiveAliases, hostConfig } from './vite.config.mjs';
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const HERE = dirname(fileURLToPath(import.meta.url));
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const info = e => ({ message: String(e?.message ?? e), code: e?.code ?? null, stack: e?.stack ?? null });
export function fail(code, message, detail = {}) { throw Object.assign(Error(message), { code, detail }); }
export async function deadline(operation, ms, code = 'DEADLINE') {
  assert(Number.isInteger(ms) && ms > 0 && ms <= 180000); let timer;
  try { return await Promise.race([Promise.resolve().then(operation), new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(Error(code), { code })), ms); })]); }
  finally { clearTimeout(timer); }
}
export function writeAll(fd, bytes, io = { writeSync }) { bytes = Buffer.from(bytes); let offset = 0;
  while (offset < bytes.length) { const n = io.writeSync(fd, bytes, offset, bytes.length-offset); if (n <= 0) fail('EVIDENCE_WRITE','Short/zero evidence write'); offset += n; } }
export function exclusive(path, bytes, io = { openSync, writeSync, fsyncSync, closeSync }) {
  const fd = io.openSync(path, 'wx'); try { writeAll(fd, bytes, io); io.fsyncSync(fd); } finally { io.closeSync(fd); }
}
export function journal(path, io = { openSync, writeSync, fsyncSync, closeSync }) {
  const fd = io.openSync(path, 'wx'), state = { errors: [], closed: false, records: [] };
  return Object.assign(state, { record(name, detail = {}) {
    const row = { sequence: state.records.length, time: new Date().toISOString(), name, ...detail }; state.records.push(row);
    try { writeAll(fd, JSON.stringify(row)+'\n', io); io.fsyncSync(fd); } catch (e) { state.errors.push(info(e)); throw e; } return row;
  }, close() { if (state.closed) return; state.closed = true;
    try { io.fsyncSync(fd); } catch(e) { state.errors.push(info(e)); throw e; } finally { try { io.closeSync(fd); } catch(e) { state.errors.push(info(e)); throw e; } }
  } });
}
export function ownChild(command, args, { cwd, env, out, err, record, stdin = 'ignore', extraPipes = false, spawnFn = spawn }) {
  const output = openSync(out, 'wx'); let error;
  try { error = openSync(err, 'wx'); } catch(e) { closeSync(output); throw e; }
  const owner = { command, args, errors: [], close: null, proc: null, closed: false, fdsClosed: false };
  const capture = (fd, bytes) => { try { writeAll(fd, bytes); fsyncSync(fd); } catch(e) { owner.errors.push(info(e)); } };
  try { owner.proc = spawnFn(command, args, { cwd, env, stdio: [stdin,'pipe','pipe', ...(extraPipes ? ['pipe','pipe'] : [])] }); }
  catch(e) { closeSync(output); closeSync(error); throw e; }
  owner.proc.stdout.on('data', b => capture(output,b)); owner.proc.stderr.on('data', b => capture(error,b));
  for (const s of [owner.proc.stdout, owner.proc.stderr]) s.on('error', e => owner.errors.push(info(e)));
  owner.proc.on('error', e => owner.errors.push(info(e)));
  owner.done = new Promise(res => owner.proc.once('close', (code,signal) => {
    owner.close = { code,signal }; owner.closed = true;
    for (const fd of [output,error]) { try { fsyncSync(fd); } catch(e) { owner.errors.push(info(e)); } try { closeSync(fd); } catch(e) { owner.errors.push(info(e)); } }
    owner.fdsClosed = true;
    try { record('child-streams-closed', { command, args, ...owner.close, errors: owner.errors }); } catch(e) { owner.errors.push(info(e)); }
    res(owner.close);
  }));
  try { record('child-owned', { command, args, pid: owner.proc.pid, cwd }); } catch(e) { owner.errors.push(info(e)); } return owner;
}
export async function stopChild(owner, record) {
  if (!owner) return;
  for (const signal of ['SIGTERM','SIGKILL']) {
    if (owner.closed) break; try { record('child-signal', { pid: owner.proc.pid, signal }); } catch(e) { owner.errors.push(info(e)); } owner.proc.kill(signal);
    try { await deadline(() => owner.done, 1500, 'CLEANUP_DEADLINE'); } catch(e) { if (signal === 'SIGKILL') owner.errors.push(info(e)); }
  }
  if (!owner.closed || !owner.fdsClosed) fail('CLEANUP_STREAMS', 'Owned child streams did not close', { pid: owner.proc.pid });
}
export function childResult(owner, { permitSignal = false } = {}) {
  if (!owner.closed || owner.errors.length || owner.close.code !== 0 && !(permitSignal && owner.close.code === null && owner.close.signal === 'SIGTERM'))
    fail('CHILD_FAILURE','Child outcome/streams/persistence failure', { exit: owner.close, errors: owner.errors });
  return owner.close;
}
export async function finalize({ log, outcome, finalizers, summary, write = exclusive }) {
  const safe = (name,value) => { try { log.record(name,value); } catch(e) { outcome.persistence.push(info(e)); } };
  safe('primary-outcome', { primary: outcome.primary, status: outcome.status });
  for (const [name,fn] of finalizers) { safe('cleanup-start', { finalizer:name });
    try { await deadline(fn,5000,'CLEANUP_DEADLINE'); safe('cleanup-complete',{ finalizer:name }); }
    catch(e) { outcome.cleanup.push({ finalizer:name,...info(e) }); safe('cleanup-error',{ finalizer:name,...info(e) }); }
  }
  // No successful outcome may precede child close, journal fsync/close, or cleanup errors.
  outcome.persistence.push(...log.errors);
  if (outcome.primary || outcome.cleanup.length || outcome.persistence.length) outcome.status = outcome.primary?.code === 'ORACLE_FAILURE' && !outcome.cleanup.length && !outcome.persistence.length ? 'FAIL' : 'BLOCKED';
  safe('post-cleanup-outcome', { outcome });
  try { log.close(); } catch(e) { outcome.persistence.push(info(e)); outcome.status='BLOCKED'; }
  try { write(summary, JSON.stringify(outcome,null,2)+'\n'); } catch(e) { outcome.persistence.push(info(e)); outcome.status='BLOCKED'; process.stderr.write('FINAL EVIDENCE WRITE FAILED '+JSON.stringify(info(e))+'\n'); }
  process.stderr.write('FINAL '+JSON.stringify(outcome)+'\n'); return outcome;
}
export function causalControl(expected, observed) {
  const failure = observed.failures ?? [];
  return expected !== 'positive' && failure.length === 1 && failure[0].code === expected && failure[0].induced === true
    && observed.baseline === true && observed.cleanupComplete === true && observed.unrelated.length === 0;
}
export function validateAdmission(manifest, card, sourceHashes, caseId) {
  if (!card || card.role === 'source-author' || card.unit !== 'TASK-06' || card.case !== caseId || !['qualification','before','fixed'].includes(card.phase)) fail('ADMISSION','Separate exact root card required');
  if (!card.independent || !card.sourceReview?.approved || !card.qualification?.adopted || !card.sourceReview.reviewer || card.author === card.sourceReview.reviewer || card.author === card.qualification.author) fail('QUALIFICATION','Fresh independent source review and adopted qualification required');
  assert.deepEqual(card.sourceHashes, sourceHashes, 'SOURCE_DRIFT');
  const item = manifest.cases.find(x => x.id === caseId); if (!item) fail('UNKNOWN_CASE','Unregistered case');
  assert.deepEqual(card.outputs, item.outputsByPhase?.[card.phase] ?? item.outputs, 'OUTPUT_DRIFT');
  if (!card.permanentBudget || card.permanentBudget.exhausted || card.permanentBudget.used >= 3 || card.permanentBudget.iteration !== card.permanentBudget.used+1) fail('BUDGET','Permanent cumulative family cap/refusals');
  for (const dependency of item.dependencies) if (card.preconditions?.[dependency] !== true) fail('PRECONDITION','Dependency not admitted: '+dependency, { dependency });
  return item;
}
export function checkOracle(checks) { if (!checks.length || checks.some(x => typeof x.pass !== 'boolean')) fail('ORACLE_EMPTY','Missing executable checks');
  const failed = checks.filter(x => !x.pass); if (failed.length) fail('ORACLE_FAILURE','Business oracle failed', { failed }); return true; }
export function extractFrozen(text) {
  if(hash(text)!=='5450891880f5c2ac998310c2b2960f067da6c6514d2f1eba215084368b8167e4')fail('METHOD_DRIFT','Canonical frozen source file changed');
  const start = text.indexOf('\n/** A minimal PNG decoder (8-bit')+1;
  const fn = text.indexOf('\nasync function pixelFocusWalk(')+1, end = text.indexOf('\n}\n',fn)+3;
  if (start < 1 || fn <= start || end <= fn) fail('METHOD_SOURCE','Frozen function boundaries absent');
  const block=text.slice(start,end), method=text.slice(fn,end);
  if (hash(method) !== '1cdb0c13e10219267a2a03118d58c09744ee88f875c0dd29b4071a69c17a0620' || hash(block)!=='e024c90e7c038fc4bd704b159bd7a144abc2fb34cfe7583eda8c8d0c6c2e5a43') fail('METHOD_DRIFT','Canonical pixelFocusWalk/block changed');
  return { block, method, sourceHash:hash(text), hash:hash(method), blockHash:hash(block) };
}
export function frozenPixelWalk(frozen, bindings) {
  // The complete frozen block, including threshold/settle/visibility/union logic, is compiled byte-for-byte.
  // An adopted adapter must supply every original environmental binding; it is never guessed here.
  if (!bindings?.qualificationAdopted || !bindings.clockFoundationAdopted || !bindings.fullStopCensusAdopted) fail('FOCUS_PRECONDITION','Frozen host adapter/foundation unqualified');
  return Function('bindings', 'with (bindings) {\n'+frozen.block+'\nreturn pixelFocusWalk;\n}')(bindings);
}
export function pipeTransport(proc, record) {
  const pending = new Map(); let seq=0, buffer=Buffer.alloc(0), closed=false;
  const reader=proc.stdio[4], writer=proc.stdio[3];
  const abort = e => { if (closed) return; closed=true; for (const job of pending.values()) { clearTimeout(job.timer); job.reject(e); } pending.clear(); try { record('cdp-closed',info(e)); } catch {} };
  reader.on('error',abort); writer.on('error',abort); reader.on('close',()=>abort(Object.assign(Error('CDP stream closed'),{code:'CDP_STREAM_CLOSE'})));
  reader.on('data', chunk => { buffer=Buffer.concat([buffer,chunk]); if(buffer.length>32*1024*1024) { abort(Error('CDP message bound')); return; }
    let index; while((index=buffer.indexOf(0))!==-1) { const raw=buffer.subarray(0,index); buffer=buffer.subarray(index+1);
      let msg; try { msg=JSON.parse(raw.toString()); } catch(e) { abort(e); return; }
      try { record('cdp-message',{ method:msg.method??null,id:msg.id??null,params:msg.params??null,error:msg.error??null }); } catch(e) { abort(e); return; }
      if(msg.id && pending.has(msg.id)) { const job=pending.get(msg.id);pending.delete(msg.id);clearTimeout(job.timer);msg.error?job.reject(Error(JSON.stringify(msg.error))):job.resolve(msg.result); }
    }
  });
  return { send(method, params={}, sessionId) { if (Object.hasOwn(params,'nativeVirtualKeyCode')) fail('KEY_FIELD','Forbidden native key field');
    return new Promise((res,rej)=> { if(closed){rej(Error('CDP closed'));return;} const id=++seq;
      const timer=setTimeout(()=>{ pending.delete(id);rej(Object.assign(Error('CDP deadline '+method),{code:'CDP_DEADLINE'})); },10000);
      pending.set(id,{resolve:res,reject:rej,timer}); try { record('cdp-dispatch',{ method,params,sessionId:sessionId??null }); } catch(e) { abort(e); return; }
      writer.write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0',e=> { if(e)abort(e); });
    }); }, abort };
}
const KEY = { Tab:{key:'Tab',code:'Tab',vk:9}, ShiftTab:{key:'Tab',code:'Tab',vk:9,modifiers:8}, Enter:{key:'Enter',code:'Enter',vk:13,text:'\r'}, Space:{key:' ',code:'Space',vk:32,text:' '}, Escape:{key:'Escape',code:'Escape',vk:27} };
export async function trustedKey(page,name) { const def=KEY[name];assert(def);page.expectedKeys.push(...['keydown',...(def.text?['keypress']:[]),'keyup'].map(type=>({type,key:def.key,shift:!!def.modifiers,trusted:true})));
  await page.send('Input.dispatchKeyEvent',{type:def.text?'keyDown':'rawKeyDown',key:def.key,code:def.code,windowsVirtualKeyCode:def.vk,modifiers:def.modifiers??0,...(def.text?{text:def.text,unmodifiedText:def.text}:{})});
  await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:def.key,code:def.code,windowsVirtualKeyCode:def.vk,modifiers:def.modifiers??0});
}
const wait = ms => new Promise(r=>setTimeout(r,ms));
const evalPage = async (p,expression) => { const r=await p.send('Runtime.evaluate',{ expression,awaitPromise:true,returnByValue:true });
  if(r.exceptionDetails) fail('FIXTURE_EVALUATION','Page exception',{details:r.exceptionDetails});return r.result.value; };
async function until(p,expression) { const end=Date.now()+6000; while(Date.now()<end) { if(await evalPage(p,expression))return;await wait(40); }fail('FIXTURE_READY','Actual lane did not become ready'); }
async function pointer(p,selector) { const rect=await evalPage(p,`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,width:r.width,height:r.height}})()`);
  if(!rect||rect.width<=0||rect.height<=0)fail('POINTER_TARGET','Target unavailable',{selector,rect});
  await p.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:rect.x,y:rect.y});
  await p.send('Input.dispatchMouseEvent',{type:'mousePressed',x:rect.x,y:rect.y,button:'left',clickCount:1});
  await p.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:rect.x,y:rect.y,button:'left',clickCount:1});await wait(100);
}
async function buttonText(p,text) {
  const selector=await evalPage(p,`(()=>{let e=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)});if(!e)return null;const path=[];while(e&&e.tagName!=='HTML'){const tag=e.tagName.toLowerCase();path.unshift(tag+':nth-of-type('+([...e.parentElement.children].filter(x=>x.tagName===e.tagName).indexOf(e)+1)+')');e=e.parentElement}return 'html>'+path.join('>')})()`);
  if(!selector)fail('FIXTURE_TARGET','Exact button text missing',{text});await pointer(p,selector);
}
async function rowText(p,text) {
  return evalPage(p,`(()=>{let e=[...document.querySelectorAll('.module-sidebar .grow')].find(x=>x.textContent.trim()===${JSON.stringify(text)})?.closest('.list-row');if(!e)return null;const path=[];while(e&&e.tagName!=='HTML'){const tag=e.tagName.toLowerCase();path.unshift(tag+':nth-of-type('+([...e.parentElement.children].filter(x=>x.tagName===e.tagName).indexOf(e)+1)+')');e=e.parentElement}return 'html>'+path.join('>')})()`);
}
export async function trustedDrag(p,from,to) {
  const points=await evalPage(p,`[${JSON.stringify(from)},${JSON.stringify(to)}].map(s=>{const e=document.querySelector(s);if(!e)throw Error('drag target');const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})`);
  await p.send('Input.dispatchMouseEvent',{type:'mouseMoved',...points[0]});await p.send('Input.dispatchMouseEvent',{type:'mousePressed',...points[0],button:'left',clickCount:1});
  for(let i=1;i<=12;i++)await p.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:points[0].x+(points[1].x-points[0].x)*i/12,y:points[0].y+(points[1].y-points[0].y)*i/12,buttons:1});
  await p.send('Input.dispatchMouseEvent',{type:'mouseReleased',...points[1],button:'left',clickCount:1});await wait(150);
}
const sidebarCapture = `(()=>{const labels=__T06_CONFIG.lang==='zh'?['本地日历','已完成','不做','垃圾桶']:['Local Calendars','Completed',"Won't Do",'Trash'];return labels.map(label=>{const span=[...document.querySelectorAll('.module-sidebar .grow')].find(x=>x.textContent.trim()===label);const e=span?.closest('.list-row');const ids=e?.getAttribute('aria-describedby')?.split(/\\s+/)||[];return {label,found:!!e,tag:e?.tagName,disabled:e?.disabled===true,role:e?.getAttribute('role'),tabIndex:e?.tabIndex,count:e?.querySelector('.count')?.textContent??null,name:e?.getAttribute('aria-label')??span?.textContent,description:ids.map(id=>document.getElementById(id)?.textContent).join(' '),visibleReason:ids.every(id=>{const n=document.getElementById(id);return !!n&&n.getBoundingClientRect().height>0}),rect:e?(()=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})():null}})})()`;
async function business(p,item,writeArtifact,record) {
  const checks=[], check=(id,pass,detail={})=> { const c={id,pass:!!pass,...detail};checks.push(c);record('oracle',c); };
  if(item.lane==='host' || item.lane==='visual') {
    if(item.kind==='account') fail('HOST_IDENTITY_PRECONDITION','No qualified genuine synthetic A/B/logout/generation adapter. Mock-authenticated host is not lifecycle evidence');
    if(item.lane==='visual') {
      await until(p,'!!document.querySelector(".module-tasks")');
      const dimensions=await evalPage(p,'({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,scale:visualViewport.scale,theme:document.documentElement.dataset.theme,density:document.documentElement.dataset.density,lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,sidebar:!!document.querySelector(".module-sidebar")&&getComputedStyle(document.querySelector(".module-sidebar")).display})');
      writeArtifact('geometry.json',dimensions);check(item.id+':effective-dimensions',dimensions.width===item.effectiveViewport.width&&dimensions.height===item.effectiveViewport.height,{dimensions,requested:item.viewport,zoom:item.zoom});
      check(item.id+':host-preferences',dimensions.theme===item.theme&&dimensions.density===item.productDensity,{dimensions});
      check(item.id+':no-document-overflow',!dimensions.overflow,{dimensions});
      // A 390px layout hiding its sidebar is disclosed in raw geometry; never reinterpreted as accessible disabled entries.
      return checks;
    }
    await until(p,item.variant==='disabled'?'!!document.querySelector(".disabled-feature-fallback")':'!!document.querySelector(".module-tasks")');
    check(item.id+':actual-route',await evalPage(p,'location.pathname')===item.route);
    check(item.id+':actual-host',await evalPage(p,'!!document.querySelector(".app-rail") && !!document.querySelector(".topbar")'));
    return checks;
  }
  await until(p,'!!window.__T06?.ready && !!document.querySelector(".module-sidebar")'); await wait(200);
  const before=await evalPage(p,'__T06.snapshot()');writeArtifact('before.json',before);
  if(['destinations','inert','source'].includes(item.kind)) {
    const rows=await evalPage(p,sidebarCapture);writeArtifact('accessibility.json',rows);
    for(const [i,row] of rows.entries()) {
      if(item.kind==='destinations') check(item.id+':row-'+i,row.found&&row.tag==='BUTTON'&&row.disabled&&row.count===null&&row.name===row.label&&!!row.description&&row.visibleReason,{row});
      if(row.rect?.width&&row.rect?.height) {
        // Disabled control remains unfocused: real pointer + subsequent keys target whatever is naturally focused.
        const selector=i===0?'.module-sidebar > .sidebar-section:nth-last-child(2) .list-row':`.sidebar-footer .list-row:nth-child(${i})`;
        await pointer(p,selector);await trustedKey(p,'Enter');await trustedKey(p,'Space');
      }
    }
    const stops=[];for(let i=0;i<140;i++){await trustedKey(p,'Tab');stops.push(await evalPage(p,'({tag:document.activeElement.tagName,text:document.activeElement.textContent,footer:!!document.activeElement.closest(".sidebar-footer"),disabled:document.activeElement.disabled===true})'));}
    for(let i=0;i<140;i++)await trustedKey(p,'ShiftTab');
    const after=await evalPage(p,'__T06.snapshot()');writeArtifact('after.json',after);writeArtifact('focus.json',stops);
    check(item.id+':no-entry-write',JSON.stringify(after.writes)===JSON.stringify(before.writes),{mountWrites:before.writes});
    check(item.id+':same-raw',after.raw===before.raw);check(item.id+':no-callback',JSON.stringify(after.callbacks)===JSON.stringify(before.callbacks));
    check(item.id+':no-fetch',after.events.filter(x=>x.type==='fetch').length===before.events.filter(x=>x.type==='fetch').length);
    check(item.id+':footer-skipped',!stops.some(x=>x.footer||x.disabled),{stops});
    if(item.kind==='source'&&['corrupt','unsupported','read'].includes(item.variant)) check(item.id+':malformed-source-preserved',after.raw===before.raw);
  } else if(item.kind==='neighbor') {
    await evalPage(p,'__T06.counts(5)');await wait(100);
    check(item.id+':nonzero-count',await evalPage(p,'document.querySelector(".module-sidebar .count").textContent')==='5');
    await evalPage(p,'__T06.counts(0)');await wait(100);check(item.id+':zero-count',await evalPage(p,'document.querySelector(".module-sidebar .count").textContent')==='0');
    await pointer(p,'.module-sidebar .list-row');await trustedKey(p,'Enter');
    await pointer(p,'.sidebar-mini-btn');await pointer(p,'.manageable-row:nth-child(2)');
    await pointer(p,'.manageable-row:nth-child(2) [aria-label="'+(item.lang==='zh'?'编辑清单':'Edit list')+'"]');
    await trustedDrag(p,'.manageable-row:nth-child(2)','.manageable-row:nth-child(3)');
    const tag=await rowText(p,item.lang==='zh'?'工作':'Work'),tag2=await rowText(p,item.lang==='zh'?'学习':'Study');
    if(!tag||!tag2)fail('FIXTURE_TARGET','Default tag control missing');
    await pointer(p,tag);await pointer(p,tag+' [aria-label="'+(item.lang==='zh'?'编辑标签':'Edit tag')+'"]');
    await pointer(p,'button[aria-label="'+(item.lang==='zh'?'新增标签':'New tag')+'"]');
    await trustedDrag(p,tag,tag2);
    const after=await evalPage(p,'__T06.snapshot()');writeArtifact('after.json',after);
    for(const name of ['SelectSmart','CreateList','SelectList','EditList','ReorderList','SelectTag','EditTag','CreateTag','ReorderTag'])check(item.id+':'+name,after.callbacks.some(x=>x.name===name),{callbacks:after.callbacks});
    // Product CRUD/drop/storage remains a separate actual package and module unit, not proved by these callbacks.
  } else if(item.kind==='completion') {
    await until(p,'!!document.querySelector(".task-card .cbx")');
    const old=JSON.parse(before.raw), rows=d=>(Array.isArray(d)?d:d.data).flatMap(c=>[...c.tasks,...(c.completed??[])]), target=rows(old).find(t=>t.id==='t06-target');
    const expected = item.variant==='legacy-false'?true:false;
    await pointer(p,'.task-card .cbx');await until(p,`JSON.parse(__T06.raw()).data.flatMap(c=>[...c.tasks,...(c.completed||[])]).find(t=>t.id==='t06-target').done===${expected}`);
    const after=await evalPage(p,'__T06.snapshot()');writeArtifact('after.json',after);const stored=JSON.parse(after.raw), task=rows(stored).find(t=>t.id==='t06-target');
    check(item.id+':toggle',task.done===expected);check(item.id+':timestamp',expected?typeof task.completedAt==='string':task.completedAt===undefined);
    for(const field of ['source','listId','tags','notes','dueDate'])check(item.id+':preserve-'+field,JSON.stringify(task[field])===JSON.stringify(target[field]));
    check(item.id+':receipts',JSON.stringify(stored.receipts)===JSON.stringify(old.receipts));
    await p.send('Page.reload');await until(p,'!!window.__T06?.ready');await wait(200);check(item.id+':reload',await evalPage(p,'__T06.raw()')===after.raw);
  } else if(item.kind==='recovery') {
    if(item.variant==='held')await evalPage(p,'__T06.hold()');
    else if(item.variant==='baseline')await evalPage(p,'__T06.setFault("quota")');
    else if(['quota','throw'].includes(item.variant))await evalPage(p,`__T06.setFault(${JSON.stringify(item.variant)})`);
    else if(item.variant==='missing-lock')await evalPage(p,'Object.defineProperty(navigator,"locks",{value:undefined,configurable:true})');
    else if(item.variant==='rejected-lock')await evalPage(p,'Object.defineProperty(navigator,"locks",{value:{request:()=>Promise.reject(Error("T06 rejected lock"))},configurable:true})');
    await pointer(p,'.task-card .cbx');
    if(item.variant==='held'){await wait(100);check(item.id+':held-no-write',await evalPage(p,'__T06.raw()')===before.raw);await evalPage(p,'__T06.release()');}
    else {
      await until(p,'!!document.querySelector(".task-save-failure")');check(item.id+':failed-bytes',await evalPage(p,'__T06.raw()')===before.raw);
      check(item.id+':explicit-export',await evalPage(p,'[...document.querySelectorAll("button")].some(x=>x.textContent.includes("Export draft"))'));
      if(['quota','throw','baseline'].includes(item.variant)) { await evalPage(p,'__T06.setFault("")');
        let newer=null;if(item.variant==='baseline'){const changed=await evalPage(p,'__T06.newer()');check(item.id+':newer-supported',changed.ok);newer=await evalPage(p,'__T06.raw()');}
        await buttonText(p,'Retry save');
        if(newer){await wait(200);check(item.id+':newer-source-preserved',await evalPage(p,'__T06.raw()')===newer);check(item.id+':conflict-alert-retained',await evalPage(p,'!!document.querySelector(".task-save-failure")'));}
        else {await until(p,'!document.querySelector(".task-save-failure")');const saved=JSON.parse(await evalPage(p,'__T06.raw()')),old=JSON.parse(before.raw);
          check(item.id+':exactly-once',saved.revision===old.revision+1);check(item.id+':prior-receipts',JSON.stringify(saved.receipts)===JSON.stringify(old.receipts));}
      }
      if(['missing-lock','rejected-lock'].includes(item.variant))return checks; // restored-lock retry requires new qualified document, never fabricate support.
    }
    writeArtifact('after.json',await evalPage(p,'__T06.snapshot()'));
  } else fail('UNSUPPORTED_CASE','Missing executable business case',{id:item.id});
  const audit=await evalPage(p,'__T06.keys');writeArtifact('keys.json',audit);check(item.id+':passive-key-audit',JSON.stringify(audit)===JSON.stringify(p.expectedKeys),{expected:p.expectedKeys,actual:audit});return checks;
}

export async function run(cardPath,caseId) {
  const manifest=JSON.parse(readFileSync(join(HERE,'execution-manifest.json'))), card=JSON.parse(readFileSync(cardPath));
  const sourceHashes=Object.fromEntries(manifest.executableSources.map(name=>[name,hash(readFileSync(join(HERE,name)))]));
  const item=validateAdmission(manifest,card,sourceHashes,caseId);
  if(!/^[0-9a-f]{40}$/.test(card.requestedSha))fail('SHA_FORMAT','Full requested SHA required');
  const resolved=execFileSync('git',['rev-parse',card.requestedSha+'^{commit}'],{cwd:ROOT,encoding:'utf8'}).trim();
  if(resolved!==card.resolvedSha)fail('SHA_DRIFT','Requested/resolved SHA drift');
  const outRoot=resolve(ROOT,manifest.outputRoots[card.phase]), target=join(outRoot,item.id); if(!target.startsWith(outRoot+sep))fail('OUTPUT_PATH','Output escape');
  mkdirSync(outRoot,{recursive:true});mkdirSync(target); // EEXIST refuses the complete case, including partial old evidence.
  const allowed=new Set(item.outputsByPhase[card.phase].map(x=>resolve(ROOT,x))), pathFor=name=>{const p=join(target,name);if(!allowed.has(p))fail('OUTPUT_PATH','Unregistered output '+name);return p;};
  const log=journal(pathFor('journal.jsonl')), record=(name,d)=>log.record(name,d);
  const outcome={status:'UNVERIFIED',primary:null,cleanup:[],persistence:[],case:caseId,requestedSha:card.requestedSha,resolvedSha:resolved,phase:card.phase,checks:[],expectedBeforeFailures:[],scope:item.lane};
  const owners=[],finalizers=[];let server,temporary;
  const writeArtifact=(name,obj)=>exclusive(pathFor(name),Buffer.isBuffer(obj)?obj:JSON.stringify(obj,null,2)+'\n');
  const child=(label,command,args,opts={})=> {const o=ownChild(command,args,{cwd:ROOT,env:{...process.env},out:pathFor(label+'.stdout'),err:pathFor(label+'.stderr'),record,...opts});owners.push(o);return o;};
  try {
    record('identity',{cardPath,cardHash:hash(readFileSync(cardPath)),sourceHashes,requestedSha:card.requestedSha,resolvedSha:resolved,item});
    for(const line of readFileSync(join(HERE,'inputs.sha256'),'utf8').split('\n').filter(x=>x&&!x.startsWith('#'))) {
      const match=line.match(/^([0-9a-f]{64})  (.+)$/);if(!match)fail('INPUT_MANIFEST','Malformed input identity');
      const identity=match[2], index=identity.indexOf(':');
      const bytes=identity.startsWith('attachment:')?readFileSync(identity.slice(11)):execFileSync('git',['show',identity],{cwd:ROOT,maxBuffer:20*1024*1024});
      if(hash(bytes)!==match[1])fail('SOURCE_DRIFT','Frozen input drift',{identity});
      if(identity.slice(0,index)===manifest.productSha&&!manifest.candidateAllowedProductPaths.includes(identity.slice(index+1))) {
        const candidate=execFileSync('git',['show',resolved+':'+identity.slice(index+1)],{cwd:ROOT,maxBuffer:20*1024*1024});
        if(hash(candidate)!==match[1])fail('PROTECTED_SOURCE_DRIFT','Protected product input changed',{identity});
      }
    }
    if(card.phase==='before'&&resolved!==manifest.productSha)fail('SHA_DRIFT','Before must use P0');
    const deps=realpathSync(card.dependenciesRoot), lock=execFileSync('git',['show',resolved+':pnpm-lock.yaml'],{cwd:ROOT});
    if(hash(lock)!==manifest.lockfileSha256||hash(readFileSync(join(deps,'pnpm-lock.yaml')))!==manifest.lockfileSha256)fail('LOCKFILE_DRIFT','Frozen lock gate');
    temporary=mkdtempSync(join(tmpdir(),'t06-source-'));const snapshot=join(temporary,'archive');mkdirSync(snapshot);
    record('temporary-owned',{temporary,snapshot,cleanup:'retained; no independently established browser descendant quiescence'});
    const archive=child('archive','git',['archive',resolved]),tar=child('tar','tar',['-x','-C',snapshot],{stdin:'pipe'});
    await deadline(()=>pipeline(archive.proc.stdout,tar.proc.stdin),120000,'ARCHIVE_DEADLINE');
    await Promise.all([deadline(()=>archive.done,5000),deadline(()=>tar.done,5000)]);childResult(archive);childResult(tar);
    if(hash(readFileSync(join(snapshot,'pnpm-lock.yaml')))!==manifest.lockfileSha256)fail('LOCKFILE_DRIFT','Extracted lock');
    symlinkSync(join(deps,'node_modules'),join(snapshot,'node_modules'));
    for(const name of readdirSync(join(snapshot,'packages')))if(existsSync(join(deps,'packages',name,'node_modules')))symlinkSync(join(deps,'packages',name,'node_modules'),join(snapshot,'packages',name,'node_modules'));
    if(existsSync(join(deps,'apps/web/node_modules')))symlinkSync(join(deps,'apps/web/node_modules'),join(snapshot,'apps/web/node_modules'));
    const aliases=archiveAliases(snapshot,record),frozen=extractFrozen(execFileSync('git',['show',manifest.pixelSource.commit+':'+manifest.pixelSource.path],{cwd:ROOT,encoding:'utf8'}));record('frozen-method',{hash:frozen.hash,blockHash:frozen.blockHash});
    if(item.kind==='command') { const command=child('command','pnpm',item.command,{cwd:snapshot});await deadline(()=>command.done,item.deadlineMs,'COMMAND_DEADLINE');childResult(command);outcome.status='PASS';return outcome; }
    if(item.kind==='external')fail('EXTERNAL_VERDICT','Actual vendor/raw verdict and fresh final acceptance must be supplied by independent separate actors');
    if(item.dependencies.includes('genuine-host-account-adapter'))fail('HOST_IDENTITY_PRECONDITION','No qualified synthetic genuine-account host adapter at this source version');
    if(item.dependencies.includes('qualified-frozen-focus-adapter'))fail('FOCUS_PRECONDITION','Canonical pixelFocusWalk is hash-bound; adapter/Clock foundation remains unqualified');
    if(item.dependencies.includes('qualified-browser-200-percent-zoom-adapter'))fail('ZOOM_PRECONDITION','Actual browser zoom adapter unavailable. Device/page emulation is not 200% browser zoom');
    if((item.lane==='host'||item.lane==='visual')&&Object.keys(process.env).some(name=>name.startsWith('VITE_')))fail('HOST_ENV_PRECONDITION','Inherited VITE environment is not an isolated synthetic host; values are not logged');
    let url;
    if(item.lane==='host'||item.lane==='visual') {
      const viteFile=realpathSync(join(snapshot,'apps/web/node_modules/vite/dist/node/index.js'));
      const {createServer:makeVite}=await import(pathToFileURL(viteFile));server=await makeVite(hostConfig(snapshot,aliases.vite));await deadline(()=>server.listen(),5000,'SERVER_LAUNCH');
      url=server.resolvedUrls.local[0].replace(/\/$/,'')+item.route;
      finalizers.push(['vite-close',()=>server.close()]);
    } else {
      const esbuildFile=realpathSync(join(deps,'node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js'));
      const {build}=await import(pathToFileURL(esbuildFile));
      const fixture=readFileSync(join(HERE,'fixture.tsx'),'utf8');
      const built=await deadline(()=>build({stdin:{contents:fixture,resolveDir:join(snapshot,'docs/reviews/audit-parallel-task06-runner-source-r1'),loader:'tsx'},plugins:[aliases.esbuild],bundle:true,format:'esm',write:false,outfile:'evidence.js',loader:{'.svg':'dataurl','.png':'dataurl'},nodePaths:[join(deps,'apps/web/node_modules')],define:{'import.meta.env':'{}'}}),30000,'FIXTURE_BUILD');
      const javascript=built.outputFiles.find(x=>x.path.endsWith('.js')).text,css=built.outputFiles.find(x=>x.path.endsWith('.css'))?.text??'';
      server=createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="root"></div><script>window.__T06_CONFIG='+JSON.stringify(item).replaceAll('<','\\u003c')+'</script><script type="module">'+javascript+'</script>');});
      await deadline(()=>new Promise((res,rej)=>{server.once('error',rej);server.listen(0,'127.0.0.1',res);}),5000,'SERVER_LAUNCH');url='http://127.0.0.1:'+server.address().port;
      finalizers.push(['server-close',()=>new Promise((res,rej)=>{server.closeAllConnections();server.close(e=>e?rej(e):res());})]);
    }
    const chrome=child('chrome',card.chromeBinary,['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-pipe','--user-data-dir='+join(temporary,'profile'),'about:blank'],{extraPipes:true});
    const pipe=pipeTransport(chrome.proc,record);finalizers.unshift(['chrome-close',async()=>{try{await deadline(()=>pipe.send('Browser.close'),500,'CDP_CLOSE');}catch(e){record('cdp-close-note',info(e));}await stopChild(chrome,record);childResult(chrome,{permitSignal:true});}]);
    const {targetId}=await pipe.send('Target.createTarget',{url:'about:blank'}),{sessionId}=await pipe.send('Target.attachToTarget',{targetId,flatten:true});
    const p={expectedKeys:[],send:(m,a)=>pipe.send(m,a,sessionId)};await p.send('Runtime.enable');await p.send('Page.enable');await p.send('Accessibility.enable');
    await p.send('Emulation.setDeviceMetricsOverride',{width:item.viewport?.width??1440,height:item.viewport?.height??900,deviceScaleFactor:1,mobile:false});
    if(item.lane==='host'||item.lane==='visual') {
      const preferences={xai_pref_lang:item.lang,xai_pref_theme:item.theme??'light',xai_pref_density:item.productDensity??'comfortable',xai_pref_features_tasks:item.variant!=='disabled'};
      await p.send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const id='mock-user',prefix='xai:account:v1:'+id+':';localStorage.setItem(prefix+'committed-generation',JSON.stringify({generation:'g1',migrationId:'t06-host-visual-fixture',previous:null}));for(const [key,value] of Object.entries(${JSON.stringify(preferences)}))localStorage.setItem(prefix+'g1:'+encodeURIComponent(key),JSON.stringify(value));window.__T06_HOST_AUDIT=[];for(const type of ['keydown','keypress','keyup'])document.addEventListener(type,e=>__T06_HOST_AUDIT.push({type,key:e.key,trusted:e.isTrusted}),true);})()`});
    }
    await p.send('Page.navigate',{url});
    outcome.checks=await deadline(()=>business(p,item,writeArtifact,record),item.deadlineMs,'CASE_DEADLINE');
    writeArtifact('screenshot.png',Buffer.from((await p.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
    writeArtifact('ax-tree.json',await p.send('Accessibility.getFullAXTree'));
    checkOracle(outcome.checks);outcome.status='PASS';
  } catch(e) {
    outcome.primary={...info(e),detail:e.detail??null};
    // P0 failures remain FAIL; only exact contract-known assertions get an expectation annotation.
    if(card.phase==='before'&&e.code==='ORACLE_FAILURE')outcome.expectedBeforeFailures=(e.detail.failed??[]).filter(x=>item.expectedP0FailureIds.includes(x.id)).map(x=>x.id);
    record('primary-error',outcome.primary);
  } finally {
    finalizers.push(['all-owned-child-streams',async()=>{for(const owner of owners){await stopChild(owner,record);if(owner.command!==card.chromeBinary)childResult(owner);if(owner.errors.length)fail('STREAM_PERSISTENCE','Late stream error',{errors:owner.errors});}}]);
    await finalize({log,outcome,finalizers,summary:pathFor('outcome.json')});
  }
  return outcome;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.length!==4) {process.stderr.write('Usage: node driver.mjs <separately-registered-root-card.json> <exact-case-id>\n');process.exitCode=2;}
  else {run(process.argv[2],process.argv[3]).then(result=>{process.exitCode=result.status==='PASS'?0:1;}).catch(e=>{process.stderr.write(JSON.stringify(info(e))+'\n');process.exitCode=2;});}
}

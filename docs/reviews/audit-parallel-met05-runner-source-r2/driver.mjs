import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, open, readFile, realpath, lstat, readdir } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { resolve, join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
export const HERE=dirname(fileURLToPath(import.meta.url));
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
export class Refusal extends Error {
  constructor(code,detail,causal={}) { super(`${code}: ${detail}`);this.name='Refusal';this.code=code;Object.assign(this,causal); }
}
export function requireThat(value,code,detail='',causal={}) { if(!value)throw new Refusal(code,detail,causal); }
export const contained=(root,path)=>{const p=relative(root,path);return p===''||(!p.startsWith(`..${sep}`)&&p!=='..'&&!p.startsWith(sep));};
export const assertHash=(bytes,hash,label)=>requireThat(sha256(bytes)===hash,'HASH',label,{stage:'source-hash',faultId:label,value:sha256(bytes),counter:1});
export const assertAlias=(root,path)=>requireThat(contained(root,path),'ALIAS',path,{stage:'resolve',faultId:'resolver-outside',value:path,counter:1});
export const readManifest=async()=>JSON.parse(await readFile(join(HERE,'execution-manifest.json'),'utf8'));
export function assertTrust(dispatch,events,disabled=false) {
  requireThat(dispatch.transport==='cdp-pipe'&&dispatch.hitVerified,'TRUST','pipe real hit required');
  requireThat(events.every(e=>e.isTrusted),'TRUST','passive event was untrusted',{stage:'passive-audit',faultId:'untrusted-dom',value:events,counter:events.filter(e=>!e.isTrusted).length});
  requireThat(disabled||events.length>0,'TRUST','enabled action lacks passive audit');
}
function business(value,faultId,observed) {requireThat(value,'BUSINESS',faultId,{stage:'observation',faultId,value:observed,counter:1});}
export function plannedOracle(s) {
  business(s?.module==='actual-metrics','missing-module',s?.module);
  const weight=s.tabs.find(t=>t.id==='weight');
  business(weight?.present===true&&!weight.disabled&&weight.selected,'missing-weight',weight);
  business(s.log?.present===true&&!s.log.disabled&&s.log.label===(s.lang==='zh'?'记一下':'Log'),'missing-log',s.log);
  business(s.tabs?.length===5,'tab-census',s.tabs);
  for(const [id,en,zh] of [['sleep','Sleep','睡眠'],['water','Water','饮水'],['exercise','Exercise','运动'],['custom','Custom','自定义']]) {
    const t=s.tabs.find(t=>t.id===id);
    business(t?.present===true&&t.disabled&&!t.selected&&t.text.includes(s.lang==='zh'?zh:en)&&t.text.includes(s.lang==='zh'?'计划中':'Planned'),`missing-${id}`,t);
  }
  business(s.scope?.kind==='account'&&s.scope.accountId&&s.scope.generation&&Number.isInteger(s.scope.epoch)&&s.key===s.actualPhysicalKey,'scope-key',s);
  business(s.wrongKeyAttempts?.length===0,'wrong-key',s.wrongKeyAttempts);
}
const stableView=s=>({url:s.url,content:s.content,dialogs:s.dialogs,tabs:s.tabs.map(({id,text,disabled,selected,present})=>({id,text,disabled,selected,present})),scope:s.scope,key:s.key,bytes:s.bytes,records:s.renderedRecords,target:s.target});
export function noEffect(before,after) {
  business(after.wrongKeyAttempts?.length===0,'wrong-key',after.wrongKeyAttempts);
  business(after.writes===before.writes&&after.removes===before.removes,'enabled-sideeffect',{before:[before.writes,before.removes],after:[after.writes,after.removes]});
  business(isDeepStrictEqual(stableView(before),stableView(after)),'selected-after',{before:stableView(before),after:stableView(after)});
  plannedOracle(after);
}

export function loggedOracle(before,after,value,note,{reload=false,denied=0}={}) {
  plannedOracle(after);const state=JSON.parse(after.bytes[after.key]);const old=JSON.parse(before.bytes[before.key]);
  const record=state.records?.[0];
  business(state.activeMetricId==='weight'&&state.records.length===1&&record.metricId==='weight'&&record.value===value&&record.unit==='kg'&&record.note===note,'exact-weight-record',state);
  business(isDeepStrictEqual(state.profile,old.profile),'profile-preserved',state.profile);
  for(const [key,raw] of Object.entries(before.bytes))if(key!==before.key)business(after.bytes[key]===raw,'other-bytes-preserved',{key,raw:after.bytes[key]});
  business(after.renderedRecords?.length===1&&after.renderedRecords[0].weight===`${value.toFixed(1)} kg`&&after.renderedRecords[0].note===note,'missing-rendered-record',after.renderedRecords);
  if(reload)business(after.writes===0&&after.removes===0,'normalization-write',after.events);
  else {
    const events=after.events.slice(before.events.length);
    business(events.length===1+denied&&events.every(e=>e.type==='set'&&e.key===after.key)&&events.filter(e=>e.denied).length===denied&&events.at(-1)?.denied===false&&after.removes===before.removes,'attempt-sequence',events);
  }
}
export function firstRenderOracle(s,account,target) {
  plannedOracle(s);business(s.scope.accountId===account&&s.target===`${target.toFixed(1)}kg`,'account-sentinel',{account:s.scope.accountId,target:s.target});
  const rows=s.firstRender.filter(r=>r.accountId===account&&r.kind==='account'&&r.epoch===s.scope.epoch);
  business(rows.length>0&&rows.every(r=>r.rendered&&r.generation===s.scope.generation&&r.epoch===s.scope.epoch&&r.key===s.actualPhysicalKey&&r.authOwner===account&&r.target===`${target.toFixed(1)}kg`),'wrong-first-render',rows);
}
export function admissionUnit(unit,admission,m) {
  const bound=admission.units?.find(u=>u.id===unit);const purpose=m.units[unit];
  requireThat(bound&&bound.purposeHash===sha256(JSON.stringify(purpose))&&bound.cap===3&&Number.isInteger(bound.total)&&bound.total>=0&&bound.total<3&&bound.completeHistory===true&&Array.isArray(bound.history)&&bound.history.length===bound.total,'BUDGET',unit);
  requireThat(isDeepStrictEqual(bound.rows,purpose.rows),'ROWS',unit);
  requireThat(bound.history.every(h=>typeof h.invocation==='string'&&typeof h.actor==='string'&&/^[a-f0-9]{64}$/.test(h.receiptHash)&&['PASS','FAIL','REFUSED','BLOCKED'].includes(h.outcome)),'HISTORY',unit);
  if(unit==='REL-05/metrics-native-save-retry')requireThat(bound.total>=2&&bound.reconciliation?.lowerBound===2&&bound.reconciliation?.complete===true&&bound.reconciliation.originalSources?.includes('15be421d5c467fbdda2c52e94322917795cad79c')&&bound.reconciliation.originalSources?.includes('a61f92d1076f4ffcdba446347c72cdd455214877'),'BUDGET','M8 retained lower bound 2, complete lifetime unknown unless exact independent reconciliation supplied');
}
export async function safeDirectory(path,{create=false}={}) {
  const absolute=resolve(path);let cursor=sep;
  for(const part of absolute.split(sep).filter(Boolean)) {
    cursor=join(cursor,part);let stat;try{stat=await lstat(cursor);}catch(e){if(e.code!=='ENOENT'||!create)throw e;await mkdir(cursor);stat=await lstat(cursor);}
    requireThat(stat.isDirectory()&&!stat.isSymbolicLink(),'PATH','symlink/non-directory parent');
  }
  requireThat(await realpath(absolute)===absolute,'PATH','realpath differs');return absolute;
}
export async function durableFile(path,bytes) {
  await safeDirectory(dirname(path),{create:true});const h=await open(path,'wx');let failure;
  try{await h.writeFile(bytes);await h.sync();}catch(e){failure=e;}finally{try{await h.close();}catch(e){failure??=e;}}
  if(failure)throw failure;
  const d=await open(dirname(path),'r');try{await d.sync();}finally{await d.close();}
  return {path,bytes:Buffer.byteLength(bytes),hash:sha256(bytes)};
}
/** Ownership is acquired before invoking work/spawning. A timeout fences every writer,
 * aborts cooperative tasks, kills groups and joins, or records honest quarantine. */
export class Owner {
  constructor({joinMs=5000}={}) {this.controller=new AbortController();this.joinMs=joinMs;this.tasks=new Map();this.children=new Set();this.faults=[];this.fenced=false;this.quarantined=[];this.closed=false;}
  fail(error,stage) {this.faults.push({stage,error:String(error),code:error.code??'ERROR',faultId:error.faultId,value:error.value,counter:error.counter});return error;}
  assert() {requireThat(!this.fenced&&!this.closed,'FENCED','owned writer cancelled');}
  task(name,fn,ms=120000) {
    this.assert();requireThat(!this.tasks.has(name),'TASK','duplicate');
    const row={name,settled:false};this.tasks.set(name,row);
    row.promise=new Promise((resolveTask,rejectTask)=>{
      const timer=setTimeout(()=>{const error=new Refusal('DEADLINE',name,{stage:'task',faultId:name,value:'expired',counter:1});this.fail(error,'deadline');this.cancel();rejectTask(error);},ms);
      Promise.resolve().then(()=>fn(this.controller.signal)).then(v=>{row.value=v;resolveTask(v);},e=>{row.error=e;this.fail(e,name);rejectTask(e);}).finally(()=>{row.settled=true;clearTimeout(timer);});
    });row.promise.catch(()=>{});return row.promise;
  }
  spawn(command,args,{cwd,env,stdio=['ignore','pipe','pipe'],name=command}={}) {
    this.assert();const child=spawn(command,args,{cwd,env,stdio,detached:true});
    const row={name,child,closed:false,expectedStop:false,streams:[],outcome:null};this.children.add(row);
    row.closedPromise=new Promise(r=>{child.once('error',e=>{this.fail(e,`${name}:spawn`);row.spawnError=e;});child.once('close',(code,signal)=>{row.closed=true;row.outcome={code,signal,spawnError:row.spawnError&&String(row.spawnError)};if((!row.expectedStop&&(code!==0||signal||row.spawnError))||(row.expectedStop&&((code!==0&&signal===null)||row.spawnError)))this.fail(new Refusal('CHILD',name,{stage:'child-close',faultId:'child-late-exit',value:row.outcome,counter:1}),name);r(row.outcome);});});return row;
  }
  stream(row,source,path) {
    this.assert();const out=createWriteStream(path,{flags:'wx'});const task={path,source,out,settled:false};row.streams.push(task);
    task.promise=pipeline(source,out).catch(e=>{this.fail(e,`${row.name}:stream`);throw e;}).finally(()=>{task.settled=true;});task.promise.catch(()=>{});return task.promise;
  }
  kill(row,signal) {if(row.child.pid)try{process.kill(-row.child.pid,signal);}catch(e){if(e.code!=='ESRCH')this.fail(e,`${row.name}:kill`);}}
  cancel() {if(this.fenced)return;this.fenced=true;this.controller.abort();for(const row of this.children){row.expectedStop=true;this.kill(row,'SIGTERM');}}
  async waitSettlement(check,name,ms=this.joinMs) {const until=Date.now()+ms;while(!check()&&Date.now()<until)await new Promise(r=>setTimeout(r,20));if(!check()){this.quarantined.push(name);this.fail(new Refusal('QUARANTINE',name,{stage:'join',faultId:'unjoined-resource',value:name,counter:1}),'join');return false;}return true;}
  async stop() {
    if(this.closed)return {faults:this.faults,quarantined:this.quarantined};
    this.cancel();
    // Each group independently receives TERM/KILL even if another group/stream fails.
    for(const row of this.children){await this.waitSettlement(()=>row.closed,`${row.name}:TERM`,1000);this.kill(row,'SIGKILL');if(!row.closed)await this.waitSettlement(()=>row.closed,`${row.name}:KILL`);for(const task of row.streams){if(!task.settled){await this.waitSettlement(()=>task.settled,`${row.name}:flush`,1000);if(!task.settled){task.source.destroy(new Refusal('STREAM_RETAINED',row.name));task.out.destroy();await this.waitSettlement(()=>task.settled,`${row.name}:destroyed-stream`);}}if(task.settled){try{await task.promise;if(task.path){const h=await open(task.path,'r+');try{await h.sync();}finally{await h.close();}}}catch(e){this.fail(e,'stream-sync');}}}}
    for(const row of this.tasks.values())await this.waitSettlement(()=>row.settled,`task:${row.name}`);
    this.closed=true;return {faults:this.faults,quarantined:this.quarantined};
  }
  terminalCheck() {requireThat(this.faults.length===0&&this.quarantined.length===0,'OWNED_FAILURE',JSON.stringify(this.faults));}
}
export class Journal {
  static async create(path,owner) {return new Journal(await open(path,'wx'),owner);}
  constructor(handle,owner) {this.handle=handle;this.owner=owner;this.tail=Promise.resolve();this.sequence=0;this.faults=[];this.closed=false;}
  record(kind,data={}) {requireThat(!this.closed,'JOURNAL_CLOSED',kind);const row={seq:++this.sequence,time:new Date().toISOString(),kind,...data};const pending=this.tail.then(async()=>{await this.handle.write(`${JSON.stringify(row)}\n`);await this.handle.sync();});this.tail=pending.catch(e=>{this.faults.push(String(e));this.owner?.fail(e,'journal');});return pending;}
  async close() {let failure;try{await this.tail;await this.handle.sync();}catch(e){failure=e;this.faults.push(String(e));}finally{try{await this.handle.close();}catch(e){failure??=e;this.faults.push(String(e));}this.closed=true;}if(failure)throw failure;requireThat(this.faults.length===0,'JOURNAL_FAILURE',JSON.stringify(this.faults));}
}
export class Artifacts {
  constructor(root,required,optional=[],owner) {this.root=resolve(root);this.required=new Set(required);this.allowed=new Set([...required,...optional]);this.written=new Map();this.owner=owner;this.sealed=false;}
  path(path) {requireThat(!this.sealed&&!path.split('/').includes('..')&&!path.startsWith('/')&&this.allowed.has(path),'OUTPUT',path);const target=resolve(this.root,path);assertAlias(this.root,target);return target;}
  async write(path,bytes) {this.owner?.assert();const result=await durableFile(this.path(path),bytes);this.written.set(path,result);return result;}
  async census({exclude=[],scratch=[]}={}) {
    const files=[];const visit=async dir=>{for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name),rel=relative(this.root,p);requireThat(!e.isSymbolicLink(),'PATH',rel);if(scratch.includes(rel))continue;if(e.isDirectory())await visit(p);else{requireThat(e.isFile(),'PATH',rel);files.push(rel);}}};await visit(this.root);
    const extra=files.filter(f=>!this.allowed.has(f)&&!exclude.includes(f));const missing=[...this.required].filter(f=>!files.includes(f)&&!exclude.includes(f));const records=[];
    for(const file of files.filter(f=>!exclude.includes(f))){const bytes=await readFile(join(this.root,file));records.push({path:file,bytes:bytes.length,hash:sha256(bytes)});}
    return {required:[...this.required],files:records,extra,missing,complete:extra.length===0&&missing.length===0};
  }
}
export async function loggedChild(command,args,{cwd,prefix,journal,owner,env,ms=120000}) {
  const row=owner.spawn(command,args,{cwd,env,name:prefix});owner.stream(row,row.child.stdout,`${prefix}.stdout.log`);owner.stream(row,row.child.stderr,`${prefix}.stderr.log`);
  await owner.task(`child:${prefix}`,async()=>{await row.closedPromise;for(const t of row.streams)await t.promise;requireThat(row.outcome.code===0&&!row.spawnError,'CHILD',prefix,{stage:'child-close',faultId:'child-late-exit',value:row.outcome,counter:1});},ms);
  await journal.record('child-complete',{command,args,...row.outcome});return row;
}
export async function archive(repo,requested,destination,journal,prefix,owner,{breakStream=false,tarCommand=null}={}) {
  requireThat(/^[a-f0-9]{40}$/.test(requested),'SHA','full requested SHA');const resolved=execFileSync('git',['rev-parse',`${requested}^{commit}`],{cwd:repo,encoding:'utf8'}).trim();requireThat(requested===resolved,'SHA','requested/resolved differ');await mkdir(destination);
  const git=owner.spawn('git',['archive','--format=tar',resolved],{cwd:repo,name:'archive-git'});const tar=owner.spawn(tarCommand?.[0]??'tar',tarCommand?.slice(1)??['-xf','-','-C',destination],{cwd:repo,stdio:['pipe','pipe','pipe'],name:'archive-tar'});
  owner.stream(git,git.child.stderr,`${prefix}.archive.stderr.log`);owner.stream(tar,tar.child.stderr,`${prefix}.tar.stderr.log`);owner.stream(tar,tar.child.stdout,`${prefix}.tar.stdout.log`);
  let bytes=0;const digest=createHash('sha256');const transform=new Transform({transform(chunk,encoding,done){bytes+=chunk.length;digest.update(chunk);if(breakStream)done(new Refusal('ARCHIVE_STREAM','injected broken stream',{stage:'archive-stream',faultId:'archive-stream',value:'broken',counter:bytes}));else done(null,chunk);}});
  const pipe={settled:false,source:git.child.stdout,out:tar.child.stdin,path:null};git.streams.push(pipe);pipe.promise=pipeline(git.child.stdout,transform,tar.child.stdin).catch(e=>{owner.fail(e,'archive-stream');throw e;}).finally(()=>pipe.settled=true);pipe.promise.catch(()=>{});
  await owner.task('archive',async()=>{await pipe.promise;await Promise.all([git.closedPromise,tar.closedPromise]);for(const row of [git,tar])for(const s of row.streams)await s.promise;requireThat(git.outcome.code===0&&tar.outcome.code===0,'ARCHIVE_CHILD','late archive/tar failure',{stage:'archive-close',faultId:'archive-late-tar',value:[git.outcome,tar.outcome],counter:1});},120000);
  const result={requested,resolved,bytes,hash:digest.digest('hex')};await journal.record('archive-complete',result);return result;
}
export class PipeCDP {
  constructor(child,journal,owner,ms=10000) {
    Object.assign(this,{child,journal,owner,ms});this.next=0;this.pending=new Map();this.events=[];this.buffer=Buffer.alloc(0);this.faults=[];this.closing=false;this.ended=false;
    child.stdio[4].on('data',chunk=>this.parse(chunk));child.stdio[4].on('end',()=>{this.ended=true;if(this.buffer.length)this.fail('CDP_TRUNCATED','unfinished NUL frame','parser-truncated',this.buffer.toString());else if(!this.closing)this.fail('CDP_IDLE_CLOSE','idle pipe ended','parser-idle','end');});
    child.stdio[4].on('error',e=>this.fail('CDP_PIPE',String(e),'parser-idle',String(e)));
    child.on('error',e=>this.fail('CDP_CHILD',String(e),'child-late-exit',String(e)));child.on('close',(code,signal)=>{if(!this.closing)this.fail('CDP_IDLE_CLOSE','unexpected process close','child-late-exit',{code,signal});});
  }
  fail(code,detail,faultId,value) {const e=new Refusal(code,detail,{stage:'cdp-parser',faultId,value,counter:1});this.faults.push(e);this.owner.fail(e,'cdp');for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(e);}this.pending.clear();}
  parse(chunk) {
    this.buffer=Buffer.concat([this.buffer,chunk]);if(this.buffer.length>16*1024*1024){this.fail('CDP_FRAME','oversized frame','parser-idle',this.buffer.length);return;}
    let end;while((end=this.buffer.indexOf(0))>=0){const bytes=this.buffer.subarray(0,end);this.buffer=this.buffer.subarray(end+1);if(!bytes.length){this.fail('CDP_FRAME','empty frame','parser-idle','empty');continue;}let msg;try{msg=JSON.parse(bytes);}catch(e){this.fail('CDP_PARSE',String(e),'parser-idle',bytes.toString());continue;}
      if(Object.hasOwn(msg,'id')){const p=this.pending.get(msg.id);if(!p){this.fail('CDP_ID','unknown response ID','parser-idle',msg.id);continue;}clearTimeout(p.timer);this.pending.delete(msg.id);msg.error?p.reject(new Refusal('CDP_COMMAND',JSON.stringify(msg.error))):p.resolve(msg.result);}
      else {if(typeof msg.method!=='string'){this.fail('CDP_SCHEMA','event method missing','parser-idle',msg);continue;}this.events.push(msg);if(msg.method==='Runtime.exceptionThrown'||msg.method==='Inspector.targetCrashed'||msg.method==='Page.javascriptDialogOpening')this.fail('PAGE_FAULT',msg.method,'page-exception',msg.params);this.journal.record('cdp-event',{message:msg}).catch(e=>this.fail('CDP_JOURNAL',String(e),'journal-flush',String(e)));}
    }
  }
  send(method,params={},sessionId) {
    this.owner.assert();requireThat(!this.faults.length,'CDP_STICKY',String(this.faults));requireThat(!Object.hasOwn(params,'nativeVirtualKeyCode'),'K-1',method);const id=++this.next;
    return new Promise((resolveResult,reject)=>{const timer=setTimeout(()=>this.fail('CDP_DEADLINE',method,'parser-idle',method),this.ms);this.pending.set(id,{resolve:resolveResult,reject,timer});this.child.stdio[3].write(`${JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})}\0`,e=>{if(e)this.fail('CDP_WRITE',String(e),'parser-idle',String(e));});});
  }
  terminal() {requireThat(this.pending.size===0&&this.buffer.length===0&&this.faults.length===0,'CDP_TERMINAL',JSON.stringify(this.faults));}
}
export class Observer {
  constructor(cdp,session,artifacts,journal,owner) {Object.assign(this,{cdp,session,artifacts,journal,owner});this.dispatches=[];this.documents=[];}
  command(method,params={}) {return this.cdp.send(method,params,this.session);}
  async evaluate(expression) {this.owner.assert();const r=await this.command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});requireThat(!r.exceptionDetails,'PAGE',JSON.stringify(r.exceptionDetails));return r.result.value;}
  async wait(expression,ms=10000) {const end=Date.now()+ms;while(Date.now()<end){this.owner.assert();if(await this.evaluate(expression))return;await new Promise(r=>setTimeout(r,30));}throw new Refusal('SETTLE',expression);}
  async documentBarrier(action,requested) {
    const old=await this.evaluate('window.__met05?.documentId ?? null');const tree=await this.command('Page.getFrameTree');const oldLoader=tree.frameTree.frame.loaderId;const start=this.cdp.events.length;const result=await action();requireThat(!result.errorText,'NAVIGATION',result.errorText);
    const end=Date.now()+10000;let frame;while(Date.now()<end){this.owner.assert();frame=(await this.command('Page.getFrameTree')).frameTree.frame;if(frame.loaderId!==oldLoader&&frame.loaderId&&(await this.evaluate('window.__met05?.documentId ?? null'))!==old)break;await new Promise(r=>setTimeout(r,30));}
    const current=await this.evaluate('window.__met05?.documentId ?? null');requireThat(frame.loaderId!==oldLoader&&current&&current!==old,'STALE_DOCUMENT','new loader and new fixture document required',{stage:'document-barrier',faultId:'stale-document',value:{old,current,oldLoader,loader:frame.loaderId},counter:1});
    const barrier={old,current,oldLoader,loader:frame.loaderId,requested,actual:frame.url,events:this.cdp.events.slice(start).filter(e=>e.method==='Page.frameNavigated'||e.method==='Page.lifecycleEvent')};this.documents.push(barrier);await this.journal.record('document-barrier',barrier);return barrier;
  }
  async settled() {const s=await this.evaluate('window.__met05.settle()');requireThat(s.stable&&s.pending===0&&s.errors.length===0,'SETTLE','fixture stable state/source/storage gate/effects',s);return s;}
  async mount(url,cfg,{metrics=true}={}) {
    await this.command('Emulation.setDeviceMetricsOverride',{width:cfg.width??1440,height:cfg.height??900,deviceScaleFactor:cfg.dpr??1,mobile:false});await this.documentBarrier(()=>this.command('Page.navigate',{url}),url);await this.wait('window.__met05.authReady');
    const auth=await this.evaluate('window.__met05.authState');if(auth!=='authenticated')await this.evaluate('window.__met05.publishIdentity("met05-synthetic-A")');
    await this.wait(metrics?'window.__met05.ready && !!document.querySelector(".module-metrics")':'window.__met05.ready && !!document.querySelector(".app-rail")');await this.settled();
  }
  async reload() {const url=await this.evaluate('location.href');await this.documentBarrier(()=>this.command('Page.reload'),url);await this.wait('window.__met05.ready && !!document.querySelector(".module-metrics")');await this.settled();}
  snapshot() {return this.evaluate('window.__met05.observe()');}
  async capture(id) {await this.artifacts.write(`${id}.dom.json`,JSON.stringify(await this.snapshot(),null,2));await this.artifacts.write(`${id}.ax.json`,JSON.stringify(await this.command('Accessibility.getFullAXTree'),null,2));const shot=await this.command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await this.artifacts.write(`${id}.png`,Buffer.from(shot.data,'base64'));}
  async pointer(selector) {
    const hit=await this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,h=document.elementFromPoint(x,y);return {x,y,ok:x>=0&&y>=0&&x<innerWidth&&y<innerHeight&&(h===e||e.contains(h)),disabled:e.disabled};})()`);requireThat(hit?.ok,'HIT',selector);
    const start=await this.evaluate('window.__met05.audit.length');for(const type of ['mouseMoved','mousePressed','mouseReleased'])await this.command('Input.dispatchMouseEvent',{type,x:hit.x,y:hit.y,...(type==='mouseMoved'?{}:{button:'left',clickCount:1})});await this.settled();const audit=await this.evaluate(`window.__met05.audit.slice(${start}).filter(e=>['mousedown','mouseup','click'].includes(e.type))`);const dispatch={transport:'cdp-pipe',hitVerified:true,selector,...hit};assertTrust(dispatch,audit,hit.disabled);this.dispatches.push({dispatch,audit});await this.journal.record('pointer',{dispatch,audit});return dispatch;
  }
  async key(key,modifiers=0) {
    const code={Tab:'Tab',Enter:'Enter',' ':'Space',Backspace:'Backspace',a:'KeyA',k:'KeyK'}[key];requireThat(code,'KEY',key);const start=await this.evaluate('window.__met05.audit.length');for(const type of ['keyDown','keyUp'])await this.command('Input.dispatchKeyEvent',{type,key,code,modifiers,...(key===' '&&type==='keyDown'?{text:' '}:{})});const events=await this.evaluate(`window.__met05.audit.slice(${start}).filter(e=>e.type==='keydown'||e.type==='keyup')`);requireThat(events.length===2&&events.every(e=>e.isTrusted&&e.key===key),'KEY_AUDIT',key);await this.journal.record('key',{key,modifiers,events});
  }
  async enter(selector,text) {await this.pointer(selector);await this.key('a',4);await this.key('Backspace');await this.command('Input.insertText',{text});await this.settled();}
  async log(lang,value,note) {await this.pointer('.mt-primary');await this.wait('!!document.querySelector(".mt-modal-card")');await this.enter('.mt-modal-card input[inputmode="decimal"]',String(value));await this.enter('.mt-modal-card textarea',note);await this.pointer('.mt-save');await this.wait('!document.querySelector(".mt-modal-card") || !!document.querySelector(".mt-save-failure")');await this.settled();}
  async stripScroll(direction) {const p=await this.evaluate('(()=>{const r=document.querySelector(".mt-tabs").getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()');await this.command('Input.dispatchMouseEvent',{type:'mouseWheel',...p,deltaX:direction*240,deltaY:0});await this.settled();}
}
export async function runRows(o,rows,{origin,m,artifacts}) {
  const {sourceGate}=await import('./source-gate.mjs');const host=await import('./host-adapter.mjs');const focus=await import('./focus-adapter.mjs');const results=[];
  for(const row of rows) {
    o.owner.assert();if(row.kind==='source'){await sourceGate({m,row,archiveRoot:join(artifacts.root,'archive'),artifacts});results.push({id:row.id,status:'STATIC_OBSERVED_PENDING_REVIEW'});continue;}
    requireThat(row.kind!=='qualification','LANE','M9 executed separately admitted qualification');
    if(row.kind==='keyboard')await focus.walk(row,o,artifacts); // precise frozen-context refusal, never a fake walk
    const cfg=m.configurations.find(c=>c.id===row.config)??row;const query=`__met_lang=${cfg.lang}&__met_theme=${cfg.theme??'light'}&__met_lane=host`;const start=row.kind==='entry'&&['rail','cmdk'].includes(row.entry)?'/app/dashboard':'/app/metrics';
    await o.mount(`${origin}${start}?${query}`,cfg,{metrics:start==='/app/metrics'});const mountBoundary=await o.evaluate('window.__met05.settledBoundary()');requireThat(mountBoundary.priorMountEvents.length===0,'MOUNT_ATTEMPT','mount attempted metric set/remove',{stage:'normalization',faultId:'normalization-write',value:mountBoundary.priorMountEvents,counter:mountBoundary.priorMountEvents.length});const before=await o.snapshot();if(start==='/app/metrics')plannedOracle(before);
    if(row.kind==='surface'){await host.surface(row,o);await o.capture(row.id);}
    if(row.kind==='pointer'){const n={weight:1,sleep:2,water:3,exercise:4}[row.metric];try{await o.pointer(`.mt-tabs button:nth-child(${n})`);}catch(e){if(e.code!=='HIT')throw e;await o.stripScroll(1);await o.pointer(`.mt-tabs button:nth-child(${n})`);}noEffect(before,await o.snapshot());}
    if(row.kind==='weight-positive'||row.kind==='retry') {
      await o.evaluate('window.__met05.resetEmptyFixture()');await o.reload();const empty=await o.snapshot();plannedOracle(empty);if(row.kind==='retry')await o.evaluate('window.__met05.denyOnce()');await o.log(row.lang??'en',71.25,row.id);
      if(row.kind==='retry'){const failed=await o.snapshot();plannedOracle(failed);business(failed.failureVisible&&isDeepStrictEqual(empty.bytes,failed.bytes)&&failed.events.length===1&&failed.events[0].denied&&failed.events[0].key===failed.key,'denied-attempt',failed);await o.pointer('.mt-save-failure button:first-of-type');await o.wait('!document.querySelector(".mt-save-failure")');await o.settled();}
      loggedOracle(empty,await o.snapshot(),71.25,row.id,{denied:row.kind==='retry'?1:0});await o.reload();loggedOracle(empty,await o.snapshot(),71.25,row.id,{reload:true});await o.capture(row.id);
    }
    if(row.kind==='entry'){await host.entry(row,o,origin);plannedOracle(await o.snapshot());await o.capture(row.id);}
    if(row.kind==='account-source'){await host.accountSource(row,o);await o.capture(row.id);}
    const after=await o.snapshot();results.push({id:row.id,status:'OBSERVED_PENDING_REVIEW'});await artifacts.write(`${row.id}.receipt.json`,JSON.stringify({row,before,after,document:o.documents.at(-1),status:'OBSERVED_PENDING_REVIEW'},null,2));await o.journal.record('row-observed',{row,before,after});
  }
  return results;
}
/** Called only by the typed outer launcher. No argv execution on import. */
export async function main(context) {
  const {m,admission,root,output,owner}=context;const artifacts=new Artifacts(output,admission.requiredArtifacts,admission.optionalArtifacts,owner);let journal,cdp,primary=null,result=null;const failures=[];
  try {
    journal=await Journal.create(join(output,'journal.jsonl'),owner);await artifacts.write('admission-copy.json',JSON.stringify(admission,null,2));await journal.record('invocation',{kind:admission.kind,reservation:admission.reservationId,actor:admission.actor});
    for(const unit of new Set(admission.rowIds.map(id=>m.rows.find(r=>r.id===id)?.unit)))admissionUnit(unit,admission,m);
    requireThat(!admission.rowIds.some(id=>m.rows.find(r=>r.id===id)?.kind==='keyboard'),'FOCUS_CONTEXT_GAP','M5 blocked before browser/source execution; new impact authorization required');
    const archived=await archive(root,m.productSHA,join(output,'archive'),journal,join(output,'archive'),owner);await artifacts.write('provenance.json',JSON.stringify({archived,product:m.productSHA,sourceParent:m.sourceParent,closure:m.productClosure},null,2));assertHash(await readFile(join(output,'archive/pnpm-lock.yaml')),m.lockHash,'lock');for(const source of m.productClosure)assertHash(await readFile(join(output,'archive',source.path)),source.hash,source.path);
    if(admission.rowIds.every(id=>m.rows.find(r=>r.id===id).kind==='source')){const {sourceGate}=await import('./source-gate.mjs');await sourceGate({m,row:m.rows.find(r=>r.id===admission.rowIds[0]),archiveRoot:join(output,'archive'),artifacts});result=[{id:'M1-source',status:'STATIC_OBSERVED_PENDING_REVIEW'}];}
    else{
    const host=await import('./host-adapter.mjs');const built=await host.build({...context,journal,artifacts});
    const browser=owner.spawn(admission.chrome.path,['--headless=new','--remote-debugging-pipe',`--user-data-dir=${join(output,'chrome-profile')}`,'--no-first-run','--no-default-browser-check','about:blank'],{cwd:root,env:built.env,stdio:['ignore','pipe','pipe','pipe','pipe'],name:'chrome'});owner.stream(browser,browser.child.stdout,join(output,'chrome.stdout.log'));owner.stream(browser,browser.child.stderr,join(output,'chrome.stderr.log'));
    cdp=new PipeCDP(browser.child,journal,owner);const target=await cdp.send('Target.createTarget',{url:'about:blank'});const attached=await cdp.send('Target.attachToTarget',{targetId:target.targetId,flatten:true});const o=new Observer(cdp,attached.sessionId,artifacts,journal,owner);for(const method of ['Page.enable','Runtime.enable','Accessibility.enable','Network.enable'])await o.command(method);await o.command('Page.setLifecycleEventsEnabled',{enabled:true});
    await o.command('Fetch.enable',{patterns:[{urlPattern:'*'}]});
    // All requests pause before network. Explicit localhost origin only; no external traffic.
    const requests=new Set();const poll=owner.task('network-guard',async signal=>{let index=0;while(!signal.aborted){while(index<cdp.events.length){const e=cdp.events[index++];if(e.method==='Fetch.requestPaused'){const url=e.params.request.url;requests.add(url);const legal=url.startsWith(`${built.origin}/`)||url==='about:blank'||url.startsWith('data:');if(!legal){await o.command('Fetch.failRequest',{requestId:e.params.requestId,errorReason:'BlockedByClient'});throw new Refusal('NETWORK','external request',{stage:'network',faultId:'nonlocal',value:url,counter:1});}await o.command('Fetch.continueRequest',{requestId:e.params.requestId});}}await new Promise(r=>setTimeout(r,10));}},m.runDeadlineMs);
    result=await owner.task('rows',()=>runRows(o,m.rows.filter(r=>admission.rowIds.includes(r.id)),{origin:built.origin,m,artifacts}),m.runDeadlineMs);
    await artifacts.write('document-barriers.jsonl',o.documents.map(r=>JSON.stringify(r)).join('\n')+'\n');await artifacts.write('row-dispositions.json',JSON.stringify({observed:result,missing:m.rows.filter(r=>!admission.rowIds.includes(r.id)).map(r=>r.id),complete:false},null,2));
    await journal.record('network-census',{requests:[...requests]});cdp.terminal();cdp.closing=true;owner.cancel();await poll;
    }
  }catch(e){primary=e;failures.push({stage:'work',error:String(e),code:e.code});}
  finally {
    if(cdp)cdp.closing=true;const stopped=await owner.stop();failures.push(...stopped.faults);if(cdp)try{cdp.terminal();}catch(e){failures.push({stage:'cdp-terminal',error:String(e)});}
    if(journal){try{await journal.record('terminal-barriers',{primary:primary&&String(primary),failures,quarantined:stopped.quarantined});}catch(e){failures.push({stage:'journal-flush',error:String(e)});}try{await journal.close();}catch(e){failures.push({stage:'journal-close',error:String(e)});}}
    // No success file predates journal close or any owned task/child/stream barrier.
    try{const bytes=await readFile(join(output,'resolution-closure.jsonl'));if(artifacts.allowed.has('closure.jsonl'))await durableFile(join(output,'closure.jsonl'),bytes);}catch(e){if(e.code!=='ENOENT')failures.push({stage:'closure-finalize',error:String(e)});}
    const census=await artifacts.census({scratch:m.artifactLanes.scratch,exclude:['artifact-index.json','final-outcome.json']}).catch(e=>({complete:false,error:String(e)}));if(!census.complete)failures.push({stage:'artifact-completeness',census});
    const status=failures.length?'REFUSED_OR_FAIL':result?.length===m.rows.length?'OBSERVED_PENDING_REVIEW':'PARTIAL_PENDING_REVIEW';
    try{await durableFile(join(output,'artifact-index.json'),JSON.stringify(census,null,2));await durableFile(join(output,'final-outcome.json'),JSON.stringify({status,primary:primary&&String(primary),failures,quarantined:stopped.quarantined,result},null,2));}catch(e){failures.push({stage:'final-write',error:String(e)});}
  }
  requireThat(failures.length===0,'FINAL_FAILURE',JSON.stringify(failures));return result;
}

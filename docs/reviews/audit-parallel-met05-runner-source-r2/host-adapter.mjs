import { readFile, readdir, mkdir, realpath, lstat, readlink, symlink, copyFile, open } from 'node:fs/promises';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeConfig } from './vite.config.mjs';
import { requireThat, assertHash, assertAlias, sha256, contained, durableFile, plannedOracle, firstRenderOracle } from './driver.mjs';
/** Dependency execution takes place ONLY in an owned snapshot; main remains reads-only.
 * Every copied regular-file byte and symlink target is recorded; @repo links escaping
 * node_modules are excluded and must resolve from archive metadata instead. */
export async function copyDependencies(sourceRoot,destination,owner) {
  const source=await realpath(join(sourceRoot,'node_modules'));await mkdir(destination);const entries=[];
  async function copy(from,to) {
    owner.assert();const s=await lstat(from);
    if(s.isSymbolicLink()) {
      const actual=await realpath(from);const alias=relative(source,actual);
      if(!contained(source,actual)){requireThat(from.includes('/@repo/'),'DEPENDENCY_ESCAPE',from);entries.push({path:relative(source,from),excludedWorkspace:true,target:actual});return;}
      const target=relative(dirname(to),join(destination,alias));await symlink(target,to);entries.push({path:relative(source,from),symlink:target,originalTarget:await readlink(from)});return;
    }
    requireThat(s.isDirectory()||s.isFile(),'DEPENDENCY_TYPE',from);
    if(s.isDirectory()){await mkdir(to);for(const e of await readdir(from))await copy(join(from,e),join(to,e));}
    else{const bytes=await readFile(from);await copyFile(from,to);assertHash(await readFile(to),sha256(bytes),to);entries.push({path:relative(source,from),bytes:bytes.length,hash:sha256(bytes)});}
  }
  for(const e of await readdir(source))await copy(join(source,e),join(destination,e));return {source,ownedSnapshot:destination,entries,readOnlySource:true};
}
export async function build(context) {
  const {admission,output,root,owner,journal,artifacts,m}=context;const source=await realpath(admission.dependencies.root);requireThat(source===admission.dependencies.root,'DEPENDENCY_ROOT','exact realpath');assertHash(await readFile(join(source,'pnpm-lock.yaml')),m.lockHash,'dependency lock');
  const deps=join(output,'dependencies/node_modules');await mkdir(dirname(deps));const provenance=await owner.task('dependency-copy',()=>copyDependencies(source,deps,owner));
  requireThat(sha256(JSON.stringify(provenance.entries))===admission.dependencies.snapshotIndexHash,'DEPENDENCY_PROVENANCE','root-qualified copied complete index');await artifacts.write('dependency-provenance.json',JSON.stringify(provenance,null,2));await artifacts.write('dependency-versions.json',JSON.stringify(admission.dependencies.versions,null,2));
  for(const [name,item] of Object.entries(admission.dependencies.entrypoints)){const bytes=await readFile(join(deps,item.path));assertHash(bytes,item.hash,`tool ${name}`);}
  for(const folder of ['build','cache','empty-env','chrome-profile'])await mkdir(join(output,folder));
  const env={PATH:admission.tools.path,TMPDIR:join(output,'cache'),XDG_CACHE_HOME:join(output,'cache'),XDG_CONFIG_HOME:join(output,'empty-env'),NODE_ENV:'development',TZ:'UTC',MET05_HOST_CONFIG:join(output,'build/host-config.json')};
  const config={archiveRoot:join(output,'archive'),dependencyRoot:deps,fixturePath:join(dirname(fileURLToPath(import.meta.url)),'fixture.tsx'),output,port:admission.resources.port,expectedLockHash:m.lockHash,viteEntry:join(deps,admission.dependencies.entrypoints.vite.path),origin:admission.resources.origin};
  await durableFile(env.MET05_HOST_CONFIG,JSON.stringify(config));
  // Ownership exists at spawn, before import/build/listen: partial setup failure cannot escape.
  const row=owner.spawn(admission.tools.node.path,[fileURLToPath(import.meta.url),'--serve',env.MET05_HOST_CONFIG],{cwd:root,env,name:'server'});owner.stream(row,row.child.stdout,join(output,'server.stdout.log'));owner.stream(row,row.child.stderr,join(output,'server.stderr.log'));
  await owner.task('server-ready',async signal=>{const end=Date.now()+10000;while(Date.now()<end){owner.assert();requireThat(!row.closed,'SERVER_EARLY_EXIT',JSON.stringify(row.outcome));try{const response=await fetch(`${config.origin}/__met05/ready`,{signal});if(response.ok){const value=await response.json();requireThat(value.pid===row.child.pid&&value.fixtureHash===sha256(await readFile(config.fixturePath)),'SERVER_IDENTITY','wrong server');return;}}catch(e){if(signal.aborted)throw e;}await new Promise(r=>setTimeout(r,50));}throw new Error('server ready expired');},12000);
  await journal.record('host-built',{pid:row.child.pid,config,commands:[admission.tools.node.path,fileURLToPath(import.meta.url),'--serve',env.MET05_HOST_CONFIG],env});return {origin:config.origin,env,row};
}
const base64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
export function syntheticSession(id) {
  const now=Math.floor(Date.now()/1000),user={id,aud:'authenticated',role:'authenticated',email:`${id}@example.invalid`,app_metadata:{provider:'email'},user_metadata:{},created_at:'2026-10-10T00:00:00.000Z'};
  return {access_token:`${base64({alg:'none',typ:'JWT'})}.${base64({sub:id,aud:'authenticated',role:'authenticated',exp:now+3600})}.synthetic-local-only`,refresh_token:`synthetic-${id}`,token_type:'bearer',expires_in:3600,expires_at:now+3600,user};
}
export async function serve(config) {
  const {createServer}=await import(pathToFileURL(config.viteEntry).href);let server,closureHandle,closing=false;const records=[];const faults=[];
  try {
    closureHandle=await open(join(config.output,'resolution-closure.jsonl'),'wx');let tail=Promise.resolve();const record=row=>{records.push(row);const write=tail.then(async()=>{await closureHandle.write(`${JSON.stringify(row)}\n`);await closureHandle.sync();});tail=write.catch(e=>{faults.push(String(e));process.exitCode=1;});return write;};
    const vite=await makeConfig({...config,record});
    const page=`<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MET05 actual archived full host</title></head><body><div id="root"></div><script type="module" src="/@fs/${config.fixturePath}"></script></body></html>`;
    const synthetic={name:'met05-local-remote-boundary',configureServer(s){s.middlewares.use(async(req,res,next)=>{
      const url=new URL(req.url,config.origin),send=(status,value)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
      try {
        if(url.pathname==='/__met05/ready')return send(200,{pid:process.pid,fixtureHash:sha256(await readFile(config.fixturePath))});
        if(url.pathname==='/auth/v1/token'&&req.method==='POST') {
          const chunks=[];for await(const c of req){chunks.push(c);requireThat(Buffer.concat(chunks).length<8192,'AUTH_BODY','oversized');}const body=JSON.parse(Buffer.concat(chunks));const id=body.email?.split('@')[0]??body.refresh_token?.slice('synthetic-'.length);requireThat(['met05-synthetic-A','met05-synthetic-B'].includes(id),'AUTH_SEAM','outside fixture account');await record({kind:'external-auth-seam',path:url.pathname,account:id,grant:url.searchParams.get('grant_type')});return send(200,syntheticSession(id));
        }
        if(url.pathname==='/auth/v1/user'&&req.method==='GET'){const raw=req.headers.authorization?.split('.')[1];const id=raw?JSON.parse(Buffer.from(raw,'base64url')).sub:null;requireThat(['met05-synthetic-A','met05-synthetic-B'].includes(id),'AUTH_SEAM','user outside fixture');return send(200,syntheticSession(id).user);}
        if(['/rest/v1/rpc/device_register','/rest/v1/rpc/device_heartbeat'].includes(url.pathname)&&req.method==='POST'){const token=req.headers.authorization;requireThat(typeof token==='string'&&token.includes('synthetic-local-only'),'DEVICE_SEAM','not synthetic token');await record({kind:'external-device-seam',path:url.pathname,device:req.headers['x-device-id']});return send(200,null);}
        if(url.pathname.startsWith('/rest/')||url.pathname.startsWith('/auth/v1/'))throw new Error(`undeclared external seam:${url.pathname}`);
        if(url.pathname.startsWith('/app/')||url.pathname.startsWith('/auth/')||url.pathname==='/'){const transformed=await s.transformIndexHtml(url.pathname,page);res.setHeader('Content-Type','text/html');res.end(transformed);return;}
        next();
      }catch(e){faults.push(String(e));process.exitCode=1;send(500,{error:String(e)});}
    });}};
    vite.plugins.unshift(synthetic);server=await createServer(vite);await server.listen();
    const close=async()=>{if(closing)return;closing=true;try{await server.close();await tail;await closureHandle.sync();}catch(e){faults.push(String(e));}finally{try{await closureHandle.close();}catch(e){faults.push(String(e));}if(faults.length){process.stderr.write(`${JSON.stringify({faults})}\n`);process.exitCode=1;}}};
    process.on('SIGTERM',()=>{void close();});process.on('SIGINT',()=>{void close();});
    process.on('uncaughtException',e=>{faults.push(String(e));void close();});process.on('unhandledRejection',e=>{faults.push(String(e));void close();});
  }catch(e){if(server)await server.close().catch(()=>{});if(closureHandle)await closureHandle.close().catch(()=>{});throw e;}
}
export async function surface(row,o) {
  plannedOracle(await o.snapshot());const seen=new Set();
  for(let i=0;i<3;i++){const observation=await o.snapshot();for(const t of observation.tabs)if(t.visible)seen.add(t.id);await o.capture(`${row.id}.strip-${i}`);if(i<2)await o.stripScroll(1);}
  requireThat(['weight','sleep','water','exercise','custom'].every(id=>seen.has(id)),'VISIBILITY','strip labels clipped after finite trusted scroll',{stage:'surface',faultId:'clipped-label',value:[...seen],counter:1});
  const tree=await o.command('Accessibility.getFullAXTree');for(const name of (row.lang==='zh'?['睡眠','饮水','运动','自定义']:['Sleep','Water','Exercise','Custom'])){const nodes=tree.nodes.filter(n=>!n.ignored&&n.role?.value==='button'&&n.name?.value.includes(name)&&n.name.value.includes(row.lang==='zh'?'计划中':'Planned'));requireThat(nodes.length===1&&nodes[0].properties?.some(p=>p.name==='disabled'&&p.value.value===true),'AX_DISABLED',name);}
  await o.journal.record('visual-review-required',{row:row.id,seen:[...seen],reason:'readability/selected appearance require independent actual screenshots; DOM does not accept them'});
}
export async function entry(row,o,origin) {
  if(['rail','cmdk'].includes(row.entry)) {
    const before=await o.snapshot();requireThat(before.route!== '/app/metrics'&&before.module==='absent','ENTRY_START','must start on distinct actual dashboard');
    if(row.entry==='rail')await o.pointer(`.app-rail [aria-label="${row.lang==='zh'?'指标追踪':'Metrics'}"]`);
    else{await o.key('k',4);await o.wait('!!document.querySelector(".cmdk-input")');await o.enter('.cmdk-input',row.lang==='zh'?'体重':'Weight');await o.wait('!!document.querySelector(".cmdk-row")');const choices=await o.evaluate('Array.from(document.querySelectorAll(".cmdk-row")).map((e,i)=>({id:e.id,text:e.textContent,index:i}))');const found=choices.filter(c=>/Metrics|指标追踪/.test(c.text));requireThat(found.length===1&&found[0].id,'CMDK_CHOICE','unique real module jump');await o.pointer(`#${found[0].id}`);}
    await o.settled();const transition=await o.snapshot();requireThat(transition.route==='/app/metrics','NOOP_ROUTE','palette or rail closed without real destination',{stage:'route-transition',faultId:'noop-route',value:{before:before.url,after:transition.url},counter:1});
    await o.wait('location.pathname==="/app/metrics" && !!document.querySelector(".module-metrics") && !document.querySelector(".cmdk-input")');await o.settled();const after=await o.snapshot();requireThat(before.url!==after.url&&before.documentId===after.documentId&&after.route==='/app/metrics','NOOP_ROUTE','real SPA route transition absent',{stage:'route-transition',faultId:'noop-route',value:{before:before.url,after:after.url},counter:1});await o.journal.record('actual-route-transition',{before,after});
  }else{const url=new URL(row.path,origin);url.searchParams.set('__met_lang',row.lang);url.searchParams.set('__met_theme','light');url.searchParams.set('__met_lane','host');await o.mount(url.href,row);const after=await o.snapshot();requireThat(after.route===url.pathname,'ROUTE_REQUEST','wildcard expected retained path');if(row.entry==='query')requireThat(new URL(after.url).searchParams.get('metric')==='sleep','ROUTE_QUERY','query preserved');await o.reload();requireThat((await o.snapshot()).route===url.pathname,'RELOAD_ROUTE','requested direct path after reload');}
}
export async function accountSource(row,o) {
  const initial=await o.snapshot();firstRenderOracle(initial,'met05-synthetic-A',70);
  if(row.case==='identity') {
    await o.evaluate('window.__met05.publishIdentity(null)');await o.settled();const locked=await o.snapshot();requireThat(locked.module==='absent'&&locked.scope.kind==='locked'&&locked.key===null&&JSON.stringify(locked.bytes)===JSON.stringify(initial.bytes)&&locked.events.length===0,'LOCKED_ABSENCE','old ready subtree/data survived lock');
    await o.evaluate('window.__met05.publishIdentity("met05-synthetic-B")');await o.wait('window.__met05.ready && window.__met05.observe().scope.accountId==="met05-synthetic-B" && !!document.querySelector(".module-metrics")');await o.settled();const b=await o.snapshot();firstRenderOracle(b,'met05-synthetic-B',85);
    await o.evaluate('window.__met05.publishIdentity("met05-synthetic-A")');await o.wait('window.__met05.ready && window.__met05.observe().scope.accountId==="met05-synthetic-A" && !!document.querySelector(".module-metrics")');await o.settled();const a=await o.snapshot();firstRenderOracle(a,'met05-synthetic-A',70);requireThat(JSON.stringify(a.bytes)===JSON.stringify(initial.bytes)&&a.events.length===0&&b.events.length===0,'ACCOUNT_BYTES','identity transition attempted metric mutation');await o.journal.record('first-render-census',{initial,locked,b,a});
  }else{await o.evaluate('window.__met05.mixedSourceFixture()');const injected=await o.snapshot();await o.reload();const after=await o.snapshot();plannedOracle(after);requireThat(after.normalized.activeMetricId==='weight'&&after.normalized.records.length===0&&after.renderedRecords.length===0&&!after.content.includes('mixed-source')&&JSON.stringify(injected.bytes)===JSON.stringify(after.bytes)&&after.events.length===0,'SOURCE_NORMALIZATION','normalized/rendered or mount-attempt mismatch',{stage:'normalization',faultId:'normalization-write',value:after,counter:1});await o.journal.record('normalized-source-observation',{injected,after});}
}
if(process.argv[2]==='--serve'&&resolve(process.argv[1])===fileURLToPath(import.meta.url))serve(JSON.parse(await readFile(process.argv[3],'utf8'))).catch(e=>{process.stderr.write(`${e.stack}\n`);process.exitCode=1;});

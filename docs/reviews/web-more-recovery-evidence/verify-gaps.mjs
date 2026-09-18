/** B1/B2 evidence-only verifier: real Chrome, immutable product archive, synthetic local data. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync,spawn} from 'node:child_process';
import {copyFileSync,existsSync,mkdtempSync,mkdirSync,readFileSync,readdirSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const output=fileURLToPath(new URL('./',import.meta.url));
const dependencyRoot=process.env.XAI_DEPS_ROOT??root;
const sourceCommit=process.argv[2];
const mode=process.argv[3];
const suffix=process.argv[4]??'run';
if(!sourceCommit)throw Error('Fixed revision required');
if(!['b1-native-export','b2-host-ordering'].includes(mode))throw Error('Unsupported mode '+mode);
const evidenceTag=`${sourceCommit}-${suffix}-${mode}`;
const evidencePath=join(output,`gap-${evidenceTag}.log`);
if(existsSync(evidencePath))throw Error('Evidence exists; use a distinct suffix');

const sha256=value=>createHash('sha256').update(value).digest('hex');
const verifierSha256=sha256(readFileSync(fileURLToPath(import.meta.url)));
const dependencyNodeModules=join(dependencyRoot,'node_modules');
assert(existsSync(dependencyNodeModules),'Dependency tree missing; set XAI_DEPS_ROOT to a matching checkout');
const archiveLock=execFileSync('git',['show',`${sourceCommit}:pnpm-lock.yaml`],{cwd:root,maxBuffer:100*1024*1024});
const dependencyLock=readFileSync(join(dependencyRoot,'pnpm-lock.yaml'));
assert.equal(sha256(dependencyLock),sha256(archiveLock),'Dependency checkout lockfile differs from fixed product');
const esbuildPath=readdirSync(join(dependencyNodeModules,'.pnpm')).find(name=>name.startsWith('esbuild@0.28.1'));
assert(esbuildPath,'Pinned esbuild 0.28.1 dependency missing');
const {build}=await import(pathToFileURL(join(dependencyNodeModules,'.pnpm',esbuildPath,'node_modules/esbuild/lib/main.js')).href);

const directory=mkdtempSync(join(tmpdir(),'xai-more-gaps-'));
const snapshot=join(directory,'source');
const downloads=join(directory,'downloads');
const records=[];
const runtimeErrors=[];
const delay=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const record=(name,value)=>{records.push({name,...value});console.log(name,JSON.stringify(value));};
let server,browser,socket;

try{
  mkdirSync(snapshot);
  mkdirSync(downloads);
  execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
  symlinkSync(dependencyNodeModules,join(snapshot,'node_modules'));
  symlinkSync(join(dependencyRoot,'apps/web/node_modules'),join(snapshot,'apps/web/node_modules'));
  const aliases=new Map();
  for(const name of readdirSync(join(snapshot,'packages'))){
    const folder=join(snapshot,'packages',name);
    try{
      const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));
      aliases.set(pkg.name,{folder,pkg});
      const packageDependencies=join(dependencyRoot,'packages',name,'node_modules');
      if(existsSync(packageDependencies))symlinkSync(packageDependencies,join(folder,'node_modules'));
    }catch{}
  }
  const pinnedPackages={name:'pinned-workspace-packages',setup(buildApi){buildApi.onResolve({filter:/^@repo\//},args=>{
    const parts=args.path.split('/');
    const entry=aliases.get(parts.slice(0,2).join('/'));
    if(!entry)return;
    const sub=parts.length>2?'./'+parts.slice(2).join('/'):'.';
    let target=entry.pkg.exports?.[sub];
    if(typeof target==='object')target=target.import??target.default;
    if(typeof target!=='string')throw Error('Unresolved pinned export '+args.path);
    return {path:join(entry.folder,target)};
  });}};
  const fixture=readFileSync(join(root,'docs/reviews/web-more-recovery-native/native.tsx'),'utf8');
  const built=await build({stdin:{contents:fixture,resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],nodePaths:[join(dependencyRoot,'apps/web/node_modules')],loader:{'.png':'dataurl','.svg':'dataurl','.woff2':'dataurl','.woff':'dataurl'},bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
  const js=built.outputFiles.find(file=>file.path.endsWith('.js')).text;
  const css=built.outputFiles.find(file=>file.path.endsWith('.css')).text;
  server=createServer((request,response)=>{response.setHeader('Content-Type','text/html');response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>');});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu','--no-first-run','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+join(directory,'profile'),'about:blank'],{stdio:'ignore'});
  let port;
  for(let attempt=0;attempt<300;attempt++){
    try{const candidate=Number(readFileSync(join(directory,'profile','DevToolsActivePort'),'utf8').split('\n')[0]);if(candidate>0){port=candidate;break;}}catch{}
    await delay(50);
  }
  assert(port,'Chrome DevToolsActivePort never became positive');
  const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
  socket=new WebSocket(targets.find(target=>target.type==='page').webSocketDebuggerUrl);
  await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
  let commandId=0;
  const pending=new Map();
  socket.addEventListener('message',event=>{
    const message=JSON.parse(event.data);
    if(message.method==='Runtime.exceptionThrown')runtimeErrors.push(JSON.stringify(message.params));
    if(message.method==='Runtime.consoleAPICalled'&&message.params.type==='error')runtimeErrors.push(message.params.args.map(argument=>argument.value??argument.description??'').join(' '));
    if(message.id){const job=pending.get(message.id);pending.delete(message.id);message.error?job.reject(Error(JSON.stringify(message.error))):job.resolve(message.result);}
  });
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++commandId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const result=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
  const waitFor=async(expression,message)=>{for(let attempt=0;attempt<200;attempt++){if(await evaluate(expression))return;await delay(40);}throw Error(message);};
  await cdp('Runtime.enable');
  await cdp('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads});
  await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
  await waitFor("!!window.verify&&!!document.querySelector('.more-pane')",'More pane did not mount');
  await cdp('Page.bringToFront');
  await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
  record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product,lockfileSha256:sha256(archiveLock),fixtureSha256:sha256(fixture),verifierSha256});
  assert.equal(runtimeErrors.length,0,'Runtime mount errors: '+runtimeErrors.slice(0,3).join(' | '));

  const actualClick=async selector=>{
    const point=await evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});if(!element)throw Error('Missing control');element.scrollIntoView({block:'center'});const rect=element.getBoundingClientRect();return {x:rect.x+rect.width/2,y:rect.y+rect.height/2,hit:element.contains(document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2))};})()`);
    assert(point.hit,'Covered control '+selector);
    await cdp('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
    await delay(120);
  };
  const key=async(keyValue,code,virtual,text='')=>{
    await cdp('Input.dispatchKeyEvent',{type:text?'keyDown':'rawKeyDown',key:keyValue,code,windowsVirtualKeyCode:virtual,...(text?{text,unmodifiedText:text}:{})});
    await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:keyValue,code,windowsVirtualKeyCode:virtual});
    await delay(100);
  };
  const select=async(label,text,code,virtual)=>{
    await evaluate(`document.querySelector('select[aria-label=${JSON.stringify(label)}]').focus()`);
    await key(text,code,virtual,text);
  };
  const action=async(text,scope='.more-pane')=>{
    const selector=await evaluate(`(()=>{const element=[...document.querySelectorAll(${JSON.stringify(scope+' button')})].find(candidate=>(candidate.getAttribute('aria-label')??candidate.textContent).trim()===${JSON.stringify(text)});if(!element)throw Error('Missing action '+${JSON.stringify(text)});element.dataset.gapTarget='yes';return '[data-gap-target="yes"]';})()`);
    await actualClick(selector);
    await evaluate('document.querySelector("[data-gap-target]")?.removeAttribute("data-gap-target")');
  };
  const sidebar=async text=>{
    const selector=await evaluate(`(()=>{const element=[...document.querySelectorAll('.settings-sidebar .list-row')].find(candidate=>candidate.textContent.trim()===${JSON.stringify(text)});if(!element)throw Error('Missing sidebar row '+${JSON.stringify(text)});element.dataset.gapSidebar='yes';return '[data-gap-sidebar="yes"]';})()`);
    await actualClick(selector);
    await evaluate('document.querySelector("[data-gap-sidebar]")?.removeAttribute("data-gap-sidebar")');
  };
  const dialogAction=async text=>action(text,'.settings-departure-dialog');
  const locationState=()=>evaluate('({path:verify.router.state.location.pathname,key:verify.router.state.location.key,state:verify.router.state.location.state})');
  const warning=()=>evaluate('(()=>{const event=new Event("beforeunload",{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;})()');
  const labels={windowType:'Choose window type when launching',defaultTag:'Default Tag'};

  if(mode==='b1-native-export'){
    await evaluate(`(()=>{const nativeCreate=URL.createObjectURL.bind(URL),nativeRevoke=URL.revokeObjectURL.bind(URL);window.gapExportTrace={created:[],revoked:[]};URL.createObjectURL=blob=>{const url=nativeCreate(blob);gapExportTrace.created.push(url);return url;};URL.revokeObjectURL=url=>{gapExportTrace.revoked.push(url);return nativeRevoke(url);};})()`);
    const download=async(expected,artifactLabel)=>{
      const before=await evaluate('({reads:verify.reads().length,writes:verify.writes().length,removes:verify.removes().length,created:gapExportTrace.created.length,revoked:gapExportTrace.revoked.length})');
      await action('Export More draft');
      const downloaded=join(downloads,'more-draft.json');
      for(let attempt=0;attempt<120&&!existsSync(downloaded);attempt++)await delay(40);
      assert(existsSync(downloaded),'Actual Chrome more-draft.json download missing');
      const raw=readFileSync(downloaded);
      const payload=JSON.parse(raw.toString('utf8'));
      assert.deepEqual(payload,{version:1,kind:'more-draft',changes:expected});
      const after=await evaluate('({reads:verify.reads().length,writes:verify.writes().length,removes:verify.removes().length,created:gapExportTrace.created.length,revoked:gapExportTrace.revoked.length,anchors:document.querySelectorAll("a[download=\\"more-draft.json\\"]").length,trace:gapExportTrace})');
      assert.deepEqual({reads:after.reads,writes:after.writes,removes:after.removes},{reads:before.reads,writes:before.writes,removes:before.removes},'Export accessed persistence');
      assert.equal(after.anchors,0,'Export anchor was not removed');
      assert.equal(after.created,before.created+1,'Export did not create exactly one object URL');
      assert.equal(after.revoked,before.revoked+1,'Export did not revoke exactly one object URL');
      assert.equal(after.trace.revoked.at(-1),after.trace.created.at(-1),'Export revoked the wrong object URL');
      const artifact=`b1-${suffix}-${artifactLabel}-more-draft.json`;
      copyFileSync(downloaded,join(output,artifact));
      rmSync(downloaded);
      const operations=Object.values(expected).flatMap(owner=>Object.values(owner).map(change=>change.operation));
      record('disk-export',{artifact,sha256:sha256(raw),payload,owners:Object.keys(expected),operations,storageUnchanged:true,anchorRemoved:true,urlRevoked:true});
    };

    await select(labels.windowType,'t','KeyT',84);
    await waitFor('verify.read()[0]==="tray"','Reset export setup did not persist win_type');
    await evaluate('verify.denyRemove([0])');
    await actualClick('[data-testid="more-reset-default"]');
    await waitFor('verify.removes().length===14','Reset siblings did not settle');
    await waitFor('document.body.textContent.includes("Choose window type when launching reset to default was not completed.")','Sparse reset draft missing');
    await evaluate('verify.denyAll()');
    await download({device:{win_type:{operation:'reset'}}},'sparse-reset');

    await evaluate('verify.restore();verify.deny([11])');
    await select(labels.defaultTag,'w','KeyW',87);
    await waitFor('document.body.textContent.includes("Default Tag was not saved.")','Mixed-operation set draft missing');
    await evaluate('verify.denyAll()');
    await download({device:{win_type:{operation:'reset'}},account:{default_tag:{operation:'set',value:'work'}}},'mixed-set-reset');

    await evaluate('verify.restore();verify.lock()');
    await waitFor('!document.body.textContent.includes("Default Tag was not saved.")','Locked scope retained private account draft');
    assert.equal(await warning(),true,'Locked device reset draft lost departure protection');
    await evaluate('verify.denyAll()');
    await download({device:{win_type:{operation:'reset'}}},'locked-device-reset');
    record('b1-summary',{pass:true,sparseReset:true,mixedOperations:true,mixedOwners:true,lockedDeviceOnly:true,actualChromeDisk:true,memoryOnly:true});
  }else{
    await sidebar('Date & Time');
    await waitFor('verify.router.state.location.pathname==="/app/settings/date_time"','Clean sidebar did not reach Date & Time');
    const dateLocation=await locationState();
    await sidebar('More');
    await waitFor('verify.router.state.location.pathname==="/app/settings/more"','Clean sidebar did not return to More');
    const moreLocation=await locationState();
    assert.notEqual(dateLocation.key,moreLocation.key,'Distinct history entries reused a location key');
    await evaluate('verify.deny([0])');
    await select(labels.windowType,'t','KeyT',84);
    await waitFor('document.body.textContent.includes("Choose window type when launching was not saved.")','History draft setup missing');
    await evaluate('history.back()');
    await waitFor('!!document.querySelector(".settings-departure-dialog")','Guard did not block browser Back');
    assert.deepEqual(await locationState(),moreLocation,'Blocked Back changed the committed More location');
    await dialogAction('Stay');
    assert.deepEqual(await locationState(),moreLocation,'Stay changed the More location key');
    await evaluate('history.back()');
    await waitFor('!!document.querySelector(".settings-departure-dialog")','Second Back did not retain guard');
    await dialogAction('Discard local changes and leave');
    await waitFor('verify.router.state.location.pathname==="/app/settings/date_time"','Discard did not complete original Back');
    assert.deepEqual(await locationState(),dateLocation,'Back recreated Date & Time instead of restoring its key/state');
    await evaluate('history.forward()');
    await waitFor('verify.router.state.location.pathname==="/app/settings/more"','Forward did not restore More');
    assert.deepEqual(await locationState(),moreLocation,'Forward recreated More instead of restoring its key/state');
    record('history-key-preservation',{dateLocation,moreLocation,blockedKey:moreLocation.key,backRestoredKey:dateLocation.key,forwardRestoredKey:moreLocation.key});

    const previousInstance=await evaluate('verify.instance');
    await evaluate('verify.restore();verify.resetFixture()');
    await cdp('Page.reload');
    await waitFor(`window.verify?.instance&&verify.instance!==${JSON.stringify(previousInstance)}&&verify.router.state.location.pathname==='/app/settings/more'`,'Fresh host fixture did not mount');
    await evaluate(`(()=>{window.gapHostTrace={router:[{path:verify.router.state.location.pathname,key:verify.router.state.location.key,action:verify.router.state.historyAction}],history:[],pop:[]};window.gapUnsubscribe=verify.router.subscribe(state=>gapHostTrace.router.push({path:state.location.pathname,key:state.location.key,action:state.historyAction}));const push=history.pushState.bind(history),replace=history.replaceState.bind(history);history.pushState=(state,title,url)=>{gapHostTrace.history.push({method:'pushState',url:String(url),key:state?.key??null});return push(state,title,url);};history.replaceState=(state,title,url)=>{gapHostTrace.history.push({method:'replaceState',url:String(url),key:state?.key??null});return replace(state,title,url);};addEventListener('popstate',event=>gapHostTrace.pop.push({path:location.pathname,key:event.state?.key??null}));})()`);
    const heldLocation=await locationState();
    await evaluate('verify.hold(0)');
    await select(labels.windowType,'t','KeyT',84);
    await evaluate(`(()=>{let release;const gate=new Promise(resolve=>release=resolve);window.gapMiddleReady=false;window.gapMiddleRelease=release;window.gapMiddleDone=navigator.locks.request('xai:pref:v1:'+encodeURIComponent(verify.keys[0]),{mode:'exclusive'},()=>{window.gapMiddleReady=true;return gate;});})()`);
    await delay(1200);
    await select(labels.windowType,'f','KeyF',70);
    assert.equal(await evaluate(`document.querySelector('select[aria-label=${JSON.stringify(labels.windowType)}]').value`),'full','Latest same-field draft was not visible');
    await sidebar('Date & Time');
    await waitFor('!!document.querySelector(".settings-departure-dialog")','Actual Settings sidebar click was not guarded');
    assert.deepEqual(await locationState(),heldLocation,'Sidebar guard changed committed location before release');
    await evaluate(`(()=>{const original=Storage.prototype.setItem;window.gapRestoreValueFault=()=>{Storage.prototype.setItem=original;};Storage.prototype.setItem=function(key,value){if(key===verify.keys[0]&&value==='full')throw new DOMException('denied latest value','SecurityError');return original.call(this,key,value);};})()`);
    await evaluate('verify.release(0)');
    await waitFor('window.gapMiddleReady&&verify.read()[0]==="tray"','Predecessor did not complete before the middle lock');
    assert.equal(await evaluate(`document.querySelector('select[aria-label=${JSON.stringify(labels.windowType)}]').value`),'full','Pending latest draft was lost after predecessor completion');
    assert.deepEqual(await locationState(),heldLocation,'Predecessor completion released while latest work was pending');
    assert.equal(await evaluate('!!document.querySelector(".settings-departure-dialog")'),true,'Pending latest work closed departure dialog');
    assert.equal((await evaluate('gapHostTrace.history')).length,0,'Pending predecessor caused history mutation');
    record('same-field-predecessor-pending',{physical:await evaluate('verify.read()[0]'),displayed:'full',location:await locationState(),dialog:true,historyMutations:0});

    await evaluate('gapMiddleRelease();gapMiddleDone');
    await waitFor('document.body.textContent.includes("Choose window type when launching was not saved.")','Latest same-field failure was not exposed');
    assert.deepEqual(await locationState(),heldLocation,'Predecessor completion released while latest work was failed');
    assert.equal(await evaluate('!!document.querySelector(".settings-departure-dialog")'),true,'Failed latest work closed departure dialog');
    assert.equal((await evaluate('gapHostTrace.history')).length,0,'Failed latest work caused history mutation');
    record('same-field-latest-failed',{physical:await evaluate('verify.read()[0]'),displayed:await evaluate(`document.querySelector('select[aria-label=${JSON.stringify(labels.windowType)}]').value`),location:await locationState(),dialog:true,historyMutations:0});

    await evaluate('gapRestoreValueFault()');
    await action('Retry Choose window type when launching');
    await waitFor('verify.router.state.location.pathname==="/app/settings/date_time"','Latest matching completion did not release held sidebar intent');
    await waitFor('verify.read()[0]==="full"','Latest matching completion did not persist full');
    const trace=await evaluate('gapHostTrace');
    const locationMutations=trace.router.filter(entry=>entry.key!==heldLocation.key);
    assert.equal(locationMutations.length,1,'Held intent produced duplicate public router location commits');
    assert.equal(locationMutations[0].path,'/app/settings/date_time');
    assert.equal(trace.history.filter(entry=>entry.method==='pushState').length,1,'Held intent did not produce exactly one pushState');
    assert.equal(trace.history.filter(entry=>entry.method==='replaceState').length,0,'Held intent unexpectedly replaced history');
    assert.equal(trace.pop.length,0,'Held sidebar intent unexpectedly emitted popstate');
    assert.equal(await evaluate('!!document.querySelector(".settings-departure-dialog")'),false,'Departure dialog remained after latest completion');
    assert.equal(await warning(),false,'Latest completion left beforeunload protection installed');
    record('held-intent-exactly-once',{from:heldLocation,to:await locationState(),physical:await evaluate('verify.read()[0]'),routerLocationCommits:locationMutations,historyMutations:trace.history,popEvents:trace.pop,dialog:false,warning:false});
    record('b2-summary',{pass:true,actualSettingsSidebar:true,historyKeys:true,sameFieldPending:true,sameFieldFailed:true,latestMatchingRelease:true,exactlyOnce:true});
  }
  assert.equal(runtimeErrors.length,0,'Runtime errors: '+runtimeErrors.slice(0,3).join(' | '));
  record('native',{pass:true,mode,runtimeErrors:0});
}catch(error){
  record('native',{pass:false,mode,error:String(error),runtimeErrors});
  process.exitCode=1;
}finally{
  writeFileSync(evidencePath,records.map(entry=>JSON.stringify(entry)).join('\n')+'\n');
  socket?.close();
  browser?.kill('SIGTERM');
  server?.closeAllConnections();
  server?.close();
  await delay(500);
  browser?.kill('SIGKILL');
  rmSync(directory,{recursive:true,force:true});
}

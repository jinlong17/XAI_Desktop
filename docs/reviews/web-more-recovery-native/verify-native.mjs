/** Real Chrome, isolated profile and immutable product archive. Synthetic local data only. */
import {build} from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import {existsSync,mkdtempSync,mkdirSync,readFileSync,readdirSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const output=fileURLToPath(new URL('./',import.meta.url));
const sourceCommit=process.argv[2];
const mode=process.argv[3]??'controls-reset';
const suffix=process.argv[4]??'run';
if(!sourceCommit)throw Error('Fixed revision required');
if(mode!=='controls-reset')throw Error('Unsupported mode '+mode);
const evidenceTag=`${sourceCommit}-${suffix}-${mode}`;
const evidencePath=join(output,`native-${evidenceTag}.log`);
if(existsSync(evidencePath))throw Error('Evidence exists; use a distinct suffix');

const directory=mkdtempSync(join(tmpdir(),'xai-more-native-'));
const snapshot=join(directory,'source');
const records=[];
const runtimeErrors=[];
const delay=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const record=(name,value)=>{records.push({name,...value});console.log(name,JSON.stringify(value));};
let server,browser,socket;

try{
  mkdirSync(snapshot);
  execFileSync('tar',['-x','-C',snapshot],{input:execFileSync('git',['archive',sourceCommit],{cwd:root,maxBuffer:100*1024*1024})});
  symlinkSync(join(root,'node_modules'),join(snapshot,'node_modules'));
  symlinkSync(join(root,'apps/web/node_modules'),join(snapshot,'apps/web/node_modules'));
  const aliases=new Map();
  for(const name of readdirSync(join(snapshot,'packages'))){
    const folder=join(snapshot,'packages',name);
    try{
      const pkg=JSON.parse(readFileSync(join(folder,'package.json'),'utf8'));
      aliases.set(pkg.name,{folder,pkg});
      symlinkSync(join(root,'packages',name,'node_modules'),join(folder,'node_modules'));
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
  const source=readFileSync(join(output,'native.tsx'),'utf8');
  const built=await build({stdin:{contents:source,resolveDir:snapshot,loader:'tsx'},plugins:[pinnedPackages],nodePaths:[join(root,'apps/web/node_modules')],loader:{'.png':'dataurl','.svg':'dataurl','.woff2':'dataurl','.woff':'dataurl'},bundle:true,format:'esm',platform:'browser',write:false,outfile:join(directory,'bundle.js'),define:{'import.meta.env':'{}'}});
  const js=built.outputFiles.find(file=>file.path.endsWith('.js')).text;
  const css=built.outputFiles.find(file=>file.path.endsWith('.css')).text;
  server=createServer((_request,response)=>{response.setHeader('Content-Type','text/html');response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css+'</style><div id="app"></div><script type="module">'+js+'</script>');});
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
  const waitFor=async(expression,message)=>{for(let attempt=0;attempt<160;attempt++){if(await evaluate(expression))return;await delay(40);}throw Error(message);};
  await cdp('Runtime.enable');
  await cdp('Page.navigate',{url:'http://127.0.0.1:'+server.address().port});
  await waitFor("!!window.verify&&!!document.querySelector('.more-pane')",'More pane did not mount');
  await cdp('Page.bringToFront');
  await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});
  record('baseline',{commit:sourceCommit,browser:(await cdp('Browser.getVersion')).product});
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
    await delay(80);
  };
  const observeControl=async(index,label)=>{
    const observation=await evaluate(`(()=>{const element=document.querySelector('[aria-label=${JSON.stringify(label)}]');return {index:${index},label:${JSON.stringify(label)},raw:verify.read()[${index}],value:element?.value,checked:element?.getAttribute('aria-checked'),pressed:element?.getAttribute('aria-pressed')};})()`);
    record('control-'+index,observation);
  };
  const selectByTypeahead=async(index,label,text,code,virtual)=>{
    await evaluate(`document.querySelector('select[aria-label=${JSON.stringify(label)}]').focus()`);
    await key(text,code,virtual,text);
    await delay(120);
    await observeControl(index,label);
  };
  const labels=['Choose window type when launching','Launch at Login','Minimize app when auto launching','Date Recognition','Remove text in tasks','Remove tags from task name','URL Parsing','Default Date','Default Reminders (Due time task)','Default Reminders (All day task)','Default Priority','Default Tag','Default List','Default Add to','Overdue Section shows at'];
  await evaluate(`(()=>{window.moreNativeTrace=[];for(const type of ['keydown','keyup','input','change','click'])document.addEventListener(type,event=>{const target=event.target;if(target?.closest?.('.more-pane'))window.moreNativeTrace.push({type,key:event.key,value:target.value,pressed:target.getAttribute?.('aria-pressed'),checked:target.getAttribute?.('aria-checked'),label:target.getAttribute?.('aria-label'),trusted:event.isTrusted});},true);})()`);
  assert.deepEqual(await evaluate('verify.read()'),await evaluate('verify.initial'));
  assert.equal((await evaluate('verify.writes()')).length,0,'Mount wrote More data');
  assert.equal((await evaluate('verify.removes()')).length,0,'Mount removed More data');

  await selectByTypeahead(0,labels[0],'t','KeyT',84);
  for(let index=1;index<=3;index++){await actualClick(`[aria-label=${JSON.stringify(labels[index])}]`);await observeControl(index,labels[index]);}
  await evaluate(`document.querySelector('[aria-label=${JSON.stringify(labels[4])}]').focus()`);
  await key(' ','Space',32,' ');
  await observeControl(4,labels[4]);
  await evaluate(`document.querySelector('[aria-label=${JSON.stringify(labels[5])}]').focus()`);
  await key('Enter','Enter',13,'\r');
  await observeControl(5,labels[5]);
  await actualClick(`[aria-label=${JSON.stringify(labels[6])}]`);
  await observeControl(6,labels[6]);
  const selectInputs=[
    [7,labels[7],'t','KeyT',84],[8,labels[8],'5','Digit5',53],[9,labels[9],'d','KeyD',68],
    [10,labels[10],'h','KeyH',72],[11,labels[11],'w','KeyW',87],[12,labels[12],'t','KeyT',84],
    [13,labels[13],'b','KeyB',66],[14,labels[14],'b','KeyB',66],
  ];
  for(const [index,label,text,code,virtual] of selectInputs)await selectByTypeahead(index,label,text,code,virtual);
  await delay(500);
  const trustedRaw=await evaluate('verify.read()');
  record('trusted-raw-observation',{raw:trustedRaw,expected:await evaluate('verify.expected')});
  assert.deepEqual(trustedRaw,await evaluate('verify.expected'),'All 15 trusted edits did not persist');
  const trace=await evaluate('window.moreNativeTrace');
  assert(trace.filter(event=>event.trusted).length>=15,'Trusted event coverage incomplete');
  record('trusted-controls',{raw:await evaluate('verify.read()'),writes:await evaluate('verify.writes()'),trace});

  const previousInstance=await evaluate('verify.instance');
  await cdp('Page.reload');
  await waitFor(`window.verify?.instance&&verify.instance!==${JSON.stringify(previousInstance)}&&!!document.querySelector('.more-pane')`,'New document did not mount');
  assert.deepEqual(await evaluate('verify.read()'),await evaluate('verify.expected'));
  assert.equal((await evaluate('verify.writes()')).length,0,'Reload mount wrote More data');
  assert.equal((await evaluate('verify.removes()')).length,0,'Reload mount removed More data');
  record('new-document-reload',{raw:await evaluate('verify.read()'),mountWrites:0,mountRemoves:0});

  await actualClick('[data-testid="more-reset-default"]');
  await waitFor('verify.read().every(value=>value===null)','Reset Default did not remove all 15 physical keys');
  await waitFor('document.body.textContent.includes("More settings restored to defaults.")','Reset completion truth missing');
  const removals=await evaluate('verify.removes()');
  assert.equal(removals.length,15,'Reset did not issue exactly 15 physical removals');
  assert.equal(new Set(removals).size,15,'Reset removed a More key more than once');
  assert.equal(await evaluate('verify.unrelated()'),'preserve-me','Reset touched unrelated data');
  const displayed=await evaluate(`(()=>[...document.querySelectorAll('.more-pane select:not([aria-label="Language"])')].map(element=>element.value).concat([...document.querySelectorAll('.more-pane [role=switch]')].map(element=>element.getAttribute('aria-checked')),[...document.querySelectorAll('.more-pane .check-inline')].map(element=>element.getAttribute('aria-pressed'))))()`);
  record('physical-reset',{raw:await evaluate('verify.read()'),removals,unrelated:await evaluate('verify.unrelated()'),displayed});
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

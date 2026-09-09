import React from 'react';
import { createRoot } from 'react-dom/client';
import { accountScope } from './packages/plugin-web-storage/src/index';
import { MeditationModule } from './packages/xai-web-meditation/src/MeditationModule';
import { ACTIVE_KEY, createMeditationController, elapsedAt } from './packages/xai-web-meditation/src/internal/sessionController';
const realNow = Date.now.bind(Date); Date.now = () => realNow() + Number(localStorage.getItem('probe-offset') ?? 0);
accountScope.activate(accountScope.lock('probe-A'), 'A');
const physical = () => accountScope.physicalKey(ACTIVE_KEY);
const row = () => JSON.parse(localStorage.getItem(physical())!);
let starts=0, stops=0, denyAudio=true;
const trusted: string[]=[];document.addEventListener('click',e=>{if(e.isTrusted)trusted.push((e.target as HTMLElement).closest('button')?.textContent?.trim()??'');});
const NativeAudio = window.AudioContext;
class ProbeAudio extends NativeAudio {
  override get state(){return denyAudio ? "suspended" : super.state;}
  override async resume() { if(denyAudio)throw new DOMException('Synthetic permission denied','NotAllowedError'); await super.resume(); }
  override createBufferSource(){const source=super.createBufferSource(),start=source.start.bind(source),stop=source.stop.bind(source);source.start=(...args)=>{starts++;return start(...args);};source.stop=(...args)=>{stops++;return stop(...args);};return source;}
}
window.AudioContext=ProbeAudio;
const peerController=createMeditationController();(window as any).peer={controller:peerController,scope:accountScope,row,physical};
const root=createRoot(document.getElementById('root')!);root.render(<MeditationModule lang="en"/>);
const delay=(ms=30)=>new Promise(resolve=>setTimeout(resolve,ms));
const assert=(value:unknown,message:string)=>{if(!value)throw Error(message+' UI='+document.body.innerText.slice(0,220));};
async function waitFor(check:()=>boolean,message:string){for(let i=0;i<200;i++){if(check())return;await delay();}assert(false,message);}
function visibleAlert(selector:string){const node=document.querySelector(selector)as HTMLElement;assert(node,'alert node');const rect=node.getBoundingClientRect();assert(rect.width>0&&rect.left>=0&&rect.right<=innerWidth&&rect.top>=0,'alert outside viewport');const button=node.querySelector('button')!;const target=button.getBoundingClientRect();assert(button.contains(document.elementFromPoint(target.left+target.width/2,target.top+target.height/2)),'alert button obscured');}
async function button(name:string){await waitFor(()=>[...document.querySelectorAll('button')].some(node=>node.textContent?.trim()===name&&!node.disabled),'button '+name);await fetch('/click',{method:'POST',body:JSON.stringify({name})});await delay();}
function record(check:string){const checks=JSON.parse(localStorage.getItem('probe-checks')??'[]');checks.push(check);localStorage.setItem('probe-checks',JSON.stringify(checks));}
function shift(ms:number){localStorage.setItem('probe-offset',String(Number(localStorage.getItem('probe-offset')??0)+ms));}
async function run(){
 const phase=localStorage.getItem('probe-phase')??'start';await waitFor(()=>!!document.querySelector('.med-start'),'module ready');
 if(phase==='start'){
  await button('Start session');await waitFor(()=>!!document.querySelector('.med-player'),'player');
  const initial=row();shift(60000);await delay(300);assert(elapsedAt(row(),Date.now())>=60000,'absolute elapsed');
  await button('Pause');const elapsed=row().accumulatedElapsedMs;shift(1000000);assert(elapsedAt(row(),Date.now())===elapsed,'paused absence counted');
  localStorage.setItem('probe-id',initial.sessionId);localStorage.setItem('probe-elapsed',String(elapsed));localStorage.setItem('probe-phase','paused-reload');record('Actual start/pause controls persist absolute elapsed without counting paused absence');location.reload();return;
 }
 if(phase==='paused-reload'){
  assert(!document.querySelector('.med-player')&&starts===0,'reopen auto played');assert(row().sessionId===localStorage.getItem('probe-id')&&row().phase==='paused','paused restore');
  assert(row().accumulatedElapsedMs===Number(localStorage.getItem('probe-elapsed')),'paused elapsed changed on reload');await button('Open saved meditation');assert(starts===0,'paused open played audio');
  await button('Resume');await waitFor(()=>document.body.innerText.includes('Audio could not start'),'audio permission rejection visible');assert(starts===0,'denied audio starts graph');visibleAlert('.med-player-notice');
  denyAudio=false;await button('Retry audio');await waitFor(()=>starts>0,'native audio retry');assert(trusted.includes('Retry audio'),'audio retry not trusted');record('Native default autoplay policy: trusted Retry audio starts real AudioContext after visible injected denial');
  root.unmount();await delay();assert(stops===starts,'unmount leaked active source');record('Actual module unmount stops every native ambient source');localStorage.setItem('probe-audio-counts',JSON.stringify({starts,stops}));
  localStorage.setItem('probe-phase','process-reopen');await fetch('/restart',{method:'POST'});return;
 }
 if(phase==='process-reopen'){
  assert(row().phase==='running'&&row().sessionId===localStorage.getItem('probe-id'),'running session lost on process reopen');assert(starts===0&&!document.querySelector('.med-player'),'whole reopen auto played');record('Whole Chrome process close/reopen keeps running deadline and requires explicit audio opening');
  denyAudio=false;await button('Open saved meditation');await waitFor(()=>starts>0,'reopened explicit audio');const deadline=row().deadline;shift(2000000);await waitFor(()=>row().phase==='ended','expiry reconciliation');assert(row().endedAt===deadline&&row().reason==='elapsed','wrong expiry business timestamp');assert(stops===starts,'expiry leaked native sources');const bytes=localStorage.getItem(physical());
  const c=createMeditationController();await c.command('reconcile');await c.command('reconcile');assert(localStorage.getItem(physical())===bytes,'duplicate terminal update');record('Past deadline ends once at deadline, stops native sources and creates no duplicate terminal write');
  await button('End');await button('Start session');const before=localStorage.getItem(physical()),realSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){if(key===physical())throw new DOMException('Synthetic quota','QuotaExceededError');return realSet.call(this,key,value);};
  await button('Pause');await waitFor(()=>document.body.innerText.includes('Meditation could not be saved'),'save failure invisible');assert(localStorage.getItem(physical())===before,'quota erased original');visibleAlert('.med-save-recovery');Storage.prototype.setItem=realSet;await button('Retry session save');await waitFor(()=>row().phase==='paused','save retry');record('Native Storage quota preserves original active bytes and explicit retry commits pause');
  root.unmount();await delay();
  const a=createMeditationController();await a.command('reconcile');const aKey=physical(),aBytes=localStorage.getItem(aKey);
  let release!:()=>void;const held=navigator.locks.request('xai:meditation:'+aKey,()=>new Promise<void>(resolve=>{release=resolve;}));await waitFor(()=>!!release,'lock holder');
  const rowPrefs=a.getSnapshot().active!.prefs;const pending=a.command('end');accountScope.activate(accountScope.lock('probe-B'),'B');assert(await a.command('start',rowPrefs),'B blocked behind old A lock');const bBytes=localStorage.getItem(physical());release();await held;assert(!await pending,'old queued A command succeeded');assert(localStorage.getItem(aKey)===aBytes&&localStorage.getItem(physical())===bBytes,'old write crossed account');record('Native Web Locks: while A stays held, B can start; late A cannot mutate B or erase A');
  await fetch('/dualtab',{method:'POST'}).then(async response=>{if(!response.ok)throw Error(await response.text());});record('Two actual pages: stale pause and duplicate start reject without trapping new commands; concurrent end writes terminal once');
  await fetch('/result',{method:'POST',body:JSON.stringify({pass:true,checks:JSON.parse(localStorage.getItem('probe-checks')!),trustedClicks:trusted,nativeAudio:JSON.parse(localStorage.getItem('probe-audio-counts')!)})});
 }
}
if(!location.search.includes('peer'))run().catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error),stack:error.stack,phase:localStorage.getItem('probe-phase')})}));

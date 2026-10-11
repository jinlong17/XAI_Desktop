/** Evidence lifecycle only. No pixel measurement, fixture, or product semantics. */
import {openSync,closeSync,writeSync,fsyncSync,readFileSync,realpathSync,lstatSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {isDeepStrictEqual as equal} from 'node:util';
export const errorInfo=e=>({name:e?.name??'Error',message:String(e?.message??e),code:e?.code??null,stack:e?.stack??null});
export function exclusiveWrite(path,bytes,io={openSync,closeSync,writeSync,fsyncSync}) {
 const fd=io.openSync(path,'wx');try{writeAll(fd,Buffer.from(bytes),io);io.fsyncSync(fd);}finally{io.closeSync(fd);}
}
function writeAll(fd,bytes,io){let offset=0;while(offset<bytes.length){const n=io.writeSync(fd,bytes,offset,bytes.length-offset);if(n<=0)throw Error('Zero evidence write');offset+=n;}}
export function createJournal(path,io={openSync,closeSync,writeSync,fsyncSync}) {
 const fd=io.openSync(path,'wx');const state={path,records:[],persistenceErrors:[],closed:false};
 const failure=e=>{state.persistenceErrors.push(errorInfo(e));process.stderr.write('EVIDENCE PERSISTENCE FAILED '+JSON.stringify(errorInfo(e))+'\n');};
 return Object.assign(state,{
  record(name,value={}){const item={name,...value};state.records.push(item);try{writeAll(fd,Buffer.from(JSON.stringify(item)+'\n'),io);io.fsyncSync(fd);}catch(e){failure(e);throw e;}return item;},
  flush(){try{io.fsyncSync(fd);}catch(e){failure(e);throw e;}},
  close(){if(state.closed)return;try{io.fsyncSync(fd);}catch(e){failure(e);throw e;}finally{state.closed=true;io.closeSync(fd);}},
 });
}
export function readJournal(path){const text=readFileSync(path,'utf8'),lines=text.split('\n'),tail=lines.pop(),records=[];let invalid=null;for(const [index,line] of lines.entries()){try{records.push(JSON.parse(line));}catch(e){invalid={index,line,error:errorInfo(e)};break;}}return{records,tail,invalid,complete:tail===''&&!invalid};}
export async function bounded(label,operation,ms=2000){if(ms>5000||ms<=0)throw Error('Operation deadline outside policy');let timer;try{return await Promise.race([Promise.resolve().then(operation),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(Error(label+' deadline'),{code:'DEADLINE'})),ms);})]);}finally{clearTimeout(timer);}}
export function trackOwned(proc,profile,record){
 const safeRecord=(name,value)=>{try{record(name,value);}catch(e){owner.recordErrors.push(errorInfo(e));}};
 let canonical=null;if(profile)try{canonical=realpathSync(profile);}catch{}
 const owner={recordErrors:[],proc,pid:proc.pid??null,profile,canonical,closed:false,exit:null,startupError:null};
 owner.closedPromise=new Promise(resolve=>{proc.once('error',e=>{owner.startupError=errorInfo(e);safeRecord('owned-startup-error',owner.startupError);});proc.once('close',(code,signal)=>{owner.closed=true;owner.exit={code,signal};safeRecord('owned-streams-closed',{pid:owner.pid,...owner.exit});resolve(owner.exit);});});
 safeRecord('owned-acquired',{pid:owner.pid,profile,canonical:owner.canonical});return owner;
}
export async function closeOwned(owner,send,record,{termMs=1500,killMs=1500,closeMs=500}={}){
 const errors=[...(owner?.recordErrors??[])];const note=(name,value)=>{try{record(name,value);}catch(e){errors.push(errorInfo(e));}};
 if(!owner)return{complete:true,errors,profileRetained:null};
 if(send)try{await bounded('CDP close',send,closeMs);}catch(e){errors.push(errorInfo(e));note('close-command-error',errorInfo(e));}
 if(!owner.closed){note('owned-signal',{pid:owner.pid,signal:'SIGTERM'});try{owner.proc.kill('SIGTERM');await bounded('owned TERM exit and streams',()=>owner.closedPromise,termMs);}catch(e){errors.push(errorInfo(e));}}
 if(!owner.closed){note('owned-signal',{pid:owner.pid,signal:'SIGKILL'});try{owner.proc.kill('SIGKILL');await bounded('owned KILL exit and streams',()=>owner.closedPromise,killMs);}catch(e){errors.push(errorInfo(e));}}
 // A parent close cannot establish descendant profile quiescence. Retention is intentional.
 const profileRetained=owner.profile?{path:owner.profile,reason:'descendant quiescence not independently established'}:null;
 note('owned-cleanup-result',{pid:owner.pid,complete:owner.closed,exit:owner.exit,errors,profileRetained});
 return{complete:owner.closed,errors,profileRetained};
}
export function assertExactOwner(owner,path){if(!owner||path!==owner.profile||lstatSync(path).isSymbolicLink()||realpathSync(path)!==owner.canonical)throw Error('Exact new profile ownership not established');return true;}
export async function finalizeEvidence({journal,status,summaryPath,finalizers=[],write=exclusiveWrite,resultName='result'}){
 status.primaryError??=null;status.cleanupErrors??=[];status.persistenceErrors??=[];
 const persist=(name,value)=>{try{journal.record(name,value);}catch(e){status.persistenceErrors.push(errorInfo(e));}};
 persist('primary-outcome',JSON.parse(JSON.stringify(status)));
 for(const [name,operation] of finalizers){persist('cleanup-start',{finalizer:name});try{const outcome=await bounded(name,operation,5000);if(outcome?.errors?.length)status.cleanupErrors.push(...outcome.errors.map(error=>({finalizer:name,...error})));if(outcome?.complete===false)status.cleanupErrors.push({finalizer:name,message:'Cleanup incomplete'});persist('cleanup-complete',{finalizer:name,outcome});}catch(e){status.cleanupErrors.push({finalizer:name,...errorInfo(e)});persist('cleanup-error',{finalizer:name,...errorInfo(e)});}}
 status.persistenceErrors.push(...journal.persistenceErrors);
 if(status.primaryError||status.cleanupErrors.length||status.persistenceErrors.length)status.status='BLOCKED';
 persist(resultName,JSON.parse(JSON.stringify(status)));
 if(status.persistenceErrors.length)status.status='BLOCKED';
 if(summaryPath)try{write(summaryPath,JSON.stringify(status,null,2)+'\n');}catch(e){status.persistenceErrors.push(errorInfo(e));status.status='BLOCKED';persist('summary-write-failure',errorInfo(e));}
 try{journal.close();}catch(e){status.persistenceErrors.push(errorInfo(e));status.status='BLOCKED';}
 return status;
}
export async function streamChild(command,args,{cwd,env,stdoutPath,stderrPath,record,spawnFn=spawn}){
 const out=openSync(stdoutPath,'wx');let err;
 try{err=openSync(stderrPath,'wx');}catch(e){closeSync(out);throw e;}
 const persistenceErrors=[];let stdout='',stderr='',proc,owner;
 const capture=(fd,b,kind)=>{try{writeAll(fd,b,{writeSync});fsyncSync(fd);}catch(e){persistenceErrors.push(errorInfo(e));}if(kind==='stdout')stdout+=b;else stderr+=b;};
 try{
  record('child-spawn',{command,args,cwd,stdoutPath,stderrPath});proc=spawnFn(command,args,{cwd,env,stdio:['ignore','pipe','pipe']});owner=trackOwned(proc,null,record);
  proc.stdout.on('data',b=>capture(out,b,'stdout'));proc.stderr.on('data',b=>capture(err,b,'stderr'));
  const exit=await owner.closedPromise;const result={...exit,stdout,stderr,pid:owner.pid,startupError:owner.startupError,persistenceErrors};record('child-exit',result);return result;
 }finally{for(const fd of [out,err])try{fsyncSync(fd);}finally{closeSync(fd);}}
}
export const Q1_UNITS=['focus-controls','reload-controls','appearance-fapp1','appearance-fapp2','appearance-accepted','apprail-accepted','geometry-reload-p0'];
export function nextReservation(unit,iteration,historical,current){
 if(!Q1_UNITS.includes(unit)||![1,2,3].includes(iteration))throw Error('Unregistered formal unit/cap');
 const entries=[...historical,...current].filter(x=>x.unit===unit),indices=entries.map(x=>x.iteration).sort();
 const minimum=unit==='focus-controls'?1:0;
 if(entries.length<minimum||new Set(indices).size!==indices.length||indices.some((n,i)=>n!==i+1)||entries.length>=3||iteration!==entries.length+1)throw Error('Permanent cumulative formal reservation refused');return entries.length;
}
/** Only existing raw structured details are used. Any unrelated failed precondition rejects. */
export function inducedCause(test,id,error,records,audit,trace){
 const failed=records.filter(r=>r.name==='check'&&r.kind==='precondition'&&!r.pass);
 if(!error||failed.length!==1||!audit?.length||!audit.every(x=>x.trusted)||!equal(audit.map(({type,key,shiftKey})=>({type,key,shiftKey})),trace))return{pass:false,reason:'missing cause, unrelated refusal or invalid trusted trace'};
 const f=failed[0],closure=id+':full-native-cycle-census-closure';let cause=false;
 if(test==='missing-stop')cause=f.id.startsWith(id+':census-unchanged-at-')&&f.initial?.length>f.census?.length&&f.initial.filter(n=>!f.census.some(c=>c.node===n.node)).length===1&&!f.census.some(c=>c.node===f.initial[0].node);
 else if(['duplicate-stop','excess-body','closure'].includes(test)&&f.id===closure){const visits=f.nodeVisits??[],body=(f.visited??[]).filter(x=>x==='body').length;cause=test==='duplicate-stop'?new Set(visits).size<visits.length:test==='excess-body'?body>1:!f.closed&&f.rows===1&&visits.length===2;}
 else if(f.id===id+':all-stops-valid-stable-attributable-captures'&&f.invalid?.length===1){
  const r=f.invalid[0],a=r.first,b=r.again,m=a?.meta,n=b?.meta;const target=['outside:target','clock:target:'+test].includes(r.desc),view=m&&n&&['scale','width','height','dpr'].every(k=>m.window[k]===n.window[k]);
  if(target&&view){
   const windowChanged=!equal(m.window,n.window),ancestorsChanged=!equal(m.ancestors,n.ancestors),hoverChanged=!equal(m.hover,n.hover);
   const ancestorScrollSame=m.ancestors.length===n.ancestors.length&&m.ancestors.every((x,i)=>x.node===n.ancestors[i].node&&x.transform===n.ancestors[i].transform&&equal(x.scroll,n.ancestors[i].scroll));
   if(test==='scroll-drift')cause=windowChanged&&ancestorScrollSame&&!hoverChanged&&(m.window.x!==n.window.x||m.window.y!==n.window.y)&&m.running===0&&n.running===0;
   if(test==='ancestor-scroll')cause=!windowChanged&&ancestorsChanged&&!hoverChanged&&m.ancestors.some((x,i)=>x.node===n.ancestors[i]?.node&&!equal(x.scroll,n.ancestors[i]?.scroll));
   if(test==='hover-drift')cause=!windowChanged&&!ancestorsChanged&&hoverChanged&&records.some(x=>x.name==='trusted-input-dispatch'&&x.type==='Input.dispatchMouseEvent'&&x.variant==='hover-drift'&&x.pressCount===2&&x.params?.x===150&&x.params?.y===100);
   if(test==='next-overlap')cause=r.context&&r.ambiguousNext===true&&r.targetMoved===false&&b.next?.node&&m.census.some(x=>x.node===b.next.node&&!equal(x.rect,b.next.rect));
   if(test==='clipped')cause=r.targetMoved&&r.context&&r.union===null&&[a,b].some(p=>p.clip&&(p.clip.x<p.vis.left||p.clip.x+p.clip.width>p.vis.right||p.clip.y<p.vis.top||p.clip.y+p.clip.height>p.vis.bottom));
   if(test==='partial-occluded'||test==='ring-occluded')cause=r.targetMoved&&r.context&&r.comparison?.fullyOccluded===false&&r.comparison?.occluded>0&&(test==='partial-occluded'?m.occluders?.some(x=>x.pixels>0&&x.chain?.some(y=>y.className==='occluder')):m.paintOverlaps?.some(x=>x.className==='occluder'&&x.pointerEvents==='none'));
   // Existing invalid metadata lacks bounded capture attempts/hashes for instability. Refuse until separately scoped metadata exists.
   if(test==='unstable')cause=false;
  }
 }
 return{pass:!!cause,reason:cause?'exact induced cause preserved':'specific cause insufficient; freeze for impact review',failed};
}

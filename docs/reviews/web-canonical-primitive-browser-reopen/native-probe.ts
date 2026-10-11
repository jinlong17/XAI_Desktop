import { accountScope, generationKey, generationMarkerKey, readGeneration, commitCanonicalCommand, setCanonicalCommandActivationForTests } from './packages/plugin-web-storage/src/index.ts';
type Data=Record<string,{title:string}>;
const account='whole-browser-review', generation='fixed-generation';
const key=generationKey(account,generation,'xai_calendar_events'), markerKey=generationMarkerKey(account);
const checks:Array<{name:string,pass:true}>=[];
const check=(ok:unknown,name:string)=>{if(!ok)throw Error(name);checks.push({name,pass:true});};
const valid=(v:unknown):v is Data=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.values(v).every(x=>!!x&&typeof x==='object'&&typeof x.title==='string');
const channel='native:browser-reopen';
async function run(){
  const initial=new URLSearchParams(location.search).get('phase')==='initial';
  if(initial){
    localStorage.clear();
    localStorage.setItem(markerKey,JSON.stringify({generation,migrationId:'native-initial',previous:null}));
  }
  const scope=accountScope.activate(accountScope.lock(account),generation);
  const write=(requestId:string,type:'create'|'delete',id:string)=>commitCanonicalCommand({
    key:'xai_calendar_events',scope,channel,requestId,operation:{type,id,title:type==='create'?'Review value':null},validate:valid,initialize:()=>({}),
    mutate:data=>{
      if(type==='create')return {ok:true,data:{...data,[id]:{title:'Review value'}},targetId:id};
      if(!Object.hasOwn(data,id))return {ok:false,reason:'not-found'};
      const next={...data};delete next[id];return {ok:true,data:next,targetId:id};
    },
  });
  if(initial){
    setCanonicalCommandActivationForTests(true);
    const created=await write('original-create','create','original-target');
    check(created.ok&&!created.replay,'initial create commits');
    const deleted=await write('original-delete','delete','original-target');
    check(deleted.ok&&!deleted.replay,'initial delete commits');
    const raw=localStorage.getItem(key)!;
    const state=JSON.parse(raw);
    check(state.revision===2&&Object.keys(state.data).length===0&&Object.keys(state.receipts).length===2,'empty dataset retains both durable receipts');
    return {pass:true,checks,checkpoint:{raw,markerRaw:localStorage.getItem(markerKey),target:'original-target'}};
  }
  const before=(window as any).__checkpoint;
  check(!!before,'external pre-close checkpoint available');
  check(localStorage.getItem(markerKey)===before.markerRaw&&readGeneration(localStorage,account)?.generation===generation,'same persisted account generation survives whole process exit');
  check(localStorage.getItem(key)===before.raw,'exact data and receipt bytes survive whole process exit');
  const disabled=await write('original-create','create','original-target');
  check(!disabled.ok&&disabled.reason==='activation-disabled'&&localStorage.getItem(key)===before.raw,'new process retains cold default activation-off');
  setCanonicalCommandActivationForTests(true);
  const replayCreate=await write('original-create','create','original-target');
  check(replayCreate.ok&&replayCreate.replay&&replayCreate.targetId===before.target&&localStorage.getItem(key)===before.raw,'create replay after browser reopen does not recreate deleted target');
  const replayDelete=await write('original-delete','delete','original-target');
  check(replayDelete.ok&&replayDelete.replay&&replayDelete.targetId===before.target&&localStorage.getItem(key)===before.raw,'delete replay after browser reopen succeeds for missing target');
  const resumed=await write('resumed-create','create','resumed-target');
  const raw=localStorage.getItem(key)!;const next=JSON.parse(raw);
  check(resumed.ok&&!resumed.replay&&next.revision===3&&Object.keys(next.data).length===1&&!!next.data['resumed-target']&&Object.keys(next.receipts).length===3,'new action continues normally and preserves old receipts');
  const again=await write('resumed-create','create','resumed-target');
  check(again.ok&&again.replay&&localStorage.getItem(key)===raw,'continued action is also durably replayable');
  return {pass:true,checks};
}
run().then(result=>fetch('/result',{method:'POST',body:JSON.stringify(result)})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,checks,error:String(error)})}));

import { accountScope, generationKey, generationMarkerKey, commitCanonicalCommand, mutateCanonicalDataset, setCanonicalCommandActivationForTests } from './packages/plugin-web-storage/src/index.ts';

type Data = Record<string, {title:string}>;
const account = 'native-primitive-review';
const generation = 'review-generation';
const key = generationKey(account, generation, 'xai_calendar_events');
const markerKey = generationMarkerKey(account);
const pause = (ms:number) => new Promise(resolve=>setTimeout(resolve,ms));
function assert(ok:unknown,message:string):asserts ok {if(!ok)throw Error(message);}
const validate = (v:unknown):v is Data => !!v && typeof v==='object' && !Array.isArray(v) && Object.values(v).every(x=>!!x&&typeof x==='object'&&typeof x.title==='string');
const query = new URLSearchParams(location.search);
const role = query.get('role');
if(role==='worker') {
  const scope = accountScope.activate(accountScope.lock(account),generation);
  addEventListener('message',async event=>{
    if(event.origin!==location.origin || event.source!==parent) return;
    const {rpc,action,args={}}=event.data;
    if(!rpc)return;
    let result:unknown;
    try {
      if(action==='activate') {setCanonicalCommandActivationForTests(true);result=true;}
      else if(action==='ordinary') {
        const operation=args.operation;
        result=await mutateCanonicalDataset({key:'xai_calendar_events',scope,validate,initialize:()=>({}),mutate:data=>({ok:true,data:operation.type==='clear'?{}:{...data,[operation.id]:{title:operation.title}}})});
      }
      else if(action==='commit') {
        const {requestId,operation}=args;
        result=await commitCanonicalCommand({key:'xai_calendar_events',scope,channel:'native:command',requestId,operation,validate,initialize:()=>({}),mutate:data=>{
          if(operation.type==='create') {
            if(Object.hasOwn(data,operation.id))return {ok:false,reason:'invalid'};
            return {ok:true,data:{...data,[operation.id]:{title:operation.title}},targetId:operation.id};
          }
          if(!Object.hasOwn(data,operation.id))return {ok:false,reason:'not-found'};
          if(operation.type==='delete') {const next={...data};delete next[operation.id];return {ok:true,data:next,targetId:operation.id};}
          return {ok:false,reason:'invalid'};
        }});
      } else throw Error('Unknown action');
      parent.postMessage({rpc,result},location.origin);
    } catch(error) {parent.postMessage({rpc,error:String(error)},location.origin);}
  });
  parent.postMessage({ready:query.get('worker')},location.origin);
} else {
  const checks:Array<{name:string,pass:boolean,detail?:unknown}>=[];
  let serial=0;
  const calls=new Map<string,{resolve:(v:any)=>void,reject:(e:Error)=>void,timer:ReturnType<typeof setTimeout>}>();
  const ready=new Set<string>();
  addEventListener('message',event=>{
    if(event.origin!==location.origin)return;
    if(event.data.ready)ready.add(event.data.ready);
    const call=calls.get(event.data.rpc);if(!call)return;
    clearTimeout(call.timer);calls.delete(event.data.rpc);
    if(event.data.error)call.reject(Error(event.data.error));else call.resolve(event.data.result);
  });
  const rpc=(frame:HTMLIFrameElement,action:string,args?:unknown)=>new Promise<any>((resolve,reject)=>{
    const id=String(++serial);
    const timer=setTimeout(()=>{calls.delete(id);reject(Error('RPC timeout '+action));},5000);
    calls.set(id,{resolve,reject,timer});frame.contentWindow!.postMessage({rpc:id,action,args},location.origin);
  });
  async function load(frame:HTMLIFrameElement,id:string){
    ready.delete(id);frame.src=`/?role=worker&worker=${id}&reload=${++serial}`;
    const start=Date.now();while(!ready.has(id)){assert(Date.now()-start<5000,'worker load timeout');await pause(10);}
  }
  async function run(){
    assert(!!navigator.locks,'real browser Web Locks required');
    localStorage.clear();localStorage.setItem(markerKey,JSON.stringify({generation,migrationId:'review',previous:null}));
    const a=document.createElement('iframe'),b=document.createElement('iframe');document.body.append(a,b);
    await Promise.all([load(a,'a'),load(b,'b')]);
    const create={type:'create',id:'first',title:'Initial'};
    const inactive=await rpc(a,'commit',{requestId:'duplicate',operation:create});
    assert(!inactive.ok&&inactive.reason==='activation-disabled'&&localStorage.getItem(key)===null,'cold default activation must refuse before storage');
    checks.push({name:'cold production default disabled',pass:true});
    await Promise.all([rpc(a,'activate'),rpc(b,'activate')]);
    const duplicate=await Promise.all([rpc(a,'commit',{requestId:'duplicate',operation:create}),rpc(b,'commit',{requestId:'duplicate',operation:create})]);
    let state=JSON.parse(localStorage.getItem(key)!);
    assert(duplicate.every(x=>x.ok)&&duplicate.filter(x=>x.replay).length===1,'concurrent duplicate must have one commit and one replay');
    assert(state.revision===1&&Object.keys(state.data).length===1&&Object.keys(state.receipts).length===1,'duplicate must produce one atomic record revision');
    checks.push({name:'two documents same identity serialize to one commit',pass:true,detail:duplicate});
    const different=await Promise.all(['second','third'].map((id,i)=>rpc(i?a:b,'commit',{requestId:id,operation:{type:'create',id,title:id}})));
    state=JSON.parse(localStorage.getItem(key)!);
    assert(different.every(x=>x.ok)&&state.revision===3&&Object.keys(state.data).length===3,'concurrent distinct operations must preserve both mutations');
    checks.push({name:'two documents distinct writes preserve both updates',pass:true});
    const before=localStorage.getItem(key);
    await load(a,'a');await rpc(a,'activate');
    const afterReload=await rpc(a,'commit',{requestId:'duplicate',operation:{title:'Initial',id:'first',type:'create'}});
    assert(afterReload.ok&&afterReload.replay&&localStorage.getItem(key)===before,'reload must replay durable receipt with reordered semantic fields');
    checks.push({name:'real document reload and semantic field reorder preserve exact bytes',pass:true});
    const conflict=await rpc(a,'commit',{requestId:'duplicate',operation:{...create,title:'Changed'}});
    assert(!conflict.ok&&conflict.reason==='request-conflict'&&localStorage.getItem(key)===before,'same identity changed semantic operation must conflict');
    checks.push({name:'changed request after reload conflicts without write',pass:true});
    for(const id of ['first','second','third']) {
      const deleted=await rpc(a,'commit',{requestId:'delete-'+id,operation:{type:'delete',id}});
      assert(deleted.ok,'initial delete must succeed');
    }
    const emptyRaw=localStorage.getItem(key)!;
    assert(Object.keys(JSON.parse(emptyRaw).data).length===0,'last target must actually be absent');
    await load(b,'b');await rpc(b,'activate');
    const replay=await rpc(b,'commit',{requestId:'delete-third',operation:{type:'delete',id:'third'}});
    assert(replay.ok&&replay.replay&&localStorage.getItem(key)===emptyRaw,'delete-last replay after reload must succeed without writing');
    const fresh=await rpc(b,'commit',{requestId:'fresh-delete',operation:{type:'delete',id:'third'}});
    assert(!fresh.ok&&fresh.reason==='not-found'&&localStorage.getItem(key)===emptyRaw,'fresh delete absent target must fail');
    checks.push({name:'delete last target replay survives document reload; fresh delete refuses',pass:true});
    // Hold the actual committed implementation's key lock in a third document.
    const lockName=`xai:canonical:account:${account}:${generation}:xai_calendar_events`;
    let release!:()=>void;let entered!:()=>void;
    const held=new Promise<void>(resolve=>entered=resolve),gate=new Promise<void>(resolve=>release=resolve);
    const holding=navigator.locks.request(lockName,async()=>{entered();await gate;});await held;
    const waiting=rpc(a,'commit',{requestId:'queued',operation:{type:'create',id:'queued',title:'Must refuse'}});
    const start=Date.now();while(!(await navigator.locks.query()).pending?.some(x=>x.name===lockName)){assert(Date.now()-start<4000,'real request never queued on common key lock');await pause(10);}
    localStorage.setItem(markerKey,JSON.stringify({generation:'replacement',migrationId:'replacement',previous:generation}));
    release();await holding;const stale=await waiting;
    assert(!stale.ok&&stale.reason==='account-changed'&&localStorage.getItem(key)===emptyRaw,'queued command must recheck persisted generation after real lock acquisition');
    checks.push({name:'real queued Web Lock command rejects generation replacement',pass:true});
    localStorage.setItem(markerKey,JSON.stringify({generation,migrationId:'review',previous:null}));
    const prior=JSON.parse(localStorage.getItem(key)!);
    const mixedOperation={type:'create',id:'mixed-ai',title:'AI value'};
    const mixed=await Promise.all([
      rpc(a,'commit',{requestId:'mixed-command',operation:mixedOperation}),
      rpc(b,'ordinary',{operation:{type:'set',id:'mixed-human',title:'Human value'}}),
    ]);
    let mixedState=JSON.parse(localStorage.getItem(key)!);
    assert(mixed.every(x=>x.ok)&&mixedState.revision===prior.revision+2&&mixedState.data['mixed-ai'].title==='AI value'&&mixedState.data['mixed-human'].title==='Human value','AI and public ordinary writer must serialize without losing either update');
    assert(Object.keys(mixedState.receipts).length===Object.keys(prior.receipts).length+1,'ordinary writer must not invent receipts');
    for(const [id,receipt] of Object.entries(prior.receipts))assert(JSON.stringify(mixedState.receipts[id])===JSON.stringify(receipt),'existing receipt changed during mixed writes');
    checks.push({name:'real concurrent command and public ordinary writer preserve both mutations and receipts',pass:true});
    const humanEdit=await rpc(b,'ordinary',{operation:{type:'set',id:'mixed-ai',title:'Later human value'}});
    assert(humanEdit.ok,'public human edit must succeed');
    const humanRaw=localStorage.getItem(key)!;
    await load(a,'a');await rpc(a,'activate');
    const replayAfterHuman=await rpc(a,'commit',{requestId:'mixed-command',operation:mixedOperation});
    assert(replayAfterHuman.ok&&replayAfterHuman.replay&&localStorage.getItem(key)===humanRaw&&JSON.parse(humanRaw).data['mixed-ai'].title==='Later human value','durable replay after reload must preserve actual public-writer edit');
    checks.push({name:'actual public-writer human edit survives old AI command replay after reload',pass:true});
    const receiptsBeforeClear=JSON.stringify(JSON.parse(humanRaw).receipts);
    const clear=await rpc(b,'ordinary',{operation:{type:'clear'}});
    const clearedRaw=localStorage.getItem(key)!;mixedState=JSON.parse(clearedRaw);
    assert(clear.ok&&Object.keys(mixedState.data).length===0&&JSON.stringify(mixedState.receipts)===receiptsBeforeClear,'ordinary domain clear must keep exact receipt values');
    const oldDelete=await rpc(a,'commit',{requestId:'delete-third',operation:{type:'delete',id:'third'}});
    assert(oldDelete.ok&&oldDelete.replay&&localStorage.getItem(key)===clearedRaw,'old deletion replay after domain clear must preserve bytes');
    checks.push({name:'public domain clear preserves receipts and old deletion replay',pass:true});

  }
  run().then(()=>fetch('/result',{method:'POST',body:JSON.stringify({pass:true,checks})})).catch(error=>fetch('/result',{method:'POST',body:JSON.stringify({pass:false,error:String(error),checks})}));
}

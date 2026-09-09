import {afterEach,expect,it,vi} from 'vitest';
import {accountScope,generationMarkerKey} from '../../../packages/plugin-web-storage/src/internal/accountScope.js';
import {mutateCanonicalDataset,setCanonicalCommandActivationForTests} from '../../../packages/plugin-web-storage/src/internal/canonicalCommandState.js';
type Data={items:string[]};
const valid=(v:unknown):v is Data=>!!v&&typeof v==='object'&&Array.isArray((v as Data).items)&&(v as Data).items.every(x=>typeof x==='string');
function setup(enabled=true){
 const scope=accountScope.activate(accountScope.lock('ordinary-review'),'g');
 localStorage.setItem(generationMarkerKey('ordinary-review'),JSON.stringify({generation:'g',migrationId:'review',previous:null}));
 const key=accountScope.physicalKey('xai_calendar_events',scope);
 localStorage.setItem(key,'{"items":[]}');
 setCanonicalCommandActivationForTests(enabled);
 vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>run()}});
 return {scope,key};
}
afterEach(()=>{setCanonicalCommandActivationForTests(false);vi.unstubAllGlobals();localStorage.clear();});
it('disabled envelope activation must also prevent an ordinary writer from publishing the first envelope',async()=>{
 const {scope,key}=setup(false),before=localStorage.getItem(key);
 const result=await mutateCanonicalDataset({key:'xai_calendar_events',scope,validate:valid,mutate:()=>({ok:true,data:{items:['new']}})});
 expect.soft(result.ok).toBe(false);expect(localStorage.getItem(key)).toBe(before);
});
it('successful in-place mutation must actually persist the changed domain',async()=>{
 const {scope,key}=setup();
 const result=await mutateCanonicalDataset({key:'xai_calendar_events',scope,validate:valid,mutate:data=>{data.items.push('new');return {ok:true,data};}});
 // An explicit refusal is safe; a success must reflect the actual changed domain.
 if(!result.ok){expect(localStorage.getItem(key)).toBe('{"items":[]}');return;}
 const raw=JSON.parse(localStorage.getItem(key)!);
 expect(raw.format==='xai-command-state'?raw.data:raw).toEqual({items:['new']});
});
it('no-op cannot return success after captured owner is invalidated inside mutation',async()=>{
 const {scope,key}=setup(),before=localStorage.getItem(key);
 const result=await mutateCanonicalDataset({key:'xai_calendar_events',scope,validate:valid,mutate:data=>{accountScope.lock('replacement');return {ok:true,data};}});
 expect.soft(result).toEqual({ok:false,reason:'account-changed'});expect(localStorage.getItem(key)).toBe(before);
});
it('enabled immutable write positive control commits once',async()=>{
 const {scope,key}=setup();
 const result=await mutateCanonicalDataset({key:'xai_calendar_events',scope,validate:valid,mutate:data=>({ok:true,data:{items:[...data.items,'new']}})});
 expect(result).toMatchObject({ok:true,changed:true,revision:1});
 expect(JSON.parse(localStorage.getItem(key)!).data).toEqual({items:['new']});
});

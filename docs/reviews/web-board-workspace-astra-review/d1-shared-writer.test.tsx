import { createTestLockManager } from "./named-lock-fixture.js";
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {renderHook,act,cleanup} from '@testing-library/react';
import {accountScope,generationMarkerKey,mutateCanonicalDataset,commitCanonicalCommand,setCanonicalCommandActivationForTests,usePref} from '@repo/plugin-web-storage';
import {_clearAllListeners,subscribeSameTab} from '../../../packages/plugin-web-storage/src/internal/storage.js';
type Data={items:string[]};const validate=(v:unknown):v is Data=>!!v&&typeof v==='object'&&Array.isArray((v as Data).items)&&(v as Data).items.every(x=>typeof x==='string');
const key=()=>accountScope.physicalKey('xai_calendar_events');
const opts=()=>({key:'xai_calendar_events' as const,scope:accountScope.capture(),validate,initialize:()=>({items:[]}),mutate:(data:Data)=>({ok:true as const,data:{items:[...data.items,'human']}})});
beforeEach(()=>{localStorage.clear();_clearAllListeners();accountScope.activate(accountScope.lock('d1-writer'),'g1');localStorage.setItem(generationMarkerKey('d1-writer'),JSON.stringify({generation:'g1',migrationId:'fixture',previous:null}));setCanonicalCommandActivationForTests(true);vi.stubGlobal('navigator',{locks:createTestLockManager()});});
afterEach(()=>{cleanup();setCanonicalCommandActivationForTests(false);_clearAllListeners();vi.restoreAllMocks();vi.unstubAllGlobals();});
it('ordinary human edit retains AI receipt and true replay preserves the later edit',async()=>{
 const command={...opts(),channel:'ai',requestId:'r1',operation:{title:'AI'},mutate:()=>({ok:true as const,data:{items:['AI']},targetId:'t1'})};expect((await commitCanonicalCommand(command)).ok).toBe(true);
 const before=JSON.parse(localStorage.getItem(key())!);expect((await mutateCanonicalDataset({...opts(),mutate:()=>({ok:true,data:{items:['Human newer']}})})).ok).toBe(true);
 const raw=localStorage.getItem(key())!;expect(JSON.parse(raw).receipts).toEqual(before.receipts);expect(await commitCanonicalCommand(command)).toMatchObject({ok:true,replay:true});expect(localStorage.getItem(key())).toBe(raw);
});
it('ordinary clear retains all receipts at capacity and a no-op skips writing',async()=>{
 const receipts=Object.fromEntries(Array.from({length:512},(_,i)=>['r'+i,{operationVersion:1,signature:'sig',result:{ok:true,targetId:'t'},committedAt:'2026-09-09T00:00:00Z'}]));localStorage.setItem(key(),JSON.stringify({format:'xai-command-state',version:1,revision:7,data:{items:['old']},receipts}));
 expect(await mutateCanonicalDataset({...opts(),mutate:()=>({ok:true,data:{items:[]}})})).toMatchObject({ok:true,revision:8});const raw=localStorage.getItem(key())!;expect(JSON.parse(raw).receipts).toEqual(receipts);
 const set=vi.spyOn(Storage.prototype,'setItem');expect(await mutateCanonicalDataset({...opts(),mutate:data=>({ok:true,data})})).toMatchObject({ok:true,changed:false});expect(set).not.toHaveBeenCalled();expect(localStorage.getItem(key())).toBe(raw);
});
it('stale revision after queueing refuses before mutation and preserves external bytes',async()=>{
 const make=(revision:number)=>JSON.stringify({format:'xai-command-state',version:1,revision,data:{items:['external']},receipts:{}});localStorage.setItem(key(),make(1));
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);vi.stubGlobal('navigator',{locks:createTestLockManager(async(_name,run)=>{await gate;return run();})});const mutate=vi.fn(opts().mutate);const pending=mutateCanonicalDataset({...opts(),expectedRevision:1,mutate});localStorage.setItem(key(),make(2));release();expect(await pending).toEqual({ok:false,reason:'conflict'});expect(mutate).not.toHaveBeenCalled();expect(localStorage.getItem(key())).toBe(make(2));
});
it('two same-tab hooks see domain data after commit even when an earlier observer throws',async()=>{
 subscribeSameTab('xai_calendar_events',()=>{throw Error('observer');});const a=renderHook(()=>usePref('xai_calendar_events'));const b=renderHook(()=>usePref('xai_calendar_events'));const set=vi.spyOn(Storage.prototype,'setItem');
 await act(async()=>{expect((await mutateCanonicalDataset(opts())).ok).toBe(true);});expect(a.result.current[0]).toEqual({items:['human']});expect(b.result.current[0]).toEqual({items:['human']});expect(set.mock.calls.filter(([k])=>k===key())).toHaveLength(1);
});
it.each(['null','[]','{bad'])('ordinary initializer never repairs present %s',async raw=>{localStorage.setItem(key(),raw);const initialize=vi.fn(()=>({items:[]}));expect((await mutateCanonicalDataset({...opts(),initialize})).ok).toBe(false);expect(initialize).not.toHaveBeenCalled();expect(localStorage.getItem(key())).toBe(raw);});
it('legacy usePref reset does not claim the canonical dataset cleared when removal was refused',async()=>{
 await mutateCanonicalDataset(opts());const raw=localStorage.getItem(key());const {result}=renderHook(()=>usePref('xai_calendar_events'));
 await act(async()=>result.current[2].reset());expect(localStorage.getItem(key())).toBe(raw);expect.soft(result.current[0]).toEqual({items:['human']});expect(result.current[2].isDefault).toBe(false);
});

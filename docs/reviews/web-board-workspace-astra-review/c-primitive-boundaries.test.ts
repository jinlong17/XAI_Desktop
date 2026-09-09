import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { accountScope, generationKey, generationMarkerKey, canonicalCommandSignature as signature, canonicalCommandReceiptId as identity, commitCanonicalCommand, setCanonicalCommandActivationForTests } from '@repo/plugin-web-storage';
const owner = 'astra-c-boundary';
const physical = generationKey(owner,'g1','xai_calendar_events');
const channel = 'calendar';
type Data = Record<string,{ title:string }>;
const validate = (v:unknown):v is Data => !!v && typeof v==='object' && !Array.isArray(v) && Object.values(v).every(row => !!row && typeof row==='object' && typeof row.title==='string');
const input = () => ({ key:'xai_calendar_events' as const, scope:accountScope.capture(),channel,requestId:'r1',operation:{ action:'create',title:'One' },validate,initialize:()=>({}),mutate:(data:Data)=>({ok:true as const,data:{...data,item:{title:'One'}},targetId:'item'}) });
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock(owner),'g1');localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'existing',previous:null}));setCanonicalCommandActivationForTests(true);vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>run()}});});
afterEach(()=>{setCanonicalCommandActivationForTests(false);vi.restoreAllMocks();vi.unstubAllGlobals();});

it('semantic key order replays the stored result while array order causes real request conflict',async()=>{
 const first={a:{y:2,x:1},b:[1,2]};const reordered={b:[1,2],a:{x:1,y:2}};
 expect(signature(first)).toBe('{"a":{"x":1,"y":2},"b":[1,2]}');expect(signature(reordered)).toBe(signature(first));
 expect(await commitCanonicalCommand({...input(),operation:first})).toMatchObject({ok:true,replay:false});
 const raw=localStorage.getItem(physical);const mutate=vi.fn(input().mutate);
 expect(await commitCanonicalCommand({...input(),operation:reordered,mutate})).toMatchObject({ok:true,replay:true});
 expect(await commitCanonicalCommand({...input(),operation:{...first,b:[2,1]},mutate})).toEqual({ok:false,reason:'request-conflict'});
 expect(mutate).not.toHaveBeenCalled();expect(localStorage.getItem(physical)).toBe(raw);
});
it('signature uses exact 16384-code-unit bound and rejects unsupported/cyclic/sparse semantics',()=>{
 expect(signature('x'.repeat(16382))?.length).toBe(16384);expect(signature('x'.repeat(16383))).toBeNull();
 const cyclic:any={};cyclic.self=cyclic;
 for(const value of [undefined,NaN,Infinity,1n,new Date(),Array(1),cyclic,{x:undefined}])expect(signature(value)).toBeNull();
 expect(signature(Object.assign(Object.create(null),{z:1,a:false}))).toBe('{"a":false,"z":1}');
});
it('channel/request composition is unambiguous with exact part and encoded identity bounds',()=>{
 expect(identity('a:b','c')).not.toBe(identity('a','b:c'));
 expect(identity('c','x'.repeat(192))).not.toBeNull();expect(identity('c','x'.repeat(193))).toBeNull();
 expect(identity('x'.repeat(192),'r')).not.toBeNull();expect(identity('x'.repeat(193),'r')).toBeNull();
 for(const value of ['', 'bad\n','bad\u007f'])expect(identity('c',value)).toBeNull();
 // Escaping is part of the representation bound, not just raw component length.
 expect(identity('"'.repeat(192),'"'.repeat(192))).toBeNull();
});
it('oversized operation and request identity are refused before locks or mutation',async()=>{
 const request=vi.fn(async(_name:string,run:()=>Promise<unknown>)=>run());vi.stubGlobal('navigator',{locks:{request}});const mutate=vi.fn(input().mutate);
 expect(await commitCanonicalCommand({...input(),operation:'x'.repeat(16383),mutate})).toEqual({ok:false,reason:'invalid'});
 expect(await commitCanonicalCommand({...input(),requestId:'x'.repeat(193),mutate})).toEqual({ok:false,reason:'invalid'});
 expect(request).not.toHaveBeenCalled();expect(mutate).not.toHaveBeenCalled();expect(localStorage.getItem(physical)).toBeNull();
});
it('record limit permits exactly 4000000 code units, retains replay, and refuses a larger new state',async()=>{
 const base=input();const expected={format:'xai-command-state',version:1,revision:1,data:{item:{title:''}},receipts:{[identity(channel,'r1')!]:{operationVersion:1,signature:signature(base.operation),result:{ok:true,targetId:'item'},committedAt:'2026-09-09T00:00:00.000Z'}}};
 const count=4000000-JSON.stringify(expected).length;const data={item:{title:'x'.repeat(count)}};
 expect(await commitCanonicalCommand({...base,mutate:()=>({ok:true,data,targetId:'item'})})).toMatchObject({ok:true,replay:false});
 const raw=localStorage.getItem(physical)!;expect(raw.length).toBe(4000000);
 const write=vi.spyOn(Storage.prototype,'setItem');const mutate=vi.fn(base.mutate);
 expect(await commitCanonicalCommand({...base,mutate})).toMatchObject({ok:true,replay:true});expect(mutate).not.toHaveBeenCalled();
 expect(await commitCanonicalCommand({...base,requestId:'r2',mutate:()=>({ok:true,data:{item:{title:data.item.title+'x'}},targetId:'item'})})).toEqual({ok:false,reason:'capacity'});
 expect(write).not.toHaveBeenCalled();expect(localStorage.getItem(physical)).toBe(raw);
});
it('empty result target boundary is enforced and maximum-length target remains replayable',async()=>{
 const targetId='x'.repeat(192);
 expect(await commitCanonicalCommand({...input(),mutate:data=>({ok:true,data,targetId})})).toMatchObject({ok:true,targetId});
 const raw=localStorage.getItem(physical);
 expect(await commitCanonicalCommand({...input(),requestId:'r2',mutate:data=>({ok:true,data,targetId:targetId+'x'})})).toEqual({ok:false,reason:'invalid'});
 expect(localStorage.getItem(physical)).toBe(raw);
});
it('physical read denial fails before mutation and preserves receipt-bearing bytes',async()=>{
 await commitCanonicalCommand(input());const raw=localStorage.getItem(physical);const native=Storage.prototype.getItem;
 vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(k){if(k===physical)throw new DOMException('denied','SecurityError');return native.call(this,k);});
 const mutate=vi.fn(input().mutate);
 expect(await commitCanonicalCommand({...input(),mutate})).toEqual({ok:false,reason:'storage'});expect(mutate).not.toHaveBeenCalled();
 vi.restoreAllMocks();expect(localStorage.getItem(physical)).toBe(raw);
});
it('missing full marker fields fail recovery even with a matching generation',async()=>{
 localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1'}));const mutate=vi.fn(input().mutate);
 expect(await commitCanonicalCommand({...input(),mutate})).toEqual({ok:false,reason:'recovery-required'});expect(mutate).not.toHaveBeenCalled();expect(localStorage.getItem(physical)).toBeNull();
});

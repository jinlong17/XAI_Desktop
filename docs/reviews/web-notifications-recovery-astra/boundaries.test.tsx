import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent} from '@testing-library/react';
import {accountScope} from '@repo/plugin-web-storage';
import {activate,blocked,download,flush,guard,hold,keys,mount,nativeGet,nativeSet,retry,setup,unload} from './fixture';
beforeEach(setup);afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
const setTime=(ui:ReturnType<typeof mount>,value:string,field:'start'|'end'='start')=>fireEvent.change(ui.time(field),{target:{value}});
const exportButton=(ui:ReturnType<typeof mount>)=>ui.getByRole('button',{name:'Export Notifications draft'});

it.each(['invalid','unavailable'] as const)('hidden %s start source has Reload and no invented work',async source=>{
 nativeSet.call(localStorage,keys.quiet,'false');if(source==='invalid')nativeSet.call(localStorage,keys.quiet_start,'25:00');else vi.spyOn(Storage.prototype,'getItem').mockImplementation(function(this:Storage,key:string){if(key===keys.quiet_start)throw Error('read denied');return nativeGet.call(this,key);});
 const writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem');const ui=mount();await flush();
 expect(ui.queryByLabelText('Quiet hours start')).toBeNull();expect(blocked()).toBe(false);expect(unload()).toBe(false);expect(ui.queryByRole('button',{name:'Export Notifications draft'})).toBeNull();expect(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();expect(ui.getByRole('button',{name:'Reload Quiet hours start'})).toBeTruthy();
});
it('hidden same-field source repair never acknowledges repaired bytes as an actual time draft',async()=>{
 nativeSet.call(localStorage,keys.quiet_start,'bad-time');const ui=mount();await flush();setTime(ui,'23:15');await flush();
 expect(ui.time('start').value).toBe('23:15');expect(blocked()).toBe(true);fireEvent.click(ui.quiet());await flush();expect(ui.queryByLabelText('Quiet hours start')).toBeNull();
 nativeSet.call(localStorage,keys.quiet_start,'22:00');expect(ui.queryByRole('button',{name:'Reload Quiet hours start'})).toBeNull();retry(ui);await flush();
 const raw=nativeGet.call(localStorage,keys.quiet_start);expect(raw==='23:15'||blocked()).toBe(true);if(raw!=='23:15'){const file=download();fireEvent.click(exportButton(ui));expect(await file.read()).toEqual({version:1,kind:'notifications-draft',values:{device:{quiet_start:'23:15'}}});}
 fireEvent.click(ui.quiet());await flush();expect(ui.time('start').value).toBe('23:15');
});
it('hidden source-only repair rereads its key without discarding a failed hidden sibling',async()=>{
 nativeSet.call(localStorage,keys.quiet_start,'25:00');const ui=mount();await flush();vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys.quiet_end)throw Error('end quota');nativeSet.call(this,key,value);});
 setTime(ui,'06:30','end');await flush();fireEvent.click(ui.quiet());await flush();expect(blocked()).toBe(true);nativeSet.call(localStorage,keys.quiet_start,'23:00');vi.restoreAllMocks();
 const reads=vi.spyOn(Storage.prototype,'getItem'),writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem');fireEvent.click(ui.getByRole('button',{name:'Reload Quiet hours start'}));await flush();
 expect(reads.mock.calls.filter(([key])=>Object.values(keys).includes(key as never)).map(([key])=>key)).toEqual([keys.quiet_start]);expect(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();expect(blocked()).toBe(true);expect(ui.queryByText(/Notifications? settings saved\./)).toBeNull();
 const file=download();fireEvent.click(exportButton(ui));expect(await file.read()).toEqual({version:1,kind:'notifications-draft',values:{device:{quiet_end:'06:30'}}});
});
it('healthy hidden repaired source becomes clean and retains a truthful Saved positive',async()=>{
 nativeSet.call(localStorage,keys.quiet_start,'25:00');const ui=mount();await flush();fireEvent.click(ui.quiet());await flush();expect(blocked()).toBe(false);expect(ui.queryByText(/Notifications? settings saved\./)).toBeNull();nativeSet.call(localStorage,keys.quiet_start,'23:00');const writes=vi.spyOn(Storage.prototype,'setItem');
 fireEvent.click(ui.getByRole('button',{name:'Reload Quiet hours start'}));await flush();expect(writes).not.toHaveBeenCalled();expect(blocked()).toBe(false);expect(unload()).toBe(false);expect(ui.getByText(/Notifications? settings saved\./)).toBeTruthy();
});
for(const latestFails of [false,true])it(`pending Retry after two time choices acknowledges latest success only=${!latestFails}`,async()=>{
 const ui=mount();await flush();const release=await hold(keys.quiet_start);const attempts:string[]=[];
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys.quiet_start){attempts.push(value);if(latestFails&&value==='00:30')throw Error('latest time quota');}nativeSet.call(this,key,value);});
 try{setTime(ui,'23:15');setTime(ui,'00:30');act(()=>{retry(ui);retry(ui);});expect.soft(nativeGet.call(localStorage,keys.quiet_start)).toBe('22:00');expect.soft(ui.time('start').value).toBe('00:30');}finally{await release();}await flush(24);
 expect(nativeGet.call(localStorage,keys.quiet_start)).toBe(latestFails?'23:15':'00:30');expect(ui.time('start').value).toBe('00:30');expect(blocked()).toBe(latestFails);expect(unload()).toBe(latestFails);expect(attempts).toEqual(['23:15','00:30']);
});
it('repeated failed predecessor time recovery advances its queued latest without duplicate attempts',async()=>{
 const ui=mount();await flush();const release=await hold(keys.quiet_start);let deny=true;const attempts:string[]=[];vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys.quiet_start){attempts.push(value);if(value==='23:15'&&deny)throw Error('predecessor quota');}nativeSet.call(this,key,value);});
 try{setTime(ui,'23:15');setTime(ui,'00:30');expect.soft(nativeGet.call(localStorage,keys.quiet_start)).toBe('22:00');}finally{await release();}await flush(24);expect(nativeGet.call(localStorage,keys.quiet_start)).toBe('22:00');expect(ui.time('start').value).toBe('00:30');expect(blocked()).toBe(true);
 act(()=>{retry(ui);retry(ui);});await flush(24);expect(attempts).toEqual(['23:15','23:15']);expect(blocked()).toBe(true);deny=false;act(()=>retry(ui));await flush(24);expect(attempts).toEqual(['23:15','23:15','23:15','00:30']);expect(nativeGet.call(localStorage,keys.quiet_start)).toBe('00:30');expect(blocked()).toBe(false);
});
it('recovered predecessor cannot clear a queued latest time that fails then succeeds on its own Retry',async()=>{
 const ui=mount();await flush();const release=await hold(keys.quiet_start);let denyFirst=true,denyLast=true;vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys.quiet_start&&((value==='23:15'&&denyFirst)||(value==='00:30'&&denyLast)))throw Error('time quota');nativeSet.call(this,key,value);});
 try{setTime(ui,'23:15');setTime(ui,'00:30');}finally{await release();}await flush(24);expect(ui.time('start').value).toBe('00:30');expect(blocked()).toBe(true);denyFirst=false;act(()=>retry(ui));await flush(24);expect(nativeGet.call(localStorage,keys.quiet_start)).toBe('23:15');expect(ui.time('start').value).toBe('00:30');expect(blocked()).toBe(true);expect(unload()).toBe(true);
 denyLast=false;act(()=>retry(ui));await flush(24);expect(nativeGet.call(localStorage,keys.quiet_start)).toBe('00:30');expect(blocked()).toBe(false);
});
it('previous equal time success cannot clear a legal later equal failed attempt',async()=>{
 const ui=mount();await flush();setTime(ui,'23:15');await flush();setTime(ui,'00:30');await flush();vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys.quiet_start)throw Error('new equal value quota');nativeSet.call(this,key,value);});setTime(ui,'23:15');await flush();expect(nativeGet.call(localStorage,keys.quiet_start)).toBe('00:30');expect(ui.time('start').value).toBe('23:15');expect(blocked()).toBe(true);expect(unload()).toBe(true);
});

it('old host capabilities refuse in the owner-change turn and fresh locked permission retains hidden work',async()=>{
 const ui=mount();await flush();const release=await hold(keys.quiet_end);try{setTime(ui,'06:30','end');fireEvent.click(ui.quiet());await flush();expect(blocked()).toBe(true);const old=guard()!;const file=download();let observed:unknown;
 act(()=>{activate('notif-astra-B');const reads=vi.spyOn(Storage.prototype,'getItem'),writes=vi.spyOn(Storage.prototype,'setItem');observed=[old.isCurrent(),old.isBlocking()];old.exportDraft();old.discardDraft();expect(file.click).not.toHaveBeenCalled();expect(reads).not.toHaveBeenCalled();expect(writes).not.toHaveBeenCalled();reads.mockRestore();writes.mockRestore();});expect(observed).toEqual([false,false]);
 act(()=>accountScope.lock('notif-astra-locked'));await flush();expect(blocked()).toBe(true);guard()!.exportDraft();expect(await file.read()).toEqual({version:1,kind:'notifications-draft',values:{device:{quiet_end:'06:30'}}});const writes=vi.spyOn(Storage.prototype,'setItem'),removes=vi.spyOn(Storage.prototype,'removeItem');act(()=>guard()!.discardDraft());await flush();expect(writes).not.toHaveBeenCalled();expect(removes).not.toHaveBeenCalled();expect(blocked()).toBe(false);
 }finally{await release();}await flush();expect(nativeGet.call(localStorage,keys.quiet_end)).toBe('07:00');expect(unload()).toBe(false);
});
it('same-account epoch invalidates old permission without losing current failed time work',async()=>{
 const ui=mount();await flush();vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,key:string,value:string){if(key===keys.quiet_end)throw Error('quota');nativeSet.call(this,key,value);});setTime(ui,'06:30','end');await flush();expect(blocked()).toBe(true);const old=guard()!;act(()=>activate('notif-astra-A'));await flush();expect(old.isCurrent()).toBe(false);expect(old.isBlocking()).toBe(false);expect(blocked()).toBe(true);expect(ui.time('end').value).toBe('06:30');
});
it('unmount invalidates all old host operations and prevents a held time commit',async()=>{
 const ui=mount();await flush();const release=await hold(keys.quiet_end);try{setTime(ui,'06:30','end');await flush();expect(blocked()).toBe(true);const old=guard()!,file=download();ui.unmount();const reads=vi.spyOn(Storage.prototype,'getItem'),writes=vi.spyOn(Storage.prototype,'setItem');expect(old.isCurrent()).toBe(false);expect(old.isBlocking()).toBe(false);old.exportDraft();old.discardDraft();expect(file.click).not.toHaveBeenCalled();expect(reads).not.toHaveBeenCalled();expect(writes).not.toHaveBeenCalled();expect(unload()).toBe(false);}finally{await release();}await flush();expect(nativeGet.call(localStorage,keys.quiet_end)).toBe('07:00');
});
for(const stage of ['blob','url','append'] as const)for(const dispose of [false,true])it(`${stage} synchronous ${dispose?'unmount':'epoch'} cancels export click and cleans resources`,async()=>{
 const ui=mount();await flush();const release=await hold(keys.quiet_end);try{setTime(ui,'06:30','end');await flush();expect(blocked()).toBe(true);const old=guard()!,file=download(),NativeBlob=Blob;
 const invalidate=()=>act(()=>{if(dispose)ui.unmount();else activate('notif-astra-B');});
 if(stage==='blob')vi.stubGlobal('Blob',class extends NativeBlob{constructor(parts?:BlobPart[],options?:BlobPropertyBag){super(parts,options);invalidate();}});
 if(stage==='url'){(URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation(()=>{invalidate();return'blob:notif-astra';});}
 if(stage==='append'){const append=document.body.appendChild.bind(document.body);vi.spyOn(document.body,'appendChild').mockImplementation(node=>{const result=append(node);invalidate();return result;});}
 old.exportDraft();expect(file.click).not.toHaveBeenCalled();expect(old.isCurrent()).toBe(false);if(stage==='url'||stage==='append')expect(file.revoke).toHaveBeenCalledWith('blob:notif-astra');expect(document.querySelector('a[download="notifications-draft.json"]')).toBeNull();
 }finally{await release();}await flush();
});
it('healthy normal time choices remain physical exact values with no unload block',async()=>{
 const ui=mount();await flush();for(const value of ['23:15','00:30','22:00']){setTime(ui,value);await flush();expect(nativeGet.call(localStorage,keys.quiet_start)).toBe(value);expect(ui.time('start').value).toBe(value);}expect(blocked()).toBe(false);expect(unload()).toBe(false);
});
it.each(['blob','url','append','click'] as const)('%s export failure retains hidden work and cleans every created resource',async stage=>{
 const ui=mount();await flush();const release=await hold(keys.quiet_end);try{setTime(ui,'06:30','end');fireEvent.click(ui.quiet());await flush();expect(blocked()).toBe(true);const file=download();
 if(stage==='blob')vi.stubGlobal('Blob',class{constructor(){throw Error('Blob failure');}});
 if(stage==='url')(URL.createObjectURL as ReturnType<typeof vi.fn>).mockImplementation(()=>{throw Error('URL failure');});
 if(stage==='append')vi.spyOn(document.body,'appendChild').mockImplementation(()=>{throw Error('append failure');});
 if(stage==='click')file.click.mockImplementation(()=>{throw Error('click failure');});
 fireEvent.click(exportButton(ui));await flush();expect(blocked()).toBe(true);expect(unload()).toBe(true);expect(nativeGet.call(localStorage,keys.quiet_end)).toBe('07:00');expect(ui.getByText('Export failed. Please retry.')).toBeTruthy();expect(ui.queryByText(/Notifications? settings saved\./)).toBeNull();expect(document.querySelector('a[download="notifications-draft.json"]')).toBeNull();if(stage==='append'||stage==='click')expect(file.revoke).toHaveBeenCalledWith('blob:notif-astra');
 }finally{await release();}await flush();
});

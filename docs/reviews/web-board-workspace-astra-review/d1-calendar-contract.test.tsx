import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { renderHook, render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { accountScope, generationMarkerKey, accountMigrationIssue } from '@repo/plugin-web-storage';
import { useUserCalEvents } from '../../../packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.js';
import { CalendarModule } from '../../../packages/xai-web-calendar/src/CalendarModule.js';
import { EventComposer } from '../../../packages/xai-web-calendar/src/EventComposer.js';
import '../../../packages/xai-web-calendar/src/internal/accountMigration.js';
const event=(patch:Record<string,unknown>={})=>({id:'e1',title:'Original',startISO:'2026-05-22T09:00',endISO:'2026-05-22T10:00',colorPreset:'mint' as const,recurrence:null,createdAt:'2026-05-22T00:00:00.000Z',updatedAt:'2026-05-22T00:00:00.000Z',...patch});
const key=()=>accountScope.physicalKey('xai_calendar_events');
const envelope=(data:unknown,revision=1)=>({format:'xai-command-state',version:1,revision,data,receipts:{}});
const title=()=>document.getElementById('event-composer-title-input')! as HTMLInputElement;
const dialog=()=>document.querySelector('dialog.event-composer') as HTMLDialogElement;
beforeEach(()=>{vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date(2026,4,22,10));});
afterEach(()=>{vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});

it.each(['invalid-civil-date','invalid-duration','invalid-recurrence'])('Calendar writer refuses %s instead of admitting a merely string-shaped event',async kind=>{
 const invalid=event(kind==='invalid-civil-date'?{startISO:'2026-04-31T09:00',endISO:'2026-04-31T10:00'}:kind==='invalid-duration'?{endISO:'2026-05-22T09:00'}:{recurrence:{kind:'garbage'}});
 expect(accountMigrationIssue('xai_calendar_events',JSON.stringify({e1:invalid}))).not.toBeNull();
 const {result}=renderHook(()=>useUserCalEvents());let saved:unknown;
 await act(async()=>{saved=await result.current.create(invalid as any);});
 console.log(kind,JSON.stringify({accepted:saved!==null,physicalWritten:localStorage.getItem(key())!==null}));
 expect.soft(saved).toBeNull();expect(localStorage.getItem(key())).toBeNull();
});
it('invalid current domain rejects repair-looking update without silently retaining an impossible persisted date',async()=>{
 const raw=JSON.stringify(envelope({e1:event({startISO:'2026-04-31T09:00',endISO:'2026-04-31T10:00'})}));localStorage.setItem(key(),raw);
 const {result}=renderHook(()=>useUserCalEvents());let saved:unknown;await act(async()=>{saved=await result.current.update('e1',{title:'Changed'});});
 expect.soft(saved).toBeNull();expect(localStorage.getItem(key())).toBe(raw);
});

it.each(['save','delete'])('real CalendarModule queued %s must preserve an externally edited target and keep recovery open',async action=>{
 localStorage.setItem(accountScope.physicalKey('xai_calendar_view'),JSON.stringify('week'));localStorage.setItem(key(),JSON.stringify(envelope({e1:event()})));
 render(<CalendarModule lang="en"/>);fireEvent.click(screen.getByTitle('Original'));fireEvent.change(title(),{target:{value:'My stale edit'}});
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 fireEvent.click(screen.getByRole('button',{name:action==='save'?'Save':'Delete: Original'}));expect(dialog().open).toBe(true);
 const raw=JSON.stringify(envelope({e1:event({title:'External newer edit'})},2));localStorage.setItem(key(),raw);
 await act(async()=>{release();await gate;});await act(async()=>{});
 console.log('queued-'+action,JSON.stringify({bytesPreserved:localStorage.getItem(key())===raw,editorOpen:dialog().open}));
 expect.soft(localStorage.getItem(key())).toBe(raw);expect(dialog().open).toBe(true);
});
it('queued create merges a legitimate external addition and creates exactly one draft',async()=>{
 render(<CalendarModule lang="en"/>);fireEvent.click(screen.getByLabelText('Add event'));fireEvent.change(title(),{target:{value:'New local'}});
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 fireEvent.click(screen.getByRole('button',{name:'Save'}));fireEvent.click(screen.getByRole('button',{name:'Save'}));
 localStorage.setItem(key(),JSON.stringify(envelope({e1:event({title:'External'})})));
 await act(async()=>{release();await gate;});await waitFor(()=>expect(dialog().open).toBe(false));
 const rows=Object.values(JSON.parse(localStorage.getItem(key())!).data) as {title:string}[];expect(rows.map(e=>e.title).sort()).toEqual(['External','New local']);
});
it('quota failure retains latest edited form and retry commits the latest draft once',async()=>{
 render(<CalendarModule lang="en"/>);fireEvent.click(screen.getByLabelText('Add event'));fireEvent.change(title(),{target:{value:'First'}});
 const physical=key(),native=Storage.prototype.setItem;const fail=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(k===physical)throw new DOMException('quota','QuotaExceededError');native.call(this,k,v);});
 fireEvent.click(screen.getByRole('button',{name:'Save'}));await screen.findByRole('alert');expect(dialog().open).toBe(true);expect(localStorage.getItem(physical)).toBeNull();
 fireEvent.change(title(),{target:{value:'Latest'}});fail.mockRestore();fireEvent.click(screen.getByRole('button',{name:/retry save/i}));await waitFor(()=>expect(dialog().open).toBe(false));
 expect(Object.values(JSON.parse(localStorage.getItem(physical)!).data).map((e:any)=>e.title)).toEqual(['Latest']);
});
it('composer catches an actual rejected Promise, preserves the draft, and permits retry',async()=>{
 const save=vi.fn().mockRejectedValueOnce(Error('async reject')).mockResolvedValueOnce(undefined);
 render(<EventComposer open mode="create" event={null} defaultDateKey="2026-05-22" lang="en" onSave={save} onClose={()=>{}}/>);fireEvent.change(title(),{target:{value:'Keep draft'}});
 fireEvent.click(screen.getByRole('button',{name:'Save'}));await screen.findByRole('alert');expect(title().value).toBe('Keep draft');
 fireEvent.click(screen.getByRole('button',{name:/retry save/i}));await waitFor(()=>expect(save).toHaveBeenCalledTimes(2));
});
it('missing target update/delete refuses without creating an empty replacement record',async()=>{
 const {result}=renderHook(()=>useUserCalEvents());await act(async()=>{expect(await result.current.update('missing',{title:'No'})).toBeNull();expect(await result.current.remove('missing')).toBe(false);});expect(localStorage.getItem(key())).toBeNull();
});
it('queued A-to-B create refuses and keeps both account records untouched',async()=>{
 const physical=key();const {result}=renderHook(()=>useUserCalEvents());let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 let pending!:Promise<unknown>;act(()=>{pending=result.current.create(event());});
 accountScope.activate(accountScope.lock('B'),'g2');localStorage.setItem(generationMarkerKey('B'),JSON.stringify({generation:'g2',migrationId:'B',previous:null}));
 await act(async()=>{release();expect(await pending).toBeNull();});expect(localStorage.getItem(physical)).toBeNull();expect(localStorage.getItem(key())).toBeNull();
});

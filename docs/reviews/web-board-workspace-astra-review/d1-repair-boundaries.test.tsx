import {it,expect,vi,afterEach} from 'vitest';
import {render,renderHook,screen,fireEvent,act} from '@testing-library/react';
import {accountScope,setCanonicalCommandActivationForTests,usePref} from '@repo/plugin-web-storage';
import {CalendarModule} from '../../../packages/xai-web-calendar/src/CalendarModule.js';
import {useUserCalEvents} from '../../../packages/xai-web-calendar/src/internal/eventStore/useUserCalEvents.js';
const key=()=>accountScope.physicalKey('xai_calendar_events');
const event=(date='2026-05-22')=>({id:'e1',title:'Old event',startISO:date+'T09:00',endISO:date+'T10:00',colorPreset:'mint' as const,recurrence:null,createdAt:'2026-05-22T00:00:00.000Z',updatedAt:'2026-05-22T00:00:00.000Z'});
const envelope=(data:unknown,revision=1)=>({format:'xai-command-state',version:1,revision,data,receipts:{}});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});

it('old pending delete completion must not close a newly opened editor',async()=>{
 vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date(2026,4,22,10));
 localStorage.setItem(accountScope.physicalKey('xai_calendar_view'),JSON.stringify('week'));localStorage.setItem(key(),JSON.stringify(envelope({e1:event()})));
 render(<CalendarModule lang="en"/>);fireEvent.click(screen.getByTitle('Old event'));
 const input=()=>document.getElementById('event-composer-title-input') as HTMLInputElement;
 const dialog=()=>document.querySelector('dialog.event-composer') as HTMLDialogElement;
 let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);
 vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 fireEvent.click(screen.getByRole('button',{name:'Delete: Old event'}));fireEvent.click(screen.getByRole('button',{name:'Cancel'}));
 if(dialog().open){await act(async()=>{release();await gate;});return;}
 fireEvent.click(screen.getByLabelText('Add event'));fireEvent.change(input(),{target:{value:'New editor after delete'}});
 await act(async()=>{release();await gate;});await act(async()=>{});
 console.log('old-delete-new-editor',JSON.stringify({editorOpen:dialog().open,latestDraft:input().value,oldEventDeleted:!JSON.parse(localStorage.getItem(key())!).data.e1}));
 expect.soft(input().value).toBe('New editor after delete');expect(dialog().open).toBe(true);
});
it('closed activation still refuses reset of an existing protected envelope without claiming a local reset',async()=>{
 const data={e1:event()};const raw=JSON.stringify(envelope(data));localStorage.setItem(key(),raw);setCanonicalCommandActivationForTests(false);
 const {result}=renderHook(()=>usePref('xai_calendar_events'));await act(async()=>result.current[2].reset());
 expect(localStorage.getItem(key())).toBe(raw);expect.soft(result.current[0]).toEqual(data);expect(result.current[2].isDefault).toBe(false);
});
it('shared calendar guard keeps valid low-year leap-day writes usable',async()=>{
 const {result}=renderHook(()=>useUserCalEvents());let saved:any;
 await act(async()=>{saved=await result.current.create(event('0004-02-29'));});
 expect(saved?.startISO).toBe('0004-02-29T09:00');expect(JSON.parse(localStorage.getItem(key())!).data[saved.id].endISO).toBe('0004-02-29T10:00');
});
it('target baseline allows a receipt-only revision change while preserving latest metadata',async()=>{
 const original=event();localStorage.setItem(key(),JSON.stringify(envelope({e1:original})));
 const {result}=renderHook(()=>useUserCalEvents());let release!:()=>void;const gate=new Promise<void>(resolve=>release=resolve);vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 let pending!:Promise<unknown>;act(()=>{pending=result.current.update('e1',{title:'Human'},original);});
 const receipt={operationVersion:1,signature:'saved',result:{ok:true,targetId:'e1'},committedAt:'2026-05-22T00:00:00.000Z'};
 localStorage.setItem(key(),JSON.stringify({...envelope({e1:original},2),receipts:{external:receipt}}));
 await act(async()=>{release();expect(await pending).not.toBeNull();});const next=JSON.parse(localStorage.getItem(key())!);expect(next.data.e1.title).toBe('Human');expect(next.receipts).toEqual({external:receipt});
});

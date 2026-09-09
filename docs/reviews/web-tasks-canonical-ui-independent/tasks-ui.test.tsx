import React from 'react';
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {render,fireEvent,act,waitFor,cleanup,screen} from '@testing-library/react';
import {accountScope,generationMarkerKey,setCanonicalCommandActivationForTests} from '@repo/plugin-web-storage';
import {TasksModule} from '../../../packages/xai-web-tasks/src/TasksModule.js';
const receipt={operationVersion:1,signature:'retained',result:{ok:true,targetId:'existing'},committedAt:'2026-09-09T00:00:00Z'};
const cols=(title='Original',extra=false)=>[
 {id:'overdue',key:'overdue',count:0,tasks:[]},{id:'next7',key:'next_7_days',count:0,tasks:[]},{id:'later',key:'later',count:0,tasks:[]},
 {id:'nodate',key:'no_date',count:extra?2:1,tasks:[{id:'existing',title:{en:title,zh:title},tag:'work',tags:['work'],priority:'normal',listId:'inbox'},...(extra?[{id:'external',title:{en:'External addition',zh:'External addition'},tag:'work',tags:['work'],priority:'normal',listId:'inbox'}]:[])]}
];
const envelope=(title='Original',extra=false,revision=1)=>JSON.stringify({format:'xai-command-state',version:1,revision,data:cols(title,extra),receipts:{original:receipt}});
const key=()=>accountScope.physicalKey('xai_task_cols');
const data=()=>JSON.parse(localStorage.getItem(key())!);
const checkbox=()=>document.querySelector('.cbx') as HTMLElement;
beforeEach(()=>{
 localStorage.clear();accountScope.activate(accountScope.lock('tasks-ui'),'g1');localStorage.setItem(generationMarkerKey('tasks-ui'),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));
 setCanonicalCommandActivationForTests(true);vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date(2026,8,9,12));
 vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>run()}});
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();setCanonicalCommandActivationForTests(false);});
it('real checkbox persists completion and preserves existing durable receipts',async()=>{
 localStorage.setItem(key(),envelope());render(<TasksModule lang="en"/>);expect(checkbox()).not.toBeNull();fireEvent.click(checkbox());
 await waitFor(()=>expect(data().data.flatMap((c:any)=>c.tasks).find((t:any)=>t.id==='existing').done).toBe(true));
 expect(data().receipts).toEqual({original:receipt});
});
it('queued checkbox refuses a changed target without overwriting newer external bytes',async()=>{
 localStorage.setItem(key(),envelope());render(<TasksModule lang="en"/>);await act(async()=>{});
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 fireEvent.click(checkbox());const newer=envelope('External newer title',false,7);localStorage.setItem(key(),newer);
 await act(async()=>{release();await gate;});await act(async()=>{});
 console.log('queued-target',JSON.stringify({preserved:localStorage.getItem(key())===newer}));
 expect.soft(localStorage.getItem(key())).toBe(newer);expect(await screen.findByRole('alert')).not.toBeNull();
});
it('queued checkbox never drops an unrelated externally added task',async()=>{
 localStorage.setItem(key(),envelope());render(<TasksModule lang="en"/>);await act(async()=>{});
 let release!:()=>void;const gate=new Promise<void>(r=>release=r);vi.stubGlobal('navigator',{locks:{request:async(_name:string,run:()=>Promise<unknown>)=>{await gate;return run();}}});
 fireEvent.click(checkbox());localStorage.setItem(key(),envelope('Original',true,7));await act(async()=>{release();await gate;});await act(async()=>{});
 expect(data().data.flatMap((c:any)=>c.tasks).map((t:any)=>t.id)).toContain('external');expect(data().receipts).toEqual({original:receipt});
});
it('render and checkbox do not repair a present invalid domain by overwriting it with demo tasks',async()=>{
 const broken=JSON.stringify({format:'xai-command-state',version:1,revision:1,data:{invalid:'domain'},receipts:{}});localStorage.setItem(key(),broken);render(<TasksModule lang="en"/>);await act(async()=>{});
 if(checkbox())fireEvent.click(checkbox());await act(async()=>{});expect(localStorage.getItem(key())).toBe(broken);
});
it.each([false,true])('failed checkbox retry preserves its original baseline; external change=%s',async external=>{
 localStorage.setItem(key(),envelope());render(<TasksModule lang="en"/>);await act(async()=>{});
 const physical=key(),write=Storage.prototype.setItem;
 const deny=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(k,v){if(k===physical)throw new DOMException('quota','QuotaExceededError');write.call(this,k,v);});
 fireEvent.click(checkbox());await screen.findByRole('alert');deny.mockRestore();
 let newer='';
 if(external){newer=envelope('New external value',true,9);await act(async()=>{localStorage.setItem(physical,newer);window.dispatchEvent(new StorageEvent('storage',{key:physical,newValue:newer,storageArea:localStorage}));});await waitFor(()=>expect(document.body.textContent).toContain('New external value'));}
 fireEvent.click(screen.getByRole('button',{name:'Retry save'}));await act(async()=>{});await act(async()=>{});
 if(external){expect.soft(localStorage.getItem(physical)).toBe(newer);expect(await screen.findByRole('alert')).not.toBeNull();}
 else await waitFor(()=>expect(data().data.flatMap((c:any)=>c.tasks).find((t:any)=>t.id==='existing').done).toBe(true));
});

import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,waitFor} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {DashHeader} from '../../../packages/xai-web-dashboard-grid/src/DashHeader';
import {prefMutationLockName} from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const key='xai_pref_dashboard_header_note_x';
function activate(owner:string){localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));accountScope.activate(accountScope.lock(owner),'g1');}
beforeEach(()=>{localStorage.clear();activate('offset-A');localStorage.setItem(key,'0');vi.stubGlobal('navigator',{locks:createTestLockManager()});vi.stubGlobal('PointerEvent',class extends MouseEvent{pointerId:number;constructor(type:string,init:any){super(type,init);this.pointerId=init.pointerId??1;}});});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
function mount(){const ui=render(<DashHeader lang="en" now={new Date('2026-09-09T10:00:00Z')}/>);const lane=ui.container.querySelector('.dash-note-lane')!,note=ui.container.querySelector('.dash-note')!;Object.defineProperty(lane,'clientWidth',{value:760});Object.defineProperty(note,'offsetWidth',{value:360});return {ui,note};}
function drag(note:Element){fireEvent.pointerDown(note,{button:0,clientX:200,pointerId:1});fireEvent.pointerMove(note,{clientX:240,pointerId:1});fireEvent.pointerUp(note,{clientX:240,pointerId:1});}
it('absent device position remains absent until an explicit position change',async()=>{localStorage.removeItem(key);mount();await act(async()=>{await Promise.resolve();});expect(localStorage.getItem(key)).toBeNull();});
it('actual position drag waits for its physical device-key lock',async()=>{
 const {note}=mount();let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);
 const held=navigator.locks.request(prefMutationLockName(key),{mode:'exclusive'},()=>{entered();return gate;});await ready;
 try{drag(note);await act(async()=>{await Promise.resolve();});expect.soft((note as HTMLElement).style.getPropertyValue('--dash-note-x')).toBe('40px');expect.soft(localStorage.getItem(key),'physical device lock must coordinate actual drag write').toBe('0');}
 finally{await act(async()=>{release();await held;});}
 await waitFor(()=>expect(localStorage.getItem(key)).toBe('40'));
});
it('device position remains editable after a clean account change in the mounted header',async()=>{
 const {note}=mount();act(()=>activate('offset-B'));drag(note);await waitFor(()=>expect(localStorage.getItem(key)).toBe('40'));
 expect((note as HTMLElement).style.getPropertyValue('--dash-note-x')).toBe('40px');
});

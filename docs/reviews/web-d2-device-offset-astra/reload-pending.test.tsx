import {afterEach,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {DashHeader} from '../../../packages/xai-web-dashboard-grid/src/DashHeader';
import {prefMutationLockName} from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('explicit read-only source reload cancels queued old attempt and its later completion cannot restore error or overwrite repaired source',async()=>{
 localStorage.clear();accountScope.activate(accountScope.lock('reload-A'),'g1');localStorage.setItem(generationMarkerKey('reload-A'),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));
 const key='xai_pref_dashboard_header_note_x';localStorage.setItem(key,'null');const set=Storage.prototype.setItem;vi.stubGlobal('navigator',{locks:createTestLockManager()});
 const ui=render(<DashHeader lang="en" now={new Date('2026-09-09T10:00:00Z')}/>);const lane=ui.container.querySelector('.dash-note-lane')!,note=ui.container.querySelector('.dash-note')! as HTMLElement;Object.defineProperty(lane,'clientWidth',{value:760});Object.defineProperty(note,'offsetWidth',{value:360});
 let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);const held=navigator.locks.request(prefMutationLockName(key),{mode:'exclusive'},()=>{entered();return gate;});await ready;const writes=vi.spyOn(Storage.prototype,'setItem');
 try {
  fireEvent.pointerDown(note,{button:0,clientX:200,pointerId:1});fireEvent.pointerMove(note,{clientX:240,pointerId:1});fireEvent.pointerUp(note,{clientX:240,pointerId:1});await act(async()=>{await Promise.resolve();});
  fireEvent.click(ui.getByText('Reload note position'));set.call(localStorage,key,'80');fireEvent.click(ui.getByText('Reload note position'));
 }finally{await act(async()=>{release();await held;await new Promise(r=>setTimeout(r,0));});}
 expect(localStorage.getItem(key)).toBe('80');expect(writes.mock.calls.filter(c=>c[0]===key)).toEqual([]);expect(ui.queryByRole('alert')).toBeNull();expect(note.style.getPropertyValue('--dash-note-x')).toBe('80px');
});

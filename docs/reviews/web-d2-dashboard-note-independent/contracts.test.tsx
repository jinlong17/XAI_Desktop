import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,waitFor} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {DashHeader} from '../../../packages/xai-web-dashboard-grid/src/DashHeader';
import {accountLifecycleLockName} from '../../../packages/plugin-web-storage/src/internal/accountCoordination';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
let key:string;
beforeEach(()=>{
 localStorage.clear();
 accountScope.activate(accountScope.lock('dashboard-d2-review-A'),'g1');
 localStorage.setItem(generationMarkerKey('dashboard-d2-review-A'),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));
 key=accountScope.physicalKey('xai_pref_dashboard_header_note');
 localStorage.setItem(key,'Original');
 localStorage.setItem('xai_pref_dashboard_header_note_x','0');
 vi.stubGlobal('navigator',{locks:createTestLockManager()});
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('actual Dashboard note waits behind account lifecycle lock and saves the displayed draft afterward',async()=>{
 const ui=render(<DashHeader lang="en" now={new Date('2026-09-09T10:00:00Z')}/>);
 let release!:()=>void,entered!:()=>void;
 const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);
 const held=navigator.locks.request(accountLifecycleLockName('dashboard-d2-review-A'),{mode:'exclusive'},()=>{entered();return gate;});
 await ready;
 try {
  fireEvent.click(ui.getByRole('button',{name:'Edit dashboard note'}));
  fireEvent.change(ui.getByRole('textbox'),{target:{value:'Newest note'}});
  fireEvent.click(ui.getByRole('button',{name:'Save dashboard note'}));
  await act(async()=>{await Promise.resolve();});
  expect.soft(localStorage.getItem(key),'pending account operation must not write early').toBe('Original');
  expect.soft((ui.queryByRole('textbox') as HTMLInputElement|null)?.value,'pending save retains editable latest draft').toBe('Newest note');
 } finally {await act(async()=>{release();await held;});}
 await waitFor(()=>expect(localStorage.getItem(key)).toBe('Newest note'));
});
it('mounting an absent account note does not persist a default without an edit',async()=>{
 localStorage.removeItem(key);
 render(<DashHeader lang="en" now={new Date('2026-09-09T10:00:00Z')}/>);
 await act(async()=>{await Promise.resolve();});
 expect(localStorage.getItem(key)).toBeNull();
});

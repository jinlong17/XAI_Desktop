import {afterEach,beforeEach,it,expect,vi} from 'vitest';
import {act,cleanup,fireEvent,render,waitFor} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {PomodoroModule} from '../../../packages/plugin-web-pomodoro/src/PomodoroModule';
import {prefMutationLockName} from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
const defaults={pomodoro_preset:'focus-25',pomodoro_custom_minutes:45,pomodoro_display_style:'apple',pomodoro_theme:'coral',pomodoro_sound:'soft-chime',pomodoro_muted:false};
beforeEach(()=>{localStorage.clear();accountScope.activate(accountScope.lock('pomo-device-independent'),'g1');localStorage.setItem(generationMarkerKey('pomo-device-independent'),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));vi.stubGlobal('navigator',{locks:createTestLockManager()});vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>setTimeout(()=>cb(performance.now()),16));vi.stubGlobal('cancelAnimationFrame',clearTimeout);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();});
it('mount does not seed any of the six device preference keys',async()=>{
 render(<PomodoroModule lang="en"/>);await act(async()=>{await Promise.resolve();});
 for(const suffix of Object.keys(defaults))expect.soft(localStorage.getItem('xai_pref_'+suffix),suffix).toBeNull();
});
it('actual mute toggle waits on device physical-key lock and preserves account timer data',async()=>{
 for(const [suffix,value] of Object.entries(defaults))localStorage.setItem('xai_pref_'+suffix,JSON.stringify(value));
 const ui=render(<PomodoroModule lang="en"/>),key='xai_pref_pomodoro_muted';
 const sessions=accountScope.physicalKey('xai_pomodoro_sessions'),active=accountScope.physicalKey('xai_pomodoro_active');
 const before={sessions:localStorage.getItem(sessions),active:localStorage.getItem(active)};
 let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);
 const held=navigator.locks.request(prefMutationLockName(key),{mode:'exclusive'},()=>{entered();return gate;});await ready;
 try{fireEvent.click(ui.getByTestId('mute-btn'));await act(async()=>{await Promise.resolve();});expect.soft(localStorage.getItem(key),'mute must wait for its device key lock').toBe('false');}
 finally{await act(async()=>{release();await held;});}
 await waitFor(()=>expect(localStorage.getItem(key)).toBe('true'));
 expect(localStorage.getItem(sessions)).toBe(before.sessions);expect(localStorage.getItem(active)).toBe(before.active);
});

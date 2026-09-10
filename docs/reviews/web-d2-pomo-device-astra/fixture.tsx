import {afterEach,beforeEach,vi} from 'vitest';
import {act,cleanup,fireEvent,render} from '@testing-library/react';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {PomodoroModule} from '../../../packages/plugin-web-pomodoro/src/PomodoroModule';
import {prefMutationLockName} from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';
export const defaults={preset:'focus-25',custom_minutes:45,display_style:'apple',theme:'coral',sound:'soft-chime',muted:false};
export type Name=keyof typeof defaults;
export const key=(name:Name)=>'xai_pref_pomodoro_'+name;
export const nativeSet=Storage.prototype.setItem,nativeGet=Storage.prototype.getItem;
export function activate(owner:string){localStorage.setItem(generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'test',previous:null}));accountScope.activate(accountScope.lock(owner),'g1');}
export function fixture(){beforeEach(()=>{localStorage.clear();activate('pomo-astra-A');for(const [name,value] of Object.entries(defaults))localStorage.setItem(key(name as Name),JSON.stringify(value));vi.stubGlobal('navigator',{locks:createTestLockManager()});vi.stubGlobal('requestAnimationFrame',(cb:FrameRequestCallback)=>setTimeout(()=>cb(performance.now()),16));vi.stubGlobal('cancelAnimationFrame',clearTimeout);});afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();});}
export function mount(){return render(<PomodoroModule lang="en"/>);}
export type UI=ReturnType<typeof mount>;
export async function flush(){await act(async()=>{if(vi.isFakeTimers())await vi.advanceTimersByTimeAsync(0);else await new Promise(r=>setTimeout(r,0));});}
export async function hold(name:Name){let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);const task=navigator.locks.request(prefMutationLockName(key(name)),{mode:'exclusive'},()=>{entered();return gate;});await ready;return async()=>{await act(async()=>{release();await task;});await flush();};}
export function prefAlert(ui:UI){return ui.queryAllByRole('alert').find(node=>/preferences/i.test(node.textContent??''))??null;}
export const cases=[
 {name:'preset',next:'focus-30',act:(ui:UI)=>fireEvent.click(ui.getByTestId('preset-focus-30')),visible:(ui:UI)=>ui.getByTestId('preset-focus-30').getAttribute('aria-pressed')==='true'},
 {name:'custom_minutes',next:47,act:(ui:UI)=>fireEvent.change(ui.getByTestId('custom-minutes-input'),{target:{value:'47'}}),visible:(ui:UI)=>(ui.getByTestId('custom-minutes-input') as HTMLInputElement).value==='47'},
 {name:'display_style',next:'minimal',act:(ui:UI)=>fireEvent.click(ui.getByTestId('style-minimal')),visible:(ui:UI)=>ui.container.querySelector('.module-pomo')?.getAttribute('data-display-style')==='minimal'},
 {name:'theme',next:'blue',act:(ui:UI)=>fireEvent.click(ui.getByTestId('theme-blue')),visible:(ui:UI)=>ui.getByTestId('theme-blue').getAttribute('aria-pressed')==='true'},
 {name:'sound',next:'bell',act:(ui:UI)=>fireEvent.change(ui.getByTestId('sound-select'),{target:{value:'bell'}}),visible:(ui:UI)=>(ui.getByTestId('sound-select') as HTMLSelectElement).value==='bell'},
 {name:'muted',next:true,act:(ui:UI)=>fireEvent.click(ui.getByTestId('mute-btn')),visible:(ui:UI)=>ui.getByTestId('mute-btn').getAttribute('aria-label')==='Unmute'},
] as const;
export function external(name:Name,value:unknown){const physical=key(name),oldValue=localStorage.getItem(physical),newValue=JSON.stringify(value);nativeSet.call(localStorage,physical,newValue);window.dispatchEvent(new StorageEvent('storage',{key:physical,oldValue,newValue,storageArea:localStorage}));}
export function timerBytes(){return {active:localStorage.getItem(accountScope.physicalKey('xai_pomodoro_active')),history:localStorage.getItem(accountScope.physicalKey('xai_pomodoro_sessions'))};}
export function captureExport(){let blob:Blob|undefined;vi.stubGlobal('URL',class extends URL{static createObjectURL(b:Blob){blob=b;return 'blob:preferences';}static revokeObjectURL(){}});vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});return async()=>{if(!blob)throw Error('No actual preference Blob was created');return JSON.parse(await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsText(blob!);}));};}

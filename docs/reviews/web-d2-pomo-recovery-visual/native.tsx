import './packages/plugin-web-pomodoro/src/styles.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {prefMutationLockName} from './packages/plugin-web-storage/src/internal/prefMutation';
import {PomodoroModule} from './packages/plugin-web-pomodoro/src/PomodoroModule';
import './packages/plugin-web-tokens/src/tokens.css';
import './packages/plugin-web-tokens/src/layout.css';
const defaults={preset:'focus-25',custom_minutes:45,display_style:'apple',theme:'coral',sound:'soft-chime',muted:false};
for(const [suffix,value] of Object.entries(defaults))localStorage.setItem('xai_pref_pomodoro_'+suffix,JSON.stringify(value));
const nativeSet=Storage.prototype.setItem;
const mode=new URLSearchParams(location.search).get('mode');
if(mode==='source')localStorage.setItem('xai_pref_pomodoro_sound','null');
let release:()=>void;let held:Promise<unknown>;let appWrites=0;
Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(k.startsWith('xai_pref_pomodoro_'))appWrites++;};
const trackedSet=Storage.prototype.setItem;
(window as any).verify={
 writes:()=>appWrites,
 deny(){Storage.prototype.setItem=function(k,v){if(k==='xai_pref_pomodoro_theme')throw new DOMException('quota','QuotaExceededError');trackedSet.call(this,k,v)}},
 restore(){Storage.prototype.setItem=trackedSet},
 repair(){nativeSet.call(localStorage,'xai_pref_pomodoro_sound','"bell"')},
 async hold(){let entered!:()=>void;const ready=new Promise<void>(r=>entered=r),gate=new Promise<void>(r=>release=r);held=navigator.locks.request(prefMutationLockName('xai_pref_pomodoro_theme'),{mode:'exclusive'},async()=>{entered();await gate});await ready},
 async release(){release();await held},
 external(){const frame=document.createElement('iframe');document.body.append(frame);frame.contentWindow!.localStorage.setItem('xai_pref_pomodoro_theme','"blue"');frame.remove()}
};
createRoot(document.getElementById('app')!).render(<PomodoroModule lang="en"/>);

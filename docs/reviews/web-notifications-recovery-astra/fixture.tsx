import React from 'react';
import {act,render} from '@testing-library/react';
import {vi} from 'vitest';
import {accountScope,generationMarkerKey} from '@repo/plugin-web-storage';
import {notificationsPane} from '../../../packages/plugin-web-settings-rest/src/panes/notificationsPane';
import {prefMutationLockName} from '../../../packages/plugin-web-storage/src/internal/prefMutation';
import {createTestLockManager} from '../web-board-workspace-astra-review/named-lock-fixture';

export const keys={enabled:'xai_pref_notif_enabled',done_sound:'xai_pref_notif_done_sound',push_task:'xai_pref_notif_push_task',push_pomo:'xai_pref_notif_push_pomo',push_habit:'xai_pref_notif_push_habit',quiet:'xai_pref_notif_quiet',quiet_start:'xai_pref_notif_quiet_start',quiet_end:'xai_pref_notif_quiet_end'} as const;
export const nativeGet=Storage.prototype.getItem,nativeSet=Storage.prototype.setItem;
export type Guard={token:object;label?:string;isCurrent():boolean;isBlocking():boolean;exportDraft():void;discardDraft():void};
export const guards:Guard[]=[];
export function activate(owner:string){nativeSet.call(localStorage,generationMarkerKey(owner),JSON.stringify({generation:'g1',migrationId:'notif-astra',previous:null}));accountScope.activate(accountScope.lock(owner),'g1');}
export function setup(){localStorage.clear();activate('notif-astra-A');Object.entries({enabled:'true',done_sound:'subtle',push_task:'true',push_pomo:'true',push_habit:'false',quiet:'true',quiet_start:'22:00',quiet_end:'07:00'}).forEach(([field,value])=>nativeSet.call(localStorage,keys[field as keyof typeof keys],value));guards.length=0;vi.stubGlobal('navigator',{locks:createTestLockManager()});}
export function mount(){const ui=render(notificationsPane.render({lang:'en',registerDepartureGuard:(value:Guard)=>{guards.push(value);return()=>{};}}));return {...ui,time:(name:'start'|'end')=>ui.getByLabelText(`Quiet hours ${name}`) as HTMLInputElement,quiet:()=>ui.getByRole('switch',{name:'Enable quiet hours'})};}
export const guard=()=>guards.at(-1)??null;
export const blocked=()=>guard()?.isBlocking()??false;
export async function flush(rounds=10){await act(async()=>{for(let i=0;i<rounds;i++)await new Promise(resolve=>setTimeout(resolve,0));});}
export function unload(){const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;}
export async function hold(key:string){let release!:()=>void,entered!:()=>void;const gate=new Promise<void>(r=>release=r),ready=new Promise<void>(r=>entered=r);const task=navigator.locks.request(prefMutationLockName(key),{mode:'exclusive'},()=>{entered();return gate;});await ready;return async()=>{await act(async()=>{release();await task;});};}
export function download(){let blob:Blob|null=null;const click=vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{}),revoke=vi.fn();vi.stubGlobal('URL',{createObjectURL:vi.fn((value:Blob)=>{blob=value;return'blob:notif-astra';}),revokeObjectURL:revoke});return{click,revoke,read:async()=>JSON.parse(await new Promise<string>((resolve,reject)=>{if(!blob)throw Error('No Notifications draft Blob');const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsText(blob);})),hasBlob:()=>blob!==null};}
export function retry(ui:ReturnType<typeof mount>,field:'start'|'end'='start'){const button=ui.queryByRole('button',{name:`Retry Quiet hours ${field}`});if(button)button.click();}

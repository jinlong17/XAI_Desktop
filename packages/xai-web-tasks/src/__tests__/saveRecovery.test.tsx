import React from 'react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { accountScope, generationKey } from '@repo/plugin-web-storage';
import { TasksModule } from '../TasksModule.js';
import { DEFAULT_TASK_LISTS } from '../internal/taskMeta.js';
const key=(logical:string)=>generationKey('consumer-test','fixture',logical);
function fail(keyName:string) {const original=Storage.prototype.setItem;return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this: Storage,k,v){if(this===localStorage&&k===keyName)throw new DOMException('Full','QuotaExceededError');return original.call(this,k,v);});}
function saveIn(selector:string){fireEvent.click(document.querySelector(`${selector} .task-composer__btn--primary`)!);}
beforeEach(()=>{vi.useRealTimers();localStorage.clear();});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllGlobals();});
describe('Tasks recoverable writes',()=>{
 it('retains and exports the latest composer draft, then retries exactly once',async()=>{
  render(<TasksModule lang="en"/>);fireEvent.click(document.querySelector('.icon-btn[aria-label="Add"]')!);
  const title=document.querySelector('#task-composer-title-input')!;fireEvent.change(title,{target:{value:'Recover this title'}});
  const before=localStorage.getItem(key('xai_task_cols'));const failure=fail(key('xai_task_cols'));saveIn('dialog.task-composer');
  expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(true);expect(screen.getByRole('alert')).toHaveTextContent('Could not save');expect(localStorage.getItem(key('xai_task_cols'))).toBe(before);
  fireEvent.change(title,{target:{value:'Updated unsaved title'}});
  let exported:Blob|undefined;const create=vi.fn((blob:Blob)=>{exported=blob;return 'blob:fixture';});vi.stubGlobal('URL',class extends URL{static createObjectURL=create;static revokeObjectURL=vi.fn();});vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});
  fireEvent.click(screen.getByRole('button',{name:'Export draft'}));expect(create).toHaveBeenCalledTimes(1);
  const text=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsText(exported!);});expect(JSON.parse(text).draft.title).toBe('Updated unsaved title');
  failure.mockRestore();saveIn('dialog.task-composer');expect(document.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  const all=JSON.parse(localStorage.getItem(key('xai_task_cols'))!).flatMap((c:{tasks:unknown[]})=>c.tasks);expect(all.filter((task:{title:{en:string}})=>task.title.en==='Updated unsaved title')).toHaveLength(1);
 });
 it('retains failed detail edits and commits their latest values on retry',()=>{
  render(<TasksModule lang="en"/>);fireEvent.click(document.querySelector('.task-card')!);const panel=document.querySelector('.task-detail-panel')!;
  const title=within(panel as HTMLElement).getByLabelText('Title');fireEvent.change(title,{target:{value:'Detail draft'}});const failure=fail(key('xai_task_cols'));const before=localStorage.getItem(key('xai_task_cols'));saveIn('.task-detail-panel');
  expect(within(panel as HTMLElement).getByRole('alert')).toBeTruthy();expect(title).toHaveValue('Detail draft');expect(localStorage.getItem(key('xai_task_cols'))).toBe(before);
  fireEvent.change(title,{target:{value:'Latest detail'}});failure.mockRestore();saveIn('.task-detail-panel');expect(localStorage.getItem(key('xai_task_cols'))).toContain('Latest detail');expect(within(panel as HTMLElement).queryByRole('alert')).toBeNull();
 });
 it.each([['list','task_lists'],['tag','task_tags']])('does not publish failed %s metadata and retains its editor for retry',(kind,suffix)=>{
  render(<TasksModule lang="en"/>);fireEvent.click(screen.getByRole('button',{name:`New ${kind}`}));const editor=document.querySelector('.task-meta-dialog')!;const input=within(editor as HTMLElement).getByLabelText('English label');fireEvent.change(input,{target:{value:`Unique ${kind}`}});const before=localStorage.getItem(key(`xai_pref_${suffix}`));const failure=fail(key(`xai_pref_${suffix}`));saveIn('.task-meta-dialog');
  expect(document.querySelector('.task-meta-dialog')).toBeTruthy();expect(input).toHaveValue(`Unique ${kind}`);expect(within(editor as HTMLElement).getByRole('alert')).toBeTruthy();expect(localStorage.getItem(key(`xai_pref_${suffix}`))).toBe(before);expect(document.querySelector('.module-sidebar')!.textContent).not.toContain(`Unique ${kind}`);
  failure.mockRestore();saveIn('.task-meta-dialog');expect(document.querySelector('.task-meta-dialog')).toBeNull();expect(localStorage.getItem(key(`xai_pref_${suffix}`))).toContain(`Unique ${kind}`);
 });
 it('does not close failed detail deletion or delete list metadata before task references commit',()=>{
  localStorage.setItem(key('xai_pref_task_lists'),JSON.stringify(DEFAULT_TASK_LISTS));render(<TasksModule lang="en"/>);fireEvent.click(document.querySelector('.task-card')!);const failure=fail(key('xai_task_cols'));const before=localStorage.getItem(key('xai_task_cols'));const panel=document.querySelector('.task-detail-panel')!;fireEvent.click(within(panel as HTMLElement).getByRole('button',{name:'Delete'}));expect(document.querySelector('.task-detail-panel')).toBeTruthy();expect(within(panel as HTMLElement).getByRole('alert')).toBeTruthy();expect(localStorage.getItem(key('xai_task_cols'))).toBe(before);
  fireEvent.click(within(panel as HTMLElement).getByRole('button',{name:'Close'}));const listBefore=localStorage.getItem(key('xai_pref_task_lists'));fireEvent.click(screen.getAllByRole('button',{name:'Delete list'})[0]!);expect(localStorage.getItem(key('xai_pref_task_lists'))).toBe(listBefore);expect(screen.getByRole('alert')).toBeTruthy();failure.mockRestore();
 });
 it('revokes failed composer retry and export after switching to B',()=>{
  render(<TasksModule lang="en"/>);fireEvent.click(document.querySelector('.icon-btn[aria-label="Add"]')!);fireEvent.change(document.querySelector('#task-composer-title-input')!,{target:{value:'A private draft'}});const failure=fail(key('xai_task_cols'));saveIn('dialog.task-composer');failure.mockRestore();
  const bKey=generationKey('B','fixture','xai_task_cols');localStorage.setItem(bKey,'B raw bytes');act(()=>accountScope.activate(accountScope.lock('B'),'fixture'));saveIn('dialog.task-composer');expect(localStorage.getItem(bKey)).toBe('B raw bytes');expect(localStorage.getItem(key('xai_task_cols'))).not.toContain('A private draft');
  const create=vi.fn();vi.stubGlobal('URL',class extends URL{static createObjectURL=create;});fireEvent.click(screen.getByRole('button',{name:'Export draft'}));expect(create).not.toHaveBeenCalled();expect(screen.getByRole('alert')).toHaveTextContent('original account');
 });
});

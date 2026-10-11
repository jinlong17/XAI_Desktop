import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { accountScope } from '@repo/plugin-web-storage';
import { onWebEvent } from '@repo/xai-web-event-bus';
import { HabitsModule } from '../HabitsModule.js';
const initial={schemaVersion:1,habits:['First','Second'].map((name,i)=>({id:'h'+i,emoji:'🌱',title:{en:name,zh:name},createdAt:'2026-01-01T00:00:00.000Z'})),checkIns:{},diaries:{}};
const key=()=>accountScope.physicalKey('xai_habits_state');
beforeEach(()=>{localStorage.setItem(key(),JSON.stringify(initial));HTMLDialogElement.prototype.showModal=function(){this.open=true;};HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new Event('close'));};});
afterEach(()=>vi.restoreAllMocks());
function deny(){const target=key(),original=Storage.prototype.setItem;return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,name,value){if(name===target)throw new DOMException('quota','QuotaExceededError');original.call(this,name,value);});}
function diary(text:string){fireEvent.change(screen.getByLabelText('Habit diary'),{target:{value:text}});}
function blur(){fireEvent.blur(screen.getByLabelText('Habit diary'));}
describe('Habits save-result recovery',()=>{
 it('retains failed add dialog, all latest fields and saves only once on retry',()=>{
  render(<HabitsModule lang="en"/>);fireEvent.click(screen.getByLabelText('Add habit'));fireEvent.change(document.querySelector('#hb-title')!,{target:{value:'First draft'}});const fail=deny();fireEvent.click(screen.getByText('Save'));
  expect(document.querySelector('dialog')!.open).toBe(true);expect(screen.getByRole('alert').textContent).toContain('Not saved');expect(localStorage.getItem(key())).toBe(JSON.stringify(initial));
  fireEvent.change(document.querySelector('#hb-title')!,{target:{value:'Latest draft'}});fireEvent.change(document.querySelector('#hb-frequency')!,{target:{value:'weekdays'}});
  const escape=new Event('cancel',{cancelable:true});fireEvent(document.querySelector('dialog')!,escape);expect(escape.defaultPrevented).toBe(true);
  fail.mockRestore();fireEvent.click(screen.getByText('Retry save'));expect(document.querySelector('dialog')).toBeNull();const stored=JSON.parse(localStorage.getItem(key())!);expect(stored.habits).toHaveLength(3);expect(stored.habits[0]).toMatchObject({title:{en:'Latest draft'},frequency:{type:'weekdays'}});
 });
 it('failed check-in emits nothing, preserves bytes, and retries exactly once',()=>{
  const events:unknown[]=[];const off=onWebEvent('web:habits:checkin-recorded',event=>events.push(event));render(<HabitsModule lang="en"/>);const fail=deny();fireEvent.click(document.querySelector('.hcell.today')!);
  expect(events).toHaveLength(0);expect(localStorage.getItem(key())).toBe(JSON.stringify(initial));fail.mockRestore();fireEvent.click(screen.getByText('Retry save'));expect(events).toHaveLength(1);expect(Object.keys(JSON.parse(localStorage.getItem(key())!).checkIns.h0)).toHaveLength(1);off();
 });
 it('failed diary retains latest edit and blocks habit/month/view switching until retry',()=>{
  render(<HabitsModule lang="en"/>);diary('First note');const fail=deny();blur();diary('Latest note');
  fireEvent.click(document.querySelectorAll('.habit-row')[1]!);expect((screen.getByLabelText('Habit diary')as HTMLTextAreaElement).value).toBe('Latest note');expect(document.querySelectorAll('.habit-row')[0]!.getAttribute('aria-selected')).toBe('true');
  fireEvent.click(screen.getByRole('button',{name:'Stats'}));expect(screen.getByRole('button',{name:'Calendar'}).getAttribute('aria-selected')).toBe('true');
  fireEvent.click(screen.getByLabelText('Next month'));expect((screen.getByLabelText('Habit diary')as HTMLTextAreaElement).value).toBe('Latest note');
  fail.mockRestore();fireEvent.click(screen.getByText('Retry save'));expect(Object.values(JSON.parse(localStorage.getItem(key())!).diaries.h0)).toEqual(['Latest note']);
 });
 it('cross-tab diary update does not replace dirty text; first-edit baseline prevents overwriting it',()=>{
  render(<HabitsModule lang="en"/>);diary('Local unsaved');const date=new Date(),mk=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
  const newer=JSON.stringify({...initial,diaries:{h0:{[mk]:'External saved'}}});localStorage.setItem(key(),newer);
  act(()=>{window.dispatchEvent(new StorageEvent('storage',{key:key(),newValue:newer,storageArea:localStorage}));});
  expect((screen.getByLabelText('Habit diary')as HTMLTextAreaElement).value).toBe('Local unsaved');blur();expect(localStorage.getItem(key())).toBe(newer);expect(screen.getByRole('alert').textContent).toContain('Newer stored data');
 });
 it('failed diary export/retry stays bound to A after B activates',()=>{
  render(<HabitsModule lang="en"/>);diary('Private A');const fail=deny();blur();fail.mockRestore();const aKey=key();act(()=>{accountScope.activate(accountScope.lock('B'),'B');});const bKey=key(),bBytes=localStorage.getItem(bKey);
  fireEvent.click(screen.getByText('Retry save'));fireEvent.click(screen.getByText('Export draft'));expect(screen.getByRole('alert').textContent).toContain('Export failed');expect(localStorage.getItem(aKey)).toBe(JSON.stringify(initial));expect(localStorage.getItem(bKey)).toBe(bBytes);
 });
 it('explicit discard resets unsaved diary to persisted value and unlocks selection',()=>{
  render(<HabitsModule lang="en"/>);diary('Discard me');const fail=deny();blur();fireEvent.click(screen.getByText('Discard change'));fail.mockRestore();expect((screen.getByLabelText('Habit diary')as HTMLTextAreaElement).value).toBe('');fireEvent.click(document.querySelectorAll('.habit-row')[1]!);expect(document.querySelectorAll('.habit-row')[1]!.getAttribute('aria-selected')).toBe('true');
 });
});

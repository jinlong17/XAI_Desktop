import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountScope } from '@repo/plugin-web-storage';
import { CountdownModule } from '../CountdownModule.js';
import { FIXTURE_FUTURE } from '../__fixtures__/cards.js';
import { mergePresetCountdowns } from '../internal/presetCards.js';
import { useCountdownSaveRecovery } from '../internal/useCountdownSaveRecovery.js';
import { deleteCard, duplicateCard, hideCard, pinCard, reorderCards, restoreCard } from '../internal/cardsReducer.js';
import type { CountdownCard } from '../types.js';
const key=()=>accountScope.physicalKey('xai_countdowns');
function seed() { const cards=mergePresetCountdowns([FIXTURE_FUTURE],new Date());localStorage.setItem(key(),JSON.stringify(cards));return cards; }
function deny() { const target=key(),set=Storage.prototype.setItem;return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===target)throw new DOMException('quota','QuotaExceededError');set.call(this,k,v);}); }
afterEach(()=>vi.restoreAllMocks());
describe('Countdown truthful saves',()=>{
 it('retains actual editor and latest fields on quota then saves one card',()=>{
  seed();render(<CountdownModule lang="en"/>);fireEvent.click(screen.getByLabelText('New countdown'));
  fireEvent.change(screen.getByLabelText('Title (English)'),{target:{value:'First'}});fireEvent.change(screen.getByLabelText('Target time'),{target:{value:'12:00'}});
  const before=localStorage.getItem(key()),fault=deny();fireEvent.click(screen.getByText('Save'));
  expect(document.querySelector('dialog')!.open).toBe(true);expect(screen.getByRole('alert')).toHaveTextContent('Changes were not saved');expect(localStorage.getItem(key())).toBe(before);
  fireEvent.change(screen.getByLabelText('Title (English)'),{target:{value:'Latest'}});fireEvent.change(screen.getByLabelText('Note'),{target:{value:'Latest note'}});
  fault.mockRestore();fireEvent.click(screen.getByText('Retry save'));expect(document.querySelector('dialog')).toBeNull();
  const saved=JSON.parse(localStorage.getItem(key())!);expect(saved.filter((c:CountdownCard)=>c.title.en==='Latest')).toHaveLength(1);expect(saved.find((c:CountdownCard)=>c.title.en==='Latest').note).toBe('Latest note');
 });
 it('delete failure retains editor; retry deletes the original id',()=>{
  seed();render(<CountdownModule lang="en"/>);fireEvent.click(screen.getByText(FIXTURE_FUTURE.title.en));const before=localStorage.getItem(key()),fault=deny();
  fireEvent.click(document.querySelector('.cd-dialog-actions .danger')!);expect(document.querySelector('dialog')!.open).toBe(true);expect(localStorage.getItem(key())).toBe(before);fault.mockRestore();fireEvent.click(document.querySelector('.cd-dialog-actions .danger')!);
  expect(document.querySelector('dialog')).toBeNull();expect(JSON.parse(localStorage.getItem(key())!).find((c:CountdownCard)=>c.id===FIXTURE_FUTURE.id).status).toBe('deleted');
 });
 const changes: [string,(cards:CountdownCard[])=>CountdownCard[]][]=[
  ['pin',c=>pinCard(c,FIXTURE_FUTURE.id,true)],['hide',c=>hideCard(c,FIXTURE_FUTURE.id,true)],['duplicate',c=>duplicateCard(c,FIXTURE_FUTURE.id)],['delete',c=>deleteCard(c,FIXTURE_FUTURE.id)],['restore',c=>restoreCard(c,FIXTURE_FUTURE.id,new Date())],['reorder',c=>reorderCards(c,c.map(x=>x.id).reverse())],
 ];
 it.each(changes)('%s failure retains proposal and retries exactly that proposal',(_name,change)=>{
  const initial=seed();if(_name==='restore')localStorage.setItem(key(),JSON.stringify(hideCard(initial,FIXTURE_FUTURE.id,true)));const {result}=renderHook(useCountdownSaveRecovery);const before=localStorage.getItem(key()),fault=deny();let saved=true;
  act(()=>{saved=result.current.mutate(change)});expect(saved).toBe(false);expect(result.current.error).toBeTruthy();expect(localStorage.getItem(key())).toBe(before);const proposal=result.current.snapshot().pending!.next;
  fault.mockRestore();act(()=>{saved=result.current.retry()});expect(saved).toBe(true);expect(JSON.parse(localStorage.getItem(key())!)).toEqual(proposal);act(()=>{saved=result.current.retry()});expect(saved).toBe(false);
 });
 it('baseline conflict preserves newer bytes and captured A cannot export or retry B',()=>{
  seed();const {result}=renderHook(useCountdownSaveRecovery);const fault=deny();act(()=>{result.current.mutate(c=>pinCard(c,FIXTURE_FUTURE.id,true))});fault.mockRestore();const newer=JSON.stringify([]);localStorage.setItem(key(),newer);act(()=>{expect(result.current.retry()).toBe(false)});expect(localStorage.getItem(key())).toBe(newer);expect(result.current.error).toContain('Newer');
  act(()=>{accountScope.activate(accountScope.lock('B'),'B')});const bBytes=localStorage.getItem(key());act(()=>{expect(result.current.retry()).toBe(false)});expect(()=>result.current.snapshot()).toThrow();expect(localStorage.getItem(key())).toBe(bBytes);
 });
 it('automatic preset merge failure is visible and retry persists presets',()=>{
  localStorage.setItem(key(),'[]');const fault=deny();render(<CountdownModule lang="en"/>);expect(screen.getByRole('alert')).toHaveTextContent('not saved');expect(localStorage.getItem(key())).toBe('[]');fault.mockRestore();fireEvent.click(screen.getByText('Retry save'));expect(JSON.parse(localStorage.getItem(key())!).length).toBeGreaterThan(0);expect(screen.queryByRole('alert')).toBeNull();
 });
});

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountScope, setPref } from '@repo/plugin-web-storage';
import { makeDefaultBoards, type Board } from '@repo/plugin-web-board-core';
import { BoardWorkspacesModule } from '../BoardWorkspacesModule.js';
const key=()=>accountScope.physicalKey('xai_boards_v2');
function mount(){const boards=makeDefaultBoards();setPref('xai_boards_v2',boards);setPref('xai_active_board',boards[0]!.id);render(<BoardWorkspacesModule lang="en"/>);return boards;}
afterEach(()=>vi.restoreAllMocks());
describe('Card/list composer confirmed persistence',()=>{
 for(const kind of ['card','list'] as const)it(`${kind} quota keeps latest draft and stable id through repeated attempts`,()=>{
  mount();const before=localStorage.getItem(key());const captured:string[]=[];const original=Storage.prototype.setItem;
  const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key()){captured.push(v);throw new DOMException('quota','QuotaExceededError');}original.call(this,k,v);});
  fireEvent.click(kind==='card'?screen.getAllByTestId('add-card-btn')[0]!:screen.getByTestId('add-list-btn'));
  const input=screen.getByTestId(kind==='card'?'card-composer-input':'list-name-input');fireEvent.change(input,{target:{value:'First failed'}});fireEvent.click(screen.getByTestId(kind==='card'?'card-composer-add':'list-composer-add'));
  expect(screen.getByRole('alert')).toHaveTextContent('not saved');expect(input).toHaveValue('First failed');expect(localStorage.getItem(key())).toBe(before);
  fireEvent.keyDown(input,{key:'Escape'});expect(input).toBeInTheDocument();fireEvent.change(input,{target:{value:'Latest retry'}});fireEvent.click(screen.getByText('Retry save'));
  const entity=(raw:string)=>{const boards=JSON.parse(raw) as Board[];return kind==='card'?boards[0]!.lists[0]!.cards.at(-1)!:boards[0]!.lists.at(-1)!;};expect(entity(captured[0]!).id).toBe(entity(captured[1]!).id);
  fault.mockRestore();fireEvent.click(screen.getByText('Retry save'));expect(entity(localStorage.getItem(key())!).id).toBe(entity(captured[0]!).id);expect(screen.queryByTestId(kind==='card'?'card-composer-input':'list-name-input')).toBeNull();
  const all=JSON.parse(localStorage.getItem(key())!) as Board[];expect(kind==='card'?all[0]!.lists[0]!.cards.filter(c=>c.title.en==='Latest retry').length:all[0]!.lists.filter(l=>l.customName?.en==='Latest retry').length).toBe(1);
 });
 it('newer raw and subsequent account switch preserve the draft without retry/export mutation',()=>{
  mount();fireEvent.click(screen.getAllByTestId('add-card-btn')[0]!);fireEvent.change(screen.getByTestId('card-composer-input'),{target:{value:'Local draft'}});
  const original=Storage.prototype.setItem;const fault=vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key())throw new DOMException('quota','QuotaExceededError');original.call(this,k,v);});fireEvent.click(screen.getByTestId('card-composer-add'));fault.mockRestore();const aKey=key();const newer=JSON.stringify([...makeDefaultBoards(),{...makeDefaultBoards()[0],id:'external'}]);localStorage.setItem(aKey,newer);fireEvent.click(screen.getByText('Retry save'));expect(localStorage.getItem(aKey)).toBe(newer);expect(screen.getByRole('alert')).toHaveTextContent('Newer board data');
  act(()=>accountScope.activate(accountScope.lock('B'),'B'));const bKey=key();const b=localStorage.getItem(bKey);fireEvent.click(screen.getByText('Retry save'));fireEvent.click(screen.getByText('Export draft'));expect(localStorage.getItem(aKey)).toBe(newer);expect(localStorage.getItem(bKey)).toBe(b);expect(screen.getByRole('alert')).toHaveTextContent('Export failed');
 });
 it('rejects a canonical key removed before the first submission without resurrecting old data',()=>{
  mount();fireEvent.click(screen.getAllByTestId('add-card-btn')[0]!);fireEvent.change(screen.getByTestId('card-composer-input'),{target:{value:'Draft before external removal'}});localStorage.removeItem(key());fireEvent.click(screen.getByTestId('card-composer-add'));expect(localStorage.getItem(key())).toBeNull();expect(screen.getByRole('alert')).toHaveTextContent('Newer board data');expect(screen.getByTestId('card-composer-input')).toHaveValue('Draft before external removal');
 });

});

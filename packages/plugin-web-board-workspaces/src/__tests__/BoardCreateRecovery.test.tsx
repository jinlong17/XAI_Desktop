import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { accountScope, setPref } from '@repo/plugin-web-storage';
import { makeDefaultBoards, type Board } from '@repo/plugin-web-board-core';
import { BoardWorkspacesModule } from '../BoardWorkspacesModule.js';
const boardKey=()=>accountScope.physicalKey('xai_boards_v2'),activeKey=()=>accountScope.physicalKey('xai_active_board');
function mount(){const boards=makeDefaultBoards();setPref('xai_boards_v2',boards);setPref('xai_active_board',boards[0]!.id);render(<BoardWorkspacesModule lang="en"/>);fireEvent.click(screen.getByTestId('bv-switch'));fireEvent.click(screen.getByTestId('bs-new-board'));return boards;}
function deny(key:string){const original=Storage.prototype.setItem;return vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this:Storage,k,v){if(k===key)throw new DOMException('quota','QuotaExceededError');original.call(this,k,v);});}
afterEach(()=>vi.restoreAllMocks());
describe('Board creator ordered persistence',()=>{
 it('canonical quota retains latest editor and never selects nonexistent board',()=>{
  mount();const before=localStorage.getItem(boardKey()),active=localStorage.getItem(activeKey());const fault=deny(boardKey());fireEvent.change(screen.getByTestId('bc-name-input'),{target:{value:'First'}});fireEvent.click(screen.getByTestId('bc-submit'));
  expect(screen.getByRole('alert')).toHaveTextContent('Board was not created');expect(localStorage.getItem(boardKey())).toBe(before);expect(localStorage.getItem(activeKey())).toBe(active);fireEvent.change(screen.getByTestId('bc-name-input'),{target:{value:'Latest'}});fault.mockRestore();fireEvent.click(screen.getByTestId('bc-submit'));
  const saved=JSON.parse(localStorage.getItem(boardKey())!) as Board[];expect(saved.filter(b=>b.name.en==='Latest')).toHaveLength(1);expect(screen.queryByTestId('bc-name-input')).toBeNull();
 });
 it('active selection quota is partial success; retry only opens one existing board',()=>{
  mount();const fault=deny(activeKey());fireEvent.change(screen.getByTestId('bc-name-input'),{target:{value:'Created once'}});fireEvent.click(screen.getByTestId('bc-submit'));
  expect(screen.getByRole('alert')).toHaveTextContent('Board created');expect(screen.getByTestId('bc-name-input')).toBeDisabled();const board=JSON.parse(localStorage.getItem(boardKey())!).find((b:Board)=>b.name.en==='Created once');expect(board).toBeTruthy();fault.mockRestore();const writes=vi.spyOn(Storage.prototype,'setItem');fireEvent.click(screen.getByTestId('bc-submit'));
  expect(writes.mock.calls.filter(([k])=>k===boardKey())).toHaveLength(0);expect(localStorage.getItem(activeKey())).toBe(board.id);expect(JSON.parse(localStorage.getItem(boardKey())!).filter((b:Board)=>b.name.en==='Created once')).toHaveLength(1);
 });
 it('newer raw wins over a failed create retry',()=>{
  mount();const fault=deny(boardKey());fireEvent.click(screen.getByTestId('bc-submit'));fault.mockRestore();const newer=JSON.stringify([...makeDefaultBoards(),{...makeDefaultBoards()[0],id:'external'}]);localStorage.setItem(boardKey(),newer);fireEvent.click(screen.getByTestId('bc-submit'));expect(localStorage.getItem(boardKey())).toBe(newer);expect(screen.getByRole('alert')).toHaveTextContent('Newer board data');
 });
 it('old owner cannot retry or export its failed creation into B',()=>{
  mount();const fault=deny(boardKey());fireEvent.click(screen.getByTestId('bc-submit'));fault.mockRestore();const aKey=boardKey(),aBytes=localStorage.getItem(aKey);act(()=>accountScope.activate(accountScope.lock('B'),'B'));const bKey=boardKey(),bBytes=localStorage.getItem(bKey);fireEvent.click(screen.getByTestId('bc-submit'));fireEvent.click(screen.getByText('Export draft'));expect(localStorage.getItem(aKey)).toBe(aBytes);expect(localStorage.getItem(bKey)).toBe(bBytes);expect(screen.getByRole('alert')).toHaveTextContent('Export failed');
 });
});

import { useLayoutEffect } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { accountScope, setPref } from '../../../packages/plugin-web-storage/src/index.js';
import { makeDefaultBoards, readBoardStorage, createBoardStorageEnvelope } from '../../../packages/plugin-web-board-core/src/index.js';
import { BoardWorkspacesModule } from '../../../packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.js';
const key = (name: string) => accountScope.physicalKey(name);
const boardKey = () => key('xai_boards_v2');
const activeKey = () => key('xai_active_board');
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve(); }); };
it('genuinely absent board storage initializes valid persistent boards', async () => {
 expect(localStorage.getItem(boardKey())).toBeNull(); render(<BoardWorkspacesModule lang="en" />); await settle();
 expect(readBoardStorage(JSON.parse(localStorage.getItem(boardKey())!)).status).toBe('valid');
});
for (const envelope of [false, true]) it(`valid ${envelope ? 'envelope' : 'legacy'} automation retries a rejected write and retains storage format`, async () => {
 const boards = makeDefaultBoards(); const initial = JSON.stringify(envelope ? createBoardStorageEnvelope(boards) : boards); localStorage.setItem(boardKey(), initial);
 const native = Storage.prototype.setItem; let rejected = 0;
 const fault = vi.spyOn(Storage.prototype,'setItem').mockImplementation(function(this: Storage, k, v) { if(k===boardKey()){rejected++;throw new DOMException('Quota','QuotaExceededError');}native.call(this,k,v); });
 render(<BoardWorkspacesModule lang="en" />); await settle(); expect(rejected).toBeGreaterThan(0); expect(localStorage.getItem(boardKey())).toBe(initial); expect(screen.getByRole('alert')).toHaveTextContent('Automation was not saved');
 fault.mockRestore();fireEvent.click(screen.getByTestId('automation-run-btn'));await settle();
 const saved=JSON.parse(localStorage.getItem(boardKey())!);const result=readBoardStorage(saved);expect(result.status).toBe('valid');expect(Array.isArray(saved)).toBe(!envelope);
 if(result.status==='valid')expect(result.boards[0]!.lists.find(l=>l.id==='b-done')!.cards[0]!.completedAt).toBeTruthy();
 expect(screen.queryByRole('alert')).toBeNull();
});
function ReplaceInLayout({ replace }: { replace: () => void }) { useLayoutEffect(replace,[]); return null; }
for(const mode of ['active-only','board-replaced','board-removed'] as const) it(`queued selection correction refuses same-account ${mode} before the queued write`, async () => {
 const boards=makeDefaultBoards();setPref('xai_boards_v2',boards);setPref('xai_active_board','stale-id');
 let expectedActive='stale-id';let expectedBoard:string|null=JSON.stringify(boards);
 const replace=()=>{
  if(mode==='active-only'){expectedActive='b-pm';localStorage.setItem(activeKey(),expectedActive);}
  if(mode==='board-replaced'){const next=makeDefaultBoards();next[0]!.id='stale-id';expectedBoard=JSON.stringify(next);localStorage.setItem(boardKey(),expectedBoard);}
  if(mode==='board-removed'){expectedBoard=null;localStorage.removeItem(boardKey());}
 };
 render(<><BoardWorkspacesModule lang="en" /><ReplaceInLayout replace={replace}/></>);await settle();
 expect(localStorage.getItem(activeKey())).toBe(expectedActive);
 if(mode!=='active-only')expect(localStorage.getItem(boardKey())).toBe(expectedBoard);
});
it('stable valid source still corrects a genuinely stale active selection', async () => {
 setPref('xai_boards_v2',makeDefaultBoards());setPref('xai_active_board','stale-id');
 render(<BoardWorkspacesModule lang="en" />);await settle();
 expect(localStorage.getItem(activeKey())).toBe('b-default');
 expect(readBoardStorage(JSON.parse(localStorage.getItem(boardKey())!)).status).toBe('valid');
});

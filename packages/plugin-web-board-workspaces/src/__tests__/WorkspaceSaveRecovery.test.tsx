import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { accountScope } from '@repo/plugin-web-storage';
import { loadWorkspacesOrDefault, makeDefaultBoards } from '@repo/plugin-web-board-core';
import { useWorkspaceSaveRecovery } from '../internal/useWorkspaceSaveRecovery.js';

const workspaceKey = () => accountScope.physicalKey('xai_board_workspaces');
const boardKey = () => accountScope.physicalKey('xai_boards_v2');
const empty = { id: 'empty', name: { en: 'Empty', zh: '空' }, color: 'red' };
const workspaces = [...loadWorkspacesOrDefault(null), empty];

function mount(rawWorkspaces: unknown, rawBoards: unknown, activeId = '') {
  const save = vi.fn((next: unknown) => { void next; return true; });
  const select = vi.fn((id: string) => { void id; return true; });
  const hook = renderHook(() => useWorkspaceSaveRecovery(rawWorkspaces, rawBoards, activeId, save, select));
  return { ...hook, save, select };
}

it('refuses parsed but schema-invalid workspace bytes on the first create and retry', () => {
  const invalid = [{ id: 'recover-me', name: { en: 'Original' }, color: 123 }];
  localStorage.setItem(workspaceKey(), JSON.stringify(invalid));
  const { result, save } = mount(invalid, makeDefaultBoards());
  act(() => { expect(result.current.run('create', undefined, 'New workspace')).toBe(false); });
  act(() => { expect(result.current.run('create', undefined, 'Latest workspace')).toBe(false); });
  expect(localStorage.getItem(workspaceKey())).toBe(JSON.stringify(invalid));
  expect(save).not.toHaveBeenCalled();
  expect(result.current.error).toContain('workspace data is unusable');
});

it.each(['null', '[]'])('refuses present unusable workspace payload %s', (raw) => {
  localStorage.setItem(workspaceKey(), raw);
  const rendered = JSON.parse(raw);
  const { result, save } = mount(rendered, makeDefaultBoards());
  act(() => { expect(result.current.run('create', undefined, 'New workspace')).toBe(false); });
  expect(localStorage.getItem(workspaceKey())).toBe(raw);
  expect(save).not.toHaveBeenCalled();
});

it('allows a genuinely absent workspace key to use the initial seed policy', () => {
  localStorage.removeItem(workspaceKey());
  const { result, save } = mount(null, makeDefaultBoards());
  act(() => { expect(result.current.run('create', undefined, 'Fresh workspace')).toBe(true); });
  expect(save).toHaveBeenCalledOnce();
  expect(save.mock.calls[0]![0]).toEqual(expect.arrayContaining([expect.objectContaining({ name: { en: 'Fresh workspace', zh: 'Fresh workspace' } })]));
});

it('refuses invalid board membership for workspace deletion and ordinary pick', () => {
  const invalid = [{ id: 'valuable-board', workspaceId: 'empty', title: 'Recover me' }];
  localStorage.setItem(workspaceKey(), JSON.stringify(workspaces));
  localStorage.setItem(boardKey(), JSON.stringify(invalid));
  const deletion = mount(workspaces, invalid);
  act(() => { expect(deletion.result.current.run('delete', 'empty')).toBe(false); });
  expect(deletion.save).not.toHaveBeenCalled();
  expect(deletion.result.current.error).toContain('board data is unusable');

  const selection = mount(workspaces, invalid);
  act(() => { expect(selection.result.current.run('pick', 'valuable-board')).toBe(false); });
  expect(selection.select).not.toHaveBeenCalled();
  expect(selection.result.current.error).toContain('board data is unusable');
});

it('keeps the existing valid empty-workspace deletion path', () => {
  const boards = makeDefaultBoards();
  localStorage.setItem(workspaceKey(), JSON.stringify(workspaces));
  localStorage.setItem(boardKey(), JSON.stringify(boards));
  const { result, save } = mount(workspaces, boards);
  act(() => { expect(result.current.run('delete', 'empty')).toBe(true); });
  expect(save).toHaveBeenCalledWith(workspaces.filter(workspace => workspace.id !== 'empty'));
});

import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BoardWorkspacesModule } from '../../../packages/plugin-web-board-workspaces/src/BoardWorkspacesModule.js';
import { makeDefaultBoards, loadWorkspacesOrDefault } from '../../../packages/plugin-web-board-core/src/index.js';
import { accountScope, setPref } from '../../../packages/plugin-web-storage/src/index.js';
const key = (name: string) => accountScope.physicalKey(name);
const wk = () => key('xai_board_workspaces');
const bk = () => key('xai_boards_v2');
const empty = { id: 'empty', name: { en: 'Empty', zh: '空' }, color: 'red' };
const seed = () => { setPref('xai_boards_v2', makeDefaultBoards()); setPref('xai_board_workspaces', [...loadWorkspacesOrDefault(null), empty]); };
const open = () => { render(<BoardWorkspacesModule lang="en" />); fireEvent.click(screen.getByTestId('bv-switch')); };
const deny = () => { const native = Storage.prototype.setItem; return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(this: Storage, k, v) { if (k === wk()) throw new DOMException('Synthetic quota', 'QuotaExceededError'); native.call(this, k, v); }); };
const retry = () => fireEvent.click(screen.getByText('Retry workspace change'));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
for (const kind of ['recolor', 'delete'] as const) it(`${kind}: rejected bytes retained, retry durable, remount matches stored result`, () => {
 seed(); open(); const before = localStorage.getItem(wk()); const fault = deny(); fireEvent.click(screen.getByTestId(`bs-ws-${kind}-empty`));
 expect(localStorage.getItem(wk())).toBe(before); expect(screen.getByRole('alert')).toBeInTheDocument(); fault.mockRestore(); retry();
 const after = JSON.parse(localStorage.getItem(wk())!); const target = after.find((w: any) => w.id === 'empty');
 if (kind === 'delete') expect(target).toBeUndefined(); else expect(target.color).not.toBe('red');
 expect(screen.queryByRole('alert')).toBeNull(); cleanup(); open();
 if (kind === 'delete') expect(screen.queryByTestId('bs-ws-recolor-empty')).toBeNull(); else expect(screen.getByTestId('bs-ws-recolor-empty').getAttribute('style')).not.toContain('red');
 expect(localStorage.getItem(wk())).toBe(JSON.stringify(after));
});
it('delete: external board membership arriving after quota failure wins over retry', () => {
 seed(); open(); const before = localStorage.getItem(wk()); const fault = deny(); fireEvent.click(screen.getByTestId('bs-ws-delete-empty')); fault.mockRestore();
 const boards = makeDefaultBoards(); boards[0]!.workspaceId = 'empty'; localStorage.setItem(bk(), JSON.stringify(boards)); retry();
 expect(localStorage.getItem(wk())).toBe(before); expect(localStorage.getItem(bk())).toBe(JSON.stringify(boards)); expect(screen.getByRole('alert')).toHaveTextContent('Board membership changed');
});
it('create: absent workspace storage remains a supported fresh-start write', () => {
 setPref('xai_boards_v2', makeDefaultBoards()); open(); fireEvent.click(screen.getByTestId('bs-new-workspace')); fireEvent.change(screen.getByTestId('bs-ws-new-name'), { target: { value: 'Fresh' } }); fireEvent.click(screen.getByTestId('bs-ws-new-add'));
 expect(JSON.parse(localStorage.getItem(wk())!).some((w: any) => w.name.en === 'Fresh')).toBe(true); expect(screen.queryByRole('alert')).toBeNull();
});
for (const raw of ['{broken', JSON.stringify([{ id: 'recover-me', name: { en: 'Original' }, color: 123 }])]) it(`create: malformed workspace bytes are preserved: ${raw}`, () => {
 setPref('xai_boards_v2', makeDefaultBoards()); localStorage.setItem(wk(), raw); open(); fireEvent.click(screen.getByTestId('bs-new-workspace')); fireEvent.change(screen.getByTestId('bs-ws-new-name'), { target: { value: 'New' } }); fireEvent.click(screen.getByTestId('bs-ws-new-add'));
 expect(localStorage.getItem(wk())).toBe(raw); expect(screen.getByRole('alert')).toBeInTheDocument();
});
it('delete: structurally malformed board membership must not be treated as an empty workspace', () => {
 seed(); const corruptBoards = JSON.stringify([{ id: 'valuable-board', workspaceId: 'empty', title: 'Recover me' }]); localStorage.setItem(bk(), corruptBoards); const before = localStorage.getItem(wk()); open(); fireEvent.click(screen.getByTestId('bs-ws-delete-empty'));
 expect(localStorage.getItem(wk())).toBe(before); expect(localStorage.getItem(bk())).toBe(corruptBoards); expect(screen.getByRole('alert')).toBeInTheDocument();
});
for (const kind of ['create', 'delete'] as const) it(`${kind}: quota retry must not replace a pre-existing structurally invalid baseline`, () => {
 seed();
 if (kind === 'create') localStorage.setItem(wk(), JSON.stringify([{ id: 'recover-me', name: { en: 'Original' }, color: 123 }]));
 else localStorage.setItem(bk(), JSON.stringify([{ id: 'valuable-board', workspaceId: 'empty', title: 'Recover me' }]));
 const workspaceBefore = localStorage.getItem(wk()), boardBefore = localStorage.getItem(bk()); open(); const fault = deny();
 if (kind === 'create') { fireEvent.click(screen.getByTestId('bs-new-workspace')); fireEvent.change(screen.getByTestId('bs-ws-new-name'), { target: { value: 'Retry' } }); fireEvent.click(screen.getByTestId('bs-ws-new-add')); }
 else fireEvent.click(screen.getByTestId('bs-ws-delete-empty'));
 expect(localStorage.getItem(wk())).toBe(workspaceBefore); expect(screen.getByRole('alert')).toBeInTheDocument(); fault.mockRestore(); retry();
 expect(localStorage.getItem(wk())).toBe(workspaceBefore); expect(localStorage.getItem(bk())).toBe(boardBefore); expect(screen.getByRole('alert')).toBeInTheDocument();
});

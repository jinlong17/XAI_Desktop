import { useRef, useState } from 'react';
import { accountScope } from '@repo/plugin-web-storage';
import { BOARD_TEMPLATES, loadBoardsOrDefault, preserveBoardStorageFormat, type Board, type BoardTemplate, type BoardWorkspace } from '@repo/plugin-web-board-core';

export type BoardCreateDraft = { templateId: BoardTemplate; name: string; workspaceId: string };
/** Two ordered writes, with an explicit partial-success state; never a cross-key transaction. */
export function useBoardCreateRecovery(rawBoards: unknown, workspaces: readonly BoardWorkspace[], saveBoards: (next: unknown) => boolean, selectBoard: (id: string) => boolean) {
  const [owner] = useState(() => accountScope.capture());
  const pending = useRef<{ id: string; baseline: string | null; committed: boolean; draft: BoardCreateDraft } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = () => { accountScope.assertCurrent(owner); return accountScope.physicalKey('xai_boards_v2', owner); };
  function create(draft: BoardCreateDraft): boolean {
    try {
      const physical = key(), raw = localStorage.getItem(physical);
      if (!pending.current?.committed) {
        if (!workspaces.some(ws => ws.id === draft.workspaceId)) throw new Error('Workspace changed. Choose an available workspace.');
        const tpl = BOARD_TEMPLATES.find(t => t.id === draft.templateId);
        if (!tpl) throw new Error('Unknown board template.');
        const proposal = pending.current ?? { id: `b-${crypto.randomUUID()}`, baseline: raw, committed: false, draft };
        proposal.draft = draft; pending.current = proposal;
        if (raw !== proposal.baseline || raw !== null && JSON.stringify(JSON.parse(raw)) !== JSON.stringify(rawBoards)) throw new Error('Newer board data exists. Export the draft and reopen.');
        const board: Board = { id: proposal.id, workspaceId: draft.workspaceId, name: {en: draft.name, zh: draft.name}, cover: tpl.cover, template: draft.templateId, lists: tpl.lists() };
        if (!saveBoards(preserveBoardStorageFormat(rawBoards, [...loadBoardsOrDefault(rawBoards), board]))) throw new Error('Board was not saved. Retry or export the draft.');
        proposal.committed = true;
      }
      const proposal = pending.current!;
      const stored = localStorage.getItem(key());
      if (!loadBoardsOrDefault(stored === null ? null : JSON.parse(stored)).some(board => board.id === proposal.id)) throw new Error('Created board is no longer present. Reopen the board switcher.');
      if (!selectBoard(proposal.id)) throw new Error('Board was created, but opening it failed. Retry opening the same board.');
      pending.current = null; setError(null); return true;
    } catch (failure) { setError(String(failure)); return false; }
  }
  return {
    create, error, created: pending.current?.committed === true,
    reset: () => { pending.current = null; setError(null); },
    snapshot: (draft: BoardCreateDraft) => ({ version: 1, kind: 'board-create-recovery', stored: localStorage.getItem(key()), draft, committedBoardId: pending.current?.committed ? pending.current.id : null }),
  };
}

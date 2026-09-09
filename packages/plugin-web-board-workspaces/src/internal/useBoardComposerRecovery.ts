import { useRef, useState } from 'react';
import { accountScope } from '@repo/plugin-web-storage';
import { addCardToListById, addNewList, loadBoardsOrDefault, preserveBoardStorageFormat } from '@repo/plugin-web-board-core';

type Kind = 'card' | 'list';
/** Page-local recovery: captured owner, original raw bytes and stable proposed entity id. */
export function useBoardComposerRecovery(rawBoards: unknown, boardId: string, save: (next: unknown) => boolean) {
  const [owner] = useState(() => accountScope.capture());
  const pending = useRef<{ kind: Kind; boardId: string; listId?: string; id: string; baseline: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const key = () => { accountScope.assertCurrent(owner); return accountScope.physicalKey('xai_boards_v2', owner); };
  function submit(kind: Kind, text: string, listId?: string): boolean {
    try {
      const raw = localStorage.getItem(key());
      const proposal = pending.current ?? { kind, boardId, listId, id: `${kind}-${crypto.randomUUID()}`, baseline: raw };
      pending.current = proposal;
      if (proposal.kind !== kind || proposal.boardId !== boardId || proposal.listId !== listId) throw Error('The destination changed. Export or discard the original draft.');
      if (!text.trim()) throw Error('Enter a title before retrying.');
      if (raw !== proposal.baseline || raw !== null && JSON.stringify(JSON.parse(raw)) !== JSON.stringify(rawBoards)) throw Error('Newer board data exists. Export the draft and reopen.');
      const boards = loadBoardsOrDefault(rawBoards), board = boards.find(item => item.id === boardId);
      if (!board || kind === 'card' && !board.lists.some(list => list.id === listId && !list.archived)) throw Error('The destination is no longer available.');
      const lists = kind === 'card'
        ? addCardToListById(board.lists, listId!, text).map(list => list.id === listId ? { ...list, cards: list.cards.map((card, index) => index === list.cards.length - 1 ? { ...card, id: proposal.id } : card) } : list)
        : addNewList(board.lists, text).map((list, index) => index === board.lists.length ? { ...list, id: proposal.id } : list);
      if (!save(preserveBoardStorageFormat(rawBoards, boards.map(item => item.id === boardId ? { ...item, lists } : item)))) throw Error('Changes were not saved. Retry or export your draft.');
      pending.current = null; setError(null); return true;
    } catch (failure) { setError(String(failure)); return false; }
  }
  return {
    submit, error, pending: pending.current,
    discard() { pending.current = null; setError(null); },
    snapshot(text: string) { return { version: 1, kind: 'board-composer-draft', proposal: pending.current, text, stored: localStorage.getItem(key()) }; },
  };
}

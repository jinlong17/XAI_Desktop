import { accountScope, setPref, type AccountScope, type TaskColsState } from '@repo/plugin-web-storage';
import { loadBoardsOrDefault, readBoardStorage, preserveBoardStorageFormat, type Board, type BoardCardTaskLink } from '@repo/plugin-web-board-core';
import { bucketIdForBoardDueDate, findBoardLinkedTask, loadTaskColsOrSeed, taskCardFromBoardLink, upsertBoardLinkedTask } from '@repo/plugin-web-tasks';

export type TaskLinkResult = { ok: true } | { ok: false; phase: 'intent' | 'task' | 'acknowledgement'; message: string };
/** A recoverable ordered command, not an atomic transaction across storage keys. */
export function ensureBoardTaskLink(boardId: string, cardId: string, scope: AccountScope): TaskLinkResult {
  let phase: 'intent' | 'task' | 'acknowledgement' = 'intent';
  const read = (key: string): unknown => {
    accountScope.assertCurrent(scope);
    const raw = localStorage.getItem(accountScope.physicalKey(key, scope));
    return raw === null ? null : JSON.parse(raw);
  };
  const boardsNow = () => {
    const raw = read('xai_boards_v2');
    if (raw !== null && readBoardStorage(raw).status !== 'valid') throw Error('Board data needs recovery; original bytes were preserved.');
    const boards = loadBoardsOrDefault(raw);
    const board = boards.find(board => board.id === boardId);
    const list = board?.lists.find(list => list.cards.some(card => card.id === cardId));
    const card = list?.cards.find(card => card.id === cardId);
    if (!board || !list || !card) throw Error('The source card no longer exists.');
    return { raw, boards, list, card };
  };
  const saveLink = (link: BoardCardTaskLink) => {
    const current = boardsNow();
    const next: Board[] = current.boards.map(board => board.id !== boardId ? board : { ...board, lists: board.lists.map(list => ({ ...list, cards: list.cards.map(card => card.id === cardId ? { ...card, taskLink: link } : card) })) });
    accountScope.assertCurrent(scope);
    if (!setPref('xai_boards_v2', preserveBoardStorageFormat(current.raw, next), scope)) throw Error('Board link could not be saved.');
  };
  try {
    const current = boardsNow();
    const source = { type: 'board-card' as const, boardId, listId: current.list.id, cardId };
    const rawTasks = read('xai_task_cols');
    const cols = loadTaskColsOrSeed(rawTasks);
    if (rawTasks !== null && cols !== rawTasks) throw Error('Task data needs recovery; original bytes were preserved.');
    const existing = findBoardLinkedTask(cols, source);
    const draft = current.card.taskLink?.pending ?? { title: current.card.title, ...(current.card.dueDate ? { dueDate: current.card.dueDate } : {}) };
    const task = existing?.task ?? taskCardFromBoardLink({ ...source, ...draft });
    const intent: BoardCardTaskLink = current.card.taskLink?.pending
      ? current.card.taskLink
      : { source: 'xai-web-tasks', taskId: task.id, createdAt: current.card.taskLink?.createdAt ?? new Date().toISOString(), pending: draft };
    if (intent.taskId !== task.id) throw Error('The stored link identity conflicts with the task. Original data was preserved.');
    if (!current.card.taskLink?.pending) saveLink(intent);
    phase = 'task';
    if (!existing) {
      accountScope.assertCurrent(scope);
      if (!setPref('xai_task_cols', upsertBoardLinkedTask(cols, task, bucketIdForBoardDueDate(draft.dueDate), true) as unknown as TaskColsState, scope)) throw Error('Link intent saved; task creation failed. Retry to finish.');
    }
    phase = 'acknowledgement';
    const latest = boardsNow().card.taskLink;
    if (latest?.taskId !== intent.taskId) throw Error('The link changed while saving. Review the current card.');
    const complete = { ...intent };
    delete complete.pending;
    saveLink(complete);
    return { ok: true };
  } catch (error) {
    return { ok: false, phase, message: (phase === 'acknowledgement' ? 'Task saved; Board acknowledgement is pending. Retry to finish. ' : '') + (error instanceof Error ? error.message : 'Task link could not be saved.') };
  }
}

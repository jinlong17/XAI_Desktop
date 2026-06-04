/**
 * Pure helpers for Board list/card mutation.
 *
 * All helpers return fresh arrays — no input mutation. Cross-list move is
 * implemented as a single transform so React state updates atomically; a
 * caller wrapping this in a `setBoards` updater closure will produce a single
 * render and a single autosave flush via `@repo/plugin-web-storage`.
 */

import type {
  BoardCard,
  BoardList,
  BoardListColorId,
  BilingualText,
} from "../types.js";
import { getBoardCardDateCompatibilityPatch } from "./dateModel.js";

function makeBilingualMirror(text: string): BilingualText {
  return { en: text, zh: text };
}

function clearUndefinedKeys<T extends Record<string, unknown>>(value: T): T {
  const next = { ...value };
  for (const key of Object.keys(next)) {
    if (next[key] === undefined) {
      delete next[key];
    }
  }
  return next;
}

/** Normalize structured detail fields into legacy chip fields. */
export function normalizeBoardCardDetail(card: BoardCard): BoardCard {
  const next: BoardCard = clearUndefinedKeys(card as unknown as Record<string, unknown>) as unknown as BoardCard;

  if (next.checklistItems !== undefined) {
    const total = next.checklistItems.length;
    const done = next.checklistItems.filter((item) => item.done).length;
    if (total > 0) {
      next.checklist = { done, total };
    } else {
      delete next.checklist;
    }
  }

  if (next.attachments !== undefined) {
    if (next.attachments.length > 0) {
      next.attach = next.attachments.length;
    } else {
      delete next.attach;
    }
  }

  return next;
}

export function mergeBoardCardPatch(
  card: BoardCard,
  patch: Partial<BoardCard>,
): BoardCard {
  const merged: BoardCard = { ...card, ...patch };

  if ("startDate" in patch || "dueDate" in patch) {
    Object.assign(merged, getBoardCardDateCompatibilityPatch(patch));
  }

  return normalizeBoardCardDetail(merged);
}

/**
 * Move a card from `fromListId` to `toListId`. No-op when:
 *  - `fromListId === toListId`
 *  - source list does not contain `cardId`
 *  - either list id is unknown
 *
 * Returns the same array reference when no-op (so React can bail out via
 * `Object.is` shallow equality checks if the caller chooses).
 */
export function moveCardToList(
  lists: readonly BoardList[],
  cardId: string,
  fromListId: string,
  toListId: string,
): BoardList[] {
  if (fromListId === toListId) {
    return lists as BoardList[];
  }
  const fromList = lists.find((list) => list.id === fromListId);
  if (!fromList) {
    return lists as BoardList[];
  }
  const card = fromList.cards.find((c) => c.id === cardId);
  if (!card) {
    return lists as BoardList[];
  }
  const toList = lists.find((list) => list.id === toListId);
  if (!toList) {
    return lists as BoardList[];
  }
  return lists.map((list) => {
    if (list.id === fromListId) {
      return { ...list, cards: list.cards.filter((c) => c.id !== cardId) };
    }
    if (list.id === toListId) {
      return { ...list, cards: [...list.cards, card] };
    }
    return list;
  });
}

/** Append a new card to `lists[listIdx]`. Whitespace-only text is a no-op. */
export function addCardToList(
  lists: readonly BoardList[],
  listIdx: number,
  cardTitleText: string,
): BoardList[] {
  const trimmed = cardTitleText.trim();
  if (!trimmed) {
    return lists as BoardList[];
  }
  if (listIdx < 0 || listIdx >= lists.length) {
    return lists as BoardList[];
  }
  const newCard: BoardCard = {
    id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: makeBilingualMirror(trimmed),
    labels: [],
  };
  return lists.map((list, idx) =>
    idx === listIdx ? { ...list, cards: [...list.cards, newCard] } : list,
  );
}

/** Append a brand-new empty list. Whitespace-only name is a no-op. */
export function addNewList(
  lists: readonly BoardList[],
  customNameText: string,
): BoardList[] {
  const trimmed = customNameText.trim();
  if (!trimmed) {
    return lists as BoardList[];
  }
  const newList: BoardList = {
    id: `l-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key: null,
    customName: makeBilingualMirror(trimmed),
    color: null,
    cards: [],
  };
  return [...lists, newList];
}

/** Set or clear (`color = null`) the target list's color. */
export function setListColor(
  lists: readonly BoardList[],
  listId: string,
  color: BoardListColorId | null,
): BoardList[] {
  return lists.map((list) =>
    list.id === listId ? { ...list, color } : list,
  );
}

/** Merge a patch into the matching card and normalize derived detail fields. */
export function updateCardInList(
  lists: readonly BoardList[],
  listId: string,
  cardId: string,
  patch: Partial<BoardCard>,
): BoardList[] {
  return lists.map((list) => {
    if (list.id !== listId) return list;
    return {
      ...list,
      cards: list.cards.map((card) =>
        card.id === cardId ? mergeBoardCardPatch(card, patch) : card,
      ),
    };
  });
}

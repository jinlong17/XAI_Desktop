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

function makeBilingualMirror(text: string): BilingualText {
  return { en: text, zh: text };
}

function parseIsoDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function dateToDisplay(value: string): { due: string; dueEn?: string; dueLate: boolean } | null {
  const date = parseIsoDate(value);
  if (!date) return null;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateStart.getTime() === todayStart.getTime()) {
    return { due: "今天", dueEn: "Today", dueLate: false };
  }

  return {
    due: `${date.getMonth() + 1}/${date.getDate()}`,
    dueLate: dateStart.getTime() < todayStart.getTime(),
  };
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

/**
 * Normalize the detail fields that are now canonical for the workspace detail
 * modal back into the legacy chip fields consumed by the existing views.
 */
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

  if (next.dueDate !== undefined) {
    const display = dateToDisplay(next.dueDate);
    if (display) {
      next.due = display.due;
      next.dueEn = display.dueEn;
      next.dueLate = display.dueLate;
    }
  }

  if (next.startDate !== undefined) {
    const display = dateToDisplay(next.startDate);
    if (display) {
      next.start = display.due;
    }
  }

  return next;
}

export function mergeBoardCardPatch(
  card: BoardCard,
  patch: Partial<BoardCard>,
): BoardCard {
  const merged: BoardCard = { ...card, ...patch };

  if ("dueDate" in patch && patch.dueDate === undefined) {
    delete merged.dueDate;
    delete merged.due;
    delete merged.dueEn;
    delete merged.dueLate;
  }

  if ("startDate" in patch && patch.startDate === undefined) {
    delete merged.startDate;
    delete merged.start;
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

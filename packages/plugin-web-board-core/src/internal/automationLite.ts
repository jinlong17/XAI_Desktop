import type { BoardCard, BoardList } from "../types.js";
import {
  compareIsoDateOnly,
  getBoardCardDateMeta,
  isoDateFromOffset,
} from "./dateModel.js";
import { normalizeBoardCardDetail } from "./boardOps.js";

export const BOARD_AUTOMATION_URGENT_LABEL_ID = "urgent";
export const BOARD_AUTOMATION_DUE_SOON_DAYS = 2;

export interface BoardAutomationLiteOptions {
  now?: Date;
  urgentLabelId?: string;
  dueSoonDays?: number;
  sortDueDates?: boolean;
}

export interface BoardAutomationLiteStats {
  completedCards: number;
  urgentLabelsAdded: number;
  sortedLists: number;
}

export interface BoardAutomationLiteResult {
  lists: BoardList[];
  changed: boolean;
  stats: BoardAutomationLiteStats;
}

interface AutomationContext {
  now: Date;
  completedAt: string;
  todayIso: string;
  soonEndIso: string;
  urgentLabelId: string;
  sortDueDates: boolean;
}

function buildContext(options: BoardAutomationLiteOptions): AutomationContext {
  const now = options.now ?? new Date();
  const dueSoonDays = Math.max(0, Math.floor(options.dueSoonDays ?? BOARD_AUTOMATION_DUE_SOON_DAYS));
  return {
    now,
    completedAt: now.toISOString(),
    todayIso: isoDateFromOffset(0, now),
    soonEndIso: isoDateFromOffset(dueSoonDays, now),
    urgentLabelId: options.urgentLabelId ?? BOARD_AUTOMATION_URGENT_LABEL_ID,
    sortDueDates: options.sortDueDates !== false,
  };
}

function isSemanticDoneList(list: BoardList): boolean {
  if (list.archived === true) return false;
  if (list.key === "done") return true;
  const en = list.customName?.en.trim().toLowerCase() ?? "";
  const zh = list.customName?.zh.trim() ?? "";
  return (
    en === "done" ||
    en === "complete" ||
    en === "completed" ||
    zh === "完成" ||
    zh === "已完成"
  );
}

function completeCard(card: BoardCard, ctx: AutomationContext): {
  card: BoardCard;
  changed: boolean;
} {
  if (card.archived === true) {
    return { card, changed: false };
  }

  let changed = false;
  let next: BoardCard = card;

  if (!card.completedAt) {
    next = { ...next, completedAt: ctx.completedAt };
    changed = true;
  }

  if (card.checklistItems?.some((item) => !item.done)) {
    next = {
      ...next,
      checklistItems: card.checklistItems.map((item) =>
        item.done ? item : { ...item, done: true },
      ),
    };
    changed = true;
  }

  const checklistItems = next.checklistItems;
  if (Array.isArray(checklistItems)) {
    next = normalizeBoardCardDetail(next);
  } else if (
    next.checklist &&
    next.checklist.total > 0 &&
    next.checklist.done !== next.checklist.total
  ) {
    next = {
      ...next,
      checklist: { ...next.checklist, done: next.checklist.total },
    };
    changed = true;
  }

  return { card: next, changed };
}

function addUrgentLabelIfDueSoon(card: BoardCard, ctx: AutomationContext): {
  card: BoardCard;
  changed: boolean;
} {
  if (card.archived === true) {
    return { card, changed: false };
  }

  const meta = getBoardCardDateMeta(card, { now: ctx.now });
  if (!meta.dueDate) {
    return { card, changed: false };
  }
  if (compareIsoDateOnly(meta.dueDate, ctx.todayIso) < 0) {
    return { card, changed: false };
  }
  if (compareIsoDateOnly(meta.dueDate, ctx.soonEndIso) > 0) {
    return { card, changed: false };
  }

  const labels = card.labels ?? [];
  if (labels.includes(ctx.urgentLabelId)) {
    return { card, changed: false };
  }
  return {
    card: { ...card, labels: [...labels, ctx.urgentLabelId] },
    changed: true,
  };
}

function dueSortValue(card: BoardCard, ctx: AutomationContext): string | null {
  if (card.archived === true) return null;
  return getBoardCardDateMeta(card, { now: ctx.now }).dueDate ?? null;
}

function sortCardsByDueDate(
  list: BoardList,
  ctx: AutomationContext,
): { cards: BoardCard[]; changed: boolean } {
  if (!ctx.sortDueDates || isSemanticDoneList(list)) {
    return { cards: list.cards, changed: false };
  }

  const indexed = list.cards.map((card, index) => ({
    card,
    index,
    dueDate: dueSortValue(card, ctx),
  }));
  const sortedActive = indexed.filter((entry) => entry.card.archived !== true).sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      const byDue = compareIsoDateOnly(a.dueDate, b.dueDate);
      return byDue === 0 ? a.index - b.index : byDue;
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return a.index - b.index;
  });

  let activeIndex = 0;
  const sorted = indexed.map((entry) =>
    entry.card.archived === true ? entry : sortedActive[activeIndex++]!,
  );
  const changed = sorted.some((entry, index) => entry.index !== index);
  return {
    cards: changed ? sorted.map((entry) => entry.card) : list.cards,
    changed,
  };
}

export function applyBoardAutomationLite(
  lists: readonly BoardList[],
  options: BoardAutomationLiteOptions = {},
): BoardAutomationLiteResult {
  const ctx = buildContext(options);
  const stats: BoardAutomationLiteStats = {
    completedCards: 0,
    urgentLabelsAdded: 0,
    sortedLists: 0,
  };

  let changed = false;
  const nextLists = lists.map((list) => {
    if (list.archived === true) {
      return list;
    }

    const doneList = isSemanticDoneList(list);
    let cardsChanged = false;
    const transformedCards = list.cards.map((card) => {
      if (doneList) {
        const completed = completeCard(card, ctx);
        if (completed.changed) {
          stats.completedCards += 1;
          cardsChanged = true;
        }
        return completed.card;
      }

      const urgent = addUrgentLabelIfDueSoon(card, ctx);
      if (urgent.changed) {
        stats.urgentLabelsAdded += 1;
        cardsChanged = true;
      }
      return urgent.card;
    });

    const afterCardRules = cardsChanged ? transformedCards : list.cards;
    const sorted = sortCardsByDueDate({ ...list, cards: afterCardRules }, ctx);
    if (sorted.changed) {
      stats.sortedLists += 1;
    }
    if (!cardsChanged && !sorted.changed) {
      return list;
    }

    changed = true;
    return { ...list, cards: sorted.cards };
  });

  return {
    lists: changed ? nextLists : lists as BoardList[],
    changed,
    stats,
  };
}

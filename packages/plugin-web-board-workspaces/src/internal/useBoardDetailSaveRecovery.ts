import { useRef, useState } from "react";
import {
  createBoardCardComment,
  createBoardIntegrationAttachment,
  readBoardStorage,
  preserveBoardStorageFormat,
  updateCardInList,
  type BoardCardActivityEntry,
  type BoardCardAttachmentLink,
  type BoardCardData,
  type BoardChecklistItem,
  type BoardIntegrationProviderId,
} from "@repo/plugin-web-board-core";
import { accountScope, type AccountScope } from "@repo/plugin-web-storage";

export interface BoardDetailTarget {
  boardId: string;
  listId: string;
  cardId: string;
}

export type BoardDetailAppendDraft =
  | { kind: "checklist"; text: string }
  | {
      kind: "attachment";
      providerId: BoardIntegrationProviderId;
      url: string;
      title: string;
    }
  | { kind: "activity"; body: string; authorName: string };

interface PendingBoardDetailSave {
  owner: AccountScope;
  physicalKey: string;
  target: BoardDetailTarget;
  baselineRaw: string | null;
  proposalId: string;
  createdAt: string | null;
  draft: BoardDetailAppendDraft;
}

export interface BoardDetailSaveRecoveryState {
  target: BoardDetailTarget;
  proposalId: string;
  createdAt: string | null;
  draft: BoardDetailAppendDraft;
}

type SaveBoards = (next: unknown) => boolean;

function sameTarget(left: BoardDetailTarget, right: BoardDetailTarget): boolean {
  return (
    left.boardId === right.boardId &&
    left.listId === right.listId &&
    left.cardId === right.cardId
  );
}

function proposalPrefix(kind: BoardDetailAppendDraft["kind"]): string {
  if (kind === "checklist") return "chk";
  if (kind === "attachment") return "att";
  return "act";
}

function describeFailure(failure: unknown): string {
  const message = failure instanceof Error ? failure.message : String(failure);
  return message.startsWith("Board detail")
    ? message
    : `Board detail was not saved. ${message}`;
}

function exactJsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildAppend(
  pending: PendingBoardDetailSave,
):
  | { kind: "checklist"; entry: BoardChecklistItem }
  | { kind: "attachment"; entry: BoardCardAttachmentLink }
  | { kind: "activity"; entry: BoardCardActivityEntry } {
  const { draft, proposalId } = pending;
  if (draft.kind === "checklist") {
    const text = draft.text.trim();
    if (!text) throw new Error("Board detail needs checklist text before retrying.");
    return { kind: draft.kind, entry: { id: proposalId, text, done: false } };
  }
  if (draft.kind === "attachment") {
    const result = createBoardIntegrationAttachment({
      id: proposalId,
      providerId: draft.providerId,
      url: draft.url,
      title: draft.title,
    });
    if (result.status !== "valid") {
      throw new Error("Board detail attachment is invalid. Check the provider and URL.");
    }
    return { kind: draft.kind, entry: result.attachment };
  }
  const result = createBoardCardComment({
    id: proposalId,
    body: draft.body,
    createdAt: pending.createdAt ?? "",
    authorId: "local-user",
    authorName: draft.authorName,
  });
  if (result.status !== "valid") {
    throw new Error("Board detail needs comment text before retrying.");
  }
  return { kind: draft.kind, entry: result.entry };
}

function entryForProposal(
  card: {
    checklistItems?: BoardChecklistItem[];
    attachments?: BoardCardAttachmentLink[];
    activity?: BoardCardActivityEntry[];
  },
  kind: BoardDetailAppendDraft["kind"],
  proposalId: string,
): BoardChecklistItem | BoardCardAttachmentLink | BoardCardActivityEntry | undefined {
  if (kind === "checklist") {
    return card.checklistItems?.find((entry) => entry.id === proposalId);
  }
  if (kind === "attachment") {
    return card.attachments?.find((entry) => entry.id === proposalId);
  }
  return card.activity?.find((entry) => entry.id === proposalId);
}

function checklistItemsFor(card: BoardCardData): BoardChecklistItem[] {
  if (card.checklistItems !== undefined) return card.checklistItems;
  if (!card.checklist || card.checklist.total <= 0) return [];
  return Array.from({ length: card.checklist.total }, (_, index) => ({
    id: `legacy-${card.id}-${index + 1}`,
    text: `Item ${index + 1}`,
    done: index < card.checklist!.done,
  }));
}

/**
 * Owns one unresolved detail append across modal close, target disappearance,
 * and account changes. A retry only writes when the exact original physical
 * bytes and target still exist; the stable proposal identity prevents doubles.
 */
export function useBoardDetailSaveRecovery(saveBoards: SaveBoards) {
  const pendingRef = useRef<PendingBoardDetailSave | null>(null);
  const [pendingState, setPendingState] = useState<PendingBoardDetailSave | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publishPending = (pending: PendingBoardDetailSave | null) => {
    pendingRef.current = pending;
    setPendingState(pending);
  };

  const commit = (pending: PendingBoardDetailSave): boolean => {
    try {
      accountScope.assertCurrent(pending.owner);
      if (
        accountScope.physicalKey("xai_boards_v2", pending.owner) !==
        pending.physicalKey
      ) {
        throw new Error("Board detail account ownership changed. Export or discard the draft.");
      }
      const raw = localStorage.getItem(pending.physicalKey);
      if (raw === null) {
        throw new Error("Board detail storage is missing. Export or discard the draft.");
      }
      let stored: unknown;
      try {
        stored = JSON.parse(raw);
      } catch {
        throw new Error("Board detail storage is malformed. Export or discard the draft.");
      }
      const read = readBoardStorage(stored);
      if (read.status !== "valid") {
        throw new Error("Board detail storage is invalid. Export or discard the draft.");
      }
      const board = read.boards.find((entry) => entry.id === pending.target.boardId);
      const list = board?.lists.find((entry) => entry.id === pending.target.listId);
      const card = list?.cards.find((entry) => entry.id === pending.target.cardId);
      if (!board || !list || list.archived === true || !card || card.archived === true) {
        throw new Error("Board detail target is no longer available. Export or discard the draft.");
      }

      const append = buildAppend(pending);
      const existing = entryForProposal(card, append.kind, pending.proposalId);
      if (existing !== undefined) {
        if (!exactJsonEqual(existing, append.entry)) {
          throw new Error("Board detail proposal conflicts with saved data. Export or discard the draft.");
        }
        publishPending(null);
        setError(null);
        return true;
      }
      if (raw !== pending.baselineRaw) {
        throw new Error("Board detail storage changed. Export the draft and reopen the card.");
      }

      const patch =
        append.kind === "checklist"
          ? { checklistItems: [...checklistItemsFor(card), append.entry] }
          : append.kind === "attachment"
            ? { attachments: [...(card.attachments ?? []), append.entry] }
            : { activity: [append.entry, ...(card.activity ?? [])] };
      const nextLists = updateCardInList(
        board.lists,
        pending.target.listId,
        pending.target.cardId,
        patch,
      );
      const nextBoards = read.boards.map((entry) =>
        entry.id === pending.target.boardId ? { ...entry, lists: nextLists } : entry,
      );
      const nextStorage = preserveBoardStorageFormat(stored, nextBoards);
      if (!saveBoards(nextStorage)) {
        throw new Error("Board detail changes were rejected. Retry or export the draft.");
      }
      const committedRaw = localStorage.getItem(pending.physicalKey);
      if (committedRaw !== JSON.stringify(nextStorage)) {
        throw new Error("Board detail commit could not be verified. Retry or export the draft.");
      }
      publishPending(null);
      setError(null);
      return true;
    } catch (failure) {
      publishPending(pending);
      setError(describeFailure(failure));
      return false;
    }
  };

  const submit = (target: BoardDetailTarget, draft: BoardDetailAppendDraft): boolean => {
    let pending = pendingRef.current;
    try {
      if (pending) {
        if (!sameTarget(pending.target, target) || pending.draft.kind !== draft.kind) {
          throw new Error("Board detail has another unsaved draft. Retry, export, or discard it first.");
        }
        pending = { ...pending, draft };
      } else {
        const owner = accountScope.capture();
        accountScope.assertCurrent(owner);
        const physicalKey = accountScope.physicalKey("xai_boards_v2", owner);
        pending = {
          owner,
          physicalKey,
          target: { ...target },
          baselineRaw: localStorage.getItem(physicalKey),
          proposalId: `${proposalPrefix(draft.kind)}-${crypto.randomUUID()}`,
          createdAt: draft.kind === "activity" ? new Date().toISOString() : null,
          draft,
        };
      }
      publishPending(pending);
      return commit(pending);
    } catch (failure) {
      if (pending) publishPending(pending);
      setError(describeFailure(failure));
      return false;
    }
  };

  const updateDraft = (target: BoardDetailTarget, draft: BoardDetailAppendDraft) => {
    const pending = pendingRef.current;
    if (!pending || !sameTarget(pending.target, target) || pending.draft.kind !== draft.kind) {
      return;
    }
    publishPending({ ...pending, draft });
  };

  const retry = (): boolean => {
    const pending = pendingRef.current;
    if (!pending) return false;
    return commit(pending);
  };

  const discard = () => {
    publishPending(null);
    setError(null);
  };

  const snapshot = () => {
    const pending = pendingRef.current;
    if (!pending) throw new Error("No Board detail draft is available to export.");
    accountScope.assertCurrent(pending.owner);
    if (
      accountScope.physicalKey("xai_boards_v2", pending.owner) !== pending.physicalKey
    ) {
      throw new Error("Board detail account ownership changed.");
    }
    return {
      version: 1,
      kind: "board-detail-append-recovery",
      operation: pending.draft.kind,
      owner: {
        kind: pending.owner.kind,
        accountId: pending.owner.accountId,
        generation: pending.owner.generation,
        epoch: pending.owner.epoch,
      },
      target: pending.target,
      proposal: {
        id: pending.proposalId,
        createdAt: pending.createdAt,
      },
      draft: pending.draft,
      originalStorageRaw: pending.baselineRaw,
      currentStorageRaw: localStorage.getItem(pending.physicalKey),
    };
  };

  const pending: BoardDetailSaveRecoveryState | null = pendingState
    ? {
        target: pendingState.target,
        proposalId: pendingState.proposalId,
        createdAt: pendingState.createdAt,
        draft: pendingState.draft,
      }
    : null;

  return { pending, error, submit, updateDraft, retry, discard, snapshot };
}

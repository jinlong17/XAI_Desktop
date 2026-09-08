import type {
  BoardCardActivityEntry,
  BoardCardActivityKind,
} from "../types.js";

export interface BoardCardActivityInput {
  id: string;
  body: string;
  createdAt: string;
  authorId?: string;
  authorName?: string;
}

export type BoardCardActivityResult =
  | {
      status: "valid";
      entry: BoardCardActivityEntry;
    }
  | {
      status: "invalid";
      reason: "missing-id" | "empty-body" | "missing-created-at";
    };

function createBoardCardActivityEntry(
  kind: BoardCardActivityKind,
  input: BoardCardActivityInput,
): BoardCardActivityResult {
  const id = input.id.trim();
  if (!id) {
    return { status: "invalid", reason: "missing-id" };
  }

  const body = input.body.trim();
  if (!body) {
    return { status: "invalid", reason: "empty-body" };
  }

  const createdAt = input.createdAt.trim();
  if (!createdAt) {
    return { status: "invalid", reason: "missing-created-at" };
  }

  const authorId = input.authorId?.trim();
  const authorName = input.authorName?.trim();

  return {
    status: "valid",
    entry: {
      id,
      kind,
      body,
      createdAt,
      ...(authorId ? { authorId } : {}),
      ...(authorName ? { authorName } : {}),
    },
  };
}

export function createBoardCardComment(
  input: BoardCardActivityInput,
): BoardCardActivityResult {
  return createBoardCardActivityEntry("comment", input);
}

export function createBoardCardActivityNote(
  input: BoardCardActivityInput,
): BoardCardActivityResult {
  return createBoardCardActivityEntry("note", input);
}

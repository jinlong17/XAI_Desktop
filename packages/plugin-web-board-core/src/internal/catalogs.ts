/**
 * Board catalogs — the id → {name, color} directories that card chips and the
 * detail-modal editors resolve against.
 *
 * Why this module exists: seed cards reference label ids (`l1`..`l5`) and member
 * ids (`u1`..`u3`) that had no catalog entry on the card-render path, so chips
 * rendered the raw id (`l1`, `u2`) with no name or color. These defaults give
 * every seed id a real bilingual name + color, and `resolveBoardLabels` /
 * `resolveBoardMembers` let a board carry its own edited catalog (falling back
 * to these defaults for legacy boards that predate `Board.labels`/`.members`).
 */

import { PM_LABELS, BOARD_MEMBER_OPTIONS } from "./seed/board-data.js";
import type {
  Board,
  BoardCardPriority,
  BoardLabel,
  BoardList,
  BoardMemberOption,
} from "../types.js";

/**
 * Kanban-template label catalog. Covers the `l1`..`l5` ids used by the kanban
 * seed (which previously had no definition anywhere). Unknown legacy ids not
 * listed here (e.g. an old `urgent` seed id) render as raw-id fallback chips.
 */
export const KANBAN_LABELS: readonly BoardLabel[] = [
  { id: "l1", name: { en: "Design", zh: "设计" }, color: "oklch(62% 0.16 295)" },
  { id: "l2", name: { en: "Engineering", zh: "研发" }, color: "oklch(60% 0.13 245)" },
  // "Discovery" (not "Research") — avoids a duplicate display name with
  // PM_LABELS' pm-research in the unioned default picker.
  { id: "l3", name: { en: "Discovery", zh: "探索" }, color: "oklch(62% 0.12 195)" },
  { id: "l4", name: { en: "Marketing", zh: "市场" }, color: "oklch(68% 0.16 60)" },
  { id: "l5", name: { en: "Urgent", zh: "紧急" }, color: "oklch(60% 0.18 25)" },
] as const;

/** Curated palette offered by the label editor when creating/recoloring labels. */
export const BOARD_LABEL_PALETTE: readonly string[] = [
  "oklch(62% 0.16 295)",
  "oklch(60% 0.13 245)",
  "oklch(62% 0.12 195)",
  "oklch(60% 0.14 155)",
  "oklch(70% 0.15 130)",
  "oklch(72% 0.16 90)",
  "oklch(68% 0.16 60)",
  "oklch(64% 0.17 35)",
  "oklch(60% 0.18 25)",
  "oklch(60% 0.16 350)",
] as const;

/**
 * Cover presets offered by the board settings editor. The first three match
 * the built-in template covers so a fresh board's cover is always re-pickable.
 */
export const BOARD_COVER_PRESETS: readonly string[] = [
  "linear-gradient(135deg, oklch(72% 0.12 295), oklch(78% 0.10 25))",
  "linear-gradient(135deg, oklch(58% 0.14 245), oklch(38% 0.10 250))",
  "linear-gradient(135deg, oklch(70% 0.15 60), oklch(62% 0.16 35))",
  "linear-gradient(135deg, oklch(72% 0.10 165), oklch(60% 0.10 165))",
  "linear-gradient(135deg, oklch(78% 0.10 295), oklch(62% 0.12 245))",
  "linear-gradient(135deg, oklch(80% 0.08 165), oklch(60% 0.12 195))",
  "linear-gradient(135deg, oklch(75% 0.12 85), oklch(64% 0.15 35))",
  "linear-gradient(135deg, oklch(85% 0.02 220), oklch(70% 0.02 220))",
] as const;

/** Avatar palette cycled through when creating a new member. */
export const BOARD_MEMBER_PALETTE: readonly string[] = [
  "oklch(62% 0.14 155)",
  "oklch(62% 0.14 245)",
  "oklch(62% 0.14 25)",
  "oklch(62% 0.14 300)",
  "oklch(64% 0.15 90)",
  "oklch(60% 0.15 195)",
] as const;

/**
 * Default label catalog used by any board that has not materialized its own.
 * Union of the kanban (`l1`..`l5`) and PM (`pm-*`) seed label namespaces so
 * every first-run card resolves.
 */
export const DEFAULT_BOARD_LABELS: readonly BoardLabel[] = dedupeById([
  ...KANBAN_LABELS,
  ...PM_LABELS,
]);

/**
 * Default member directory (Alice/Bob/Carol). Users add their own teammates
 * via the member manager; we deliberately do not invent a synthetic "You"
 * entry (it would collide with the comment-author label).
 */
export const DEFAULT_BOARD_MEMBERS: readonly BoardMemberOption[] = [
  ...BOARD_MEMBER_OPTIONS,
];

export interface BoardPriorityMeta {
  id: BoardCardPriority;
  name: { en: string; zh: string };
  color: string;
  /** Higher = more urgent. Useful for sorting. */
  rank: number;
}

/** Priority metadata, ordered urgent → low. */
export const BOARD_PRIORITIES: readonly BoardPriorityMeta[] = [
  { id: "urgent", name: { en: "Urgent", zh: "紧急" }, color: "oklch(58% 0.19 25)", rank: 4 },
  { id: "high", name: { en: "High", zh: "高" }, color: "oklch(66% 0.17 60)", rank: 3 },
  { id: "medium", name: { en: "Medium", zh: "中" }, color: "oklch(70% 0.13 250)", rank: 2 },
  { id: "low", name: { en: "Low", zh: "低" }, color: "oklch(64% 0.04 250)", rank: 1 },
] as const;

const PRIORITY_BY_ID: Record<BoardCardPriority, BoardPriorityMeta> = Object.fromEntries(
  BOARD_PRIORITIES.map((p) => [p.id, p]),
) as Record<BoardCardPriority, BoardPriorityMeta>;

export function getPriorityMeta(id: BoardCardPriority): BoardPriorityMeta {
  return PRIORITY_BY_ID[id];
}

/**
 * Effective label catalog for a board. `undefined` means the board predates
 * per-board catalogs → shared defaults. An explicit `[]` means the user
 * deleted every label and is respected (defaults must NOT resurrect).
 */
export function resolveBoardLabels(board: Pick<Board, "labels">): readonly BoardLabel[] {
  return board.labels ?? DEFAULT_BOARD_LABELS;
}

/** Effective member directory for a board. Same `undefined` vs `[]` semantics as labels. */
export function resolveBoardMembers(
  board: Pick<Board, "members">,
): readonly BoardMemberOption[] {
  return board.members ?? DEFAULT_BOARD_MEMBERS;
}

/** Build an id → entry lookup for O(1) chip resolution. */
export function indexBoardLabels(
  labels: readonly BoardLabel[],
): Map<string, BoardLabel> {
  return new Map(labels.map((l) => [l.id, l]));
}

export function indexBoardMembers(
  members: readonly BoardMemberOption[],
): Map<string, BoardMemberOption> {
  return new Map(members.map((m) => [m.id, m]));
}

/** 1–2 char avatar initials from a member display name. */
export function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

/**
 * Remove a label id from every card on a board (used when a label is deleted so
 * no card keeps a dangling reference).
 */
export function stripLabelFromBoardLists(
  lists: BoardList[],
  labelId: string,
): BoardList[] {
  return lists.map((list) => ({
    ...list,
    cards: list.cards.map((card) =>
      card.labels?.includes(labelId)
        ? { ...card, labels: card.labels.filter((id) => id !== labelId) }
        : card,
    ),
  }));
}

/** Remove a member id from every card on a board (used on member deletion). */
export function stripMemberFromBoardLists(
  lists: BoardList[],
  memberId: string,
): BoardList[] {
  return lists.map((list) => ({
    ...list,
    cards: list.cards.map((card) =>
      card.members?.includes(memberId)
        ? { ...card, members: card.members.filter((id) => id !== memberId) }
        : card,
    ),
  }));
}

function dedupeById(labels: BoardLabel[]): BoardLabel[] {
  const seen = new Set<string>();
  const out: BoardLabel[] = [];
  for (const label of labels) {
    if (seen.has(label.id)) continue;
    seen.add(label.id);
    out.push(label);
  }
  return out;
}

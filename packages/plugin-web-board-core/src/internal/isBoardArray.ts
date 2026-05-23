/**
 * Runtime guard predicates — narrow `unknown` reads from
 * `@repo/plugin-web-storage`'s `xai_boards_v2` (registry type `BoardsState =
 * unknown`) into typed `Board[]` at the component boundary.
 *
 * Rejection is conservative: any field shape drift falls back to
 * `makeDefaultBoards()` via `loadBoardsOrDefault`. This matches
 * `web design/module-board.jsx` line 36 behavior.
 */

import type {
  BilingualText,
  Board,
  BoardCard,
  BoardList,
  BoardListColorId,
  BoardTemplate,
  CardChecklist,
} from "../types.js";
import { LIST_COLOR_IDS } from "./listColors.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBilingualText(value: unknown): value is BilingualText {
  if (!isObject(value)) return false;
  return isString(value.en) && isString(value.zh);
}

function isCardChecklist(value: unknown): value is CardChecklist {
  if (!isObject(value)) return false;
  return typeof value.done === "number" && typeof value.total === "number";
}

function isBoardListColorId(value: unknown): value is BoardListColorId {
  if (!isString(value)) return false;
  return (LIST_COLOR_IDS as readonly string[]).includes(value);
}

const BOARD_TEMPLATES_LITERAL: readonly BoardTemplate[] = ["kanban", "pm", "blank"];

function isBoardTemplate(value: unknown): value is BoardTemplate {
  if (!isString(value)) return false;
  return (BOARD_TEMPLATES_LITERAL as readonly string[]).includes(value);
}

export function isBoardCard(value: unknown): value is BoardCard {
  if (!isObject(value)) return false;
  if (!isString(value.id)) return false;
  if (!isBilingualText(value.title)) return false;
  if (value.labels !== undefined && !Array.isArray(value.labels)) return false;
  if (
    Array.isArray(value.labels) &&
    !value.labels.every((entry) => isString(entry))
  ) {
    return false;
  }
  if (value.members !== undefined && !Array.isArray(value.members)) return false;
  if (
    Array.isArray(value.members) &&
    !value.members.every((entry) => isString(entry))
  ) {
    return false;
  }
  if (value.checklist !== undefined && !isCardChecklist(value.checklist)) {
    return false;
  }
  if (value.due !== undefined && !isString(value.due)) return false;
  if (value.dueEn !== undefined && !isString(value.dueEn)) return false;
  if (value.start !== undefined && !isString(value.start)) return false;
  if (value.dueLate !== undefined && typeof value.dueLate !== "boolean") {
    return false;
  }
  if (
    value.attach !== undefined &&
    !(isString(value.attach) || typeof value.attach === "number")
  ) {
    return false;
  }
  if (value.cover !== undefined && !isString(value.cover)) return false;
  return true;
}

export function isBoardList(value: unknown): value is BoardList {
  if (!isObject(value)) return false;
  if (!isString(value.id)) return false;
  if (value.key !== null && !isString(value.key)) return false;
  if (value.customName !== undefined && !isBilingualText(value.customName)) {
    return false;
  }
  if (
    value.color !== undefined &&
    value.color !== null &&
    !isBoardListColorId(value.color)
  ) {
    return false;
  }
  if (!Array.isArray(value.cards)) return false;
  return value.cards.every(isBoardCard);
}

export function isBoard(value: unknown): value is Board {
  if (!isObject(value)) return false;
  if (!isString(value.id)) return false;
  if (!isString(value.workspaceId)) return false;
  if (!isBilingualText(value.name)) return false;
  if (!isString(value.cover)) return false;
  if (!isBoardTemplate(value.template)) return false;
  if (!Array.isArray(value.lists)) return false;
  return value.lists.every(isBoardList);
}

export function isBoardArray(value: unknown): value is Board[] {
  if (!Array.isArray(value)) return false;
  return value.every(isBoard);
}

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
  BoardAttachmentIntegrationSource,
  BoardCardActivityEntry,
  BoardCardAttachmentLink,
  BoardCardTaskLink,
  BoardChecklistItem,
  CardChecklist,
  CardLocation,
} from "../types.js";
import { isIsoDateOnly } from "./dateModel.js";
import { isBoardIntegrationProviderId } from "./integrationAdapters.js";
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

function isBoardChecklistItem(value: unknown): value is BoardChecklistItem {
  if (!isObject(value)) return false;
  return (
    isString(value.id) &&
    isString(value.text) &&
    typeof value.done === "boolean"
  );
}

function isBoardCardAttachmentLink(value: unknown): value is BoardCardAttachmentLink {
  if (!isObject(value)) return false;
  if (!isString(value.id)) return false;
  if (!isString(value.url)) return false;
  if (value.title !== undefined && !isString(value.title)) return false;
  if (
    value.source !== undefined &&
    !isBoardAttachmentIntegrationSource(value.source)
  ) {
    return false;
  }
  return true;
}

function isBoardAttachmentIntegrationSource(
  value: unknown,
): value is BoardAttachmentIntegrationSource {
  if (!isObject(value)) return false;
  if (value.kind !== "integration") return false;
  if (!isBoardIntegrationProviderId(value.providerId)) return false;
  if (!isString(value.providerName) || value.providerName.length === 0) {
    return false;
  }
  if (value.externalId !== undefined && !isString(value.externalId)) {
    return false;
  }
  return true;
}

function isBoardCardActivityEntry(value: unknown): value is BoardCardActivityEntry {
  if (!isObject(value)) return false;
  if (!isString(value.id)) return false;
  if (value.kind !== "note" && value.kind !== "comment") return false;
  if (!isString(value.body)) return false;
  if (!isString(value.createdAt)) return false;
  if (value.authorId !== undefined && !isString(value.authorId)) return false;
  if (value.authorName !== undefined && !isString(value.authorName)) return false;
  return true;
}

function isBoardCardTaskLink(value: unknown): value is BoardCardTaskLink {
  if (!isObject(value)) return false;
  if (value.source !== "xai-web-tasks") return false;
  if (!isString(value.taskId) || value.taskId.length === 0) return false;
  if (!isString(value.createdAt) || value.createdAt.length === 0) return false;
  return true;
}

function isCardLocation(value: unknown): value is CardLocation {
  if (!isObject(value)) return false;
  if (typeof value.lat !== "number" || !isFinite(value.lat)) return false;
  if (typeof value.lng !== "number" || !isFinite(value.lng)) return false;
  if (Math.abs(value.lat) > 90) return false;
  if (Math.abs(value.lng) > 180) return false;
  if (value.label !== undefined && !isString(value.label)) return false;
  return true;
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
  if (value.archived !== undefined && typeof value.archived !== "boolean") {
    return false;
  }
  if (value.completedAt !== undefined && !isString(value.completedAt)) {
    return false;
  }
  if (value.description !== undefined && !isString(value.description)) return false;
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
  if (value.checklistItems !== undefined && !Array.isArray(value.checklistItems)) {
    return false;
  }
  if (
    Array.isArray(value.checklistItems) &&
    !value.checklistItems.every(isBoardChecklistItem)
  ) {
    return false;
  }
  if (value.attachments !== undefined && !Array.isArray(value.attachments)) {
    return false;
  }
  if (
    Array.isArray(value.attachments) &&
    !value.attachments.every(isBoardCardAttachmentLink)
  ) {
    return false;
  }
  if (value.activity !== undefined && !Array.isArray(value.activity)) {
    return false;
  }
  if (
    Array.isArray(value.activity) &&
    !value.activity.every(isBoardCardActivityEntry)
  ) {
    return false;
  }
  if (value.taskLink !== undefined && !isBoardCardTaskLink(value.taskLink)) {
    return false;
  }
  if (value.due !== undefined && !isString(value.due)) return false;
  if (value.dueEn !== undefined && !isString(value.dueEn)) return false;
  if (value.start !== undefined && !isString(value.start)) return false;
  if (value.startDate !== undefined && !isIsoDateOnly(value.startDate)) return false;
  if (value.dueDate !== undefined && !isIsoDateOnly(value.dueDate)) return false;
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
  if (value.location !== undefined && !isCardLocation(value.location)) return false;
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
  if (value.archived !== undefined && typeof value.archived !== "boolean") {
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

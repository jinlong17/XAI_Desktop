import type { DroppedFile, Rect } from "@repo/core/types";
import type { DesktopItem, GridBox } from "./types";

export const ORGANIZER_GRID_READY_EVENT = "organizer:grid:ready";
export const ORGANIZER_GRID_STATE_EVENT = "organizer:grid:state";
export const ORGANIZER_GRID_UPDATE_EVENT = "organizer:grid:update";
export const ORGANIZER_GRID_CLOSE_EVENT = "organizer:grid:close";
export const ORGANIZER_GRID_DELETE_EVENT = "organizer:grid:delete";
export const ORGANIZER_GRID_CREATE_REQUEST_EVENT = "organizer:grid:create-request";
export const ORGANIZER_FILE_DROP_EVENT = "organizer:file:drop";

export const LEGACY_ORGANIZER_CREATE_GRID_REQUEST_EVENT = "organizer:create-grid-request";
export const LEGACY_CREATE_GRID_REQUEST_EVENT = "create-grid-request";

export interface OrganizerGridReadyPayload {
  gridId: string;
}

export interface OrganizerGridStatePayload {
  gridId: string;
  grid: GridBox;
  items: Record<string, DesktopItem>;
}

export interface OrganizerGridUpdatePayload {
  gridId: string;
  changes: Partial<GridBox>;
}

export interface OrganizerGridClosePayload {
  gridId: string;
}

export interface OrganizerGridDeletePayload {
  gridId: string;
}

export interface OrganizerGridCreateRequestPayload {
  gridId?: string;
  rect: Rect;
  source?: "control" | "shortcut";
}

export interface OrganizerFileDropPayload {
  gridId: string;
  files: DroppedFile[];
}

export function hasGridId(payload: unknown): payload is { gridId: string } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { gridId?: unknown }).gridId === "string" &&
    (payload as { gridId: string }).gridId.length > 0
  );
}

function isRecord(payload: unknown): payload is Record<string, unknown> {
  return typeof payload === "object" && payload !== null;
}

function isRect(payload: unknown): payload is Rect {
  if (!isRecord(payload)) return false;
  return (
    typeof payload.x === "number" &&
    typeof payload.y === "number" &&
    typeof payload.width === "number" &&
    typeof payload.height === "number"
  );
}

function isDroppedFile(payload: unknown): payload is DroppedFile {
  if (!isRecord(payload)) return false;
  const kind = payload.kind;
  return (
    typeof payload.path === "string" &&
    payload.path.length > 0 &&
    typeof payload.name === "string" &&
    payload.name.length > 0 &&
    (kind === "file" || kind === "folder" || kind === "app" || kind === "alias" || kind === "unknown")
  );
}

export function isGridReadyPayload(payload: unknown): payload is OrganizerGridReadyPayload {
  return hasGridId(payload);
}

export function isGridStatePayload(payload: unknown): payload is OrganizerGridStatePayload {
  if (!hasGridId(payload) || !isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  return isRecord(record.grid) && isRecord(record.items);
}

export function isGridUpdatePayload(payload: unknown): payload is OrganizerGridUpdatePayload {
  if (!hasGridId(payload) || !isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  return isRecord(record.changes);
}

export function isGridClosePayload(payload: unknown): payload is OrganizerGridClosePayload {
  return hasGridId(payload);
}

export function isGridDeletePayload(payload: unknown): payload is OrganizerGridDeletePayload {
  return hasGridId(payload);
}

export function isGridCreateRequestPayload(
  payload: unknown,
): payload is OrganizerGridCreateRequestPayload {
  return isRecord(payload) && isRect(payload.rect);
}

export function isFileDropPayload(payload: unknown): payload is OrganizerFileDropPayload {
  if (!hasGridId(payload) || !isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  return Array.isArray(record.files) && record.files.every(isDroppedFile);
}

export function toDroppedFile(path: string): DroppedFile {
  const normalizedPath = path.trim().replace(/\/+$/, "");
  const name = normalizedPath.split("/").filter(Boolean).at(-1) ?? normalizedPath;
  const lower = normalizedPath.toLowerCase();
  const kind =
    lower.endsWith(".app") ? "app" :
    lower.endsWith(".alias") ? "alias" :
    name.includes(".") ? "file" :
    "folder";

  return {
    path: normalizedPath,
    name,
    kind,
    securityScope: "none",
  };
}

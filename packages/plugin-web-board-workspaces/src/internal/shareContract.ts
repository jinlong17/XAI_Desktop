/**
 * @internal — Explicit mock share envelope.
 *
 * This is not a backend access grant. It exists so the current Share UI is
 * honest and future token-backed sharing has a small contract to replace.
 */

import { generateShareUrl } from "./shareUrl.js";
import type { BoardVisibility } from "@repo/plugin-web-board-core";

export interface BoardShareEnvelope {
  schemaVersion: 1;
  mode: "mock";
  boardId: string;
  url: string;
  visibility: BoardVisibility;
  permission: "view";
  expiresAt: null;
  backend: "unimplemented";
}

export async function createMockBoardShareEnvelope(
  boardId: string,
  visibility: BoardVisibility = "private",
): Promise<BoardShareEnvelope> {
  const url = await generateShareUrl(boardId);
  return {
    schemaVersion: 1,
    mode: "mock",
    boardId,
    url,
    visibility,
    permission: "view",
    expiresAt: null,
    backend: "unimplemented",
  };
}

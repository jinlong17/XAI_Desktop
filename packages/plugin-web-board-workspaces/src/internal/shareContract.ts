/**
 * @internal — Explicit mock share envelope.
 *
 * This is not a backend access grant. It exists so the current Share UI is
 * honest and future token-backed sharing has a small contract to replace.
 */

import { generateShareUrl } from "./shareUrl.js";

export interface BoardShareEnvelope {
  schemaVersion: 1;
  mode: "mock";
  boardId: string;
  url: string;
  permission: "view";
  expiresAt: null;
  backend: "unimplemented";
}

export async function createMockBoardShareEnvelope(
  boardId: string,
): Promise<BoardShareEnvelope> {
  const url = await generateShareUrl(boardId);
  return {
    schemaVersion: 1,
    mode: "mock",
    boardId,
    url,
    permission: "view",
    expiresAt: null,
    backend: "unimplemented",
  };
}

/**
 * @internal — Share URL generator.
 *
 * Gap-closure row #6: Board Share feature (P4).
 * Deterministic; non-exploitable (SHA-256 hash of board id, no timestamp).
 * API contract: packages/xai-web-board-workspaces/docs/api.md §S15.3
 *
 * HC2: Share mock URL. No real backend call.
 */

const SHARE_BASE = "https://xai-web.example/share/";

/**
 * Generate a deterministic share URL for a board.
 *
 * Algorithm:
 * 1. Encode boardId as UTF-8 bytes
 * 2. SHA-256 digest via SubtleCrypto
 * 3. Take first 4 bytes → 8 hex chars
 * 4. Compose `https://xai-web.example/share/<8hex>`
 *
 * Fallback when SubtleCrypto unavailable: `boardId.slice(0,8)` (deterministic but reversible).
 */
export async function generateShareUrl(boardId: string): Promise<string> {
  // Fallback path: crypto.subtle unavailable
  if (
    typeof globalThis.crypto === "undefined" ||
    !globalThis.crypto.subtle
  ) {
    console.warn("[shareUrl] SubtleCrypto unavailable; using boardId slice fallback");
    return SHARE_BASE + boardId.slice(0, 8);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(boardId);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  // Take first 4 bytes → 8 hex chars
  const hex8 = Array.from(hashArray.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return SHARE_BASE + hex8;
}

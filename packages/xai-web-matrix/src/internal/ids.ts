/**
 * @internal — Matrix card ID generator.
 *
 * Uses crypto.randomUUID() when available (modern browsers + Node 19+).
 * Falls back to a non-cryptographic pseudo-random string for jsdom or
 * very old runtimes (still unique enough at v1 scale).
 *
 * The generated id namespace is structurally disjoint from seed ids
 * (seed-1..seed-8): UUID format or "m-<base36ts>-<rnd>" both differ
 * structurally from the "seed-<digit>" seed pattern.
 *
 * Mirrors packages/xai-web-tasks/src/internal/ids.ts
 * (pattern only — no inter-plugin import per ADR-0007 §S7).
 *
 * Design:  packages/xai-web-matrix/docs/design.md §E.1 #10
 * API:     packages/xai-web-matrix/docs/api.md §E (extension)
 */

/**
 * Returns a fresh, opaque matrix card ID.
 *
 * - Modern path: `crypto.randomUUID()` (RFC 4122 v4 UUID).
 * - Fallback: `"m-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,10)`
 */
export function createMatrixId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // Fallback: timestamp-base36 + random suffix; sufficient at v1 scale.
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `m-${ts}-${rnd}`;
}

/**
 * @internal — Task ID generator.
 *
 * Uses crypto.randomUUID() when available (modern browsers + Node 19+).
 * Falls back to a non-cryptographic pseudo-random string for jsdom or
 * very old runtimes (still unique enough at v1 scale).
 *
 * The generated id namespace is structurally disjoint from seed ids
 * (t1..t26, c1..c6): UUID format or "t-<base36ts>-<rnd>" both differ
 * structurally from the short "<letter><digit>" seed pattern.
 *
 * Mirrors packages/xai-web-calendar/src/internal/eventStore/ids.ts
 * (pattern only — no inter-plugin import per ADR-0007 §S7).
 *
 * Design:  packages/xai-web-tasks/docs/design.md §E.1 #11
 * API:     packages/xai-web-tasks/docs/api.md §E.2
 */

/**
 * Returns a fresh, opaque task ID.
 *
 * - Modern path: `crypto.randomUUID()` (RFC 4122 v4 UUID).
 * - Fallback: `"t-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,10)`
 */
export function createTaskId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // Fallback: timestamp-base36 + random suffix; sufficient at v1 scale.
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `t-${ts}-${rnd}`;
}

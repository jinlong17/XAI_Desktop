/**
 * @internal — Event ID generator.
 *
 * Uses crypto.randomUUID() when available (modern browsers + Node 19+).
 * Falls back to a non-cryptographic pseudo-random string for jsdom or
 * very old runtimes (still unique enough at v1 scale).
 *
 * Design: docs/design.md §16.7
 * API:    docs/api.md §11.3
 */

/**
 * Returns a fresh, opaque event ID.
 *
 * - Modern path: `crypto.randomUUID()` (RFC 4122 v4 UUID).
 * - Fallback: `"evt-" + Date.now().toString(36) + "-" + Math.random()`
 *   — keeps tests deterministic across `vi.useFakeTimers()` if needed.
 *
 * The function is pure relative to its return value (different calls
 * return different IDs by construction).
 */
export function createEventId(): string {
  // Prefer the crypto API when present
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  // Fallback: timestamp-base36 + random suffix; sufficient at v1 scale.
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).slice(2, 10);
  return `evt-${ts}-${rnd}`;
}

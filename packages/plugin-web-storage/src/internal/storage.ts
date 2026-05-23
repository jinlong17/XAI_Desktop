/**
 * @internal — storage.ts
 * Imperative getPref / setPref / removePref + same-tab pub/sub bus.
 *
 * Design notes:
 * - All functions are SSR-safe: they check `typeof window === "undefined"`.
 * - setPref compares-before-write to avoid spurious storage events (AC-IMP-11).
 * - Same-tab pub/sub: the browser `storage` event DOES NOT fire in the
 *   originating tab. We use an in-process subscriber bus so that React hooks
 *   in the same tab observe writes from sibling hooks (AC-HOOK-10).
 */

import { PREF_REGISTRY, type WebPrefKey, type WebPrefValue } from "./registry.js";
import { encode, decode } from "./codec.js";

// ---------------------------------------------------------------------------
// Same-tab pub/sub bus
// ---------------------------------------------------------------------------

type Listener<T = unknown> = (value: T) => void;

// Map from storage key to Set of listeners
const _listeners = new Map<string, Set<Listener>>();

/**
 * Subscribe to same-tab writes for a single key.
 * Returns an unsubscribe function.
 */
export function subscribeSameTab(
  key: string,
  listener: Listener,
): () => void {
  let set = _listeners.get(key);
  if (!set) {
    set = new Set();
    _listeners.set(key, set);
  }
  set.add(listener);
  return () => {
    const s = _listeners.get(key);
    if (s) {
      s.delete(listener);
      if (s.size === 0) _listeners.delete(key);
    }
  };
}

/**
 * Publish to same-tab subscribers for a key.
 * Called by setPref after writing to localStorage.
 */
export function publishSameTab(key: string, value: unknown): void {
  const set = _listeners.get(key);
  if (!set) return;
  for (const listener of set) {
    listener(value);
  }
}

/**
 * @internal — exposed for test cleanup; not part of the public surface.
 */
export function _clearAllListeners(): void {
  _listeners.clear();
}

// ---------------------------------------------------------------------------
// One-shot warn for localStorage unavailability (e.g. Safari Private Mode)
// ---------------------------------------------------------------------------

let _storageUnavailableWarned = false;

/**
 * Try to access localStorage; returns false and warns on failure.
 * NOT called for every read/write — only as a fallback guard.
 */
function guardStorage(action: () => void): boolean {
  try {
    action();
    return true;
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      return false; // caller handles QuotaExceededError separately
    }
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }
}

// ---------------------------------------------------------------------------
// getPref
// ---------------------------------------------------------------------------

export function getPref<K extends WebPrefKey>(key: K): WebPrefValue<K> {
  const entry = PREF_REGISTRY[key];
  if (typeof window === "undefined") {
    return entry.default as WebPrefValue<K>;
  }
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return entry.default as WebPrefValue<K>;
  }
  if (raw === null) {
    return entry.default as WebPrefValue<K>;
  }
  const decoded = decode(entry.codec, raw);
  if (decoded === null) {
    console.warn(
      `[plugin-web-storage] decode failed for ${key}:`,
      new Error(`Cannot decode "${raw}" with codec "${entry.codec}"`),
    );
    return entry.default as WebPrefValue<K>;
  }
  return decoded as WebPrefValue<K>;
}

// ---------------------------------------------------------------------------
// setPref
// ---------------------------------------------------------------------------

export function setPref<K extends WebPrefKey>(
  key: K,
  value: WebPrefValue<K>,
): boolean {
  if (typeof window === "undefined") {
    console.warn(
      "[plugin-web-storage] setPref called during SSR; no-op.",
    );
    return false;
  }

  const entry = PREF_REGISTRY[key];
  const encoded = encode(entry.codec, value);
  if (encoded === null) {
    console.warn(`[plugin-web-storage] encode failed for ${key}.`);
    return false;
  }

  // Compare-before-write: avoid spurious storage events (AC-IMP-11)
  let existing: string | null = null;
  try {
    existing = localStorage.getItem(key);
  } catch {
    // localStorage unavailable
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }
  if (existing === encoded) {
    // Value unchanged — skip write. Same-tab subscribers do NOT get notified
    // (value didn't actually change).
    return true;
  }

  try {
    localStorage.setItem(key, encoded);
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      console.warn(`[plugin-web-storage] quota exceeded for ${key}.`);
      return false;
    }
    if (!_storageUnavailableWarned) {
      _storageUnavailableWarned = true;
      console.warn(
        "[plugin-web-storage] localStorage is unavailable (possibly Safari Private Mode); all operations will no-op.",
      );
    }
    return false;
  }

  // Publish to same-tab subscribers
  publishSameTab(key, value);
  return true;
}

// ---------------------------------------------------------------------------
// removePref
// ---------------------------------------------------------------------------

export function removePref<K extends WebPrefKey>(key: K): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
  const entry = PREF_REGISTRY[key];
  // Notify same-tab subscribers that the value is back to default
  publishSameTab(key, entry.default);
}

// Suppress unused variable warning for guardStorage
void guardStorage;

// ---------------------------------------------------------------------------
// isPrefKey (open-ended xai_pref_* family)
// ---------------------------------------------------------------------------

export function isPrefKey(s: string): s is `xai_pref_${string}` {
  return /^xai_pref_/.test(s);
}

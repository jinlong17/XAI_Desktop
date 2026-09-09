import { accountScope, type AccountScope } from "./accountScope.js";

type Listener<T = unknown> = (value: T) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribeSameTab(key: string, listener: Listener, scope = accountScope.capture()): () => void {
  try { key = accountScope.physicalKey(key, scope); } catch { return () => {}; }
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  return () => {
    const current = listeners.get(key);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) listeners.delete(key);
  };
}

/** A post-commit notification is advisory: one faulty observer must never undo a save. */
export function publishSameTab(key: string, value: unknown, scope = accountScope.capture()): void {
  try { key = accountScope.physicalKey(key, scope); } catch { return; }
  const set = listeners.get(key);
  if (!set) return;
  for (const listener of set) {
    try { listener(value); } catch { /* committed storage remains authoritative */ }
  }
}

export function _clearAllListeners(): void {
  listeners.clear();
}

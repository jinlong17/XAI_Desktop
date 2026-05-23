/**
 * Browser-only typed event bus using native EventTarget + CustomEvent.
 *
 * Design decisions:
 * - Single module-level EventTarget instance ("singleton per page tab").
 * - Synchronous emit — listeners fire before emitWebEvent returns. This
 *   intentionally differs from the desktop `emitEvent` (async Tauri IPC).
 *   UI live-broadcast (e.g. Settings → theme change) must be same-tick.
 * - No-op safe: emitting into a channel with zero listeners never throws.
 * - SSR safe: guarded by `typeof EventTarget === 'undefined'` check.
 * - Listener error isolation: if a handler throws, the bus catches and
 *   warns via console.warn; other listeners on the same channel still fire.
 *
 * ADR anchor: ADR-0007 §S7 + Frozen Assumption §3.
 */
import type { WebEventKey, WebEventMap } from './events';

// ── Internal bus singleton ──────────────────────────────────────────────────

/**
 * The single EventTarget instance shared across all emitWebEvent / onWebEvent
 * calls within one page lifetime. Created lazily so SSR bundles do not
 * instantiate it at module-parse time.
 */
let _bus: EventTarget | null = null;

function getBus(): EventTarget | null {
  if (typeof EventTarget === 'undefined') {
    // SSR / non-browser environment — bus is unavailable.
    return null;
  }
  if (_bus === null) {
    _bus = new EventTarget();
  }
  return _bus;
}

// ── Custom event detail wrapper ─────────────────────────────────────────────

/**
 * Internal CustomEvent subtype — carries the typed payload in `detail`.
 * Not exported; consumers only see `WebEventMap[K]` payloads.
 */
type BusEvent<K extends WebEventKey> = CustomEvent<WebEventMap[K]>;

// ── Public emitter ──────────────────────────────────────────────────────────

/**
 * Type-safe synchronous emitter for Web-only `web:*` events.
 *
 * - Returns void; never throws when there are no listeners (no-op safe).
 * - Synchronous in v1: listeners run before emit returns.
 *   This differs from desktop `emitEvent` (async Tauri IPC) — see api.md §2.1.
 * - If a listener throws, the error is caught and logged via console.warn;
 *   remaining listeners on the same channel still fire.
 * - No-op when called in an SSR / non-browser environment.
 */
export function emitWebEvent<K extends WebEventKey>(
  event: K,
  payload: WebEventMap[K],
): void {
  const bus = getBus();
  if (bus === null) {
    return;
  }

  const customEvent = new CustomEvent<WebEventMap[K]>(event, {
    detail: payload,
    bubbles: false,
    cancelable: false,
  });

  bus.dispatchEvent(customEvent);
}

// ── Imperative subscription ─────────────────────────────────────────────────

/**
 * Imperative subscription to a typed web:* channel.
 *
 * Returns an unsubscribe function. Calling the unsubscriber is idempotent
 * (calling twice is a no-op). After unsubscribing, the handler reference is
 * released so it can be garbage-collected.
 *
 * Used by tests, non-React modules, and as the foundation for
 * `useWebEventListener`.
 */
export function onWebEvent<K extends WebEventKey>(
  event: K,
  handler: (payload: WebEventMap[K]) => void,
): () => void {
  const bus = getBus();
  if (bus === null) {
    // SSR: return a no-op unsubscriber.
    return () => { /* no-op */ };
  }

  let unsubscribed = false;

  const listener = (e: Event) => {
    if (unsubscribed) {
      return;
    }
    const busEvent = e as BusEvent<K>;
    try {
      handler(busEvent.detail);
    } catch (err) {
      console.warn('[xai-web-event-bus] listener error', err);
    }
  };

  bus.addEventListener(event, listener);

  return () => {
    if (unsubscribed) {
      return;
    }
    unsubscribed = true;
    bus.removeEventListener(event, listener);
  };
}

/**
 * React hook for subscribing to a typed web:* event.
 *
 * - Auto-cleans on unmount via useEffect return.
 * - The handler is stored in a ref so consumers do not need to memoize it.
 *   The bus only re-subscribes when the `event` key changes (rare), not on
 *   every render — this matches the "useEffectEvent" pattern from React docs,
 *   polyfilled with useRef + useLayoutEffect for React 19 compat.
 * - StrictMode double-mount safe: the useEffect cleanup runs between the two
 *   mounts; net subscription count after settling is 1.
 * - No-op when called in an SSR environment (onWebEvent handles the guard).
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { onWebEvent } from './emitter';
import type { WebEventKey, WebEventMap } from './events';

/**
 * Type-safe React hook for subscribing to a Web event.
 *
 * @param event  - The web:* channel key to listen on.
 * @param handler - Callback invoked with the typed payload. Does not need
 *                  to be memoized — the hook captures the latest reference
 *                  via an internal ref without re-subscribing.
 */
export function useWebEventListener<K extends WebEventKey>(
  event: K,
  handler: (payload: WebEventMap[K]) => void,
): void {
  // Keep a stable ref to the latest handler so the subscription does not
  // need to be torn down and rebuilt on every render.
  const handlerRef = useRef(handler);

  // useLayoutEffect runs synchronously after DOM mutations and before paint,
  // ensuring the ref is current before any event fires in the same frame.
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const unsub = onWebEvent(event, (payload) => {
      handlerRef.current(payload);
    });
    return unsub;
  }, [event]); // only re-subscribe when the channel key changes
}

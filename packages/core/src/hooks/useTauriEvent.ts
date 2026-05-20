import { useEffect, useRef } from 'react';
import { listen, TauriEvent } from '@tauri-apps/api/event';

/**
 * Re-export of Tauri's built-in event enum so plugins never need to import
 * `@tauri-apps/api/event` directly (red-line #4).
 */
export { TauriEvent };

/** Event handler signature exposed to plugins. */
export type TauriEventHandler<T> = (event: { payload: T }) => void;

/**
 * Generic, untyped Tauri event listener hook.
 *
 * Use this when subscribing to:
 *   - Built-in `TauriEvent` enum values (e.g. drag-drop lifecycle)
 *   - Ad-hoc event names that are not yet codified in `@repo/core` `EventMap`
 *
 * For codified cross-window events, prefer `useEventListener` from
 * `@repo/core/events`, which is constrained to `EventMap` keys.
 *
 * This is the ONLY place plugins are permitted to reach Tauri event IPC
 * (red-line #4). Importing `@tauri-apps/api/event` directly from a plugin
 * is a red-line #4 violation.
 *
 * The handler is read through a ref so callers may pass inline arrow
 * functions without retriggering the subscription on every render. The
 * subscription is established once per `event` (and per `enabled` flag).
 */
export function useTauriEvent<T>(
  event: `${TauriEvent}` | (string & Record<never, never>),
  handler: TauriEventHandler<T>,
  options?: { enabled?: boolean },
): void {
  const enabled = options?.enabled ?? true;
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let unlistenFn: (() => void) | null = null;

    listen<T>(event, (e) => {
      if (cancelled) return;
      handlerRef.current(e);
    }).then((fn) => {
      if (cancelled) {
        fn();
        return;
      }
      unlistenFn = fn;
    });

    return () => {
      cancelled = true;
      if (unlistenFn) unlistenFn();
    };
  }, [event, enabled]);
}

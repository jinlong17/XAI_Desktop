import { useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import type { EventMap } from '../types/events';

/**
 * Type-safe event listener hook for cross-window communication.
 * Automatically manages subscription lifecycle via useEffect.
 */
export function useEventListener<K extends keyof EventMap>(
  event: K,
  handler: (payload: EventMap[K]) => void,
): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const internals = (window as unknown as { __TAURI_INTERNALS__?: { transformCallback?: unknown } }).__TAURI_INTERNALS__;
    if (typeof internals?.transformCallback !== 'function') {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | null = null;

    const unlisten = listen<EventMap[K]>(event, (e) => handler(e.payload));
    unlisten
      .then((fn) => {
        if (disposed) {
          fn();
          return;
        }
        cleanup = fn;
      })
      .catch(() => {
        // Ignore listener setup failures in non-Tauri test/runtime contexts.
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [event, handler]);
}

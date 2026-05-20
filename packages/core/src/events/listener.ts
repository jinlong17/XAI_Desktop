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
    const unlisten = listen<EventMap[K]>(event, (e) => handler(e.payload));
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [event, handler]);
}

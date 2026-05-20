import { emit } from '@tauri-apps/api/event';
import type { EventMap } from '../types/events';

/**
 * Type-safe event emitter for cross-window communication.
 * Wraps Tauri's emit with compile-time payload type checking.
 */
export async function emitEvent<K extends keyof EventMap>(
  event: K,
  payload: EventMap[K],
): Promise<void> {
  await emit(event, payload);
}

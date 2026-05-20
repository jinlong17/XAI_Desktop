import { useMemo } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

/** Minimal physical position shape exposed to plugins. */
export interface TauriWindowPosition {
  x: number;
  y: number;
}

/** Minimal physical size shape exposed to plugins. */
export interface TauriWindowSize {
  width: number;
  height: number;
}

/**
 * Plugin-facing handle to the current Tauri window.
 *
 * Wraps the Tauri `Window` instance so that plugins never need to import
 * `@tauri-apps/api/window` directly (red-line #4). Surface area is kept
 * intentionally small and only exposes the operations Organizer-class
 * plugins currently require.
 *
 * Returned methods are stable identity for the lifetime of the host window
 * because they delegate to the live Tauri window each call; consumers can
 * safely depend on the returned object inside `useCallback` / `useEffect`
 * without retriggering subscriptions.
 */
export interface TauriWindowHandle {
  /** Unique window label assigned by Tauri (e.g. `main`, `grid_<id>`). */
  readonly label: string;
  /** Outer (top-left) position in physical pixels. */
  outerPosition(): Promise<TauriWindowPosition>;
  /** Inner size in physical pixels. */
  innerSize(): Promise<TauriWindowSize>;
  /** Closes the current window. */
  close(): Promise<void>;
  /** Emits an event on the Tauri global bus, scoped to this window. */
  emit<T>(event: string, payload?: T): Promise<void>;
  /** Emits an event targeted at a specific window label. */
  emitTo<T>(target: string, event: string, payload?: T): Promise<void>;
}

/**
 * Returns a stable handle to the current Tauri window for plugin code.
 *
 * This is the ONLY place plugins are permitted to reach Tauri window IPC
 * (red-line #4). Importing `@tauri-apps/api/window` directly from a plugin
 * is a red-line #4 violation.
 *
 * The hook does not perform any IPC on mount — calling code drives the
 * lifecycle by invoking the returned methods on demand.
 */
export function useTauriWindow(): TauriWindowHandle {
  return useMemo<TauriWindowHandle>(() => {
    const current = getCurrentWindow();
    return {
      label: current.label,
      async outerPosition() {
        const position = await current.outerPosition();
        return { x: position.x, y: position.y };
      },
      async innerSize() {
        const size = await current.innerSize();
        return { width: size.width, height: size.height };
      },
      async close() {
        await current.close();
      },
      async emit<T>(event: string, payload?: T) {
        await current.emit(event, payload);
      },
      async emitTo<T>(target: string, event: string, payload?: T) {
        await current.emitTo(target, event, payload);
      },
    };
  }, []);
}

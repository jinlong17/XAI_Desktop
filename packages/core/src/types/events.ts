import type { GridBox, Rect } from './grid';

/** All event names → payload type mapping for type-safe cross-window communication */
export interface EventMap {
  // Organizer events
  'organizer:grid-update': { gridId: string; changes: Partial<GridBox> };
  'organizer:grid-close': { gridId: string };
  'organizer:file-drop': { gridId: string; files: string[] };
  'organizer:grid-window-ready': { gridId: string };
  'organizer:create-grid-request': { gridId?: string; rect: Rect };

  // Global app events
  'app:interactive-mode-changed': { interactive: boolean };
  'app:settings-changed': { key: string; value: unknown };

  // Account / Sync events (local-bus signals; PRD §5.7 FR-SY-39 — NOT network messages)
  // plugin-account is the sole owner/emitter; other plugins listen only.
  'account:logged-in': { userId: string };
  'account:logged-out': { userId: string };
  'account:sync-started': { kind: 'push' | 'pull' };
  'account:sync-completed': { kind: 'push' | 'pull'; durationMs: number };
  'account:sync-failed': { kind: 'push' | 'pull'; error: string };
}
